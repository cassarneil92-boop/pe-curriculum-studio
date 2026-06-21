export type {
  PedagogyModel,
  SportDefinition,
  SportDimension,
  SportGapItem,
  SportId,
  SportIntelligenceDashboardSummary,
  SportLessonDesignHints,
  SportLessonPhase,
  SportProgressionMetadata,
  SportProgressionQuery,
  SportProgressionResult,
  SportSkillCoverageRow,
  SportSkillDefinition,
  SportDepthRow,
} from "./types";

export {
  ALL_SPORT_IDS,
  DIMENSION_LABELS,
  PEDAGOGY_LABELS,
  SPORT_DEFINITIONS,
  formatPedagogyRecommendations,
  getNextSkillsInSport,
  getPreviousSkillsInSport,
  getSkillInSport,
  getSportDefinitionById,
  getSportDefinitionByTopicId,
  resolveSportIdFromTopic,
} from "./progression-framework";

export {
  isSportPlanningOutcome,
  isSportTopicId,
  getSportTopicIds,
} from "./planning-bridge";

export {
  buildSportProgressionMetadata,
  buildSportMetadataIndex,
  matchSkillToOutcome,
} from "./outcome-metadata";

export {
  getSportOutcomes,
  querySportProgression,
  getSkillProgressionAcrossLessons,
  buildSportIntelligenceDashboardSummary,
} from "./progression-engine";
