/**
 * Learning Science Master Pack v1 — evaluation and suggestion engines.
 */

import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import type { SchemeOfWork } from "@/lib/types";
import type { LessonApplyTarget } from "./applySuggestions";
import type { LessonKnowledgeContext } from "./types";
import {
  getRetrievalPrompts,
  isLearningScienceRelevant,
  LEARNING_SCIENCE_WARNINGS,
  yearGroupToLSAgeBand,
} from "./learningScienceMaster";

export type LSQualityBand = "Exceptional" | "Strong" | "Developing" | "Limited";

export type DifficultyVerdict = "too-easy" | "productive-difficulty" | "too-hard";

export type TransferPotential = "low" | "moderate" | "high";

export interface LSLessonContext extends LessonKnowledgeContext {
  topicId?: string;
  walt?: string;
  wilf?: string;
  activities?: string;
  differentiation?: string;
  assessmentNotes?: string;
  reflectionNotes?: string;
  structuredActivityText?: string;
  schemeLessonIndex?: number;
  schemeLessonCount?: number;
}

export interface LSQualityInsight {
  id: string;
  area: string;
  message: string;
  prompt?: string;
  entryId?: string;
  fix?: {
    target: LessonApplyTarget;
    text: string;
    actionLabel: string;
    asQuestions?: boolean;
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scoreBand(score: number): LSQualityBand {
  if (score >= 90) return "Exceptional";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Developing";
  return "Limited";
}

export function lessonToLSContext(lesson: LessonBuilderFormData): LSLessonContext {
  const structured = (lesson.structuredActivities ?? [])
    .map((a) => `${a.name} ${a.taskDescription} ${a.students}`)
    .join(" ");
  return {
    yearGroup: lesson.yearGroup,
    pathway: lesson.selectedPathways?.[0] ?? lesson.pathwayId,
    topicId: lesson.topicId,
    activityArea: lesson.topicId,
    walt: lesson.walt ?? lesson.learningIntention,
    wilf: lesson.successCriteria,
    activities: lesson.activities,
    differentiation: lesson.differentiation,
    assessmentNotes: lesson.assessmentNotes,
    reflectionNotes: lesson.reflectionNotes,
    structuredActivityText: structured,
    lessonAim: lesson.walt ?? lesson.learningIntention,
  };
}

export function collectLSText(ctx: LSLessonContext): string {
  return [
    ctx.walt,
    ctx.wilf,
    ctx.activities,
    ctx.structuredActivityText,
    ctx.differentiation,
    ctx.assessmentNotes,
    ctx.reflectionNotes,
    ctx.lessonAim,
    ctx.activityArea,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function scoreKeyword(text: string, pattern: RegExp, base = 40): number {
  return clamp(base + (pattern.test(text) ? 35 : 0));
}

export function evaluateRetrievalPractice(ctx: LSLessonContext): {
  score: number;
  flags: string[];
  fixes: string[];
} {
  const text = collectLSText(ctx);
  let score = 35;
  const flags: string[] = [];
  const fixes: string[] = [];

  if (/\b(recall|remember|retriev|last lesson|previous|what did we|prior|quiz|starter question)\b/i.test(text)) score += 25;
  if (/\b(exit|plenary|what cue|tactical|wilf|success criteria)\b/i.test(text)) score += 15;
  if (/\b(partner recall|quick question|brain dump)\b/i.test(text)) score += 10;

  if (score < 55) {
    flags.push("No retrieval opportunity");
    fixes.push("Starter retrieval question from last lesson.");
    fixes.push("Partner recall of one coaching cue.");
    fixes.push("Exit question linked to WILF.");
  }
  if (/\b(re-explain|demonstrate again|tell them everything|full intro every)\b/i.test(text) && !/\brecall|remember\b/i.test(text)) {
    flags.push("Teacher re-explains everything");
    fixes.push("Ask pupils to recall before re-teaching.");
  }
  if (/\bdrill|repeat|practice only\b/i.test(text) && !/\bwhy|when|explain|recall\b/i.test(text)) {
    flags.push("Physical repetition without recalling meaning");
    fixes.push("Add tactical recall pause or cue quiz.");
  }

  return { score: clamp(score), flags: flags.slice(0, 3), fixes: fixes.slice(0, 5) };
}

export function suggestRetrievalPrompts(ctx: LSLessonContext): string[] {
  const ageBand = yearGroupToLSAgeBand(ctx.yearGroup, ctx.pathway);
  const text = collectLSText(ctx);
  const prompts = getRetrievalPrompts(ageBand, 5);

  if (/\bthrow|catch|kick|balance|run\b/i.test(text)) return [prompts[0], "What cue helped your technique?"];
  if (/\bgame|tactic|pass|attack\b/i.test(text)) return [prompts[1], "When would you use this decision?"];
  if (/\bsafe|equipment\b/i.test(text)) return [prompts[2], prompts[2]];
  return prompts.slice(0, 3);
}

export function evaluateSpacingAcrossScheme(
  scheme: Pick<SchemeOfWork, "lessons" | "topicId" | "yearGroup">,
  ctx?: LSLessonContext
): {
  score: number;
  flags: string[];
  fixes: string[];
} {
  const lessons = scheme.lessons;
  const text = lessons.map((l) => `${l.walt} ${l.activities}`).join(" ").toLowerCase();
  const lessonText = ctx ? collectLSText(ctx) : "";
  const combined = `${text} ${lessonText}`;
  let score = 45;
  const flags: string[] = [];
  const fixes: string[] = [];

  if (/\b(revisit|return|spiral|recap|review|again|previously|last week|lesson 1)\b/i.test(combined)) score += 20;
  if (lessons.length >= 4 && /\bprogress|build|develop|extend\b/i.test(combined)) score += 15;
  if (/\bassess\b/i.test(combined) && lessons.length >= 3) score += 10;

  if (lessons.length >= 2 && !/\b(revisit|recap|return|review|spiral)\b/i.test(combined)) {
    flags.push("Taught once and abandoned");
    fixes.push("Plan revisit in lesson 3 of scheme.");
  }
  if (lessons.length >= 4 && !/\b(revisit|spiral|return)\b/i.test(combined)) {
    flags.push("No revisiting across unit");
    fixes.push("Add spacing checkpoint in middle lesson.");
  }
  if (/\bassess\b/i.test(combined) && lessons.length <= 2) {
    flags.push("Assessment too soon");
    fixes.push("Delay assessment until after spaced revisit.");
  }
  if (lessons.length >= 6 && !/\b(revisit|spiral)\b/i.test(combined)) {
    flags.push("Unit may be too compressed without returns");
    fixes.push("Insert retrieval warm-ups from lesson 1 in lessons 4–6.");
  }

  return { score: clamp(score), flags: flags.slice(0, 4), fixes: fixes.slice(0, 4) };
}

export function suggestSpacingPlan(
  scheme: Pick<SchemeOfWork, "lessons" | "topicId" | "yearGroup">,
  activeLessonIndex = 0
): {
  nextRevisitPoint: string;
  retrievalCheckpoint: string;
  delayedAssessmentOpportunity: string;
  previousLearningLink: string;
} {
  const count = scheme.lessons.length;
  const nextIdx = Math.min(activeLessonIndex + 2, count - 1);
  return {
    nextRevisitPoint: count >= 3 ? `Lesson ${nextIdx + 1}: revisit skill from lesson 1 warm-up` : "Next lesson: 3-minute recap starter",
    retrievalCheckpoint: `Lesson ${Math.min(activeLessonIndex + 1, count)} plenary: recall one cue without demo`,
    delayedAssessmentOpportunity: count >= 4 ? `Lesson ${Math.max(count - 1, 3)}: assess in game context after spacing` : "Final lesson: assess after revisit",
    previousLearningLink: activeLessonIndex > 0 ? `Link to lesson ${activeLessonIndex} WILF in starter` : "Link to prior unit skill in instant activity",
  };
}

export function evaluateInterleaving(ctx: LSLessonContext): {
  score: number;
  flags: string[];
  interleaveSuggestions: string[];
} {
  const text = collectLSText(ctx);
  let score = 45;
  const flags: string[] = [];
  const interleaveSuggestions: string[] = [];

  if (/\b(mix|alternate|interleav|switch|rotate|both|and then|pass and move|attack and defend)\b/i.test(text)) score += 25;
  if (/\b(station|circuit|varied)\b/i.test(text)) score += 12;
  if (/\b(block|repeat same|drill only|one skill only)\b/i.test(text) && !/\bmix|alternate\b/i.test(text)) {
    score -= 10;
    flags.push("Over blocked practice");
    interleaveSuggestions.push("Alternate pass and move every 30 seconds.");
    interleaveSuggestions.push("Mix throw for distance and accuracy in rounds.");
  }
  if (/\b(isolated|same drill|predictable)\b/i.test(text)) {
    flags.push("Isolated skill repeated without context");
    interleaveSuggestions.push("Add decision cue between skill repetitions.");
  }
  if (score < 50 && !flags.length) {
    flags.push("Practice may be too predictable");
    interleaveSuggestions.push("Interleave two related skills in same practice block.");
  }

  return { score: clamp(score), flags: flags.slice(0, 3), interleaveSuggestions: interleaveSuggestions.slice(0, 3) };
}

export function suggestInterleavedPractice(ctx: LSLessonContext): string[] {
  const text = collectLSText(ctx);
  if (/\bpass|receive|throw|catch\b/i.test(text)) return ["Alternate passing and moving to space", "Mix near and far targets each round"];
  if (/\battack|defend|invasion\b/i.test(text)) return ["Rotate attack and defence problems in one session", "Interleave 1v1 and 2v2 decisions"];
  if (/\brun|jump|hop|locomotor\b/i.test(text)) return ["Mix direction changes with speed changes", "Alternate hop and jump stations"];
  if (/\bfitness|condition\b/i.test(text)) return ["Interleave strength and cardio stations", "Mix effort levels across activities"];
  return ["Mix two related skills in 3-minute rounds", "Switch constraint every 5 attempts"];
}

export function evaluatePracticeVariation(ctx: LSLessonContext): {
  score: number;
  flags: string[];
  variationSuggestions: string[];
} {
  const text = collectLSText(ctx);
  let score = 45;
  const flags: string[] = [];
  const variationSuggestions: string[] = [];
  let variationCount = 0;

  if (/\b(different space|space size|distance|speed|slow|fast)\b/i.test(text)) variationCount++;
  if (/\b(opponent|defender|partner change|equipment|constraint|rule change)\b/i.test(text)) variationCount++;
  if (/\b(rhythm|level|height|direction|target)\b/i.test(text)) variationCount++;

  score += variationCount * 15;

  if (variationCount === 0) {
    flags.push("Practice too identical");
    variationSuggestions.push("Change target distance or space size.");
    variationSuggestions.push("Add defender or time constraint.");
    variationSuggestions.push("Use different equipment size.");
  }
  if (/\bsame drill|identical|unchanged\b/i.test(text)) {
    flags.push("No adaptation demand");
    variationSuggestions.push("One constraint change every round.");
  }
  if (score < 55) flags.push("Weak transfer potential from lack of variation");

  return { score: clamp(score), flags: flags.slice(0, 3), variationSuggestions: variationSuggestions.slice(0, 4) };
}

export function evaluateDesirableDifficulty(ctx: LSLessonContext): {
  score: number;
  verdict: DifficultyVerdict;
  adjustments: string[];
} {
  const text = collectLSText(ctx);
  let score = 55;
  const adjustments: string[] = [];
  let verdict: DifficultyVerdict = "productive-difficulty";

  if (/\b(too easy|no challenge|everyone succeeds|simple only)\b/i.test(text)) {
    verdict = "too-easy";
    score = 35;
    adjustments.push("Extend: add opponent, smaller target, or time limit.");
    adjustments.push("Add decision demand under pressure.");
  } else if (/\b(too hard|frustrat|cannot|struggle|give up|anxious)\b/i.test(text) || /\b(send|lsa|support needed)\b/i.test(text)) {
    if (!/\bscaffold|support|easier|progression\b/i.test(text)) {
      verdict = "too-hard";
      score = 38;
      adjustments.push("Simplify: larger target, fewer rules, more space.");
      adjustments.push("Scaffold with demo or partner support.");
      adjustments.push("Reduce time pressure.");
    }
  }

  if (/\b(challenge level|differentiat|extend|support|scaffold|choice)\b/i.test(text)) score += 20;
  if (/\b(problem|decide|think|tactical)\b/i.test(text)) score += 10;
  if (verdict === "productive-difficulty") {
    adjustments.push("Maintain challenge — monitor success rate around 70–80%.");
  }

  return { score: clamp(score), verdict, adjustments: adjustments.slice(0, 4) };
}

export function evaluateElaboration(ctx: LSLessonContext): {
  score: number;
  flags: string[];
  fixes: string[];
} {
  const text = collectLSText(ctx);
  let score = 40;
  const flags: string[] = [];
  const fixes: string[] = [];

  if (/\b(why|when|how does|explain|connect|because|reason)\b/i.test(text)) score += 25;
  if (/\b(partner explain|pupil explain|in own words|elaborat)\b/i.test(text)) score += 15;
  if (/\b(reflect|what changed|feedback|improve)\b/i.test(text)) score += 10;

  if (score < 55) {
    flags.push("No elaboration opportunity");
    fixes.push("Add one why question in plenary.");
    fixes.push("Partner explain tactic before demo.");
  }

  return { score: clamp(score), flags: flags.slice(0, 2), fixes: fixes.slice(0, 3) };
}

export function suggestElaborationQuestions(ctx: LSLessonContext): string[] {
  const text = collectLSText(ctx);
  const base = [
    "Why did that movement help?",
    "When would you use this again?",
    "How does this connect to last lesson?",
    "What changed your performance?",
  ];
  if (/\btactic|game|pass\b/i.test(text)) return ["When should you pass instead of dribble?", ...base.slice(1, 3)];
  if (/\beffort|fitness\b/i.test(text)) return ["How does effort link to improvement?", "What changed your performance?"];
  return base.slice(0, 3);
}

export function evaluateLearningCalibration(ctx: LSLessonContext): {
  score: number;
  flags: string[];
  checks: string[];
} {
  const text = collectLSText(ctx);
  let score = 40;
  const flags: string[] = [];
  const checks: string[] = [];

  if (/\b(self.?assess|self.?check|self.?rate|against wilf|success criteria)\b/i.test(text)) {
    score += 20;
    checks.push("Self-check against WILF");
  }
  if (/\b(peer check|peer assess|partner feedback)\b/i.test(text)) {
    score += 15;
    checks.push("Peer check");
  }
  if (/\b(retriev|recall|without demo|no coach prompt)\b/i.test(text)) {
    score += 12;
    checks.push("Retrieval check");
  }
  if (/\b(evidence|observe|watch for|assessment)\b/i.test(text)) {
    score += 10;
    checks.push("Performance evidence check");
  }

  if (/\b(easy|simple drill|blocked|repeat)\b/i.test(text) && !/\b(self.?check|variation|new context)\b/i.test(text)) {
    flags.push("Fluency mistaken for mastery");
    checks.push("Change context probe after success");
  }
  if (score < 50) flags.push("No self check — pupils may misjudge learning");
  if (/\bconfident|easy success\b/i.test(text) && !/\bcheck|evidence\b/i.test(text)) {
    flags.push("Pupils may feel successful because task is easy");
  }

  return { score: clamp(score), flags: flags.slice(0, 3), checks: checks.slice(0, 4) };
}

export function evaluateGenerationOpportunity(ctx: LSLessonContext): {
  score: number;
  flags: string[];
  prompts: string[];
} {
  const text = collectLSText(ctx);
  let score = 40;
  const flags: string[] = [];
  const prompts: string[] = [];

  if (/\b(explore|discover|try first|predict|problem|solve|trial|attempt before)\b/i.test(text)) score += 25;
  if (/\b(guided discovery|challenge|what if|create)\b/i.test(text)) score += 15;

  if (score < 55) {
    flags.push("Teacher gives all answers immediately");
    flags.push("No exploration before instruction");
    prompts.push("Try to solve this tactical problem before I explain.");
    prompts.push("Explore three ways to send the object — then we discuss.");
    prompts.push("Predict what will happen if you change speed.");
  } else {
    prompts.push("What did you discover before the coaching point?");
  }

  return { score: clamp(score), flags: flags.slice(0, 2), prompts: prompts.slice(0, 3) };
}

export function evaluateTransferPotential(ctx: LSLessonContext): {
  transferPotential: TransferPotential;
  transferPrompt: string;
  planningImprovement: string;
} {
  const text = collectLSText(ctx);
  let score = 0;
  if (/\b(transfer|other sport|another game|daily life|home|habit|outside pe|different context)\b/i.test(text)) score += 3;
  if (/\b(connect|apply elsewhere|similar to|like in)\b/i.test(text)) score += 2;
  if (/\b(previous unit|last term|other activity)\b/i.test(text)) score += 2;

  let transferPotential: TransferPotential = "low";
  if (score >= 5) transferPotential = "high";
  else if (score >= 2) transferPotential = "moderate";

  return {
    transferPotential,
    transferPrompt: "Where else could this skill or decision matter?",
    planningImprovement:
      transferPotential === "low"
        ? "Add application in a second context or link to another sport."
        : "Strengthen transfer with explicit compare-and-contrast question.",
  };
}

export function evaluateLearningScienceQuality(ctx: LSLessonContext): {
  score: number;
  band: LSQualityBand;
  dimensionScores: Record<string, number>;
  warnings: string[];
  practicalFixes: string[];
  strongestArea: string;
  weakestArea: string;
} {
  const text = collectLSText(ctx);
  const retrieval = evaluateRetrievalPractice(ctx);
  const interleaving = evaluateInterleaving(ctx);
  const variation = evaluatePracticeVariation(ctx);
  const difficulty = evaluateDesirableDifficulty(ctx);
  const elaboration = evaluateElaboration(ctx);
  const calibration = evaluateLearningCalibration(ctx);
  const generation = evaluateGenerationOpportunity(ctx);
  const transfer = evaluateTransferPotential(ctx);

  const spacingScore = scoreKeyword(text, /\b(revisit|spiral|return|last lesson|previous unit|spacing)\b/i);

  const dimensionScores: Record<string, number> = {
    retrieval: retrieval.score,
    spacing: spacingScore,
    interleaving: interleaving.score,
    variation: variation.score,
    desirableDifficulty: difficulty.score,
    elaboration: elaboration.score,
    calibration: calibration.score,
    transfer: transfer.transferPotential === "high" ? 80 : transfer.transferPotential === "moderate" ? 58 : 38,
  };

  const keys = Object.keys(dimensionScores);
  const score = clamp(keys.reduce((s, k) => s + dimensionScores[k], 0) / keys.length);

  const sorted = [...keys].sort((a, b) => dimensionScores[b] - dimensionScores[a]);
  const warnings: string[] = [];
  const practicalFixes: string[] = [];

  for (const w of LEARNING_SCIENCE_WARNINGS) {
    if (w.id === "no-retrieval" && retrieval.score < 50) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "no-spacing" && spacingScore < 45) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "blocked" && interleaving.score < 50) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "too-easy" && difficulty.verdict === "too-easy") { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "too-hard" && difficulty.verdict === "too-hard") { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "answers-early" && generation.score < 50) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "no-elaboration" && elaboration.score < 50) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "no-transfer" && transfer.transferPotential === "low") { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "no-self-check" && calibration.score < 50) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "fluency-mastery" && calibration.flags.some((f) => f.includes("Fluency"))) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
  }

  return {
    score,
    band: scoreBand(score),
    dimensionScores,
    warnings: [...new Set(warnings)].slice(0, 4),
    practicalFixes: [...new Set(practicalFixes)].slice(0, 4),
    strongestArea: sorted[0] ?? "retrieval",
    weakestArea: sorted[sorted.length - 1] ?? "transfer",
  };
}

