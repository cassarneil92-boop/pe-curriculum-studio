import type { SchemeOfWork } from "@/lib/types";
import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import { resolveLearningOutcomeById } from "@/src/lib/curriculum/metadata";
import {
  ANATOMY_SUBTOPIC_LABELS,
  buildSecAssessmentSuggestions,
  buildSecProgressionMetadata,
  SEC_CATEGORY_LABELS,
  SPORT_PSYCHOLOGY_LABELS,
} from "@/src/lib/curriculum/pe-option-sec";
import {
  SEC_KNOWLEDGE_TOPICS,
  SEC_PE_OPTION_CORE_MESSAGE,
  isSecPeOptionRelevant,
} from "./secPeOptionMaster";
import type { PrimaryPEQualityInsight } from "./primaryPEEngines";

export interface SecPlanningContext {
  yearGroup?: string;
  topicId?: string;
  activityArea?: string;
  lessonAim?: string;
  walt?: string;
}

export function buildSecPeOptionPlanningInsights(
  prompt: string,
  ctx: SecPlanningContext
): string[] {
  if (
    !isSecPeOptionRelevant(prompt, ctx.yearGroup) &&
    ctx.topicId !== "pe-option-theory" &&
    !ctx.topicId?.includes("pe-option")
  ) {
    return [];
  }

  const insights: string[] = [
    "Link theory content to official SEC outcome wording — do not paraphrase LOs.",
    "Start with retrieval practice: 3 questions from the previous theory topic.",
  ];

  if (/anatom|physiol|cardio|muscular|respirat/i.test(prompt)) {
    insights.push(
      "Anatomy & Physiology: use labelled diagrams and sport-specific application (e.g. heart rate during exercise)."
    );
  }
  if (/principle|training|fitness component/i.test(prompt)) {
    insights.push(
      "Fitness & Training: connect components → principles → methods → testing in sequence."
    );
  }
  if (/motivat|psycholog|smart|arousal|feedback|guidance/i.test(prompt)) {
    insights.push(
      "Sport Psychology / Skill Acquisition: use scenarios — how would feedback change at cognitive vs autonomous stage?"
    );
  }
  if (/revision|exam|retrieval/i.test(prompt)) {
    insights.push(
      `Revision topics: ${SEC_KNOWLEDGE_TOPICS.slice(0, 5).join(", ")} — use spaced retrieval, not cramming.`
    );
  }
  if (/analys|observe|evaluat|coursework/i.test(prompt)) {
    insights.push(
      "Performance Analysis: observe → collect data → interview → evaluate → plan improvement."
    );
  }

  return insights.slice(0, 4);
}

export function buildSchemeSecPETips(
  scheme: Pick<SchemeOfWork, "topicId" | "yearGroup" | "selectedPathways" | "pathway" | "lessons">
): string[] {
  const isSec =
    scheme.pathway === "pe-option-sec" ||
    scheme.selectedPathways?.includes("pe-option-sec") ||
    scheme.topicId === "pe-option-theory";

  if (!isSec) return [];

  const tips: string[] = [
    "Sequence theory blocks: anatomy → fitness → skill acquisition → psychology → health.",
    "Alternate theory weeks with practical sport + performance analysis.",
    "Include at least one revision lesson with exam-style questions per half-term.",
    SEC_PE_OPTION_CORE_MESSAGE.slice(0, 80) + "…",
  ];

  if (scheme.lessons.length >= 6) {
    tips.push("Mid-scheme: coursework observation task linked to practical LO.");
    tips.push("Final lessons: mixed retrieval quiz across all theory topics.");
  }

  return tips.slice(0, 4);
}

