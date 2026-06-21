import type { LearningOutcome } from "../types";
import type {
  LearningDomain,
  PhysicalLiteracyAttribute,
  PrimaryProgressionMetadata,
  PrimaryProgressionStrand,
} from "./types";
import { PRIMARY_YEAR_LABELS } from "./progression-framework";
import { isPrimaryPlanningOutcome } from "./planning-bridge";

const EXPLICIT_METADATA: Record<string, Omit<PrimaryProgressionMetadata, "outcomeId" | "inferred">> = {
  "pri-hb-pass-1": {
    strands: ["games-sport-foundations"],
    learningDomains: ["physical", "social"],
    physicalLiteracy: ["competence", "confidence"],
    yearLabels: ["Year 3", "Year 4", "Year 5", "Year 6"],
  },
  "pri-hb-recv-1": {
    strands: ["fundamental-movement-skills", "games-sport-foundations"],
    learningDomains: ["physical"],
    physicalLiteracy: ["competence"],
    yearLabels: ["Year 3", "Year 4"],
  },
  "pri-hb-throw-1": {
    strands: ["fundamental-movement-skills", "movement-competence"],
    learningDomains: ["physical"],
    physicalLiteracy: ["competence"],
    yearLabels: ["Year 4", "Year 5"],
  },
  "pri-fb-pass-1": {
    strands: ["games-sport-foundations"],
    learningDomains: ["physical", "cognitive"],
    physicalLiteracy: ["competence", "confidence"],
    yearLabels: ["Year 5", "Year 6"],
  },
  "pri-ath-run-1": {
    strands: ["fundamental-movement-skills", "movement-competence"],
    learningDomains: ["physical"],
    physicalLiteracy: ["competence"],
    yearLabels: ["Year 4", "Year 5", "Year 6"],
  },
  "pri-gym-bal-1": {
    strands: ["fundamental-movement-skills", "movement-competence"],
    learningDomains: ["physical", "affective"],
    physicalLiteracy: ["confidence", "competence"],
    yearLabels: ["Year 3", "Year 4", "Year 5"],
  },
};

const TOPIC_STRAND_MAP: Record<string, PrimaryProgressionStrand[]> = {
  fundamentals: ["fundamental-movement-skills"],
  movement: ["fundamental-movement-skills", "movement-competence"],
  games: ["games-sport-foundations"],
  "invasion-games": ["games-sport-foundations"],
  "net-games": ["games-sport-foundations"],
  "striking-fielding": ["games-sport-foundations"],
  "striking-and-fielding-games": ["games-sport-foundations"],
  gymnastics: ["movement-competence", "fundamental-movement-skills"],
  athletics: ["movement-competence", "fundamental-movement-skills"],
  "educational-dance": ["movement-competence", "physical-literacy"],
  "healthy-lifestyle": ["health-wellbeing"],
  "holistic-development": ["physical-literacy", "health-wellbeing"],
  "sport-values": ["physical-literacy"],
  teamwork: ["physical-literacy"],
  leadership: ["physical-literacy"],
};

const FMS_SKILLS = new Set([
  "throwing",
  "catching",
  "passing",
  "running",
  "jumping",
  "balance",
  "rolling",
  "kicking",
  "dribbling",
  "speed",
  "sprinting",
  "receiving",
]);

const COGNITIVE_PATTERNS =
  /\b(understand|identify|explain|describe|recognise|recognize|know|plan|decide|strategy|tactic)\b/i;
const SOCIAL_PATTERNS =
  /\b(cooperat|team|partner|group|share|respect|fair|leadership|communicat|help)\b/i;
const AFFECTIVE_PATTERNS =
  /\b(enjoy|confident|motivat|feel|safe|willing|attempt|effort|positive|fair play)\b/i;
const CONFIDENCE_PATTERNS = /\b(confident|attempt|willing|enjoy|safe|success)\b/i;
const MOTIVATION_PATTERNS = /\b(enjoy|motivat|participat|active|choose|interest)\b/i;
const KNOWLEDGE_PATTERNS = /\b(understand|know|explain|identify|recognise|recognize|healthy|safety)\b/i;

