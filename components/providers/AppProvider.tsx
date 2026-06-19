"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createAcademicTerm,
  migrateAcademicCalendarSettings,
  renameTermInSchemes,
} from "@/lib/calendar/academic-settings";
import type {
  AcademicCalendarSettings,
  AppData,
  CalendarEntry,
  LessonPlan,
  PlanningTerm,
  ResourceItem,
  SchemeOfWork,
  TeacherProfile,
  TimetableSlot,
} from "@/lib/types";
import {
  DEFAULT_APP_DATA,
  generateId,
  loadAppData,
  saveAppData,
} from "@/lib/storage";
import { warnNavIssue } from "@/lib/navigation";

export interface DeliveryBatchUpdate {
  lessonUpdates?: Array<{ id: string; patch: Partial<LessonPlan> }>;
  schemeUpdates?: Array<{ id: string; patch: Partial<SchemeOfWork> }>;
  calendarUpdates?: Array<{ id: string; patch: Partial<CalendarEntry> }>;
}

interface AppDataContextValue {
  data: AppData;
  hydrated: boolean;
}

interface AppActionsContextValue {
  updateTeacher: (teacher: TeacherProfile) => void;
  updateAcademicCalendar: (settings: AcademicCalendarSettings) => void;
  updatePlanningTerm: (id: string, patch: Partial<PlanningTerm>) => void;
  addPlanningTerm: () => void;
  removePlanningTerm: (id: string) => void;
  addTimetableSlot: (slot: Omit<TimetableSlot, "id">) => TimetableSlot;
  updateTimetableSlot: (id: string, patch: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;
  completeSetup: () => void;
  addLesson: (lesson: Omit<LessonPlan, "id" | "createdAt" | "updatedAt">) => LessonPlan;
  updateLesson: (id: string, lesson: Partial<LessonPlan>) => void;
  deleteLesson: (id: string) => void;
  addScheme: (scheme: Omit<SchemeOfWork, "id" | "createdAt" | "updatedAt">) => SchemeOfWork;
  updateScheme: (id: string, scheme: Partial<SchemeOfWork>) => void;
  deleteScheme: (id: string) => void;
  addCalendarEntry: (entry: Omit<CalendarEntry, "id">) => CalendarEntry;
  updateCalendarEntry: (id: string, entry: Partial<CalendarEntry>) => void;
  deleteCalendarEntry: (id: string) => void;
  addResource: (resource: Omit<ResourceItem, "id" | "createdAt">) => ResourceItem;
  updateResource: (id: string, patch: Partial<ResourceItem>) => void;
  deleteResource: (id: string) => void;
  batchApplyDeliveryUpdates: (updates: DeliveryBatchUpdate) => void;
}

export interface AppContextValue extends AppDataContextValue, AppActionsContextValue {}

const AppDataContext = createContext<AppDataContextValue | null>(null);
const AppActionsContext = createContext<AppActionsContextValue | null>(null);
const TeacherProfileContext = createContext<TeacherProfile>(DEFAULT_APP_DATA.teacher);

const PERSIST_DEBOUNCE_MS = 400;

function withMigratedCalendar(data: AppData): AcademicCalendarSettings {
  return migrateAcademicCalendarSettings(data.academicCalendar, data.planningTerms);
}

function schedulePersist(data: AppData, cancelRef: { current: (() => void) | null }): void {
  cancelRef.current?.();

  const persist = () => {
    try {
      saveAppData(data);
    } catch (error) {
      warnNavIssue("Failed to persist app data after navigation", { error });
    }
  };

  if (typeof window.requestIdleCallback === "function") {
    const idleId = window.requestIdleCallback(persist, { timeout: 2000 });
    cancelRef.current = () => window.cancelIdleCallback(idleId);
    return;
  }

  const timerId = window.setTimeout(persist, PERSIST_DEBOUNCE_MS);
  cancelRef.current = () => window.clearTimeout(timerId);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(DEFAULT_APP_DATA);
  const [hydrated, setHydrated] = useState(false);
  const persistCancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const loaded = loadAppData();
    setData(loaded);
    setHydrated(true);
    warnNavIssue("App data hydrated", {
      setupComplete: loaded.setupComplete,
      lessonCount: loaded.lessons.length,
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    schedulePersist(data, persistCancelRef);
    return () => persistCancelRef.current?.();
  }, [data, hydrated]);

  const updateTeacher = useCallback((teacher: TeacherProfile) => {
    setData((prev) => ({ ...prev, teacher }));
  }, []);

  const updateAcademicCalendar = useCallback((academicCalendar: AcademicCalendarSettings) => {
    setData((prev) => {
      const oldCalendar = withMigratedCalendar(prev);
      let schemes = prev.schemes;
      for (const newTerm of academicCalendar.terms) {
        const oldTerm = oldCalendar.terms.find((t) => t.id === newTerm.id);
        if (oldTerm && oldTerm.name !== newTerm.name) {
          schemes = renameTermInSchemes(schemes, oldTerm.name, newTerm.name);
        }
      }
      return { ...prev, academicCalendar, schemes };
    });
  }, []);

  const updatePlanningTerm = useCallback((id: string, patch: Partial<PlanningTerm>) => {
    setData((prev) => {
      const calendar = withMigratedCalendar(prev);
      const terms = calendar.terms;
      const existing = terms.find((t) => t.id === id);
      let schemes = prev.schemes;
      if (existing && patch.name && patch.name !== existing.name) {
        schemes = renameTermInSchemes(schemes, existing.name, patch.name);
      }
      return {
        ...prev,
        schemes,
        academicCalendar: {
          ...calendar,
          terms: terms.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        },
      };
    });
  }, []);

  const addPlanningTerm = useCallback(() => {
    setData((prev) => {
      const calendar = withMigratedCalendar(prev);
      return {
        ...prev,
        academicCalendar: {
          ...calendar,
          terms: [...calendar.terms, createAcademicTerm(calendar.terms)],
        },
      };
    });
  }, []);

  const removePlanningTerm = useCallback((id: string) => {
    setData((prev) => {
      const calendar = withMigratedCalendar(prev);
      const terms = calendar.terms;
      if (terms.length <= 1) return prev;
      const removing = terms.find((t) => t.id === id);
      const remaining = terms.filter((t) => t.id !== id);
      const fallback = remaining[0]?.name ?? "Term 1";
      const schemes = removing
        ? prev.schemes.map((s) =>
            s.term === removing.name ? { ...s, term: fallback } : s
          )
        : prev.schemes;
      return {
        ...prev,
        schemes,
        academicCalendar: { ...calendar, terms: remaining },
      };
    });
  }, []);

  const addTimetableSlot = useCallback((slot: Omit<TimetableSlot, "id">) => {
    const newSlot: TimetableSlot = { ...slot, id: generateId() };
    setData((prev) => ({
      ...prev,
      timetable: [...(prev.timetable ?? []), newSlot],
    }));
    return newSlot;
  }, []);

  const updateTimetableSlot = useCallback((id: string, patch: Partial<TimetableSlot>) => {
    setData((prev) => ({
      ...prev,
      timetable: (prev.timetable ?? []).map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, []);

  const deleteTimetableSlot = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      timetable: (prev.timetable ?? []).filter((s) => s.id !== id),
    }));
  }, []);

