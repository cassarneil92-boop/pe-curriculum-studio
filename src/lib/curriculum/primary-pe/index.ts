export type {
  LearningDomain,
  PhysicalLiteracyAttribute,
  PrimaryDomainCoverageRow,
  PrimaryPEDashboardSummary,
  PrimaryPhysicalLiteracyRow,
  PrimaryProgressionMetadata,
  PrimaryProgressionQuery,
  PrimaryProgressionResult,
  PrimaryProgressionStrand,
  PrimaryStrandCoverageRow,
  PrimaryYearCoverageRow,
} from "./types";

export {
  PRIMARY_PROGRESSION_STRANDS,
  PRIMARY_YEAR_BANDS,
  PRIMARY_YEAR_LABELS,
  STRAND_LABELS,
  LEARNING_DOMAIN_LABELS,
  PL_ATTRIBUTE_LABELS,
  getStrandLabel,
  getYearBandForLabel,
  getAdjacentYearLabels,
} from "./progression-framework";

export {
  isEmbeddedPrimaryOutcome,
  isPrimaryPlanningOutcome,
  outcomeMatchesAppPathwayForPrimary,
  getPrimaryCurriculumPathways,
} from "./planning-bridge";

export {
  buildPrimaryProgressionMetadata,
  buildPrimaryMetadataIndex,
} from "./outcome-metadata";

export {
  getPrimaryPEOutcomes,
  getPrimaryProgressionMetadata,
  queryPrimaryProgression,
  getOutcomesByStrand,
  getOutcomesByLearningDomain,
  getOutcomesByPhysicalLiteracy,
  getPreviousYearOutcomes,
  getNextYearOutcomes,
  buildPrimaryPEDashboardSummary,
  describeThrowingToInvasionProgression,
} from "./progression-engine";