function inferStrandsFromCode(code: string, topicIds: string[]): PrimaryProgressionStrand[] {
  const strands = new Set<PrimaryProgressionStrand>();
  const upper = code.toUpperCase();

  if (/^F2\./.test(upper)) {
    strands.add("fundamental-movement-skills");
    strands.add("physical-literacy");
  } else if (/^F4\./.test(upper)) {
    strands.add("fundamental-movement-skills");
    strands.add("movement-competence");
  } else if (/^F6\./.test(upper)) {
    strands.add("movement-competence");
    strands.add("games-sport-foundations");
  }

  for (const topicId of topicIds) {
    for (const strand of TOPIC_STRAND_MAP[topicId.toLowerCase()] ?? []) {
      strands.add(strand);
    }
  }

  if (strands.size === 0) {
    strands.add("fundamental-movement-skills");
  }

  return [...strands];
}

function inferDomains(
  outcome: LearningOutcome,
  description: string
): LearningDomain[] {
  const domains = new Set<LearningDomain>(["physical"]);

  if (COGNITIVE_PATTERNS.test(description)) domains.add("cognitive");
  if (SOCIAL_PATTERNS.test(description)) domains.add("social");
  if (AFFECTIVE_PATTERNS.test(description)) domains.add("affective");

  if (outcome.skillIds.some((id) => FMS_SKILLS.has(id.toLowerCase()))) {
    domains.add("physical");
  }

  if (outcome.valueIds.length > 0) {
    domains.add("affective");
    domains.add("social");
  }

  return [...domains];
}

function inferPhysicalLiteracy(
  description: string,
  domains: LearningDomain[]
): PhysicalLiteracyAttribute[] {
  const attributes = new Set<PhysicalLiteracyAttribute>();

  if (MOTIVATION_PATTERNS.test(description)) attributes.add("motivation");
  if (CONFIDENCE_PATTERNS.test(description)) attributes.add("confidence");
  if (KNOWLEDGE_PATTERNS.test(description)) attributes.add("knowledge-understanding");
  if (domains.includes("physical")) attributes.add("competence");
  if (domains.includes("affective")) attributes.add("confidence");

  return [...attributes];
}

function normaliseYearLabels(outcome: LearningOutcome): string[] {
  const labels = (outcome.yearGroups ?? []).filter((yg) =>
    PRIMARY_YEAR_LABELS.includes(yg as (typeof PRIMARY_YEAR_LABELS)[number])
  );
  return labels.length > 0 ? labels : [...PRIMARY_YEAR_LABELS];
}

export function buildPrimaryProgressionMetadata(
  outcome: LearningOutcome
): PrimaryProgressionMetadata | null {
  if (!isPrimaryPlanningOutcome(outcome)) return null;

  const explicit = EXPLICIT_METADATA[outcome.id];
  if (explicit) {
    return { outcomeId: outcome.id, ...explicit, inferred: false };
  }

  const description = outcome.description;
  const topicIds = outcome.topicIds.map((id) => id.toLowerCase());
  const strands = inferStrandsFromCode(outcome.code, topicIds);
  const learningDomains = inferDomains(outcome, description);
  const physicalLiteracy = inferPhysicalLiteracy(description, learningDomains);

  return {
    outcomeId: outcome.id,
    strands,
    learningDomains,
    physicalLiteracy: physicalLiteracy.length > 0 ? physicalLiteracy : undefined,
    yearLabels: normaliseYearLabels(outcome),
    inferred: true,
  };
}

export function buildPrimaryMetadataIndex(
  outcomes: LearningOutcome[]
): Map<string, PrimaryProgressionMetadata> {
  const index = new Map<string, PrimaryProgressionMetadata>();
  for (const outcome of outcomes) {
    const metadata = buildPrimaryProgressionMetadata(outcome);
    if (metadata) index.set(outcome.id, metadata);
  }
  return index;
}
