import { yearGroupMatchesFilter } from "@/lib/year-groups";
import type { PathwayId as AppPathwayId } from "@/lib/types";
import type { LearningOutcome, PathwayId as CurriculumPathwayId } from "../types";
import { PRIMARY_YEAR_LABELS } from "./progression-framework";

const PRIMARY_TOPIC_IDS = new Set([
  "fundamentals",
  "games",
  "invasion-games",
  "net-games",
  "striking-fielding",
  "striking-and-fielding-games",
  "gymnastics",
  "athletics",
  "educational-dance",
  "healthy-lifestyle",
  "holistic-development",
  "sport-values",
  "teamwork",
  "leadership",
  "movement",
  "outdoor-recreation",
  "handball",
  "football",
  "basketball",
  "volleyball",
  "badminton",
]);

function hasPrimaryYearGroup(outcome: LearningOutcome): boolean {
  return (outcome.yearGroups ?? []).some((yg) =>
    PRIMARY_YEAR_LABELS.includes(yg as (typeof PRIMARY_YEAR_LABELS)[number])
  );
}

function isFundamentalsCode(code: string): boolean {
  return /^F[246]\./i.test(code.trim());
}

function hasPrimaryTopic(outcome: LearningOutcome): boolean {
  return outcome.topicIds.some((id) => PRIMARY_TOPIC_IDS.has(id.toLowerCase()));
}

/** Embedded primary content stored under secondary-pe with Year 1–6 tags. */
export function isEmbeddedPrimaryOutcome(outcome: LearningOutcome): boolean {
  if (outcome.pathwayId !== "secondary-pe") return false;
  if (!hasPrimaryYearGroup(outcome)) return false;
  return hasPrimaryTopic(outcome) || isFundamentalsCode(outcome.code);
}

export function isPrimaryPlanningOutcome(
  outcome: LearningOutcome,
  yearGroup?: string
): boolean {
  if (outcome.pathwayId === "primary-pe") {
    return yearGroup ? yearGroupMatchesFilter(outcome.yearGroups, yearGroup) : true;
  }
  if (!isEmbeddedPrimaryOutcome(outcome)) return false;
  if (yearGroup) return yearGroupMatchesFilter(outcome.yearGroups, yearGroup);
  return true;
}

export function outcomeMatchesAppPathwayForPrimary(
  outcome: LearningOutcome,
  appPathway: AppPathwayId,
  yearGroup?: string
): boolean {
  if (appPathway !== "primary-pe") return false;
  return isPrimaryPlanningOutcome(outcome, yearGroup);
}

export function getPrimaryCurriculumPathways(): CurriculumPathwayId[] {
  return ["primary-pe", "secondary-pe"];
}
