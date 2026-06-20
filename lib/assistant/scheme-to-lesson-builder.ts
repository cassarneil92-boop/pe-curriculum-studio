import { createEmptyActivity } from "@/lib/lesson-plans/pe-template";
import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import { primaryCurriculumPathwayFromApp } from "@/lib/lesson-plans/helpers";
import { buildStructuredActivitiesFromPedagogy } from "@/lib/education/lesson-structures";
import { getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import type { SchemeOfWork, SOWLesson } from "@/lib/types";

type SchemeSlice = Pick<
  SchemeOfWork,
  | "title"
  | "classGroup"
  | "yearGroup"
  | "pathway"
  | "selectedPathways"
  | "topicId"
  | "skillId"
  | "term"
  | "pedagogicalModels"
>;

function parseActivitySections(activities: string): {
  warmUp: string;
  main: string;
  coolDown: string;
} {
  const warmMatch = activities.match(/warm up:\s*([\s\S]*?)(?:\n\nmain activity:|$)/i);
  const mainMatch = activities.match(/main activity:\s*([\s\S]*?)(?:\n\ncool down:|$)/i);
  const coolMatch = activities.match(/cool down:\s*([\s\S]*?)$/i);

  return {
    warmUp: warmMatch?.[1]?.trim() ?? "",
    main: mainMatch?.[1]?.trim() ?? "",
    coolDown: coolMatch?.[1]?.trim() ?? "",
  };
}

export function buildLessonBuilderDraftFromScheme(
  scheme: SchemeSlice,
  lesson: SOWLesson
): LessonBuilderFormData {
  const skillId = lesson.skillId?.trim() || scheme.skillId;
  const titleLine = lesson.walt.split("\n").map((line) => line.trim()).find(Boolean);
  const title =
    titleLine ||
    `${scheme.title || "Scheme lesson"} — Lesson ${lesson.lessonNumber}`;

  const topicLabel = scheme.topicId ? getPlanningTopicDisplayName(scheme.topicId) : "";
  const primaryPedagogy = scheme.pedagogicalModels?.[0];
  const pedagogyActivities =
    primaryPedagogy && topicLabel
      ? buildStructuredActivitiesFromPedagogy(primaryPedagogy, topicLabel)
      : [];

  const sections = parseActivitySections(lesson.activities);
  const structuredActivities =
    pedagogyActivities.length > 0
      ? pedagogyActivities
      : [
          {
            ...createEmptyActivity(1),
            name: "Warm up",
            taskDescription: sections.warmUp || "Warm up activity",
            spaceEquipment: lesson.resources.join(", "),
          },
          {
            ...createEmptyActivity(2),
            name: "Main activity",
            taskDescription: sections.main || lesson.activities.trim() || "Main activity",
            spaceEquipment: lesson.resources.join(", "),
          },
          {
            ...createEmptyActivity(3),
            name: "Cool down",
            taskDescription: sections.coolDown || "Review and reflection",
            spaceEquipment: "",
          },
        ].filter((activity) => activity.taskDescription.trim());

  const appPathways =
    scheme.selectedPathways && scheme.selectedPathways.length > 0
      ? scheme.selectedPathways
      : [scheme.pathway];

  return {
    title,
    date: lesson.plannedDate ?? "",
    classGroup: scheme.classGroup,
    yearGroup: scheme.yearGroup,
    duration: 60,
    pathwayId: primaryCurriculumPathwayFromApp(appPathways),
    topicId: scheme.topicId,
    skillId,
    selectedPathways: appPathways,
    learningIntention: lesson.walt,
    walt: lesson.walt,
    successCriteria: lesson.wilf,
    equipment: lesson.resources.join(", "),
    safetyConsiderations: "",
    differentiation: "",
    activities: lesson.activities,
    assessmentNotes: "",
    reflectionNotes: sections.coolDown,
    selectedLearningOutcomeIds: [...lesson.learningOutcomeIds],
    structuredActivities,
    lessonEndings: [],
    pedagogicalModels: scheme.pedagogicalModels ? [...scheme.pedagogicalModels] : [],
  };
}
