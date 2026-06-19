import type { LessonBuilderFormData } from "./types";

const DRAFT_KEY = "pe-curriculum-studio-lesson-draft";

export interface LessonDraftPayload {
  form: LessonBuilderFormData;
  editingId: string | null;
  activeSection: string;
  savedAt: string;
}

export function saveLessonDraft(payload: Omit<LessonDraftPayload, "savedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const data: LessonDraftPayload = { ...payload, savedAt: new Date().toISOString() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // Quota or privacy mode — draft save is best-effort
  }
}

export function loadLessonDraft(): LessonDraftPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LessonDraftPayload;
  } catch {
    return null;
  }
}

export function clearLessonDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function computeLessonBuilderCompletion(form: LessonBuilderFormData): {
  percent: number;
  completedSections: number;
  totalSections: number;
} {
  const checks = [
    Boolean(form.title?.trim() && form.date && form.yearGroup),
    Boolean(form.topicId && form.skillId),
    form.selectedLearningOutcomeIds.length > 0,
    Boolean(form.walt?.trim() || form.learningIntention?.trim()),
    (form.structuredActivities?.length ?? 0) > 0,
    (form.lessonEndings?.length ?? 0) > 0,
    Boolean(form.title?.trim()),
  ];

  const completedSections = checks.filter(Boolean).length;
  const totalSections = checks.length;
  const percent = Math.round((completedSections / totalSections) * 100);

  return { percent, completedSections, totalSections };
}

export function isLessonSectionComplete(
  sectionId: string,
  form: LessonBuilderFormData
): boolean {
  switch (sectionId) {
    case "info":
      return Boolean(form.title?.trim() && form.date && form.yearGroup);
    case "focus":
      return Boolean(form.topicId && form.skillId);
    case "outcomes":
      return form.selectedLearningOutcomeIds.length > 0;
    case "design":
      return Boolean(form.walt?.trim() || form.learningIntention?.trim());
    case "activities":
      return (form.structuredActivities?.length ?? 0) > 0;
    case "ending":
      return (form.lessonEndings?.length ?? 0) > 0;
    case "review":
      return computeLessonBuilderCompletion(form).percent >= 70;
    default:
      return false;
  }
}
