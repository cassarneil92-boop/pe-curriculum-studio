/**
 * Teaching for Learning Master Pack v1 — evaluation and suggestion engines.
 */

import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import type { SchemeOfWork, SOWLesson } from "@/lib/types";
import type { LessonApplyTarget } from "./applySuggestions";
import type { LessonKnowledgeContext } from "./types";
import {
  CONTENT_DEVELOPMENT_MODEL,
  type ContentDevelopmentType,
} from "./teachingForLearningMaster";

export type TFLQualityBand = "Exceptional" | "Strong" | "Developing" | "Limited";

export interface TFLLessonContext extends LessonKnowledgeContext {
  topicId?: string;
  skillId?: string;
  walt?: string;
  wilf?: string;
  activities?: string;
  assessmentNotes?: string;
  differentiation?: string;
  safetyConsiderations?: string;
  reflectionNotes?: string;
  structuredActivityText?: string;
}

export interface LearningExperienceQualityResult {
  score: number;
  band: TFLQualityBand;
  strengths: string[];
  weaknesses: string[];
  practicalFixes: string[];
  flags: string[];
}

export interface MovementTaskSuggestion {
  taskName: string;
  taskPurpose: string;
  organisation: string;
  equipment: string;
  studentChallenge: string;
  successCriteria: string;
  teacherObservationFocus: string;
  progressionOption: string;
  simplificationOption: string;
}

