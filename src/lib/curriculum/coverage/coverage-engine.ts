import { yearGroupMatchesFilter } from "@/lib/year-groups";
import importedOutcomes from "../data/imported-learning-outcomes.json";
import type { ImportedLearningOutcomeRecord } from "../import/types";
import type {
  CoverageFilterOptions,
  CoverageFilters,
  CoverageMissingTab,
  CoverageReport,
  CoverageSummary,
} from "./types";

export const IMPORTED_LEARNING_OUTCOMES =
  importedOutcomes as ImportedLearningOutcomeRecord[];

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

export function isMissingYearGroup(outcome: ImportedLearningOutcomeRecord): boolean {
  return !outcome.yearGroups || outcome.yearGroups.length === 0;
}

export function isMissingTopic(outcome: ImportedLearningOutcomeRecord): boolean {
  return !outcome.topic?.trim() && !outcome.topicId?.trim();
}

export function isMissingSkills(outcome: ImportedLearningOutcomeRecord): boolean {
  const skills = outcome.skills ?? [];
  const skillIds = outcome.skillIds ?? [];
  return skills.length === 0 && skillIds.length === 0;
}

export function isMissingValues(outcome: ImportedLearningOutcomeRecord): boolean {
  return !outcome.values || outcome.values.length === 0;
}

export function computeCoverageSummary(
  outcomes: ImportedLearningOutcomeRecord[] = IMPORTED_LEARNING_OUTCOMES
): CoverageSummary {
  const pathways = new Set(outcomes.map((outcome) => outcome.pathwayId).filter(Boolean));
  const yearGroups = new Set(outcomes.flatMap((outcome) => outcome.yearGroups ?? []));
  const topics = new Set(
    outcomes.map((outcome) => outcome.topic || outcome.topicId).filter(Boolean)
  );

  return {
    totalOutcomes: outcomes.length,
    pathwaysCovered: pathways.size,
    yearGroupsCovered: yearGroups.size,
    topicsCovered: topics.size,
    missingYearGroup: outcomes.filter(isMissingYearGroup).length,
    missingSkillTags: outcomes.filter(isMissingSkills).length,
    missingValues: outcomes.filter(isMissingValues).length,
  };
}

