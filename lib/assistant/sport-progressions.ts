import { buildWaltIdeas } from "@/lib/scheme-builder/constants";
import type { PlanningSequenceStep } from "@/lib/assistant/responses";
import {
  buildLessonTemplatesForScheme,
  pickLessonTypesForCount,
  type LessonTemplateType,
} from "@/lib/assistant/lesson-structure-templates";

export interface SportProgression {
  topicKey: string;
  label: string;
  phases: string[];
  lessonTypeHints?: Partial<Record<number, LessonTemplateType>>;
}

const SPORT_PROGRESSIONS: SportProgression[] = [
  {
    topicKey: "football",
    label: "Football",
    phases: ["Technique", "Opposed practice", "Small sided game", "Tactical application"],
  },
  {
    topicKey: "basketball",
    label: "Basketball",
    phases: ["Ball mastery", "Skill execution", "Transition game", "Tactical game"],
  },
  {
    topicKey: "handball",
    label: "Handball",
    phases: ["Technique", "Timing", "Shooting under pressure", "Decision making"],
  },
  {
    topicKey: "volleyball",
    label: "Volleyball",
    phases: ["Individual technique", "Cooperative rally", "Structured game", "Match play"],
  },
];

const GENERIC_PHASES = [
  "Introduction and baseline skills",
  "Core skill development",
  "Applying skills in modified context",
  "Tactical decision making",
  "Performance under pressure",
  "Assessment and consolidation",
];

function normalizeTopicKey(topicId: string): string {
  const key = topicId.toLowerCase();
  for (const sport of SPORT_PROGRESSIONS) {
    if (key.includes(sport.topicKey)) return sport.topicKey;
  }
  return "generic";
}

export function getSportProgression(topicId: string): SportProgression | null {
  const key = normalizeTopicKey(topicId);
  if (key === "generic") return null;
  return SPORT_PROGRESSIONS.find((sport) => sport.topicKey === key) ?? null;
}

export function isSportSpecificTopic(topicId: string): boolean {
  return normalizeTopicKey(topicId) !== "generic";
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
