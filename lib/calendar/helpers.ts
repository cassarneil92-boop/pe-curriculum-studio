import type { CalendarEntry, LessonPlan, PathwayId, SchemeOfWork } from "@/lib/types";
import { curriculumPathwayToApp } from "@/lib/lesson-plans/helpers";
import { getTopicDisplayName } from "@/lib/scheme-builder/curriculum-options";
import { DEFAULT_DELIVERY_STATUS } from "@/lib/progress/delivery";

export type CalendarDragPayload =
  | { type: "calendar-entry"; entryId: string }
  | { type: "custom-entry"; entryId: string }
  | { type: "lesson"; lessonId: string }
  | { type: "scheme-lesson"; schemeId: string; lessonNumber: number };

export const CALENDAR_DRAG_MIME = "application/x-pe-calendar-drag";

export function encodeCalendarDrag(payload: CalendarDragPayload): string {
  return JSON.stringify(payload);
}

export function decodeCalendarDrag(raw: string): CalendarDragPayload | null {
  try {
    const parsed = JSON.parse(raw) as CalendarDragPayload;
    if (!parsed?.type) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function createCalendarEntryFromLesson(
  lesson: LessonPlan,
  dateIso: string
): Omit<CalendarEntry, "id"> {
  const pathway =
    curriculumPathwayToApp(lesson.pathwayId) ??
    lesson.selectedPathways?.[0] ??
    ("general-pe" as PathwayId);

  return {
    title: lesson.title || "Lesson plan",
    level: "daily",
    pathway,
    yearGroup: lesson.yearGroup,
    sport: lesson.topicId ? getTopicDisplayName(lesson.topicId) : "",
    skills: lesson.skillId ? [lesson.skillId] : [],
    startDate: dateIso,
    endDate: dateIso,
    classGroup: lesson.classGroup,
    topicId: lesson.topicId,
    notes: "",
    loIds: lesson.selectedLearningOutcomeIds ?? [],
    linkedLessonId: lesson.id,
    deliveryStatus: lesson.deliveryStatus ?? DEFAULT_DELIVERY_STATUS,
    reflection: lesson.reflection ?? "",
  };
}

export function createCalendarEntryFromSchemeLesson(
  scheme: SchemeOfWork,
  lessonNumber: number,
  dateIso: string
): Omit<CalendarEntry, "id"> | null {
  const lesson = scheme.lessons.find((l) => l.lessonNumber === lessonNumber);
  if (!lesson) return null;

  const pathway = scheme.pathway ?? scheme.selectedPathways?.[0] ?? "general-pe";

  return {
    title: `${scheme.title || "Scheme"} — Lesson ${lessonNumber}`,
    level: "daily",
    pathway,
    yearGroup: scheme.yearGroup,
    sport: scheme.topicId ? getTopicDisplayName(scheme.topicId) : "",
    skills: scheme.skillId ? [scheme.skillId] : [],
    startDate: dateIso,
    endDate: dateIso,
    classGroup: scheme.classGroup,
    topicId: scheme.topicId,
    notes: lesson.walt,
    loIds: lesson.learningOutcomeIds,
    linkedSchemeId: scheme.id,
    linkedSchemeLessonNumber: lessonNumber,
    deliveryStatus: lesson.deliveryStatus ?? DEFAULT_DELIVERY_STATUS,
    reflection: lesson.reflection ?? "",
  };
}

export function isUnscheduledEntry(entry: CalendarEntry): boolean {
  return !entry.startDate?.trim();
}

export function isCustomPoolEntry(entry: CalendarEntry): boolean {
  return (
    isUnscheduledEntry(entry) &&
    !entry.linkedLessonId &&
    !entry.linkedSchemeId
  );
}

export function entryOnDate(entry: CalendarEntry, iso: string): boolean {
  if (!entry.startDate?.trim()) return false;
  const end = entry.endDate || entry.startDate;
  return entry.startDate <= iso && end >= iso;
}

export function distributeSchemeLessons(
  scheme: SchemeOfWork,
  startDateIso: string,
  weeksBetween = 1
): Omit<CalendarEntry, "id">[] {
  const entries: Omit<CalendarEntry, "id">[] = [];
  const start = new Date(startDateIso);

  for (const lesson of scheme.lessons) {
    const offsetWeeks = (lesson.lessonNumber - 1) * weeksBetween;
    const date = new Date(start);
    date.setDate(date.getDate() + offsetWeeks * 7);
    const iso = date.toISOString().slice(0, 10);
    const entry = createCalendarEntryFromSchemeLesson(scheme, lesson.lessonNumber, iso);
    if (entry) entries.push(entry);
  }

  return entries;
}
