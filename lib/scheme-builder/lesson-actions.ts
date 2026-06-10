import { ACTIVITY_TEMPLATE } from "./constants";
import type { SOWLesson } from "@/lib/types";

export type SOWCardZone = "outcomes" | "walt" | "wilf" | "activities" | "resources";

export function isActivitiesEmpty(activities: string): boolean {
  const trimmed = activities.trim();
  return !trimmed || trimmed === ACTIVITY_TEMPLATE.trim();
}

export function addOutcomeToLesson(lesson: SOWLesson, outcomeId: string): SOWLesson {
  if (lesson.learningOutcomeIds.includes(outcomeId)) return lesson;
  return {
    ...lesson,
    learningOutcomeIds: [...lesson.learningOutcomeIds, outcomeId],
  };
}

export function removeOutcomeFromLesson(lesson: SOWLesson, outcomeId: string): SOWLesson {
  return {
    ...lesson,
    learningOutcomeIds: lesson.learningOutcomeIds.filter((id) => id !== outcomeId),
  };
}

export function addWaltToLesson(lesson: SOWLesson, text: string): SOWLesson {
  const value = text.trim();
  if (!value) return lesson;
  const existing = lesson.walt.trim();
  if (existing.includes(value)) return lesson;
  return {
    ...lesson,
    walt: existing ? `${existing}\n${value}` : value,
  };
}

export function removeWaltFromLesson(lesson: SOWLesson, text: string): SOWLesson {
  const lines = lesson.walt
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && line !== text.trim());
  return { ...lesson, walt: lines.join("\n") };
}

export function replaceWaltInLesson(
  lesson: SOWLesson,
  oldText: string,
  newText: string
): SOWLesson {
  const lines = waltLines(lesson.walt).map((line) =>
    line === oldText.trim() ? newText.trim() : line
  );
  return { ...lesson, walt: lines.filter(Boolean).join("\n") };
}

export function addWilfToLesson(lesson: SOWLesson, text: string): SOWLesson {
  const value = text.trim();
  if (!value) return lesson;
  const lines = lesson.wilf
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.includes(value)) return lesson;
  return { ...lesson, wilf: [...lines, value].join("\n") };
}

export function removeWilfFromLesson(lesson: SOWLesson, text: string): SOWLesson {
  const lines = lesson.wilf
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && line !== text.trim());
  return { ...lesson, wilf: lines.join("\n") };
}

export function replaceWilfInLesson(
  lesson: SOWLesson,
  oldText: string,
  newText: string
): SOWLesson {
  const lines = wilfLines(lesson.wilf).map((line) =>
    line === oldText.trim() ? newText.trim() : line
  );
  return { ...lesson, wilf: lines.filter(Boolean).join("\n") };
}

export function addActivityToLesson(lesson: SOWLesson, label: string): SOWLesson {
  const value = label.trim();
  if (!value) return lesson;
  const base = isActivitiesEmpty(lesson.activities) ? "" : lesson.activities.trimEnd();
  const block = `${value}:\n`;
  if (base.includes(block)) return lesson;
  const prefix = base ? "\n\n" : "";
  return { ...lesson, activities: `${base}${prefix}${block}` };
}

export function removeActivityFromLesson(lesson: SOWLesson, label: string): SOWLesson {
  const value = label.trim();
  const pattern = new RegExp(`\\n*${value}:\\n*`, "gi");
  const next = lesson.activities.replace(pattern, "\n\n").trim();
  return { ...lesson, activities: next };
}

export function addResourceToLesson(lesson: SOWLesson, resource: string): SOWLesson {
  const value = resource.trim();
  if (!value || lesson.resources.includes(value)) return lesson;
  return { ...lesson, resources: [...lesson.resources, value] };
}

export function removeResourceFromLesson(lesson: SOWLesson, resource: string): SOWLesson {
  return {
    ...lesson,
    resources: lesson.resources.filter((item) => item !== resource),
  };
}

export function replaceResourceInLesson(
  lesson: SOWLesson,
  oldResource: string,
  newResource: string
): SOWLesson {
  return {
    ...lesson,
    resources: lesson.resources.map((item) =>
      item === oldResource ? newResource.trim() : item
    ),
  };
}

export function replaceActivityInLesson(
  lesson: SOWLesson,
  oldLabel: string,
  newLabel: string
): SOWLesson {
  const oldValue = oldLabel.trim();
  const newValue = newLabel.trim();
  if (!oldValue || !newValue || oldValue === newValue) return lesson;
  return {
    ...lesson,
    activities: lesson.activities.replace(`${oldValue}:`, `${newValue}:`),
  };
}

export function isOutcomeUsedInLessons(lessons: SOWLesson[], outcomeId: string): boolean {
  return lessons.some((lesson) => lesson.learningOutcomeIds.includes(outcomeId));
}

export function isWaltUsedInLessons(lessons: SOWLesson[], text: string): boolean {
  const value = text.trim();
  return lessons.some((lesson) => lesson.walt.includes(value));
}

export function isWilfUsedInLessons(lessons: SOWLesson[], text: string): boolean {
  const value = text.trim();
  return lessons.some((lesson) =>
    lesson.wilf
      .split("\n")
      .map((line) => line.trim())
      .includes(value)
  );
}

export function isActivityUsedInLessons(lessons: SOWLesson[], label: string): boolean {
  const value = label.trim();
  return lessons.some((lesson) => lesson.activities.includes(`${value}:`));
}

export function isResourceUsedInLessons(lessons: SOWLesson[], resource: string): boolean {
  return lessons.some((lesson) => lesson.resources.includes(resource));
}

export function waltLines(walt: string): string[] {
  return walt
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function wilfLines(wilf: string): string[] {
  return wilf
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function activityLabels(activities: string): string[] {
  if (isActivitiesEmpty(activities)) return [];
  return activities
    .split("\n\n")
    .map((block) => block.split(":")[0]?.trim())
    .filter(Boolean) as string[];
}
