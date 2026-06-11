import {
  markLessonDelivered,
  markLessonPlanned,
  markLessonSkipped,
  markSchemeLessonDelivered,
  markSchemeLessonPlanned,
  markSchemeLessonSkipped,
  syncSchemeStatus,
} from "@/lib/progress/delivery";
import type {
  CalendarEntry,
  LessonDeliveryStatus,
  LessonPlan,
  SchemeOfWork,
} from "@/lib/types";

export function syncLinkedDeliveryStatus(
  entry: CalendarEntry,
  deliveryStatus: LessonDeliveryStatus,
  lessons: LessonPlan[],
  schemes: SchemeOfWork[]
): {
  lessonUpdates: { id: string; patch: Partial<LessonPlan> }[];
  schemeUpdates: { id: string; patch: Partial<SchemeOfWork> }[];
} {
  const lessonUpdates: { id: string; patch: Partial<LessonPlan> }[] = [];
  const schemeUpdates: { id: string; patch: Partial<SchemeOfWork> }[] = [];

  if (entry.linkedLessonId) {
    const lesson = lessons.find((l) => l.id === entry.linkedLessonId);
    if (lesson) {
      let next = lesson;
      if (deliveryStatus === "delivered") next = markLessonDelivered(lesson, entry.startDate);
      else if (deliveryStatus === "skipped") next = markLessonSkipped(lesson);
      else next = markLessonPlanned(lesson);

      lessonUpdates.push({
        id: lesson.id,
        patch: {
          deliveryStatus: next.deliveryStatus,
          deliveredDate: next.deliveredDate,
          taughtOutcomeIds: next.taughtOutcomeIds,
        },
      });
    }
  }

  if (entry.linkedSchemeId && entry.linkedSchemeLessonNumber) {
    const scheme = schemes.find((s) => s.id === entry.linkedSchemeId);
    if (scheme) {
      const lessons = scheme.lessons.map((lesson) => {
        if (lesson.lessonNumber !== entry.linkedSchemeLessonNumber) return lesson;
        if (deliveryStatus === "delivered") {
          return markSchemeLessonDelivered(lesson, entry.startDate);
        }
        if (deliveryStatus === "skipped") return markSchemeLessonSkipped(lesson);
        return markSchemeLessonPlanned(lesson);
      });

      schemeUpdates.push({
        id: scheme.id,
        patch: syncSchemeStatus({ ...scheme, lessons }),
      });
    }
  }

  return { lessonUpdates, schemeUpdates };
}