  const completeSetup = useCallback(() => {
    setData((prev) => ({ ...prev, setupComplete: true }));
  }, []);

  const addLesson = useCallback(
    (lesson: Omit<LessonPlan, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newLesson: LessonPlan = { ...lesson, id: generateId(), createdAt: now, updatedAt: now };
      setData((prev) => ({ ...prev, lessons: [newLesson, ...prev.lessons] }));
      return newLesson;
    },
    []
  );

  const updateLesson = useCallback((id: string, lesson: Partial<LessonPlan>) => {
    setData((prev) => ({
      ...prev,
      lessons: prev.lessons.map((l) =>
        l.id === id ? { ...l, ...lesson, updatedAt: new Date().toISOString() } : l
      ),
    }));
  }, []);

  const deleteLesson = useCallback((id: string) => {
    setData((prev) => ({ ...prev, lessons: prev.lessons.filter((l) => l.id !== id) }));
  }, []);

  const addScheme = useCallback(
    (scheme: Omit<SchemeOfWork, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newScheme: SchemeOfWork = { ...scheme, id: generateId(), createdAt: now, updatedAt: now };
      setData((prev) => ({ ...prev, schemes: [newScheme, ...prev.schemes] }));
      return newScheme;
    },
    []
  );

  const updateScheme = useCallback((id: string, scheme: Partial<SchemeOfWork>) => {
    setData((prev) => ({
      ...prev,
      schemes: prev.schemes.map((s) =>
        s.id === id ? { ...s, ...scheme, updatedAt: new Date().toISOString() } : s
      ),
    }));
  }, []);

  const deleteScheme = useCallback((id: string) => {
    setData((prev) => ({ ...prev, schemes: prev.schemes.filter((s) => s.id !== id) }));
  }, []);

  const addCalendarEntry = useCallback((entry: Omit<CalendarEntry, "id">) => {
    const newEntry: CalendarEntry = { ...entry, id: generateId() };
    setData((prev) => ({ ...prev, calendar: [...prev.calendar, newEntry] }));
    return newEntry;
  }, []);

