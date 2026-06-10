import type { ImportedLearningOutcomeRecord } from "../import/types";

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

export interface CoverageSummary {
  totalOutcomes: number;
  pathwaysCovered: number;
  yearGroupsCovered: number;
  topicsCovered: number;
  missingYearGroup: number;
  missingSkillTags: number;
  missingValues: number;
}

export interface CoverageFilterOptions {
  pathways: { id: string; label: string }[];
  yearGroups: string[];
  topics: string[];
  skills: string[];
  sourceDocuments: string[];
}

export interface CoverageReport {
  generatedAt: string;
  summary: CoverageSummary;
  filters: CoverageFilters;
  activeTab: CoverageMissingTab;
  matchingCount: number;
  outcomes: ImportedLearningOutcomeRecord[];
}
