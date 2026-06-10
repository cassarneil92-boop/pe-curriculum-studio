import {
  FITNESS_LINKS,
  LEARNING_OUTCOMES,
  PATHWAYS,
  SKILLS,
  SPORTS,
  SPORT_VALUES,
} from "./data";
import type {
  CurriculumCatalogue,
  FitnessLink,
  LearningOutcome,
  Skill,
  Sport,
  SportValue,
} from "./types";

/** Immutable curriculum catalogue — single source of truth for the brain. */
export const CURRICULUM_CATALOGUE: CurriculumCatalogue = {
  pathways: PATHWAYS,
  sports: SPORTS,
  skills: SKILLS,
  learningOutcomes: LEARNING_OUTCOMES,
  sportValues: SPORT_VALUES,
  fitnessLinks: FITNESS_LINKS,
};

export function getSportById(id: string): Sport | undefined {
  return SPORTS.find((s) => s.id === id);
}

export function getSkillById(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id);
}

export function getLearningOutcomeById(id: string): LearningOutcome | undefined {
  return LEARNING_OUTCOMES.find((lo) => lo.id === id);
}

export function getSportValueById(id: string): SportValue | undefined {
  return SPORT_VALUES.find((sv) => sv.id === id);
}

export function getFitnessLinkById(id: string): FitnessLink | undefined {
  return FITNESS_LINKS.find((fl) => fl.id === id);
}

export function getSkillsForSport(sportId: string): Skill[] {
  const sport = getSportById(sportId);
  if (!sport) return [];
  return SKILLS.filter((s) => sport.skillIds.includes(s.id));
}

export function isSkillValidForSport(sportId: string, skillId: string): boolean {
  const sport = getSportById(sportId);
  return sport?.skillIds.includes(skillId) ?? false;
}
