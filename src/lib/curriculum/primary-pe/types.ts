import type { LearningOutcome } from "../types";

/** Primary PE progression strands for Years 1–6. */
export type PrimaryProgressionStrand =
  | "fundamental-movement-skills"
  | "movement-competence"
  | "games-sport-foundations"
  | "health-wellbeing"
  | "physical-literacy";

export type LearningDomain = "physical" | "cognitive" | "social" | "affective";

export type PhysicalLiteracyAttribute =
  | "motivation"
  | "confidence"
  | "competence"
  | "knowledge-understanding";

export interface PrimaryProgressionStrandDefinition {
  id: PrimaryProgressionStrand;
  label: string;
  description: string;
  yearFocus: string[];
}

export interface PrimaryYearBand {
  id: "years-1-2" | "years-3-4" | "years-5-6";
  label: string;
  yearLabels: string[];
  emphasis: PrimaryProgressionStrand[];
}

export interface PrimaryProgressionMetadata {
  outcomeId: string;
  strands: PrimaryProgressionStrand[];
  learningDomains: LearningDomain[];
  physicalLiteracy?: PhysicalLiteracyAttribute[];
  yearLabels: string[];
  inferred: boolean;
}

export interface PrimaryProgressionQuery {
  yearGroup?: string;
  topicId?: string;
  skillHint?: string;
  strand?: PrimaryProgressionStrand;
  learningDomain?: LearningDomain;
  physicalLiteracy?: PhysicalLiteracyAttribute;
  fromYearGroup?: string;
  toYearGroup?: string;
  fromTopicId?: string;
  toTopicId?: string;
}

export interface PrimaryProgressionResult {
  current: LearningOutcome[];
  previous: LearningOutcome[];
  next: LearningOutcome[];
  metadata: Map<string, PrimaryProgressionMetadata>;
  narrative?: string;
}

export interface PrimaryStrandCoverageRow {
  strand: PrimaryProgressionStrand;
  label: string;
  outcomeCount: number;
  status: "strong" | "thin" | "missing";
}

export interface PrimaryDomainCoverageRow {
  domain: LearningDomain;
  label: string;
  outcomeCount: number;
  status: "strong" | "thin" | "missing";
}

export interface PrimaryPhysicalLiteracyRow {
  attribute: PhysicalLiteracyAttribute;
  label: string;
  outcomeCount: number;
  status: "strong" | "thin" | "missing";
}

export interface PrimaryYearCoverageRow {
  yearLabel: string;
  outcomeCount: number;
  status: "strong" | "thin" | "missing";
}

export interface PrimaryPEDashboardSummary {
  totalOutcomes: number;
  kbOutcomes: number;
  embeddedOutcomes: number;
  progressionCompleteness: PrimaryStrandCoverageRow[];
  learningDomainCoverage: PrimaryDomainCoverageRow[];
  physicalLiteracyCoverage: PrimaryPhysicalLiteracyRow[];
  yearCoverage: PrimaryYearCoverageRow[];
  overallStatus: "strong" | "thin" | "needs-review";
}
