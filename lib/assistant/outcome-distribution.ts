import { resolveLearningOutcomeById } from "@/src/lib/curriculum/metadata";
import type { LearningOutcome } from "@/src/lib/curriculum/types";
import { getPlanningSkillDisplayName } from "@/src/lib/curriculum/planning";

export type OutcomeProgressionStage =
  | "technique"
  | "accuracy"
  | "timing"
  | "decision"
  | "pressure"
  | "assessment"
  | "general";

const STAGE_ORDER: OutcomeProgressionStage[] = [
  "technique",
  "accuracy",
  "timing",
  "decision",
  "pressure",
  "assessment",
  "general",
];

const STAGE_KEYWORDS: Record<OutcomeProgressionStage, string[]> = {
  technique: ["technique", "basic", "introduce", "foundation", "perform", "correct"],
  accuracy: ["accuracy", "accurate", "control", "precision", "consistent"],
  timing: ["timing", "position", "positioning", "movement", "space"],
  decision: ["decision", "choose", "select", "tactical", "when to"],
  pressure: ["pressure", "opposed", "defend", "game", "competitive", "apply"],
  assessment: ["assess", "evaluate", "review", "consolidat", "reflect"],
  general: [],
};

function inferOutcomeStage(description: string): OutcomeProgressionStage {
  const lower = description.toLowerCase();
  for (const stage of STAGE_ORDER) {
    if (stage === "general") continue;
    if (STAGE_KEYWORDS[stage].some((word) => lower.includes(word))) {
      return stage;
    }
  }
  return "general";
}

function stageToLessonIndex(stage: OutcomeProgressionStage, lessonCount: number): number {
  const stageIndex = STAGE_ORDER.indexOf(stage);
  if (lessonCount <= 1) return 0;
  if (stage === "assessment") return lessonCount - 1;
  if (stage === "general") {
    return Math.min(Math.floor(lessonCount / 2), lessonCount - 2);
  }
  const ratio = stageIndex / (STAGE_ORDER.length - 2);
  return Math.min(Math.floor(ratio * (lessonCount - 1)), lessonCount - 2);
}

function scoreOutcome(outcome: LearningOutcome, topicId: string, skillId: string): number {
  let score = 0;
  const skillName = skillId ? getPlanningSkillDisplayName(skillId).toLowerCase() : "";
  const description = outcome.description.toLowerCase();

  if (skillId && outcome.skillIds.includes(skillId)) score += 120;
  if (topicId && outcome.topicIds.includes(topicId)) score += 40;

  if (skillName) {
    for (const word of skillName.split(/\s+/)) {
      if (word.length > 3 && description.includes(word)) score += 35;
    }
  }

  const stage = inferOutcomeStage(outcome.description);
  score += STAGE_ORDER.indexOf(stage) * 5;

  return score;
}

export function rankOutcomesForScheme(
  outcomeIds: string[],
  topicId: string,
  skillId: string
): LearningOutcome[] {
  const outcomes = outcomeIds
    .map((id) => resolveLearningOutcomeById(id))
    .filter((o): o is LearningOutcome => Boolean(o));

  return outcomes
    .map((outcome) => ({
      outcome,
      score: scoreOutcome(outcome, topicId, skillId),
      stage: inferOutcomeStage(outcome.description),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const stageDiff =
        STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage);
      if (stageDiff !== 0) return stageDiff;
      return a.outcome.code.localeCompare(b.outcome.code);
    })
    .map((item) => item.outcome);
}

export function distributeOutcomesAcrossLessons(
  rankedOutcomes: LearningOutcome[],
  lessonCount: number
): string[][] {
  const buckets: string[][] = Array.from({ length: lessonCount }, () => []);
  if (rankedOutcomes.length === 0 || lessonCount === 0) return buckets;

  const assigned = new Set<string>();

  for (const outcome of rankedOutcomes) {
    if (assigned.has(outcome.id)) continue;
    const stage = inferOutcomeStage(outcome.description);
    let target = stageToLessonIndex(stage, lessonCount);

    for (let attempt = 0; attempt < lessonCount; attempt++) {
      const index = (target + attempt) % lessonCount;
      if (!buckets[index].includes(outcome.id)) {
        buckets[index].push(outcome.id);
        assigned.add(outcome.id);
        break;
      }
    }
  }

  for (let i = 0; i < lessonCount; i++) {
    if (buckets[i].length > 0) continue;

    const donorIndex = buckets.findIndex((bucket, index) => index !== i && bucket.length > 1);
    if (donorIndex >= 0) {
      buckets[i].push(buckets[donorIndex].pop()!);
      continue;
    }

    const unassigned = rankedOutcomes.find((o) => !buckets.flat().includes(o.id));
    if (unassigned) {
      buckets[i].push(unassigned.id);
    } else if (rankedOutcomes.length > 0) {
      buckets[i].push(rankedOutcomes[Math.min(i, rankedOutcomes.length - 1)].id);
    }
  }

  return buckets;
}

export function allLessonsHaveOutcomes(buckets: string[][]): boolean {
  return buckets.length > 0 && buckets.every((bucket) => bucket.length > 0);
}
