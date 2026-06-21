export type {
  FitnessCategory,
  FitnessCategoryCoverageRow,
  FitnessCurriculumDashboardSummary,
  FitnessDomainCoverageRow,
  FitnessGapItem,
  FitnessLessonDesignHints,
  FitnessPhysicalLiteracyRow,
  FitnessProgressionMetadata,
  FitnessProgressionQuery,
  FitnessProgressionResult,
  FitnessProgressionStage,
  FitnessSchemeContext,
  FitnessYearCoverageRow,
  HealthRelatedComponent,
  SkillRelatedComponent,
  TrainingMethod,
  TrainingPrinciple,
} from "./types";

export {
  ALL_FITNESS_CATEGORIES,
  FITNESS_CATEGORY_LABELS,
  FITNESS_YEAR_LABELS,
  HEALTH_COMPONENT_LABELS,
  SKILL_COMPONENT_LABELS,
  TRAINING_METHOD_LABELS,
  TRAINING_PRINCIPLE_LABELS,
  FITNESS_TEST_LABELS,
  LIFESTYLE_TOPIC_LABELS,
  PROGRESSION_STAGE_LABELS,
} from "./progression-framework";

export {
  isEmbeddedFitnessOutcome,
  isFitnessPlanningOutcome,
  outcomeMatchesAppPathwayForFitness,
  getFitnessCurriculumPathways,
} from "./planning-bridge";

export {
  buildFitnessProgressionMetadata,
  buildFitnessMetadataIndex,
} from "./outcome-metadata";

export {
  getFitnessCurriculumOutcomes,
  getFitnessProgressionMetadata,
  queryFitnessProgression,
  getRelatedFitnessOutcomes,
  getPreviousFitnessConcepts,
  getNextFitnessConcepts,
  getOutcomesByFitnessCategory,
  getOutcomesByHealthComponent,
  getOutcomesByTrainingMethod,
  describeTrainingMethodsToProgrammeDesign,
  describeCardiovascularEnduranceProgression,
  buildFitnessCurriculumDashboardSummary,
} from "./progression-engine";
