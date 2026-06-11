import type { CalendarEntry, LessonPlan, SchemeOfWork } from "@/lib/types";
import {
  resolveLessonTaughtOutcomeIds,
  resolveSchemeLessonTaughtOutcomeIds,
} from "./delivery";

/** Outcomes selected in saved lessons and schemes (planned, not necessarily delivered). */
export function collectPlannedOutcomeIds(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[]
): Set<string> {
  const ids = new Set<string>();
  for (const lesson of lessons) {
    for (const id of lesson.selectedLearningOutcomeIds ?? []) {
      if (id) ids.add(id);
    }
  }
  for (const scheme of schemes) {
    for (const lesson of scheme.lessons ?? []) {
      for (const id of lesson.learningOutcomeIds ?? []) {
        if (id) ids.add(id);
      }
    }
  }
  return ids;
}

/** Outcomes from lessons/scheme lessons marked delivered only. */
export function collectTaughtOutcomeIds(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[] = []
): Set<string> {
  const ids = new Set<string>();

  for (const lesson of lessons) {
    for (const id of resolveLessonTaughtOutcomeIds(lesson)) {
      ids.add(id);
    }
  }

  for (const scheme of schemes) {
    for (const lesson of scheme.lessons ?? []) {
      for (const id of resolveSchemeLessonTaughtOutcomeIds(lesson)) {
        ids.add(id);
      }
    }
  }

  for (const entry of calendar) {
    if (entry.deliveryStatus !== "delivered") continue;
    if (entry.linkedLessonId || entry.linkedSchemeId) continue;
    for (const id of entry.loIds ?? []) {
      if (id) ids.add(id);
    }
  }

  return ids;
}

export function collectRemainingOutcomeIds(
  availableIds: string[],
  taughtIds: Set<string>
): Set<string> {
  return new Set(availableIds.filter((id) => !taughtIds.has(id)));
}
