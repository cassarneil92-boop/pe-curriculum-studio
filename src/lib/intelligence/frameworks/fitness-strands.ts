/**
 * Maltese secondary fitness framework (Years 7–11) and Common Fitness Battery.
 */

export type FitnessStrandId =
  | "movement-quality"
  | "functional-fitness"
  | "strength-conditioning"
  | "hybrid-fitness"
  | "personal-programme";

export type FitnessAssessmentId = "hexagon-test" | "plank-test" | "shuttle-run";

export interface FitnessStrandDefinition {
  id: FitnessStrandId;
  label: string;
  yearGroups: string[];
  codePattern: RegExp;
}

export const FITNESS_STRANDS: FitnessStrandDefinition[] = [
  {
    id: "movement-quality",
    label: "Movement Quality & Coordination",
    yearGroups: ["year-7", "Year 7", "Year 8"],
    codePattern: /^F7\./i,
  },
  {
    id: "functional-fitness",
    label: "Functional Fitness & Movement Fluency",
    yearGroups: ["year-8", "Year 8", "Year 9"],
    codePattern: /^F8\./i,
  },
  {
    id: "strength-conditioning",
    label: "Strength & Conditioning",
    yearGroups: ["year-9", "Year 9", "Year 10"],
    codePattern: /^F9\./i,
  },
  {
    id: "hybrid-fitness",
    label: "Hybrid Fitness",
    yearGroups: ["year-10", "Year 10", "Form 4"],
    codePattern: /^F10\./i,
  },
  {
    id: "personal-programme",
    label: "Personal Programme Design & Autonomy",
    yearGroups: ["year-11", "Year 11", "Form 5"],
    codePattern: /^F11\./i,
  },
];

export const FITNESS_BATTERY: {
  id: FitnessAssessmentId;
  label: string;
  measures: string;
  order: number;
}[] = [
  { id: "hexagon-test", label: "Hexagon Test", measures: "Coordination & agility", order: 1 },
  { id: "plank-test", label: "Plank to Technical Failure", measures: "Core strength", order: 2 },
  { id: "shuttle-run", label: "2-Minute Shuttle Run", measures: "Endurance", order: 3 },
];

export function getFitnessStrandForCode(code: string): FitnessStrandId | null {
  for (const strand of FITNESS_STRANDS) {
    if (strand.codePattern.test(code.trim())) return strand.id;
  }
  return null;
}

export function getFitnessStrandLabel(id: FitnessStrandId): string {
  return FITNESS_STRANDS.find((s) => s.id === id)?.label ?? id;
}
