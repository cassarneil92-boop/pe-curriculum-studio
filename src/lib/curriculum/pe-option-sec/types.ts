import type { LearningDomain, PhysicalLiteracyAttribute } from "../primary-pe/types";

/** Top-level SEC PE Option syllabus categories. */
export type SecTopicCategory =
  | "anatomy-physiology"
  | "fitness-training"
  | "skill-acquisition"
  | "sport-psychology"
  | "performance-analysis"
  | "health-lifestyle"
  | "practical-sport";

export type AnatomySubtopic =
  | "skeletal-system"
  | "muscular-system"
  | "cardiovascular-system"
  | "respiratory-system";

export type FitnessTrainingSubtopic =
  | "components-of-fitness"
  | "principles-of-training"
  | "methods-of-training";

export type SkillAcquisitionSubtopic =
  | "stages-of-learning"
  | "feedback"
  | "guidance"
  | "practice-types";

export type SportPsychologySubtopic =
  | "motivation"
  | "goal-setting"
  | "confidence"
  | "anxiety"
  | "concentration";

export type PerformanceAnalysisSubtopic =
  | "observation"
  | "evaluation"
  | "improvement-planning";

export type HealthLifestyleSubtopic =
  | "physical-activity"
  | "nutrition"
  | "recovery"
  | "wellbeing";

export type AssessmentRelevance =
  | "formative"
  | "summative"
  | "coursework"
  | "exam-paper"
  | "practical-assessment";

export type ExamRelevance = "high" | "medium" | "low" | "practical-only";

export type RevisionStatus = "covered" | "planned" | "not-planned";

export interface SecProgressionMetadata {
  outcomeId: string;
  categories: SecTopicCategory[];
  anatomySubtopics?: AnatomySubtopic[];
  fitnessSubtopics?: FitnessTrainingSubtopic[];
  skillAcquisitionSubtopics?: SkillAcquisitionSubtopic[];
  psychologySubtopics?: SportPsychologySubtopic[];
  performanceSubtopics?: PerformanceAnalysisSubtopic[];
  lifestyleSubtopics?: HealthLifestyleSubtopic[];
  learningDomains: LearningDomain[];
  physicalLiteracy?: PhysicalLiteracyAttribute[];
  assessmentRelevance: AssessmentRelevance[];
  examRelevance: ExamRelevance;
  yearLabels: string[];
  inferred: boolean;
}

export interface SecProgressionQuery {
  yearGroup?: string;
  category?: SecTopicCategory;
  anatomySubtopic?: AnatomySubtopic;
  fitnessSubtopic?: FitnessTrainingSubtopic;
  skillAcquisitionSubtopic?: SkillAcquisitionSubtopic;
  psychologySubtopic?: SportPsychologySubtopic;
  performanceSubtopic?: PerformanceAnalysisSubtopic;
  lifestyleSubtopic?: HealthLifestyleSubtopic;
  learningDomain?: LearningDomain;
  physicalLiteracy?: PhysicalLiteracyAttribute;
  examRelevance?: ExamRelevance;
  skillHint?: string;
}

export interface SecProgressionResult {
  current: import("../types").LearningOutcome[];
  related: import("../types").LearningOutcome[];
  metadata: Map<string, SecProgressionMetadata>;
  narrative?: string;
}

export interface SecRevisionTopic {
  id: string;
  category: SecTopicCategory;
  label: string;
  outcomeCount: number;
  status: RevisionStatus;
  outcomeCodes: string[];
}

export interface SecRevisionContext {
  taughtOutcomeIds?: string[];
  plannedOutcomeIds?: string[];
}

export interface SecAssessmentSuggestions {
  examStyleQuestions: string[];
  revisionPrompts: string[];
  courseworkIdeas: string[];
  assessmentOpportunities: string[];
}

export interface SecCategoryCoverageRow {
  category: SecTopicCategory;
  label: string;
  outcomeCount: number;
  status: "strong" | "thin" | "missing";
}

export interface SecDomainCoverageRow {
  domain: LearningDomain;
  label: string;
  outcomeCount: number;
  status: "strong" | "thin" | "missing";
}

export interface SecPhysicalLiteracyRow {
  attribute: PhysicalLiteracyAttribute;
  label: string;
  outcomeCount: number;
  status: "strong" | "thin" | "missing";
}

export interface SecAssessmentCoverageRow {
  relevance: AssessmentRelevance;
  label: string;
  outcomeCount: number;
  status: "strong" | "thin" | "missing";
}

export interface SecRevisionReadinessRow {
  category: SecTopicCategory;
  label: string;
  coveredCount: number;
  plannedCount: number;
  notPlannedCount: number;
  readiness: "ready" | "partial" | "gap";
}

export interface SecGapItem {
  id: string;
  title: string;
  status: "strong" | "thin" | "missing" | "needs-review";
  detail: string;
}

export interface SecPeOptionDashboardSummary {
  totalOutcomes: number;
  kbOutcomes: number;
  importedOutcomes: number;
  categoryCoverage: SecCategoryCoverageRow[];
  learningDomainCoverage: SecDomainCoverageRow[];
  physicalLiteracyCoverage: SecPhysicalLiteracyRow[];
  assessmentCoverage: SecAssessmentCoverageRow[];
  revisionReadiness: SecRevisionReadinessRow[];
  gapAnalysis: SecGapItem[];
  overallStatus: "strong" | "thin" | "needs-review";
}

export interface SecLessonDesignHints {
  walt: string[];
  wilf: string[];
  revisionTasks: string[];
  retrievalPrompts: string[];
  assessment: string[];
  examPrep: string[];
}

export interface SecSchemeContext {
  topicId?: string;
  yearGroup?: string;
  outcomeIds?: string[];
}
