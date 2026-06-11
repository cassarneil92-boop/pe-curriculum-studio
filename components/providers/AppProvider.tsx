"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

interface AppContextValue {
  data: AppData;
  hydrated: boolean;
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
}

const AppContext = createContext<AppContextValue | null>(null);

function withMigratedCalendar(data: AppData): AcademicCalendarSettings {
  return migrateAcademicCalendarSettings(data.academicCalendar, data.planningTerms);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(DEFAULT_APP_DATA);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(loadAppData());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveAppData(data);
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

  const value = useMemo(
    () => ({
      data,
      hydrated,
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
    }),
    [
      data,
      hydrated,
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
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
