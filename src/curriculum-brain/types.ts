/**
 * Curriculum Brain — core type definitions.
 * Intelligence layer for pathway-aligned outcome matching.
 * No AI, exports, or lesson generation.
 */

export type PathwayId =
  | "general-pe"
  | "pe-option-sec"
  | "alp-pe"
  | "alp-sports-vocational"
  | "fitness-curriculum"
  | "sport-values";

export type YearGroup =
  | "Year 7"
  | "Year 8"
  | "Year 9"
  | "Year 10"
  | "Year 11"
  | "Form 4"
  | "Form 5";

export type SportCategory =
  | "invasion-game"
  | "athletics"
  | "fitness"
  | "general";

export type FitnessComponent =
  | "endurance"
  | "strength"
  | "flexibility"
  | "speed"
  | "coordination"
  | "power"
  | "balance";

export type SportValueTheme =
  | "fair-play"
  | "respect"
  | "teamwork"
  | "leadership"
  | "responsibility"
  | "inclusion";

/** Malta curriculum pathway — what the teacher is planning within. */
export interface CurriculumPathway {
  id: PathwayId;
  label: string;
  description: string;
}

/** A sport activity domain with its applicable skills. */
export interface Sport {
  id: string;
  name: string;
  category: SportCategory;
  skillIds: string[];
}

/** A discrete motor or tactical capability, linked to sports. */
export interface Skill {
  id: string;
  name: string;
  sportIds: string[];
}

/** Formal curriculum learning outcome tied to sport and skills. */
export interface LearningOutcome {
  id: string;
  code: string;
  description: string;
  pathwayId: PathwayId;
  yearGroups: YearGroup[];
  sportId: string;
  skillIds: string[];
  strand: string;
}

/** Personal and social development outcome linked to sport context. */
export interface SportValue {
  id: string;
  code: string;
  description: string;
  pathwayId: PathwayId;
  yearGroups: YearGroup[];
  sportIds: string[];
  skillIds: string[];
  theme: SportValueTheme;
}

/** Health-related fitness connection relevant to a sport-skill combination. */
export interface FitnessLink {
  id: string;
  code: string;
  description: string;
  pathwayId: PathwayId;
  yearGroups: YearGroup[];
  sportIds: string[];
  skillIds: string[];
  component: FitnessComponent;
}

/** Teacher selection context for strict curriculum matching. */
export interface CurriculumMatchContext {
  pathwayId: PathwayId;
  yearGroup: YearGroup;
  sportId: string;
  skillIds: string[];
}

/** Strict match result — only context-aligned curriculum intelligence. */
export interface CurriculumMatchResult {
  learningOutcomes: LearningOutcome[];
  sportValues: SportValue[];
  fitnessLinks: FitnessLink[];
}

/** Full curriculum catalogue held by the brain. */
export interface CurriculumCatalogue {
  pathways: CurriculumPathway[];
  sports: Sport[];
  skills: Skill[];
  learningOutcomes: LearningOutcome[];
  sportValues: SportValue[];
  fitnessLinks: FitnessLink[];
}
