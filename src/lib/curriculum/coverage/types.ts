import type { ImportedLearningOutcomeRecord } from "../import/types";
import type { PathwayId, LearningOutcome } from "../types";

export type { ImportedLearningOutcomeRecord };

export type CoverageMissingTab =
  | "all"
  | "missing-year-group"
  | "missing-topic"
  | "missing-skills"
  | "missing-values";

export interface CoverageFilters {
  pathwayId: string;
  yearGroup: string;
  topic: string;
  skill: string;
  sourceDocument: string;
  search: string;
}

export interface CoverageFilterOptions {
  pathways: { id: string; label: string }[];
  yearGroups: string[];
  topics: string[];
  skills: string[];
  sourceDocuments: string[];
}

export interface CoverageSummary {
  totalOutcomes: number;
  pathwaysCovered: number;
  yearGroupsCovered: number;
  topicsCovered: number;
  missingYearGroup: number;
  missingSkillTags: number;
  missingValues: number;
}

export interface CoverageReport {
  generatedAt: string;
  summary: CoverageSummary;
  filters: CoverageFilters;
  activeTab: CoverageMissingTab;
  matchingCount: number;
  outcomes: ImportedLearningOutcomeRecord[];
}

/** Plain-language catalogue density for teachers. */
export type CatalogueCoverageStatus =
  | "strong"
  | "thin"
  | "missing"
  | "fallback-only"
  | "needs-review"
  | "absent";

export interface CatalogueLayerTotals {
  rawImport: number;
  planningCatalogue: number;
  kbStrictAlignment: number;
}

export interface PathwayCoverageRow {
  pathwayId: PathwayId;
  label: string;
  rawCount: number;
  planningCount: number;
  kbCount: number;
  status: CatalogueCoverageStatus;
  note?: string;
}

export interface YearGroupCoverageRow {
  yearGroup: string;
  label: string;
  rawCount: number;
  planningCount: number;
  status: CatalogueCoverageStatus;
}

export interface HeatmapCell {
  id: string;
  rowLabel: string;
  columnLabel: string;
  count: number;
  status: CatalogueCoverageStatus;
}

export interface TopicCoverageRow {
  topicId: string;
  label: string;
  rawCount: number;
  planningCount: number;
  status: CatalogueCoverageStatus;
}

export interface SportCoverageRow {
  topicId: string;
  label: string;
  planningCount: number;
  status: CatalogueCoverageStatus;
  fallbackChain?: string[];
}

export interface MetadataGapSummary {
  missingYearGroups: number;
  missingSkills: number;
  missingValues: number;
  totalOutcomes: number;
}

export interface CatalogueGapItem {
  id: string;
  title: string;
  status: CatalogueCoverageStatus;
  detail: string;
}

import type { PrimaryPEDashboardSummary } from "../primary-pe/types";
import type { FitnessCurriculumDashboardSummary } from "../fitness-curriculum/types";
import type { SecPeOptionDashboardSummary } from "../pe-option-sec/types";

export interface CurriculumCoverageDashboard {
  generatedAt: string;
  layerTotals: CatalogueLayerTotals;
  pathwayCoverage: PathwayCoverageRow[];
  yearGroupCoverage: YearGroupCoverageRow[];
  pathwayYearHeatmap: HeatmapCell[];
  topicCoverage: TopicCoverageRow[];
  sportCoverage: SportCoverageRow[];
  metadataGaps: MetadataGapSummary;
  catalogueGaps: CatalogueGapItem[];
  primaryPE: PrimaryPEDashboardSummary;
  fitnessPE: FitnessCurriculumDashboardSummary;
  secPE: SecPeOptionDashboardSummary;
}

/** @deprecated Dashboard filter alias — use CoverageFilters in audit UI. */
export type CoverageMetadataFilter =
  | "all"
  | "missing-year-groups"
  | "missing-skills"
  | "missing-values";

export interface CoverageFilterState {
  pathwayId: PathwayId | "all";
  metadataFilter: CoverageMetadataFilter;
}

export interface CoverageOutcomeRow {
  outcome: LearningOutcome;
  missingYearGroups: boolean;
  missingSkills: boolean;
  missingValues: boolean;
}
