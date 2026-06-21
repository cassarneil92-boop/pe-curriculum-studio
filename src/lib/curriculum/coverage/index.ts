export type {
  CatalogueCoverageStatus,
  CatalogueGapItem,
  CatalogueLayerTotals,
  CoverageFilterOptions,
  CoverageFilters,
  CoverageMissingTab,
  CoverageReport,
  CoverageSummary,
  CurriculumCoverageDashboard,
  HeatmapCell,
  ImportedLearningOutcomeRecord,
  MetadataGapSummary,
  PathwayCoverageRow,
  SportCoverageRow,
  TopicCoverageRow,
  YearGroupCoverageRow,
} from "./types";

export type { PrimaryPEDashboardSummary } from "../primary-pe/types";
export type { FitnessCurriculumDashboardSummary } from "../fitness-curriculum/types";

export { IMPORTED_LEARNING_OUTCOMES } from "./coverage-engine";

export {
  buildCoverageFilterOptions,
  buildCoverageReport,
  computeCoverageSummary,
  filterCoverageOutcomes,
  formatOutcomeSkills,
  formatOutcomeSource,
  formatOutcomeTopic,
  formatOutcomeValues,
  formatOutcomeYearGroups,
  isMissingSkills,
  isMissingTopic,
  isMissingValues,
  isMissingYearGroup,
  matchesCoverageFilters,
} from "./coverage-engine";

export { buildCurriculumCoverageDashboard } from "./dashboard-engine";
