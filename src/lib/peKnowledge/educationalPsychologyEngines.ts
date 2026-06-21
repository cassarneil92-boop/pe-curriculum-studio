/**
 * Educational Psychology Master Pack v1 — engines.
 */

import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import type { SchemeOfWork } from "@/lib/types";
import type { LessonApplyTarget } from "./applySuggestions";
import type { LessonKnowledgeContext } from "./types";
import {
  EDUCATIONAL_PSYCHOLOGY_WARNINGS,
  isEducationalPsychologyRelevant,
} from "./educationalPsychologyMaster";
import { isPrimaryPEYearGroup } from "./primaryPEMaster";

export type EPQualityBand = "Exceptional" | "Strong" | "Developing" | "Limited";

export type WorkingMemoryVerdict = "manageable" | "stretching" | "overloaded";

export type ExpertiseLevel = "novice" | "developing" | "experienced";

export type EPTransferPotential = "low" | "moderate" | "high";

export interface EPLessonContext extends LessonKnowledgeContext {
  topicId?: string;
  walt?: string;
  wilf?: string;
  activities?: string;
  differentiation?: string;
  assessmentNotes?: string;
  reflectionNotes?: string;
  structuredActivityText?: string;
}

export interface EPQualityInsight {
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

function scoreBand(score: number): EPQualityBand {
  if (score >= 90) return "Exceptional";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Developing";
  return "Limited";
}

export function lessonToEPContext(lesson: LessonBuilderFormData): EPLessonContext {
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

export function collectEPText(ctx: EPLessonContext): string {
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

function countInstructionLoad(text: string): number {
  let load = 0;
  const cues = text.match(/\bcue|point|remember|rule|step \d|first|second|third|also|then|and\b/gi);
  if (cues) load += Math.min(cues.length, 8);
  if (/\b(tactic|strategy|formation|complex|multiple)\b/i.test(text)) load += 2;
  if (/\b(transition|station|rotate|phase)\b/i.test(text)) load += 1;
  if (/\b(new|introduce|first time)\b/i.test(text)) load += 2;
  return load;
}

export function evaluateWorkingMemoryLoad(ctx: EPLessonContext): {
  loadScore: number;
  verdict: WorkingMemoryVerdict;
  flags: string[];
  simplificationSuggestions: string[];
} {
  const text = collectEPText(ctx);
  const rawLoad = countInstructionLoad(text);
  const isPrimary = isPrimaryPEYearGroup(ctx.yearGroup);
  const threshold = isPrimary ? 5 : 7;
  const loadScore = clamp(30 + rawLoad * 8);

  const flags: string[] = [];
  const simplificationSuggestions: string[] = [];

  if (rawLoad > threshold) {
    flags.push("Too many instructions");
    simplificationSuggestions.push("Reduce to one cue per activity block.");
  }
  if (/\b(five|four|three) (cue|point|rule|coaching)\b/i.test(text) || (text.match(/\bcue\b/gi)?.length ?? 0) > 3) {
    flags.push("Too many coaching points");
    simplificationSuggestions.push("Keep one teaching point visible — fade others.");
  }
  if (/\b(many rules|full rules|complex rules|all rules)\b/i.test(text)) {
    flags.push("Too many rules");
    simplificationSuggestions.push("One rule only — add when secure.");
  }
  if (/\b(transition|rotate|station change|multiple phase)\b/i.test(text) && rawLoad > 4) {
    flags.push("Too many transitions");
    simplificationSuggestions.push("Fewer phases — longer practice blocks.");
  }

  let verdict: WorkingMemoryVerdict = "manageable";
  if (loadScore >= 75) verdict = "overloaded";
  else if (loadScore >= 55) verdict = "stretching";

  if (simplificationSuggestions.length === 0) simplificationSuggestions.push("Load appears manageable — monitor during teaching.");

  return { loadScore, verdict, flags: flags.slice(0, 4), simplificationSuggestions: simplificationSuggestions.slice(0, 4) };
}

export function evaluateCognitiveLoad(ctx: EPLessonContext): {
  intrinsic: number;
  extraneous: number;
  germane: number;
  strengths: string[];
  risks: string[];
  improvements: string[];
} {
  const text = collectEPText(ctx);
  let intrinsic = 45;
  let extraneous = 50;
  let germane = 45;
  const strengths: string[] = [];
  const risks: string[] = [];
  const improvements: string[] = [];

  if (/\b(complex|tactical|decision|problem|challenge)\b/i.test(text)) intrinsic += 20;
  if (/\b(simple|introduce|explore|basic)\b/i.test(text)) intrinsic += 5;

  if (/\b(clear|one cue|show then|station|labelled|visual)\b/i.test(text)) extraneous -= 15;
  if (/\b(long explain|talk|lecture|clutter|confus|too many)\b/i.test(text)) extraneous += 20;
  if (/\b(scaffold|support|guided|demo)\b/i.test(text)) germane += 20;
  if (/\b(think|decide|why|reflect|problem)\b/i.test(text)) germane += 15;

  intrinsic = clamp(intrinsic);
  extraneous = clamp(extraneous);
  germane = clamp(germane);

  if (extraneous >= 60) {
    risks.push("Extraneous load — unnecessary confusion");
    improvements.push("Shorten explanation — demonstrate instead.");
  }
  if (germane >= 60) strengths.push("Productive thinking demand present");
  if (intrinsic >= 65 && extraneous >= 55) {
    risks.push("High intrinsic plus extraneous load");
    improvements.push("Simplify task before adding complexity.");
  }
  if (germane < 45) improvements.push("Add meaningful decision or reflection moment.");

  return { intrinsic, extraneous, germane, strengths, risks: risks.slice(0, 3), improvements: improvements.slice(0, 3) };
}

export function evaluatePriorKnowledgeActivation(ctx: EPLessonContext): {
  score: number;
  flags: string[];
  suggestions: string[];
} {
  const text = collectEPText(ctx);
  let score = 35;
  const flags: string[] = [];
  const suggestions: string[] = [];

  if (/\b(recall|remember|last lesson|previous|prior|already know|activate|recap)\b/i.test(text)) score += 30;
  if (/\b(link|connect|build on|spiral|revisit)\b/i.test(text)) score += 20;
  if (/\b(experience|familiar|before|last unit)\b/i.test(text)) score += 10;

  if (score < 55) {
    flags.push("Prior knowledge not activated");
    suggestions.push("Starter: what do you remember about…?");
    suggestions.push("Movement recall from last lesson.");
    suggestions.push("Tactical recall before new content.");
  }
  if (/\b(new skill|first time|never)\b/i.test(text) && !/\b(recall|prior|link)\b/i.test(text)) {
    flags.push("Learning assumed without activation");
    suggestions.push("Check baseline before teaching new content.");
  }

  return { score: clamp(score), flags: flags.slice(0, 3), suggestions: suggestions.slice(0, 4) };
}

export function evaluateSchemaBuilding(ctx: EPLessonContext): {
  schemaScore: number;
  flags: string[];
  improvementSuggestions: string[];
} {
  const text = collectEPText(ctx);
  let schemaScore = 40;
  const flags: string[] = [];
  const improvementSuggestions: string[] = [];

  if (/\b(progress|build|connect|unit|scheme|sequence|spiral|develop)\b/i.test(text)) schemaScore += 20;
  if (/\b(link|chunk|phase|part of|because)\b/i.test(text)) schemaScore += 15;
  if (/\b(repeat|revisit|meaning|concept)\b/i.test(text)) schemaScore += 12;

  if (!/\b(connect|link|unit|progress|build)\b/i.test(text)) {
    flags.push("Isolated lesson risk");
    improvementSuggestions.push("State how today connects to unit progression.");
  }
  if (/\b(random|variety only|unrelated)\b/i.test(text)) {
    flags.push("Disconnected learning sequence");
    improvementSuggestions.push("Align activities to one coherent learning thread.");
  }

  return { schemaScore: clamp(schemaScore), flags: flags.slice(0, 2), improvementSuggestions: improvementSuggestions.slice(0, 3) };
}

export function evaluateLearnerExpertise(ctx: EPLessonContext): {
  inferredLevel: ExpertiseLevel;
  flags: string[];
  instructionAdjustments: string[];
  taskAdjustments: string[];
  feedbackAdjustments: string[];
} {
  const text = collectEPText(ctx);
  const year = ctx.yearGroup ?? "";
  let inferredLevel: ExpertiseLevel = "developing";

  if (isPrimaryPEYearGroup(year) || /year-[1-4]/i.test(year)) inferredLevel = "novice";
  if (/year-10|year-11|form/i.test(year)) inferredLevel = "experienced";

  const flags: string[] = [];
  const instructionAdjustments: string[] = [];
  const taskAdjustments: string[] = [];
  const feedbackAdjustments: string[] = [];

  if (inferredLevel === "novice" && /\b(complex tactic|full rules|minimal instruction|discover only)\b/i.test(text)) {
    flags.push("Novice treated as expert");
    instructionAdjustments.push("More explicit demo and one cue.");
    taskAdjustments.push("Simplify rules and space.");
    feedbackAdjustments.push("Specific corrective feed-forward.");
  }
  if (inferredLevel === "experienced" && /\b(full demo|step by step only|no choice)\b/i.test(text) && !/\bextend|challenge\b/i.test(text)) {
    flags.push("Expert restricted by oversimplification");
    instructionAdjustments.push("Brief recap then problem-solving task.");
    taskAdjustments.push("Add decision constraints and opposition.");
    feedbackAdjustments.push("Peer and self-analysis against criteria.");
  }

  if (flags.length === 0) {
    instructionAdjustments.push(`Match instruction to ${inferredLevel} learners.`);
  }

  return { inferredLevel, flags, instructionAdjustments, taskAdjustments, feedbackAdjustments };
}

export function evaluateMetacognition(ctx: EPLessonContext): {
  score: number;
  flags: string[];
  planningPrompt: string;
  monitoringPrompt: string;
  reflectionPrompt: string;
} {
  const text = collectEPText(ctx);
  let score = 35;
  const flags: string[] = [];

  if (/\b(plan|target|goal|focus on|intention)\b/i.test(text)) score += 15;
  if (/\b(monitor|check|during|self.?rate|am i)\b/i.test(text)) score += 15;
  if (/\b(reflect|evaluate|what improved|what changed|review)\b/i.test(text)) score += 20;
  if (/\b(self.?assess|self.?regulat)\b/i.test(text)) score += 12;

  if (score < 50) flags.push("No self assessment or reflection");
  if (!/\b(reflect|evaluate)\b/i.test(text)) flags.push("Reflection absent");

  return {
    score: clamp(score),
    flags: flags.slice(0, 2),
    planningPrompt: "What will you focus on improving today?",
    monitoringPrompt: "Are you meeting WILF — what evidence do you see?",
    reflectionPrompt: "What worked, what will you change next time?",
  };
}

export function evaluateScaffolding(ctx: EPLessonContext): {
  score: number;
  flags: string[];
  suggestions: string[];
} {
  const text = collectEPText(ctx);
  let score = 45;
  const flags: string[] = [];
  const suggestions: string[] = [];

  if (/\b(demo|model|show|example)\b/i.test(text)) score += 15;
  if (/\b(guided|cue|support|scaffold|partner|assist)\b/i.test(text)) score += 18;
  if (/\b(independ|fade|release|own|without help)\b/i.test(text)) score += 12;
  if (/\b(i do|we do|you do|gradual)\b/i.test(text)) score += 15;

  if (score < 50) {
    flags.push("Support missing for new learning");
    suggestions.push("Add demo and guided practice with one cue.");
  }
  if (/\b(always help|never independent|teacher tells)\b/i.test(text)) {
    flags.push("Independence prevented");
    suggestions.push("Fade scaffold — pupils try without cue card.");
  }
  if (/\b(no demo|no support)\b/i.test(text)) suggestions.push("Scaffold before expecting independence.");

  return { score: clamp(score), flags: flags.slice(0, 2), suggestions: suggestions.slice(0, 3) };
}

export function evaluateInstructionalClarity(ctx: EPLessonContext): {
  score: number;
  flags: string[];
  fixes: string[];
} {
  const text = collectEPText(ctx);
  let score = 55;
  const flags: string[] = [];
  const fixes: string[] = [];

  if (/\b(clear|one|simple|objective|walt|wilf)\b/i.test(text)) score += 15;
  if (/\b(sequence|first|then|finally|phase)\b/i.test(text)) score += 10;
  if (/\b(long talk|explain for|lecture|minutes explaining)\b/i.test(text)) {
    score -= 15;
    flags.push("Too much talking");
    fixes.push("Maximum 30 seconds instruction — then practice.");
  }
  if (!/\b(walt|wilf|learning intention|success criteria|objective)\b/i.test(text)) {
    flags.push("Unclear objective");
    fixes.push("State one clear WALT and WILF.");
  }
  if (/\b(and also|multiple|several message)\b/i.test(text)) {
    flags.push("Multiple messages");
    fixes.push("One message per teaching moment.");
  }

  return { score: clamp(score), flags: flags.slice(0, 3), fixes: fixes.slice(0, 3) };
}

export function evaluateInstructionStrategy(ctx: EPLessonContext): {
  recommendedApproach: string;
  rationale: string;
  alternatives: string[];
} {
  const text = collectEPText(ctx);
  const expertise = evaluateLearnerExpertise(ctx);

  if (/\b(game|tactic|invasion|tgfu|problem)\b/i.test(text) && expertise.inferredLevel !== "novice") {
    return {
      recommendedApproach: "Guided discovery / TGfU",
      rationale: "Game context with tactical problem suits developing decision-making.",
      alternatives: ["Mixed: brief explicit cue then game", "Cooperative learning for group tactics"],
    };
  }
  if (/\b(new skill|first time|fms|fundamental|primary)\b/i.test(text) || expertise.inferredLevel === "novice") {
    return {
      recommendedApproach: "Explicit teaching with guided practice",
      rationale: "Novice learners benefit from clear demo, one cue, and repeated guided practice.",
      alternatives: ["Short explore then explicit teach", "Cooperative pairs for peer modelling"],
    };
  }
  if (/\b(group|team|cooperat|role)\b/i.test(text)) {
    return {
      recommendedApproach: "Cooperative learning structure",
      rationale: "Social regulation and peer support match group task design.",
      alternatives: ["Explicit instruction for skill then cooperative application"],
    };
  }
  return {
    recommendedApproach: "Mixed approach",
    rationale: "Brief explicit instruction, guided practice, then application with reflection.",
    alternatives: ["Inquiry for tactical problem", "Direct instruction for safety-critical points"],
  };
}

export function evaluateFeedbackQuality(ctx: EPLessonContext): {
  score: number;
  feedUp: boolean;
  feedback: boolean;
  feedForward: boolean;
  flags: string[];
  betterExamples: string[];
} {
  const text = collectEPText(ctx);
  let score = 40;
  const feedUp = /\b(wilf|success criteria|goal|target|intention|walt)\b/i.test(text);
  const feedback = /\b(observe|watch for|current|evidence|compare)\b/i.test(text);
  const feedForward = /\b(next|improve|try|feed.?forward|adjust|correct)\b/i.test(text);
  const flags: string[] = [];
  const betterExamples: string[] = [];

  if (feedUp) score += 20;
  if (feedback) score += 15;
  if (feedForward) score += 20;
  if (/\b(specific|cue|because|when you)\b/i.test(text)) score += 10;

  if (/\b(good job|well done|great)\b/i.test(text) && !feedForward) {
    flags.push("Praise only");
    betterExamples.push("Next rep: step opposite foot — that will add power.");
  }
  if (!feedForward) {
    flags.push("No next step");
    betterExamples.push("Feed forward: one thing to try on the next attempt.");
  }
  if (!feedUp) betterExamples.push("Feed up: remind WILF before practice.");

  return { score: clamp(score), feedUp, feedback, feedForward, flags: flags.slice(0, 2), betterExamples: betterExamples.slice(0, 3) };
}

export function evaluateAssessmentForLearning(ctx: EPLessonContext): {
  score: number;
  flags: string[];
  improvements: string[];
} {
  const text = collectEPText(ctx);
  let score = 40;
  const flags: string[] = [];
  const improvements: string[] = [];

  if (/\b(wilf|success criteria)\b/i.test(text)) score += 15;
  if (/\b(check|question|observe|scan|mid.?lesson)\b/i.test(text)) score += 15;
  if (/\b(peer assess|self assess|self.?check)\b/i.test(text)) score += 15;
  if (/\b(exit|plenary|review|evidence)\b/i.test(text)) score += 10;

  if (!/\b(wilf|success criteria)\b/i.test(text)) {
    flags.push("Unclear success criteria");
    improvements.push("Write observable WILF.");
  }
  if (!/\b(check|observe|question|mid)\b/i.test(text) && /\b(end|plenary only)\b/i.test(text)) {
    flags.push("Assessment only at end");
    improvements.push("Add mid-lesson check for understanding.");
  }
  if (improvements.length === 0) improvements.push("Use 30-second observation against WILF during practice.");

  return { score: clamp(score), flags: flags.slice(0, 2), improvements: improvements.slice(0, 3) };
}

export function evaluateLearningTransfer(ctx: EPLessonContext): {
  transferPotential: EPTransferPotential;
  transferSuggestions: string[];
} {
  const text = collectEPText(ctx);
  let points = 0;
  if (/\b(other sport|another game|transfer|apply|different context)\b/i.test(text)) points += 2;
  if (/\b(daily life|home|health habit|life skill)\b/i.test(text)) points += 2;
  if (/\b(previous unit|tactical|movement concept)\b/i.test(text)) points += 1;

  let transferPotential: EPTransferPotential = "low";
  if (points >= 4) transferPotential = "high";
  else if (points >= 2) transferPotential = "moderate";

  const transferSuggestions =
    transferPotential === "low"
      ? ["Apply skill in second game context", "Link tactic to another invasion sport", "Name health or life application"]
      : ["Explicit compare: how is this like last unit?", "Test in novel space or rule set"];

  return { transferPotential, transferSuggestions };
}

export function evaluateLearningContext(ctx: EPLessonContext): {
  opportunities: string[];
  risks: string[];
} {
  const text = collectEPText(ctx);
  const opportunities: string[] = [];
  const risks: string[] = [];

  if (/\b(inclus|differentiat|send|lsa|mixed ability)\b/i.test(text)) opportunities.push("Inclusive task design considered");
  if (/\b(relate|trust|respect|positive)\b/i.test(text)) opportunities.push("Supportive class culture");
  if (/\b(station|space|outdoor|hall)\b/i.test(text)) opportunities.push("Environment planned for activity");

  if (!/\b(differentiat|inclus|support)\b/i.test(text)) risks.push("Inclusion needs may be unaddressed");
  if (/\b(competitive only|rank|elimination)\b/i.test(text)) risks.push("Motivation risk for lower confidence pupils");
  if (/\b(crowded|limited space)\b/i.test(text) && !/\b(adapt|modify)\b/i.test(text)) risks.push("Facility constraints may increase extraneous load");

  return { opportunities: opportunities.slice(0, 3), risks: risks.slice(0, 3) };
}

export function detectLearningMisconceptions(ctx: EPLessonContext): {
  detected: string[];
  clarificationPrompts: string[];
  correctiveTasks: string[];
} {
  const text = collectEPText(ctx);
  const detected: string[] = [];
  const clarificationPrompts: string[] = [];
  const correctiveTasks: string[] = [];

  if (/\b(easy|simple drill|blocked|repeat)\b/i.test(text) && !/\b(check|self.?assess|new context)\b/i.test(text)) {
    detected.push("Performance may be mistaken for learning");
    clarificationPrompts.push("Does easy success mean you have learned it for any context?");
    correctiveTasks.push("Same skill — new distance or defender.");
  }
  if (/\b(win|score|beat)\b/i.test(text) && !/\b(wilf|process|effort)\b/i.test(text)) {
    detected.push("Success may be mistaken for understanding");
    clarificationPrompts.push("What skill helped you succeed — not just the score?");
  }
  if (/\b(effort only|try hard)\b/i.test(text) && !/\b(technique|cue|feedback)\b/i.test(text)) {
    detected.push("Effort alone may be seen as sufficient");
    clarificationPrompts.push("What technique change improves performance?");
  }
  if (/\b(pass|tactic|attack)\b/i.test(text) && !/\b(when|why|decision)\b/i.test(text)) {
    detected.push("Tactical misunderstanding may persist");
    clarificationPrompts.push("When is pass better than dribble?");
    correctiveTasks.push("Constrained game forcing pass decision.");
  }

  return { detected: detected.slice(0, 3), clarificationPrompts: clarificationPrompts.slice(0, 3), correctiveTasks: correctiveTasks.slice(0, 3) };
}

export function evaluateEducationalPsychologyQuality(ctx: EPLessonContext): {
  score: number;
  band: EPQualityBand;
  dimensionScores: Record<string, number>;
  warnings: string[];
  practicalFixes: string[];
  strongestArea: string;
  weakestArea: string;
} {
  const wm = evaluateWorkingMemoryLoad(ctx);
  const cl = evaluateCognitiveLoad(ctx);
  const prior = evaluatePriorKnowledgeActivation(ctx);
  const schema = evaluateSchemaBuilding(ctx);
  const meta = evaluateMetacognition(ctx);
  const scaffold = evaluateScaffolding(ctx);
  const instruction = evaluateInstructionalClarity(ctx);
  const feedback = evaluateFeedbackQuality(ctx);
  const afl = evaluateAssessmentForLearning(ctx);
  const transfer = evaluateLearningTransfer(ctx);

  const dimensionScores: Record<string, number> = {
    memory: clamp(100 - wm.loadScore + 20),
    load: clamp(100 - cl.extraneous + cl.germane / 2),
    priorKnowledge: prior.score,
    schema: schema.schemaScore,
    metacognition: meta.score,
    scaffolding: scaffold.score,
    instruction: instruction.score,
    feedback: feedback.score,
    assessment: afl.score,
    transfer: transfer.transferPotential === "high" ? 80 : transfer.transferPotential === "moderate" ? 58 : 38,
  };

  const keys = Object.keys(dimensionScores);
  const score = clamp(keys.reduce((s, k) => s + dimensionScores[k], 0) / keys.length);
  const sorted = [...keys].sort((a, b) => dimensionScores[b] - dimensionScores[a]);

  const warnings: string[] = [];
  const practicalFixes: string[] = [];

  for (const w of EDUCATIONAL_PSYCHOLOGY_WARNINGS) {
    if (w.id === "too-many-instructions" && wm.flags.includes("Too many instructions")) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "overload" && wm.verdict === "overloaded") { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "assumes-prior" && prior.flags.some((f) => f.includes("assumed"))) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "no-retrieval" && prior.score < 50) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "weak-scaffold" && scaffold.score < 50) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "vague-feedback" && feedback.flags.includes("Praise only")) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "assessment-late" && afl.flags.includes("Assessment only at end")) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "no-reflection" && meta.score < 50) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "no-transfer" && transfer.transferPotential === "low") { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
    if (w.id === "misconception" && detectLearningMisconceptions(ctx).detected.length > 0) { warnings.push(w.warning); practicalFixes.push(w.suggestedFix); }
  }

  return {
    score,
    band: scoreBand(score),
    dimensionScores,
    warnings: [...new Set(warnings)].slice(0, 4),
    practicalFixes: [...new Set(practicalFixes)].slice(0, 4),
    strongestArea: sorted[0] ?? "instruction",
    weakestArea: sorted[sorted.length - 1] ?? "transfer",
  };
}

