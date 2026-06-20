import { createEmptyActivity } from "@/lib/lesson-plans/pe-template";
import { generateId } from "@/lib/storage";
import type { LessonActivity } from "@/lib/types";
import { getPedagogyKnowledge } from "./knowledge-library";
import type { EducationPedagogyId } from "./types";

export function getPedagogyLessonPhases(id: EducationPedagogyId): string[] {
  return getPedagogyKnowledge(id)?.lessonPhases ?? [];
}

export function formatPedagogyActivities(id: EducationPedagogyId, topicLabel: string): string {
  const entry = getPedagogyKnowledge(id);
  if (!entry) return "";

  const phases = entry.lessonPhases;
  if (phases.length === 0) return "";

  const warmUp = phases[0] ?? "Warm up";
  const main =
    phases.slice(1, -1).join(" → ") || phases[1] || "Main activity";
  const coolDown = phases[phases.length - 1] ?? "Reflection";

  return [
    "Warm up:",
    `${warmUp} linked to ${topicLabel || "today's focus"}.`,
    "",
    "Main activity:",
    main,
    "",
    "Cool down:",
    coolDown.includes("Reflection") || coolDown.includes("Review")
      ? coolDown
      : `${coolDown} — review learning against success criteria.`,
  ].join("\n");
}

export function buildStructuredActivitiesFromPedagogy(
  id: EducationPedagogyId,
  topicLabel: string
): LessonActivity[] {
  const phases = getPedagogyLessonPhases(id);
  if (phases.length === 0) return [];

  return phases.map((phase, index) => ({
    ...createEmptyActivity(index + 1),
    id: generateId(),
    name: phase,
    taskDescription: `${phase} — ${getPedagogyKnowledge(id)?.practicalImplications[0] ?? "Apply pedagogical phase with clear success criteria."}`,
    time: index === 0 ? "8 mins" : index === phases.length - 1 ? "5 mins" : "12 mins",
  }));
}

export function applyPedagogyToSchemeLessonActivities(
  activities: string,
  pedagogyId: EducationPedagogyId,
  topicLabel: string
): string {
  const formatted = formatPedagogyActivities(pedagogyId, topicLabel);
  return formatted || activities;
}
