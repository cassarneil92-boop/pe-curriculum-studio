import { generateId } from "@/lib/storage";
import type { LessonEndingComponent, SOWLesson } from "@/lib/types";
import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";

export type LessonApplyTarget =
  | "walt"
  | "learningIntention"
  | "successCriteria"
  | "differentiation"
  | "assessmentNotes"
  | "reflectionNotes"
  | "teacherNotes";

export type SchemeLessonApplyTarget = "walt" | "wilf" | "activities" | "coachNote";

export interface ApplyTextOptions {
  /** If true, never replace — only append when field has content. */
  appendOnly?: boolean;
  /** Separator between existing and new content. */
  separator?: string;
  /** Prompt before replacing non-empty field. */
  confirmOverwrite?: boolean;
}

export interface ApplyTextResult {
  applied: boolean;
  value: string;
  skipped: boolean;
  reason?: "duplicate" | "cancelled" | "empty";
}

const DEFAULT_SEPARATOR = "\n";

export function normaliseForCompare(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function avoidDuplicateSuggestions(existing: string, incoming: string): boolean {
  if (!incoming.trim()) return true;
  const normExisting = normaliseForCompare(existing);
  const normIncoming = normaliseForCompare(incoming);
  if (!normExisting) return false;
  return normExisting.includes(normIncoming) || normIncoming.includes(normExisting);
}

export function appendUniqueText(
  existing: string,
  incoming: string,
  options?: { separator?: string }
): string {
  const separator = options?.separator ?? DEFAULT_SEPARATOR;
  const trimmed = incoming.trim();
  if (!trimmed) return existing;
  if (avoidDuplicateSuggestions(existing, trimmed)) return existing;
  if (!existing.trim()) return trimmed;
  return `${existing.trim()}${separator}${trimmed}`;
}

export function mergePromptList(existing: string, prompts: string[]): string {
  let result = existing;
  for (const prompt of prompts) {
    result = appendUniqueText(result, prompt);
  }
  return result;
}

export function buildAppliedSuggestionMessage(label: string): string {
  return `Added to ${label}`;
}

function shouldConfirmOverwrite(existing: string, options?: ApplyTextOptions): boolean {
  if (!existing.trim()) return false;
  if (options?.appendOnly) return false;
  if (options?.confirmOverwrite === false) return false;
  return options?.confirmOverwrite ?? true;
}

export function safeApplyText(
  existing: string,
  incoming: string,
  options?: ApplyTextOptions
): ApplyTextResult {
  const trimmed = incoming.trim();
  if (!trimmed) {
    return { applied: false, value: existing, skipped: true, reason: "empty" };
  }

  if (avoidDuplicateSuggestions(existing, trimmed)) {
    return { applied: false, value: existing, skipped: true, reason: "duplicate" };
  }

  if (!existing.trim()) {
    return { applied: true, value: trimmed, skipped: false };
  }

  if (options?.appendOnly || !shouldConfirmOverwrite(existing, options)) {
    return {
      applied: true,
      value: appendUniqueText(existing, trimmed, { separator: options?.separator }),
      skipped: false,
    };
  }

  const confirmed = typeof window !== "undefined" &&
    window.confirm("Replace existing text with this suggestion?");
  if (!confirmed) {
    return { applied: false, value: existing, skipped: true, reason: "cancelled" };
  }

  return { applied: true, value: trimmed, skipped: false };
}

export function resolveLessonApplyTarget(
  target: LessonApplyTarget
): keyof Pick<
  LessonBuilderFormData,
  | "walt"
  | "learningIntention"
  | "successCriteria"
  | "differentiation"
  | "assessmentNotes"
  | "reflectionNotes"
> {
  if (target === "teacherNotes") return "reflectionNotes";
  return target;
}

export function applyTextToLessonForm(
  form: LessonBuilderFormData,
  target: LessonApplyTarget,
  text: string,
  options?: ApplyTextOptions
): { form: LessonBuilderFormData; result: ApplyTextResult } {
  const field = resolveLessonApplyTarget(target);
  const existing = (form[field] as string) ?? "";
  const prefix = target === "teacherNotes" ? "[PE Specialist] " : "";
  const result = safeApplyText(existing, `${prefix}${text}`, options);

  if (!result.applied) {
    return { form, result };
  }

  const next = { ...form, [field]: result.value };

  if (field === "walt" && !form.learningIntention?.trim()) {
    next.learningIntention = result.value;
  }

  return { form: next, result };
}

export function applyQuestioningToLesson(
  form: LessonBuilderFormData,
  questions: string[]
): { form: LessonBuilderFormData; applied: boolean } {
  const endings = [...(form.lessonEndings ?? [])];
  const content = questions.map((q) => `• ${q}`).join("\n");
  const duplicate = endings.some((e) => avoidDuplicateSuggestions(e.content, content));
  if (duplicate) return { form, applied: false };

  const ending: LessonEndingComponent = {
    id: generateId(),
    type: "quick-questioning",
    title: "PE Specialist — questioning",
    content,
    order: endings.length + 1,
  };

  return {
    form: { ...form, lessonEndings: [...endings, ending] },
    applied: true,
  };
}

export function applyCommonMistakeNote(
  form: LessonBuilderFormData,
  mistake: string
): { form: LessonBuilderFormData; result: ApplyTextResult } {
  const note = `Watch for: ${mistake}`;
  return applyTextToLessonForm(form, "reflectionNotes", note, { appendOnly: true });
}

export function appendSchemeLessonActivitiesNote(activities: string, note: string): string {
  const trimmed = note.trim();
  if (!trimmed) return activities;
  if (avoidDuplicateSuggestions(activities, trimmed)) return activities;

  const coachBlock = `\n\nCoach note:\n${trimmed}`;
  if (/cool down:/i.test(activities)) {
    return activities.replace(/(cool down:[\s\S]*?)$/i, (match) => `${match}${coachBlock}`);
  }
  return appendUniqueText(activities, `Coach note:\n${trimmed}`, { separator: "\n\n" });
}

export function applyToSchemeLesson(
  lesson: SOWLesson,
  target: SchemeLessonApplyTarget,
  text: string,
  options?: ApplyTextOptions
): { lesson: SOWLesson; result: ApplyTextResult } {
  const trimmed = text.trim();
  if (!trimmed) {
    return { lesson, result: { applied: false, value: "", skipped: true, reason: "empty" } };
  }

  switch (target) {
    case "walt": {
      const result = safeApplyText(lesson.walt, trimmed, options);
      return result.applied
        ? { lesson: { ...lesson, walt: result.value }, result }
        : { lesson, result };
    }
    case "wilf": {
      const result = safeApplyText(lesson.wilf, trimmed, options);
      return result.applied
        ? { lesson: { ...lesson, wilf: result.value }, result }
        : { lesson, result };
    }
    case "activities":
    case "coachNote": {
      const next = appendSchemeLessonActivitiesNote(lesson.activities, trimmed);
      if (next === lesson.activities) {
        return {
          lesson,
          result: { applied: false, value: lesson.activities, skipped: true, reason: "duplicate" },
        };
      }
      return {
        lesson: { ...lesson, activities: next },
        result: { applied: true, value: next, skipped: false },
      };
    }
  }
}

export function buildImprovedWalt(topicLabel: string, skillLabel?: string): string {
  const skill = skillLabel?.trim() || "key skills";
  const topic = topicLabel.trim() || "this activity";
  return `We are learning to develop ${skill.toLowerCase()} in ${topic.toLowerCase()}.`;
}

export function buildImprovedWilf(prompts: string[]): string {
  const lines = prompts.slice(0, 3).map((p) => {
    const cleaned = p.replace(/\?$/, "").trim();
    if (cleaned.toLowerCase().startsWith("i can")) return cleaned;
    return `I can ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}.`;
  });
  return lines.join("\n");
}

export function buildQuestioningFixPrompts(entryPrompts: string[]): string[] {
  return entryPrompts.slice(0, 3);
}

export function buildMinimalLessonDraftFromContext(input: {
  yearGroup?: LessonBuilderFormData["yearGroup"];
  topicId?: string;
  skillId?: string;
  pathwayId?: string;
  selectedPathways?: LessonBuilderFormData["selectedPathways"];
  walt?: string;
  successCriteria?: string;
}): LessonBuilderFormData {
  return {
    title: "",
    date: "",
    classGroup: "",
    yearGroup: input.yearGroup ?? "year-9",
    duration: 60,
    pathwayId: input.pathwayId ?? "general-pe",
    topicId: input.topicId ?? "",
    skillId: input.skillId ?? "",
    selectedPathways: input.selectedPathways ?? [],
    learningIntention: input.walt ?? "",
    walt: input.walt ?? "",
    successCriteria: input.successCriteria ?? "",
    equipment: "",
    safetyConsiderations: "",
    differentiation: "",
    activities: "",
    assessmentNotes: "",
    reflectionNotes: "",
    selectedLearningOutcomeIds: [],
    structuredActivities: [],
    lessonEndings: [],
    pedagogicalModels: [],
  };
}
