/**
 * TPSR Master Pack v1 — evaluation and suggestion engines.
 */

import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import type { SchemeOfWork } from "@/lib/types";
import type { LessonApplyTarget } from "./applySuggestions";
import type { LessonKnowledgeContext } from "./types";
import {
  ACTIVITY_EMBEDDING_HINTS,
  getTPSRLevelDefinition,
  getTPSRQuestions,
  isTPSRRelevant,
  TPSR_WARNINGS,
  yearGroupToTPSRQuestionBand,
  type TPSRLevel,
} from "./tpsrMaster";

export type TPSRQualityBand = "Exceptional" | "Strong" | "Developing" | "Limited";

export interface TPSRLessonContext extends LessonKnowledgeContext {
  topicId?: string;
  walt?: string;
  wilf?: string;
  activities?: string;
  differentiation?: string;
  assessmentNotes?: string;
  reflectionNotes?: string;
  structuredActivityText?: string;
  behaviourContext?: string;
  classConfidenceLevel?: "low" | "moderate" | "high";
}

export interface TPSRQualityInsight {
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

const LEVEL_NAMES: Record<TPSRLevel, string> = {
  0: "Irresponsibility",
  1: "Respect and self control",
  2: "Participation and effort",
  3: "Self direction",
  4: "Helping others and leadership",
  5: "Transfer beyond PE",
};

const DIMENSION_LEVEL_MAP: Record<string, TPSRLevel> = {
  respect: 1,
  effort: 2,
  selfDirection: 3,
  leadership: 4,
  helpingOthers: 4,
  reflection: 3,
  transfer: 5,
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scoreBand(score: number): TPSRQualityBand {
  if (score >= 90) return "Exceptional";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Developing";
  return "Limited";
}

export function lessonToTPSRContext(lesson: LessonBuilderFormData): TPSRLessonContext {
  const structured = (lesson.structuredActivities ?? [])
    .map((a) => `${a.name} ${a.taskDescription} ${a.students}`)
    .join(" ");
  const diff = `${lesson.differentiation ?? ""}`.toLowerCase();
  let classConfidenceLevel: TPSRLessonContext["classConfidenceLevel"] = "moderate";
  if (/confidence|anxious|nervous|low self/i.test(diff)) classConfidenceLevel = "low";
  if (/confident|extend|leadership ready/i.test(diff)) classConfidenceLevel = "high";

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
    behaviourContext: /behavio|respect|responsib|values/i.test(
      `${lesson.differentiation ?? ""} ${lesson.reflectionNotes ?? ""}`
    )
      ? "behaviour focus"
      : undefined,
    classConfidenceLevel,
  };
}

export function collectTPSRText(ctx: TPSRLessonContext): string {
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
    ctx.behaviourContext,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function scoreDimension(text: string, keywords: RegExp, base = 40): number {
  let score = base;
  if (keywords.test(text)) score += 35;
  return clamp(score);
}

export function evaluateTPSRQuality(ctx: TPSRLessonContext): {
  score: number;
  band: TPSRQualityBand;
  strongestLevel: string;
  weakestLevel: string;
  warnings: string[];
  practicalFixes: string[];
  dimensionScores: Record<string, number>;
} {
  const text = collectTPSRText(ctx);
  const dimensionScores: Record<string, number> = {
    respect: scoreDimension(text, /\b(respect|fair play|self.?control|safe|rules|dignity)\b/i),
    effort: scoreDimension(text, /\b(effort|persist|try hard|participat|engage|keep going)\b/i),
    selfDirection: scoreDimension(text, /\b(choice|self.?direct|decide|own learning|challenge level|independ)\b/i),
    leadership: scoreDimension(text, /\b(lead|captain|leader|organis|facilitat)\b/i),
    helpingOthers: scoreDimension(text, /\b(help|support|encourag|peer|spot|teammate|partner)\b/i),
    reflection: scoreDimension(text, /\b(reflect|review|discuss|what did you|how did you|exit)\b/i),
    transfer: scoreDimension(text, /\b(transfer|outside|home|classroom|community|tomorrow|beyond pe|habit)\b/i),
  };

  const weights = [0.15, 0.15, 0.15, 0.12, 0.12, 0.16, 0.15];
  const keys = Object.keys(dimensionScores);
  const score = clamp(
    keys.reduce((sum, k, i) => sum + dimensionScores[k] * weights[i], 0)
  );

  const sorted = keys.sort((a, b) => dimensionScores[b] - dimensionScores[a]);
  const strongestKey = sorted[0];
  const weakestKey = sorted[sorted.length - 1];
  const strongestLevel = LEVEL_NAMES[DIMENSION_LEVEL_MAP[strongestKey] ?? 2];
  const weakestLevel = LEVEL_NAMES[DIMENSION_LEVEL_MAP[weakestKey] ?? 1];

  const warnings: string[] = [];
  const practicalFixes: string[] = [];

  if (dimensionScores.respect < 50) {
    const w = TPSR_WARNINGS.find((x) => x.id === "respect-not-taught");
    if (w) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
  }
  if (dimensionScores.effort < 50 && /\beffort\b/i.test(text)) {
    const w = TPSR_WARNINGS.find((x) => x.id === "vague-effort");
    if (w) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
  }
  if (dimensionScores.selfDirection < 45) {
    const w = TPSR_WARNINGS.find((x) => x.id === "no-choice");
    if (w) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
  }
  if (dimensionScores.leadership < 45) {
    const w = TPSR_WARNINGS.find((x) => x.id === "no-leadership");
    if (w) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
  }
  if (dimensionScores.helpingOthers < 45) {
    const w = TPSR_WARNINGS.find((x) => x.id === "no-helping");
    if (w) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
  }
  if (dimensionScores.reflection < 45) {
    const w = TPSR_WARNINGS.find((x) => x.id === "no-reflection");
    if (w) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
  }
  if (dimensionScores.transfer < 40) {
    const w = TPSR_WARNINGS.find((x) => x.id === "no-transfer");
    if (w) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
  }
  if (/\bbehavio|control|punish|detention\b/i.test(text) && dimensionScores.respect < 55) {
    const w = TPSR_WARNINGS.find((x) => x.id === "behaviour-only");
    if (w) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
  }

  return {
    score,
    band: scoreBand(score),
    strongestLevel,
    weakestLevel,
    warnings: [...new Set(warnings)].slice(0, 4),
    practicalFixes: [...new Set(practicalFixes)].slice(0, 4),
    dimensionScores,
  };
}

export function suggestTPSRLevelFocus(ctx: TPSRLessonContext): {
  recommendedLevel: TPSRLevel;
  levelName: string;
  whyItFits: string;
  teacherLanguage: string;
  activityAdaptation: string;
  reflectionQuestion: string;
  assessmentEvidence: string;
} {
  const text = collectTPSRText(ctx);
  const quality = evaluateTPSRQuality(ctx);
  const year = ctx.yearGroup ?? "";
  const isPrimary = /year-[1-6]|primary|ks2/i.test(year);
  const isAlp = /alp|vocational/i.test(`${ctx.pathway ?? ""}`);

  let recommendedLevel: TPSRLevel = 2;
  if (ctx.behaviourContext || /\bbehavio|disrupt|respect\b/i.test(text)) recommendedLevel = 1;
  if (ctx.classConfidenceLevel === "high" && !ctx.behaviourContext) recommendedLevel = 3;
  if (/\blead|captain|help others\b/i.test(text)) recommendedLevel = 4;
  if (quality.dimensionScores.transfer >= 55) recommendedLevel = 5;
  if (isPrimary && recommendedLevel > 3) recommendedLevel = 3;
  if (isAlp && recommendedLevel < 3) recommendedLevel = 3;

  const def = getTPSRLevelDefinition(recommendedLevel)!;
  const ageBand = yearGroupToTPSRQuestionBand(ctx.yearGroup, ctx.pathway);

  return {
    recommendedLevel,
    levelName: def.name,
    whyItFits: ctx.behaviourContext
      ? "Class context suggests building respect and self control before higher levels."
      : `Year group and lesson aim suit ${def.name.toLowerCase()} as the responsibility focus.`,
    teacherLanguage: def.planningPrompts[0] ?? def.meaning,
    activityAdaptation: def.peExamples[0] ?? def.coachingExamples[0],
    reflectionQuestion: def.reflectionPrompts[0] ?? getTPSRQuestions(ageBand, 1)[0],
    assessmentEvidence: def.assessmentEvidence[0],
  };
}

export function buildTPSRLessonStructure(ctx: TPSRLessonContext): {
  phases: { name: string; duration: string; focus: string; teacherPrompt: string }[];
} {
  const focus = suggestTPSRLevelFocus(ctx);
  const ageBand = yearGroupToTPSRQuestionBand(ctx.yearGroup, ctx.pathway);
  const transferQ = getTPSRQuestions(ageBand, 5)[4] ?? "Where outside PE could this matter?";

  return {
    phases: [
      {
        name: "Relational start",
        duration: "3–5 min",
        focus: "Greet pupils, check in, set positive tone",
        teacherPrompt: "Good to see you — what are we working on together today?",
      },
      {
        name: "Awareness talk",
        duration: "3–5 min",
        focus: focus.levelName,
        teacherPrompt: focus.teacherLanguage,
      },
      {
        name: "Physical activity with responsibility focus",
        duration: "20–30 min",
        focus: focus.activityAdaptation,
        teacherPrompt: `Watch for ${focus.levelName.toLowerCase()} — praise specific examples.`,
      },
      {
        name: "Group meeting or pause",
        duration: "2–3 min",
        focus: "Brief check on responsibility during activity",
        teacherPrompt: "What responsibility did we see? What needs adjusting?",
      },
      {
        name: "Reflection time",
        duration: "3–5 min",
        focus: "Pupil-led reflection",
        teacherPrompt: focus.reflectionQuestion,
      },
      {
        name: "Transfer question",
        duration: "1–2 min",
        focus: "Connect to life beyond PE",
        teacherPrompt: transferQ,
      },
    ],
  };
}

function resolveActivityKey(activityArea?: string): string | undefined {
  if (!activityArea) return undefined;
  const a = activityArea.toLowerCase();
  if (/football|soccer|invasion|hockey|rugby|basketball/i.test(a)) return "football";
  if (/fitness|conditioning|circuits|athletics|training/i.test(a)) return "fitness";
  if (/gymnastics|dance|movement|parkour/i.test(a)) return "gymnastics";
  return undefined;
}

export function embedResponsibilityIntoActivity(ctx: TPSRLessonContext): {
  activityAdaptation: string;
  responsibilityFocus: string;
  teacherPrompt: string;
  studentReflection: string;
  levelExamples: Partial<Record<TPSRLevel, string>>;
} {
  const focus = suggestTPSRLevelFocus(ctx);
  const key = resolveActivityKey(ctx.activityArea ?? ctx.topicId);
  const hints = key ? ACTIVITY_EMBEDDING_HINTS[key] : undefined;
  const levelExamples = hints ?? {
    1: "Respect rules, equipment, and others during activity",
    2: "Sustain effort through challenge",
    3: "Choose own challenge or role",
    4: "Support a peer or lead a moment",
    5: "Name how responsibility transfers beyond PE",
  };

  const activityAdaptation =
    levelExamples[focus.recommendedLevel] ??
    focus.activityAdaptation;

  return {
    activityAdaptation,
    responsibilityFocus: focus.levelName,
    teacherPrompt: focus.teacherLanguage,
    studentReflection: focus.reflectionQuestion,
    levelExamples,
  };
}

export function evaluateRelationalTeaching(ctx: TPSRLessonContext): {
  strengths: string[];
  risks: string[];
  suggestedRelationalActions: string[];
} {
  const text = collectTPSRText(ctx);
  const strengths: string[] = [];
  const risks: string[] = [];
  const suggestedRelationalActions: string[] = [];

  if (/\b(name|know|relationship|trust|greet)\b/i.test(text)) strengths.push("Teacher knows pupils");
  else {
    risks.push("Limited evidence of relational connection");
    suggestedRelationalActions.push("Use names and brief check-in at lesson start.");
  }

  if (/\b(respect|dignity|calm|positive language)\b/i.test(text)) strengths.push("Respectful teacher language planned");
  else suggestedRelationalActions.push("Plan respectful correction language before activity.");

  if (/\b(choice|voice|pupil.?led|student.?led|discuss)\b/i.test(text)) strengths.push("Opportunities for pupil voice");
  else {
    risks.push("Few opportunities for pupil voice");
    suggestedRelationalActions.push("Add one pupil-led reflection or choice moment.");
  }

  if (/\b(listen|hear|respond|question)\b/i.test(text)) strengths.push("Teacher listens and responds");
  if (/\b(restor|private|without humiliat|dignity)\b/i.test(text)) strengths.push("Confrontation without humiliation");
  else if (/\bpunish|shout|public\b/i.test(text)) {
    risks.push("Punishment may replace relational learning");
    suggestedRelationalActions.push("Use private restorative conversation instead of public punishment.");
  }

  if (strengths.length === 0) strengths.push("Relational start phase can build trust quickly.");

  return {
    strengths: strengths.slice(0, 4),
    risks: risks.slice(0, 3),
    suggestedRelationalActions: suggestedRelationalActions.slice(0, 3),
  };
}

export function evaluateStudentVoiceAndEmpowerment(ctx: TPSRLessonContext): {
  score: number;
  strengths: string[];
  flags: string[];
  fixes: string[];
} {
  const text = collectTPSRText(ctx);
  let score = 35;
  const strengths: string[] = [];
  const flags: string[] = [];
  const fixes: string[] = [];

  if (/\b(choice|choose|select|option)\b/i.test(text)) {
    score += 15;
    strengths.push("Pupils make choices");
  } else {
    flags.push("Teacher controls everything");
    fixes.push("Offer one meaningful choice in challenge or role.");
  }

  if (/\b(goal|target|personal best|aim)\b/i.test(text)) {
    score += 12;
    strengths.push("Pupils set goals");
  }

  if (/\b(self.?assess|effort|evaluate|rate)\b/i.test(text)) {
    score += 12;
    strengths.push("Pupils evaluate effort");
  }

  if (/\b(lead|captain|present|demonstrat)\b/i.test(text)) {
    score += 12;
    strengths.push("Pupils lead moments");
  }

  if (/\b(reflect|honest|what did you)\b/i.test(text)) {
    score += 10;
    strengths.push("Pupils reflect honestly");
  } else if (/\b(teacher tells|explain to pupils only)\b/i.test(text)) {
    flags.push("Reflection is teacher dominated");
    fixes.push("Ask pupils first — wait before adding your view.");
  }

  if (/\b(design|create|plan own|pupil.?designed)\b/i.test(text)) {
    score += 10;
    strengths.push("Pupils help design challenges");
  }

  if (flags.length === 0 && !/\b(choice|lead|reflect)\b/i.test(text)) {
    flags.push("Pupils have no choice");
    fixes.push("Add self direction or leadership opportunity.");
  }

  return { score: clamp(score), strengths, flags: flags.slice(0, 3), fixes: fixes.slice(0, 3) };
}

export function evaluateTransferBeyondPE(ctx: TPSRLessonContext): {
  transferPotential: "low" | "moderate" | "high";
  transferQuestion: string;
  teacherPrompt: string;
  studentReflectionStarter: string;
} {
  const text = collectTPSRText(ctx);
  const quality = evaluateTPSRQuality(ctx);
  const ageBand = yearGroupToTPSRQuestionBand(ctx.yearGroup, ctx.pathway);
  const transferQ = getTPSRQuestions(ageBand, 5)[4] ?? "Where outside PE could this responsibility matter?";

  let transferPotential: "low" | "moderate" | "high" = "low";
  if (quality.dimensionScores.transfer >= 70) transferPotential = "high";
  else if (quality.dimensionScores.transfer >= 45) transferPotential = "moderate";

  const domains: string[] = [];
  if (/\bclassroom|class\b/i.test(text)) domains.push("classroom life");
  if (/\bhome|family\b/i.test(text)) domains.push("home life");
  if (/\bfriend|peer\b/i.test(text)) domains.push("friendships");
  if (/\bclub|team|sport\b/i.test(text)) domains.push("sport teams");
  if (/\bcommunity\b/i.test(text)) domains.push("community");
  if (/\bhabit|future|lifelong\b/i.test(text)) domains.push("future habits");

  const teacherPrompt =
    domains.length > 0
      ? `Connect today's responsibility to ${domains[0]}.`
      : "Add a short transfer question linking PE to life outside the lesson.";

  return {
    transferPotential,
    transferQuestion: transferQ,
    teacherPrompt,
    studentReflectionStarter: "Outside PE, I could use this responsibility when…",
  };
}

export function suggestTPSRAssessment(ctx: TPSRLessonContext): {
  selfReflectionPrompt: string;
  peerFeedbackPrompt: string;
  teacherObservationFocus: string;
  responsibilityEvidenceStatement: string;
  studentTarget: string;
  nextLessonFollowUp: string;
} {
  const focus = suggestTPSRLevelFocus(ctx);
  const ageBand = yearGroupToTPSRQuestionBand(ctx.yearGroup, ctx.pathway);
  const def = getTPSRLevelDefinition(focus.recommendedLevel)!;

  return {
    selfReflectionPrompt: def.reflectionPrompts[0] ?? getTPSRQuestions(ageBand, 1)[0],
    peerFeedbackPrompt: getTPSRQuestions(ageBand, 4)[3] ?? "How did your partner show responsibility?",
    teacherObservationFocus: def.assessmentEvidence[0],
    responsibilityEvidenceStatement: `I observed ${def.name.toLowerCase()} when the pupil…`,
    studentTarget: `Next lesson I will focus on ${def.name.toLowerCase()} by…`,
    nextLessonFollowUp: `Follow up on ${def.name.toLowerCase()} — check one pupil's progress at start.`,
  };
}

const UNIT_PROGRESSION_TEMPLATE = [
  { lesson: 1, focus: "Respect and safety", level: 1 as TPSRLevel },
  { lesson: 2, focus: "Effort and participation", level: 2 as TPSRLevel },
  { lesson: 3, focus: "Personal challenge", level: 2 as TPSRLevel },
  { lesson: 4, focus: "Self direction", level: 3 as TPSRLevel },
  { lesson: 5, focus: "Helping others", level: 4 as TPSRLevel },
  { lesson: 6, focus: "Leadership", level: 4 as TPSRLevel },
  { lesson: 7, focus: "Transfer beyond PE", level: 5 as TPSRLevel },
];

export function buildTPSRUnitProgression(
  lessonCount: number,
  ctx?: TPSRLessonContext
): {
  lessons: { lessonNumber: number; focus: string; level: TPSRLevel; levelName: string; prompt: string }[];
} {
  const count = Math.max(1, Math.min(lessonCount, 12));
  const template = UNIT_PROGRESSION_TEMPLATE;
  const step = count <= template.length ? 1 : Math.ceil(template.length / count);

  const lessons: { lessonNumber: number; focus: string; level: TPSRLevel; levelName: string; prompt: string }[] = [];
  for (let i = 0; i < count; i++) {
    const tIdx = Math.min(Math.floor(i * step), template.length - 1);
    const t = template[tIdx];
    const def = getTPSRLevelDefinition(t.level)!;
    lessons.push({
      lessonNumber: i + 1,
      focus: t.focus,
      level: t.level,
      levelName: def.name,
      prompt: def.planningPrompts[0] ?? def.meaning,
    });
  }

  if (ctx?.behaviourContext && lessons[0]) {
    lessons[0] = { ...lessons[0], focus: "Respect and safety", level: 1, levelName: "Respect and self control" };
  }

  return { lessons };
}

export function buildTPSRPlanningInsights(
  promptOrText: string,
  ctx?: TPSRLessonContext
): string[] {
  const context: TPSRLessonContext = ctx ?? { lessonAim: promptOrText, walt: promptOrText };
  const text = collectTPSRText(context) + promptOrText;
  if (!isTPSRRelevant(text) && !context.lessonAim) return [];

  const quality = evaluateTPSRQuality(context);
  const focus = suggestTPSRLevelFocus(context);
  const transfer = evaluateTransferBeyondPE(context);
  const insights: string[] = [];

  if (quality.dimensionScores.effort >= 55 && quality.dimensionScores.selfDirection < 45) {
    insights.push("This lesson has a strong effort focus but limited self direction.");
  }
  if (quality.dimensionScores.transfer < 45) {
    insights.push("Add a short transfer question at the end.");
  }
  if (quality.dimensionScores.leadership < 45) {
    insights.push("Give one pupil a leadership role during the activity.");
  }
  insights.push(`Use a responsibility focus: ${focus.levelName} during ${context.activityArea ?? "activity"}.`);
  if (transfer.transferPotential === "low") {
    insights.push(transfer.teacherPrompt);
  }
  insights.push(focus.reflectionQuestion);

  return insights.slice(0, 5);
}

export function buildPedagogyCoachTPSRMetrics(lesson: LessonBuilderFormData): {
  score: number;
  band: string;
  recommendedLevel: string;
  responsibilityPrompt: string;
  reflectionPrompt: string;
  transferQuestion: string;
  warning: string | null;
  strongestLevel: string;
  weakestLevel: string;
} {
  const ctx = lessonToTPSRContext(lesson);
  const quality = evaluateTPSRQuality(ctx);
  const focus = suggestTPSRLevelFocus(ctx);
  const transfer = evaluateTransferBeyondPE(ctx);
  const voice = evaluateStudentVoiceAndEmpowerment(ctx);

  let warning: string | null = null;
  if (quality.warnings[0]) warning = quality.warnings[0];
  else if (voice.flags[0]) warning = voice.flags[0];

  return {
    score: quality.score,
    band: quality.band,
    recommendedLevel: focus.levelName,
    responsibilityPrompt: focus.teacherLanguage,
    reflectionPrompt: focus.reflectionQuestion,
    transferQuestion: transfer.transferQuestion,
    warning,
    strongestLevel: quality.strongestLevel,
    weakestLevel: quality.weakestLevel,
  };
}

export function buildTPSRQualityReview(lesson: LessonBuilderFormData): {
  score: number;
  band: TPSRQualityBand;
  checks: { label: string; met: boolean }[];
  warnings: string[];
  recommendations: string[];
} {
  const ctx = lessonToTPSRContext(lesson);
  const quality = evaluateTPSRQuality(ctx);

  const checks = [
    { label: "Respect focus", met: quality.dimensionScores.respect >= 55 },
    { label: "Effort focus", met: quality.dimensionScores.effort >= 55 },
    { label: "Self direction", met: quality.dimensionScores.selfDirection >= 55 },
    { label: "Helping others", met: quality.dimensionScores.helpingOthers >= 55 },
    { label: "Leadership", met: quality.dimensionScores.leadership >= 55 },
    { label: "Reflection", met: quality.dimensionScores.reflection >= 55 },
    { label: "Transfer beyond PE", met: quality.dimensionScores.transfer >= 55 },
  ];

  return {
    score: quality.score,
    band: quality.band,
    checks,
    warnings: quality.warnings,
    recommendations: quality.practicalFixes,
  };
}

export function buildTPSRQualityInsights(lesson: LessonBuilderFormData): TPSRQualityInsight[] {
  const review = buildTPSRQualityReview(lesson);
  const insights: TPSRQualityInsight[] = [];

  insights.push({
    id: "tpsr-review",
    area: "TPSR Review",
    message: `${review.band} responsibility focus (${review.score}/100)`,
    prompt: review.checks.filter((c) => !c.met).map((c) => c.label).join("; ") || "Core checks met",
    entryId: "tpsr-master",
  });

  for (const w of review.warnings.slice(0, 2)) {
    const fix = TPSR_WARNINGS.find((x) => x.warning === w);
    insights.push({
      id: `tpsr-${w.slice(0, 12)}`,
      area: "TPSR",
      message: w,
      prompt: fix?.whyItMatters,
      entryId: "tpsr-master",
      fix: fix
        ? {
            target: w.includes("transfer") || w.includes("reflection")
              ? "reflectionNotes"
              : w.includes("choice") || w.includes("leadership")
                ? "differentiation"
                : "reflectionNotes",
            text: fix.suggestedFix,
            actionLabel: "Apply fix",
          }
        : undefined,
    });
  }

  return insights;
}

export function buildSchemeTPSRTips(
  scheme: Pick<SchemeOfWork, "lessons" | "topicId" | "yearGroup">
): string[] {
  const lessons = scheme.lessons;
  if (lessons.length === 0) return [];

  const progression = buildTPSRUnitProgression(lessons.length);
  const tips: string[] = [
    `Responsibility progression: ${progression.lessons.map((l) => l.focus).slice(0, 4).join(" → ")}`,
    "Leadership opportunities: rotate captain or helper role each lesson.",
    "Self direction progression: teacher-led → guided choice → pupil-designed challenge.",
    "Transfer opportunities: end each lesson with one life-application question.",
    "Reflection checkpoints: brief exit reflection linked to responsibility level.",
  ];

  return tips.slice(0, 5);
}
