import type { SchemeOfWork, SOWLesson, SOWWeek } from "@/lib/types";
import { generateId } from "@/lib/storage";
import { migrateYearGroupValue } from "@/lib/year-groups";
import { ACTIVITY_TEMPLATE } from "./constants";

function migrateWeeksToLessons(weeks: SOWWeek[]): SOWLesson[] {
  return weeks.map((week) => ({
    id: generateId(),
    lessonNumber: week.weekNumber,
    learningOutcomeIds: week.loIds ?? [],
    walt: week.focus ? `We are learning to ${week.focus.replace(/^we are learning to\s*/i, "")}` : "",
    wilf: "",
    activities: week.topic
      ? `Main activity:\n${week.topic}`
      : ACTIVITY_TEMPLATE,
    resources: [],
  }));
}

export function migrateScheme(scheme: Partial<SchemeOfWork> & { weeks?: SOWWeek[] }): SchemeOfWork {
  const now = new Date().toISOString();

  if (scheme.lessons && scheme.lessons.length > 0) {
    const lessons = scheme.lessons.map((lesson) => ({
      ...lesson,
      resources: lesson.resources ?? [],
      learningOutcomeIds: lesson.learningOutcomeIds ?? [],
    }));

    const pathway = scheme.pathway ?? scheme.selectedPathways?.[0] ?? "general-pe";
    const selectedPathways =
      scheme.selectedPathways && scheme.selectedPathways.length > 0
        ? scheme.selectedPathways
        : [pathway];

    return {
      id: scheme.id ?? generateId(),
      title: scheme.title ?? "",
      classGroup: scheme.classGroup ?? "",
      pathway,
      selectedPathways,
      yearGroup: migrateYearGroupValue(scheme.yearGroup ?? "year-9"),
      topicId: scheme.topicId ?? "",
      skillId: scheme.skillId ?? "",
      term: scheme.term ?? "Term 1",
      plannedLessonCount: scheme.plannedLessonCount ?? lessons.length,
      lessons,
      createdAt: scheme.createdAt ?? now,
      updatedAt: scheme.updatedAt ?? now,
    };
  }

  const legacyWeeks = scheme.weeks ?? [];
  const lessons =
    legacyWeeks.length > 0
      ? migrateWeeksToLessons(legacyWeeks)
      : [createLegacyEmptyLesson()];

  const pathway = scheme.pathway ?? scheme.selectedPathways?.[0] ?? "general-pe";
  const selectedPathways =
    scheme.selectedPathways && scheme.selectedPathways.length > 0
      ? scheme.selectedPathways
      : [pathway];

  return {
    id: scheme.id ?? generateId(),
    title: scheme.title ?? "",
    classGroup: "",
    pathway,
    selectedPathways,
    yearGroup: migrateYearGroupValue(scheme.yearGroup ?? "year-9"),
    topicId: "",
    skillId: "",
    term: scheme.term ?? "Term 1",
    plannedLessonCount: lessons.length,
    lessons,
    createdAt: scheme.createdAt ?? now,
    updatedAt: scheme.updatedAt ?? now,
  };
}

function createLegacyEmptyLesson(): SOWLesson {
  return {
    id: generateId(),
    lessonNumber: 1,
    learningOutcomeIds: [],
    walt: "",
    wilf: "",
    activities: ACTIVITY_TEMPLATE,
    resources: [],
  };
}