export function buildCoverageFilterOptions(
  outcomes: ImportedLearningOutcomeRecord[] = IMPORTED_LEARNING_OUTCOMES
): CoverageFilterOptions {
  const pathwayMap = new Map<string, string>();
  const yearGroups = new Set<string>();
  const topics = new Set<string>();
  const skills = new Set<string>();
  const sourceDocuments = new Set<string>();

  for (const outcome of outcomes) {
    if (outcome.pathwayId) {
      pathwayMap.set(outcome.pathwayId, outcome.pathwayLabel || outcome.pathwayId);
    }

    for (const yearGroup of outcome.yearGroups ?? []) {
      if (yearGroup) yearGroups.add(yearGroup);
    }

    const topic = outcome.topic || outcome.topicId;
    if (topic) topics.add(topic);

    for (const skill of outcome.skills ?? []) {
      if (skill) skills.add(skill);
    }

    const source = outcome.sourceFile || outcome.sourceDocument;
    if (source) sourceDocuments.add(source);
  }

  return {
    pathways: [...pathwayMap.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    yearGroups: [...yearGroups].sort((a, b) => a.localeCompare(b)),
    topics: [...topics].sort((a, b) => a.localeCompare(b)),
    skills: [...skills].sort((a, b) => a.localeCompare(b)),
    sourceDocuments: [...sourceDocuments].sort((a, b) => a.localeCompare(b)),
  };
}

function matchesSearch(outcome: ImportedLearningOutcomeRecord, search: string): boolean {
  const query = normalise(search);
  if (!query) return true;

  const valueText = (outcome.values ?? [])
    .flatMap((value) => [value.code, value.description, value.theme])
    .join(" ");

  const haystack = [
    outcome.id,
    outcome.code,
    outcome.description,
    outcome.pathwayId,
    outcome.pathwayLabel,
    outcome.topic,
    outcome.topicId,
    outcome.strand,
    outcome.sourceFile,
    outcome.sourceDocument,
    ...(outcome.yearGroups ?? []),
    ...(outcome.skills ?? []),
    ...(outcome.skillIds ?? []),
    valueText,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function matchesYearGroupFilter(
  outcome: ImportedLearningOutcomeRecord,
  yearGroup: string
): boolean {
  if (!yearGroup) return true;
  return yearGroupMatchesFilter(outcome.yearGroups, yearGroup);
}

function matchesSkillFilter(outcome: ImportedLearningOutcomeRecord, skill: string): boolean {
  if (!skill) return true;
  const key = normalise(skill);
  const skills = (outcome.skills ?? []).map(normalise);
  const skillIds = (outcome.skillIds ?? []).map(normalise);
  return skills.includes(key) || skillIds.includes(key);
}

export function matchesCoverageFilters(
  outcome: ImportedLearningOutcomeRecord,
  filters: CoverageFilters
): boolean {
  if (filters.pathwayId && outcome.pathwayId !== filters.pathwayId) return false;

  if (filters.yearGroup && !matchesYearGroupFilter(outcome, filters.yearGroup)) {
    return false;
  }

  if (filters.topic) {
    const topic = outcome.topic || outcome.topicId || "";
    if (normalise(topic) !== normalise(filters.topic)) return false;
  }

  if (filters.skill && !matchesSkillFilter(outcome, filters.skill)) return false;

  if (filters.sourceDocument) {
    const source = outcome.sourceFile || outcome.sourceDocument || "";
    if (source !== filters.sourceDocument) return false;
  }

  if (!matchesSearch(outcome, filters.search)) return false;

  return true;
}

function matchesMissingTab(
  outcome: ImportedLearningOutcomeRecord,
  tab: CoverageMissingTab
): boolean {
  switch (tab) {
    case "missing-year-group":
      return isMissingYearGroup(outcome);
    case "missing-topic":
      return isMissingTopic(outcome);
    case "missing-skills":
      return isMissingSkills(outcome);
    case "missing-values":
      return isMissingValues(outcome);
    default:
      return true;
  }
}

export function filterCoverageOutcomes(
  filters: CoverageFilters,
  tab: CoverageMissingTab = "all",
  outcomes: ImportedLearningOutcomeRecord[] = IMPORTED_LEARNING_OUTCOMES
): ImportedLearningOutcomeRecord[] {
  return outcomes.filter(
    (outcome) => matchesMissingTab(outcome, tab) && matchesCoverageFilters(outcome, filters)
  );
}

export function buildCoverageReport(
  filters: CoverageFilters,
  tab: CoverageMissingTab = "all",
  outcomes: ImportedLearningOutcomeRecord[] = IMPORTED_LEARNING_OUTCOMES
): CoverageReport {
  const matching = filterCoverageOutcomes(filters, tab, outcomes);

  return {
    generatedAt: new Date().toISOString(),
    summary: computeCoverageSummary(outcomes),
    filters,
    activeTab: tab,
    matchingCount: matching.length,
    outcomes: matching,
  };
}

export function formatOutcomeSkills(outcome: ImportedLearningOutcomeRecord): string {
  const skills = outcome.skills ?? [];
  if (skills.length > 0) return skills.join(", ");
  return (outcome.skillIds ?? []).join(", ") || "—";
}

export function formatOutcomeValues(outcome: ImportedLearningOutcomeRecord): string {
  const values = outcome.values ?? [];
  if (values.length === 0) return "—";
  return values.map((value) => value.code || value.description).join(", ");
}

export function formatOutcomeYearGroups(outcome: ImportedLearningOutcomeRecord): string {
  const yearGroups = outcome.yearGroups ?? [];
  return yearGroups.length > 0 ? yearGroups.join(", ") : "—";
}

export function formatOutcomeTopic(outcome: ImportedLearningOutcomeRecord): string {
  return outcome.topic || outcome.topicId || "—";
}

export function formatOutcomeSource(outcome: ImportedLearningOutcomeRecord): string {
  return outcome.sourceFile || outcome.sourceDocument || "—";
}
