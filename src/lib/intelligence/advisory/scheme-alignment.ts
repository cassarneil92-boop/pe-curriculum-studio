import type { SchemeOfWork } from "@/lib/types";
import {
  filterPlanningOutcomes,
  getPlanningOutcomes,
  getPlanningOutcomeSuggestions,
} from "@/src/lib/curriculum/planning";
import type { LearningOutcome } from "@/src/lib/curriculum/types";
import { getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import { resolveSchemeAppPathways } from "@/lib/scheme-builder/curriculum-options";
import { resolveSchemeAdvisorySkillId } from "@/lib/scheme-builder/lesson-skills";
import type { TeacherContextSnapshot } from "@/lib/teacher-context";
export interface AdvisoryAlignmentReport {
  score: number;
  coveredOutcomes: LearningOutcome[];
  uncoveredOutcomes: LearningOutcome[];
  suggestedOutcomes: LearningOutcome[];
  missingHolistic: LearningOutcome[];
  missingValues: LearningOutcome[];
  missingFitness: LearningOutcome[];
  recommendations: string[];
}

function isHolisticOutcome(outcome: LearningOutcome): boolean {
  return (
    outcome.topicIds.some((t) => t.toLowerCase() === "holistic-development") ||
    outcome.code.toUpperCase().startsWith("HD")
  );
}

function isFitnessOutcome(outcome: LearningOutcome): boolean {
  return (
    outcome.topicIds.some((t) => t.toLowerCase() === "fitness") ||
    /^F\d+\./i.test(outcome.code)
  );
}

function isValuesOutcome(outcome: LearningOutcome): boolean {
  return (outcome.valueIds?.length ?? 0) > 0;
}

export function buildSchemeAdvisoryAlignment(
  scheme: Pick<
    SchemeOfWork,
    "pathway" | "selectedPathways" | "yearGroup" | "topicId" | "skillId" | "lessons"
  >,
  context: TeacherContextSnapshot
): AdvisoryAlignmentReport {
  const appPathways = resolveSchemeAppPathways(scheme.selectedPathways, scheme.pathway);
  const selectedIds = new Set(
    scheme.lessons.flatMap((lesson) => lesson.learningOutcomeIds ?? [])
  );

  const advisorySkillId = resolveSchemeAdvisorySkillId(scheme.lessons, scheme.skillId);

  const relevant = filterPlanningOutcomes({
    appPathways,
    yearGroup: scheme.yearGroup,
    topicId: scheme.topicId,
    skillId: advisorySkillId,
    context,
  });

  const suggestions = getPlanningOutcomeSuggestions({
    appPathways,
    yearGroup: scheme.yearGroup,
    topicId: scheme.topicId,
    skillId: advisorySkillId || scheme.skillId,
    context,
  });

  const allSuggested = [...suggestions.strict, ...suggestions.additional];
  const covered = relevant.filter((o) => selectedIds.has(o.id));
  const uncovered = relevant.filter((o) => !selectedIds.has(o.id));
  const suggested = allSuggested.filter((o) => !selectedIds.has(o.id));

  const holisticPool = getPlanningOutcomes().filter(isHolisticOutcome);
  const fitnessPool = getPlanningOutcomes().filter(isFitnessOutcome);
  const valuesPool = getPlanningOutcomes().filter(isValuesOutcome);

  const missingHolistic = holisticPool.filter((o) => !selectedIds.has(o.id)).slice(0, 5);
  const missingFitness = fitnessPool.filter((o) => !selectedIds.has(o.id)).slice(0, 5);
  const missingValues = valuesPool.filter((o) => !selectedIds.has(o.id)).slice(0, 5);

  const focusCoverage =
    relevant.length > 0 ? Math.round((covered.length / relevant.length) * 100) : 0;
  const hdBonus = missingHolistic.length === 0 ? 10 : 0;
  const valuesBonus = missingValues.length === 0 ? 5 : 0;
  const score = Math.min(100, Math.round(focusCoverage * 0.85 + hdBonus + valuesBonus));

  const recommendations: string[] = [];
  const topicLabel = getPlanningTopicDisplayName(scheme.topicId);

  if (uncovered.length > 0) {
    recommendations.push(
      `${uncovered.length} ${topicLabel} outcome${uncovered.length === 1 ? "" : "s"} in your focus area are not yet in this scheme.`
    );
  }
  if (missingHolistic.length > 0) {
    recommendations.push("Consider adding holistic development outcomes (team roles, responsibility, wellbeing).");
  }
  if (missingValues.length > 0) {
    recommendations.push("Add value-based outcomes such as respect, inclusion, or fair play.");
  }
  if (missingFitness.length > 0 && scheme.topicId !== "fitness") {
    recommendations.push("Fitness strand outcomes could be integrated across this unit.");
  }
  if (scheme.lessons.filter((l) => l.learningOutcomeIds.length === 0).length > 0) {
    recommendations.push("Some lessons have no learning outcomes selected yet.");
  }

  return {
    score,
    coveredOutcomes: covered,
    uncoveredOutcomes: uncovered,
    suggestedOutcomes: suggested,
    missingHolistic,
    missingValues,
    missingFitness,
    recommendations,
  };
}
