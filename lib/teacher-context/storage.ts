import type { CurriculumAccessMode } from "./types";

const STORAGE_KEY = "pe-curriculum-studio-curriculum-access";

export const DEFAULT_CURRICULUM_ACCESS_MODE: CurriculumAccessMode = "intelligent";

export function loadCurriculumAccessMode(): CurriculumAccessMode {
  if (typeof window === "undefined") return DEFAULT_CURRICULUM_ACCESS_MODE;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "explore-all" || raw === "intelligent") return raw;
    return DEFAULT_CURRICULUM_ACCESS_MODE;
  } catch {
    return DEFAULT_CURRICULUM_ACCESS_MODE;
  }
}

export function saveCurriculumAccessMode(mode: CurriculumAccessMode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, mode);
}
