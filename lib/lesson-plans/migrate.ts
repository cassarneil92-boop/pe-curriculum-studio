import { appPathwayToCurriculum } from "@/lib/scheme-builder/pathway-map";
import { migrateYearGroupValue } from "@/lib/year-groups";
import type { LessonPlan, PathwayId } from "@/lib/types";
import { generateId } from "@/lib/storage";
import { SKILLS, TOPICS } from "@/src/lib/curriculum";

const BUILDER_STORAGE_KEY = "pe-curriculum-studio-lesson-builder";

type LegacyLessonPlan = Partial<LessonPlan> & {
  pathway?: PathwayId;
  sport?: string;
  skills?: string[];
  objectives?: string;
  assessment?: string;
  resources?: string;
  loIds?: string[];
};

function resolveTopicIdFromSport(sport: string): string {
  if (!sport) return "";
  const match = TOPICS.find((t) => t.name.toLowerCase() === sport.toLowerCase());
  return match?.id ?? "";
}

function resolveSkillIdFromName(name: string): string {
  if (!name) return "";
  const match = SKILLS.find((s) => s.name.toLowerCase() === name.toLowerCase());
  return match?.id ?? "";
}

function migrateLegacyLesson(lesson: LegacyLessonPlan): LessonPlan {
  const now = new Date().toISOString();
  const pathwayId =
    lesson.pathwayId ??
    (lesson.pathway ? appPathwayToCurriculum(lesson.pathway) : null) ??
    "secondary-pe";

  const topicId =
    lesson.topicId ?? resolveTopicIdFromSport(lesson.sport ?? "") ?? "";
  const skillId =
    lesson.skillId ??
    resolveSkillIdFromName(lesson.skills?.[0] ?? "") ??
    "";

  return {
    id: lesson.id ?? generateId(),
    title: lesson.title ?? "Untitled lesson",
    date: lesson.date ?? "",
    classGroup: lesson.classGroup ?? "",
    yearGroup: migrateYearGroupValue(lesson.yearGroup ?? "year-9"),
    duration: lesson.duration ?? 60,
    pathwayId,
    topicId,
    skillId,
    selectedPathways: lesson.selectedPathways ?? (lesson.pathway ? [lesson.pathway] : []),
    learningIntention: lesson.learningIntention ?? lesson.objectives ?? "",
    successCriteria: lesson.successCriteria ?? "",
    equipment: lesson.equipment ?? lesson.resources ?? "",
    safetyConsiderations: lesson.safetyConsiderations ?? "",
    differentiation: lesson.differentiation ?? "",
    activities: lesson.activities ?? "",
    assessmentNotes: lesson.assessmentNotes ?? lesson.assessment ?? "",
    reflectionNotes: lesson.reflectionNotes ?? "",
    selectedLearningOutcomeIds:
      lesson.selectedLearningOutcomeIds ?? lesson.loIds ?? [],
    createdAt: lesson.createdAt ?? now,
    updatedAt: lesson.updatedAt ?? now,
  };
}

function loadBuilderStoragePlans(): LessonPlan[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(BUILDER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LegacyLessonPlan[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateLegacyLesson);
  } catch {
    return [];
  }
}

function clearBuilderStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BUILDER_STORAGE_KEY);
}

export function migrateLessons(lessons: LegacyLessonPlan[]): LessonPlan[] {
  const migrated = lessons.map(migrateLegacyLesson);
  const existingIds = new Set(migrated.map((lesson) => lesson.id));
  const fromBuilder = loadBuilderStoragePlans().filter(
    (plan) => !existingIds.has(plan.id)
  );

  if (fromBuilder.length > 0) {
    clearBuilderStorage();
    return [...fromBuilder, ...migrated];
  }

  return migrated;
}

export function lessonPlanToFormData(
  lesson: LessonPlan
): Omit<LessonPlan, "id" | "createdAt" | "updatedAt"> {
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...rest
  } = lesson;
  return rest;
}
