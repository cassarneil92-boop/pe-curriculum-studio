import type { LessonPlan } from "@/lib/types";
import {
  buildLessonQualityReport,
  type LessonQualityReport,
} from "@/lib/lesson-plans/quality-checklist";

export interface CoachingInsight {
  id: string;
  label: string;
}

export interface LessonCoachingReport extends LessonQualityReport {
  strengths: CoachingInsight[];
  suggestions: CoachingInsight[];
  mentorSummary: string;
}

function hasStructuredOrLegacyActivities(lesson: LessonPlan): boolean {
  if ((lesson.structuredActivities ?? []).length > 0) return true;
  return Boolean(lesson.activities?.trim());
}

function hasProgressions(lesson: LessonPlan): boolean {
  return (lesson.structuredActivities ?? []).some((a) =>
    a.progressions.some((p) => p.trim())
  );
}

function hasDifferentiation(lesson: LessonPlan): boolean {
  const structured = (lesson.structuredActivities ?? []).some(
    (a) => a.differentiationEasier.trim() || a.differentiationHarder.trim()
  );
  return structured || Boolean(lesson.differentiation?.trim());
}

function hasAssessmentOpportunity(lesson: LessonPlan): boolean {
  if (lesson.assessmentNotes?.trim()) return true;
  return (lesson.lessonEndings ?? []).some(
    (e) =>
      e.type === "assessment" ||
      e.type === "quick-questioning" ||
      /assess|exit|check/i.test(e.title)
  );
}

function hasReflectionQuestion(lesson: LessonPlan): boolean {
  if (lesson.reflectionNotes?.trim()) return true;
  return (lesson.lessonEndings ?? []).some(
    (e) =>
      e.type === "reflection" ||
      /reflect|plenary|question/i.test(e.title) ||
      /what|how|why/i.test(e.content)
  );
}

function hasLearningDesign(lesson: LessonPlan): boolean {
  return Boolean(
    lesson.learningIntention?.trim() ||
      lesson.walt?.trim() ||
      lesson.successCriteria?.trim()
  );
}

export function buildLessonCoachingReport(lesson: LessonPlan): LessonCoachingReport {
  const base = buildLessonQualityReport(lesson);
  const strengths: CoachingInsight[] = [];
  const suggestions: CoachingInsight[] = [];

  if (lesson.selectedLearningOutcomeIds.length > 0) {
    strengths.push({ id: "outcomes", label: "Learning outcomes selected" });
    strengths.push({ id: "aligned", label: "Curriculum aligned" });
  } else {
    suggestions.push({
      id: "outcomes",
      label: "Select curriculum learning outcomes in Curriculum Reference",
    });
  }

  if (hasLearningDesign(lesson)) {
    strengths.push({ id: "design", label: "Learning design documented" });
  } else {
    suggestions.push({
      id: "design",
      label: "Add learning intentions, WALT, or success criteria",
    });
  }

  if (hasStructuredOrLegacyActivities(lesson)) {
    strengths.push({ id: "activities", label: "Activities included" });
  } else {
    suggestions.push({ id: "activities", label: "Add PE activity blocks" });
  }

  if (hasProgressions(lesson)) {
    strengths.push({ id: "progression", label: "Progression included" });
  } else if (hasStructuredOrLegacyActivities(lesson)) {
    suggestions.push({ id: "progression", label: "No progression included yet" });
  }

  if (hasDifferentiation(lesson)) {
    strengths.push({ id: "differentiation", label: "Differentiation included" });
  } else if (hasStructuredOrLegacyActivities(lesson)) {
    suggestions.push({ id: "differentiation", label: "No differentiation included yet" });
  }

  if (hasAssessmentOpportunity(lesson)) {
    strengths.push({ id: "assessment", label: "Assessment opportunity noted" });
  } else {
    suggestions.push({ id: "assessment", label: "No assessment opportunity noted yet" });
  }

  if (hasReflectionQuestion(lesson)) {
    strengths.push({ id: "reflection", label: "Reflection question included" });
  } else {
    suggestions.push({ id: "reflection", label: "No reflection question yet" });
  }

  if (lesson.safetyConsiderations?.trim()) {
    strengths.push({ id: "safety", label: "Safety considerations documented" });
  } else {
    suggestions.push({ id: "safety", label: "Consider adding safety notes for this session" });
  }

  const mentorSummary =
    suggestions.length === 0
      ? "Strong curriculum-aligned plan — your lesson is well structured for delivery."
      : strengths.length >= 4
        ? "Solid foundation — address the remaining points below to strengthen your lesson further."
        : "Good start — use the guidance below like a mentor review before you save.";

  return {
    ...base,
    strengths,
    suggestions,
    mentorSummary,
  };
}
