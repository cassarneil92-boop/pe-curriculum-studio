import type { HubTopicGroup } from "@/lib/curriculum-hub/engine";
import type { LessonPlan, SchemeOfWork } from "@/lib/types";
import { collectPlannedOutcomeIds, collectTaughtOutcomeIds } from "./coverage";

export interface TopicTeachingStats {
  totalOutcomes: number;
  taught: number;
  planned: number;
  remaining: number;
  taughtPercent: number;
}

export function buildTopicTeachingStats(
  topic: HubTopicGroup,
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  calendar?: import("@/lib/types").CalendarEntry[]
): TopicTeachingStats {
  const topicOutcomeIds = new Set(topic.outcomes.map((o) => o.id));
  const planned = collectPlannedOutcomeIds(lessons, schemes);
  const taught = collectTaughtOutcomeIds(lessons, schemes, calendar);

  let taughtCount = 0;
  let plannedCount = 0;

  for (const id of topicOutcomeIds) {
    if (taught.has(id)) taughtCount += 1;
    if (planned.has(id)) plannedCount += 1;
  }

  const total = topic.totalCount;
  const remaining = Math.max(0, total - taughtCount);

  return {
    totalOutcomes: total,
    taught: taughtCount,
    planned: plannedCount,
    remaining,
    taughtPercent: total > 0 ? Math.round((taughtCount / total) * 100) : 0,
  };
}