  const updateCalendarEntry = useCallback((id: string, entry: Partial<CalendarEntry>) => {
    setData((prev) => ({
      ...prev,
      calendar: prev.calendar.map((c) => (c.id === id ? { ...c, ...entry } : c)),
    }));
  }, []);

  const deleteCalendarEntry = useCallback((id: string) => {
    setData((prev) => ({ ...prev, calendar: prev.calendar.filter((c) => c.id !== id) }));
  }, []);

  const addResource = useCallback((resource: Omit<ResourceItem, "id" | "createdAt">) => {
    const newResource: ResourceItem = {
      ...resource,
      title: resource.title ?? resource.name,
      name: resource.name || resource.title || "Untitled resource",
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, resources: [newResource, ...prev.resources] }));
    return newResource;
  }, []);

  const updateResource = useCallback((id: string, patch: Partial<ResourceItem>) => {
    setData((prev) => ({
      ...prev,
      resources: prev.resources.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }, []);

  const deleteResource = useCallback((id: string) => {
    setData((prev) => ({ ...prev, resources: prev.resources.filter((r) => r.id !== id) }));
  }, []);

  const batchApplyDeliveryUpdates = useCallback((updates: DeliveryBatchUpdate) => {
    setData((prev) => {
      const now = new Date().toISOString();
      let lessons = prev.lessons;
      let schemes = prev.schemes;
      let calendar = prev.calendar;

      if (updates.lessonUpdates?.length) {
        const patchById = new Map(updates.lessonUpdates.map((u) => [u.id, u.patch]));
        lessons = prev.lessons.map((lesson) => {
          const patch = patchById.get(lesson.id);
          return patch ? { ...lesson, ...patch, updatedAt: now } : lesson;
        });
      }

      if (updates.schemeUpdates?.length) {
        const patchById = new Map(updates.schemeUpdates.map((u) => [u.id, u.patch]));
        schemes = prev.schemes.map((scheme) => {
          const patch = patchById.get(scheme.id);
          return patch ? { ...scheme, ...patch, updatedAt: now } : scheme;
        });
      }

      if (updates.calendarUpdates?.length) {
        const patchById = new Map(updates.calendarUpdates.map((u) => [u.id, u.patch]));
        calendar = prev.calendar.map((entry) => {
          const patch = patchById.get(entry.id);
          return patch ? { ...entry, ...patch } : entry;
        });
      }

      return { ...prev, lessons, schemes, calendar };
    });
  }, []);

  const dataValue = useMemo(
    () => ({ data, hydrated }),
    [data, hydrated]
  );

  const actionsValue = useMemo(
    () => ({
      updateTeacher,
      updateAcademicCalendar,
      updatePlanningTerm,
      addPlanningTerm,
      removePlanningTerm,
      addTimetableSlot,
      updateTimetableSlot,
      deleteTimetableSlot,
      completeSetup,
      addLesson,
      updateLesson,
      deleteLesson,
      addScheme,
      updateScheme,
      deleteScheme,
      addCalendarEntry,
      updateCalendarEntry,
      deleteCalendarEntry,
      addResource,
      updateResource,
      deleteResource,
      batchApplyDeliveryUpdates,
    }),
    [
      updateTeacher,
      updateAcademicCalendar,
      updatePlanningTerm,
      addPlanningTerm,
      removePlanningTerm,
      addTimetableSlot,
      updateTimetableSlot,
      deleteTimetableSlot,
      completeSetup,
      addLesson,
      updateLesson,
      deleteLesson,
      addScheme,
      updateScheme,
      deleteScheme,
      addCalendarEntry,
      updateCalendarEntry,
      deleteCalendarEntry,
      addResource,
      updateResource,
      deleteResource,
      batchApplyDeliveryUpdates,
    ]
  );

  return (
    <AppDataContext.Provider value={dataValue}>
      <AppActionsContext.Provider value={actionsValue}>
        <TeacherProfileContext.Provider value={data.teacher}>
          {children}
        </TeacherProfileContext.Provider>
      </AppActionsContext.Provider>
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppProvider");
  return ctx;
}

export function useAppActions(): AppActionsContextValue {
  const ctx = useContext(AppActionsContext);
  if (!ctx) throw new Error("useAppActions must be used within AppProvider");
  return ctx;
}

export function useTeacherProfile(): TeacherProfile {
  return useContext(TeacherProfileContext);
}

/** Full app context — prefer useAppData / useAppActions when only one slice is needed. */
export function useApp(): AppContextValue {
  const { data, hydrated } = useAppData();
  const actions = useAppActions();
  return useMemo(
    () => ({ data, hydrated, ...actions }),
    [data, hydrated, actions]
  );
}
