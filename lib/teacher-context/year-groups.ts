import { getYearGroupLabel, type YearGroupId } from "@/lib/year-groups";
import type { PathwayId } from "@/lib/types";
import {
  ALL_APP_PATHWAY_IDS,
  APP_PATHWAY_YEAR_IDS,
  getAvailableYearGroupIdsForPathways,
} from "./pathways";
import type { TeacherContextRole } from "./types";

const SECONDARY_YEAR_LABELS: Partial<Record<YearGroupId, string>> = {
  "year-7": "Year 7",
  "year-8": "Year 8",
  "year-9": "Year 9",
  "year-10": "Year 10",
  "year-11": "Year 11",
};

const PE_OPTION_FORM_LABELS: Partial<Record<YearGroupId, string>> = {
  "year-9": "Form 3",
  "year-10": "Form 4",
  "year-11": "Form 5",
};

const ALP_FORM_LABELS: Partial<Record<YearGroupId, string>> = {
  "year-10": "Form 4",
  "year-11": "Form 5",
};

const EARLY_YEARS_LABELS: Partial<Record<YearGroupId, string>> = {
  "year-1": "KG1",
  "year-2": "Year 2",
};

const PRIMARY_YEAR_LABELS: Partial<Record<YearGroupId, string>> = {
  "year-1": "Year 1",
  "year-2": "Year 2",
  "year-3": "Year 3",
  "year-4": "Year 4",
  "year-5": "Year 5",
  "year-6": "Year 6",
};

function pathwaySet(pathways: PathwayId[]): Set<PathwayId> {
  return new Set(pathways);
}

export function getYearGroupLabelForPathways(
  id: YearGroupId,
  pathways: PathwayId[]
): string {
  const selected = pathwaySet(pathways);

  if (selected.has("primary-pe") && PRIMARY_YEAR_LABELS[id]) {
    return PRIMARY_YEAR_LABELS[id]!;
  }

  if (
    selected.has("early-years-pe") &&
    EARLY_YEARS_LABELS[id] &&
    APP_PATHWAY_YEAR_IDS["early-years-pe"].includes(id)
  ) {
    return EARLY_YEARS_LABELS[id]!;
  }

  if (
    (selected.has("alp-pe") ||
      selected.has("alp-sports-vocational") ||
      selected.has("fitness-curriculum")) &&
    ALP_FORM_LABELS[id]
  ) {
    return ALP_FORM_LABELS[id]!;
  }

  if (selected.has("pe-option-sec") && PE_OPTION_FORM_LABELS[id]) {
    return PE_OPTION_FORM_LABELS[id]!;
  }

  if (
    (selected.has("general-pe") || selected.has("sport-values")) &&
    SECONDARY_YEAR_LABELS[id]
  ) {
    return SECONDARY_YEAR_LABELS[id]!;
  }

  return getYearGroupLabel(id);
}

export function getContextualYearGroupLabel(
  id: YearGroupId,
  roleOrPathways: TeacherContextRole | PathwayId[]
): string {
  if (Array.isArray(roleOrPathways)) {
    return getYearGroupLabelForPathways(id, roleOrPathways);
  }

  const role = roleOrPathways;
  if (role === "secondary-pe-option" && PE_OPTION_FORM_LABELS[id]) {
    return PE_OPTION_FORM_LABELS[id] ?? getYearGroupLabel(id);
  }

  if (
    (role === "alp-teacher" || role === "alp-sports-vocational") &&
    ALP_FORM_LABELS[id]
  ) {
    return ALP_FORM_LABELS[id] ?? getYearGroupLabel(id);
  }

  if (
    (role === "secondary-pe" || role === "secondary-pe-option") &&
    SECONDARY_YEAR_LABELS[id]
  ) {
    return SECONDARY_YEAR_LABELS[id]!;
  }

  if (role === "primary-school" && PRIMARY_YEAR_LABELS[id]) {
    return PRIMARY_YEAR_LABELS[id]!;
  }

  return getYearGroupLabel(id);
}

