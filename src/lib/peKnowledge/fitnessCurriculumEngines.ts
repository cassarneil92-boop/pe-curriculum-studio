import type { SchemeOfWork } from "@/lib/types";
import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import { resolveLearningOutcomeById } from "@/src/lib/curriculum/metadata";
import {
  buildFitnessProgressionMetadata,
  getFitnessCurriculumOutcomes,
  TRAINING_METHOD_LABELS,
  TRAINING_PRINCIPLE_LABELS,
} from "@/src/lib/curriculum/fitness-curriculum";
import { FITNESS_BATTERY } from "@/src/lib/intelligence/frameworks/fitness-strands";
import {
  FITNESS_CURRICULUM_CORE_MESSAGE,
  isFitnessCurriculumRelevant,
  isFitnessYearGroup,
} from "./fitnessCurriculumMaster";
import type { PrimaryPEQualityInsight } from "./primaryPEEngines";

export interface FitnessPlanningContext {
  yearGroup?: string;
  topicId?: string;
  activityArea?: string;
  lessonAim?: string;
  walt?: string;
}

export function buildFitnessCurriculumPlanningInsights(
  prompt: string,
  ctx: FitnessPlanningContext
): string[] {
  if (!isFitnessCurriculumRelevant(prompt, ctx.yearGroup) && ctx.topicId !== "fitness") {
    return [];
  }

  const insights: string[] = [
    "Name the fitness component (e.g. cardiovascular endurance) in your learning intention.",
    "Link the lesson method to a training principle — overload, progression, or recovery.",
  ];

  if (/interval/i.test(prompt)) {
    insights.push(
      "Interval training: alternate work and rest periods — students should know work:rest ratio and target intensity."
    );
  }
  if (/continuous/i.test(prompt)) {
    insights.push(
      "Continuous training: sustained moderate activity — monitor pacing and safe warm-up/cool-down."
    );
  }
  if (/test|assess|shuttle|plank|hexagon/i.test(prompt)) {
    insights.push(
      `Common Fitness Battery: ${FITNESS_BATTERY.map((t) => t.label).join(", ")} — use results for personal goal setting, not ranking alone.`
    );
  }
  if (/nutrition|recovery|sleep/i.test(prompt)) {
    insights.push("Connect physical training to recovery and nutrition habits for lifelong wellbeing.");
  }

  return insights.slice(0, 4);
}

export function buildSchemeFitnessTips(
  scheme: Pick<SchemeOfWork, "topicId" | "yearGroup" | "selectedPathways" | "pathway" | "lessons">
): string[] {
  const isFitness =
    scheme.topicId === "fitness" ||
    scheme.selectedPathways?.includes("fitness-curriculum") ||
    scheme.pathway === "fitness-curriculum";

  if (!isFitness) return [];

  const tips: string[] = [
    "Sequence: components → methods → application → testing → programme design.",
    "Include at least one lesson on training principles (overload, progression, recovery).",
    "Use the Common Fitness Battery consistently for meaningful progress monitoring.",
  ];

  if (scheme.lessons.length >= 6) {
    tips.push("Mid-unit: circuit or interval lesson applying named methods.");
    tips.push("Final lessons: interpret results and set personal fitness goals.");
  }

  return tips.slice(0, 4);
}

