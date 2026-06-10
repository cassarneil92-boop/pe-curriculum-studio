"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import {
  buildTeacherContext,
  loadCurriculumAccessMode,
  saveCurriculumAccessMode,
  type CurriculumAccessMode,
  type TeacherContextSnapshot,
} from "@/lib/teacher-context";

export function useTeacherContext(): {
  context: TeacherContextSnapshot;
  accessMode: CurriculumAccessMode;
  setAccessMode: (mode: CurriculumAccessMode) => void;
  refresh: () => void;
} {
  const { data } = useApp();
  const [accessMode, setAccessModeState] = useState<CurriculumAccessMode>("intelligent");

  const refresh = useCallback(() => {
    setAccessModeState(loadCurriculumAccessMode());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === "pe-curriculum-studio-curriculum-access") refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const setAccessMode = useCallback((mode: CurriculumAccessMode) => {
    saveCurriculumAccessMode(mode);
    setAccessModeState(mode);
  }, []);

  const context = useMemo(
    () => buildTeacherContext(data.teacher, accessMode),
    [data.teacher, accessMode]
  );

  return { context, accessMode, setAccessMode, refresh };
}
