import {
  markLessonDelivered,
  markLessonMoved,
  markLessonPlanned,
  markLessonSkipped,
  markSchemeLessonDelivered,
  markSchemeLessonMoved,
  markSchemeLessonPlanned,
  markSchemeLessonSkipped,
  syncSchemeStatus,
} from "./delivery";
import type {
  CalendarEntry,
  LessonDeliveryStatus,
  LessonPlan,
  SchemeOfWork,
  SOWLesson,
} from "@/lib/types";

export interface DeliverySyncResult {
  lessonUpdates: { id: string; patch: Partial<LessonPlan> }[];
  schemeUpdates: { id: string; patch: Partial<SchemeOfWork> }[];
  calendarUpdates: { id: string; patch: Partial<CalendarEntry> }[];
}

function calendarPatchForStatus(
  status: LessonDeliveryStatus
): Partial<CalendarEntry> {
  return { deliveryStatus: status };
}

function applyLessonStatus(
  lesson: LessonPlan,
  status: LessonDeliveryStatus,
  deliveredDate?: string
): LessonPlan {
  if (status === "delivered") return markLessonDelivered(lesson, deliveredDate);
  if (status === "skipped") return markLessonSkipped(lesson);
  if (status === "moved") return markLessonMoved(lesson);
  return markLessonPlanned(lesson);
}

function applySchemeLessonStatus(
  lesson: SOWLesson,
  status: LessonDeliveryStatus,
  deliveredDate?: string
): SOWLesson {
  if (status === "delivered") return markSchemeLessonDelivered(lesson, deliveredDate);
  if (status === "skipped") return markSchemeLessonSkipped(lesson);
  if (status === "moved") return markSchemeLessonMoved(lesson);
  return markSchemeLessonPlanned(lesson);
}

export function findCalendarEntriesForLesson(
  calendar: CalendarEntry[],
  lessonId: string
): CalendarEntry[] {
  return calendar.filter((e) => e.linkedLessonId === lessonId);
}

export function findCalendarEntriesForSchemeLesson(
  calendar: CalendarEntry[],
  schemeId: string,
  lessonNumber: number
): CalendarEntry[] {
  return calendar.filter(
    (e) =>
      e.linkedSchemeId === schemeId && e.linkedSchemeLessonNumber === lessonNumber
  );
}

/** Calendar entry changed → sync linked lesson plan and scheme lesson. */
export function syncFromCalendarEntry(
  entry: CalendarEntry,
  status: LessonDeliveryStatus,
  lessons: LessonPlan[],
  schemes: SchemeOfWork[]
): DeliverySyncResult {
  const result: DeliverySyncResult = {
    lessonUpdates: [],
    schemeUpdates: [],
    calendarUpdates: [],
  };

  if (entry.linkedLessonId) {
    const lesson = lessons.find((l) => l.id === entry.linkedLessonId);
    if (lesson) {
      const next = applyLessonStatus(lesson, status, entry.startDate);
      result.lessonUpdates.push({
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
      const updatedLessons = scheme.lessons.map((lesson) =>
        lesson.lessonNumber === entry.linkedSchemeLessonNumber
          ? applySchemeLessonStatus(lesson, status, entry.startDate)
          : lesson
      );
      result.schemeUpdates.push({
        id: scheme.id,
        patch: syncSchemeStatus({ ...scheme, lessons: updatedLessons }),
      });
    }
  }

  return result;
}

/** Lesson plan changed → sync linked calendar entries. */
export function syncFromLessonPlan(
  lesson: LessonPlan,
  status: LessonDeliveryStatus,
  calendar: CalendarEntry[]
): DeliverySyncResult {
  const result: DeliverySyncResult = {
    lessonUpdates: [],
    schemeUpdates: [],
    calendarUpdates: [],
  };

  const next = applyLessonStatus(lesson, status, lesson.deliveredDate ?? lesson.date);
  result.lessonUpdates.push({
    id: lesson.id,
    patch: {
      deliveryStatus: next.deliveryStatus,
      deliveredDate: next.deliveredDate,
      taughtOutcomeIds: next.taughtOutcomeIds,
    },
  });

  for (const entry of findCalendarEntriesForLesson(calendar, lesson.id)) {
    result.calendarUpdates.push({
      id: entry.id,
      patch: calendarPatchForStatus(status),
    });
  }

  return result;
}

/** Scheme lesson changed → sync linked calendar entries and scheme record. */
export function syncFromSchemeLesson(
  scheme: SchemeOfWork,
  lessonNumber: number,
  status: LessonDeliveryStatus,
  calendar: CalendarEntry[],
  deliveredDate?: string
): DeliverySyncResult {
  const result: DeliverySyncResult = {
    lessonUpdates: [],
    schemeUpdates: [],
    calendarUpdates: [],
  };

  const updatedLessons = scheme.lessons.map((lesson) =>
    lesson.lessonNumber === lessonNumber
      ? applySchemeLessonStatus(lesson, status, deliveredDate)
      : lesson
  );

  result.schemeUpdates.push({
    id: scheme.id,
    patch: syncSchemeStatus({ ...scheme, lessons: updatedLessons }),
  });

  for (const entry of findCalendarEntriesForSchemeLesson(
    calendar,
    scheme.id,
    lessonNumber
  )) {
    result.calendarUpdates.push({
      id: entry.id,
      patch: calendarPatchForStatus(status),
    });
  }

  return result;
}

export function applyDeliverySyncResult(
  result: DeliverySyncResult,
  handlers: {
    updateLesson: (id: string, patch: Partial<LessonPlan>) => void;
    updateScheme: (id: string, patch: Partial<SchemeOfWork>) => void;
    updateCalendarEntry: (id: string, patch: Partial<CalendarEntry>) => void;
  }
): void {
  for (const { id, patch } of result.lessonUpdates) handlers.updateLesson(id, patch);
  for (const { id, patch } of result.schemeUpdates) handlers.updateScheme(id, patch);
  for (const { id, patch } of result.calendarUpdates) {
    handlers.updateCalendarEntry(id, patch);
  }
}