export function buildSchemeMemoryMap(
  scheme: Pick<SchemeOfWork, "lessons" | "topicId" | "yearGroup">
): {
  retrieveFromPrevious: string[];
  revisitPoints: string[];
  interleaveMoments: string[];
  delayedAssessment: string[];
  transferLinks: string[];
} {
  const count = scheme.lessons.length;
  const lessons = scheme.lessons;

  return {
    retrieveFromPrevious: [
      "Lesson 2+ starter: recall one cue from previous lesson",
      "Mid-unit: retrieve tactical idea without demo",
      lessons.length > 0 ? `Retrieve WILF from lesson 1 in lesson ${Math.min(3, count)}` : "Link to prior unit in warm-up",
    ].slice(0, 3),
    revisitPoints: count >= 4
      ? [`Lesson 1 skill revisited in lesson ${Math.ceil(count / 2)}`, `Lesson ${count}: spiral back to lesson 1 focus`]
      : ["Next lesson: 3-minute recap of today's focus"],
    interleaveMoments: [
      "Lessons 2–4: mix two related skills in practice",
      "Application phase: interleave decisions not isolated drills",
    ],
    delayedAssessment: count >= 3
      ? [`Lesson ${count}: assess after revisit in lesson ${Math.max(1, count - 2)}`]
      : ["Final lesson: assess in game context"],
    transferLinks: [
      "Name connection to another sport in lesson 3 plenary",
      "Link health or responsibility learning across units",
      "Compare tactic to prior invasion unit",
    ],
  };
}

