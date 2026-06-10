import type { ImportedLearningOutcomeRecord } from "./types";
import {
  GENERIC_TOPIC_IDS,
  SKILL_PATTERNS,
  TOPIC_DEFAULT_SKILLS,
  TOPIC_LABEL_ALIASES,
  TOPIC_PATTERNS,
  type CanonicalTopic,
} from "./taxonomy";
import { normaliseSkillId, normaliseTopicId, uniqueSorted } from "./utils";

function buildSearchText(outcome: ImportedLearningOutcomeRecord): string {
  return [
    outcome.code,
    outcome.description,
    outcome.rawExcerpt,
    outcome.strand,
    outcome.topic,
    outcome.pathwayLabel,
    outcome.sourceFile,
    outcome.sourceDocument,
    outcome.category,
    outcome.level,
    ...(outcome.topics ?? []),
    ...(outcome.yearGroups ?? []),
  ]
    .filter(Boolean)
    .join(" ");
}

function matchTopicsFromText(text: string): CanonicalTopic[] {
  const matches: { topic: CanonicalTopic; priority: number }[] = [];

  for (const entry of TOPIC_PATTERNS) {
    if (entry.patterns.some((pattern) => pattern.test(text))) {
      matches.push({ topic: entry.topic, priority: entry.priority ?? 50 });
    }
  }

  return matches
    .sort((a, b) => b.priority - a.priority)
    .map((entry) => entry.topic)
    .filter((topic, index, array) => array.indexOf(topic) === index);
}

function matchSkillsFromText(text: string): string[] {
  const found: string[] = [];

  for (const entry of SKILL_PATTERNS) {
    if (entry.patterns.some((pattern) => pattern.test(text))) {
      if (!found.includes(entry.skill)) found.push(entry.skill);
    }
  }

  return found;
}

function inferTopicFromPathway(
  outcome: ImportedLearningOutcomeRecord,
  currentTopicId: string
): CanonicalTopic | null {
  if (!GENERIC_TOPIC_IDS.has(currentTopicId)) return null;

  switch (outcome.pathwayId) {
    case "alp-pe":
      return "ALP Physical Education";
    case "alp-sports-vocational":
      return "ALP Sports Vocational";
    case "pe-option-sec":
      return "PE Option Theory";
    case "fitness-curriculum":
      return "Fitness";
    default:
      if (/sport[\s_-]?values/i.test(outcome.sourceFile)) return "Sport Values";
      return null;
  }
}

function inferTopicFromCode(code: string): CanonicalTopic | null {
  if (/^IG\d/i.test(code)) return "Invasion Games";
  if (/^NG\d/i.test(code)) return "Net Games";
  if (/^GY\d/i.test(code)) return "Gymnastics";
  if (/^A\d/i.test(code)) return "Athletics";
  if (/^F\d/i.test(code)) return "Fitness";
  if (/^S\d/i.test(code)) return "Swimming / Aquatics";
  if (/^D\d/i.test(code)) return "Educational Dance";
  if (/^OR\d/i.test(code)) return "Outdoor Recreation";
  if (/^SV\./i.test(code)) return "Sport Values";
  if (/^SEC\.LO/i.test(code)) return null;
  return null;
}

function resolveCanonicalTopic(
  outcome: ImportedLearningOutcomeRecord,
  text: string
): { topic: string; topicId: string } {
  const currentTopicId = outcome.topicId || normaliseTopicId(outcome.topic);
  const aliased = TOPIC_LABEL_ALIASES[outcome.topic];
  const keywordMatches = matchTopicsFromText(text);
  const codeTopic = inferTopicFromCode(outcome.code);
  const pathwayTopic = inferTopicFromPathway(outcome, currentTopicId);

  let topic: string;

  if (keywordMatches.length > 0) {
    topic = keywordMatches[0];
  } else if (aliased) {
    topic = aliased;
  } else if (GENERIC_TOPIC_IDS.has(currentTopicId) && codeTopic) {
    topic = codeTopic;
  } else if (GENERIC_TOPIC_IDS.has(currentTopicId) && pathwayTopic) {
    topic = pathwayTopic;
  } else if (outcome.topic?.trim()) {
    topic = outcome.topic.trim();
  } else if (codeTopic) {
    topic = codeTopic;
  } else if (pathwayTopic) {
    topic = pathwayTopic;
  } else {
    topic = "General";
  }

  // Refine invasion/net category to specific sport when mentioned.
  if (
    (topic === "Invasion Games" || topic === "Net Games") &&
    keywordMatches.length > 1
  ) {
    const specific = keywordMatches.find(
      (candidate) => candidate !== "Invasion Games" && candidate !== "Net Games"
    );
    if (specific) topic = specific;
  }

  // SEC strand codes map to canonical topics.
  if (/^SEC\.LO1\b/i.test(outcome.code)) topic = "PE Option Theory";
  if (/^SEC\.LO4\b/i.test(outcome.code)) topic = "PE Option Theory";
  if (/^SEC\.LO5\b/i.test(outcome.code)) topic = "PE Option Theory";
  if (/^SEC\.LO3\b/i.test(outcome.code)) topic = "Healthy Lifestyle";
  if (/^SEC\.LO2\b/i.test(outcome.code)) topic = "Fitness";
  if (/^SEC\.LO6\b/i.test(outcome.code)) topic = "Athletics";
  if (/^SEC\.LO7\b/i.test(outcome.code)) topic = "Outdoor Recreation";
  if (/^SEC\.LO8\b/i.test(outcome.code)) topic = "Handball";
  if (/^SEC\.LO9\b/i.test(outcome.code)) topic = "Football";
  if (/^SV\.Y\d+\.LEADER/i.test(outcome.code)) topic = "Leadership";
  if (/^SV\.Y\d+\.TEAMWO/i.test(outcome.code)) topic = "Teamwork";
  if (/^SV\./i.test(outcome.code) && topic === "General") topic = "Sport Values";

  return { topic, topicId: normaliseTopicId(topic) };
}

function inferSkillsForOutcome(
  outcome: ImportedLearningOutcomeRecord,
  text: string,
  topic: string
): string[] {
  const keywordSkills = matchSkillsFromText(text);
  const skills = uniqueSorted([
    ...(outcome.skills ?? []),
    ...keywordSkills,
    ...(keywordSkills.length === 0
      ? (TOPIC_DEFAULT_SKILLS[topic as CanonicalTopic] ?? [])
      : []),
  ]);

  // Map legacy skill labels to canonical names.
  const canonical = skills.map((skill) => {
    if (skill === "Finishing") return "Shooting";
    if (skill === "Tactics") return "Analysis";
    if (skill === "Teamwork") return "Cooperation";
    if (skill === "Serving") return "Passing";
    return skill;
  });

  return uniqueSorted(canonical);
}

/**
 * Improve topic and skill tags for an existing imported outcome.
 * Does not alter descriptions, codes, ids, or create new outcomes.
 */
export function enrichOutcomeTags(
  outcome: ImportedLearningOutcomeRecord
): ImportedLearningOutcomeRecord {
  const text = buildSearchText(outcome);
  const { topic, topicId } = resolveCanonicalTopic(outcome, text);
  const skills = uniqueSorted(inferSkillsForOutcome(outcome, text, topic));

  return {
    ...outcome,
    topic,
    topicId,
    skills,
    skillIds: skills.map((skill) => normaliseSkillId(skill)),
    strand: outcome.strand || topic,
  };
}

export function enrichImportedOutcomes(
  outcomes: ImportedLearningOutcomeRecord[]
): ImportedLearningOutcomeRecord[] {
  return outcomes.map(enrichOutcomeTags);
}
