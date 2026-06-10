import type { PathwayId as AppPathwayId } from "@/lib/types";
import type { TeacherContextSnapshot } from "@/lib/teacher-context";
import type { ImportedPathwayId } from "@/lib/teacher-context/types";
import { yearGroupMatchesFilter } from "@/lib/year-groups";
import type { LearningOutcome, PathwayId as CurriculumPathwayId } from "@/src/lib/curriculum";

export type SchemeVisibilityFocus = {
  appPathway: AppPathwayId;
  topicId: string;
};

const CURRICULUM_TO_IMPORTED: Partial<Record<CurriculumPathwayId, ImportedPathwayId>> = {
  "early-years-pe": "early-years-pe",
  "primary-pe": "primary-pe",
  "secondary-pe": "secondary-pe",
  "pe-option-sec": "pe-option-sec",
  "alp-pe": "alp-pe",
  "alp-sports-vocational": "alp-sports-vocational",
  "fitness-curriculum": "fitness-curriculum",
};

export function isCurriculumOutcomeVisible(
  outcome: LearningOutcome,
  context: TeacherContextSnapshot
): boolean {
  if (context.exploreAllEnabled) return true;

  const importedPathway = CURRICULUM_TO_IMPORTED[outcome.pathwayId];
  if (importedPathway && !context.visibleImportedPathways.includes(importedPathway)) {
    return false;
  }

  if (context.visibleYearGroupIds.length === 0) return true;
  if (!outcome.yearGroups || outcome.yearGroups.length === 0) return true;

  return context.visibleYearGroupIds.some((yearId) =>
    yearGroupMatchesFilter(outcome.yearGroups, yearId)
  );
}

function isFitnessUnitUnderGeneralPe(
  outcome: LearningOutcome,
  context: TeacherContextSnapshot,
  focus: SchemeVisibilityFocus
): boolean {
  return (
    focus.topicId === "fitness" &&
    outcome.pathwayId === "fitness-curriculum" &&
    (focus.appPathway === "general-pe" || focus.appPathway === "sport-values") &&
    context.visibleAppPathways.includes(focus.appPathway)
  );
}

export function isSchemeCurriculumOutcomeVisible(
  outcome: LearningOutcome,
  context: TeacherContextSnapshot,
  focus?: SchemeVisibilityFocus
): boolean {
  if (context.exploreAllEnabled) return true;

  if (focus && isFitnessUnitUnderGeneralPe(outcome, context, focus)) {
    if (context.visibleYearGroupIds.length === 0) return true;
    if (!outcome.yearGroups || outcome.yearGroups.length === 0) return true;
    return context.visibleYearGroupIds.some((yearId) =>
      yearGroupMatchesFilter(outcome.yearGroups, yearId)
    );
  }

  return isCurriculumOutcomeVisible(outcome, context);
}

export function filterVisibleCurriculumOutcomes(
  outcomes: LearningOutcome[],
  context: TeacherContextSnapshot,
  focus?: SchemeVisibilityFocus
): LearningOutcome[] {
  return outcomes.filter((outcome) =>
    isSchemeCurriculumOutcomeVisible(outcome, context, focus)
  );
}
