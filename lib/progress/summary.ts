import type { LessonPlan, SchemeOfWork } from "@/lib/types";
import { getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import { resolveLearningOutcomeById } from "@/src/lib/curriculum/metadata";
import { collectPlannedOutcomeIds, collectTaughtOutcomeIds } from "./coverage";
import { deriveSchemeStatus, isDeliveredStatus } from "./delivery";

export interface SchemeProgressSummary {
  schemeId: string;
  title: string;
  status: SchemeOfWork["status"];
  totalLessons: number;
  deliveredLessons: number;
  plannedLessons: number;
  skippedLessons: number;
  remainingLessons: number;
  plannedOutcomes: number;
  taughtOutcomes: number;
}

export interface TopicProgressSummary {
  topicId: string;
  label: string;
  plannedOutcomes: number;
  taughtOutcomes: number;
  remainingOutcomes: number;
}

export function buildSchemeProgressSummary(scheme: SchemeOfWork): SchemeProgressSummary {
  const lessons = scheme.lessons ?? [];
  const delivered = lessons.filter((l) => l.deliveryStatus === "delivered").length;
  const skipped = lessons.filter((l) => l.deliveryStatus === "skipped").length;
  const planned = lessons.filter(
    (l) => !l.deliveryStatus || l.deliveryStatus === "planned" || l.deliveryStatus === "moved"
  ).length;

  const plannedOutcomeSet = new Set<string>();
  const taughtOutcomeSet = new Set<string>();
  for (const lesson of lessons) {
    for (const id of lesson.learningOutcomeIds) plannedOutcomeSet.add(id);
    if (isDeliveredStatus(lesson.deliveryStatus)) {
      for (const id of lesson.taughtOutcomeIds?.length
        ? lesson.taughtOutcomeIds
        : lesson.learningOutcomeIds) {
        taughtOutcomeSet.add(id);
      }
    }
  }

  return {
    schemeId: scheme.id,
    title: scheme.title,
    status: deriveSchemeStatus(scheme),
    totalLessons: lessons.length,
    deliveredLessons: delivered,
    plannedLessons: planned,
    skippedLessons: skipped,
    remainingLessons: Math.max(0, lessons.length - delivered - skipped),
    plannedOutcomes: plannedOutcomeSet.size,
    taughtOutcomes: taughtOutcomeSet.size,
  };
}

export function buildTopicProgressSummaries(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[]
): TopicProgressSummary[] {
  const planned = collectPlannedOutcomeIds(lessons, schemes);
  const taught = collectTaughtOutcomeIds(lessons, schemes);

  const byTopic = new Map<string, { planned: Set<string>; taught: Set<string> }>();

  const addToTopic = (topicId: string, outcomeId: string, mode: "planned" | "taught") => {
    if (!topicId) return;
    const bucket = byTopic.get(topicId) ?? { planned: new Set(), taught: new Set() };
    if (mode === "planned" && planned.has(outcomeId)) bucket.planned.add(outcomeId);
    if (mode === "taught" && taught.has(outcomeId)) bucket.taught.add(outcomeId);
    byTopic.set(topicId, bucket);
  };

  for (const id of planned) {
    const outcome = resolveLearningOutcomeById(id);
    for (const topicId of outcome?.topicIds ?? []) {
      addToTopic(topicId, id, "planned");
    }
  }

  for (const id of taught) {
    const outcome = resolveLearningOutcomeById(id);
    for (const topicId of outcome?.topicIds ?? []) {
      addToTopic(topicId, id, "taught");
    }
  }

  return [...byTopic.entries()]
    .map(([topicId, bucket]) => ({
      topicId,
      label: getPlanningTopicDisplayName(topicId),
      plannedOutcomes: bucket.planned.size,
      taughtOutcomes: bucket.taught.size,
      remainingOutcomes: Math.max(0, bucket.planned.size - bucket.taught.size),
    }))
    .filter((row) => row.plannedOutcomes > 0 || row.taughtOutcomes > 0)
    .sort((a, b) => b.plannedOutcomes - a.plannedOutcomes);
}

export function countDeliveredLessons(lessons: LessonPlan[]): number {
  return lessons.filter((l) => l.deliveryStatus === "delivered").length;
}

export interface SchemesDashboardSummary {
  totalSchemes: number;
  totalLessons: number;
  lessonsDelivered: number;
  outcomesCovered: number;
  averageCoveragePercent: number;
}

export function buildSchemesDashboardSummary(
  schemes: SchemeOfWork[]
): SchemesDashboardSummary {
  const summaries = schemes.map(buildSchemeProgressSummary);
  const totalLessons = summaries.reduce((n, s) => n + s.totalLessons, 0);
  const lessonsDelivered = summaries.reduce((n, s) => n + s.deliveredLessons, 0);
  const outcomesCovered = summaries.reduce((n, s) => n + s.taughtOutcomes, 0);

  const coveragePercents = summaries.map((s) =>
    s.plannedOutcomes > 0
      ? Math.round((s.taughtOutcomes / s.plannedOutcomes) * 100)
      : s.totalLessons > 0
        ? Math.round((s.deliveredLessons / s.totalLessons) * 100)
        : 0
  );

  const averageCoveragePercent =
    coveragePercents.length > 0
      ? Math.round(
          coveragePercents.reduce((n, p) => n + p, 0) / coveragePercents.length
        )
      : 0;

  return {
    totalSchemes: schemes.length,
    totalLessons,
    lessonsDelivered,
    outcomesCovered,
    averageCoveragePercent,
  };
}
