import { KNOWLEDGE_BASE } from "./registry";
import type {
  AssessmentIdea,
  LearningOutcome,
  StrictMatchContext,
  StrictMatchResult,
  ValueBasedPrinciple,
} from "./types";

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

function hasSkillOverlap(
  entitySkillIds: string[],
  contextSkillIds: string[]
): boolean {
  if (contextSkillIds.length === 0) return true;
  const normalised = entitySkillIds.map(normalise);
  return contextSkillIds.some((skill) => normalised.includes(normalise(skill)));
}

function matchesTopic(
  entityTopicIds: string[],
  contextTopicId: string
): boolean {
  return entityTopicIds.map(normalise).includes(normalise(contextTopicId));
}

/**
 * Validate that every selected skill belongs to the chosen topic.
 * Prevents passing a football skill against a handball topic.
 */
export function validateContextSkills(context: StrictMatchContext): boolean {
  const topic = KNOWLEDGE_BASE.topics.find(
    (t) => normalise(t.id) === normalise(context.topicId)
  );
  if (!topic) return false;
  if (context.skillIds.length === 0) return true;

  const topicSkills = new Set(topic.skillIds.map(normalise));
  return context.skillIds.every((skill) => topicSkills.has(normalise(skill)));
}

/**
 * Strict learning outcome match.
 * Pathway + exact topic + skill overlap required.
 * Handball + Passing will never return Football Kicking outcomes.
 */
export function strictMatchLearningOutcomes(
  context: StrictMatchContext
): LearningOutcome[] {
  if (!validateContextSkills(context)) return [];

  const topicId = normalise(context.topicId);
  const skillIds = context.skillIds.map(normalise).filter(Boolean);

  return KNOWLEDGE_BASE.learningOutcomes.filter((lo) => {
    if (lo.pathwayId !== context.pathwayId) return false;
    if (!lo.topicIds.some((id) => normalise(id) === topicId)) return false;
    if (!hasSkillOverlap(lo.skillIds, skillIds)) return false;
    return true;
  });
}

/**
 * Resolve values linked to matched learning outcomes,
 * filtered by topic and skill alignment.
 */
export function strictMatchValues(
  context: StrictMatchContext,
  matchedOutcomes: LearningOutcome[]
): ValueBasedPrinciple[] {
  if (!validateContextSkills(context)) return [];

  const valueIds = new Set(matchedOutcomes.flatMap((lo) => lo.valueIds));
  const skillIds = context.skillIds.map(normalise).filter(Boolean);

  return KNOWLEDGE_BASE.values.filter((val) => {
    if (!valueIds.has(val.id)) return false;
    if (!matchesTopic(val.topicIds, context.topicId)) return false;
    if (!hasSkillOverlap(val.skillIds, skillIds)) return false;
    return true;
  });
}

/**
 * Resolve assessment ideas linked to matched learning outcomes,
 * filtered by topic and skill alignment.
 */
export function strictMatchAssessments(
  context: StrictMatchContext,
  matchedOutcomes: LearningOutcome[]
): AssessmentIdea[] {
  if (!validateContextSkills(context)) return [];

  const assessmentIds = new Set(matchedOutcomes.flatMap((lo) => lo.assessmentIds));
  const skillIds = context.skillIds.map(normalise).filter(Boolean);

  return KNOWLEDGE_BASE.assessmentIdeas.filter((ass) => {
    if (!assessmentIds.has(ass.id)) return false;
    if (!matchesTopic(ass.topicIds, context.topicId)) return false;
    if (!hasSkillOverlap(ass.skillIds, skillIds)) return false;
    return true;
  });
}

/**
 * Full strict curriculum match — primary knowledge base query.
 *
 * @example
 * strictMatch({
 *   pathwayId: "secondary-pe",
 *   topicId: "handball",
 *   skillIds: ["passing"],
 * });
 * // Returns handball passing outcomes only — not football kicking,
 * // volleyball serving, or gymnastics balance.
 */
export function strictMatch(context: StrictMatchContext): StrictMatchResult {
  const learningOutcomes = strictMatchLearningOutcomes(context);
  const values = strictMatchValues(context, learningOutcomes);
  const assessmentIdeas = strictMatchAssessments(context, learningOutcomes);

  return { learningOutcomes, values, assessmentIdeas };
}

/**
 * Validate selected IDs align with strict match context.
 */
export function validateStrictAlignment(
  context: StrictMatchContext,
  selected: {
    learningOutcomeIds?: string[];
    valueIds?: string[];
    assessmentIds?: string[];
  }
): {
  valid: boolean;
  mismatchedLearningOutcomes: LearningOutcome[];
  mismatchedValues: ValueBasedPrinciple[];
  mismatchedAssessments: AssessmentIdea[];
} {
  const strict = strictMatch(context);
  const strictLoIds = new Set(strict.learningOutcomes.map((lo) => lo.id));
  const strictValIds = new Set(strict.values.map((v) => v.id));
  const strictAssIds = new Set(strict.assessmentIdeas.map((a) => a.id));

  const mismatchedLearningOutcomes = (selected.learningOutcomeIds ?? [])
    .map((id) => KNOWLEDGE_BASE.learningOutcomes.find((lo) => lo.id === id))
    .filter((lo): lo is LearningOutcome => Boolean(lo))
    .filter((lo) => !strictLoIds.has(lo.id));

  const mismatchedValues = (selected.valueIds ?? [])
    .map((id) => KNOWLEDGE_BASE.values.find((v) => v.id === id))
    .filter((v): v is ValueBasedPrinciple => Boolean(v))
    .filter((v) => !strictValIds.has(v.id));

  const mismatchedAssessments = (selected.assessmentIds ?? [])
    .map((id) => KNOWLEDGE_BASE.assessmentIdeas.find((a) => a.id === id))
    .filter((a): a is AssessmentIdea => Boolean(a))
    .filter((a) => !strictAssIds.has(a.id));

  const valid =
    mismatchedLearningOutcomes.length === 0 &&
    mismatchedValues.length === 0 &&
    mismatchedAssessments.length === 0;

  return {
    valid,
    mismatchedLearningOutcomes,
    mismatchedValues,
    mismatchedAssessments,
  };
}
