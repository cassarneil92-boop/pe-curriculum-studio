import type {
  AcademicCalendarSettings,
  AcademicTerm,
  CalendarEntry,
  LessonPlan,
  SchemeOfWork,
  TeacherProfile,
} from "@/lib/types";
import { getPlanningTerms } from "@/lib/planning/terms";
import {
  resolveLessonTaughtOutcomeIds,
  resolveSchemeLessonTaughtOutcomeIds,
} from "@/lib/progress/delivery";
import { collectPlannedOutcomeIds } from "@/lib/progress/coverage";
import type { CurriculumAnalyticsReport } from "@/src/lib/intelligence/analytics/coverage-analytics";
import type { LearningAreaId } from "@/src/lib/intelligence/frameworks/learning-areas";
import {
  getLearningAreaForCode,
  getLearningAreaForTopic,
  getLearningAreaLabel,
  LEARNING_AREAS,
} from "@/src/lib/intelligence/frameworks/learning-areas";
import { getPlanningOutcomes } from "@/src/lib/curriculum/planning";
import type { LearningOutcome } from "@/src/lib/curriculum/types";
import {
  buildImmediatePriorities,
  buildTeachingInsights,
  buildTeachingProgressReports,
  buildTopicCoverageRows,
  computeDeliveredPercent,
  type PriorityTopic,
  type TopicCoverageRow,
} from "./teaching-progress-ui";

export interface CoverageSummaryKpis {
  totalOutcomes: number;
  plannedOutcomes: number;
  deliveredOutcomes: number;
  remainingOutcomes: number;
  overallCoveragePercent: number;
}

export type HeatmapCoverageStatus = "strong" | "moderate" | "weak" | "missing";

export interface LearningAreaTermCell {
  learningAreaId: LearningAreaId;
  learningAreaLabel: string;
  termId: string;
  termName: string;
  delivered: number;
  total: number;
  coveragePercent: number;
  status: HeatmapCoverageStatus;
}

export interface CurriculumGapItem {
  id: string;
  message: string;
  priority: number;
}

export interface CurriculumIntelligenceReport {
  generatedAt: string;
  kpis: CoverageSummaryKpis;
  taught: CurriculumAnalyticsReport;
  planned: CurriculumAnalyticsReport;
  topicRows: TopicCoverageRow[];
  heatmap: LearningAreaTermCell[];
  termNames: string[];
  gaps: CurriculumGapItem[];
  insights: string[];
  priorities: PriorityTopic[];
}

function heatmapStatus(percent: number): HeatmapCoverageStatus {
  if (percent >= 70) return "strong";
  if (percent >= 40) return "moderate";
  if (percent > 0) return "weak";
  return "missing";
}

export function resolveTermNameForDate(date: string, terms: AcademicTerm[]): string {
  const day = date.slice(0, 10);
  for (const term of terms) {
    if (day >= term.startDate && day <= term.endDate) return term.name;
  }
  return terms[0]?.name ?? "Term 1";
}

export function collectTermTaughtOutcomeIds(
  termName: string,
  terms: AcademicTerm[],
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[]
): Set<string> {
  const ids = new Set<string>();

  for (const scheme of schemes) {
    if (scheme.term !== termName) continue;
    for (const lesson of scheme.lessons ?? []) {
      for (const id of resolveSchemeLessonTaughtOutcomeIds(lesson)) {
        ids.add(id);
      }
    }
  }

  for (const lesson of lessons) {
    if (resolveTermNameForDate(lesson.date, terms) !== termName) continue;
    for (const id of resolveLessonTaughtOutcomeIds(lesson)) {
      ids.add(id);
    }
  }

  for (const entry of calendar) {
    if (entry.deliveryStatus !== "delivered") continue;
    if (entry.linkedLessonId || entry.linkedSchemeId) continue;
    if (resolveTermNameForDate(entry.startDate, terms) !== termName) continue;
    for (const id of entry.loIds ?? []) {
      if (id) ids.add(id);
    }
  }

  return ids;
}

