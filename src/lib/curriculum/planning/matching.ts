import type { PathwayId as AppPathwayId } from "@/lib/types";
import type { LearningOutcome, PathwayId as CurriculumPathwayId } from "../types";
import { getAlignmentPathways } from "@/lib/scheme-builder/alignment";
import { outcomeMatchesAppPathwayForPrimary } from "../primary-pe/planning-bridge";

export function getCurriculumPathwaysForAppPathways(
  appPathways: AppPathwayId[],
  topicId = ""
): CurriculumPathwayId[] {
  const set = new Set<CurriculumPathwayId>();
  for (const appPathway of appPathways) {
    for (const pathway of getAlignmentPathways(appPathway, topicId)) {
      set.add(pathway);
    }
    if (appPathway === "primary-pe") {
      set.add("secondary-pe");
    }
  }
  return [...set];
}

export function getMatchingAppPathwaysForOutcome(
  outcome: LearningOutcome,
  appPathways: AppPathwayId[],
  topicId?: string,
  yearGroup?: string
): AppPathwayId[] {
  return appPathways.filter((appPathway) => {
    if (outcomeMatchesAppPathwayForPrimary(outcome, appPathway, yearGroup)) {
      return true;
    }
    return getAlignmentPathways(appPathway, topicId ?? outcome.topicIds[0] ?? "").includes(
      outcome.pathwayId
    );
  });
}
