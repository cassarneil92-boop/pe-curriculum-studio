import type { CurriculumCoverageDashboard } from "@/src/lib/curriculum/coverage/types";
import type { CurriculumAnalyticsReport } from "@/src/lib/intelligence/analytics/coverage-analytics";
import type { TopicCoverageRow } from "@/lib/progress/teaching-progress-ui";

export type CoverageAttentionStatus = "attention" | "strong";

export interface CoverageAttentionCard {
  id: string;
  title: string;
  reason: string;
  action: string;
  actionHref: string;
  status: CoverageAttentionStatus;
  outcomesAvailable?: number;
}

export interface CoverageRecommendation {
  id: string;
  message: string;
  actionLabel: string;
  actionHref: string;
}

export interface CoverageTeacherReport {
  health: {
    visibleOutcomes: number;
    plannedOutcomes: number;
    deliveredOutcomes: number;
    coveragePercent: number;
  };
  attentionAreas: CoverageAttentionCard[];
  strongAreas: CoverageAttentionCard[];
  recommendations: CoverageRecommendation[];
}

const SPORT_TOPIC_PATTERN =
  /\b(archery|badminton|ultimate|frisbee|volleyball|football|basketball|handball|hockey|pickleball|tchoukball|rugby|tennis|netball|cricket)\b/i;

const TEACHER_TOPIC_LABELS = new Set([
  "healthy lifestyle",
  "fitness",
  "sport values",
  "athletics",
  "communication",
  "team games",
  "outdoor",
  "holistic",
  "fundamentals",
  "gymnastics",
  "dance",
  "swimming",
]);

function isTeacherTopic(label: string): boolean {
  const lower = label.toLowerCase();
  if (SPORT_TOPIC_PATTERN.test(lower)) return false;
  return [...TEACHER_TOPIC_LABELS].some((t) => lower.includes(t));
}

function planLessonHref(topicId: string): string {
  return `/lesson-builder?topic=${encodeURIComponent(topicId)}`;
}

export function buildCoverageTeacherReport(
  dashboard: CurriculumCoverageDashboard,
  taught: CurriculumAnalyticsReport,
  topicRows: TopicCoverageRow[]
): CoverageTeacherReport {
  const visibleOutcomes = dashboard.layerTotals.planningCatalogue;
  const plannedOutcomes = taught.summary.plannedOutcomeIds;
  const deliveredOutcomes = taught.summary.taughtOutcomeIds;
  const coveragePercent =
    visibleOutcomes > 0 ? Math.round((deliveredOutcomes / visibleOutcomes) * 100) : 0;

  const attentionFromTopics: CoverageAttentionCard[] = topicRows
    .filter(
      (row) =>
        isTeacherTopic(row.topic) &&
        row.remaining > 0 &&
        row.coveragePercent < 55
    )
    .sort((a, b) => a.coveragePercent - b.coveragePercent)
    .slice(0, 5)
    .map((row) => ({
      id: `topic-${row.id}`,
      title: row.topic,
      reason:
        row.delivered === 0
          ? "Not yet in your teaching plans this term."
          : "Still building coverage in this area.",
      action: "Plan Lesson",
      actionHref: planLessonHref(row.id),
      status: "attention" as const,
    }));

  const attentionFromPathways: CoverageAttentionCard[] = dashboard.pathwayCoverage
    .filter((row) => row.status === "thin" || row.status === "needs-review")
    .filter((row) => isTeacherTopic(row.label))
    .slice(0, 2)
    .map((row) => ({
      id: `pathway-${row.pathwayId}`,
      title: row.label,
      reason: "Limited outcomes planned in this pathway.",
      action: "Plan Lesson",
      actionHref: "/lesson-builder",
      status: "attention" as const,
    }));

  const attentionAreas = [...attentionFromTopics, ...attentionFromPathways].slice(0, 5);

  const strongFromTopics: CoverageAttentionCard[] = dashboard.topicCoverage
    .filter((row) => row.status === "strong" && isTeacherTopic(row.label))
    .slice(0, 3)
    .map((row) => ({
      id: `strong-${row.topicId}`,
      title: row.label,
      reason: `${row.planningCount} outcomes available`,
      action: "Plan Lesson",
      actionHref: planLessonHref(row.topicId),
      status: "strong" as const,
      outcomesAvailable: row.planningCount,
    }));

  const strongFromTeaching: CoverageAttentionCard[] = topicRows
    .filter((row) => isTeacherTopic(row.topic) && row.coveragePercent >= 60 && row.delivered > 0)
    .slice(0, 3 - strongFromTopics.length)
    .map((row) => ({
      id: `strong-taught-${row.id}`,
      title: row.topic,
      reason: `${row.delivered} outcomes delivered — good progress`,
      action: "Plan Lesson",
      actionHref: planLessonHref(row.id),
      status: "strong" as const,
    }));

  const strongAreas = [...strongFromTopics, ...strongFromTeaching].slice(0, 3);

  const recommendations: CoverageRecommendation[] = [];

  const inProgressScheme = topicRows.find(
    (r) => r.topic.toLowerCase().includes("athletic") && r.planned > 0
  );
  if (inProgressScheme) {
    recommendations.push({
      id: "rec-continue-athletics",
      message: "Continue Athletics scheme",
      actionLabel: "Open Schemes",
      actionHref: "/schemes",
    });
  }

  const fitness = attentionAreas.find((a) => a.title.toLowerCase().includes("fitness"));
  if (fitness) {
    recommendations.push({
      id: "rec-fitness",
      message: "Create Fitness lesson",
      actionLabel: "Create Lesson",
      actionHref: planLessonHref("fitness"),
    });
  }

  const hl = attentionAreas.find((a) => a.title.toLowerCase().includes("healthy"));
  if (hl) {
    recommendations.push({
      id: "rec-hl",
      message: "Create Healthy Lifestyle lesson",
      actionLabel: "Create Lesson",
      actionHref: planLessonHref("healthy-lifestyle"),
    });
  }

  recommendations.push({
    id: "rec-sport-values",
    message: "Start Sport Values unit",
    actionLabel: "Create Scheme",
    actionHref: "/schemes?create=1&topic=sport-values",
  });

  return {
    health: {
      visibleOutcomes,
      plannedOutcomes,
      deliveredOutcomes,
      coveragePercent,
    },
    attentionAreas,
    strongAreas,
    recommendations: recommendations.slice(0, 4),
  };
}