export function buildLearningSciencePlanningInsights(
  promptOrText: string,
  ctx?: LSLessonContext
): string[] {
  const context: LSLessonContext = ctx ?? { lessonAim: promptOrText, walt: promptOrText };
  const text = collectLSText(context) + promptOrText;
  if (!isLearningScienceRelevant(text) && !context.lessonAim) return [];

  const retrieval = evaluateRetrievalPractice(context);
  const interleaving = evaluateInterleaving(context);
  const calibration = evaluateLearningCalibration(context);
  const spacing = scoreKeyword(text, /\b(revisit|spiral|return|previous)\b/i);
  const insights: string[] = [];

  if (retrieval.score < 55) insights.push("Add a retrieval question from last lesson.");
  if (spacing < 50) insights.push("This skill is introduced once but not revisited — plan a return point.");
  if (interleaving.score < 55) insights.push("Consider interleaving related skills instead of blocking them separately.");
  if (calibration.score < 55) insights.push("Add a self check so pupils do not confuse easy success with mastery.");
  if (insights.length === 0) insights.push("Plan exit elaboration: why did today's learning work?");

  return insights.slice(0, 5);
}

export function buildPedagogyCoachLSMetrics(lesson: LessonBuilderFormData): {
  score: number;
  band: string;
  retrievalSuggestion: string;
  difficultyLevel: string;
  interleavingSuggestion: string;
  transferPrompt: string;
  calibrationCheck: string;
  warning: string | null;
} {
  const ctx = lessonToLSContext(lesson);
  const quality = evaluateLearningScienceQuality(ctx);
  const retrieval = suggestRetrievalPrompts(ctx);
  const difficulty = evaluateDesirableDifficulty(ctx);
  const interleave = suggestInterleavedPractice(ctx);
  const transfer = evaluateTransferPotential(ctx);
  const calibration = evaluateLearningCalibration(ctx);

  return {
    score: quality.score,
    band: quality.band,
    retrievalSuggestion: retrieval[0] ?? "What do you remember from last lesson?",
    difficultyLevel: difficulty.verdict.replace(/-/g, " "),
    interleavingSuggestion: interleave[0] ?? "Mix two related skills in practice",
    transferPrompt: transfer.transferPrompt,
    calibrationCheck: calibration.checks[0] ?? "Self-check against WILF before exit",
    warning: quality.warnings[0] ?? null,
  };
}

