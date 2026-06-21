import type { LearningDomain, PhysicalLiteracyAttribute } from "../primary-pe/types";

/** Top-level fitness curriculum categories. */
export type FitnessCategory =
  | "health-related-fitness"
  | "skill-related-fitness"
  | "training-principles"
  | "training-methods"
  | "fitness-testing"
  | "health-lifestyle";

export type HealthRelatedComponent =
  | "cardiovascular-endurance"
  | "muscular-endurance"
  | "muscular-strength"
  | "flexibility"
  | "body-composition";

export type SkillRelatedComponent =
  | "agility"
  | "balance"
  | "coordination"
  | "power"
  | "reaction-time"
  | "speed";

export type TrainingPrinciple =
  | "specificity"
  | "overload"
  | "progression"
  | "reversibility"
  | "variation"
  | "recovery";

export type TrainingMethod =
  | "continuous-training"
  | "interval-training"
  | "circuit-training"
  | "fartlek-training"
  | "resistance-training"
  | "flexibility-training";

export type FitnessTestType =
  | "aerobic-test"
  | "strength-test"
  | "endurance-test"
  | "flexibility-test"
  | "agility-test";

export type HealthLifestyleTopic =
  | "nutrition"
  | "recovery"
  | "sleep"
  | "physical-activity"
  | "sedentary-behaviour"
  | "wellbeing";

export type FitnessProgressionStage =
  | "foundational-knowledge"
  | "training-methods"
  | "application"
  | "assessment-interpretation"
  | "programme-design";

export interface FitnessProgressionMetadata {
  outcomeId: string;
  categories: FitnessCategory[];
  healthComponents?: HealthRelatedComponent[];
  skillComponents?: SkillRelatedComponent[];
  trainingPrinciples?: TrainingPrinciple[];
  trainingMethods?: TrainingMethod[];
  testTypes?: FitnessTestType[];
  lifestyleTopics?: HealthLifestyleTopic[];
  progressionStage?: FitnessProgressionStage;
  learningDomains: LearningDomain[];
  physicalLiteracy?: PhysicalLiteracyAttribute[];
  yearLabels: string[];
  inferred: boolean;
}

export interface FitnessProgressionQuery {
  yearGroup?: string;
  category?: FitnessCategory;
  healthComponent?: HealthRelatedComponent;
  skillComponent?: SkillRelatedComponent;
  trainingMethod?: TrainingMethod;
  trainingPrinciple?: TrainingPrinciple;
  testType?: FitnessTestType;
  lifestyleTopic?: HealthLifestyleTopic;
  progressionStage?: FitnessProgressionStage;
  learningDomain?: LearningDomain;
  physicalLiteracy?: PhysicalLiteracyAttribute;
  skillHint?: string;
  fromStage?: FitnessProgressionStage;
  toStage?: FitnessProgressionStage;
}

export interface FitnessProgressionResult {
  current: import("../types").LearningOutcome[];
  previous: import("../types").LearningOutcome[];
  next: import("../types").LearningOutcome[];
  related: import("../types").LearningOutcome[];
  metadata: Map<string, FitnessProgressionMetadata>;
  narrative?: string;
}

export interface FitnessCategoryCoverageRow {
  category: FitnessCategory;
  label: string;
  outcomeCount: number;
  status: "strong" | "thin" | "missing";
}

export interface FitnessDomainCoverageRow {
  domain: LearningDomain;
  label: string;
  outcomeCount: number;
  status: "strong" | "thin" | "missing";
}

export interface FitnessPhysicalLiteracyRow {
  attribute: PhysicalLiteracyAttribute;
  label: string;
  outcomeCount: number;
  status: "strong" | "thin" | "missing";
}

export interface FitnessYearCoverageRow {
  yearLabel: string;
  outcomeCount: number;
  status: "strong" | "thin" | "missing";
}

export interface FitnessGapItem {
  id: string;
  title: string;
  status: "strong" | "thin" | "missing" | "needs-review";
  detail: string;
}

export interface FitnessCurriculumDashboardSummary {
  totalOutcomes: number;
  kbOutcomes: number;
  embeddedOutcomes: number;
  categoryCoverage: FitnessCategoryCoverageRow[];
  learningDomainCoverage: FitnessDomainCoverageRow[];
  physicalLiteracyCoverage: FitnessPhysicalLiteracyRow[];
  yearCoverage: FitnessYearCoverageRow[];
  gapAnalysis: FitnessGapItem[];
  overallStatus: "strong" | "thin" | "needs-review";
}

export interface FitnessSchemeContext {
  topicId?: string;
  yearGroup?: string;
  outcomeIds?: string[];
}

export interface FitnessLessonDesignHints {
  walt: string[];
  wilf: string[];
  assessment: string[];
  reflection: string[];
  activities: string[];
}
