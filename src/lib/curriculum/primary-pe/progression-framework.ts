import type {
  PrimaryProgressionStrand,
  PrimaryProgressionStrandDefinition,
  PrimaryYearBand,
} from "./types";

export const PRIMARY_PROGRESSION_STRANDS: PrimaryProgressionStrandDefinition[] = [
  {
    id: "fundamental-movement-skills",
    label: "Fundamental Movement Skills",
    description: "Locomotor, stability, and manipulative skills that underpin later activity.",
    yearFocus: ["Year 1", "Year 2", "Year 3", "Year 4"],
  },
  {
    id: "movement-competence",
    label: "Movement Competence",
    description: "Controlled, efficient movement combining skills in sequences and contexts.",
    yearFocus: ["Year 3", "Year 4", "Year 5", "Year 6"],
  },
  {
    id: "games-sport-foundations",
    label: "Games & Sport Foundations",
    description: "Modified games, tactical awareness, and sport-specific foundations.",
    yearFocus: ["Year 4", "Year 5", "Year 6"],
  },
  {
    id: "health-wellbeing",
    label: "Health & Wellbeing",
    description: "Healthy lifestyle, fitness awareness, and safe participation habits.",
    yearFocus: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"],
  },
  {
    id: "physical-literacy",
    label: "Physical Literacy",
    description: "Motivation, confidence, competence, and understanding for lifelong activity.",
    yearFocus: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"],
  },
];

export const PRIMARY_YEAR_BANDS: PrimaryYearBand[] = [
  {
    id: "years-1-2",
    label: "Years 1–2",
    yearLabels: ["Year 1", "Year 2"],
    emphasis: ["fundamental-movement-skills", "physical-literacy"],
  },
  {
    id: "years-3-4",
    label: "Years 3–4",
    yearLabels: ["Year 3", "Year 4"],
    emphasis: ["fundamental-movement-skills", "movement-competence", "games-sport-foundations"],
  },
  {
    id: "years-5-6",
    label: "Years 5–6",
    yearLabels: ["Year 5", "Year 6"],
    emphasis: ["movement-competence", "games-sport-foundations", "health-wellbeing"],
  },
];

export const PRIMARY_YEAR_LABELS = [
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
] as const;

export const STRAND_LABELS: Record<PrimaryProgressionStrand, string> = {
  "fundamental-movement-skills": "Fundamental Movement Skills",
  "movement-competence": "Movement Competence",
  "games-sport-foundations": "Games & Sport Foundations",
  "health-wellbeing": "Health & Wellbeing",
  "physical-literacy": "Physical Literacy",
};

export const LEARNING_DOMAIN_LABELS = {
  physical: "Physical",
  cognitive: "Cognitive",
  social: "Social",
  affective: "Affective",
} as const;

export const PL_ATTRIBUTE_LABELS = {
  motivation: "Motivation",
  confidence: "Confidence",
  competence: "Competence",
  "knowledge-understanding": "Knowledge & Understanding",
} as const;

/** Minimum outcomes per strand for a "strong" catalogue band. */
export const STRAND_STRONG_THRESHOLD = 8;
export const STRAND_THIN_THRESHOLD = 1;
export const DOMAIN_STRONG_THRESHOLD = 10;
export const PL_STRONG_THRESHOLD = 5;
export const YEAR_STRONG_THRESHOLD = 5;

export function getStrandLabel(strand: PrimaryProgressionStrand): string {
  return STRAND_LABELS[strand];
}

export function getYearBandForLabel(yearLabel: string): PrimaryYearBand | undefined {
  return PRIMARY_YEAR_BANDS.find((band) => band.yearLabels.includes(yearLabel));
}

export function getAdjacentYearLabels(yearLabel: string): {
  previous: string | null;
  next: string | null;
} {
  const index = PRIMARY_YEAR_LABELS.indexOf(yearLabel as (typeof PRIMARY_YEAR_LABELS)[number]);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? PRIMARY_YEAR_LABELS[index - 1] : null,
    next: index < PRIMARY_YEAR_LABELS.length - 1 ? PRIMARY_YEAR_LABELS[index + 1] : null,
  };
}
