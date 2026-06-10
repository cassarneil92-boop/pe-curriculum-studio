import { CURRICULUM_CATALOGUE } from "./registry";
import type {
  CurriculumMatchContext,
  CurriculumMatchResult,
  FitnessLink,
  LearningOutcome,
  SportValue,
} from "./types";

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

function hasSkillOverlap(
  entitySkillIds: string[],
  contextSkillIds: string[]
): boolean {
  if (contextSkillIds.length === 0) return true;
  const normalised = entitySkillIds.map(normalise);
  return contextSkillIds.some((skill) => normalised.includes(normalise(skill)));
}

function matchesYearGroup(
  yearGroups: string[],
  yearGroup: string
): boolean {
  return yearGroups.includes(yearGroup);
}

function matchesSport(
  entitySportIds: string[],
  contextSportId: string
): boolean {
  return entitySportIds.map(normalise).includes(normalise(contextSportId));
}

/**
 * Strict learning outcome match.
 * Sport must align exactly — Handball never surfaces Football outcomes.
 * When skills are selected, at least one skill must overlap.
 */
export function strictMatchLearningOutcomes(
  context: CurriculumMatchContext
): LearningOutcome[] {
  const sportId = normalise(context.sportId);
  const skillIds = context.skillIds.map(normalise).filter(Boolean);

  return CURRICULUM_CATALOGUE.learningOutcomes.filter((lo) => {
    if (lo.pathwayId !== context.pathwayId) return false;
    if (!matchesYearGroup(lo.yearGroups, context.yearGroup)) return false;
    if (normalise(lo.sportId) !== sportId) return false;
    if (!hasSkillOverlap(lo.skillIds, skillIds)) return false;
    return true;
  });
}

/**
 * Strict sport values match.
 * Values must link to the selected sport and overlap selected skills.
 * Cross-sport values (e.g. football fair play) are excluded.
 */
export function strictMatchSportValues(
  context: CurriculumMatchContext
): SportValue[] {
  const skillIds = context.skillIds.map(normalise).filter(Boolean);

  return CURRICULUM_CATALOGUE.sportValues.filter((sv) => {
    if (!matchesYearGroup(sv.yearGroups, context.yearGroup)) return false;
    if (!matchesSport(sv.sportIds, context.sportId)) return false;
    if (!hasSkillOverlap(sv.skillIds, skillIds)) return false;
    return true;
  });
}

/**
 * Strict fitness link match.
 * Links must target the selected sport-skill combination.
 * Volleyball serving or gymnastics balance links are excluded for Handball + Passing.
 */
export function strictMatchFitnessLinks(
  context: CurriculumMatchContext
): FitnessLink[] {
  const skillIds = context.skillIds.map(normalise).filter(Boolean);

  return CURRICULUM_CATALOGUE.fitnessLinks.filter((fl) => {
    if (!matchesYearGroup(fl.yearGroups, context.yearGroup)) return false;
    if (!matchesSport(fl.sportIds, context.sportId)) return false;
    if (!hasSkillOverlap(fl.skillIds, skillIds)) return false;
    return true;
  });
}

/**
 * Full strict curriculum match — the brain's primary intelligence query.
 *
 * @example
 * // Handball + Passing → handball passing LOs, handball teamwork values,
 * // handball passing fitness links. No football kicking, volleyball serving,
 * // or gymnastics outcomes.
 * strictMatchCurriculum({
 *   pathwayId: "general-pe",
 *   yearGroup: "Year 9",
 *   sportId: "handball",
 *   skillIds: ["passing"],
 * });
 */
export function strictMatchCurriculum(
  context: CurriculumMatchContext
): CurriculumMatchResult {
  return {
    learningOutcomes: strictMatchLearningOutcomes(context),
    sportValues: strictMatchSportValues(context),
    fitnessLinks: strictMatchFitnessLinks(context),
  };
}

/**
 * Validate that selected outcome IDs align with strict match context.
 */
export function validateCurriculumAlignment(
  context: CurriculumMatchContext,
  selected: {
    learningOutcomeIds?: string[];
    sportValueIds?: string[];
    fitnessLinkIds?: string[];
  }
): {
  valid: boolean;
  mismatchedLearningOutcomes: LearningOutcome[];
  mismatchedSportValues: SportValue[];
  mismatchedFitnessLinks: FitnessLink[];
} {
  const strict = strictMatchCurriculum(context);
  const strictLoIds = new Set(strict.learningOutcomes.map((lo) => lo.id));
  const strictSvIds = new Set(strict.sportValues.map((sv) => sv.id));
  const strictFlIds = new Set(strict.fitnessLinks.map((fl) => fl.id));

  const mismatchedLearningOutcomes = (selected.learningOutcomeIds ?? [])
    .map((id) => CURRICULUM_CATALOGUE.learningOutcomes.find((lo) => lo.id === id))
    .filter((lo): lo is LearningOutcome => Boolean(lo))
    .filter((lo) => !strictLoIds.has(lo.id));

  const mismatchedSportValues = (selected.sportValueIds ?? [])
    .map((id) => CURRICULUM_CATALOGUE.sportValues.find((sv) => sv.id === id))
    .filter((sv): sv is SportValue => Boolean(sv))
    .filter((sv) => !strictSvIds.has(sv.id));

  const mismatchedFitnessLinks = (selected.fitnessLinkIds ?? [])
    .map((id) => CURRICULUM_CATALOGUE.fitnessLinks.find((fl) => fl.id === id))
    .filter((fl): fl is FitnessLink => Boolean(fl))
    .filter((fl) => !strictFlIds.has(fl.id));

  const valid =
    mismatchedLearningOutcomes.length === 0 &&
    mismatchedSportValues.length === 0 &&
    mismatchedFitnessLinks.length === 0;

  return {
    valid,
    mismatchedLearningOutcomes,
    mismatchedSportValues,
    mismatchedFitnessLinks,
  };
}
