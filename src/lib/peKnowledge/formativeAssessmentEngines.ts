/**
 * Formative Assessment Intelligence Engine v1 — planning and evaluation engines.
 */

import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import type { SchemeOfWork } from "@/lib/types";
import type { LessonApplyTarget } from "./applySuggestions";
import { buildImprovedWalt, buildImprovedWilf } from "./applySuggestions";
import type { LessonKnowledgeContext } from "./types";
import {
  FORMATIVE_ASSESSMENT_WARNINGS,
  isFormativeAssessmentRelevant,
} from "./formativeAssessmentMaster";

export type FAQualityBand = "Exceptional" | "Strong" | "Developing" | "Limited";

export type FAPathwayPhase = "primary" | "secondary" | "alp" | "sec" | "all";

export interface FALessonContext extends LessonKnowledgeContext {
  topicId?: string;
  walt?: string;
  wilf?: string;
  activities?: string;
  differentiation?: string;
  assessmentNotes?: string;
  reflectionNotes?: string;
  structuredActivityText?: string;
  lessonCount?: number;
}

export interface FAQualityInsight {
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

export interface HingeQuestion {
  question: string;
  type: "diagnostic" | "misconception" | "tactical" | "understanding";
  expectedResponses: string[];
  commonMisconceptions: string[];
  teacherActionIfIncorrect: string;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scoreBand(score: number): FAQualityBand {
  if (score >= 90) return "Exceptional";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Developing";
  return "Limited";
}

export function detectFAPathwayPhase(ctx: FALessonContext): FAPathwayPhase {
  const pathway = `${ctx.pathway ?? ""}`.toLowerCase();
  const yg = `${ctx.yearGroup ?? ""}`.toLowerCase();
  if (/alp|vocational|lifeskill/i.test(pathway)) return "alp";
  if (/sec|matsec|option|pe-option/i.test(pathway)) return "sec";
  if (/year-[1-6]|year-1|year-2|year-3|year-4|year-5|year-6|primary|ks1|ks2/i.test(yg)) return "primary";
  if (/year-[789]|year-10|year-11|secondary|ks3|ks4/i.test(yg)) return "secondary";
  return "all";
}

export function lessonToFAContext(lesson: LessonBuilderFormData): FALessonContext {
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

export function collectFAText(ctx: FALessonContext): string {
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

function topicLabel(ctx: FALessonContext): string {
  return ctx.activityArea ?? ctx.topicId ?? "this skill";
}

export function evaluateLearningIntentions(context: FALessonContext): {
  score: number;
  clarity: boolean;
  specificity: boolean;
  curriculumAlignment: boolean;
  ageAppropriate: boolean;
  observableLearning: boolean;
  flags: string[];
  improvedWalt: string;
  studentFriendlyVersion: string;
  simplifiedVersion: string;
} {
  const walt = context.walt ?? "";
  const text = collectFAText(context);
  let score = 35;
  const flags: string[] = [];

  const clarity = walt.length > 8;
  const specificity = /\b(learn|develop|understand|improve|apply|demonstrat|explain|decide)\b/i.test(walt);
  const curriculumAlignment =
    /\b(outcome|curriculum|skill|tactic|health|safe|movement|game)\b/i.test(text) || walt.length > 12;
  const ageAppropriate = !/\b(advanced|complex theory|university)\b/i.test(walt);
  const observableLearning = /\b(can|demonstrat|show|perform|explain|apply|identify)\b/i.test(walt);

  if (clarity) score += 12;
  if (specificity) score += 18;
  if (curriculumAlignment) score += 10;
  if (ageAppropriate) score += 10;
  if (observableLearning) score += 15;

  if (!walt.trim() || walt.length < 8) flags.push("Vague learning intention");
  if (/\b(play|game|practise|participat|fun)\b/i.test(walt) && !/\blearn|understand|develop\b/i.test(walt)) {
    flags.push("Activity masquerading as learning");
    score -= 12;
  }
  if (/\b(and also|multiple|several aim|two objectives|three objectives)\b/i.test(text)) {
    flags.push("Multiple conflicting intentions");
    score -= 10;
  }

  const topic = topicLabel(context);
  const improvedWalt = specificity ? walt : buildImprovedWalt(topic, undefined);
  const studentFriendlyVersion = improvedWalt
    .replace(/We are learning to/i, "Today I will learn to")
    .replace(/Understand/i, "Find out about");
  const simplifiedVersion = improvedWalt
    .replace(/We are learning to/i, "I will try to")
    .replace(/demonstrate|apply|understand/gi, (m) => (m.toLowerCase() === "understand" ? "find out" : "show"));

  return {
    score: clamp(score),
    clarity,
    specificity,
    curriculumAlignment,
    ageAppropriate,
    observableLearning,
    flags: flags.slice(0, 3),
    improvedWalt,
    studentFriendlyVersion,
    simplifiedVersion,
  };
}

export function evaluateSuccessCriteria(context: FALessonContext): {
  score: number;
  observable: boolean;
  measurable: boolean;
  realistic: boolean;
  linkedToIntention: boolean;
  understandableByPupils: boolean;
  flags: string[];
  improvedWilf: string;
  pupilFriendlyCriteria: string[];
  assessmentIndicators: string[];
} {
  const wilf = context.wilf ?? "";
  const walt = context.walt ?? "";
  let score = 40;
  const flags: string[] = [];

  const observable = /\b(observ|see|demonstrat|show|can|will|accurat|control|safely|times|metres|pass|land)\b/i.test(wilf);
  const measurable = wilf.length > 10 && (observable || /\b(at least|within|every|3 out of|checklist)\b/i.test(wilf));
  const realistic = !/\b(perfect|always|never fail|100%|flawless)\b/i.test(wilf);
  const linkedToIntention =
    wilf.length > 8 &&
    (walt.length === 0 || /\b(can|will|demonstrat|show|explain|apply)\b/i.test(wilf));
  const understandableByPupils = !/\b(complex terminology|sophisticated|analyse critically)\b/i.test(wilf);

  if (observable) score += 22;
  if (measurable) score += 15;
  if (realistic) score += 12;
  if (linkedToIntention) score += 15;
  if (understandableByPupils) score += 10;

  if (!wilf.trim()) flags.push("Success criteria missing");
  if (/\b(good|well|try hard|enjoy|participat)\b/i.test(wilf) && !observable) flags.push("Vague criteria");
  if (/\b(play|game|have fun|take part)\b/i.test(wilf) && !/\b(can|demonstrat|show)\b/i.test(wilf)) {
    flags.push("Activity focused criteria");
    score -= 10;
  }
  if (!realistic) flags.push("Unrealistic criteria");

  const improvedWilf =
    flags.length > 0 && !wilf.trim()
      ? buildImprovedWilf([
          "I can perform the skill with correct form",
          "I can explain one success point",
          "I can apply the skill in the practice task",
        ])
      : flags.length > 0
        ? buildImprovedWilf(["I can meet the lesson learning intention with clear evidence"])
        : wilf;

  const pupilFriendlyCriteria = improvedWilf
    .split(/[\n;•]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const assessmentIndicators = pupilFriendlyCriteria.map(
    (c) => `Observe: ${c.replace(/^I can /i, "Pupil can ")}`
  );

  return {
    score: clamp(score),
    observable,
    measurable,
    realistic,
    linkedToIntention,
    understandableByPupils,
    flags: flags.slice(0, 3),
    improvedWilf,
    pupilFriendlyCriteria,
    assessmentIndicators,
  };
}

export function generateEvidenceCollectionPlan(context: FALessonContext): {
  teacherEvidence: { method: string; focus: string }[];
  peerEvidence: { method: string; focus: string }[];
  selfEvidence: { method: string; focus: string }[];
  evidenceOpportunities: string[];
  timingSuggestions: string[];
  collectionMethods: string[];
  secPeSuggestions?: string[];
  alpSuggestions?: string[];
} {
  const topic = topicLabel(context);
  const phase = detectFAPathwayPhase(context);
  const walt = context.walt ?? "learning intention";

  const teacherEvidence = [
    { method: "Observation", focus: `30-second WILF scan — ${walt.slice(0, 40)}` },
    { method: "Questioning", focus: "Ask 2 pupils to explain one success point" },
    { method: "Demonstration", focus: "Sample performance against criteria mid-lesson" },
    { method: "Performance", focus: `Record personal best or technique snapshot in ${topic}` },
  ];

  const peerEvidence = [
    { method: "Partner observation", focus: "One criterion yes/no plus one tip" },
    { method: "Peer feedback", focus: "Two stars and a wish against WILF" },
  ];

  const selfEvidence = [
    { method: "Confidence rating", focus: "Thumbs or traffic light against WILF" },
    { method: "Reflection", focus: "What improved since warm-up?" },
    { method: "Self assessment", focus: "Self-check before harder task or exit" },
  ];

  const secPeSuggestions =
    phase === "sec" || phase === "secondary"
      ? [
          "Oral questioning on rules or tactics — exam-style recall",
          "Practical demonstration linked to syllabus outcome",
          "Theory note: pupil explains concept in own words",
          "Past-paper style hinge before progressing difficulty",
        ]
      : undefined;

  const alpSuggestions =
    phase === "alp"
      ? [
          "Vocational observation checklist — officiating or coaching role",
          "Practical competency sign-off against unit criteria",
          "Reflection log entry with evidence photo or peer witness",
          "Accessible verbal assessment with sentence starters",
        ]
      : undefined;

  return {
    teacherEvidence,
    peerEvidence,
    selfEvidence,
    evidenceOpportunities: [
      "After skill block: teacher observation sample",
      "Before harder game: hinge question responses",
      "Mid-lesson: partner observation on one WILF point",
      "Plenary: exit ticket or self-assessment",
    ],
    timingSuggestions: [
      "Warm-up end: baseline observation",
      "Mid-lesson (15 min): first evidence checkpoint",
      "Before competition phase: hinge question decision point",
      "Plenary: exit ticket and self-assessment",
    ],
    collectionMethods: [
      "Quick tally on clipboard",
      "Partner feedback slip",
      "Traffic-light cards",
      "Teacher annotation against WILF",
    ],
    secPeSuggestions,
    alpSuggestions,
  };
}

export function generateHingeQuestions(context: FALessonContext): HingeQuestion[] {
  const topic = topicLabel(context);
  const walt = context.walt ?? topic;

  return [
    {
      question: `Show me you know when to apply ${walt.replace(/we are learning to /i, "")} — thumbs up if ready`,
      type: "diagnostic",
      expectedResponses: ["Majority thumbs up", "Pupils can demonstrate in pairs"],
      commonMisconceptions: ["Confusing activity with understanding", "Copying without knowing why"],
      teacherActionIfIncorrect: "Pause — re-demo with one coaching point, then retry hinge",
    },
    {
      question: `What is the most common mistake when performing ${topic}?`,
      type: "misconception",
      expectedResponses: ["Pupils name specific error", "Can suggest correction"],
      commonMisconceptions: ["Speed over control", "Wrong tactical choice under pressure"],
      teacherActionIfIncorrect: "Short corrective task — isolate skill without defender",
    },
    {
      question: "In this game situation, what should you do and why?",
      type: "tactical",
      expectedResponses: ["Names correct option", "Links to learning intention"],
      commonMisconceptions: ["Always pass to nearest player", "Ignore space or support"],
      teacherActionIfIncorrect: "Freeze game — discuss one tactical example, then restart",
    },
    {
      question: "Explain in one sentence what success looks like today",
      type: "understanding",
      expectedResponses: ["Uses WILF language", "Links to WALT"],
      commonMisconceptions: ["Describes activity not learning", "Cannot name criteria"],
      teacherActionIfIncorrect: "Re-display WILF — pupil-friendly version on board",
    },
  ];
}

export function generateMisconceptionChecks(context: FALessonContext): {
  checks: { category: string; misconception: string; diagnosticQuestion: string; correctiveTask: string }[];
} {
  const topic = topicLabel(context);
  return {
    checks: [
      {
        category: "Tactical misunderstanding",
        misconception: "Always attack individually without support",
        diagnosticQuestion: "When should you pass instead of dribble?",
        correctiveTask: "3v3 with rule: must pass before shooting",
      },
      {
        category: "Movement misunderstanding",
        misconception: "Speed without control or safe form",
        diagnosticQuestion: "Show me controlled movement — what changes?",
        correctiveTask: "Slow-motion practice with one coaching cue",
      },
      {
        category: "Rules misunderstanding",
        misconception: "Confusion about contact, steps, or scoring",
        diagnosticQuestion: "What rule applies in this situation?",
        correctiveTask: "Referee role-play or rule quiz before game",
      },
      {
        category: "Performance versus learning confusion",
        misconception: "Winning the game equals meeting WILF",
        diagnosticQuestion: "Did you meet success criteria even if you lost?",
        correctiveTask: "Self-assess against WILF not scoreboard",
      },
      {
        category: "Skill application",
        misconception: `Can perform ${topic} in drill but not in game`,
        diagnosticQuestion: "Can you use the skill when defended?",
        correctiveTask: "Modified game with reduced defenders",
      },
    ],
  };
}

export function generateFeedForwardFeedback(context: FALessonContext): {
  feedUp: string;
  feedback: string;
  feedForward: string;
  flags: string[];
  peExamples: string[];
} {
  const text = collectFAText(context);
  const wilf = context.wilf ?? "success criteria";
  const flags: string[] = [];

  const praiseOnly = /\b(good job|well done|great|brilliant)\b/i.test(text) && !/\b(next|try|because|focus|improve)\b/i.test(text);
  const vagueFeedback = /\b(good|nice|ok|well)\b/i.test(text) && !/\b(wilf|criteria|knee|pass|feet|balance|support)\b/i.test(text);
  const noNextStep = !/\b(next|feed.?forward|try|improve|adjust|focus on)\b/i.test(text);

  if (praiseOnly) flags.push("Praise only");
  if (vagueFeedback) flags.push("Vague feedback");
  if (noNextStep) flags.push("No next step");

  return {
    feedUp: `Remember WILF: ${wilf.split(/[\n;]/)[0]?.trim() ?? "meet today's learning intention"}`,
    feedback: "Compare current performance to WILF — name one thing observed",
    feedForward: "Next attempt: one specific cue linked to WILF because it closes the gap",
    flags: flags.slice(0, 3),
    peExamples: [
      "Feed up: Success is passing to feet under light pressure.",
      "Feedback: Your pass was accurate but head was down — WILF says eyes up.",
      "Feed forward: Next rep — scan before you pass because it improves decision-making.",
      "Feed up: Landing with bent knees for safe balance.",
      "Feedback: You landed stiff — criteria not met yet.",
      "Feed forward: Next jump — bend knees on landing because it absorbs force.",
    ],
  };
}

export function generatePeerAssessmentFramework(context: FALessonContext): {
  observationPrompts: string[];
  coachingPrompts: string[];
  discussionPrompts: string[];
  accountabilityChecks: string[];
  pathwayNotes: string;
} {
  const phase = detectFAPathwayPhase(context);

  const base = {
    observationPrompts: [
      "Watch one attempt — did partner meet WILF point 1? Yes/no + one reason",
      "Observe only: body position / decision / communication — one criterion",
    ],
    coachingPrompts: [
      "Give one specific tip using WILF language — not good or bad",
      "Two stars and a wish — linked to success criteria",
    ],
    discussionPrompts: [
      "What did your partner do well against WILF?",
      "What one thing would improve their next attempt?",
    ],
    accountabilityChecks: [
      "Partners sign initials on observation slip",
      "Teacher samples 3 peer feedback slips",
      "Rotate observer every 5 minutes",
    ],
  };

  const pathwayNotes =
    phase === "primary"
      ? "Primary: picture checklist, one criterion, model helpful feedback first"
      : phase === "alp"
        ? "ALP: vocational observation rubric — coaching, officiating, or leadership criterion"
        : phase === "sec"
          ? "SEC PE Option: oral peer review of tactical decision; theory peer-quiz before practical"
          : "Secondary: full sentence stems; link to exam-style criteria where relevant";

  return { ...base, pathwayNotes };
}

export function generateSelfAssessmentFramework(context: FALessonContext): {
  confidenceScales: string[];
  trafficLights: string[];
  reflectionPrompts: string[];
  learningLogs: string[];
  goalSettingPrompts: string[];
} {
  const phase = detectFAPathwayPhase(context);

  const reflectionPrompts =
    phase === "primary"
      ? ["Which WILF did I meet?", "What will I try next time?", "Thumbs up, sideways, or down?"]
      : phase === "alp"
        ? [
            "What evidence shows I met the unit criterion?",
            "What would I do differently in a vocational task?",
            "Rate confidence 1–5 with one reason",
          ]
        : [
            "Which success criterion did I meet — what evidence?",
            "What is my next step against WILF?",
            "How confident am I before the harder task?",
          ];

  return {
    confidenceScales: ["1–5 scale against WILF", "Thumbs up / sideways / down", "Before and after practice rating"],
    trafficLights: ["Green: met WILF", "Amber: partly met — one gap", "Red: need support — ask teacher or partner"],
    reflectionPrompts,
    learningLogs: [
      "One sentence: what I learned today",
      "Evidence I met WILF",
      "Goal for next lesson",
    ],
    goalSettingPrompts: [
      "My target against WILF for next lesson is…",
      "One thing to improve before assessment game",
      "Personal best target — realistic and measurable",
    ],
  };
}

export function evaluateStudentOwnership(context: FALessonContext): {
  ownershipScore: number;
  reflection: boolean;
  selfMonitoring: boolean;
  selfRegulation: boolean;
  goalSetting: boolean;
  learningOwnership: boolean;
  strengths: string[];
  improvements: string[];
} {
  const text = collectFAText(context);
  let score = 35;

  const reflection = /\b(reflect|review|what learned|plenary|exit|debrief)\b/i.test(text);
  const selfMonitoring = /\b(self.?assess|self.?check|self.?rate|traffic|confidence|monitor)\b/i.test(text);
  const selfRegulation = /\b(adjust|improve|next step|goal|target|calibrat)\b/i.test(text);
  const goalSetting = /\b(goal|target|personal best|next lesson|aim for)\b/i.test(text);
  const learningOwnership = /\b(own|choice|pupil.?led|student.?led|agency)\b/i.test(text) || (reflection && selfMonitoring);

  if (reflection) score += 15;
  if (selfMonitoring) score += 18;
  if (selfRegulation) score += 15;
  if (goalSetting) score += 12;
  if (learningOwnership) score += 10;

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (reflection) strengths.push("Reflection planned");
  else improvements.push("Add plenary reflection against WILF");
  if (selfMonitoring) strengths.push("Self-monitoring included");
  else improvements.push("Add traffic-light or thumbs self-check");
  if (goalSetting) strengths.push("Goal-setting signalled");
  else improvements.push("Pupils set one target for next lesson");

  return {
    ownershipScore: clamp(score),
    reflection,
    selfMonitoring,
    selfRegulation,
    goalSetting,
    learningOwnership,
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
  };
}

export function generateExitTicket(context: FALessonContext): {
  questions: { type: string; question: string }[];
  pathwayAdaptation: string;
} {
  const phase = detectFAPathwayPhase(context);
  const walt = context.walt ?? "today's learning";

  const questions =
    phase === "primary"
      ? [
          { type: "understanding", question: "What did we learn today?" },
          { type: "reflection", question: "Did I meet success criteria? How do I know?" },
          { type: "confidence", question: "Thumbs up, sideways, or down — why?" },
          { type: "next steps", question: "What will I try next lesson?" },
        ]
      : phase === "alp"
        ? [
            { type: "understanding", question: "What skill or competency did I develop?" },
            { type: "reflection", question: "What evidence shows I met the criterion?" },
            { type: "confidence", question: "Rate confidence 1–5 — one reason" },
            { type: "next steps", question: "What vocational target for next session?" },
          ]
        : [
            { type: "understanding", question: `Explain ${walt.replace(/we are learning to /i, "")} in one sentence` },
            { type: "reflection", question: "Which WILF did I meet — what evidence?" },
            { type: "confidence", question: "How confident am I before the next challenge?" },
            { type: "next steps", question: "What is my feed-forward for next lesson?" },
            { type: "understanding", question: "What misconception did I correct today?" },
          ];

  const pathwayAdaptation =
    phase === "sec"
      ? "SEC: add oral exam-style recall question on rules or theory"
      : phase === "alp"
        ? "ALP: reflection log with practical evidence note"
        : phase === "primary"
          ? "Primary: picture or sentence starter supported"
          : "Secondary: full written or verbal exit";

  return { questions: questions.slice(0, 5), pathwayAdaptation };
}

export function generateInstructionalDecisionSuggestions(context: FALessonContext): {
  understandingSecure: { recommendation: string; actions: string[] };
  understandingPartial: { recommendation: string; actions: string[] };
  misunderstandingPresent: { recommendation: string; actions: string[] };
} {
  return {
    understandingSecure: {
      recommendation: "Progress",
      actions: [
        "Add defender, time pressure, or smaller target",
        "Extend with pupil-led coaching or design challenge",
        "Move to application game or assessment fixture",
      ],
    },
    understandingPartial: {
      recommendation: "Scaffold",
      actions: [
        "Pair support with confident peer",
        "Reduce defenders or enlarge target",
        "Re-state WILF and one feed-forward cue",
        "Parallel task — support group continues practice while others extend",
      ],
    },
    misunderstandingPresent: {
      recommendation: "Reteach",
      actions: [
        "Stop activity — re-demo with one coaching point",
        "Isolate skill without game pressure",
        "Use misconception check and corrective task",
        "Hinge question again before restarting",
      ],
    },
  };
}

export function evaluateShortCycleAssessment(context: FALessonContext): {
  score: number;
  evidenceDuringLesson: boolean;
  evidenceFrequency: "high" | "moderate" | "low";
  responsiveness: boolean;
  flags: string[];
} {
  const text = collectFAText(context);
  let score = 40;
  const flags: string[] = [];

  const midLesson = /\b(mid.?lesson|during|checkpoint|hinge|pause|observe|sample|scan)\b/i.test(text);
  const endOnly = /\b(plenary|exit|end)\b/i.test(text) && !midLesson;
  const multipleChecks = (text.match(/\b(check|assess|observe|question|hinge|evidence)\b/gi) ?? []).length >= 3;
  const responsiveness = /\b(adjust|adapt|scaffold|extend|reteach|progress|decision)\b/i.test(text);

  if (midLesson) score += 25;
  if (multipleChecks) score += 20;
  if (responsiveness) score += 15;

  if (endOnly && !midLesson) {
    flags.push("Assessment only at end");
    score -= 15;
  }
  if (!multipleChecks) flags.push("Insufficient evidence");
  if (!responsiveness) flags.push("No adaptation opportunity");

  const evidenceFrequency: "high" | "moderate" | "low" =
    multipleChecks && midLesson ? "high" : midLesson ? "moderate" : "low";

  return {
    score: clamp(score),
    evidenceDuringLesson: midLesson,
    evidenceFrequency,
    responsiveness,
    flags: flags.slice(0, 3),
  };
}

export function evaluateFormativeAssessmentQuality(context: FALessonContext): {
  score: number;
  band: FAQualityBand;
  dimensionScores: Record<string, number>;
  warnings: string[];
  practicalFixes: string[];
  strongestArea: string;
  weakestArea: string;
} {
  const text = collectFAText(context);
  const intentions = evaluateLearningIntentions(context);
  const criteria = evaluateSuccessCriteria(context);
  const shortCycle = evaluateShortCycleAssessment(context);
  const ownership = evaluateStudentOwnership(context);
  const feedback = generateFeedForwardFeedback(context);

  const dimensionScores: Record<string, number> = {
    learningIntentions: intentions.score,
    successCriteria: criteria.score,
    evidenceCollection: shortCycle.score,
    hingeQuestions: /\b(hinge|diagnostic|misconception|decision point|check understanding)\b/i.test(text) ? 72 : 38,
    feedback: feedback.flags.length === 0 ? 70 : feedback.flags.length === 1 ? 55 : 35,
    peerAssessment: /\b(peer|partner|observe|two stars|wish)\b/i.test(text) ? 68 : 32,
    selfAssessment: /\b(self.?assess|self.?check|traffic|confidence|reflect)\b/i.test(text) ? 70 : 35,
    ownership: ownership.ownershipScore,
  };

  const keys = Object.keys(dimensionScores);
  const score = clamp(keys.reduce((s, k) => s + dimensionScores[k], 0) / keys.length);
  const sorted = [...keys].sort((a, b) => dimensionScores[b] - dimensionScores[a]);

  const warnings: string[] = [];
  const practicalFixes: string[] = [];

  for (const w of FORMATIVE_ASSESSMENT_WARNINGS) {
    if (w.id === "unclear-intention" && intentions.flags.includes("Vague learning intention")) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "missing-wilf" && criteria.flags.includes("Success criteria missing")) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "no-evidence" && shortCycle.score < 50) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "ineffective-feedback" && feedback.flags.length > 0) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "no-peer" && dimensionScores.peerAssessment < 50) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "no-self" && dimensionScores.selfAssessment < 50) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "no-decision" && !/\b(hinge|decision|reteach|scaffold|extend|progress)\b/i.test(text)) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "end-only" && shortCycle.flags.includes("Assessment only at end")) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
  }

  return {
    score,
    band: scoreBand(score),
    dimensionScores,
    warnings: [...new Set(warnings)].slice(0, 4),
    practicalFixes: [...new Set(practicalFixes)].slice(0, 4),
    strongestArea: sorted[0] ?? "learningIntentions",
    weakestArea: sorted[sorted.length - 1] ?? "hingeQuestions",
  };
}

