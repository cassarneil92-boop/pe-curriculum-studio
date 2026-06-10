export type YearGroupId =
  | "year-1"
  | "year-2"
  | "year-3"
  | "year-4"
  | "year-5"
  | "year-6"
  | "year-7"
  | "year-8"
  | "year-9"
  | "year-10"
  | "year-11";

export type YearGroupSection = "Primary" | "Middle School" | "Secondary";

export interface YearGroupOption {
  id: YearGroupId;
  label: string;
  section: YearGroupSection;
}

/** Canonical Malta year groups — internal ids with display labels. */
export const YEAR_GROUP_OPTIONS: YearGroupOption[] = [
  { id: "year-1", label: "Year 1", section: "Primary" },
  { id: "year-2", label: "Year 2", section: "Primary" },
  { id: "year-3", label: "Year 3", section: "Primary" },
  { id: "year-4", label: "Year 4", section: "Primary" },
  { id: "year-5", label: "Year 5", section: "Primary" },
  { id: "year-6", label: "Year 6", section: "Primary" },
  { id: "year-7", label: "Year 7", section: "Middle School" },
  { id: "year-8", label: "Year 8", section: "Middle School" },
  { id: "year-9", label: "Year 9 / Form 3", section: "Secondary" },
  { id: "year-10", label: "Year 10 / Form 4", section: "Secondary" },
  { id: "year-11", label: "Year 11 / Form 5", section: "Secondary" },
];

export const YEAR_GROUP_IDS: YearGroupId[] = YEAR_GROUP_OPTIONS.map((option) => option.id);

export const YEAR_GROUP_SECTIONS: {
  section: YearGroupSection;
  options: YearGroupOption[];
}[] = [
  {
    section: "Primary",
    options: YEAR_GROUP_OPTIONS.filter((option) => option.section === "Primary"),
  },
  {
    section: "Middle School",
    options: YEAR_GROUP_OPTIONS.filter((option) => option.section === "Middle School"),
  },
  {
    section: "Secondary",
    options: YEAR_GROUP_OPTIONS.filter((option) => option.section === "Secondary"),
  },
];

/** Labels used in imported curriculum data and legacy app storage. */
const IMPORTED_YEAR_GROUP_LABELS: Record<YearGroupId, string[]> = {
  "year-1": ["Year 1", "KG1"],
  "year-2": ["Year 2"],
  "year-3": ["Year 3"],
  "year-4": ["Year 4"],
  "year-5": ["Year 5"],
  "year-6": ["Year 6"],
  "year-7": ["Year 7"],
  "year-8": ["Year 8"],
  "year-9": ["Year 9", "Form 3"],
  "year-10": ["Year 10", "Form 4"],
  "year-11": ["Year 11", "Form 5"],
};

const LEGACY_LABEL_TO_ID = new Map<string, YearGroupId>(
  YEAR_GROUP_OPTIONS.flatMap((option) =>
    IMPORTED_YEAR_GROUP_LABELS[option.id].map(
      (label) => [label.toLowerCase(), option.id] as const
    )
  )
);

export const DEFAULT_YEAR_GROUP_ID: YearGroupId = "year-9";

export function isYearGroupId(value: string): value is YearGroupId {
  return YEAR_GROUP_IDS.includes(value as YearGroupId);
}

export function getYearGroupLabel(id: string): string {
  const canonical = migrateLegacyYearGroup(id);
  if (!canonical) return id;
  return YEAR_GROUP_OPTIONS.find((option) => option.id === canonical)?.label ?? id;
}

/**
 * Map a canonical year group id to labels used in imported curriculum JSON.
 */
export function toImportedYearGroupLabels(id: string): string[] {
  const canonical = migrateLegacyYearGroup(id);
  if (!canonical) return [id];
  return IMPORTED_YEAR_GROUP_LABELS[canonical];
}

/**
 * Normalise any year group value (id, Year N, or Form N) to imported labels
 * for curriculum matching against legacy/imported data.
 */
export function normalizeYearGroupForMatching(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return [];

  const canonical = migrateLegacyYearGroup(trimmed);
  if (canonical) return IMPORTED_YEAR_GROUP_LABELS[canonical];

  return [trimmed];
}

export function migrateLegacyYearGroup(value: string): YearGroupId | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (isYearGroupId(trimmed)) return trimmed;

  const byLabel = LEGACY_LABEL_TO_ID.get(trimmed.toLowerCase());
  if (byLabel) return byLabel;

  const yearMatch = /^year\s*(\d{1,2})$/i.exec(trimmed);
  if (yearMatch) {
    const id = `year-${yearMatch[1]}` as YearGroupId;
    return isYearGroupId(id) ? id : null;
  }

  const kgMatch = /^kg\s*1$/i.exec(trimmed);
  if (kgMatch) return "year-1";

  const formMatch = /^form\s*([345])$/i.exec(trimmed);
  if (formMatch) {
    const formToYear: Record<string, YearGroupId> = {
      "3": "year-9",
      "4": "year-10",
      "5": "year-11",
    };
    return formToYear[formMatch[1]] ?? null;
  }

  return null;
}

export function yearGroupMatchesFilter(
  outcomeYearGroups: string[] | undefined,
  filterValue: string | undefined
): boolean {
  if (!filterValue) return true;
  if (!outcomeYearGroups || outcomeYearGroups.length === 0) return true;

  const filterLabels = normalizeYearGroupForMatching(filterValue);
  return outcomeYearGroups.some((label) => filterLabels.includes(label));
}

export function migrateYearGroupValue(value: string): YearGroupId {
  return migrateLegacyYearGroup(value) ?? DEFAULT_YEAR_GROUP_ID;
}

export function migrateYearGroupList(values: string[]): YearGroupId[] {
  return [...new Set(values.map(migrateYearGroupValue))];
}
