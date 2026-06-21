/**
 * Visible Learning Master Pack v1 — engines.
 */

import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import type { SchemeOfWork } from "@/lib/types";
import type { LessonApplyTarget } from "./applySuggestions";
import { buildImprovedWalt, buildImprovedWilf } from "./applySuggestions";
import type { LessonKnowledgeContext } from "./types";
import {
  isVisibleLearningRelevant,
  VISIBLE_LEARNING_WARNINGS,
} from "./visibleLearningMaster";

export type VLQualityBand = "Exceptional" | "Strong" | "Developing" | "Limited";

export type ChallengeVerdict = "too-easy" | "appropriate-challenge" | "excessive-challenge";

export type LearningWalkVerdict = "yes" | "partly" | "no";

export interface VLLessonContext extends LessonKnowledgeContext {
  topicId?: string;
  walt?: string;
  wilf?: string;
  activities?: string;
  differentiation?: string;
  assessmentNotes?: string;
  reflectionNotes?: string;
  structuredActivityText?: string;
}

export interface VLQualityInsight {
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

function scoreBand(score: number): VLQualityBand {
  if (score >= 90) return "Exceptional";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Developing";
  return "Limited";
}

export function lessonToVLContext(lesson: LessonBuilderFormData): VLLessonContext {
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

export function collectVLText(ctx: VLLessonContext): string {
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

export function evaluateTeacherClarity(ctx: VLLessonContext): {
  clarityScore: number;
  strengths: string[];
  risks: string[];
  suggestedImprovements: string[];
} {
  const text = collectVLText(ctx);
  let score = 40;
  const strengths: string[] = [];
  const risks: string[] = [];
  const suggestedImprovements: string[] = [];

  if (ctx.walt && ctx.walt.length > 10) score += 15;
  if (/\b(learn|understand|develop|improve|able to)\b/i.test(ctx.walt ?? "")) {
    score += 12;
    strengths.push("WALT describes learning");
  } else if (ctx.walt) {
    risks.push("WALT may describe activity not learning");
    suggestedImprovements.push("Rewrite WALT: We are learning to…");
  }

  if (ctx.wilf && ctx.wilf.length > 10) score += 15;
  if (/\b(observ|see|demonstrat|can|will|accurat|control|safely)\b/i.test(ctx.wilf ?? "")) {
    score += 10;
    strengths.push("WILF appears observable");
  } else if (ctx.wilf) {
    risks.push("Success criteria may be vague");
    suggestedImprovements.push("Make WILF observable — what will you see?");
  }

  if (/\b(progress|sequence|build|phase|step)\b/i.test(text)) score += 8;
  if (!ctx.walt?.trim()) {
    risks.push("Unclear objective");
    suggestedImprovements.push("Add clear WALT before activities.");
  }
  if (/\b(and also|multiple|several aim|two objectives)\b/i.test(text)) {
    risks.push("Multiple competing objectives");
    suggestedImprovements.push("One main learning intention per lesson.");
  }
  if (/\b(play|game|fun activity)\b/i.test(text) && !/\blearn|understand\b/i.test(ctx.walt ?? "")) {
    risks.push("Activity without clear purpose");
    suggestedImprovements.push("Link activity explicitly to learning intention.");
  }

  return { clarityScore: clamp(score), strengths, risks: risks.slice(0, 3), suggestedImprovements: suggestedImprovements.slice(0, 3) };
}

export function evaluateLearningIntentions(ctx: VLLessonContext): {
  score: number;
  canAnswerWhat: boolean;
  canAnswerWhy: boolean;
  canAnswerHow: boolean;
  improvedLearningIntention: string;
  improvedSuccessCriteria: string;
  studentFriendlyVersion: string;
} {
  const walt = ctx.walt ?? "";
  const wilf = ctx.wilf ?? "";
  const text = collectVLText(ctx);
  let score = 35;

  const canAnswerWhat = walt.length > 8 && /\b(learn|develop|understand|improve|able)\b/i.test(walt);
  const canAnswerWhy = /\b(because|so that|in order|why|important|helps)\b/i.test(text) || /\b(game|health|safe|team)\b/i.test(walt);
  const canAnswerHow = wilf.length > 8;

  if (canAnswerWhat) score += 25;
  if (canAnswerWhy) score += 20;
  if (canAnswerHow) score += 20;

  const topic = ctx.activityArea ?? ctx.topicId ?? "this skill";
  const improvedLearningIntention = canAnswerWhat ? walt : buildImprovedWalt(topic, undefined);
  const improvedSuccessCriteria = canAnswerHow
    ? wilf
    : buildImprovedWilf(["I can demonstrate the skill with control", "I can explain one coaching point", "I can meet the lesson challenge safely"]);
  const studentFriendlyVersion = improvedLearningIntention
    .replace(/We are learning to/i, "Today I will learn to")
    .replace(/Understand/i, "Find out about");

  return {
    score: clamp(score),
    canAnswerWhat,
    canAnswerWhy,
    canAnswerHow,
    improvedLearningIntention,
    improvedSuccessCriteria,
    studentFriendlyVersion,
  };
}

export function evaluateSuccessCriteria(ctx: VLLessonContext): {
  score: number;
  flags: string[];
  improvedWilf: string;
  pupilFriendlyCriteria: string[];
} {
  const wilf = ctx.wilf ?? "";
  let score = 40;
  const flags: string[] = [];

  if (/\b(observ|see|demonstrat|show|can|will|accurat|control|safely|times|metres)\b/i.test(wilf)) score += 25;
  if (/\b(partner|peer|teacher|check|assess)\b/i.test(wilf)) score += 10;
  if (wilf.length > 15) score += 10;

  if (/\b(play|game|participat|enjoy|have fun)\b/i.test(wilf) && !/\b(can|demonstrat|show)\b/i.test(wilf)) {
    flags.push("Activity based criteria");
    score -= 10;
  }
  if (/\b(good|well|try hard|best effort only)\b/i.test(wilf) && !/\b(observ|can|will)\b/i.test(wilf)) {
    flags.push("Vague criteria");
  }
  if (/\b(perfect|always|never fail|100%)\b/i.test(wilf)) flags.push("Criteria may be unrealistic");

  const improvedWilf = flags.length > 0
    ? buildImprovedWilf(["I can perform the skill with correct form", "I can explain one success point", "I can apply the skill in the practice task"])
    : wilf || buildImprovedWilf(["I can meet the lesson learning intention"]);

  const pupilFriendlyCriteria = improvedWilf
    .split(/[\n;•]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  return { score: clamp(score), flags: flags.slice(0, 3), improvedWilf, pupilFriendlyCriteria };
}

export function evaluateVisibleLearning(ctx: VLLessonContext): {
  visibilityScore: number;
  strengths: string[];
  blindSpots: string[];
} {
  const clarity = evaluateTeacherClarity(ctx);
  const intentions = evaluateLearningIntentions(ctx);
  const progress = evaluateProgressVisibility(ctx);
  const selfEval = evaluateStudentSelfEvaluation(ctx);

  const visibilityScore = clamp(
    (clarity.clarityScore + intentions.score + progress.score + selfEval.score) / 4
  );

  const strengths = [...clarity.strengths];
  if (progress.score >= 55) strengths.push("Progress can be tracked");
  if (selfEval.score >= 55) strengths.push("Self-evaluation planned");

  const blindSpots: string[] = [];
  if (!intentions.canAnswerWhat) blindSpots.push("Pupils may not know what they are learning");
  if (!intentions.canAnswerHow) blindSpots.push("Pupils may not know what success looks like");
  if (progress.flags.includes("No baseline")) blindSpots.push("Improvement may not be visible");
  if (selfEval.score < 50) blindSpots.push("Learning may not be visible to pupils");

  return { visibilityScore, strengths: strengths.slice(0, 3), blindSpots: blindSpots.slice(0, 4) };
}

export function evaluateChallengeLevel(ctx: VLLessonContext): {
  verdict: ChallengeVerdict;
  score: number;
  simplification: string;
  extension: string;
  stretchTask: string;
} {
  const text = collectVLText(ctx);
  let score = 55;
  let verdict: ChallengeVerdict = "appropriate-challenge";

  if (/\b(too easy|no challenge|everyone succeeds|simple only|all complete)\b/i.test(text)) {
    verdict = "too-easy";
    score = 35;
  } else if (/\b(too hard|frustrat|cannot|struggle|anxious|give up)\b/i.test(text)) {
    verdict = "excessive-challenge";
    score = 38;
  }

  if (/\b(challenge|extend|opponent|decision|pressure|personal best|stretch)\b/i.test(text)) score += 15;
  if (/\b(differentiat|support|scaffold|choice level)\b/i.test(text)) score += 12;
  if (/\b(tactic|cognitive|problem|think)\b/i.test(text)) score += 8;

  return {
    verdict,
    score: clamp(score),
    simplification: "Larger target, fewer rules, partner support.",
    extension: "Smaller target, defender added, time pressure.",
    stretchTask: "Design own challenge that still meets WILF.",
  };
}

export function evaluateVisibleLearningFeedback(ctx: VLLessonContext): {
  score: number;
  feedUp: boolean;
  feedback: boolean;
  feedForward: boolean;
  flags: string[];
  improvedExamples: string[];
} {
  const text = collectVLText(ctx);
  let score = 40;
  const feedUp = /\b(wilf|success criteria|goal|target|intention|walt|where)\b/i.test(text);
  const feedback = /\b(observe|watch|current|evidence|compare|how am i)\b/i.test(text);
  const feedForward = /\b(next|improve|try|feed.?forward|what next|adjust)\b/i.test(text);
  const flags: string[] = [];
  const improvedExamples: string[] = [];

  if (feedUp) score += 20;
  if (feedback) score += 15;
  if (feedForward) score += 20;

  if (/\b(good job|well done|great)\b/i.test(text) && !feedForward) {
    flags.push("Praise only");
    improvedExamples.push("Next rep: focus on WILF point — that closes the gap.");
  }
  if (/\b(wrong|no|stop)\b/i.test(text) && !feedForward) {
    flags.push("Correction without guidance");
    improvedExamples.push("Try this instead: specific cue because reason.");
  }
  if (!feedForward) {
    flags.push("No next step");
    improvedExamples.push("Feed forward: one thing to change on the next attempt.");
  }
  if (!feedUp) improvedExamples.push("Feed up: remind WILF before the next practice block.");

  return { score: clamp(score), feedUp, feedback, feedForward, flags: flags.slice(0, 2), improvedExamples: improvedExamples.slice(0, 3) };
}

export function evaluateProgressVisibility(ctx: VLLessonContext): {
  score: number;
  flags: string[];
  progressChecks: string[];
  checkpoints: string[];
  reflectionPrompts: string[];
} {
  const text = collectVLText(ctx);
  let score = 40;
  const flags: string[] = [];

  if (/\b(baseline|start|beginning|first attempt|personal best)\b/i.test(text)) score += 15;
  if (/\b(improv|progress|compare|better|checkpoint|mid.?lesson)\b/i.test(text)) score += 18;
  if (/\b(self.?assess|peer|observe|evidence|track)\b/i.test(text)) score += 15;

  if (!/\b(baseline|first|start|compare|improv)\b/i.test(text)) flags.push("No baseline");
  if (!/\b(evidence|observe|record|check|assess)\b/i.test(text)) flags.push("No evidence collected");
  if (score < 50) flags.push("Progress hidden");

  return {
    score: clamp(score),
    flags: flags.slice(0, 3),
    progressChecks: ["Compare attempt 1 and attempt 5", "Self-rate against WILF mid-lesson"],
    checkpoints: ["After skill block: quick WILF scan", "Before plenary: one improvement named"],
    reflectionPrompts: ["What improved since the start?", "What is your next step?"],
  };
}

export function evaluateStudentSelfEvaluation(ctx: VLLessonContext): {
  score: number;
  flags: string[];
  selfEvaluationPrompts: string[];
  reflectionQuestions: string[];
  confidenceChecks: string[];
} {
  const text = collectVLText(ctx);
  let score = 35;
  const flags: string[] = [];

  if (/\b(reflect|self.?assess|self.?evaluat|self.?rate)\b/i.test(text)) score += 22;
  if (/\b(confidence|goal|target|ownership|my learning)\b/i.test(text)) score += 15;
  if (/\b(traffic light|thumbs|checklist)\b/i.test(text)) score += 12;

  if (score < 50) flags.push("No self evaluation");

  return {
    score: clamp(score),
    flags: flags.slice(0, 2),
    selfEvaluationPrompts: ["Did I meet WILF? What evidence?", "What would I do differently?"],
    reflectionQuestions: ["What did I learn today?", "How do I know I improved?"],
    confidenceChecks: ["Confidence before and after: 1–5", "Thumbs up/sideways/down against WILF"],
  };
}

export function evaluateTeacherImpactEvidence(ctx: VLLessonContext): {
  impactConfidenceScore: number;
  missingEvidence: string[];
  suggestedEvidenceSources: string[];
} {
  const text = collectVLText(ctx);
  let score = 35;
  const missingEvidence: string[] = [];
  const suggestedEvidenceSources: string[] = [];

  if (/\b(assess|evidence|observe|watch for|note|record)\b/i.test(text)) score += 18;
  if (/\b(explain|describe|tell|in own words|question)\b/i.test(text)) score += 15;
  if (/\b(improv|progress|transfer|compare|better)\b/i.test(text)) score += 12;
  if (ctx.assessmentNotes?.trim()) score += 10;

  if (!/\b(observe|assess|evidence)\b/i.test(text)) missingEvidence.push("Observation evidence");
  if (!/\b(explain|describe|question)\b/i.test(text)) missingEvidence.push("Student explanation");
  if (!/\b(improv|progress|compare)\b/i.test(text)) missingEvidence.push("Performance improvement");

  suggestedEvidenceSources.push("30-second WILF observation during practice");
  suggestedEvidenceSources.push("Exit question: explain one learning point");
  suggestedEvidenceSources.push("Compare first and last attempt against criterion");

  return { impactConfidenceScore: clamp(score), missingEvidence: missingEvidence.slice(0, 3), suggestedEvidenceSources: suggestedEvidenceSources.slice(0, 3) };
}

export function evaluateLessonEffectiveness(ctx: VLLessonContext): {
  effectivenessScore: number;
  band: VLQualityBand;
  strongestArea: string;
  weakestArea: string;
  priorityImprovement: string;
  dimensionScores: Record<string, number>;
} {
  const clarity = evaluateTeacherClarity(ctx);
  const challenge = evaluateChallengeLevel(ctx);
  const feedback = evaluateVisibleLearningFeedback(ctx);
  const assessment = evaluateTeacherImpactEvidence(ctx);
  const reflection = evaluateStudentSelfEvaluation(ctx);
  const visibility = evaluateVisibleLearning(ctx);

  const dimensionScores: Record<string, number> = {
    clarity: clarity.clarityScore,
    challenge: challenge.score,
    feedback: feedback.score,
    assessment: assessment.impactConfidenceScore,
    reflection: reflection.score,
    progressVisibility: visibility.visibilityScore,
  };

  const keys = Object.keys(dimensionScores);
  const effectivenessScore = clamp(keys.reduce((s, k) => s + dimensionScores[k], 0) / keys.length);
  const sorted = [...keys].sort((a, b) => dimensionScores[b] - dimensionScores[a]);

  const weakest = sorted[sorted.length - 1];
  const priorityMap: Record<string, string> = {
    clarity: "Clarify WALT and WILF before activity.",
    challenge: "Adjust challenge — simplify or extend.",
    feedback: "Add specific feed-forward against WILF.",
    assessment: "Plan observable evidence collection.",
    reflection: "Add exit self-evaluation against criteria.",
    progressVisibility: "Add progress checkpoint or baseline.",
  };

  return {
    effectivenessScore,
    band: scoreBand(effectivenessScore),
    strongestArea: sorted[0] ?? "clarity",
    weakestArea: weakest ?? "assessment",
    priorityImprovement: priorityMap[weakest] ?? "Review WALT/WILF and evidence.",
    dimensionScores,
  };
}

export function suggestHighImpactPractices(ctx: VLLessonContext): {
  highPriority: string[];
  moderatePriority: string[];
  contextDependent: string[];
} {
  const text = collectVLText(ctx);
  const highPriority: string[] = [];
  const effectiveness = evaluateLessonEffectiveness(ctx);

  if (effectiveness.dimensionScores.clarity < 60) highPriority.push("Teacher clarity — sharpen WALT/WILF");
  if (effectiveness.dimensionScores.feedback < 60) highPriority.push("Formative feedback with feed-forward");
  if (effectiveness.dimensionScores.assessment < 60) highPriority.push("Formative assessment during practice");
  if (effectiveness.dimensionScores.reflection < 60) highPriority.push("Metacognition and self evaluation");
  if (effectiveness.dimensionScores.challenge < 60) highPriority.push("Appropriate challenge level");
  if (!/\b(recall|retriev|remember)\b/i.test(text)) highPriority.push("Retrieval from prior learning");
  if (!/\b(practice|repeat|attempt)\b/i.test(text)) highPriority.push("Deliberate practice with feedback");

  const moderatePriority = [
    "Cooperative learning for peer feedback",
    "Peer learning and observation",
    "Mastery approach — personal best not rank",
  ];

  const contextDependent: string[] = [];
  if (/\b(video|app|technology)\b/i.test(text)) contextDependent.push("Technology for slow-motion review");
  if (/\b(home|homework|outside)\b/i.test(text)) contextDependent.push("Home practice linked to WILF");
  if (/\b(group|team|station)\b/i.test(text)) contextDependent.push("Grouping matched to learning purpose");

  if (highPriority.length === 0) {
    highPriority.push("Maintain clarity and collect impact evidence each lesson");
  }

  return { highPriority: highPriority.slice(0, 5), moderatePriority: moderatePriority.slice(0, 3), contextDependent: contextDependent.slice(0, 2) };
}

export function generateVisibleLearningReview(ctx: VLLessonContext): {
  whatLearning: LearningWalkVerdict;
  whyLearning: LearningWalkVerdict;
  howSuccessful: LearningWalkVerdict;
  nextStep: LearningWalkVerdict;
  recommendations: string[];
} {
  const intentions = evaluateLearningIntentions(ctx);
  const feedback = evaluateVisibleLearningFeedback(ctx);
  const selfEval = evaluateStudentSelfEvaluation(ctx);
  const recommendations: string[] = [];

  const whatLearning: LearningWalkVerdict = intentions.canAnswerWhat ? "yes" : intentions.score >= 45 ? "partly" : "no";
  const whyLearning: LearningWalkVerdict = intentions.canAnswerWhy ? "yes" : "partly";
  const howSuccessful: LearningWalkVerdict = intentions.canAnswerHow ? "yes" : intentions.score >= 40 ? "partly" : "no";
  const nextStep: LearningWalkVerdict = feedback.feedForward ? "yes" : feedback.score >= 45 ? "partly" : "no";

  if (whatLearning !== "yes") recommendations.push("Share and display learning intention in pupil-friendly language.");
  if (howSuccessful !== "yes") recommendations.push("Make success criteria observable and visible.");
  if (nextStep !== "yes") recommendations.push("Ensure every pupil knows one next step from feed-forward.");
  if (selfEval.score < 55) recommendations.push("Add brief self-evaluation against WILF at lesson end.");

  return { whatLearning, whyLearning, howSuccessful, nextStep, recommendations: recommendations.slice(0, 4) };
}

export function evaluateVisibleLearningQuality(ctx: VLLessonContext): {
  score: number;
  band: VLQualityBand;
  warnings: string[];
  practicalFixes: string[];
} {
  const effectiveness = evaluateLessonEffectiveness(ctx);
  const clarity = evaluateTeacherClarity(ctx);
  const wilf = evaluateSuccessCriteria(ctx);
  const challenge = evaluateChallengeLevel(ctx);
  const feedback = evaluateVisibleLearningFeedback(ctx);
  const progress = evaluateProgressVisibility(ctx);
  const selfEval = evaluateStudentSelfEvaluation(ctx);
  const impact = evaluateTeacherImpactEvidence(ctx);

  const warnings: string[] = [];
  const practicalFixes: string[] = [];

  for (const w of VISIBLE_LEARNING_WARNINGS) {
    if (w.id === "no-intention" && clarity.risks.some((r) => r.includes("objective") || r.includes("activity"))) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "unclear-wilf" && wilf.flags.length > 0) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "challenge-low" && challenge.verdict === "too-easy") { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "challenge-high" && challenge.verdict === "excessive-challenge") { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "no-feedback" && feedback.score < 50) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "progress-hidden" && progress.score < 50) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "no-self-eval" && selfEval.score < 50) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "no-evidence" && impact.impactConfidenceScore < 50) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "no-reflection" && selfEval.score < 45) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "no-impact" && impact.missingEvidence.length >= 2) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
  }

  return {
    score: effectiveness.effectivenessScore,
    band: effectiveness.band,
    warnings: [...new Set(warnings)].slice(0, 4),
    practicalFixes: [...new Set(practicalFixes)].slice(0, 4),
  };
}