export type YearGroupPickerSection = {
  section: string;
  options: { id: YearGroupId; label: string }[];
};

function buildSection(
  section: string,
  ids: readonly YearGroupId[],
  pathways: PathwayId[],
  available: Set<YearGroupId>
): YearGroupPickerSection | null {
  const options = ids
    .filter((id) => available.has(id))
    .map((id) => ({
      id,
      label: getYearGroupLabelForPathways(id, pathways),
    }));

  return options.length > 0 ? { section, options } : null;
}

export function getYearGroupSectionsForPathways(
  pathways: PathwayId[]
): YearGroupPickerSection[] {
  if (pathways.length === 0) return [];

  const available = new Set(getAvailableYearGroupIdsForPathways(pathways));
  const sections: YearGroupPickerSection[] = [];

  const showEarlyYears =
    pathways.includes("early-years-pe") && !pathways.includes("primary-pe");
  const showPrimary = pathways.includes("primary-pe");
  const showSecondary =
    pathways.includes("general-pe") || pathways.includes("sport-values");
  const showPeOption = pathways.includes("pe-option-sec");
  const showAlp =
    pathways.includes("alp-pe") ||
    pathways.includes("alp-sports-vocational") ||
    pathways.includes("fitness-curriculum");

  if (showEarlyYears) {
    const section = buildSection(
      "Early Years",
      APP_PATHWAY_YEAR_IDS["early-years-pe"],
      pathways,
      available
    );
    if (section) sections.push(section);
  }

  if (showPrimary) {
    const section = buildSection(
      "Primary",
      APP_PATHWAY_YEAR_IDS["primary-pe"],
      pathways,
      available
    );
    if (section) sections.push(section);
  }

  if (showSecondary) {
    const section = buildSection(
      "Secondary",
      ["year-7", "year-8", "year-9", "year-10", "year-11"],
      pathways,
      available
    );
    if (section) sections.push(section);
  } else {
    const upperSecondaryIds = new Set<YearGroupId>();
    if (showPeOption) {
      for (const id of APP_PATHWAY_YEAR_IDS["pe-option-sec"]) upperSecondaryIds.add(id);
    }
    if (showAlp) {
      for (const id of APP_PATHWAY_YEAR_IDS["alp-pe"]) upperSecondaryIds.add(id);
    }

    const orderedUpper = ["year-9", "year-10", "year-11"].filter((id) =>
      upperSecondaryIds.has(id as YearGroupId)
    ) as YearGroupId[];

    if (orderedUpper.length > 0) {
      const sectionName =
        showPeOption && showAlp
          ? "PE Option / ALP"
          : showPeOption
            ? "PE Option"
            : "ALP";
      const section = buildSection(sectionName, orderedUpper, pathways, available);
      if (section) sections.push(section);
    }
  }

  return sections;
}

/** @deprecated Use getYearGroupSectionsForPathways with teacher.pathways instead. */
export function getYearGroupSectionsForRole(
  role: TeacherContextRole
): YearGroupPickerSection[] {
  switch (role) {
    case "primary-school":
      return getYearGroupSectionsForPathways(["early-years-pe", "primary-pe"]);
    case "secondary-pe":
      return getYearGroupSectionsForPathways(["general-pe", "sport-values"]);
    case "secondary-pe-option":
      return getYearGroupSectionsForPathways([
        "general-pe",
        "sport-values",
        "pe-option-sec",
      ]);
    case "alp-teacher":
      return getYearGroupSectionsForPathways([
        "general-pe",
        "sport-values",
        "alp-pe",
        "fitness-curriculum",
      ]);
    case "alp-sports-vocational":
      return getYearGroupSectionsForPathways([
        "general-pe",
        "sport-values",
        "alp-pe",
        "alp-sports-vocational",
        "fitness-curriculum",
      ]);
    default:
      return getYearGroupSectionsForPathways([...ALL_APP_PATHWAY_IDS]);
  }
}