export function buildFAPlanningInsights(promptOrText: string, ctx?: FALessonContext): string[] {
  const context: FALessonContext = ctx ?? { lessonAim: promptOrText, walt: promptOrText, activities: promptOrText };
  const combined = collectFAText(context) + " " + promptOrText;
  if (!isFormativeAssessmentRelevant(combined)) return [];

  const quality = evaluateFormativeAssessmentQuality(context);
  const insights: string[] = [];

  if (quality.dimensionScores.hingeQuestions < 55) insights.push("Add hinge question before progressing task difficulty.");
  if (quality.dimensionScores.evidenceCollection < 55) insights.push("Add evidence checkpoint mid-lesson — not only at end.");
  if (quality.dimensionScores.successCriteria < 55) insights.push("Improve success criteria — make WILF observable and linked to WALT.");
  if (quality.dimensionScores.ownership < 55) insights.push("Increase student ownership — self-assessment and goal-setting.");
  if (quality.dimensionScores.peerAssessment < 55) insights.push("Activate peer assessment — one criterion partner observation.");
  if (quality.dimensionScores.feedback < 55) insights.push("Plan feed-forward feedback — specific next step against WILF.");

  if (insights.length === 0) {
    insights.push("Plan full AfL cycle: WALT/WILF, hinge question, evidence, feed-forward.");
  }

  return insights.slice(0, 5);
}