export function buildVisibleLearningPlanningInsights(
  promptOrText: string,
  ctx?: VLLessonContext
): string[] {
  const context: VLLessonContext = ctx ?? { lessonAim: promptOrText, walt: promptOrText };
  if (!isVisibleLearningRelevant(collectVLText(context) + promptOrText) && !context.lessonAim) return [];

  const clarity = evaluateTeacherClarity(context);
  const wilf = evaluateSuccessCriteria(context);
  const challenge = evaluateChallengeLevel(context);
  const progress = evaluateProgressVisibility(context);
  const intentions = evaluateLearningIntentions(context);
  const insights: string[] = [];

  if (clarity.clarityScore < 55) insights.push("Learning intention is unclear.");
  if (wilf.flags.length > 0) insights.push("Success criteria are difficult to observe.");
  if (progress.score < 55) insights.push("Add a progress checkpoint.");
  if (challenge.verdict === "too-easy") insights.push("Challenge level may be too low.");
  if (!intentions.canAnswerHow) insights.push("Students may struggle to explain what success looks like.");

  if (insights.length === 0) insights.push("Share WILF visibly and check pupil understanding before practice.");

  return insights.slice(0, 5);
}

export function buildPedagogyCoachVLMetrics(lesson: LessonBuilderFormData): {
  teacherClarityScore: number;
  visibleLearningScore: number;
  challengeLevel: string;
  feedbackQuality: string;
  impactEvidenceCheck: string;
  progressVisibilityReview: string;
  warning: string | null;
} {
  const ctx = lessonToVLContext(lesson);
  const clarity = evaluateTeacherClarity(ctx);
  const visibility = evaluateVisibleLearning(ctx);
  const challenge = evaluateChallengeLevel(ctx);
  const feedback = evaluateVisibleLearningFeedback(ctx);
  const impact = evaluateTeacherImpactEvidence(ctx);
  const progress = evaluateProgressVisibility(ctx);
  const quality = evaluateVisibleLearningQuality(ctx);

  return {
    teacherClarityScore: clarity.clarityScore,
    visibleLearningScore: visibility.visibilityScore,
    challengeLevel: challenge.verdict.replace(/-/g, " "),
    feedbackQuality: feedback.improvedExamples[0] ?? (feedback.score >= 60 ? "Feed up/back/forward present" : "Add specific feed-forward"),
    impactEvidenceCheck: impact.missingEvidence[0] ?? "Plan observation and pupil explanation",
    progressVisibilityReview: progress.flags[0] ?? progress.progressChecks[0] ?? "Compare start and end performance",
    warning: quality.warnings[0] ?? null,
  };
}

