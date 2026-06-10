import type { PathwayId, TeacherProfile } from "@/lib/types";
import type { YearGroupId } from "@/lib/year-groups";
import { yearGroupMatchesFilter } from "@/lib/year-groups";
import type { ImportedLearningOutcomeRecord } from "@/src/lib/curriculum/import/types";
import {
  ALL_APP_PATHWAY_IDS,
  ALL_IMPORTED_PATHWAY_IDS,
  getAvailableYearGroupIdsForPathways,
  IMPORTED_PATHWAY_LABELS,
  IMPORTED_PATHWAY_YEAR_IDS,
  isFitnessImportedOutcome,
  isSportValuesImportedOutcome,
  MIDDLE_SECONDARY_YEAR_IDS,
  PRIMARY_YEAR_IDS,
} from "./pathways";
import type {
  CurriculumAccessMode,
  ImportedOutcomeVisibilityResult,
  ImportedPathwayId,
  TeacherContextRole,
  TeacherContextSnapshot,
} from "./types";

const ROLE_LABELS: Record<TeacherContextRole, string> = {
  unset: "Not configured",
  "primary-school": "Primary School Teacher",
  "secondary-pe": "Secondary PE Teacher",
  "secondary-pe-option": "Secondary PE + PE Option Teacher",
  "alp-teacher": "ALP Teacher",
  "alp-sports-vocational": "ALP Teacher (Sports Vocational)",
};

function pathwaySet(teacher: TeacherProfile): Set<PathwayId> {
  return new Set(teacher.pathways);
}

export function inferTeacherRole(teacher: TeacherProfile): TeacherContextRole {
  const selected = pathwaySet(teacher);

  if (selected.size === 0) return "unset";

  if (selected.has("alp-sports-vocational")) return "alp-sports-vocational";
  if (selected.has("alp-pe")) return "alp-teacher";
  if (selected.has("pe-option-sec")) return "secondary-pe-option";

  const hasPrimaryPathway =
    selected.has("primary-pe") || selected.has("early-years-pe");
  const hasSecondaryPathway =
    selected.has("general-pe") ||
    selected.has("sport-values") ||
    selected.has("pe-option-sec") ||
    selected.has("alp-pe") ||
    selected.has("alp-sports-vocational") ||
    selected.has("fitness-curriculum");

  if (hasPrimaryPathway && !hasSecondaryPathway) return "primary-school";

  return "secondary-pe";
}

function visibleImportedPathwaysForTeacher(teacher: TeacherProfile): ImportedPathwayId[] {
  const selected = pathwaySet(teacher);
  if (selected.size === 0) return ALL_IMPORTED_PATHWAY_IDS;

  const visible = new Set<ImportedPathwayId>();

  if (selected.has("early-years-pe")) visible.add("early-years-pe");
  if (selected.has("primary-pe")) visible.add("primary-pe");
  if (selected.has("general-pe")) visible.add("secondary-pe");
  if (selected.has("sport-values")) visible.add("sport-values");
  if (selected.has("pe-option-sec")) visible.add("pe-option-sec");
  if (selected.has("alp-pe")) visible.add("alp-pe");
  if (selected.has("alp-sports-vocational")) visible.add("alp-sports-vocational");
  if (selected.has("fitness-curriculum")) visible.add("fitness-curriculum");

  return ALL_IMPORTED_PATHWAY_IDS.filter((id) => visible.has(id));
}

function visibleAppPathwaysForTeacher(teacher: TeacherProfile): PathwayId[] {
  const selected = pathwaySet(teacher);
  if (selected.size === 0) return ALL_APP_PATHWAY_IDS;
  return ALL_APP_PATHWAY_IDS.filter((id) => selected.has(id));
}

export function getRelevantYearGroupIds(
  pathways: PathwayId[],
  teacherYearGroups: YearGroupId[]
): YearGroupId[] {
  if (pathways.length === 0) return teacherYearGroups;

  const validIds = new Set(getAvailableYearGroupIdsForPathways(pathways));
  return teacherYearGroups.filter((id) => validIds.has(id));
}