export function buildPedagogyCoachFAMetrics(
  lesson: LessonBuilderFormData
): {
  score: number;
  band: string;
  evidenceCollectionReview: string;
  hingeQuestionSuggestions: string;
  feedbackQualityReview: string;
  studentOwnershipReview: string;
  warning: string | null;
} | null {
  const ctx = lessonToFAContext(lesson);
  const text = collectFAText(ctx);
  const hasContent = Boolean(ctx.walt?.trim() || ctx.wilf?.trim() || ctx.activities?.trim());
  if (!hasContent && !isFormativeAssessmentRelevant(text)) {
    return null;
  }

  const quality = evaluateFormativeAssessmentQuality(ctx);
  const evidence = generateEvidenceCollectionPlan(ctx);
  const hinges = generateHingeQuestions(ctx);
  const feedback = generateFeedForwardFeedback(ctx);
  const ownership = evaluateStudentOwnership(ctx);

  return {
    score: quality.score,
    band: quality.band,
    evidenceCollectionReview: evidence.timingSuggestions[1] ?? evidence.evidenceOpportunities[0],
    hingeQuestionSuggestions: hinges[0]?.question ?? "Add diagnostic hinge before harder task",
    feedbackQualityReview:
      feedback.flags.length > 0
        ? `${feedback.flags[0]} — ${feedback.peExamples[2]}`
        : feedback.peExamples[0],
    studentOwnershipReview: ownership.strengths[0] ?? ownership.improvements[0] ?? "Add self-check against WILF",
    warning: quality.warnings[0] ?? null,
  };
}

