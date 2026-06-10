import { yearGroupMatchesFilter } from "@/lib/year-groups";
import { KNOWLEDGE_BASE, getTopicById } from "../registry";
import { validateContextSkills } from "../strict-match";
import type {
  LearningOutcome,
  PathwayId,
  Skill,
  Topic,
  ValueBasedPrinciple,
} from "../types";
import type { AlignmentInput, AlignmentQuery, AlignmentResult } from "./types";

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function normaliseSkillIds(skillIds: string[]): string[] {
  return [...new Set(skillIds.map(normalise).filter(Boolean))];
}

function hasSkillOverlap(
  entitySkillIds: string[],
  contextSkillIds: string[]
): boolean {
  if (contextSkillIds.length === 0) return true;
  const entitySkills = entitySkillIds.map(normalise);
  return contextSkillIds.some((skill) => entitySkills.includes(normalise(skill)));
}

function matchesTopic(entityTopicIds: string[], topicId: string): boolean {
  return entityTopicIds.map(normalise).includes(normalise(topicId));
}

function matchesYearGroup(
  yearGroups: string[] | undefined,
  yearGroup: string | undefined
): boolean {
  return yearGroupMatchesFilter(yearGroups, yearGroup);
}

function pathwayExists(pathwayId: PathwayId): boolean {
  return KNOWLEDGE_BASE.pathways.some((pathway) => pathway.id === pathwayId);
}

function resolvePathwayId(pathway: PathwayId | string): PathwayId | null {
  const key = normalise(pathway);
  const byId = KNOWLEDGE_BASE.pathways.find((p) => normalise(p.id) === key);
  if (byId) return byId.id;
  const byLabel = KNOWLEDGE_BASE.pathways.find(
    (p) => normalise(p.label) === key
  );
  return byLabel?.id ?? null;
}

function resolveTopicId(topic: string): string | null {
  const key = normalise(topic);
  const byId = KNOWLEDGE_BASE.topics.find((t) => normalise(t.id) === key);
  if (byId) return byId.id;
  const byName = KNOWLEDGE_BASE.topics.find(
    (t) => normalise(t.name) === key
  );
  return byName?.id ?? null;
}

function resolveSkillIds(skill: string | string[]): string[] {
  const inputs = Array.isArray(skill) ? skill : [skill];
  const resolved: string[] = [];

  for (const entry of inputs) {
    const key = normalise(entry);
    const byId = KNOWLEDGE_BASE.skills.find((s) => normalise(s.id) === key);
    if (byId) {
      resolved.push(byId.id);
      continue;
    }
    const byName = KNOWLEDGE_BASE.skills.find(
      (s) => normalise(s.name) === key
    );
    if (byName) resolved.push(byName.id);
  }

  return [...new Set(resolved)];
}

/**
 * Resolve teacher-friendly labels to a strict alignment query.
 */
export function resolveAlignmentQuery(input: AlignmentInput): AlignmentQuery | null {
  const pathwayId = resolvePathwayId(input.pathway);
  const topicId = resolveTopicId(input.topic);
  const skillIds = resolveSkillIds(input.skill);

  if (!pathwayId || !topicId || skillIds.length === 0) return null;

  return {
    pathwayId,
    yearGroup: input.yearGroup,
    topicId,
    skillIds,
  };
}

/**
 * Validate pathway, topic-skill ownership, and year group context.
 */
export function validateAlignmentQuery(query: AlignmentQuery): boolean {
  if (!pathwayExists(query.pathwayId)) return false;
  if (!getTopicById(query.topicId)) return false;
  return validateContextSkills({
    pathwayId: query.pathwayId,
    topicId: query.topicId,
    skillIds: query.skillIds,
  });
}

/**
 * Strict learning outcome match.
 * Requires pathway + topic + skill overlap.
 *
 * Handball + Passing returns handball passing outcomes only —
 * never football kicking, volleyball serving, or gymnastics balance.
 */
export function findLearningOutcomes(query: AlignmentQuery): LearningOutcome[] {
  if (!validateAlignmentQuery(query)) return [];

  const topicId = normalise(query.topicId);
  const skillIds = normaliseSkillIds(query.skillIds);

  return KNOWLEDGE_BASE.learningOutcomes.filter((outcome) => {
    if (outcome.pathwayId !== query.pathwayId) return false;
    if (!outcome.topicIds.some((id) => normalise(id) === topicId)) return false;
    if (!hasSkillOverlap(outcome.skillIds, skillIds)) return false;
    if (!matchesYearGroup(outcome.yearGroups, query.yearGroup)) return false;
    return true;
  });
}

/**
 * Values linked to matched outcomes, filtered by topic and skill alignment.
 */
export function findRelevantValues(
  query: AlignmentQuery
): ValueBasedPrinciple[] {
  if (!validateAlignmentQuery(query)) return [];

  const matchedOutcomes = findLearningOutcomes(query);
  const valueIds = new Set(matchedOutcomes.flatMap((outcome) => outcome.valueIds));
  const skillIds = normaliseSkillIds(query.skillIds);

  return KNOWLEDGE_BASE.values.filter((value) => {
    if (!valueIds.has(value.id)) return false;
    if (!matchesTopic(value.topicIds, query.topicId)) return false;
    if (!hasSkillOverlap(value.skillIds, skillIds)) return false;
    return true;
  });
}

/**
 * Skills strictly aligned to the topic and matched learning outcomes.
 * Only returns skills explicitly requested that belong to the topic.
 */
export function findRelevantSkills(query: AlignmentQuery): Skill[] {
  if (!validateAlignmentQuery(query)) return [];

  const matchedOutcomes = findLearningOutcomes(query);
  const skillIdsInOutcomes = new Set(
    matchedOutcomes.flatMap((outcome) => outcome.skillIds)
  );
  const requestedSkillIds = normaliseSkillIds(query.skillIds);
  const topicId = normalise(query.topicId);

  return KNOWLEDGE_BASE.skills.filter((skill) => {
    if (!requestedSkillIds.includes(normalise(skill.id))) return false;
    if (!skill.topicIds.map(normalise).includes(topicId)) return false;
    if (!skillIdsInOutcomes.has(skill.id)) return false;
    return true;
  });
}

/**
 * Topics that strictly match the query and have aligned learning outcomes.
 */
export function findRelevantTopics(query: AlignmentQuery): Topic[] {
  if (!validateAlignmentQuery(query)) return [];

  const topic = getTopicById(query.topicId);
  if (!topic) return [];

  const hasCoverage = findLearningOutcomes(query).length > 0;
  if (!hasCoverage) return [];

  const requestedSkills = normaliseSkillIds(query.skillIds);
  const topicSupportsSkills = requestedSkills.every((skillId) =>
    topic.skillIds.map(normalise).includes(skillId)
  );

  return topicSupportsSkills ? [topic] : [];
}

/**
 * Full strict alignment across outcomes, values, skills, and topics.
 */
export function alignCurriculum(query: AlignmentQuery): AlignmentResult {
  return {
    learningOutcomes: findLearningOutcomes(query),
    values: findRelevantValues(query),
    skills: findRelevantSkills(query),
    topics: findRelevantTopics(query),
  };
}

/**
 * Convenience wrapper accepting labels (e.g. "Handball", "Passing").
 */
export function alignCurriculumFromInput(
  input: AlignmentInput
): AlignmentResult | null {
  const query = resolveAlignmentQuery(input);
  if (!query) return null;
  return alignCurriculum(query);
}
