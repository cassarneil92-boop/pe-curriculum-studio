import type { LessonPlan, SchemeOfWork } from "@/lib/types";
import type { LearningOutcome } from "@/src/lib/curriculum/types";
import { getPlanningOutcomes } from "@/src/lib/curriculum/planning";
import { getValueById } from "@/src/lib/curriculum/registry";
import { getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import {
  getLearningAreaForCode,
  getLearningAreaForTopic,
  getLearningAreaLabel,
  type LearningAreaId,
} from "../frameworks/learning-areas";
import { getFitnessStrandForCode, getFitnessStrandLabel, type FitnessStrandId } from "../frameworks/fitness-strands";

export interface CoverageSlice {
  id: string;
  label: string;
  totalOutcomes: number;
  taughtOutcomes: number;
  coveragePercent: number;
  status: "strong" | "moderate" | "weak" | "missing";
}

export interface CurriculumAnalyticsReport {
  generatedAt: string;
  summary: {
    totalCurriculumOutcomes: number;
    taughtOutcomeIds: number;
    overallCoveragePercent: number;
    lessonsAnalysed: number;
    schemesAnalysed: number;
  };
  byTopic: CoverageSlice[];
  byPathway: CoverageSlice[];
  byYearGroup: CoverageSlice[];
  bySkill: CoverageSlice[];
  byLearningArea: CoverageSlice[];
  byHolisticDevelopment: CoverageSlice[];
  byFitnessStrand: CoverageSlice[];
  byValues: CoverageSlice[];
  overrepresented: CoverageSlice[];
  underrepresented: CoverageSlice[];
  missingAreas: string[];
}

function collectTaughtOutcomeIds(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[]
): Set<string> {
  const ids = new Set<string>();
  for (const lesson of lessons) {
    for (const id of lesson.selectedLearningOutcomeIds ?? []) {
      if (id) ids.add(id);
    }
  }
  for (const scheme of schemes) {
    for (const lesson of scheme.lessons ?? []) {
      for (const id of lesson.learningOutcomeIds ?? []) {
        if (id) ids.add(id);
      }
    }
  }
  return ids;
}

function coverageStatus(percent: number): CoverageSlice["status"] {
  if (percent >= 70) return "strong";
  if (percent >= 40) return "moderate";
  if (percent > 0) return "weak";
  return "missing";
}

function buildSlice(
  id: string,
  label: string,
  outcomes: LearningOutcome[],
  taught: Set<string>
): CoverageSlice {
  const total = outcomes.length;
  const taughtCount = outcomes.filter((o) => taught.has(o.id)).length;
  const coveragePercent = total > 0 ? Math.round((taughtCount / total) * 100) : 0;
  return {
    id,
    label,
    totalOutcomes: total,
    taughtOutcomes: taughtCount,
    coveragePercent,
    status: coverageStatus(coveragePercent),
  };
}

export function buildCurriculumAnalytics(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  curriculumOutcomes: LearningOutcome[] = getPlanningOutcomes()
): CurriculumAnalyticsReport {
  const taught = collectTaughtOutcomeIds(lessons, schemes);

  const byTopic = new Map<string, LearningOutcome[]>();
  const byPathway = new Map<string, LearningOutcome[]>();
  const byYear = new Map<string, LearningOutcome[]>();
  const bySkill = new Map<string, LearningOutcome[]>();
  const byLearningArea = new Map<LearningAreaId, LearningOutcome[]>();
  const byHolistic = new Map<string, LearningOutcome[]>();
  const byFitness = new Map<FitnessStrandId, LearningOutcome[]>();
  const byValues = new Map<string, LearningOutcome[]>();

  for (const outcome of curriculumOutcomes) {
    for (const topicId of outcome.topicIds) {
      const list = byTopic.get(topicId) ?? [];
      list.push(outcome);
      byTopic.set(topicId, list);
    }

    const pathwayList = byPathway.get(outcome.pathwayId) ?? [];
    pathwayList.push(outcome);
    byPathway.set(outcome.pathwayId, pathwayList);

    for (const yg of outcome.yearGroups ?? []) {
      const list = byYear.get(yg) ?? [];
      list.push(outcome);
      byYear.set(yg, list);
    }

    for (const skillId of outcome.skillIds) {
      const list = bySkill.get(skillId) ?? [];
      list.push(outcome);
      bySkill.set(skillId, list);
    }

    for (const topicId of outcome.topicIds) {
      const area = getLearningAreaForTopic(topicId) ?? getLearningAreaForCode(outcome.code);
      if (area) {
        const list = byLearningArea.get(area) ?? [];
        list.push(outcome);
        byLearningArea.set(area, list);
      }
    }

    if (
      outcome.topicIds.some((t) => t.toLowerCase() === "holistic-development") ||
      outcome.code.toUpperCase().startsWith("HD")
    ) {
      const list = byHolistic.get("holistic-development") ?? [];
      list.push(outcome);
      byHolistic.set("holistic-development", list);
    }

    const fitnessStrand = getFitnessStrandForCode(outcome.code);
    if (fitnessStrand) {
      const list = byFitness.get(fitnessStrand) ?? [];
      list.push(outcome);
      byFitness.set(fitnessStrand, list);
    }

    for (const valueId of outcome.valueIds ?? []) {
      const list = byValues.get(valueId) ?? [];
      list.push(outcome);
      byValues.set(valueId, list);
    }
  }

  const sliceFromMap = (
    map: Map<string, LearningOutcome[]>,
    labelFn: (id: string) => string
  ): CoverageSlice[] =>
    [...map.entries()]
      .map(([id, outcomes]) => buildSlice(id, labelFn(id), outcomes, taught))
      .sort((a, b) => b.coveragePercent - a.coveragePercent);

  const topicSlices = sliceFromMap(byTopic, getPlanningTopicDisplayName);
  const overallTaught = [...taught].filter((id) =>
    curriculumOutcomes.some((o) => o.id === id)
  ).length;

  const overrepresented = topicSlices.filter(
    (s) => s.coveragePercent >= 70 && s.taughtOutcomes >= 3
  );
  const underrepresented = topicSlices.filter(
    (s) => s.totalOutcomes >= 3 && s.coveragePercent < 30
  );

  const missingAreas = topicSlices
    .filter((s) => s.totalOutcomes >= 2 && s.coveragePercent === 0)
    .map((s) => s.label);

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalCurriculumOutcomes: curriculumOutcomes.length,
      taughtOutcomeIds: overallTaught,
      overallCoveragePercent:
        curriculumOutcomes.length > 0
          ? Math.round((overallTaught / curriculumOutcomes.length) * 100)
          : 0,
      lessonsAnalysed: lessons.length,
      schemesAnalysed: schemes.length,
    },
    byTopic: topicSlices,
    byPathway: sliceFromMap(byPathway, (id) => id),
    byYearGroup: sliceFromMap(byYear, (id) => id),
    bySkill: sliceFromMap(bySkill, (id) => id),
    byLearningArea: [...byLearningArea.entries()].map(([id, outcomes]) =>
      buildSlice(id, getLearningAreaLabel(id), outcomes, taught)
    ),
    byHolisticDevelopment: sliceFromMap(byHolistic, () => "Holistic Development"),
    byFitnessStrand: [...byFitness.entries()].map(([id, outcomes]) =>
      buildSlice(id, getFitnessStrandLabel(id), outcomes, taught)
    ),
    byValues: sliceFromMap(byValues, (id) => getValueById(id)?.description ?? id),
    overrepresented,
    underrepresented,
    missingAreas,
  };
}
