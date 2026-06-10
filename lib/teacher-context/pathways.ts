import type { PathwayId } from "@/lib/types";
import type { ImportedPathwayId } from "./types";

export const IMPORTED_PATHWAY_LABELS: Record<ImportedPathwayId, string> = {
  "early-years-pe": "Early Years PE",
  "primary-pe": "Primary PE",
  "secondary-pe": "Secondary PE",
  "sport-values": "Sport Values",
  "pe-option-sec": "PE Option SEC",
  "alp-pe": "ALP Physical Education",
  "alp-sports-vocational": "ALP Sports Vocational",
  "fitness-curriculum": "Fitness Curriculum",
};

export const ALL_IMPORTED_PATHWAY_IDS: ImportedPathwayId[] = [
  "early-years-pe",
  "primary-pe",
  "secondary-pe",
  "sport-values",
  "pe-option-sec",
  "alp-pe",
  "alp-sports-vocational",
  "fitness-curriculum",
];

export const ALL_APP_PATHWAY_IDS: PathwayId[] = [
  "early-years-pe",
  "primary-pe",
  "general-pe",
  "sport-values",
  "pe-option-sec",
  "alp-pe",
  "alp-sports-vocational",
  "fitness-curriculum",
];

import type { YearGroupId } from "@/lib/year-groups";

/** Valid year groups per app pathway (Settings + planning). */
export const APP_PATHWAY_YEAR_IDS: Record<PathwayId, readonly YearGroupId[]> = {
  "early-years-pe": ["year-1", "year-2"],
  "primary-pe": ["year-1", "year-2", "year-3", "year-4", "year-5", "year-6"],
  "general-pe": ["year-7", "year-8", "year-9", "year-10", "year-11"],
  "sport-values": ["year-7", "year-8", "year-9", "year-10", "year-11"],
  "pe-option-sec": ["year-9", "year-10", "year-11"],
  "alp-pe": ["year-10", "year-11"],
  "alp-sports-vocational": ["year-10", "year-11"],
  "fitness-curriculum": ["year-10", "year-11"],
};

/** Valid year groups per imported curriculum pathway (Intelligent Mode filtering). */
export const IMPORTED_PATHWAY_YEAR_IDS: Record<ImportedPathwayId, readonly YearGroupId[]> = {
  "early-years-pe": ["year-1", "year-2"],
  "primary-pe": ["year-1", "year-2", "year-3", "year-4", "year-5", "year-6"],
  "secondary-pe": ["year-7", "year-8", "year-9", "year-10", "year-11"],
  "sport-values": ["year-7", "year-8", "year-9", "year-10", "year-11"],
  "pe-option-sec": ["year-9", "year-10", "year-11"],
  "alp-pe": ["year-10", "year-11"],
  "alp-sports-vocational": ["year-10", "year-11"],
  "fitness-curriculum": ["year-10", "year-11"],
};

const PRIMARY_YEAR_IDS = new Set<YearGroupId>(APP_PATHWAY_YEAR_IDS["primary-pe"]);

const MIDDLE_SECONDARY_YEAR_IDS = new Set<YearGroupId>(APP_PATHWAY_YEAR_IDS["general-pe"]);

const PE_OPTION_YEAR_IDS = new Set<YearGroupId>(APP_PATHWAY_YEAR_IDS["pe-option-sec"]);

const ALP_YEAR_IDS = new Set<YearGroupId>(APP_PATHWAY_YEAR_IDS["alp-pe"]);

const YEAR_ORDER: YearGroupId[] = [
  "year-1",
  "year-2",
  "year-3",
  "year-4",
  "year-5",
  "year-6",
  "year-7",
  "year-8",
  "year-9",
  "year-10",
  "year-11",
];

export function getYearGroupIdsForAppPathway(pathwayId: PathwayId): YearGroupId[] {
  return [...APP_PATHWAY_YEAR_IDS[pathwayId]];
}

export function getAvailableYearGroupIdsForPathways(pathways: PathwayId[]): YearGroupId[] {
  if (pathways.length === 0) return [];

  const ids = new Set<YearGroupId>();
  for (const pathwayId of pathways) {
    for (const yearId of APP_PATHWAY_YEAR_IDS[pathwayId]) {
      ids.add(yearId);
    }
  }

  return YEAR_ORDER.filter((id) => ids.has(id));
}

export function pruneYearGroupsForPathways(
  pathways: PathwayId[],
  yearGroups: YearGroupId[]
): YearGroupId[] {
  const valid = new Set(getAvailableYearGroupIdsForPathways(pathways));
  return yearGroups.filter((id) => valid.has(id));
}

const CURRICULUM_PATHWAY_TO_APP: Partial<Record<string, PathwayId>> = {
  "secondary-pe": "general-pe",
  "middle-school-pe": "general-pe",
};

/** Map curriculum/imported pathway ids to app pathway ids for year filtering. */
export function resolveAppPathwayForYears(pathwayId: string): PathwayId | null {
  if (pathwayId in APP_PATHWAY_YEAR_IDS) return pathwayId as PathwayId;
  return CURRICULUM_PATHWAY_TO_APP[pathwayId] ?? null;
}

export function getAvailableYearGroupIdsForPathwayFilter(pathwayId: string): YearGroupId[] {
  const appPathway = resolveAppPathwayForYears(pathwayId);
  if (!appPathway) return [];
  return getYearGroupIdsForAppPathway(appPathway);
}

export function pickYearGroupForPathwayFilter(
  pathwayId: string,
  current: YearGroupId,
  visibleYearGroupIds: YearGroupId[],
  exploreAllEnabled: boolean
): YearGroupId {
  const allowed = getAvailableYearGroupIdsForPathwayFilter(pathwayId).filter((id) =>
    exploreAllEnabled || visibleYearGroupIds.length === 0 || visibleYearGroupIds.includes(id)
  );

  if (allowed.includes(current)) return current;
  return allowed[0] ?? current;
}

export function pickYearGroupForPathwaysFilter(
  pathways: PathwayId[],
  current: YearGroupId,
  visibleYearGroupIds: YearGroupId[],
  exploreAllEnabled: boolean
): YearGroupId {
  const allowed = getAvailableYearGroupIdsForPathways(pathways).filter((id) =>
    exploreAllEnabled || visibleYearGroupIds.length === 0 || visibleYearGroupIds.includes(id)
  );

  if (allowed.length === 0) return current;
  if (allowed.includes(current)) return current;
  return allowed[0];
}

export function isPrimaryYearGroup(id: YearGroupId): boolean {
  return PRIMARY_YEAR_IDS.has(id);
}

export function isSportValuesImportedOutcome(outcome: {
  pathwayId: string;
  sourceFile?: string;
  code?: string;
  topic?: string;
}): boolean {
  if (outcome.sourceFile?.includes("Sport_Values")) return true;
  if (/^SV\./i.test(outcome.code ?? "")) return true;
  return ["Sport Values", "Teamwork", "Leadership"].includes(outcome.topic ?? "");
}

export function isFitnessImportedOutcome(outcome: {
  pathwayId: string;
  sourceFile?: string;
  code?: string;
  topic?: string;
}): boolean {
  if (outcome.pathwayId === "fitness-curriculum") return true;
  if (/^F\d/i.test(outcome.code ?? "")) return true;
  return (outcome.topic ?? "").toLowerCase() === "fitness";
}

export {
  PRIMARY_YEAR_IDS,
  MIDDLE_SECONDARY_YEAR_IDS,
  PE_OPTION_YEAR_IDS,
  ALP_YEAR_IDS,
};
