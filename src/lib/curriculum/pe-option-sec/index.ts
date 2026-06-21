export type {
  AnatomySubtopic,
  AssessmentRelevance,
  ExamRelevance,
  FitnessTrainingSubtopic,
  HealthLifestyleSubtopic,
  PerformanceAnalysisSubtopic,
  RevisionStatus,
  SecAssessmentCoverageRow,
  SecAssessmentSuggestions,
  SecCategoryCoverageRow,
  SecDomainCoverageRow,
  SecGapItem,
  SecLessonDesignHints,
  SecPeOptionDashboardSummary,
  SecPhysicalLiteracyRow,
  SecProgressionMetadata,
  SecProgressionQuery,
  SecProgressionResult,
  SecRevisionContext,
  SecRevisionReadinessRow,
  SecRevisionTopic,
  SecSchemeContext,
  SecTopicCategory,
  SkillAcquisitionSubtopic,
  SportPsychologySubtopic,
} from "./types";

export {
  ALL_SEC_CATEGORIES,
  ANATOMY_SUBTOPIC_LABELS,
  ASSESSMENT_RELEVANCE_LABELS,
  FITNESS_SUBTOPIC_LABELS,
  HEALTH_LIFESTYLE_LABELS,
  PERFORMANCE_ANALYSIS_LABELS,
  SEC_CATEGORY_LABELS,
  SEC_EXAM_THEORY_CATEGORIES,
  SEC_REVISION_TOPIC_ORDER,
  SEC_YEAR_LABELS,
  SKILL_ACQUISITION_LABELS,
  SPORT_PSYCHOLOGY_LABELS,
} from "./progression-framework";

export {
  isSecPlanningOutcome,
  outcomeMatchesAppPathwayForSec,
} from "./planning-bridge";

export {
  buildSecProgressionMetadata,
  buildSecMetadataIndex,
} from "./outcome-metadata";

export {
  getSecPeOptionOutcomes,
  getSecProgressionMetadata,
  querySecProgression,
  getRelatedSecOutcomes,
  getOutcomesBySecCategory,
  showRevisionTopics,
  showExamTopicCoverage,
  showWeakTopics,
  showMissingTopics,
  buildSecAssessmentSuggestions,
  buildSecPeOptionDashboardSummary,
} from "./progression-engine";