export function buildEducationalPsychologyPlanningInsights(
  promptOrText: string,
  ctx?: EPLessonContext
): string[] {
  const context: EPLessonContext = ctx ?? { lessonAim: promptOrText, walt: promptOrText };
  const text = collectEPText(context) + promptOrText;
  if (!isEducationalPsychologyRelevant(text) && !context.lessonAim) return [];

  const wm = evaluateWorkingMemoryLoad(context);
  const prior = evaluatePriorKnowledgeActivation(context);
  const scaffold = evaluateScaffolding(context);
  const insights: string[] = [];

  if (wm.verdict === "overloaded" || wm.verdict === "stretching") insights.push("Working memory may be overloaded.");
  if (wm.flags.includes("Too many coaching points")) insights.push("Too many coaching points for this age group.");
  if (prior.score < 55) {
    insights.push("Prior knowledge is not activated.");
    insights.push("Add retrieval before introducing new content.");
  }
  if (scaffold.score < 55) insights.push("This task may need stronger scaffolding.");

  if (insights.length === 0) insights.push("Instruction clarity and one cue per block support memory.");

  return [...new Set(insights)].slice(0, 5);
}

export function buildPedagogyCoachEPMetrics(lesson: LessonBuilderFormData): {
  score: number;
  band: string;
  workingMemoryLoad: string;
  cognitiveLoadRisk: string | null;
  metacognitionPrompt: string;
  feedbackImprovement: string;
  transferSuggestion: string;
  warning: string | null;
} {
  const ctx = lessonToEPContext(lesson);
  const quality = evaluateEducationalPsychologyQuality(ctx);
  const wm = evaluateWorkingMemoryLoad(ctx);
  const cl = evaluateCognitiveLoad(ctx);
  const meta = evaluateMetacognition(ctx);
  const feedback = evaluateFeedbackQuality(ctx);
  const transfer = evaluateLearningTransfer(ctx);

  return {
    score: quality.score,
    band: quality.band,
    workingMemoryLoad: wm.verdict,
    cognitiveLoadRisk: cl.risks[0] ?? null,
    metacognitionPrompt: meta.reflectionPrompt,
    feedbackImprovement: feedback.betterExamples[0] ?? "Add specific feed-forward against WILF.",
    transferSuggestion: transfer.transferSuggestions[0],
    warning: quality.warnings[0] ?? null,
  };
}