function groupOutcomesByLearningArea(
  outcomes: LearningOutcome[]
): Map<LearningAreaId, LearningOutcome[]> {
  const map = new Map<LearningAreaId, LearningOutcome[]>();

  for (const outcome of outcomes) {
    let area: LearningAreaId | null = null;
    for (const topicId of outcome.topicIds) {
      area = getLearningAreaForTopic(topicId) ?? getLearningAreaForCode(outcome.code);
      if (area) break;
    }
    area ??= getLearningAreaForCode(outcome.code);
    if (!area) continue;

    const list = map.get(area) ?? [];
    list.push(outcome);
    map.set(area, list);
  }

  return map;
}

export function buildLearningAreaTermHeatmap(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[],
  academicCalendar?: AcademicCalendarSettings | null,
  curriculumOutcomes: LearningOutcome[] = getPlanningOutcomes()
): { cells: LearningAreaTermCell[]; termNames: string[] } {
  const terms = getPlanningTerms(academicCalendar);
  const termNames = terms.map((t) => t.name);
  const byArea = groupOutcomesByLearningArea(curriculumOutcomes);
  const cells: LearningAreaTermCell[] = [];

  for (const areaDef of LEARNING_AREAS) {
    const areaOutcomes = byArea.get(areaDef.id) ?? [];
    if (areaOutcomes.length === 0) continue;

    const total = areaOutcomes.length;

    for (const term of terms) {
      const termTaught = collectTermTaughtOutcomeIds(
        term.name,
        terms,
        lessons,
        schemes,
        calendar
      );
      const delivered = areaOutcomes.filter((o) => termTaught.has(o.id)).length;
      const coveragePercent = total > 0 ? Math.round((delivered / total) * 100) : 0;

      cells.push({
        learningAreaId: areaDef.id,
        learningAreaLabel: getLearningAreaLabel(areaDef.id),
        termId: term.id,
        termName: term.name,
        delivered,
        total,
        coveragePercent,
        status: heatmapStatus(coveragePercent),
      });
    }
  }

  return { cells, termNames };
}

export function buildCoverageSummaryKpis(
  taught: CurriculumAnalyticsReport,
  planned: CurriculumAnalyticsReport
): CoverageSummaryKpis {
  return {
    totalOutcomes: taught.summary.totalCurriculumOutcomes,
    plannedOutcomes: planned.summary.plannedOutcomeIds,
    deliveredOutcomes: taught.summary.taughtOutcomeIds,
    remainingOutcomes: taught.summary.remainingOutcomeIds,
    overallCoveragePercent: computeDeliveredPercent(taught),
  };
}

export function buildCurriculumGapItems(
  taught: CurriculumAnalyticsReport,
  planned: CurriculumAnalyticsReport,
  lessons: LessonPlan[],
  schemes: SchemeOfWork[]
): CurriculumGapItem[] {
  const gaps: CurriculumGapItem[] = [];
  const plannedIds = collectPlannedOutcomeIds(lessons, schemes);

  for (const slice of planned.byTopic) {
    if (slice.totalOutcomes < 2) continue;
    const plannedCount = slice.modeCount ?? 0;
    if (plannedCount === 0) {
      gaps.push({
        id: `not-planned-${slice.id}`,
        message: `No ${slice.label} lessons planned`,
        priority: 1,
      });
    }
  }

  for (const slice of taught.underrepresented) {
    gaps.push({
      id: `under-${slice.id}`,
      message: `${slice.label} underrepresented`,
      priority: 2,
    });
  }

  for (const slice of taught.byTopic) {
    if (slice.totalOutcomes < 2) continue;
    const delivered = slice.modeCount ?? 0;
    const hasPlanned = planned.byTopic.some(
      (p) => p.id === slice.id && (p.modeCount ?? 0) > 0
    );
    if (delivered === 0 && hasPlanned) {
      gaps.push({
        id: `not-delivered-${slice.id}`,
        message: `${slice.label} not yet delivered`,
        priority: 3,
      });
    }
  }

  for (const label of taught.missingAreas) {
    if (!gaps.some((g) => g.message.toLowerCase().includes(label.toLowerCase()))) {
      gaps.push({
        id: `missing-${label}`,
        message: `${label} has no delivery coverage`,
        priority: 4,
      });
    }
  }

  if (plannedIds.size === 0 && (lessons.length > 0 || schemes.length > 0)) {
    gaps.push({
      id: "no-planned-outcomes",
      message: "No learning outcomes linked to your lessons or schemes",
      priority: 0,
    });
  }

  return gaps
    .sort((a, b) => a.priority - b.priority || a.message.localeCompare(b.message))
    .slice(0, 8);
}

