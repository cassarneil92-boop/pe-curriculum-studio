import type { CalendarEntry } from "@/lib/types";

export function findCalendarEntryForSchemeLesson(
  calendar: CalendarEntry[],
  schemeId: string,
  lessonNumber: number
): CalendarEntry | undefined {
  return calendar.find(
    (e) =>
      e.linkedSchemeId === schemeId &&
      e.linkedSchemeLessonNumber === lessonNumber &&
      e.startDate
  );
}

export function getSchemeLessonScheduledDate(
  calendar: CalendarEntry[],
  schemeId: string,
  lessonNumber: number
): string | undefined {
  return findCalendarEntryForSchemeLesson(calendar, schemeId, lessonNumber)?.startDate;
}
