/**
 * Cooperative Learning Master Pack v1 — evaluation and suggestion engines.
 */

import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import type { SchemeOfWork } from "@/lib/types";
import type { LessonApplyTarget } from "./applySuggestions";
import type { LessonKnowledgeContext } from "./types";
import {
  COOPERATIVE_LEARNING_WARNINGS,
  COOPERATIVE_ROLES,
  COOPERATIVE_STRUCTURE_LIBRARY,
  GROUP_STRUCTURE_OPTIONS,
  generateGroupProcessingPrompts,
  isCooperativeLearningRelevant,
  yearGroupToCLQuestionBand,
  type CLElementId,
  type CooperativeRole,
  type GroupStructureOption,
} from "./cooperativeLearningMaster";

export type CLQualityBand = "Exceptional" | "Strong" | "Developing" | "Limited";

export interface CLLessonContext extends LessonKnowledgeContext {
  topicId?: string;
  walt?: string;
  wilf?: string;
  activities?: string;
  differentiation?: string;
  assessmentNotes?: string;
  reflectionNotes?: string;
  structuredActivityText?: string;
}

export interface CLQualityInsight {
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

function scoreBand(score: number): CLQualityBand {
  if (score >= 90) return "Exceptional";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Developing";
  return "Limited";
}

export function lessonToCLContext(lesson: LessonBuilderFormData): CLLessonContext {
  const structured = (lesson.structuredActivities ?? [])
    .map((a) => `${a.name} ${a.taskDescription} ${a.students}`)
    .join(" ");
  return {
    yearGroup: lesson.yearGroup,
    topicId: lesson.topicId,
    walt: lesson.walt ?? lesson.learningIntention,
    wilf: lesson.successCriteria,
    activities: lesson.activities,
    differentiation: lesson.differentiation,
    assessmentNotes: lesson.assessmentNotes,
    reflectionNotes: lesson.reflectionNotes,
    structuredActivityText: structured,
  };
}

export function collectCLText(ctx: CLLessonContext): string {
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

export function evaluatePositiveInterdependence(ctx: CLLessonContext): {
  score: number;
  flags: string[];
  redesignSuggestions: string[];
} {
  const text = collectCLText(ctx);
  let score = 45;
  const flags: string[] = [];
  const redesignSuggestions: string[] = [];

  if (/\bshared|team score|combined|together|all must|everyone|group goal|collective\b/i.test(text)) score += 25;
  if (/\bgroup|team|pair|partner\b/i.test(text)) score += 10;
  if (/\bwinner|best player|individual score only|rank\b/i.test(text) && !/\bteam|shared\b/i.test(text)) {
    flags.push("Individual success only");
    redesignSuggestions.push("Use combined team score or all-must-contribute rule.");
  }
  if (/\bdominat|strongest|one player\b/i.test(text)) {
    flags.push("Strongest learner may dominate");
    redesignSuggestions.push("Add touch limit or role rotation.");
  }
  if (!/\bshared|together|team|combined|all\b/i.test(text) && /\bgroup|team\b/i.test(text)) {
    flags.push("Group not dependent on one another");
    redesignSuggestions.push("Redesign so team cannot succeed without each member.");
  }

  return { score: clamp(score), flags: flags.slice(0, 3), redesignSuggestions: redesignSuggestions.slice(0, 3) };
}

export function evaluateIndividualAccountability(ctx: CLLessonContext): {
  score: number;
  flags: string[];
  accountabilityMethods: string[];
  evidenceIdeas: string[];
} {
  const text = collectCLText(ctx);
  let score = 40;
  const flags: string[] = [];
  const accountabilityMethods: string[] = [];
  const evidenceIdeas: string[] = [];

  if (/\brole|responsib|accountab|each pupil|everyone|individual|wilf|i can\b/i.test(text)) score += 20;
  if (/\brecord|sign.?off|checklist|peer check|contribution\b/i.test(text)) score += 15;
  if (/\bgroup\b/i.test(text) && !/\brole|each|individual|everyone|accountab\b/i.test(text)) {
    flags.push("Possible free riders — no accountability structure");
    accountabilityMethods.push("Assign Recorder or Feedback Partner role with evidence.");
  }
  if (/\bpassenger|watch|sideline\b/i.test(text)) flags.push("Passengers not addressed");
  evidenceIdeas.push("Individual WILF self-check", "Peer sign-off on contribution", "Random role check");

  return {
    score: clamp(score),
    flags: flags.slice(0, 3),
    accountabilityMethods: accountabilityMethods.slice(0, 3),
    evidenceIdeas: evidenceIdeas.slice(0, 3),
  };
}

export function evaluateInterpersonalSkillsDevelopment(ctx: CLLessonContext): {
  skillsDeveloped: string[];
  missingOpportunities: string[];
  suggestedImprovements: string[];
} {
  const text = collectCLText(ctx);
  const skillMap: [RegExp, string][] = [
    [/\bcommunicat|talk|explain\b/i, "communication"],
    [/\blisten|hear\b/i, "listening"],
    [/\blead|captain|strategy leader\b/i, "leadership"],
    [/\bcooperat|team|together\b/i, "cooperation"],
    [/\bnegotiat|agree|decide together\b/i, "negotiation"],
    [/\bencourag|praise|support\b/i, "encouragement"],
    [/\bconflict|resolve|disagree\b/i, "conflict resolution"],
    [/\bdecision|shared plan|strategy\b/i, "shared decision making"],
  ];

  const skillsDeveloped = skillMap.filter(([p]) => p.test(text)).map(([, s]) => s);
  const missingOpportunities: string[] = [];
  if (!skillsDeveloped.includes("listening")) missingOpportunities.push("listening");
  if (!skillsDeveloped.includes("encouragement")) missingOpportunities.push("encouragement");
  if (!/\bsocial|interpersonal|communication skill\b/i.test(text) && skillsDeveloped.length < 2) {
    missingOpportunities.push("explicit social skill teaching");
  }

  const suggestedImprovements = [
    missingOpportunities.includes("explicit social skill teaching")
      ? "Name one social skill in WALT (e.g. We are learning to give helpful feedback)."
      : "Add structured peer feedback stem.",
    "Practice one cooperation phrase before main activity.",
  ].slice(0, 3);

  return { skillsDeveloped, missingOpportunities: missingOpportunities.slice(0, 4), suggestedImprovements };
}

export function evaluateGroupProcessing(ctx: CLLessonContext): {
  score: number;
  flags: string[];
  opportunities: string[];
} {
  const text = collectCLText(ctx);
  let score = 40;
  const flags: string[] = [];
  const opportunities: string[] = [];

  if (/\breflect|review|discuss|debrief|what worked|team huddle|group process\b/i.test(text)) score += 25;
  if (/\bplan|strategy|next time|improve\b/i.test(text)) score += 15;
  if (/\bgroup|team\b/i.test(text) && !/\breflect|discuss|review\b/i.test(text)) {
    flags.push("No group reflection");
    opportunities.push("Add two-minute team review after challenge.");
  }
  if (/\bteacher tell|teacher explain only\b/i.test(text)) flags.push("Teacher may dominate reflection");

  return { score: clamp(score), flags: flags.slice(0, 3), opportunities: opportunities.slice(0, 3) };
}

export function evaluateCooperativeLearningQuality(ctx: CLLessonContext): {
  score: number;
  band: CLQualityBand;
  strongestArea: string;
  weakestArea: string;
  practicalFixes: string[];
  implementationAdvice: string[];
  dimensionScores: Record<CLElementId, number>;
} {
  const interdependence = evaluatePositiveInterdependence(ctx);
  const accountability = evaluateIndividualAccountability(ctx);
  const interpersonal = evaluateInterpersonalSkillsDevelopment(ctx);
  const processing = evaluateGroupProcessing(ctx);

  const promotiveScore = clamp(
    50 +
      (interpersonal.skillsDeveloped.includes("encouragement") ? 15 : 0) +
      (interpersonal.skillsDeveloped.includes("cooperation") ? 15 : 0) +
      (/\bface.?to.?face|partner|peer\b/i.test(collectCLText(ctx)) ? 10 : 0)
  );

  const dimensionScores: Record<CLElementId, number> = {
    "positive-interdependence": interdependence.score,
    "individual-accountability": accountability.score,
    "promotive-interaction": promotiveScore,
    "interpersonal-skills": clamp(40 + interpersonal.skillsDeveloped.length * 12),
    "group-processing": processing.score,
  };

  const dims = Object.entries(dimensionScores).map(([id, score]) => ({
    id: id as CLElementId,
    name: id.replace(/-/g, " "),
    score,
  }));
  dims.sort((a, b) => b.score - a.score);

  const composite = clamp(Object.values(dimensionScores).reduce((a, b) => a + b, 0) / 5);
  const fixes = [
    ...interdependence.redesignSuggestions,
    ...accountability.accountabilityMethods,
    ...processing.opportunities,
    ...interpersonal.suggestedImprovements,
  ].slice(0, 4);

  return {
    score: composite,
    band: scoreBand(composite),
    strongestArea: dims[0]?.name ?? "cooperation",
    weakestArea: dims[dims.length - 1]?.name ?? "group processing",
    practicalFixes: fixes,
    implementationAdvice: [
      "Start with one cooperative structure and one role per group.",
      "Teach the social skill before the physical task.",
      "End with a brief pupil-led team review.",
    ],
    dimensionScores,
  };
}

export function suggestCooperativeRoles(ctx: CLLessonContext, count = 3): CooperativeRole[] {
  const text = collectCLText(ctx);
  const isPrimary = /year-[1-6]|primary/i.test(ctx.yearGroup ?? "");
  const roles = [...COOPERATIVE_ROLES];

  if (/\bskill|technique|refine\b/i.test(text)) {
    return [roles.find((r) => r.id === "coach")!, roles.find((r) => r.id === "feedback")!, roles.find((r) => r.id === "encourager")!].filter(Boolean).slice(0, count);
  }
  if (/\bgame|tactic|strategy\b/i.test(text)) {
    return [roles.find((r) => r.id === "strategy")!, roles.find((r) => r.id === "observer")!, roles.find((r) => r.id === "inclusion")!].filter(Boolean).slice(0, count);
  }
  if (isPrimary) {
    return roles.filter((r) => r.ageSuitability.includes("primary")).slice(0, count);
  }
  return roles.slice(0, count);
}

export function suggestGroupStructures(ctx: CLLessonContext): {
  recommended: GroupStructureOption;
  alternatives: GroupStructureOption[];
  flags: string[];
} {
  const text = collectCLText(ctx);
  const flags: string[] = [];
  if (/\bstrongest together|ability group only\b/i.test(text)) flags.push("Grouping may isolate lower confidence learners");
  if (/\brandom\b/i.test(text) && !/\brole|accountab\b/i.test(text)) flags.push("Random groups without roles may create imbalance");

  const recommended =
    /\bmixed ability|inclus|send\b/i.test(text) || ctx.studentNeeds?.length
      ? GROUP_STRUCTURE_OPTIONS.find((g) => g.id === "mixed-ability")!
      : GROUP_STRUCTURE_OPTIONS.find((g) => g.id === "strategic")!;

  return {
    recommended,
    alternatives: GROUP_STRUCTURE_OPTIONS.filter((g) => g.id !== recommended.id).slice(0, 2),
    flags,
  };
}

export function evaluateCooperativeEquity(ctx: CLLessonContext): {
  score: number;
  flags: string[];
  fixes: string[];
} {
  const text = collectCLText(ctx);
  let score = 55;
  const flags: string[] = [];
  const fixes: string[] = [];

  if (/\brole|rotate|turn|everyone|inclusion|quiet|all contribute\b/i.test(text)) score += 20;
  if (/\bdominat|one player|strongest|winner takes\b/i.test(text)) {
    flags.push("Dominant learners may monopolise");
    fixes.push("Use touch limits or Inclusion Champion role.");
    score -= 15;
  }
  if (!/\bdifferentiat|support|access|easier\b/i.test(text) && /\bgroup|team\b/i.test(text)) {
    flags.push("Unequal participation risk");
    fixes.push("Offer alternative roles with equal status.");
  }
  if (/\bsideline|exclude|pick last\b/i.test(text)) {
    flags.push("Isolated learners possible");
    fixes.push("Shared goal with no elimination.");
  }

  return { score: clamp(score), flags: flags.slice(0, 3), fixes: fixes.slice(0, 3) };
}

export function suggestCooperativeAssessment(ctx: CLLessonContext): {
  peerAssessment: string;
  selfAssessment: string;
  groupAssessment: string;
  accountabilityCheck: string;
  evidence: { physical: string; cognitive: string; social: string; affective: string };
} {
  return {
    peerAssessment: "Partner gives one specific cue-based comment linked to WILF",
    selfAssessment: "Thumbs: did I fulfil my role and meet my WILF line?",
    groupAssessment: "Team review: did we meet our shared criterion?",
    accountabilityCheck: "Recorder ticks each member contribution",
    evidence: {
      physical: "Skill execution in cooperative task",
      cognitive: "Pupil explains team strategy or decision",
      social: "Specific peer praise or feedback observed",
      affective: "Willingness to support teammates",
    },
  };
}

export function buildCooperativeLearningLessonSupport(ctx: CLLessonContext): {
  groupSize: string;
  roles: string[];
  accountabilityStrategy: string;
  reflectionPrompts: string[];
  assessmentIdeas: string[];
  inclusionConsiderations: string[];
} {
  const ageBand = yearGroupToCLQuestionBand(ctx.yearGroup);
  const roles = suggestCooperativeRoles(ctx).map((r) => r.name);
  const equity = evaluateCooperativeEquity(ctx);
  const assessment = suggestCooperativeAssessment(ctx);

  return {
    groupSize: /year-[1-3]|primary/i.test(ctx.yearGroup ?? "") ? "Pairs or groups of 3" : "Groups of 3–4",
    roles: roles.slice(0, 3),
    accountabilityStrategy: evaluateIndividualAccountability(ctx).evidenceIdeas[0] ?? "Individual WILF check",
    reflectionPrompts: generateGroupProcessingPrompts(ageBand, 2),
    assessmentIdeas: [assessment.peerAssessment, assessment.groupAssessment],
    inclusionConsiderations: equity.fixes.length > 0 ? equity.fixes : ["Rotate roles so all contribute"],
  };
}

export function buildCooperativeLearningPlanningInsights(
  promptOrText: string,
  ctx?: CLLessonContext
): string[] {
  const context: CLLessonContext = ctx ?? { lessonAim: promptOrText, walt: promptOrText };
  if (!isCooperativeLearningRelevant(collectCLText(context) + promptOrText)) {
    if (!isCooperativeLearningRelevant(promptOrText)) return [];
  }

  const support = buildCooperativeLearningLessonSupport(context);
  const quality = evaluateCooperativeLearningQuality(context);
  const insights: string[] = [
    `Suggested group size: ${support.groupSize}`,
    `Suggested roles: ${support.roles.join(", ")}`,
    `Accountability: ${support.accountabilityStrategy}`,
    `Reflection: ${support.reflectionPrompts[0]}`,
    quality.practicalFixes[0] ? `Inclusion: ${quality.practicalFixes[0]}` : `Inclusion: ${support.inclusionConsiderations[0]}`,
  ];
  return insights.slice(0, 5);
}

export function buildPedagogyCoachCLMetrics(lesson: LessonBuilderFormData): {
  score: number;
  band: string;
  strongestElement: string;
  weakestElement: string;
  improvementSuggestion: string;
  roleSuggestion: string;
  reflectionSuggestion: string;
} | null {
  const ctx = lessonToCLContext(lesson);
  if (!isCooperativeLearningRelevant(collectCLText(ctx))) return null;

  const quality = evaluateCooperativeLearningQuality(ctx);
  const roles = suggestCooperativeRoles(ctx);
  const ageBand = yearGroupToCLQuestionBand(ctx.yearGroup);

  return {
    score: quality.score,
    band: quality.band,
    strongestElement: quality.strongestArea,
    weakestElement: quality.weakestArea,
    improvementSuggestion: quality.practicalFixes[0] ?? quality.implementationAdvice[0],
    roleSuggestion: roles.map((r) => r.name).join(", "),
    reflectionSuggestion: generateGroupProcessingPrompts(ageBand, 1)[0],
  };
}

export function buildCooperativeLearningQualityReview(lesson: LessonBuilderFormData): {
  score: number;
  band: CLQualityBand;
  checks: { label: string; met: boolean }[];
  warnings: string[];
  recommendations: string[];
} {
  const ctx = lessonToCLContext(lesson);
  const quality = evaluateCooperativeLearningQuality(ctx);
  const text = collectCLText(ctx);
  const relevant = isCooperativeLearningRelevant(text);

  const checks = [
    { label: "Shared goal / interdependence", met: quality.dimensionScores["positive-interdependence"] >= 55 },
    { label: "Individual accountability", met: quality.dimensionScores["individual-accountability"] >= 55 },
    { label: "Promotive interaction", met: quality.dimensionScores["promotive-interaction"] >= 55 },
    { label: "Interpersonal skill development", met: quality.dimensionScores["interpersonal-skills"] >= 55 },
    { label: "Group reflection", met: quality.dimensionScores["group-processing"] >= 55 },
    { label: "Inclusion / equity", met: evaluateCooperativeEquity(ctx).score >= 55 },
  ];

  const warnings: string[] = [];
  for (const w of COOPERATIVE_LEARNING_WARNINGS) {
    if (w.id === "grouped-not-cooperating" && /\bgroup|team\b/i.test(text) && quality.dimensionScores["positive-interdependence"] < 50) warnings.push(w.warning);
    if (w.id === "no-accountability" && quality.dimensionScores["individual-accountability"] < 50) warnings.push(w.warning);
    if (w.id === "no-reflection" && quality.dimensionScores["group-processing"] < 50) warnings.push(w.warning);
    if (w.id === "one-dominates" && /\bdominat|one player\b/i.test(text)) warnings.push(w.warning);
  }

  if (!relevant) {
    return {
      score: quality.score,
      band: quality.band,
      checks: checks.map((c) => ({ ...c, met: c.met || !relevant })),
      warnings: ["No explicit group/cooperative structure — consider if cooperation would support learning"],
      recommendations: ["Add pair or team task with roles if social learning is a goal"],
    };
  }

  return {
    score: quality.score,
    band: quality.band,
    checks,
    warnings: [...new Set(warnings)].slice(0, 3),
    recommendations: quality.practicalFixes,
  };
}

export function buildCooperativeLearningQualityInsights(lesson: LessonBuilderFormData): CLQualityInsight[] {
  const review = buildCooperativeLearningQualityReview(lesson);
  const insights: CLQualityInsight[] = [];

  insights.push({
    id: "cl-review",
    area: "Cooperative Learning Review",
    message: `${review.band} cooperative learning (${review.score}/100)`,
    prompt: review.checks.filter((c) => !c.met).map((c) => c.label).join("; ") || "Core checks met",
    entryId: "cooperative-learning-master",
  });

  for (const w of review.warnings.slice(0, 2)) {
    const fix = COOPERATIVE_LEARNING_WARNINGS.find((x) => x.warning === w);
    insights.push({
      id: `cl-${w.slice(0, 12)}`,
      area: "Cooperative Learning",
      message: w,
      prompt: fix?.whyItMatters,
      entryId: "cooperative-learning-master",
      fix: fix
        ? {
            target: w.includes("reflection") ? "reflectionNotes" : "differentiation",
            text: fix.suggestedFix,
            actionLabel: "Apply fix",
          }
        : undefined,
    });
  }

  return insights;
}

export function buildSchemeCooperativeLearningTips(
  scheme: Pick<SchemeOfWork, "lessons" | "topicId" | "yearGroup">
): string[] {
  const lessons = scheme.lessons;
  if (lessons.length === 0) return [];

  const text = lessons.map((l) => `${l.walt} ${l.activities}`).join(" ").toLowerCase();
  const tips: string[] = [];

  if (!isCooperativeLearningRelevant(text)) {
    tips.push("Consider cooperative structures in lessons 2–4 for social skill and accountability progression.");
  } else {
    tips.push("Social skill progression: teach one interpersonal skill per lesson across the unit.");
    tips.push("Leadership opportunities: rotate Strategy Leader and Inclusion Champion roles.");
    tips.push("Accountability progression: move from teacher check → peer sign-off → self-assessment.");
    tips.push("Reflection progression: pair review → team huddle → group processing plenary.");
  }

  const structure = COOPERATIVE_STRUCTURE_LIBRARY.find((s) => s.id === "learning-teams");
  if (structure && lessons.length >= 4) {
    tips.push(`Best fit: ${structure.name} across ${lessons.length} lessons for stable teams.`);
  }

  return tips.slice(0, 4);
}