export function buildFAQualityReview(lesson: LessonBuilderFormData): {
  score: number;
  band: FAQualityBand;
  checks: { label: string; met: boolean }[];
  warnings: string[];
  recommendations: string[];
} {
  const ctx = lessonToFAContext(lesson);
  const quality = evaluateFormativeAssessmentQuality(ctx);
  const intentions = evaluateLearningIntentions(ctx);
  const criteria = evaluateSuccessCriteria(ctx);
  const shortCycle = evaluateShortCycleAssessment(ctx);
  const feedback = generateFeedForwardFeedback(ctx);
  const ownership = evaluateStudentOwnership(ctx);

  const checks = [
    { label: "Learning intentions", met: intentions.score >= 55 && intentions.flags.length === 0 },
    { label: "Success criteria", met: criteria.score >= 55 && !criteria.flags.includes("Success criteria missing") },
    { label: "Evidence", met: shortCycle.score >= 55 },
    { label: "Feedback", met: feedback.flags.length === 0 },
    { label: "Ownership", met: ownership.ownershipScore >= 55 },
    { label: "Assessment opportunities", met: shortCycle.evidenceFrequency !== "low" },
  ];

  return {
    score: quality.score,
    band: quality.band,
    checks,
    warnings: quality.warnings,
    recommendations:
      quality.practicalFixes.length > 0
        ? quality.practicalFixes
        : [`Strengthen ${quality.weakestArea} — core formative assessment domain`],
  };
}

