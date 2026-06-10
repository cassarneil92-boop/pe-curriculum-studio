/**
 * Curriculum Brain
 *
 * Architecture-only intelligence layer for Malta PE curriculum.
 * Provides typed catalogue data and strict sport-skill matching.
 *
 * No AI · No exports · No lesson generators
 */

export type {
  CurriculumCatalogue,
  CurriculumMatchContext,
  CurriculumMatchResult,
  CurriculumPathway,
  FitnessComponent,
  FitnessLink,
  LearningOutcome,
  PathwayId,
  Skill,
  Sport,
  SportCategory,
  SportValue,
  SportValueTheme,
  YearGroup,
} from "./types";

export { CURRICULUM_CATALOGUE } from "./registry";
export {
  getFitnessLinkById,
  getLearningOutcomeById,
  getSkillById,
  getSkillsForSport,
  getSportById,
  getSportValueById,
  isSkillValidForSport,
} from "./registry";

export {
  strictMatchCurriculum,
  strictMatchFitnessLinks,
  strictMatchLearningOutcomes,
  strictMatchSportValues,
  validateCurriculumAlignment,
} from "./strict-match";

export {
  FITNESS_LINKS,
  LEARNING_OUTCOMES,
  PATHWAYS,
  SKILLS,
  SPORTS,
  SPORT_VALUES,
} from "./data";
