/**
 * @deprecated Lesson plans are stored in AppProvider (`pe-curriculum-studio-malta`).
 * Legacy builder storage is migrated on app load via `lib/lesson-plans/migrate.ts`.
 */
import type { LessonPlan } from "@/lib/types";

export type { LessonBuilderFormData, LessonBuilderPlan } from "./types";

/** @deprecated Use AppProvider `data.lessons` instead. */
export function loadLessonBuilderPlans(): LessonPlan[] {
  return [];
}

/** @deprecated Use AppProvider `addLesson` / `updateLesson` instead. */
export function saveLessonBuilderPlans(_plans: LessonPlan[]): void {}

/** @deprecated Use AppProvider `addLesson` instead. */
export function createLessonBuilderPlan(): never {
  throw new Error("Use AppProvider addLesson() instead of createLessonBuilderPlan()");
}

/** @deprecated Use AppProvider `deleteLesson` instead. */
export function deleteLessonBuilderPlan(plans: LessonPlan[]): LessonPlan[] {
  return plans;
}