export function buildFAQualityInsights(lesson: LessonBuilderFormData): FAQualityInsight[] {
  const ctx = lessonToFAContext(lesson);
  const text = collectFAText(ctx);
  const alwaysShow =
    isFormativeAssessmentRelevant(text) ||
    Boolean(ctx.walt?.trim()) ||
    Boolean(ctx.wilf?.trim());

  if (!alwaysShow) return [];

  const review = buildFAQualityReview(lesson);
  const insights: FAQualityInsight[] = [];

  insights.push({
    id: "fa-review",
    area: "Formative Assessment Review",
    message: `${review.band} formative assessment design (${review.score}/100)`,
    prompt: review.checks.filter((c) => !c.met).map((c) => c.label).join("; ") || "Core AfL checks met",
    entryId: "formative-assessment-master",
  });

  for (const w of review.warnings.slice(0, 2)) {
    const fix = FORMATIVE_ASSESSMENT_WARNINGS.find((x) => x.warning === w);
    insights.push({
      id: `fa-${w.slice(0, 12)}`,
      area: "Formative Assessment",
      message: w,
      prompt: fix?.whyItMatters,
      entryId: "formative-assessment-master",
      fix: fix
        ? {
            target: w.includes("intention") || w.includes("criteria") ? "walt" : "assessmentNotes",
            text: fix.suggestedFix,
            actionLabel: "Apply fix",
          }
        : undefined,
    });
  }

  return insights;
}