export function buildFitnessLessonDesignHints(input: {
  selectedOutcomeIds: string[];
  topicId: string;
  skillId?: string;
}): {
  walt: string[];
  wilf: string[];
  assessment: string[];
  reflection: string[];
  activities: string[];
} {
  const isFitness = input.topicId === "fitness";
  if (!isFitness && input.selectedOutcomeIds.length === 0) {
    return { walt: [], wilf: [], assessment: [], reflection: [], activities: [] };
  }

  const outcomes = input.selectedOutcomeIds
    .map((id) => resolveLearningOutcomeById(id))
    .filter(Boolean);

  const metadataList = outcomes
    .map((o) => (o ? buildFitnessProgressionMetadata(o) : null))
    .filter(Boolean);

  if (metadataList.length === 0 && !isFitness) {
    return { walt: [], wilf: [], assessment: [], reflection: [], activities: [] };
  }

  const walt: string[] = [];
  const wilf: string[] = [];
  const assessment: string[] = [];
  const reflection: string[] = [];
  const activities: string[] = [];

  for (const meta of metadataList) {
    if (!meta) continue;
    if (meta.healthComponents?.[0]) {
      walt.push(`We are learning to develop ${meta.healthComponents[0].replace(/-/g, " ")}.`);
    }
    if (meta.trainingMethods?.[0]) {
      walt.push(`We are learning to apply ${TRAINING_METHOD_LABELS[meta.trainingMethods[0]]}.`);
      activities.push(`Structured ${TRAINING_METHOD_LABELS[meta.trainingMethods[0]]} session with clear work phases.`);
    }
    if (meta.trainingPrinciples?.[0]) {
      wilf.push(`I can explain how ${TRAINING_PRINCIPLE_LABELS[meta.trainingPrinciples[0]]} applies to today's training.`);
    }
    if (meta.testTypes?.length) {
      assessment.push("Record personal test result and compare to previous attempt or personal goal.");
    }
  }

  if (isFitness) {
    wilf.push("I can work at a safe intensity and monitor my effort.");
    wilf.push("I can explain which fitness component I am developing.");
    assessment.push("Observe technique, effort level, and safe participation throughout.");
    reflection.push("What training method helped you most today? What is your next fitness goal?");
    activities.push("Warm-up → method-focused main block → cool-down with stretching.");
    activities.push("Partner or small-group circuit with timed stations.");
  }

  return {
    walt: [...new Set(walt)].slice(0, 3),
    wilf: [...new Set(wilf)].slice(0, 4),
    assessment: [...new Set(assessment)].slice(0, 3),
    reflection: [...new Set(reflection)].slice(0, 2),
    activities: [...new Set(activities)].slice(0, 3),
  };
}

export function buildFitnessActivityBlocks(skillName: string, duration: number): {
  name: string;
  purpose: string;
  durationMinutes: number;
  progression: string;
}[] {
  const warmUp = Math.round(duration * 0.15);
  const main = Math.round(duration * 0.6);
  const coolDown = Math.max(5, Math.round(duration * 0.12));
  const focus = skillName || "fitness";

  return [
    {
      name: "Fitness warm-up",
      purpose: `Prepare the body for ${focus} training with pulse raising and dynamic mobility.`,
      durationMinutes: warmUp,
      progression: "Pulse raiser → dynamic stretches → activity-specific preparation",
    },
    {
      name: "Training main block",
      purpose: `Apply the training method focusing on ${focus} with appropriate intensity.`,
      durationMinutes: main,
      progression: "Teacher model → paired practice → timed sets or circuit stations",
    },
    {
      name: "Cool-down & recovery",
      purpose: "Lower heart rate safely and reflect on training principles applied.",
      durationMinutes: coolDown,
      progression: "Light activity → static stretching → personal goal reflection",
    },
  ];
}

export function buildFitnessQualityInsights(
  lesson: LessonBuilderFormData
): PrimaryPEQualityInsight[] {
  const isFitness =
    lesson.topicId === "fitness" ||
    lesson.selectedPathways?.includes("fitness-curriculum");

  if (!isFitness) return [];

  const insights: PrimaryPEQualityInsight[] = [];
  const walt = lesson.walt?.toLowerCase() ?? "";

  if (!/component|endurance|strength|flexib|fitness|training/i.test(walt)) {
    insights.push({
      id: "fitness-no-component",
      area: "Fitness Curriculum",
      message: "WALT does not name a fitness component or training focus.",
      prompt: "Add the health or skill related component students are developing.",
      entryId: "fitness-curriculum-master",
    });
  }

  if (!/principle|overload|progression|recovery|method|interval|circuit|continuous/i.test(walt + (lesson.successCriteria ?? ""))) {
    insights.push({
      id: "fitness-no-principle",
      area: "Fitness Curriculum",
      message: "No training principle or method referenced in learning design.",
      prompt: "Link WILF to a method (e.g. interval) and principle (e.g. overload).",
      entryId: "fitness-curriculum-master",
    });
  }

  return insights;
}

export { FITNESS_CURRICULUM_CORE_MESSAGE };
