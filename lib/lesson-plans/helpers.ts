import { generateId } from "@/lib/storage";
import { getPathwayLabel, PATHWAYS } from "@/lib/constants";
import { appPathwayToCurriculum } from "@/lib/scheme-builder/pathway-map";
import type { LessonPlan, PathwayId } from "@/lib/types";
import { getYearGroupLabel } from "@/lib/year-groups";
import {
  getSkillDisplayName,
  getTopicDisplayName,
} from "@/lib/scheme-builder/curriculum-options";
import { getPathwayById } from "@/src/lib/curriculum";
import { resolveLearningOutcomeById } from "@/src/lib/curriculum/metadata";

const CURRICULUM_TO_APP: Partial<Record<string, PathwayId>> = {
  "early-years-pe": "early-years-pe",
  "primary-pe": "primary-pe",
  "secondary-pe": "general-pe",
  "sport-values": "sport-values",
  "pe-option-sec": "pe-option-sec",
  "alp-pe": "alp-pe",
  "alp-sports-vocational": "alp-sports-vocational",
  "fitness-curriculum": "fitness-curriculum",
};

export function curriculumPathwayToApp(pathwayId: string): PathwayId | null {
  return CURRICULUM_TO_APP[pathwayId] ?? null;
}

export function getLessonPathwayLabel(lesson: LessonPlan): string {
  return (
    getPathwayById(lesson.pathwayId as Parameters<typeof getPathwayById>[0])?.label ??
    getPathwayLabel(curriculumPathwayToApp(lesson.pathwayId) ?? "general-pe")
  );
}

export function getLessonTopicName(lesson: LessonPlan): string {
  return lesson.topicId ? getTopicDisplayName(lesson.topicId) : "—";
}

export function getLessonSkillName(lesson: LessonPlan): string {
  return lesson.skillId ? getSkillDisplayName(lesson.skillId) : "—";
}

export function getLessonSelectedPathwayLabels(lesson: LessonPlan): string[] {
  const ids =
    lesson.selectedPathways && lesson.selectedPathways.length > 0
      ? lesson.selectedPathways
      : curriculumPathwayToApp(lesson.pathwayId)
        ? [curriculumPathwayToApp(lesson.pathwayId)!]
        : [];

  return ids.map((id) => PATHWAYS.find((p) => p.id === id)?.label ?? id);
}

export function formatLessonDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatTimestamp(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function buildLessonExportFilename(lesson: LessonPlan): string {
  const year = getYearGroupLabel(lesson.yearGroup).replace(/\s+/g, "-");
  const topic = getLessonTopicName(lesson).replace(/\s+/g, "-");
  const skill = getLessonSkillName(lesson).replace(/\s+/g, "-");
  const base = [year, topic, skill !== "—" ? skill : "", "Lesson"]
    .filter(Boolean)
    .join("-");
  return base.replace(/[^a-zA-Z0-9-]/g, "").replace(/-+/g, "-");
}

export function getLessonOutcomes(lesson: LessonPlan) {
  return lesson.selectedLearningOutcomeIds
    .map((id) => resolveLearningOutcomeById(id))
    .filter(Boolean);
}

export function duplicateLessonData(
  lesson: LessonPlan
): Omit<LessonPlan, "id" | "createdAt" | "updatedAt"> {
  const { id, createdAt, updatedAt, ...rest } = lesson;
  return {
    ...rest,
    title: `${lesson.title} (copy)`,
    date: "",
    structuredActivities: (lesson.structuredActivities ?? []).map((activity) => ({
      ...activity,
      id: generateId(),
    })),
    lessonEndings: (lesson.lessonEndings ?? []).map((ending) => ({
      ...ending,
      id: generateId(),
    })),
  };
}

export function appPathwaysFromQuery(
  pathway: string | null,
  selectedPathways: string | null
): PathwayId[] {
  if (selectedPathways) {
    return selectedPathways.split(",").filter(Boolean) as PathwayId[];
  }
  if (pathway) {
    const app = curriculumPathwayToApp(pathway);
    if (app) return [app];
  }
  return [];
}

export function primaryCurriculumPathwayFromApp(pathways: PathwayId[]): string {
  if (pathways.length === 0) return "secondary-pe";
  return appPathwayToCurriculum(pathways[0]) ?? "secondary-pe";
}
