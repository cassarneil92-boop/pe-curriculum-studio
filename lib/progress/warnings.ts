import type { CalendarEntry, LessonPlan, SchemeOfWork } from "@/lib/types";
import { collectPlannedOutcomeIds, collectTaughtOutcomeIds } from "./coverage";
import { getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import { resolveLearningOutcomeById } from "@/src/lib/curriculum/metadata";
import { getPlanningOutcomes } from "@/src/lib/curriculum/planning";

export interface TeachingWarning {
  id: string;
  message: string;
  tone: "amber" | "rose";
}

export function buildTeachingWarnings(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[]
): TeachingWarning[] {
  const warnings: TeachingWarning[] = [];
  const planned = collectPlannedOutcomeIds(lessons, schemes);
  const taught = collectTaughtOutcomeIds(lessons, schemes, calendar);
  const allOutcomes = getPlanningOutcomes();

  const byTopic = new Map<
    string,
    { label: string; total: number; taught: number; planned: number }
  >();

  for (const outcome of allOutcomes) {
    for (const topicId of outcome.topicIds ?? []) {
      const label = getPlanningTopicDisplayName(topicId);
      const bucket = byTopic.get(topicId) ?? {
        label,
        total: 0,
        taught: 0,
        planned: 0,
      };
      bucket.total += 1;
      if (taught.has(outcome.id)) bucket.taught += 1;
      if (planned.has(outcome.id)) bucket.planned += 1;
      byTopic.set(topicId, bucket);
    }
  }

  for (const [topicId, bucket] of byTopic) {
    if (bucket.total === 0) continue;

    const taughtPct = Math.round((bucket.taught / bucket.total) * 100);
    const remaining = bucket.total - bucket.taught;

    if (bucket.taught === 0 && bucket.planned === 0) {
      warnings.push({
        id: `not-planned-${topicId}`,
        message: `${bucket.label} not planned`,
        tone: "amber",
      });
    } else if (bucket.taught === 0 && bucket.planned > 0) {
      warnings.push({
        id: `not-taught-${topicId}`,
        message: `${bucket.label} not taught`,
        tone: "rose",
      });
    } else if (taughtPct < 15 && bucket.total >= 4) {
      warnings.push({
        id: `low-coverage-${topicId}`,
        message: `${bucket.label} coverage below 15%`,
        tone: "amber",
      });
    } else if (remaining >= 20) {
      warnings.push({
        id: `remaining-${topicId}`,
        message: `${bucket.label} has ${remaining} remaining outcomes`,
        tone: "amber",
      });
    }
  }

  const unscheduledSchemes = schemes.filter(
    (scheme) =>
      scheme.lessons.length > 0 &&
      !calendar.some((e) => e.linkedSchemeId === scheme.id && e.startDate)
  );
  if (unscheduledSchemes.length > 0) {
    warnings.push({
      id: "unscheduled-schemes",
      message: `${unscheduledSchemes.length} scheme${unscheduledSchemes.length === 1 ? "" : "s"} not scheduled on calendar`,
      tone: "amber",
    });
  }

  const orphanPlanned = [...planned].filter((id) => !taught.has(id));
  if (orphanPlanned.length > 30) {
    const sample = resolveLearningOutcomeById(orphanPlanned[0]);
    const topicLabel = sample?.topicIds?.[0]
      ? getPlanningTopicDisplayName(sample.topicIds[0])
      : "Several topics";
    warnings.push({
      id: "high-remaining",
      message: `${orphanPlanned.length} outcomes still to teach (${topicLabel} and others)`,
      tone: "amber",
    });
  }

  return warnings.slice(0, 8);
}
