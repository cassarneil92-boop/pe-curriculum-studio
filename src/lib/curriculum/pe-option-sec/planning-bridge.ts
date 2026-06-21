import { yearGroupMatchesFilter } from "@/lib/year-groups";
import type { PathwayId as AppPathwayId } from "@/lib/types";
import type { LearningOutcome } from "../types";

/** SEC PE Option outcomes are natively tagged pe-option-sec. */
export function isSecPlanningOutcome(
  outcome: LearningOutcome,
  yearGroup?: string
): boolean {
  if (outcome.pathwayId !== "pe-option-sec") return false;
  if (yearGroup) return yearGroupMatchesFilter(outcome.yearGroups, yearGroup);
  return true;
}

export function outcomeMatchesAppPathwayForSec(
  outcome: LearningOutcome,
  appPathway: AppPathwayId,
  yearGroup?: string
): boolean {
  if (appPathway !== "pe-option-sec") return false;
  return isSecPlanningOutcome(outcome, yearGroup);
}
