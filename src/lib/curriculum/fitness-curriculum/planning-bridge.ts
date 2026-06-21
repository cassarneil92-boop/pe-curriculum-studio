import { yearGroupMatchesFilter } from "@/lib/year-groups";
import type { PathwayId as AppPathwayId } from "@/lib/types";
import type { LearningOutcome, PathwayId as CurriculumPathwayId } from "../types";
import { FITNESS_YEAR_LABELS } from "./progression-framework";

function isFitnessFrameworkCode(code: string): boolean {
  return /^F(7|8|9|10|11)\./i.test(code.trim());
}

function hasFitnessYearGroup(outcome: LearningOutcome): boolean {
  return (outcome.yearGroups ?? []).some((yg) =>
    FITNESS_YEAR_LABELS.includes(yg as (typeof FITNESS_YEAR_LABELS)[number]) ||
    yg === "Form 4" ||
    yg === "Form 5"
  );
}

function hasFitnessTopic(outcome: LearningOutcome): boolean {
  return outcome.topicIds.some((id) => id.toLowerCase() === "fitness");
}

/** Embedded fitness syllabus content stored under secondary-pe. */
export function isEmbeddedFitnessOutcome(outcome: LearningOutcome): boolean {
  if (outcome.pathwayId !== "secondary-pe") return false;
  if (!hasFitnessYearGroup(outcome)) return false;
  return hasFitnessTopic(outcome) || isFitnessFrameworkCode(outcome.code);
}

export function isFitnessPlanningOutcome(
  outcome: LearningOutcome,
  yearGroup?: string
): boolean {
  if (outcome.pathwayId === "fitness-curriculum") {
    return yearGroup ? yearGroupMatchesFilter(outcome.yearGroups, yearGroup) : true;
  }
  if (!isEmbeddedFitnessOutcome(outcome)) return false;
  if (yearGroup) return yearGroupMatchesFilter(outcome.yearGroups, yearGroup);
  return true;
}

export function outcomeMatchesAppPathwayForFitness(
  outcome: LearningOutcome,
  appPathway: AppPathwayId,
  yearGroup?: string
): boolean {
  if (appPathway !== "fitness-curriculum") return false;
  return isFitnessPlanningOutcome(outcome, yearGroup);
}

export function getFitnessCurriculumPathways(): CurriculumPathwayId[] {
  return ["fitness-curriculum", "secondary-pe"];
}