export function buildEducationalPsychologyQualityReview(lesson: LessonBuilderFormData): {
  score: number;
  band: EPQualityBand;
  checks: { label: string; met: boolean }[];
  warnings: string[];
  recommendations: string[];
} {
  const ctx = lessonToEPContext(lesson);
  const quality = evaluateEducationalPsychologyQuality(ctx);

  const checks = [
    { label: "Memory support", met: quality.dimensionScores.memory >= 55 },
    { label: "Cognitive load managed", met: quality.dimensionScores.load >= 55 },
    { label: "Prior knowledge activated", met: quality.dimensionScores.priorKnowledge >= 55 },
    { label: "Scaffolding", met: quality.dimensionScores.scaffolding >= 55 },
    { label: "Feedback quality", met: quality.dimensionScores.feedback >= 55 },
    { label: "Assessment for learning", met: quality.dimensionScores.assessment >= 55 },
    { label: "Metacognition", met: quality.dimensionScores.metacognition >= 55 },
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

export function buildEducationalPsychologyQualityInsights(lesson: LessonBuilderFormData): EPQualityInsight[] {
  const review = buildEducationalPsychologyQualityReview(lesson);
  const insights: EPQualityInsight[] = [];

  insights.push({
    id: "ep-review",
    area: "Educational Psychology Review",
    message: `${review.band} learning design (${review.score}/100)`,
    prompt: review.checks.filter((c) => !c.met).map((c) => c.label).join("; ") || "Core checks met",
    entryId: "educational-psychology-master",
  });

  for (const w of review.warnings.slice(0, 2)) {
    const fix = EDUCATIONAL_PSYCHOLOGY_WARNINGS.find((x) => x.warning === w);
    insights.push({
      id: `ep-${w.slice(0, 12)}`,
      area: "Educational Psychology",
      message: w,
      prompt: fix?.whyItMatters,
      entryId: "educational-psychology-master",
      fix: fix
        ? {
            target: w.includes("retrieval") || w.includes("Reflection") ? "reflectionNotes" : w.includes("feedback") ? "assessmentNotes" : "differentiation",
            text: fix.suggestedFix,
            actionLabel: "Apply fix",
            asQuestions: w.includes("retrieval"),
          }
        : undefined,
    });
  }

  return insights;
}

export function buildSchemeEducationalPsychologyTips(
  scheme: Pick<SchemeOfWork, "lessons" | "topicId" | "yearGroup">,
  activeLessonIndex = 0
): string[] {
  const lessons = scheme.lessons;
  const text = lessons.map((l) => `${l.walt} ${l.activities}`).join(" ");
  const ctx: EPLessonContext = { yearGroup: scheme.yearGroup, walt: text, activities: text };
  const schema = evaluateSchemaBuilding(ctx);
  const prior = evaluatePriorKnowledgeActivation(ctx);
  const transfer = evaluateLearningTransfer(ctx);
  const afl = evaluateAssessmentForLearning(ctx);

  const tips: string[] = [
    `Schema development: ${schema.improvementSuggestions[0] ?? "Connect each lesson to unit thread"}`,
    `Retrieval: Lesson ${Math.min(activeLessonIndex + 2, lessons.length)} — recall lesson ${Math.max(1, activeLessonIndex)} focus`,
    "Scaffolding progression: demo → guided → independent across unit",
    `Transfer: ${transfer.transferSuggestions[0]}`,
    `Assessment checkpoint: mid-lesson WILF scan in lesson ${activeLessonIndex + 1}`,
  ];

  if (prior.score < 55) tips.push("Activate prior knowledge at start of each lesson in unit.");
  if (afl.flags[0]) tips.push(afl.improvements[0] ?? "Add AfL during practice not only plenary.");

  return tips.slice(0, 6);
}