export function buildSecLessonDesignHints(input: {
  selectedOutcomeIds: string[];
  topicId: string;
  skillId?: string;
  pathwayId?: string;
}): {
  walt: string[];
  wilf: string[];
  revisionTasks: string[];
  retrievalPrompts: string[];
  assessment: string[];
  examPrep: string[];
} {
  const isSec =
    input.pathwayId === "pe-option-sec" ||
    input.topicId === "pe-option-theory" ||
    input.selectedOutcomeIds.some((id) => id.includes("pe-option-sec") || id.startsWith("lo-pe-option"));

  if (!isSec && input.selectedOutcomeIds.length === 0) {
    return { walt: [], wilf: [], revisionTasks: [], retrievalPrompts: [], assessment: [], examPrep: [] };
  }

  const outcomes = input.selectedOutcomeIds
    .map((id) => resolveLearningOutcomeById(id))
    .filter(Boolean);

  const metadataList = outcomes
    .map((o) => (o ? buildSecProgressionMetadata(o) : null))
    .filter(Boolean);

  if (metadataList.length === 0 && !isSec) {
    return { walt: [], wilf: [], revisionTasks: [], retrievalPrompts: [], assessment: [], examPrep: [] };
  }

  const walt: string[] = [];
  const wilf: string[] = [];
  const revisionTasks: string[] = [];
  const retrievalPrompts: string[] = [];
  const assessment: string[] = [];
  const examPrep: string[] = [];

  for (const meta of metadataList) {
    if (!meta) continue;

    if (meta.anatomySubtopics?.[0]) {
      walt.push(
        `We are learning about the ${ANATOMY_SUBTOPIC_LABELS[meta.anatomySubtopics[0]]} in sport.`
      );
      retrievalPrompts.push("Name three structures and their function during exercise.");
      examPrep.push("Exam-style: Explain how the cardiovascular system responds to increased demand.");
    }

    if (meta.fitnessSubtopics?.[0]) {
      walt.push(`We are learning to apply ${meta.fitnessSubtopics[0].replace(/-/g, " ")}.`);
      examPrep.push("Exam-style: Apply training principles to improve a named fitness component.");
    }

    if (meta.psychologySubtopics?.[0]) {
      walt.push(`We are learning about ${SPORT_PSYCHOLOGY_LABELS[meta.psychologySubtopics[0]]} in sport.`);
      revisionTasks.push(`Generate revision activities for ${SPORT_PSYCHOLOGY_LABELS[meta.psychologySubtopics[0]]} — create flashcards with sporting examples.`);
    }

    if (meta.skillAcquisitionSubtopics?.length) {
      wilf.push("I can explain types of feedback and when each is most effective.");
      retrievalPrompts.push("Compare knowledge of performance vs knowledge of results.");
    }

    if (meta.performanceSubtopics?.length) {
      wilf.push("I can observe, collect data, and evaluate a performance.");
      assessment.push("Structured observation sheet with strengths, weaknesses, and next steps.");
    }

    if (meta.examRelevance === "high") {
      examPrep.push("Past-paper style short-answer linked to today's outcome.");
    }
  }

  if (isSec) {
    wilf.push("I can use correct subject terminology in my answers.");
    revisionTasks.push("5-minute retrieval quiz — no notes — on last lesson's topic.");
    retrievalPrompts.push("What is the link between today's topic and a practical sport example?");
    assessment.push("Exit ticket: one exam-style question + self-mark with mark scheme.");
  }

  const suggestions = buildSecAssessmentSuggestions(input.selectedOutcomeIds);
  assessment.push(...suggestions.assessmentOpportunities);
  revisionTasks.push(...suggestions.revisionPrompts);
  examPrep.push(...suggestions.examStyleQuestions);

  return {
    walt: [...new Set(walt)].slice(0, 3),
    wilf: [...new Set(wilf)].slice(0, 4),
    revisionTasks: [...new Set(revisionTasks)].slice(0, 3),
    retrievalPrompts: [...new Set(retrievalPrompts)].slice(0, 3),
    assessment: [...new Set(assessment)].slice(0, 3),
    examPrep: [...new Set(examPrep)].slice(0, 3),
  };
}

export function buildSecActivityBlocks(input: {
  topicId: string;
  skillName: string;
  topicName: string;
  duration: number;
}): Array<{
  blockType: "warm-up" | "skill-practice" | "conditioned-practice" | "small-sided-game" | "reflection";
  name: string;
  purpose: string;
  durationMinutes: number;
}> {
  if (input.topicId !== "pe-option-theory" && !input.topicName.toLowerCase().includes("option")) {
    return [];
  }

  return [
    {
      blockType: "warm-up",
      name: "Retrieval starter",
      purpose: "3 exam-style recall questions from previous theory topic — no notes.",
      durationMinutes: Math.min(10, Math.round(input.duration * 0.15)),
    },
    {
      blockType: "skill-practice",
      name: "Theory input + application",
      purpose: "Teach today's SEC topic with diagram, note-taking, and sport-specific examples.",
      durationMinutes: Math.round(input.duration * 0.35),
    },
    {
      blockType: "conditioned-practice",
      name: "Exam question workshop",
      purpose: "Students attempt structured exam questions; peer assess using mark scheme language.",
      durationMinutes: Math.round(input.duration * 0.3),
    },
    {
      blockType: "reflection",
      name: "Revision capture",
      purpose: "Record key terms and one exam tip in revision book; set homework retrieval task.",
      durationMinutes: Math.min(10, Math.round(input.duration * 0.15)),
    },
  ];
}

export function buildSecQualityInsights(
  lesson: Pick<LessonBuilderFormData, "topicId" | "yearGroup" | "selectedLearningOutcomeIds" | "walt" | "selectedPathways">
): PrimaryPEQualityInsight[] {
  const isSec =
    lesson.topicId === "pe-option-theory" ||
    lesson.selectedPathways?.includes("pe-option-sec") ||
    lesson.selectedLearningOutcomeIds.some((id) => id.includes("pe-option-sec"));

  if (!isSec) return [];

  const insights: PrimaryPEQualityInsight[] = [];

  if (!lesson.walt?.trim()) {
    insights.push({
      id: "sec-walt",
      area: "SEC PE Option",
      message: "WALT missing — add a SEC-specific learning intention.",
      prompt: "Name the theory topic (anatomy, psychology, fitness, etc.) in your WALT.",
      entryId: "sec-pe-option-master",
    });
  }

  const hasTheoryOutcome = lesson.selectedLearningOutcomeIds.some((id) => {
    const outcome = resolveLearningOutcomeById(id);
    if (!outcome) return false;
    const meta = buildSecProgressionMetadata(outcome);
    return meta?.examRelevance === "high" || meta?.examRelevance === "medium";
  });

  if (hasTheoryOutcome) {
    insights.push({
      id: "sec-retrieval",
      area: "SEC PE Option",
      message: "Theory outcome selected — include retrieval practice for exam readiness.",
      prompt: "Add a 5-minute retrieval starter before new content.",
      entryId: "sec-pe-option-master",
    });
  }

  return insights;
}
