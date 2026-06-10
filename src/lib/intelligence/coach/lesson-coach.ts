import type { LessonPlan } from "@/lib/types";
import { getLearningOutcomeById } from "@/src/lib/curriculum/registry";
import { getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";

export interface CoachingFeedback {
  strengths: string[];
  suggestions: string[];
  alignmentNotes: string[];
}

export function analyseLessonCoaching(lesson: LessonPlan): CoachingFeedback {
  const strengths: string[] = [];
  const suggestions: string[] = [];
  const alignmentNotes: string[] = [];

  const loCount = lesson.selectedLearningOutcomeIds?.length ?? 0;
  if (loCount > 0) {
    strengths.push(`${loCount} curriculum outcome${loCount === 1 ? "" : "s"} selected.`);
  } else {
    suggestions.push("Select learning outcomes to strengthen curriculum alignment.");
  }

  if (lesson.learningIntention?.trim()) {
    strengths.push("Learning intention (WALT) is defined.");
  } else {
    suggestions.push("Add a clear learning intention so students know the lesson focus.");
  }

  if (lesson.successCriteria?.trim()) {
    strengths.push("Success criteria (WILF) support assessment for learning.");
  } else {
    suggestions.push("Add success criteria to make progress visible to students.");
  }

  if (lesson.differentiation?.trim()) {
    strengths.push("Differentiation notes are included (STEP model ready).");
  } else {
    suggestions.push("Consider STEP differentiation (Space, Task, Equipment, People, Time).");
  }

  if (lesson.assessmentNotes?.trim()) {
    strengths.push("Assessment approach is documented.");
  } else {
    suggestions.push("Add formative assessment notes — questioning, peer/self-assessment, or observation.");
  }

  if (lesson.reflectionNotes?.trim()) {
    strengths.push("Reflection is planned — supports holistic development.");
  } else {
    suggestions.push("Add a reflection opportunity for student ownership and wellbeing.");
  }

  if (lesson.pedagogicalModels?.length) {
    strengths.push(`Pedagogical model${lesson.pedagogicalModels.length > 1 ? "s" : ""} tagged.`);
  }

  if (lesson.safetyConsiderations?.trim()) {
    strengths.push("Safety considerations are recorded.");
  }

  const topic = getPlanningTopicDisplayName(lesson.topicId);
  if (topic && loCount > 0) {
    const codes = lesson.selectedLearningOutcomeIds
      .map((id) => getLearningOutcomeById(id)?.code)
      .filter(Boolean);
    alignmentNotes.push(`Topic: ${topic}${codes.length ? ` · ${codes.join(", ")}` : ""}`);
  }

  return { strengths, suggestions, alignmentNotes };
}
