/**
 * Official Maltese PE pedagogical models referenced in the syllabus.
 */

export type PedagogicalModelId =
  | "sport-education"
  | "tgfu"
  | "cooperative-learning"
  | "tpsr"
  | "adventure-education"
  | "activist-approach"
  | "adventure-based-learning"
  | "health-optimising-pe";

export interface PedagogicalModelDefinition {
  id: PedagogicalModelId;
  label: string;
  shortLabel: string;
  description: string;
  recommendedFor: string[];
}

export const PEDAGOGICAL_MODELS: PedagogicalModelDefinition[] = [
  {
    id: "sport-education",
    label: "Sport Education (SE)",
    shortLabel: "Sport Education",
    description: "Season-based model with authentic roles beyond playing (coach, referee, scorer).",
    recommendedFor: ["team-games", "individual-activity", "fitness"],
  },
  {
    id: "tgfu",
    label: "Teaching Games for Understanding (TGfU)",
    shortLabel: "TGfU",
    description: "Tactical approach using game-practice-game and tactical problem-solving.",
    recommendedFor: ["invasion-games", "net-games", "team-games"],
  },
  {
    id: "cooperative-learning",
    label: "Cooperative Learning (CL)",
    shortLabel: "Cooperative Learning",
    description: "Structured group interdependence with shared goals and peer support.",
    recommendedFor: ["fitness", "outdoor-recreation", "individual-activity"],
  },
  {
    id: "tpsr",
    label: "Teaching Personal and Social Responsibility (TPSR)",
    shortLabel: "TPSR",
    description: "Responsibility levels from self-control to caring and transfer beyond PE.",
    recommendedFor: ["holistic-development", "outdoor-recreation"],
  },
  {
    id: "adventure-education",
    label: "Adventure Education (AE)",
    shortLabel: "Adventure Education",
    description: "Challenge-based outdoor learning with progressive risk and reflection.",
    recommendedFor: ["outdoor-recreation"],
  },
  {
    id: "adventure-based-learning",
    label: "Adventure Based Learning (ABL)",
    shortLabel: "ABL",
    description: "Team-building and outdoor challenge sequences with debrief.",
    recommendedFor: ["outdoor-recreation", "team-building"],
  },
  {
    id: "activist-approach",
    label: "Activist Approach",
    shortLabel: "Activist",
    description: "Student voice in unit design; critical engagement with sport culture.",
    recommendedFor: ["holistic-development", "fitness"],
  },
  {
    id: "health-optimising-pe",
    label: "Health Optimising Physical Education (HOPE)",
    shortLabel: "HOPE",
    description: "Wellbeing-centred PE linking movement to lifelong health literacy.",
    recommendedFor: ["fitness", "healthy-lifestyle", "holistic-development"],
  },
];

export function getPedagogicalModelById(id: PedagogicalModelId): PedagogicalModelDefinition | undefined {
  return PEDAGOGICAL_MODELS.find((m) => m.id === id);
}

export function getPedagogicalModelLabel(id: PedagogicalModelId): string {
  return getPedagogicalModelById(id)?.shortLabel ?? id;
}
