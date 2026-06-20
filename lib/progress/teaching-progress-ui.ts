import type { CalendarEntry, LessonPlan, SchemeOfWork } from "@/lib/types";
import {
  buildCurriculumAnalytics,
  type CurriculumAnalyticsReport,
} from "@/src/lib/intelligence/analytics/coverage-analytics";

export type CurriculumHealthStatus = "at_risk" | "developing" | "on_track" | "excellent";

export interface CurriculumHealthScore {
  deliveredPercent: number;
  status: CurriculumHealthStatus;
  label: string;
  explanation: string;
  variant: "rose" | "amber" | "blue" | "green";
}

export interface TopicCoverageRow {
  id: string;
  topic: string;
  planned: number;
  delivered: number;
  remaining: number;
  total: number;
  coveragePercent: number;
}

export interface PriorityTopic {
  id: string;
  topic: string;
  coveragePercent: number;
  remaining: number;
}

const HEALTH_EXPLANATIONS: Record<CurriculumHealthStatus, string> = {
  at_risk:
    "Significant curriculum coverage is still outstanding. Focus on planning and delivering core topics.",
  developing:
    "You have started delivering curriculum content but significant coverage remains.",
  on_track: "Good progress across your curriculum. Continue delivering planned outcomes.",
  excellent:
    "Strong curriculum coverage across your teaching. Maintain balance across any remaining topics.",
};

export function getCurriculumHealthScore(deliveredPercent: number): CurriculumHealthScore {
  const safe = Math.max(0, Math.min(100, Math.round(deliveredPercent)));

  if (safe <= 25) {
    return {
      deliveredPercent: safe,
      status: "at_risk",
      label: "At Risk",
      explanation: HEALTH_EXPLANATIONS.at_risk,
      variant: "rose",
    };
  }
  if (safe <= 60) {
    return {
      deliveredPercent: safe,
      status: "developing",
      label: "Developing",
      explanation: HEALTH_EXPLANATIONS.developing,
      variant: "amber",
    };
  }
  if (safe <= 85) {
    return {
      deliveredPercent: safe,
      status: "on_track",
      label: "On Track",
      explanation: HEALTH_EXPLANATIONS.on_track,
      variant: "blue",
    };
  }
  return {
    deliveredPercent: safe,
    status: "excellent",
    label: "Excellent Coverage",
    explanation: HEALTH_EXPLANATIONS.excellent,
    variant: "green",
  };
}

export function buildTeachingProgressReports(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[]
): {
  taught: CurriculumAnalyticsReport;
  planned: CurriculumAnalyticsReport;
  remaining: CurriculumAnalyticsReport;
} {
  return {
    taught: buildCurriculumAnalytics(lessons, schemes, undefined, "taught", calendar),
    planned: buildCurriculumAnalytics(lessons, schemes, undefined, "planned", calendar),
    remaining: buildCurriculumAnalytics(lessons, schemes, undefined, "remaining", calendar),
  };
}

export function buildTopicCoverageRows(
  taught: CurriculumAnalyticsReport,
  planned: CurriculumAnalyticsReport
): TopicCoverageRow[] {
  const plannedByTopic = new Map(
    planned.byTopic.map((slice) => [slice.id, slice.modeCount ?? 0])
  );

  return taught.byTopic.map((slice) => {
    const delivered = slice.modeCount ?? 0;
    const total = slice.totalOutcomes;
    const plannedCount = plannedByTopic.get(slice.id) ?? 0;
    const remaining = Math.max(0, total - delivered);
    const coveragePercent = total > 0 ? Math.round((delivered / total) * 100) : 0;

    return {
      id: slice.id,
      topic: slice.label,
      planned: plannedCount,
      delivered,
      remaining,
      total,
      coveragePercent,
    };
  });
}

export function buildImmediatePriorities(rows: TopicCoverageRow[], limit = 5): PriorityTopic[] {
  return [...rows]
    .filter((row) => row.total > 0 && row.remaining > 0)
    .sort((a, b) => a.coveragePercent - b.coveragePercent || b.remaining - a.remaining)
    .slice(0, limit)
    .map((row) => ({
      id: row.id,
      topic: row.topic,
      coveragePercent: row.coveragePercent,
      remaining: row.remaining,
    }));
}

export function buildTeachingInsights(
  taught: CurriculumAnalyticsReport,
  planned: CurriculumAnalyticsReport,
  lessons: LessonPlan[],
  schemes: SchemeOfWork[]
): string[] {
  const insights: string[] = [];

  for (const label of taught.missingAreas.slice(0, 2)) {
    insights.push(`${label} has not yet been planned.`);
  }

  for (const slice of taught.overrepresented.slice(0, 2)) {
    insights.push(`You have strong coverage in ${slice.label}.`);
  }

  if (
    taught.summary.taughtOutcomeIds === 0 &&
    (lessons.length > 0 || schemes.length > 0)
  ) {
    insights.push("No outcomes have been delivered this term.");
  }

  if (planned.summary.plannedOutcomeIds === 0 && lessons.length === 0 && schemes.length === 0) {
    insights.push("Start by creating a lesson or scheme to track curriculum coverage.");
  }

  const lowFitness = taught.byFitnessStrand.filter(
    (s) => s.totalOutcomes >= 2 && s.coveragePercent < 30
  );
  if (lowFitness.length > 0) {
    insights.push("Health related topics remain under represented.");
  }

  const teamGames = taught.byLearningArea.find((s) =>
    s.label.toLowerCase().includes("team")
  );
  if (teamGames && teamGames.coveragePercent >= 55) {
    insights.push("You have strong coverage in Team Games.");
  }

  const highRemaining = taught.summary.remainingOutcomeIds;
  if (highRemaining > 50 && taught.summary.taughtOutcomeIds > 0) {
    insights.push(
      `${highRemaining} outcomes remain to be delivered across your curriculum.`
    );
  }

  return [...new Set(insights)].slice(0, 5);
}

export function hasTeachingProgressData(lessons: LessonPlan[], schemes: SchemeOfWork[]): boolean {
  return lessons.length > 0 || schemes.length > 0;
}

export function computeDeliveredPercent(taught: CurriculumAnalyticsReport): number {
  const { taughtOutcomeIds, totalCurriculumOutcomes } = taught.summary;
  if (totalCurriculumOutcomes === 0) return 0;
  return Math.round((taughtOutcomeIds / totalCurriculumOutcomes) * 100);
}
