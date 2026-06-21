import type { LearningOutcome } from "../types";
import type { SportDimension, SportId, SportProgressionMetadata } from "./types";
import { getSportDefinitionById, getSportDefinitionByTopicId, getSkillInSport } from "./progression-framework";
import { isSportPlanningOutcome } from "./planning-bridge";

const TACTICAL = /\b(tactic|decision|position|press|transition|attack|defend|space|timing)\b/i;
const PHYSICAL = /\b(run|sprint|jump|balance|strength|endurance|power|agility|fitness)\b/i;
const PSYCHOLOGICAL = /\b(confident|motivat|effort|enjoy|commit|focus|concentrat)\b/i;
const SOCIAL = /\b(team|partner|cooperat|communicat|lead|fair play|respect)\b/i;

function inferDimensions(text: string, skillIds: string[]): SportDimension[] {
  const dims = new Set<SportDimension>(["technical"]);
  if (TACTICAL.test(text)) dims.add("tactical");
  if (PHYSICAL.test(text)) dims.add("physical");
  if (PSYCHOLOGICAL.test(text)) dims.add("psychological");
  if (SOCIAL.test(text)) dims.add("social");
  if (skillIds.some((id) => /defend|press|transition|tactic/.test(id))) dims.add("tactical");
  return [...dims];
}

function inferSkillIds(outcome: LearningOutcome, sportId: SportId | null): string[] {
  const fromOutcome = outcome.skillIds.map((id) => id.toLowerCase());
  if (fromOutcome.length > 0) return fromOutcome;

  const text = outcome.description.toLowerCase();
  const sport = sportId
    ? getSportDefinitionById(sportId)
    : outcome.topicIds.map((t) => getSportDefinitionByTopicId(t)).find(Boolean);

  if (!sport) return [];

  return sport.skills
    .filter((skill) => text.includes(skill.label.toLowerCase()) || text.includes(skill.id))
    .map((s) => s.id);
}

export function buildSportProgressionMetadata(
  outcome: LearningOutcome
): SportProgressionMetadata | null {
  if (!isSportPlanningOutcome(outcome)) return null;

  const sportDef = outcome.topicIds
    .map((t) => getSportDefinitionByTopicId(t))
    .find(Boolean);

  const skillIds = inferSkillIds(outcome, sportDef?.id ?? null);
  const dimensions = inferDimensions(outcome.description, skillIds);

  return {
    outcomeId: outcome.id,
    sportId: sportDef?.id,
    skillIds,
    dimensions,
    inferred: skillIds.length === 0 || !sportDef,
  };
}

export function buildSportMetadataIndex(
  outcomes: LearningOutcome[]
): Map<string, SportProgressionMetadata> {
  const index = new Map<string, SportProgressionMetadata>();
  for (const outcome of outcomes) {
    const meta = buildSportProgressionMetadata(outcome);
    if (meta) index.set(outcome.id, meta);
  }
  return index;
}

export function matchSkillToOutcome(outcome: LearningOutcome, skillId: string): boolean {
  const meta = buildSportProgressionMetadata(outcome);
  if (!meta) return false;
  const key = skillId.toLowerCase();
  return (
    meta.skillIds.some((id) => id.includes(key) || key.includes(id)) ||
    outcome.description.toLowerCase().includes(key) ||
    outcome.skillIds.some((id) => id.toLowerCase().includes(key))
  );
}