export function buildTeacherContext(
  teacher: TeacherProfile,
  accessMode: CurriculumAccessMode
): TeacherContextSnapshot {
  const role = inferTeacherRole(teacher);
  const exploreAllEnabled = accessMode === "explore-all";

  const visibleImportedPathways = exploreAllEnabled
    ? ALL_IMPORTED_PATHWAY_IDS
    : visibleImportedPathwaysForTeacher(teacher);

  const visibleAppPathways = exploreAllEnabled
    ? ALL_APP_PATHWAY_IDS
    : visibleAppPathwaysForTeacher(teacher);

  const hiddenImportedPathways = ALL_IMPORTED_PATHWAY_IDS.filter(
    (id) => !visibleImportedPathways.includes(id)
  );

  const hiddenAppPathways = ALL_APP_PATHWAY_IDS.filter(
    (id) => !visibleAppPathways.includes(id)
  );

  const visibleYearGroupIds = exploreAllEnabled
    ? teacher.yearGroups
    : getRelevantYearGroupIds(teacher.pathways, teacher.yearGroups);

  return {
    role,
    roleLabel: ROLE_LABELS[role],
    accessMode,
    teacher,
    visibleAppPathways,
    hiddenAppPathways,
    visibleImportedPathways,
    hiddenImportedPathways,
    visibleYearGroupIds,
    exploreAllEnabled,
  };
}

const APP_TO_IMPORTED_PATHWAY: Record<PathwayId, ImportedPathwayId> = {
  "early-years-pe": "early-years-pe",
  "primary-pe": "primary-pe",
  "general-pe": "secondary-pe",
  "sport-values": "sport-values",
  "pe-option-sec": "pe-option-sec",
  "alp-pe": "alp-pe",
  "alp-sports-vocational": "alp-sports-vocational",
  "fitness-curriculum": "fitness-curriculum",
};

export function importedPathwayForAppPathway(appPathway: PathwayId): ImportedPathwayId | null {
  return APP_TO_IMPORTED_PATHWAY[appPathway] ?? null;
}

export function outcomeMatchesImportedPathway(
  outcome: ImportedLearningOutcomeRecord,
  pathwayId: ImportedPathwayId
): boolean {
  if (pathwayId === "sport-values") {
    return (
      outcome.pathwayId === "secondary-pe" && isSportValuesImportedOutcome(outcome)
    );
  }

  if (pathwayId === "primary-pe") {
    return (
      outcome.pathwayId === "secondary-pe" &&
      [...PRIMARY_YEAR_IDS].some((yearId) =>
        yearGroupMatchesFilter(outcome.yearGroups, yearId)
      )
    );
  }

  if (pathwayId === "fitness-curriculum") {
    return isFitnessImportedOutcome(outcome);
  }

  if (pathwayId === "secondary-pe") {
    if (outcome.pathwayId !== "secondary-pe") return false;
    if (isSportValuesImportedOutcome(outcome)) return false;
    return true;
  }

  return outcome.pathwayId === pathwayId;
}

export function outcomeMatchesAppPathway(
  outcome: ImportedLearningOutcomeRecord,
  appPathway: PathwayId
): boolean {
  const importedPathway = importedPathwayForAppPathway(appPathway);
  if (!importedPathway) return false;
  return outcomeMatchesImportedPathway(outcome, importedPathway);
}

function outcomeMatchesVisibleImportedPathwayYears(
  outcome: ImportedLearningOutcomeRecord,
  visibleImportedPathways: ImportedPathwayId[],
  visibleYearGroupIds: YearGroupId[]
): boolean {
  if (visibleYearGroupIds.length === 0) return true;
  if (!outcome.yearGroups || outcome.yearGroups.length === 0) return true;

  const matchingPathways = visibleImportedPathways.filter((pathwayId) =>
    outcomeMatchesImportedPathway(outcome, pathwayId)
  );

  if (matchingPathways.length === 0) return true;

  for (const pathwayId of matchingPathways) {
    const pathwayYears = IMPORTED_PATHWAY_YEAR_IDS[pathwayId];
    const hasOverlap = visibleYearGroupIds.some(
      (yearId) =>
        pathwayYears.includes(yearId) &&
        yearGroupMatchesFilter(outcome.yearGroups, yearId)
    );
    if (hasOverlap) return true;
  }

  return false;
}

