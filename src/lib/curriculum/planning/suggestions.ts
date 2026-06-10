import type { PathwayId as AppPathwayId } from "@/lib/types";
import type { TeacherContextSnapshot } from "@/lib/teacher-context";
import { appPathwayToCurriculum } from "@/lib/scheme-builder/pathway-map";
import { alignCurriculumFromInput } from "../alignment";
import type { LearningOutcome } from "../types";
import { filterPlanningOutcomes } from "./planning-outcomes";

export interface PlanningOutcomeSuggestions {
  strict: LearningOutcome[];
  additional: LearningOutcome[];
  allSuggestedIds: Set<string>;
}

export function getPlanningOutcomeSuggestions(input: {
  appPathways: AppPathwayId[];
  yearGroup: string;
  topicId: string;
  skillId: string;
  context: TeacherContextSnapshot;
}): PlanningOutcomeSuggestions {
  const { appPathways, yearGroup, topicId, skillId, context } = input;
  if (!topicId || !skillId || appPathways.length === 0) {
    return { strict: [], additional: [], allSuggestedIds: new Set() };
  }

  const primaryAppPathway = appPathways[0];
  const primaryCurriculumPathway = appPathwayToCurriculum(primaryAppPathway);

  let strict: LearningOutcome[] = [];
  if (primaryCurriculumPathway) {
    const alignment = alignCurriculumFromInput({
      pathway: primaryCurriculumPathway,
      yearGroup: yearGroup || undefined,
      topic: topicId,
      skill: skillId,
    });
    strict = alignment?.learningOutcomes ?? [];
  }

  const strictIds = new Set(strict.map((outcome) => outcome.id));

  const additional = filterPlanningOutcomes({
    appPathways,
    yearGroup,
    topicId,
    skillId,
    context,
  }).filter((outcome) => !strictIds.has(outcome.id));

  const allSuggestedIds = new Set([
    ...strict.map((o) => o.id),
    ...additional.map((o) => o.id),
  ]);

  return { strict, additional, allSuggestedIds };
}

export function pruneSelectedOutcomeIds(
  selectedIds: string[],
  validIds: Set<string>
): { kept: string[]; removed: string[] } {
  const kept = selectedIds.filter((id) => validIds.has(id));
  const removed = selectedIds.filter((id) => !validIds.has(id));
  return { kept, removed };
}