export function buildSchemeFATips(
  scheme: Pick<SchemeOfWork, "lessons" | "topicId" | "yearGroup" | "pathway" | "selectedPathways">,
  activeLessonIndex = 0
): string[] {
  const text = scheme.lessons.map((l) => `${l.walt} ${l.wilf ?? ""} ${l.activities}`).join(" ");
  const ctx: FALessonContext = {
    yearGroup: scheme.yearGroup,
    pathway: scheme.selectedPathways?.[0] ?? scheme.pathway,
    topicId: scheme.topicId,
    activityArea: scheme.topicId,
    lessonCount: scheme.lessons.length,
    walt: text,
    activities: text,
  };

  if (!isFormativeAssessmentRelevant(text) && scheme.lessons.length < 3) return [];

  const evidence = generateEvidenceCollectionPlan(ctx);
  const exit = generateExitTicket(ctx);
  const tips: string[] = [];

  tips.push(`Assessment checkpoint (lesson ${activeLessonIndex + 1}): ${evidence.timingSuggestions[1] ?? "Mid-lesson WILF scan"}`);
  tips.push(`Evidence opportunity: ${evidence.evidenceOpportunities[0]}`);
  tips.push(`Retrieval: link to lesson ${Math.max(1, activeLessonIndex)} WILF in starter`);
  tips.push(`Reflection: ${exit.questions[1]?.question ?? "Which WILF did I meet?"}`);
  tips.push(`Hinge question: ${generateHingeQuestions(ctx)[0]?.question.slice(0, 80)}…`);

  if (detectFAPathwayPhase(ctx) === "sec") {
    tips.push(`SEC PE: ${evidence.secPeSuggestions?.[0] ?? "Oral questioning on theory before practical"}`);
  }
  if (detectFAPathwayPhase(ctx) === "alp") {
    tips.push(`ALP: ${evidence.alpSuggestions?.[0] ?? "Vocational observation checklist"}`);
  }

  return tips.slice(0, 6);
}