export function buildIntelligenceInsights(
  taught: CurriculumAnalyticsReport,
  planned: CurriculumAnalyticsReport,
  lessons: LessonPlan[],
  schemes: SchemeOfWork[]
): string[] {
  const insights = buildTeachingInsights(taught, planned, lessons, schemes);

  for (const slice of taught.byLearningArea) {
    if (slice.totalOutcomes >= 3 && slice.coveragePercent >= 40) {
      insights.push(
        `You have delivered ${slice.coveragePercent}% of ${slice.label} outcomes.`
      );
    }
  }

  for (const slice of taught.byLearningArea) {
    if (slice.totalOutcomes >= 3 && slice.coveragePercent < 30) {
      insights.push(
        `${slice.label} is significantly below average coverage.`
      );
    }
  }

  for (const slice of taught.byPathway) {
    if (slice.totalOutcomes >= 5 && slice.coveragePercent >= 50) {
      insights.push(
        `${slice.label} pathway coverage is at ${slice.coveragePercent}%.`
      );
    }
  }

  for (const slice of taught.byYearGroup) {
    if (slice.totalOutcomes >= 5 && slice.coveragePercent < 25) {
      insights.push(
        `Year ${slice.label} outcomes need more delivery attention (${slice.coveragePercent}% covered).`
      );
    }
  }

  for (const slice of taught.overrepresented.slice(0, 1)) {
    insights.push(
      `${slice.label} may be over-taught relative to other topics (${slice.coveragePercent}% coverage).`
    );
  }

  return [...new Set(insights)].slice(0, 8);
}

export function buildCurriculumIntelligenceReport(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[],
  academicCalendar?: AcademicCalendarSettings | null
): CurriculumIntelligenceReport {
  const { taught, planned } = buildTeachingProgressReports(lessons, schemes, calendar);
  const topicRows = buildTopicCoverageRows(taught, planned);
  const { cells, termNames } = buildLearningAreaTermHeatmap(
    lessons,
    schemes,
    calendar,
    academicCalendar
  );

  return {
    generatedAt: new Date().toISOString(),
    kpis: buildCoverageSummaryKpis(taught, planned),
    taught,
    planned,
    topicRows,
    heatmap: cells,
    termNames,
    gaps: buildCurriculumGapItems(taught, planned, lessons, schemes),
    insights: buildIntelligenceInsights(taught, planned, lessons, schemes),
    priorities: buildImmediatePriorities(topicRows),
  };
}

export function getTopTopicCoverageRows(
  rows: TopicCoverageRow[],
  limit = 12
): TopicCoverageRow[] {
  return [...rows]
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total || a.topic.localeCompare(b.topic))
    .slice(0, limit);
}

export interface IntelligenceExportContext {
  teacher: TeacherProfile;
  schoolLabel: string;
  collegeLabel: string;
}

export function buildIntelligenceExportMeta(
  teacher: TeacherProfile,
  schoolLabel: string,
  collegeLabel: string
): IntelligenceExportContext {
  return { teacher, schoolLabel, collegeLabel };
}
