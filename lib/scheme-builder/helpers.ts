import { getSkillById, getTopicById } from "@/src/lib/curriculum";
import {
  getSkillDisplayName,
  getTopicDisplayName,
  resolveSchemeAppPathways,
} from "./curriculum-options";
import { resolveLearningOutcomeById } from "@/src/lib/curriculum/metadata";
import type { LearningOutcome } from "@/src/lib/curriculum/types";
import type { PathwayId, SOWLesson, SchemeOfWork } from "@/lib/types";
import { generateId } from "@/lib/storage";
import { getYearGroupLabel } from "@/lib/year-groups";
import { ACTIVITY_TEMPLATE } from "./constants";

export function createEmptyLesson(lessonNumber: number): SOWLesson {
  return {
    id: generateId(),
    lessonNumber,
    learningOutcomeIds: [],
    walt: "",
    wilf: "",
    activities: "",
    resources: [],
  };
}

export function syncLessonsToCount(
  targetCount: number,
  currentLessons: SOWLesson[]
): SOWLesson[] {
  const count = Math.max(1, Math.min(52, targetCount));
  if (currentLessons.length === count) return currentLessons;

  if (currentLessons.length > count) {
    return currentLessons.slice(0, count).map((lesson, index) => ({
      ...lesson,
      lessonNumber: index + 1,
    }));
  }

  const next = [...currentLessons];
  while (next.length < count) {
    next.push(createEmptyLesson(next.length + 1));
  }
  return next;
}

export function createLessonsForCount(count: number): SOWLesson[] {
  return syncLessonsToCount(count, []);
}

export function formatWilfLines(wilf: string): string[] {
  return wilf
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-•*]\s*/, "").replace(/^\d+\.\s*/, ""));
}

export function formatLearningOutcomeLine(outcome: LearningOutcome): string {
  return `${outcome.code} – ${outcome.description}`;
}

export function resolveSchemeLearningOutcomes(ids: string[]): LearningOutcome[] {
  return ids
    .map((id) => resolveLearningOutcomeById(id))
    .filter((outcome): outcome is LearningOutcome => Boolean(outcome));
}

export function formatLearningOutcomesForCell(ids: string[]): string {
  if (ids.length === 0) return "";

  return resolveSchemeLearningOutcomes(ids)
    .map(formatLearningOutcomeLine)
    .join("\n");
}

export function schemeDisplayTitle(scheme: Pick<SchemeOfWork, "title" | "topicId" | "term">): string {
  if (scheme.title.trim()) return scheme.title.trim();
  const topic = getTopicById(scheme.topicId)?.name;
  if (topic) return `${topic} — ${scheme.term}`;
  return `Scheme of Work — ${scheme.term}`;
}

export function suggestedSchemeTitle(
  topicId: string,
  yearGroupLabel: string,
  term: string
): string {
  const topic = getTopicById(topicId)?.name;
  if (!topic) return "";
  return `Scheme of work ${yearGroupLabel} — ${topic} (${term})`;
}

export function lessonHasContent(lesson: SOWLesson): boolean {
  return getLessonCompletionStatus(lesson) !== "empty";
}

export type LessonCompletionStatus = "empty" | "partial" | "complete";

export function getLessonCompletionStatus(lesson: SOWLesson): LessonCompletionStatus {
  const signals = [
    lesson.learningOutcomeIds.length > 0,
    Boolean(lesson.walt.trim()),
    Boolean(lesson.wilf.trim()),
    Boolean(
      lesson.activities.trim() && lesson.activities.trim() !== ACTIVITY_TEMPLATE.trim()
    ),
    lesson.resources.length > 0,
  ];
  const filled = signals.filter(Boolean).length;
  if (filled === 0) return "empty";
  if (filled >= 4) return "complete";
  return "partial";
}

export function lessonCountLabel(scheme: SchemeOfWork): string {
  const filled = scheme.lessons.filter(lessonHasContent).length;
  return `${filled}/${scheme.lessons.length} lessons`;
}

export function getSchemeSelectedPathways(
  scheme: Pick<SchemeOfWork, "pathway" | "selectedPathways">
): PathwayId[] {
  return resolveSchemeAppPathways(scheme.selectedPathways, scheme.pathway);
}

export function getSkillName(skillId: string): string {
  return getSkillById(skillId)?.name ?? getSkillDisplayName(skillId);
}

export function getTopicName(topicId: string): string {
  return getTopicById(topicId)?.name ?? getTopicDisplayName(topicId);
}

export function buildSchemeExportFilename(
  scheme: Pick<SchemeOfWork, "title" | "topicId" | "term" | "yearGroup">
): string {
  const year = getYearGroupLabel(scheme.yearGroup).replace(/\s+/g, "-");
  const topic = (getTopicName(scheme.topicId) || "Scheme").replace(/\s+/g, "-");
  const term = scheme.term.replace(/\s+/g, "-");
  const base = `${year}-${topic}-${term}-Scheme-of-Work`;
  return base.replace(/[^a-zA-Z0-9-]/g, "").replace(/-+/g, "-") || "scheme-of-work";
}

export function lessonPreviewTitle(lesson: SOWLesson): string {
  if (lesson.walt.trim()) {
    const first = lesson.walt.split("\n")[0]?.trim() ?? "";
    return first.length > 48 ? `${first.slice(0, 48)}…` : first;
  }
  if (lesson.learningOutcomeIds.length > 0) {
    const outcome = resolveLearningOutcomeById(lesson.learningOutcomeIds[0]);
    if (outcome) return outcome.code;
  }
  return `Lesson ${lesson.lessonNumber}`;
}