export function buildVisibleLearningQualityReview(lesson: LessonBuilderFormData): {
  score: number;
  band: VLQualityBand;
  checks: { label: string; met: boolean }[];
  warnings: string[];
  recommendations: string[];
} {
  const ctx = lessonToVLContext(lesson);
  const quality = evaluateVisibleLearningQuality(ctx);
  const effectiveness = evaluateLessonEffectiveness(ctx);
  const intentions = evaluateLearningIntentions(ctx);
  const wilf = evaluateSuccessCriteria(ctx);
  const challenge = evaluateChallengeLevel(ctx);
  const feedback = evaluateVisibleLearningFeedback(ctx);
  const progress = evaluateProgressVisibility(ctx);
  const selfEval = evaluateStudentSelfEvaluation(ctx);
  const impact = evaluateTeacherImpactEvidence(ctx);

  const checks = [
    { label: "Learning intention", met: intentions.canAnswerWhat },
    { label: "Success criteria", met: wilf.score >= 55 && wilf.flags.length === 0 },
    { label: "Challenge", met: challenge.verdict === "appropriate-challenge" },
    { label: "Feedback", met: feedback.score >= 55 },
    { label: "Progress visibility", met: progress.score >= 55 },
    { label: "Self evaluation", met: selfEval.score >= 55 },
    { label: "Assessment evidence", met: impact.impactConfidenceScore >= 55 },
    { label: "Teacher impact evidence", met: impact.missingEvidence.length <= 1 },
  ];

  return {
    score: quality.score,
    band: quality.band,
    checks,
    warnings: quality.warnings,
    recommendations: quality.practicalFixes.length > 0 ? quality.practicalFixes : [effectiveness.priorityImprovement],
  };
}

