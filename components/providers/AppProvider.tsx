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
import type {
  AcademicCalendarSettings,
  AppData,
  CalendarEntry,
  LessonPlan,
  ResourceItem,
  SchemeOfWork,
  TeacherProfile,
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
  deleteResource: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

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
    setData((prev) => ({ ...prev, academicCalendar }));
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
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, resources: [newResource, ...prev.resources] }));
    return newResource;
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
      deleteResource,
    }),
    [
      data,
      hydrated,
      updateTeacher,
      updateAcademicCalendar,
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