export function buildLearningScienceQualityReview(lesson: LessonBuilderFormData): {
  score: number;
  band: LSQualityBand;
  checks: { label: string; met: boolean }[];
  warnings: string[];
  recommendations: string[];
} {
  const ctx = lessonToLSContext(lesson);
  const quality = evaluateLearningScienceQuality(ctx);
  const text = collectLSText(ctx);

  const checks = [
    { label: "Retrieval", met: quality.dimensionScores.retrieval >= 55 },
    { label: "Spacing", met: quality.dimensionScores.spacing >= 55 },
    { label: "Interleaving", met: quality.dimensionScores.interleaving >= 55 },
    { label: "Desirable difficulty", met: quality.dimensionScores.desirableDifficulty >= 55 },
    { label: "Elaboration", met: quality.dimensionScores.elaboration >= 55 },
    { label: "Feedback", met: /\b(feedback|feed.?forward|specific cue)\b/i.test(text) },
    { label: "Calibration", met: quality.dimensionScores.calibration >= 55 },
    { label: "Transfer", met: quality.dimensionScores.transfer >= 55 },
  ];

  return {
    score: quality.score,
    band: quality.band,
    checks,
    warnings: quality.warnings,
    recommendations: quality.practicalFixes,
  };
}

export function buildLearningScienceQualityInsights(lesson: LessonBuilderFormData): LSQualityInsight[] {
  const review = buildLearningScienceQualityReview(lesson);
  const insights: LSQualityInsight[] = [];

  insights.push({
    id: "ls-review",
    area: "Learning Science Review",
    message: `${review.band} learning design (${review.score}/100)`,
    prompt: review.checks.filter((c) => !c.met).map((c) => c.label).join("; ") || "Core checks met",
    entryId: "learning-science-master",
  });

  for (const w of review.warnings.slice(0, 2)) {
    const fix = LEARNING_SCIENCE_WARNINGS.find((x) => x.warning === w);
    insights.push({
      id: `ls-${w.slice(0, 12)}`,
      area: "Learning Science",
      message: w,
      prompt: fix?.whyItMatters,
      entryId: "learning-science-master",
      fix: fix
        ? {
            target: w.includes("retrieval") || w.includes("elaboration") ? "reflectionNotes" : w.includes("transfer") ? "successCriteria" : "assessmentNotes",
            text: fix.suggestedFix,
            actionLabel: "Apply fix",
            asQuestions: w.includes("retrieval") || w.includes("elaboration"),
          }
        : undefined,
    });
  }

  return insights;
}

export function buildSchemeLearningScienceTips(
  scheme: Pick<SchemeOfWork, "lessons" | "topicId" | "yearGroup">,
  activeLessonIndex = 0
): string[] {
  const memoryMap = buildSchemeMemoryMap(scheme);
  const spacing = suggestSpacingPlan(scheme, activeLessonIndex);
  const spacingEval = evaluateSpacingAcrossScheme(scheme);

  const tips: string[] = [
    `Memory map: ${memoryMap.retrieveFromPrevious[0]}`,
    `Spacing: ${spacing.nextRevisitPoint}`,
    `Retrieval checkpoint: ${spacing.retrievalCheckpoint}`,
    `Interleaving: ${memoryMap.interleaveMoments[0]}`,
    `Delayed assessment: ${spacing.delayedAssessmentOpportunity}`,
  ];

  if (spacingEval.flags[0]) tips.push(`Spacing flag: ${spacingEval.fixes[0] ?? spacingEval.flags[0]}`);
  tips.push(`Transfer: ${memoryMap.transferLinks[0]}`);

  return tips.slice(0, 6);
}
