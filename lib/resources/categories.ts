export const RESOURCE_CATEGORIES = [
  { id: "lesson-cards", label: "Lesson Cards" },
  { id: "assessments", label: "Assessments" },
  { id: "rubrics", label: "Rubrics" },
  { id: "worksheets", label: "Worksheets" },
  { id: "observation-sheets", label: "Observation Sheets" },
  { id: "risk-assessments", label: "Risk Assessments" },
  { id: "schemes", label: "Schemes" },
  { id: "general", label: "General" },
] as const;

export type ResourceCategoryId = (typeof RESOURCE_CATEGORIES)[number]["id"];

export function getResourceCategoryLabel(id?: string): string {
  return RESOURCE_CATEGORIES.find((c) => c.id === id)?.label ?? "General";
}

export function normaliseResourceCategory(id?: string): ResourceCategoryId {
  if (RESOURCE_CATEGORIES.some((c) => c.id === id)) {
    return id as ResourceCategoryId;
  }
  return "general";
}