function isOutcomeInVisibleYearGroups(
  outcome: ImportedLearningOutcomeRecord,
  context: TeacherContextSnapshot
): boolean {
  return outcomeMatchesVisibleImportedPathwayYears(
    outcome,
    context.visibleImportedPathways,
    context.visibleYearGroupIds
  );
}

export function isImportedOutcomeVisible(
  outcome: ImportedLearningOutcomeRecord,
  context: TeacherContextSnapshot
): boolean {
  if (context.exploreAllEnabled) return true;

  const pathwayVisible = context.visibleImportedPathways.some((pathwayId) =>
    outcomeMatchesImportedPathway(outcome, pathwayId)
  );

  if (!pathwayVisible) return false;

  return isOutcomeInVisibleYearGroups(outcome, context);
}

export function filterVisibleImportedOutcomes(
  outcomes: ImportedLearningOutcomeRecord[],
  context: TeacherContextSnapshot
): ImportedLearningOutcomeRecord[] {
  return outcomes.filter((outcome) => isImportedOutcomeVisible(outcome, context));
}

export function countImportedOutcomeVisibility(
  outcomes: ImportedLearningOutcomeRecord[],
  context: TeacherContextSnapshot
): ImportedOutcomeVisibilityResult {
  const visible = filterVisibleImportedOutcomes(outcomes, context).length;
  return {
    total: outcomes.length,
    visible,
    hidden: outcomes.length - visible,
  };
}

export function countImportedOutcomesByPathway(
  outcomes: ImportedLearningOutcomeRecord[],
  context: TeacherContextSnapshot
): { pathwayId: ImportedPathwayId; label: string; visible: number; hidden: number }[] {
  return ALL_IMPORTED_PATHWAY_IDS.map((pathwayId) => {
    const matching = outcomes.filter((outcome) =>
      outcomeMatchesImportedPathway(outcome, pathwayId)
    );
    const visible = matching.filter((outcome) =>
      isImportedOutcomeVisible(outcome, context)
    ).length;

    return {
      pathwayId,
      label: IMPORTED_PATHWAY_LABELS[pathwayId],
      visible,
      hidden: matching.length - visible,
    };
  }).filter((row) => row.visible + row.hidden > 0);
}

export function isAppPathwayVisible(
  pathwayId: PathwayId,
  context: TeacherContextSnapshot
): boolean {
  if (context.exploreAllEnabled) return true;
  return context.visibleAppPathways.includes(pathwayId);
}

export function isAppYearGroupVisible(
  yearGroupId: YearGroupId,
  context: TeacherContextSnapshot
): boolean {
  if (context.exploreAllEnabled) return true;
  if (context.visibleYearGroupIds.length === 0) return true;
  return context.visibleYearGroupIds.includes(yearGroupId);
}

export function countImportedOutcomesByYearGroup(
  outcomes: ImportedLearningOutcomeRecord[],
  context: TeacherContextSnapshot
): { yearGroup: string; visible: number; hidden: number }[] {
  const counts = new Map<string, { visible: number; hidden: number }>();

  for (const outcome of outcomes) {
    const labels =
      outcome.yearGroups && outcome.yearGroups.length > 0
        ? outcome.yearGroups
        : ["Not specified"];

    for (const label of labels) {
      const current = counts.get(label) ?? { visible: 0, hidden: 0 };
      if (isImportedOutcomeVisible(outcome, context)) {
        current.visible += 1;
      } else {
        current.hidden += 1;
      }
      counts.set(label, current);
    }
  }

  return [...counts.entries()]
    .map(([yearGroup, value]) => ({ yearGroup, ...value }))
    .sort((a, b) => a.yearGroup.localeCompare(b.yearGroup));
}

export function hasHiddenCurriculumContent(context: TeacherContextSnapshot): boolean {
  return (
    !context.exploreAllEnabled &&
    (context.hiddenAppPathways.length > 0 || context.hiddenImportedPathways.length > 0)
  );
}