export interface TFLQualityInsight {
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

function scoreBand(score: number): TFLQualityBand {
  if (score >= 90) return "Exceptional";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Developing";
  return "Limited";
}

export function lessonToTFLContext(lesson: LessonBuilderFormData): TFLLessonContext {
  const structured = (lesson.structuredActivities ?? [])
    .map(
      (a) =>
        `${a.name} ${a.taskDescription} ${a.spaceEquipment} ${a.teachingCues.join(" ")} ${a.differentiationEasier} ${a.differentiationHarder}`
    )
    .join(" ");
  return {
    yearGroup: lesson.yearGroup,
    topicId: lesson.topicId,
    skillId: lesson.skillId,
    walt: lesson.walt ?? lesson.learningIntention,
    wilf: lesson.successCriteria,
    activities: lesson.activities,
    assessmentNotes: lesson.assessmentNotes,
    differentiation: lesson.differentiation,
    safetyConsiderations: lesson.safetyConsiderations,
    reflectionNotes: lesson.reflectionNotes,
    structuredActivityText: structured,
  };
}

export function collectTFLText(ctx: TFLLessonContext): string {
  return [
    ctx.walt,
    ctx.wilf,
    ctx.activities,
    ctx.structuredActivityText,
    ctx.assessmentNotes,
    ctx.differentiation,
    ctx.safetyConsiderations,
    ctx.reflectionNotes,
    ctx.lessonAim,
    ctx.activityArea,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function evaluateLearningExperienceQuality(
  ctx: TFLLessonContext
): LearningExperienceQualityResult {
  const text = collectTFLText(ctx);
  const flags: string[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const practicalFixes: string[] = [];
  let score = 40;

  const hasWalt = Boolean(ctx.walt?.trim());
  const hasWilf = Boolean(ctx.wilf?.trim());
  const hasActivities = Boolean(ctx.activities?.trim() || ctx.structuredActivityText?.trim());
  const hasAssessment = Boolean(ctx.assessmentNotes?.trim()) || /\bassess|wilf|i can\b/i.test(text);
  const hasDifferentiation = Boolean(ctx.differentiation?.trim()) || /\beasier|harder|support|adapt\b/i.test(text);
  const hasSafety = Boolean(ctx.safetyConsiderations?.trim()) || /\bsafe|boundary|warm.?up\b/i.test(text);

  if (hasWalt) {
    score += 12;
    strengths.push("Learning goal present");
  } else {
    flags.push("Activity with no learning goal");
    weaknesses.push("Missing WALT / learning intention");
    practicalFixes.push("Add WALT: We are learning to… before activities.");
  }

  if (hasWilf) {
    score += 10;
    strengths.push("Success criteria documented");
  } else {
    flags.push("No student success criteria");
    weaknesses.push("Missing WILF");
    practicalFixes.push("Add 2–3 I can… success criteria pupils can self-check.");
  }

  if (hasActivities) score += 8;
  else weaknesses.push("No activities described");

  if (/\bskill|improve|learn|decision|tactic|quality|control\b/i.test(text)) {
    score += 10;
    strengths.push("Skill or understanding development likely");
  } else if (/\bplay|game|fun\b/i.test(text) && !hasWalt) {
    flags.push("Game for fun only");
    practicalFixes.push("Name the learning problem the game addresses.");
  }

  if (/\bqueue|wait|line up|one at a time\b/i.test(text) && !/\bstation|rotate|small group|pair\b/i.test(text)) {
    flags.push("Long waiting lines likely");
    score -= 10;
    practicalFixes.push("Replace lines with multiple small stations or pairs.");
  }

  if (/\bone ball\b|\bsingle ball\b|\btoo many\b/i.test(text)) {
    flags.push("One ball for too many pupils");
    practicalFixes.push("Increase equipment ratio — one ball per pair minimum.");
  }

  if (/\btoo easy\b|\bno challenge\b/i.test(text)) score -= 5;
  if (/\btoo hard\b|\boverwhelming\b/i.test(text)) score -= 5;
  if (!hasDifferentiation && hasActivities) {
    weaknesses.push("Limited differentiation");
    practicalFixes.push("Add easier and harder routes to the same goal.");
  } else if (hasDifferentiation) {
    score += 8;
    strengths.push("Differentiation considered");
  }

  if (/\bcognitive|decision|team|communicat|reflect|confidence\b/i.test(text)) {
    score += 8;
    strengths.push("Holistic learning integrated");
  }

  if (hasSafety) score += 6;
  if (hasAssessment) {
    score += 10;
    strengths.push("Assessment evidence planned");
  } else {
    flags.push("No assessment evidence");
    practicalFixes.push("Add quick observation or exit reflection against WILF.");
  }

  return {
    score: clamp(score),
    band: scoreBand(clamp(score)),
    strengths: [...new Set(strengths)].slice(0, 4),
    weaknesses: [...new Set(weaknesses)].slice(0, 4),
    practicalFixes: [...new Set(practicalFixes)].slice(0, 4),
    flags: [...new Set(flags)].slice(0, 5),
  };
}

export function evaluateMovementTaskDesign(ctx: TFLLessonContext): {
  missingElements: string[];
  taskDesignSuggestions: string[];
  saferOrganisationAlternatives: string[];
  higherActivityAlternatives: string[];
  clearerTaskWording: string[];
} {
  const text = collectTFLText(ctx);
  const hasActivityContent = text.length > 50;
  const required = [
    { key: "content focus", ok: /\bskill|focus|learn|pass|run|jump|strike\b/i.test(text) },
    { key: "learner goal", ok: Boolean(ctx.walt?.trim()) },
    { key: "organisation of people", ok: /\bpair|group|team|station|v ?\d|\bgrid\b/i.test(text) },
    { key: "organisation of space", ok: /\bspace|zone|area|court|pitch|hall|yard\b/i.test(text) },
    { key: "equipment use", ok: /\bequipment|ball|mat|cone|target|net\b/i.test(text) || Boolean(ctx.structuredActivityText) },
    { key: "practice conditions", ok: /\bchallenge|condition|rule|level|oppos\b/i.test(text) || hasActivityContent },
    { key: "safety considerations", ok: Boolean(ctx.safetyConsiderations?.trim()) || /\bsafe|warm.?up\b/i.test(text) },
    { key: "success criteria", ok: Boolean(ctx.wilf?.trim()) },
    { key: "teacher observation focus", ok: /\bobserve|watch|look for|cue|feedback\b/i.test(text) },
  ];

  const missingElements = required.filter((r) => !r.ok).map((r) => r.key);

  return {
    missingElements,
    taskDesignSuggestions: missingElements.slice(0, 3).map((m) => `Add ${m} to activity description.`),
    saferOrganisationAlternatives: [
      "Pre-set stations with clear boundaries",
      "Pairs instead of large group chaos",
      "Equipment distributed before pupils enter space",
    ],
    higherActivityAlternatives: [
      "Multiple small stations with rotation",
      "Self-paced challenge cards",
      "One ball per pair minimum",
    ],
    clearerTaskWording: [
      "In pairs, in this zone, your goal is… Success looks like… I will watch for…",
    ],
  };
}

export function buildMovementTaskSuggestion(ctx: TFLLessonContext): MovementTaskSuggestion {
  const topic = ctx.activityArea ?? ctx.topicId ?? "movement";
  const skill = ctx.skillId?.replace(/-/g, " ") ?? "the focus skill";
  return {
    taskName: `${topic} paired practice`,
    taskPurpose: ctx.walt ?? `Develop ${skill} with purposeful repetition`,
    organisation: "Pairs in marked zones — 4–6 metres apart, facing partner",
    equipment: "One piece of equipment per pair; cones to mark zones",
    studentChallenge: "Complete 10 quality repetitions before increasing speed or distance",
    successCriteria: ctx.wilf?.split("\n")[0] ?? `I can perform ${skill} with control`,
    teacherObservationFocus: `Watch for: body position, timing, and safe spacing between pairs`,
    progressionOption: "Add light opposition or increase distance",
    simplificationOption: "Larger target, slower tempo, or stationary partner",
  };
}

export function classifyTaskDevelopmentType(taskText: string): ContentDevelopmentType {
  const t = taskText.toLowerCase();
  const extension = /\badd|more|increase|extend|harder|defend|oppos|further|complex\b/i.test(t);
  const refinement = /\bcue|quality|control|accuracy|technique|refine|body shape|timing|rhythm\b/i.test(t);
  const application = /\bgame|apply|match|routine|perform|assessment|small.?sided|challenge in context\b/i.test(t);

  const matches = [extension, refinement, application].filter(Boolean).length;
  if (matches > 1) return application && refinement ? "application" : extension ? "extension" : "refinement";
  if (application) return "application";
  if (refinement) return "refinement";
  if (extension) return "extension";
  return "unclear";
}

export function suggestNextContentDevelopmentStep(ctx: TFLLessonContext): string {
  const text = collectTFLText(ctx);
  const type = classifyTaskDevelopmentType(text);
  const extensionCount = (text.match(/\badd|more|harder|extend|defend/gi) ?? []).length;
  const refinementCount = (text.match(/\bcue|quality|control|refine/gi) ?? []).length;
  const applicationCount = (text.match(/\bgame|apply|perform|assessment/gi) ?? []).length;

  if (extensionCount > 2 && refinementCount === 0) {
    return `Add refinement: ${CONTENT_DEVELOPMENT_MODEL.refinement.examples[0]}`;
  }
  if (refinementCount > 0 && applicationCount === 0) {
    return `Add application: ${CONTENT_DEVELOPMENT_MODEL.application.examples[0]}`;
  }
  if (applicationCount > 0 && extensionCount === 0 && refinementCount === 0) {
    return `Simpler extension first: ${CONTENT_DEVELOPMENT_MODEL.extension.examples[0]}`;
  }
  if (type === "unclear") {
    return "Clarify sequence: extension → refinement → application across activities.";
  }
  return `Current emphasis: ${type}. Next: balance with ${type === "extension" ? "refinement cues" : type === "refinement" ? "application in context" : "extension for challenge"}.`;
}

export function evaluateTaskPresentationQuality(ctx: TFLLessonContext): {
  presentationScore: number;
  missingElements: string[];
  improvedTeacherWording: string[];
  ageAppropriateCueSuggestions: string[];
} {
  const text = collectTFLText(ctx);
  const checks = [
    { label: "attention gained", ok: /\bdemo|show|brief|quick start|explore first\b/i.test(text) },
    { label: "task purpose clear", ok: Boolean(ctx.walt?.trim()) },
    { label: "organisation explained", ok: /\bpair|group|zone|station|where\b/i.test(text) },
    { label: "demonstration included", ok: /\bdemo|show|example\b/i.test(text) },
    { label: "cues are brief", ok: /\bcue|one|two|three|key\b/i.test(text) || !/\blong explain\b/i.test(text) },
    { label: "understanding checked", ok: /\bcheck|question|what is|repeat back\b/i.test(text) },
    { label: "safety expectations clear", ok: Boolean(ctx.safetyConsiderations?.trim()) || /\bsafe|boundary\b/i.test(text) },
  ];
  const missingElements = checks.filter((c) => !c.ok).map((c) => c.label);
  const score = clamp(((checks.length - missingElements.length) / checks.length) * 100);

  const isPrimary = /year-[1-6]|primary/i.test(ctx.yearGroup ?? "");
  const cues = isPrimary
    ? ["Eyes on target", "Soft knees", "Slow then fast"]
    : ["Stable base", "Watch the ball", "Follow through"];

  return {
    presentationScore: score,
    missingElements,
    improvedTeacherWording: [
      "In 30 seconds: your goal is… organise as… success looks like… go.",
      missingElements.includes("understanding checked") ? "Quick check: show me ready position before you start." : "",
    ].filter(Boolean),
    ageAppropriateCueSuggestions: cues,
  };
}

export function generateLearningCues(ctx: TFLLessonContext): string[] {
  const skill = ctx.skillId?.replace(/-/g, " ") ?? "movement";
  const isPrimary = /year-[1-6]|primary/i.test(ctx.yearGroup ?? "");
  if (isPrimary) {
    return [`Look at the ${skill}`, "Use soft control", "Try again slowly"];
  }
  return [`Focus on quality ${skill}`, "Stable body before speed", "Recover ready position"];
}

export function evaluatePracticeOpportunity(ctx: TFLLessonContext): {
  practiceOpportunityScore: number;
  likelyBottlenecks: string[];
  fixes: string[];
} {
  const text = collectTFLText(ctx);
  let score = 60;
  const likelyBottlenecks: string[] = [];
  const fixes: string[] = [];

  if (/\bstation|rotate|pair|small group|parallel|self.?paced\b/i.test(text)) {
    score += 20;
  }
  if (/\bqueue|line|whole class watch|one at a time\b/i.test(text)) {
    score -= 20;
    likelyBottlenecks.push("Whole-class or queue structure");
    fixes.push("Replace long relay lines with multiple small stations.");
  }
  if (/\bone ball|single equipment\b/i.test(text)) {
    likelyBottlenecks.push("Low equipment ratio");
    fixes.push("Add more targets or one ball per pair.");
  }
  if (!/\bdifferentiat|easier|harder\b/i.test(text)) {
    likelyBottlenecks.push("Single challenge level for all");
    fixes.push("Use self-paced challenges with level options.");
  }
  if (/\breduce group|v ?\d|pairs\b/i.test(text)) score += 10;

  return {
    practiceOpportunityScore: clamp(score),
    likelyBottlenecks: likelyBottlenecks.slice(0, 3),
    fixes: [...new Set(fixes)].slice(0, 4),
  };
}

export function evaluateFeedbackQuality(ctx: TFLLessonContext): {
  score: number;
  flags: string[];
  suggestions: string[];
} {
  const text = collectTFLText(ctx);
  let score = 50;
  const flags: string[] = [];
  const suggestions: string[] = [];

  if (/\bspecific|next time|try|adjust|because|cue|focus on\b/i.test(text)) score += 20;
  if (/\bgood job|well done only|great\b/i.test(text) && !/\bbecause|next|try\b/i.test(text)) {
    flags.push("Good job only — vague feedback");
    suggestions.push("Add: Next time, focus on… linked to WILF.");
  }
  if (!/\bfeedback|cue|praise|correct\b/i.test(text)) {
    flags.push("No feedback plan");
    suggestions.push("Plan one specific feedback prompt per main activity.");
  }
  if (/\bunrelated|off topic\b/i.test(text)) flags.push("Feedback unrelated to lesson aim");

  return { score: clamp(score), flags: flags.slice(0, 3), suggestions: suggestions.slice(0, 3) };
}

export function generateFeedbackPrompts(ctx: TFLLessonContext): string[] {
  const skill = ctx.skillId?.replace(/-/g, " ") ?? "the skill";
  return [
    `Next time, focus on one cue for ${skill}.`,
    "You improved because you adjusted your body position.",
    "Try adjusting your timing before you add speed.",
    "What did you notice when you changed your approach?",
  ];
}

export function generateTeacherObservationFocus(ctx: TFLLessonContext): string[] {
  return [
    "Observe first: are pupils on task and safe in organisation?",
    `Common errors: rushed ${ctx.skillId?.replace(/-/g, " ") ?? "movement"} — look for quality before speed`,
    "Who may need support: pupils waiting or off-task at edges",
    "Evidence of learning: pupils self-checking against WILF",
    "Progress when ~70% succeed; simplify if most struggle",
    "Simplify if queues form or behaviour risk rises",
  ].slice(0, 5);
}

export function evaluatePlanningCoherence(ctx: TFLLessonContext): {
  coherenceScore: number;
  mismatches: string[];
  fixes: string[];
} {
  const text = collectTFLText(ctx);
  const walt = (ctx.walt ?? "").toLowerCase();
  const mismatches: string[] = [];
  const fixes: string[] = [];
  let score = 70;

  if (walt.includes("decision") && /\bdrill only|isolated|cone\b/i.test(text) && !/\bgame|oppos\b/i.test(text)) {
    mismatches.push("WALT says decision making but activity is isolated technique only");
    fixes.push("Add opposition or game context for decisions.");
    score -= 15;
  }
  if (walt.includes("team") && !/\bteam|cooperat|group|communicat\b/i.test(text)) {
    mismatches.push("WALT says teamwork but no cooperative structure");
    fixes.push("Use cooperative tasks or team roles.");
    score -= 12;
  }
  if ((walt.includes("fitness") || walt.includes("health")) && !/\bhealth|heart|intensity|why\b/i.test(text)) {
    mismatches.push("WALT says fitness knowledge but only activity planned");
    fixes.push("Add brief knowledge check or reflection on health link.");
    score -= 10;
  }
  if (ctx.walt && !ctx.wilf?.trim()) {
    mismatches.push("WALT without matching WILF");
    fixes.push("Add success criteria aligned to WALT.");
    score -= 10;
  }
  if (ctx.walt && ctx.activities && !ctx.assessmentNotes?.trim() && !/\breflect|assess\b/i.test(text)) {
    mismatches.push("Assessment does not match learning intention");
    fixes.push("Plan exit reflection or observation against WILF.");
    score -= 8;
  }

  return { coherenceScore: clamp(score), mismatches: mismatches.slice(0, 4), fixes: fixes.slice(0, 4) };
}

export function suggestInstructionalAssessment(ctx: TFLLessonContext): {
  teacherObservation: string;
  peerAssessment: string;
  selfAssessment: string;
  exitReflection: string;
  quickAssessment: string;
  physicalEvidence: string;
  cognitiveEvidence: string;
  socialAffectiveEvidence: string;
} {
  return {
    teacherObservation: "Scan against WILF — tick pupils who meet one criterion during main activity",
    peerAssessment: "Partner gives one specific cue-based comment after 5 attempts",
    selfAssessment: "Thumbs: which WILF line did you achieve?",
    exitReflection: "One sentence: what helped you succeed today?",
    quickAssessment: "30-second freeze — show me ready position",
    physicalEvidence: "Skill execution with control under task conditions",
    cognitiveEvidence: "Pupil explains why they chose an action or strategy",
    socialAffectiveEvidence: "Cooperation, effort, or confidence self-rating",
  };
}

export function suggestTeachingStrategy(ctx: TFLLessonContext): {
  strategy: string;
  whySuitable: string;
  whenNotSuitable: string;
  organisationGuidance: string;
  teacherRole: string;
  assessmentOption: string;
} {
  const text = collectTFLText(ctx);
  const isGame = /\bgame|tactic|decision\b/i.test(text);
  const isSkill = /\bskill|technique|cue|refine\b/i.test(text);
  const isLargeClass = true;

  if (isGame) {
    return {
      strategy: "Guided discovery",
      whySuitable: "Tactical or decision goals benefit from questioning during play",
      whenNotSuitable: "When safety or rules are not yet understood",
      organisationGuidance: "Small-sided games with brief freezes",
      teacherRole: "Question and constrain — avoid long lectures",
      assessmentOption: "Observe decisions against WILF during game",
    };
  }
  if (isSkill && isLargeClass) {
    return {
      strategy: "Station teaching",
      whySuitable: "Maximises practice time and allows differentiated challenge",
      whenNotSuitable: "When pupils cannot work independently yet",
      organisationGuidance: "4–6 stations, 3–4 minutes per rotation",
      teacherRole: "Rotate to observe and give cue-based feedback",
      assessmentOption: "Quick checklist at one station per rotation",
    };
  }
  return {
    strategy: "Direct instruction with practice",
    whySuitable: "Clear skill introduction with immediate practice",
    whenNotSuitable: "When discovery would build deeper understanding",
    organisationGuidance: "Brief demo then pairs or whole-group practice",
    teacherRole: "Model, observe, give specific feedback",
    assessmentOption: "Observe against teaching cues",
  };
}

export function evaluateLearningEnvironment(ctx: TFLLessonContext): {
  strengths: string[];
  risks: string[];
  managementFixes: string[];
} {
  const text = collectTFLText(ctx);
  const strengths: string[] = [];
  const risks: string[] = [];
  const managementFixes: string[] = [];

  if (/\broutine|transition|enter|exit|warm.?up\b/i.test(text)) strengths.push("Routines considered");
  if (Boolean(ctx.safetyConsiderations?.trim())) strengths.push("Safety documented");
  if (/\bresponsib|equipment monitor|captain\b/i.test(text)) strengths.push("Student responsibility planned");

  if (!ctx.safetyConsiderations?.trim() && !/\bsafe\b/i.test(text)) {
    risks.push("Safety expectations not clear");
    managementFixes.push("State boundaries and equipment rules before activity.");
  }
  if (/\bchaos|crowd|whole class one\b/i.test(text)) {
    risks.push("Behaviour or inclusion risk from organisation");
    managementFixes.push("Use zones and staggered starts.");
  }
  if (!/\bdifferentiat|inclus|access\b/i.test(text)) {
    risks.push("Inclusion risk — single pathway");
    managementFixes.push("Offer alternative roles or adapted equipment.");
  }

  return {
    strengths: strengths.slice(0, 3),
    risks: risks.slice(0, 3),
    managementFixes: managementFixes.slice(0, 3),
  };
}

export function generateTeacherReflectionPrompts(ctx: TFLLessonContext): string[] {
  return [
    "Which task produced the clearest learning?",
    "Where did pupils wait too long?",
    "Who was successful and who was not?",
    "What needs to be extended, refined, or applied next lesson?",
    "Did feedback link to WILF?",
    "What inclusion adjustment will you keep?",
  ];
}

export function buildTeachingForLearningPlanningInsights(
  promptOrText: string,
  ctx?: TFLLessonContext
): string[] {
  const context: TFLLessonContext = ctx ?? { lessonAim: promptOrText, walt: promptOrText };
  const exp = evaluateLearningExperienceQuality(context);
  const practice = evaluatePracticeOpportunity(context);
  const coherence = evaluatePlanningCoherence(context);
  const content = suggestNextContentDevelopmentStep(context);
  const insights: string[] = [];

  if (exp.flags.includes("No assessment evidence")) {
    insights.push("Your lesson aim may be clear but assessment evidence is missing.");
  }
  if (practice.likelyBottlenecks.length > 0) {
    insights.push(`This task may have too much waiting time — ${practice.fixes[0] ?? "use stations"}.`);
  }
  if (/\brefine|cue\b/i.test(collectTFLText(context)) === false && /\bgame|apply\b/i.test(collectTFLText(context))) {
    insights.push("Consider adding a refinement cue before the application game.");
  }
  if (exp.flags.includes("Game for fun only") || exp.flags.includes("Activity with no learning goal")) {
    insights.push("The activity is enjoyable, but the learning purpose is unclear.");
  }
  if (coherence.mismatches[0]) insights.push(coherence.mismatches[0]);
  if (content) insights.push(content);

  return [...new Set(insights)].slice(0, 5);
}

export function buildPedagogyCoachTFLMetrics(lesson: LessonBuilderFormData): {
  learningExperienceScore: number;
  learningExperienceBand: string;
  taskDesignWarning: string | null;
  contentBalance: string;
  feedbackSuggestion: string;
  observationFocus: string[];
  assessmentIdea: string;
} {
  const ctx = lessonToTFLContext(lesson);
  const exp = evaluateLearningExperienceQuality(ctx);
  const task = evaluateMovementTaskDesign(ctx);
  const feedback = evaluateFeedbackQuality(ctx);
  const assessment = suggestInstructionalAssessment(ctx);
  const type = classifyTaskDevelopmentType(collectTFLText(ctx));

  return {
    learningExperienceScore: exp.score,
    learningExperienceBand: exp.band,
    taskDesignWarning: task.missingElements.length > 4 ? `Task missing: ${task.missingElements.slice(0, 2).join(", ")}` : null,
    contentBalance: `Emphasis: ${type}. ${suggestNextContentDevelopmentStep(ctx)}`,
    feedbackSuggestion: feedback.suggestions[0] ?? generateFeedbackPrompts(ctx)[0],
    observationFocus: generateTeacherObservationFocus(ctx).slice(0, 3),
    assessmentIdea: assessment.quickAssessment,
  };
}

export function buildTeachingForLearningQualityReview(lesson: LessonBuilderFormData): {
  score: number;
  band: TFLQualityBand;
  checks: { label: string; met: boolean }[];
  warnings: string[];
  recommendations: string[];
} {
  const ctx = lessonToTFLContext(lesson);
  const exp = evaluateLearningExperienceQuality(ctx);
  const practice = evaluatePracticeOpportunity(ctx);
  const coherence = evaluatePlanningCoherence(ctx);
  const feedback = evaluateFeedbackQuality(ctx);
  const presentation = evaluateTaskPresentationQuality(ctx);

  const checks = [
    { label: "Clear learning goal", met: Boolean(ctx.walt?.trim()) },
    { label: "Valid learning experience", met: exp.score >= 60 },
    { label: "High practice opportunity", met: practice.practiceOpportunityScore >= 65 },
    { label: "Appropriate challenge", met: !exp.flags.includes("Task too easy") && !exp.flags.includes("Task too hard") },
    { label: "Task progression (E/R/A)", met: classifyTaskDevelopmentType(collectTFLText(ctx)) !== "unclear" },
    { label: "Assessment evidence", met: Boolean(ctx.assessmentNotes?.trim()) || exp.strengths.includes("Assessment evidence planned") },
    { label: "Feedback plan", met: feedback.score >= 55 },
    { label: "Closure / reflection", met: Boolean(ctx.reflectionNotes?.trim()) || /\breflect|plenary|exit\b/i.test(collectTFLText(ctx)) },
  ];

  const composite = clamp(
    (exp.score + practice.practiceOpportunityScore + coherence.coherenceScore + presentation.presentationScore) / 4
  );

  return {
    score: composite,
    band: scoreBand(composite),
    checks,
    warnings: exp.flags.slice(0, 3),
    recommendations: [...exp.practicalFixes, ...coherence.fixes].slice(0, 4),
  };
}

export function buildTeachingForLearningQualityInsights(lesson: LessonBuilderFormData): TFLQualityInsight[] {
  const review = buildTeachingForLearningQualityReview(lesson);
  const insights: TFLQualityInsight[] = [];

  insights.push({
    id: "tfl-review",
    area: "Teaching for Learning Review",
    message: `${review.band} learning design (${review.score}/100)`,
    prompt: review.checks.filter((c) => !c.met).map((c) => c.label).join("; ") || "All core checks met",
    entryId: "teaching-for-learning-master",
  });

  for (const w of review.warnings.slice(0, 2)) {
    insights.push({
      id: `tfl-warn-${w.slice(0, 15)}`,
      area: "Teaching for Learning",
      message: w,
      entryId: "teaching-for-learning-master",
      fix: {
        target: "teacherNotes",
        text: review.recommendations[0] ?? "Review task design and WILF alignment.",
        actionLabel: "Apply fix",
      },
    });
  }

  return insights;
}

export function buildSchemeTeachingForLearningTips(
  scheme: Pick<SchemeOfWork, "lessons" | "topicId" | "yearGroup">
): string[] {
  const lessons = scheme.lessons;
  if (lessons.length === 0) return [];

  const text = lessons.map((l) => `${l.walt} ${l.activities} ${l.wilf}`).join(" ");
  const types = lessons.map((l) => classifyTaskDevelopmentType(`${l.walt} ${l.activities}`));
  const hasExtension = types.includes("extension");
  const hasRefinement = types.includes("refinement");
  const hasApplication = types.includes("application");
  const tips: string[] = [];

  tips.push(`Unit coherence: ${lessons.filter((l) => l.walt.trim()).length}/${lessons.length} lessons have WALT.`);

  if (!hasRefinement) tips.push("Add refinement lesson(s) with quality cues before peak application.");
  if (!hasApplication) tips.push("Plan application — game, routine, or assessment task in final third of unit.");
  if (hasApplication && !hasExtension) tips.push("Earlier lessons may need simpler extension before application.");

  tips.push("Retrieval: revisit key cue in lessons 2, 4, and 6.");
  tips.push("Assessment checkpoint: add WILF observation in lesson " + Math.min(lessons.length, 4) + " and final lesson.");

  const emptyWalts = lessons.filter((l) => !l.walt.trim()).length;
  if (emptyWalts > 0) tips.push(`${emptyWalts} lesson(s) need WALT for unit coherence.`);

  if (/\bcompetition only|tournament only\b/i.test(text)) {
    tips.push("Balance competition with cooperative and refinement phases.");
  }

  return tips.slice(0, 4);
}

export function buildTeachingForLearningQualityReviewForLesson(lesson: LessonBuilderFormData) {
  return buildTeachingForLearningQualityReview(lesson);
}
