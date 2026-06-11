import type { LessonPlan, SchemeOfWork, SOWLesson } from "@/lib/types";
import { DEFAULT_DELIVERY_STATUS } from "./delivery";

export function migrateLessonProgress(lesson: LessonPlan): LessonPlan {
  return {
    ...lesson,
    deliveryStatus: lesson.deliveryStatus ?? DEFAULT_DELIVERY_STATUS,
    taughtOutcomeIds: lesson.taughtOutcomeIds ?? [],
    outcomeOverrides: lesson.outcomeOverrides ?? {},
    plannedDate: lesson.plannedDate ?? lesson.date ?? undefined,
  };
}

export function migrateSchemeLessonProgress(lesson: SOWLesson): SOWLesson {
  return {
    ...lesson,
    deliveryStatus: lesson.deliveryStatus ?? DEFAULT_DELIVERY_STATUS,
    taughtOutcomeIds: lesson.taughtOutcomeIds ?? [],
    outcomeOverrides: lesson.outcomeOverrides ?? {},
  };
}

export function migrateSchemeProgress(scheme: SchemeOfWork): SchemeOfWork {
  const lessons = (scheme.lessons ?? []).map(migrateSchemeLessonProgress);
  const hasContent = lessons.some(
    (l) =>
      l.learningOutcomeIds.length > 0 ||
      l.walt.trim() ||
      l.wilf.trim() ||
      l.activities.trim()
  );
  const delivered = lessons.filter((l) => l.deliveryStatus === "delivered").length;

  let status = scheme.status ?? "draft";
  if (!scheme.status) {
    if (delivered >= lessons.length && lessons.length > 0) status = "completed";
    else if (hasContent || delivered > 0) status = "in_progress";
    else status = "draft";
  }

  return { ...scheme, lessons, status };
}
