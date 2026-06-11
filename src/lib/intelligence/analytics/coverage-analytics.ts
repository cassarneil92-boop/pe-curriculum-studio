import type { CalendarEntry, LessonPlan, SchemeOfWork } from "@/lib/types";
import {
  collectPlannedOutcomeIds,
  collectRemainingOutcomeIds,
  collectTaughtOutcomeIds,
} from "@/lib/progress/coverage";
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

export type CoverageMode = "planned" | "taught" | "remaining";

export interface CoverageSlice {
  id: string;
  label: string;
  totalOutcomes: number;
  taughtOutcomes: number;
  coveragePercent: number;
  status: "strong" | "moderate" | "weak" | "missing";
  /** Mode-specific count shown in the bar label. */
  modeCount?: number;
}

export interface CurriculumAnalyticsReport {
  generatedAt: string;
  mode: CoverageMode;
  summary: {
    totalCurriculumOutcomes: number;
    plannedOutcomeIds: number;
    taughtOutcomeIds: number;
    remainingOutcomeIds: number;
    modeOutcomeIds: number;
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
  active: Set<string>,
  mode: CoverageMode
): CoverageSlice {
  const total = outcomes.length;
  const modeCount = outcomes.filter((o) => active.has(o.id)).length;
  const coveragePercent = total > 0 ? Math.round((modeCount / total) * 100) : 0;
  return {
    id,
    label,
    totalOutcomes: total,
    taughtOutcomes: modeCount,
    coveragePercent,
    status: coverageStatus(coveragePercent),
    modeCount,
  };
}

function resolveActiveOutcomeSet(
  mode: CoverageMode,
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[],
  curriculumOutcomes: LearningOutcome[]
): Set<string> {
  const planned = collectPlannedOutcomeIds(lessons, schemes);
  const taught = collectTaughtOutcomeIds(lessons, schemes, calendar);
  const allIds = curriculumOutcomes.map((o) => o.id);

  if (mode === "planned") return planned;
  if (mode === "taught") return taught;
  return collectRemainingOutcomeIds(allIds, taught);
}

export function buildCurriculumAnalytics(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  curriculumOutcomes: LearningOutcome[] = getPlanningOutcomes(),
  mode: CoverageMode = "taught",
  calendar: CalendarEntry[] = []
): CurriculumAnalyticsReport {
  const planned = collectPlannedOutcomeIds(lessons, schemes);
  const taught = collectTaughtOutcomeIds(lessons, schemes, calendar);
  const allIds = curriculumOutcomes.map((o) => o.id);
  const remaining = collectRemainingOutcomeIds(allIds, taught);
  const active = resolveActiveOutcomeSet(mode, lessons, schemes, calendar, curriculumOutcomes);

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
      .map(([id, outcomes]) => buildSlice(id, labelFn(id), outcomes, active, mode))
      .sort((a, b) => b.coveragePercent - a.coveragePercent);

  const topicSlices = sliceFromMap(byTopic, getPlanningTopicDisplayName);

  const modeCount = [...active].filter((id) =>
    curriculumOutcomes.some((o) => o.id === id)
  ).length;

  const overrepresented = topicSlices.filter(
    (s) => s.coveragePercent >= 70 && (s.modeCount ?? 0) >= 3
  );
  const underrepresented = topicSlices.filter(
    (s) => s.totalOutcomes >= 3 && s.coveragePercent < 30
  );

  const missingAreas = topicSlices
    .filter((s) => s.totalOutcomes >= 2 && s.coveragePercent === 0)
    .map((s) => s.label);

  return {
    generatedAt: new Date().toISOString(),
    mode,
    summary: {
      totalCurriculumOutcomes: curriculumOutcomes.length,
      plannedOutcomeIds: [...planned].filter((id) =>
        curriculumOutcomes.some((o) => o.id === id)
      ).length,
      taughtOutcomeIds: [...taught].filter((id) =>
        curriculumOutcomes.some((o) => o.id === id)
      ).length,
      remainingOutcomeIds: [...remaining].filter((id) =>
        curriculumOutcomes.some((o) => o.id === id)
      ).length,
      modeOutcomeIds: modeCount,
      overallCoveragePercent:
        curriculumOutcomes.length > 0
          ? Math.round((modeCount / curriculumOutcomes.length) * 100)
          : 0,
      lessonsAnalysed: lessons.length,
      schemesAnalysed: schemes.length,
    },
    byTopic: topicSlices,
    byPathway: sliceFromMap(byPathway, (id) => id),
    byYearGroup: sliceFromMap(byYear, (id) => id),
    bySkill: sliceFromMap(bySkill, (id) => id),
    byLearningArea: [...byLearningArea.entries()].map(([id, outcomes]) =>
      buildSlice(id, getLearningAreaLabel(id), outcomes, active, mode)
    ),
    byHolisticDevelopment: sliceFromMap(byHolistic, () => "Holistic Development"),
    byFitnessStrand: [...byFitness.entries()].map(([id, outcomes]) =>
      buildSlice(id, getFitnessStrandLabel(id), outcomes, active, mode)
    ),
    byValues: sliceFromMap(byValues, (id) => getValueById(id)?.description ?? id),
    overrepresented,
    underrepresented,
    missingAreas,
  };
}
