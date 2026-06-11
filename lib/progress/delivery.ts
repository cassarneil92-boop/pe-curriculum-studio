import type {
  LessonDeliveryStatus,
  LessonPlan,
  OutcomeTaughtStatus,
  SchemeOfWork,
  SOWLesson,
} from "@/lib/types";

export const DEFAULT_DELIVERY_STATUS: LessonDeliveryStatus = "planned";

export function isDeliveredStatus(status?: LessonDeliveryStatus): boolean {
  return status === "delivered";
}

/** Resolve taught outcome ids for a lesson, respecting manual overrides. */
export function resolveLessonTaughtOutcomeIds(lesson: LessonPlan): string[] {
  if (!isDeliveredStatus(lesson.deliveryStatus)) return [];

  const base =
    lesson.taughtOutcomeIds && lesson.taughtOutcomeIds.length > 0
      ? lesson.taughtOutcomeIds
      : lesson.selectedLearningOutcomeIds ?? [];

  return applyOutcomeOverrides(base, lesson.outcomeOverrides);
}

/** Resolve taught outcome ids for a scheme lesson. */
export function resolveSchemeLessonTaughtOutcomeIds(lesson: SOWLesson): string[] {
  if (!isDeliveredStatus(lesson.deliveryStatus)) return [];

  const base =
    lesson.taughtOutcomeIds && lesson.taughtOutcomeIds.length > 0
      ? lesson.taughtOutcomeIds
      : lesson.learningOutcomeIds ?? [];

  return applyOutcomeOverrides(base, lesson.outcomeOverrides);
}

function applyOutcomeOverrides(
  baseIds: string[],
  overrides?: Record<string, OutcomeTaughtStatus>
): string[] {
  if (!overrides || Object.keys(overrides).length === 0) return baseIds;

  const result = new Set(baseIds);
  for (const [id, status] of Object.entries(overrides)) {
    if (status === "taught") result.add(id);
    if (status === "skipped" || status === "not_taught") result.delete(id);
  }
  return [...result];
}

export function markLessonDelivered(
  lesson: LessonPlan,
  deliveredDate = new Date().toISOString().slice(0, 10)
): LessonPlan {
  const taughtOutcomeIds = lesson.selectedLearningOutcomeIds ?? [];
  return {
    ...lesson,
    deliveryStatus: "delivered",
    deliveredDate,
    taughtOutcomeIds,
  };
}

export function markLessonPlanned(lesson: LessonPlan): LessonPlan {
  return {
    ...lesson,
    deliveryStatus: "planned",
    deliveredDate: undefined,
    taughtOutcomeIds: [],
  };
}

export function markLessonSkipped(lesson: LessonPlan): LessonPlan {
  return {
    ...lesson,
    deliveryStatus: "skipped",
    deliveredDate: undefined,
    taughtOutcomeIds: [],
  };
}

export function markLessonMoved(lesson: LessonPlan): LessonPlan {
  return {
    ...lesson,
    deliveryStatus: "moved",
    deliveredDate: undefined,
    taughtOutcomeIds: [],
  };
}

export function markSchemeLessonDelivered(
  lesson: SOWLesson,
  deliveredDate = new Date().toISOString().slice(0, 10)
): SOWLesson {
  return {
    ...lesson,
    deliveryStatus: "delivered",
    deliveredDate,
    taughtOutcomeIds: lesson.learningOutcomeIds ?? [],
  };
}

export function markSchemeLessonPlanned(lesson: SOWLesson): SOWLesson {
  return {
    ...lesson,
    deliveryStatus: "planned",
    deliveredDate: undefined,
    taughtOutcomeIds: [],
  };
}

export function markSchemeLessonSkipped(lesson: SOWLesson): SOWLesson {
  return {
    ...lesson,
    deliveryStatus: "skipped",
    deliveredDate: undefined,
    taughtOutcomeIds: [],
  };
}

export function markSchemeLessonMoved(lesson: SOWLesson): SOWLesson {
  return {
    ...lesson,
    deliveryStatus: "moved",
    deliveredDate: undefined,
    taughtOutcomeIds: [],
  };
}

export function setOutcomeOverride(
  overrides: Record<string, OutcomeTaughtStatus> | undefined,
  outcomeId: string,
  status: OutcomeTaughtStatus
): Record<string, OutcomeTaughtStatus> {
  return { ...(overrides ?? {}), [outcomeId]: status };
}

export function deriveSchemeStatus(
  scheme: Pick<SchemeOfWork, "lessons">
): SchemeOfWork["status"] {
  const lessons = scheme.lessons ?? [];
  if (lessons.length === 0) return "draft";

  const delivered = lessons.filter((l) => l.deliveryStatus === "delivered").length;
  const hasContent = lessons.some(
    (l) =>
      l.learningOutcomeIds.length > 0 ||
      l.walt.trim() ||
      l.wilf.trim() ||
      l.activities.trim()
  );

  if (!hasContent) return "draft";
  if (delivered >= lessons.length) return "completed";
  if (delivered > 0 || hasContent) return "in_progress";
  return "draft";
}

export function syncSchemeStatus<T extends Pick<SchemeOfWork, "lessons"> & { status?: SchemeOfWork["status"] }>(
  scheme: T
): T & { status: SchemeOfWork["status"] } {
  return { ...scheme, status: deriveSchemeStatus(scheme) };
}

export function deliveryStatusLabel(status?: LessonDeliveryStatus): string {
  switch (status ?? "planned") {
    case "delivered":
      return "Delivered";
    case "skipped":
      return "Skipped";
    case "moved":
      return "Moved";
    default:
      return "Planned";
  }
}

export function lessonsStillToTeach(scheme: SchemeOfWork): number {
  return scheme.lessons.filter(
    (l) => l.deliveryStatus !== "delivered" && l.deliveryStatus !== "skipped"
  ).length;
}
