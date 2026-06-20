import { isValidLessonActivities } from "@/lib/assistant/lesson-structure-templates";
import type { LessonPlan, SchemeOfWork, SOWLesson } from "@/lib/types";
import { getPedagogyKnowledge } from "./knowledge-library";
import type { EducationPedagogyId, PedagogicalQualityReport } from "./types";

function schemeHasAssessmentLesson(scheme: Pick<SchemeOfWork, "lessons">): boolean {
  const last = scheme.lessons[scheme.lessons.length - 1];
  if (!last) return false;
  const text = `${last.walt} ${last.activities}`.toLowerCase();
  return text.includes("assess") || text.includes("review") || text.includes("consolidat");
}

export function buildSchemePedagogicalQuality(
  scheme: Pick<SchemeOfWork, "lessons" | "pedagogicalModels" | "topicId">
): PedagogicalQualityReport {
  const lessons = scheme.lessons ?? [];
  const models = scheme.pedagogicalModels ?? [];

  const checks = [
    {
      id: "models-tagged",
      label: "Pedagogical lens selected",
      met: models.length > 0,
    },
    {
      id: "outcomes-all-lessons",
      label: "Outcomes on every lesson",
      met: lessons.length > 0 && lessons.every((l) => l.learningOutcomeIds.length > 0),
    },
    {
      id: "walt-all",
      label: "WALT on every lesson",
      met: lessons.every((l) => l.walt.trim()),
    },
    {
      id: "wilf-all",
      label: "WILF on every lesson",
      met: lessons.every((l) => l.wilf.trim()),
    },
    {
      id: "activities-structure",
      label: "Structured activities (warm up / main / cool down)",
      met: lessons.every((l) => isValidLessonActivities(l.activities)),
    },
    {
      id: "assessment-lesson",
      label: "Assessment or consolidation lesson",
      met: schemeHasAssessmentLesson(scheme),
    },
    {
      id: "pedagogy-consistency",
      label: "Lesson phases match selected pedagogy",
      met: models.length > 0 ? pedagogyPhasesMatchLessons(models[0], lessons) : false,
    },
  ];

  const metCount = checks.filter((c) => c.met).length;
  const percentage = Math.round((metCount / checks.length) * 100);

  const strengths: string[] = [];
  const suggestions: string[] = [];

  if (checks.find((c) => c.id === "models-tagged")?.met) {
    strengths.push(`Pedagogical lens: ${models.map((m) => getPedagogyKnowledge(m)?.name ?? m).join(", ")}`);
  } else {
    suggestions.push("Select a pedagogical lens (e.g. TGfU or Whole Part Whole) in Scheme setup.");
  }

  if (checks.find((c) => c.id === "outcomes-all-lessons")?.met) {
    strengths.push("Curriculum outcomes linked across lessons");
  } else {
    suggestions.push("Ensure every lesson has at least one curriculum outcome.");
  }

  if (checks.find((c) => c.id === "assessment-lesson")?.met) {
    strengths.push("Assessment or consolidation included");
  } else {
    suggestions.push("Add a final assessment or consolidation lesson.");
  }

  if (!checks.find((c) => c.id === "pedagogy-consistency")?.met && models.length > 0) {
    suggestions.push(`${getPedagogyKnowledge(models[0])?.name ?? "Selected pedagogy"} structure incomplete — apply recommended lesson phases.`);
  }

  if (!checks.find((c) => c.id === "activities-structure")?.met) {
    suggestions.push("Use warm up → main activity → cool down structure in every lesson.");
  }

  return { score: metCount, percentage, strengths, suggestions, checks };
}

function pedagogyPhasesMatchLessons(
  modelId: EducationPedagogyId,
  lessons: SOWLesson[]
): boolean {
  const entry = getPedagogyKnowledge(modelId);
  if (!entry || lessons.length === 0) return false;
  const matched = lessons.filter((lesson) => {
    const text = lesson.activities.toLowerCase();
    return entry.lessonPhases.some((phase) => text.includes(phase.toLowerCase().slice(0, 8)));
  });
  return matched.length >= Math.min(2, lessons.length);
}

export function buildLessonPedagogicalQuality(
  lesson: Pick<
    LessonPlan,
    "pedagogicalModels" | "selectedLearningOutcomeIds" | "walt" | "successCriteria" | "structuredActivities" | "activities" | "lessonEndings"
  >
): PedagogicalQualityReport {
  const models = lesson.pedagogicalModels ?? [];
  const hasReflection =
    (lesson.lessonEndings ?? []).some((e) => e.type === "reflection") ||
    Boolean(lesson.activities?.toLowerCase().includes("reflect"));

  const checks = [
    { id: "models", label: "Pedagogical model tagged", met: models.length > 0 },
    { id: "outcomes", label: "Curriculum outcomes linked", met: lesson.selectedLearningOutcomeIds.length > 0 },
    { id: "walt", label: "WALT present", met: Boolean(lesson.walt?.trim()) },
    { id: "wilf", label: "WILF present", met: Boolean(lesson.successCriteria?.trim()) },
    {
      id: "activities",
      label: "Activities present",
      met: (lesson.structuredActivities ?? []).length > 0 || Boolean(lesson.activities?.trim()),
    },
    { id: "reflection", label: "Reflection opportunity", met: hasReflection },
  ];

  const metCount = checks.filter((c) => c.met).length;
  const percentage = Math.round((metCount / checks.length) * 100);

  const strengths: string[] = [];
  const suggestions: string[] = [];

  checks.filter((c) => c.met).forEach((c) => {
    if (c.id === "models" && models[0]) {
      strengths.push(`${getPedagogyKnowledge(models[0])?.name ?? models[0]} tagged`);
    } else if (c.id !== "models") {
      strengths.push(c.label);
    }
  });

  checks.filter((c) => !c.met).forEach((c) => suggestions.push(`Add ${c.label.toLowerCase()}.`));

  if (models.includes("tgfu") && !hasReflection) {
    suggestions.push("TGfU structure incomplete — add a reflection phase.");
  }

  return { score: metCount, percentage, strengths, suggestions, checks };
}
