import type { CurriculumCoverageDashboard } from "@/src/lib/curriculum/coverage/types";
import type { CurriculumAnalyticsReport } from "@/src/lib/intelligence/analytics/coverage-analytics";
import type { TopicCoverageRow } from "@/lib/progress/teaching-progress-ui";

export type CoverageAttentionStatus = "attention" | "strong" | "neutral";

export interface CoverageAttentionCard {
  id: string;
  title: string;
  reason: string;
  action: string;
  actionHref: string;
  status: CoverageAttentionStatus;
}

export interface CoverageTermFocusRow {
  area: string;
  planned: number;
  taught: number;
  remaining: number;
  status: string;
}

export interface CoverageRecommendation {
  id: string;
  message: string;
}

export interface CoverageTeacherReport {
  health: {
    visibleOutcomes: number;
    plannedOutcomes: number;
    taughtOutcomes: number;
    remainingOutcomes: number;
    statusLabel: string;
    percentage: number;
  };
  attentionAreas: CoverageAttentionCard[];
  strongAreas: CoverageAttentionCard[];
  termFocus: CoverageTermFocusRow[];
  recommendations: CoverageRecommendation[];
}

function healthStatusLabel(percent: number): string {
  if (percent >= 75) return "Strong";
  if (percent >= 45) return "Developing";
  if (percent >= 20) return "Needs attention";
  return "Getting started";
}

function topicActionHref(topic: string): string {
  const slug = topic.toLowerCase().replace(/\s+/g, "-");
  return `/schemes?topic=${encodeURIComponent(slug)}`;
}

export function buildCoverageTeacherReport(
  dashboard: CurriculumCoverageDashboard,
  taught: CurriculumAnalyticsReport,
  topicRows: TopicCoverageRow[]
): CoverageTeacherReport {
  const visibleOutcomes = dashboard.layerTotals.planningCatalogue;
  const plannedOutcomes = taught.summary.plannedOutcomeIds;
  const taughtOutcomes = taught.summary.taughtOutcomeIds;
  const remainingOutcomes = taught.summary.remainingOutcomeIds;
  const percentage =
    visibleOutcomes > 0 ? Math.round((taughtOutcomes / visibleOutcomes) * 100) : 0;

  const attentionFromGaps: CoverageAttentionCard[] = dashboard.catalogueGaps
    .slice(0, 3)
    .map((gap) => ({
      id: gap.id,
      title: gap.title,
      reason: gap.detail,
      action: "View outcomes",
      actionHref: "/curriculum-coverage?view=advanced",
      status: "attention" as const,
    }));

  const attentionFromTopics: CoverageAttentionCard[] = topicRows
    .filter((row) => row.remaining > 0 && row.coveragePercent < 50)
    .slice(0, 3)
    .map((row) => ({
      id: `topic-${row.id}`,
      title: row.topic,
      reason: `${row.remaining} outcomes still to teach in this topic`,
      action: "Plan lesson",
      actionHref: `/lesson-builder?topic=${encodeURIComponent(row.id)}`,
      status: "attention" as const,
    }));

  const attentionFromSports: CoverageAttentionCard[] = dashboard.sportCoverage
    .filter((row) => row.status === "thin" || row.status === "missing" || row.status === "fallback-only")
    .slice(0, 3)
    .map((row) => ({
      id: `sport-${row.topicId}`,
      title: row.label,
      reason:
        row.status === "fallback-only"
          ? "Relies on fallback topic outcomes — consider a dedicated scheme"
          : "Thin sport coverage in the catalogue",
      action: "Create scheme",
      actionHref: `/schemes?topic=${encodeURIComponent(row.topicId)}`,
      status: "attention" as const,
    }));

  const attentionAreas = [...attentionFromTopics, ...attentionFromGaps, ...attentionFromSports]
    .slice(0, 6);

  const strongFromTopics: CoverageAttentionCard[] = topicRows
    .filter((row) => row.coveragePercent >= 60 && row.delivered > 0)
    .slice(0, 3)
    .map((row) => ({
      id: `strong-topic-${row.id}`,
      title: row.topic,
      reason: `${row.coveragePercent}% delivered — good progress`,
      action: "View progress",
      actionHref: "/curriculum-analytics",
      status: "strong" as const,
    }));

  const strongFromCatalogue: CoverageAttentionCard[] = dashboard.topicCoverage
    .filter((row) => row.status === "strong")
    .slice(0, 3)
    .map((row) => ({
      id: `strong-cat-${row.topicId}`,
      title: row.label,
      reason: `${row.planningCount} outcomes available in catalogue`,
      action: "Plan lesson",
      actionHref: `/lesson-builder?topic=${encodeURIComponent(row.topicId)}`,
      status: "strong" as const,
    }));

  const strongAreas = [...strongFromTopics, ...strongFromCatalogue].slice(0, 6);

  const termFocus: CoverageTermFocusRow[] = topicRows.slice(0, 8).map((row) => ({
    area: row.topic,
    planned: row.planned,
    taught: row.delivered,
    remaining: row.remaining,
    status:
      row.coveragePercent >= 75
        ? "On track"
        : row.coveragePercent >= 40
          ? "Developing"
          : "Needs focus",
  }));

  const recommendations: CoverageRecommendation[] = [];

  const athletics = dashboard.sportCoverage.find((s) => s.topicId === "athletics");
  if (athletics && athletics.status !== "strong") {
    recommendations.push({
      id: "rec-athletics",
      message: "Athletics appears under planned — consider building a term scheme.",
    });
  }

  const outdoor = dashboard.topicCoverage.find(
    (t) => t.topicId.includes("outdoor") || t.label.toLowerCase().includes("outdoor")
  );
  if (outdoor && outdoor.status === "thin") {
    recommendations.push({
      id: "rec-outdoor",
      message: "Outdoor Recreation has thin coverage — review available outcomes.",
    });
  }

  const secPe = dashboard.pathwayCoverage.find((p) => p.pathwayId === "pe-option-sec");
  if (secPe && secPe.status !== "strong") {
    recommendations.push({
      id: "rec-sec",
      message: "SEC PE Option has limited outcome depth — explore specialist outcomes.",
    });
  }

  if (attentionFromTopics.length > 0) {
    recommendations.push({
      id: "rec-scheme",
      message: `Consider creating a scheme for ${attentionFromTopics[0].title}.`,
    });
  }

  if (remainingOutcomes > plannedOutcomes) {
    recommendations.push({
      id: "rec-planned",
      message: "Several curriculum outcomes are visible but not yet in your plans.",
    });
  }

  return {
    health: {
      visibleOutcomes,
      plannedOutcomes,
      taughtOutcomes,
      remainingOutcomes,
      statusLabel: healthStatusLabel(percentage),
      percentage,
    },
    attentionAreas,
    strongAreas,
    termFocus,
    recommendations: recommendations.slice(0, 5),
  };
}
