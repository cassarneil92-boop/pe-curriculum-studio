import { buildWaltIdeas } from "@/lib/scheme-builder/constants";
import type { PlanningSequenceStep } from "@/lib/assistant/responses";
import {
  buildLessonTemplatesForScheme,
  pickLessonTypesForCount,
  type LessonTemplateType,
} from "@/lib/assistant/lesson-structure-templates";
import {
  getSportDefinitionByTopicId,
  resolveSportIdFromTopic,
} from "@/src/lib/curriculum/sport-curriculum";

export interface SportProgression {
  topicKey: string;
  label: string;
  phases: string[];
  lessonTypeHints?: Partial<Record<number, LessonTemplateType>>;
}

const GENERIC_PHASES = [
  "Introduction and baseline skills",
  "Core skill development",
  "Applying skills in modified context",
  "Tactical decision making",
  "Performance under pressure",
  "Assessment and consolidation",
];

function normalizeTopicKey(topicId: string): string {
  const sportId = resolveSportIdFromTopic(topicId);
  if (sportId) return sportId === "racket-sports" ? "badminton" : sportId;
  const key = topicId.toLowerCase();
  if (key.includes("football")) return "football";
  if (key.includes("basketball")) return "basketball";
  if (key.includes("handball")) return "handball";
  if (key.includes("volleyball")) return "volleyball";
  return "generic";
}

export function getSportProgression(topicId: string): SportProgression | null {
  const sport = getSportDefinitionByTopicId(topicId);
  if (!sport) return null;
  return {
    topicKey: sport.id,
    label: sport.label,
    phases: sport.lessonPhases.map((p) => p.label),
  };
}

export function isSportSpecificTopic(topicId: string): boolean {
  return resolveSportIdFromTopic(topicId) !== null;
}

function expandPhasesToLessonCount(phases: string[], lessonCount: number): string[] {
  if (phases.length === 0) {
    return Array.from({ length: lessonCount }, (_, i) => GENERIC_PHASES[i] ?? `Lesson ${i + 1}`);
  }
  if (phases.length >= lessonCount) {
    return phases.slice(0, lessonCount);
  }

  const result = [...phases];
  while (result.length < lessonCount) {
    const index = result.length;
    result.push(GENERIC_PHASES[index] ?? `Extension focus ${index + 1}`);
  }
  return result;
}

export function buildIntelligentPlanningSequence(input: {
  lessonCount: number;
  topicId: string;
  topicLabel: string;
  skillLabel: string;
}): PlanningSequenceStep[] {
  const sport = getSportProgression(input.topicId);
  const phases = expandPhasesToLessonCount(
    sport?.phases ?? GENERIC_PHASES,
    input.lessonCount
  );
  const walts = buildWaltIdeas(input.topicLabel, input.skillLabel);
  const templates = buildLessonTemplatesForScheme(
    input.lessonCount,
    input.topicLabel,
    input.skillLabel,
    phases
  );
  const lessonTypes = pickLessonTypesForCount(input.lessonCount);

  return Array.from({ length: input.lessonCount }, (_, index) => {
    const template = templates[index];
    return {
      lessonNumber: index + 1,
      focus: template.focus,
      activity: template.primaryActivityLabel,
      waltExample: walts[index % walts.length],
      lessonType: lessonTypes[index],
      sportPhase: phases[index],
    };
  });
}
