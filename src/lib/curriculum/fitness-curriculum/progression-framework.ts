import type {
  FitnessCategory,
  FitnessProgressionStage,
  HealthLifestyleTopic,
  HealthRelatedComponent,
  SkillRelatedComponent,
  TrainingMethod,
  TrainingPrinciple,
  FitnessTestType,
} from "./types";

export const FITNESS_YEAR_LABELS = [
  "Year 7",
  "Year 8",
  "Year 9",
  "Year 10",
  "Year 11",
] as const;

export const FITNESS_CATEGORY_LABELS: Record<FitnessCategory, string> = {
  "health-related-fitness": "Health Related Fitness",
  "skill-related-fitness": "Skill Related Fitness",
  "training-principles": "Training Principles",
  "training-methods": "Training Methods",
  "fitness-testing": "Fitness Testing",
  "health-lifestyle": "Health & Lifestyle",
};

export const HEALTH_COMPONENT_LABELS: Record<HealthRelatedComponent, string> = {
  "cardiovascular-endurance": "Cardiovascular endurance",
  "muscular-endurance": "Muscular endurance",
  "muscular-strength": "Muscular strength",
  flexibility: "Flexibility",
  "body-composition": "Body composition",
};

export const SKILL_COMPONENT_LABELS: Record<SkillRelatedComponent, string> = {
  agility: "Agility",
  balance: "Balance",
  coordination: "Coordination",
  power: "Power",
  "reaction-time": "Reaction time",
  speed: "Speed",
};

export const TRAINING_METHOD_LABELS: Record<TrainingMethod, string> = {
  "continuous-training": "Continuous training",
  "interval-training": "Interval training",
  "circuit-training": "Circuit training",
  "fartlek-training": "Fartlek training",
  "resistance-training": "Resistance training",
  "flexibility-training": "Flexibility training",
};

export const TRAINING_PRINCIPLE_LABELS: Record<TrainingPrinciple, string> = {
  specificity: "Specificity",
  overload: "Overload",
  progression: "Progression",
  reversibility: "Reversibility",
  variation: "Variation",
  recovery: "Recovery",
};

export const FITNESS_TEST_LABELS: Record<FitnessTestType, string> = {
  "aerobic-test": "Aerobic tests",
  "strength-test": "Strength tests",
  "endurance-test": "Endurance tests",
  "flexibility-test": "Flexibility tests",
  "agility-test": "Agility tests",
};

export const LIFESTYLE_TOPIC_LABELS: Record<HealthLifestyleTopic, string> = {
  nutrition: "Nutrition",
  recovery: "Recovery",
  sleep: "Sleep",
  "physical-activity": "Physical activity",
  "sedentary-behaviour": "Sedentary behaviour",
  wellbeing: "Wellbeing",
};

export const PROGRESSION_STAGE_LABELS: Record<FitnessProgressionStage, string> = {
  "foundational-knowledge": "Foundational knowledge",
  "training-methods": "Training methods",
  application: "Application",
  "assessment-interpretation": "Assessment & interpretation",
  "programme-design": "Programme design",
};

export const FITNESS_PROGRESSION_CHAIN: FitnessProgressionStage[] = [
  "foundational-knowledge",
  "training-methods",
  "application",
  "assessment-interpretation",
  "programme-design",
];

export const CATEGORY_STRONG_THRESHOLD = 5;
export const CATEGORY_THIN_THRESHOLD = 1;
export const DOMAIN_STRONG_THRESHOLD = 8;
export const PL_STRONG_THRESHOLD = 4;
export const YEAR_STRONG_THRESHOLD = 4;

export function getAdjacentFitnessStage(stage: FitnessProgressionStage): {
  previous: FitnessProgressionStage | null;
  next: FitnessProgressionStage | null;
} {
  const index = FITNESS_PROGRESSION_CHAIN.indexOf(stage);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? FITNESS_PROGRESSION_CHAIN[index - 1] : null,
    next:
      index < FITNESS_PROGRESSION_CHAIN.length - 1
        ? FITNESS_PROGRESSION_CHAIN[index + 1]
        : null,
  };
}

export function getAdjacentFitnessYear(yearLabel: string): {
  previous: string | null;
  next: string | null;
} {
  const index = FITNESS_YEAR_LABELS.indexOf(yearLabel as (typeof FITNESS_YEAR_LABELS)[number]);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? FITNESS_YEAR_LABELS[index - 1] : null,
    next: index < FITNESS_YEAR_LABELS.length - 1 ? FITNESS_YEAR_LABELS[index + 1] : null,
  };
}

export const ALL_FITNESS_CATEGORIES: FitnessCategory[] = [
  "health-related-fitness",
  "skill-related-fitness",
  "training-principles",
  "training-methods",
  "fitness-testing",
  "health-lifestyle",
];