export function buildVisibleLearningQualityInsights(lesson: LessonBuilderFormData): VLQualityInsight[] {
  const review = buildVisibleLearningQualityReview(lesson);
  const insights: VLQualityInsight[] = [];

  insights.push({
    id: "vl-review",
    area: "Visible Learning Review",
    message: `${review.band} visible learning design (${review.score}/100)`,
    prompt: review.checks.filter((c) => !c.met).map((c) => c.label).join("; ") || "Core checks met",
    entryId: "visible-learning-master",
  });

  for (const w of review.warnings.slice(0, 2)) {
    const fix = VISIBLE_LEARNING_WARNINGS.find((x) => x.warning === w);
    insights.push({
      id: `vl-${w.slice(0, 12)}`,
      area: "Visible Learning",
      message: w,
      prompt: fix?.whyItMatters,
      entryId: "visible-learning-master",
      fix: fix
        ? {
            target: w.includes("intention") || w.includes("criteria") ? "successCriteria" : w.includes("feedback") ? "assessmentNotes" : "reflectionNotes",
            text: fix.suggestedFix,
            actionLabel: "Apply fix",
          }
        : undefined,
    });
  }

  return insights;
}

export function buildSchemeVisibleLearningTips(
  scheme: Pick<SchemeOfWork, "lessons" | "topicId" | "yearGroup">,
  activeLessonIndex = 0
): string[] {
  const lessons = scheme.lessons;
  const text = lessons.map((l) => `${l.walt} ${l.wilf ?? ""} ${l.activities}`).join(" ");
  const ctx: VLLessonContext = { yearGroup: scheme.yearGroup, walt: text, wilf: text, activities: text };

  const tips: string[] = [
    "Progression visibility: share unit WALT arc across lessons",
    `Assessment checkpoint: lesson ${Math.min(activeLessonIndex + 2, lessons.length)} — WILF evidence collection`,
    `Retrieval checkpoint: lesson ${Math.min(activeLessonIndex + 1, lessons.length)} starter recalls prior lesson`,
    "Reflection opportunity: exit self-evaluate against WILF each lesson",
    "Self evaluation: traffic-light or thumbs against criteria in final 3 minutes",
  ];

  const impact = evaluateTeacherImpactEvidence(ctx);
  if (impact.missingEvidence.length > 0) {
    tips.push(`Impact evidence: add ${impact.suggestedEvidenceSources[0]}`);
  }

  return tips.slice(0, 6);
}
