import { getPlanningSkillDisplayName } from "@/src/lib/curriculum/planning";
import { getSkillsForTopic } from "@/src/lib/curriculum/registry";
import type { LessonPlan } from "@/lib/types";

export interface CurriculumMemoryInsight {
  unitTopicId: string;
  unitTopicName: string;
  priorLessons: Array<{ title: string; skillName: string; date: string }>;
  currentSkillName: string;
  suggestedNextFocus: string | null;
  suggestedProgression: string | null;
  suggestedFollowUpLesson: string | null;
  suggestedAssessmentLesson: string | null;
}

type LessonSlice = Pick<
  LessonPlan,
  "id" | "title" | "date" | "topicId" | "skillId" | "selectedLearningOutcomeIds"
>;

function skillOrderForTopic(topicId: string): string[] {
  const fromRegistry = getSkillsForTopic(topicId).map((s) => s.id);
  if (fromRegistry.length > 0) return fromRegistry;
  return [];
}

export function buildCurriculumMemoryInsight(input: {
  savedLessons: LessonSlice[];
  currentLessonId: string | null;
  topicId: string;
  topicName: string;
  skillId: string;
}): CurriculumMemoryInsight | null {
  if (!input.topicId) return null;

  const sameTopic = input.savedLessons.filter(
    (lesson) =>
      lesson.topicId === input.topicId &&
      lesson.id !== input.currentLessonId &&
      lesson.skillId
  );

  const skillOrder = skillOrderForTopic(input.topicId);
  const currentSkillName = input.skillId
    ? getPlanningSkillDisplayName(input.skillId)
    : "";

  const priorSkills = new Set(sameTopic.map((l) => l.skillId));
  const currentIndex = input.skillId ? skillOrder.indexOf(input.skillId) : -1;

  let suggestedNextFocus: string | null = null;
  if (currentIndex >= 0 && currentIndex < skillOrder.length - 1) {
    suggestedNextFocus = getPlanningSkillDisplayName(skillOrder[currentIndex + 1]);
  } else if (skillOrder.length > 0) {
    const nextUntaught = skillOrder.find((id) => id !== input.skillId && !priorSkills.has(id));
    if (nextUntaught) {
      suggestedNextFocus = getPlanningSkillDisplayName(nextUntaught);
    }
  }

  const priorLessons = sameTopic
    .slice()
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 5)
    .map((lesson) => ({
      title: lesson.title || "Untitled lesson",
      skillName: lesson.skillId
        ? getPlanningSkillDisplayName(lesson.skillId)
        : "General",
      date: lesson.date,
    }));

  const topicLabel = input.topicName || input.topicId;

  let suggestedProgression: string | null = null;
  if (currentSkillName && priorLessons.length > 0) {
    const lastSkill = priorLessons[0]?.skillName;
    if (lastSkill && lastSkill !== currentSkillName) {
      suggestedProgression = `You recently planned ${lastSkill} in ${topicLabel}. Today's ${currentSkillName} focus can build on that foundation.`;
    } else {
      suggestedProgression = `Extend ${currentSkillName} from prior ${topicLabel} lessons with increased pressure or decision-making.`;
    }
  } else if (currentSkillName) {
    suggestedProgression = `Introduce ${currentSkillName} with unopposed practice before adding defenders or game constraints.`;
  }

  const suggestedFollowUpLesson = suggestedNextFocus
    ? `Plan a follow-up ${topicLabel} lesson on ${suggestedNextFocus} to continue the unit sequence.`
    : priorLessons.length > 0
      ? `Revisit ${topicLabel} with a game-based lesson applying skills from earlier sessions.`
      : null;

  const suggestedAssessmentLesson = currentSkillName
    ? `Plan an assessment lesson: observe ${currentSkillName} in conditioned and game situations using your WILF criteria.`
    : null;

  if (
    priorLessons.length === 0 &&
    !suggestedNextFocus &&
    !suggestedProgression
  ) {
    return null;
  }

  return {
    unitTopicId: input.topicId,
    unitTopicName: topicLabel,
    priorLessons,
    currentSkillName,
    suggestedNextFocus,
    suggestedProgression,
    suggestedFollowUpLesson,
    suggestedAssessmentLesson,
  };
}
