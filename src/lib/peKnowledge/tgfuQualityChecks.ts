/**
 * TGfU Master Pack v2 — quality checks, thinking player and representativeness metrics.
 * Original educational content — not copied from copyrighted sources.
 */

import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import type { LessonApplyTarget } from "./applySuggestions";
import { isTGfURelevantTopic } from "./tgfuMaster";

export interface TGfUQualityInsight {
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

export interface ThinkingPlayerEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  label: string;
}

export interface RepresentativenessEvaluation {
  score: number;
  flags: string[];
  alternatives: string[];
  label: string;
}

export interface LearnerCentredEvaluation {
  score: number;
  decisionOpportunities: boolean;
  questioningOpportunities: boolean;
  autonomy: boolean;
  reflection: boolean;
  tacticalThinking: boolean;
  teacherDirectedWarning: string | null;
  fixes: string[];
}

export interface TGfUQualityWarning {
  id: string;
  warning: string;
  whyItMatters: string;
  suggestedFix: string;
}

export const THINKING_PLAYER_FRAMEWORK = {
  coreConcepts: [
    "learner centred",
    "player ownership",
    "decision making",
    "tactical awareness",
    "problem solving",
    "self regulation",
    "reflection",
  ],
  teacherDominatedIndicators: [
    "long explanations",
    "little decision making",
    "single correct answer expected",
    "teacher chooses all solutions",
    "no player discussion",
  ],
  thinkingPlayerIndicators: [
    "tactical choices in play",
    "guided questioning during freezes",
    "player discussion and peer coaching",
    "multiple valid solutions accepted",
    "reflection on decisions and patterns",
    "pupils explain why not just how",
  ],
};

export const TGfU_QUALITY_WARNINGS: TGfUQualityWarning[] = [
  {
    id: "no-game-form",
    warning: "No game form present",
    whyItMatters: "Without a game context, tactical problems stay abstract.",
    suggestedFix: "Start with a small-sided modified game before any isolated practice.",
  },
  {
    id: "no-questioning",
    warning: "No questioning planned",
    whyItMatters: "Pupils cannot construct tactical understanding without guided inquiry.",
    suggestedFix: "Add 2–3 freeze questions: What did you notice? Why that choice?",
  },
  {
    id: "no-tactical-problem",
    warning: "No tactical problem identified",
    whyItMatters: "Activities become recreation without a learning focus.",
    suggestedFix: "Name one problem in WALT (e.g. creating space) before the game starts.",
  },
  {
    id: "technique-dominates",
    warning: "Technique dominates lesson",
    whyItMatters: "Pupils drill without understanding when or why to use skills.",
    suggestedFix: "Lead with modified game; teach technique only after the problem emerges.",
  },
  {
    id: "no-return-to-game",
    warning: "No return to game",
    whyItMatters: "Practice does not transfer to performance.",
    suggestedFix: "Schedule return to modified game after every skill block.",
  },
  {
    id: "no-decisions",
    warning: "No decision making opportunities",
    whyItMatters: "Thinking players need choices under realistic conditions.",
    suggestedFix: "Add opposition, scoring constraints, or role choices.",
  },
  {
    id: "no-assessment",
    warning: "No assessment evidence",
    whyItMatters: "Cannot judge tactical or skill progress without observable criteria.",
    suggestedFix: "Add WILF lines for decisions, support play, and skill in game context.",
  },
  {
    id: "teacher-directed",
    warning: "Lesson may be overly teacher directed",
    whyItMatters: "Reduced autonomy limits self regulation and ownership.",
    suggestedFix: "Use player captains, brief freezes, and partner discussion before teacher input.",
  },
];

const NON_REPRESENTATIVE_PATTERNS: { pattern: RegExp; flag: string; alternative: string }[] = [
  {
    pattern: /\bcone(s)?\b.*\bdribbl/i,
    flag: "Isolated cone dribbling",
    alternative: "2v1 possession challenge with a goal or end zone",
  },
  {
    pattern: /\bpass(ing)?\b.*\b(no|without)\b.*\b(oppos|defend)/i,
    flag: "Passing with no opposition",
    alternative: "3v2 overload game requiring pass before score",
  },
  {
    pattern: /\b(repetit|line drill|queue drill)\b/i,
    flag: "Repetitive technical drills",
    alternative: "Conditioned small-sided game targeting today's tactical problem",
  },
  {
    pattern: /\bdrill\b(?!.*\bgame\b)/i,
    flag: "Drill-heavy plan without game link",
    alternative: "Modified game → brief skill → return to game",
  },
  {
    pattern: /\bshadow\b|\bghost\b/i,
    flag: "Non-interactive shadow practice",
    alternative: "Light opposition or constraints-led 1v1 decision task",
  },
];

function collectLessonText(lesson: Pick<LessonBuilderFormData, "walt" | "activities" | "structuredActivities" | "successCriteria" | "reflectionNotes" | "assessmentNotes" | "differentiation">): string {
  const structured = (lesson.structuredActivities ?? [])
    .map((a) => `${a.name} ${a.taskDescription} ${a.teachingCues.join(" ")}`)
    .join(" ");
  return [
    lesson.walt,
    lesson.activities,
    structured,
    lesson.successCriteria,
    lesson.reflectionNotes,
    lesson.assessmentNotes,
    lesson.differentiation,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function evaluateThinkingPlayerScore(
  lessonText: string
): ThinkingPlayerEvaluation {
  const text = lessonText.toLowerCase();
  let score = 50;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const positiveSignals: [RegExp, string, number][] = [
    [/\b(question|ask|why|how|what did you notice|freeze)\b/i, "Questioning planned", 8],
    [/\b(decision|choose|when to|option)\b/i, "Decision making focus", 10],
    [/\b(reflect|discuss|partner|team talk)\b/i, "Reflection or discussion", 8],
    [/\b(tactic|space|support|off.?ball)\b/i, "Tactical awareness", 10],
    [/\b(modified game|small.?sided|conditioned)\b/i, "Game-based context", 10],
    [/\b(multiple|different way|your choice)\b/i, "Multiple solutions encouraged", 6],
  ];

  const negativeSignals: [RegExp, string, number][] = [
    [/\b(demonstrate only|copy me|watch me|listen carefully for)\b/i, "Teacher-dominated delivery", -10],
    [/\b(drill|line up|one at a time)\b(?!.*game)/i, "Drill-heavy structure", -12],
    [/\b(correct answer|only way|must do it this way)\b/i, "Single correct answer", -8],
    [/\b(long briefing|explain for \d+ min)\b/i, "Extended teacher talk", -8],
  ];

  for (const [pattern, label, delta] of positiveSignals) {
    if (pattern.test(text)) {
      score += delta;
      strengths.push(label);
    }
  }
  for (const [pattern, label, delta] of negativeSignals) {
    if (pattern.test(text)) {
      score += delta;
      weaknesses.push(label);
    }
  }

  if (!/\bquestion|\bask|\breflect|\bdiscuss/i.test(text)) {
    weaknesses.push("Limited questioning or reflection signals");
    score -= 5;
  }

  score = Math.max(0, Math.min(100, score));
  const label =
    score >= 75
      ? "Strong thinking player orientation"
      : score >= 50
        ? "Developing thinking player elements"
        : "May be overly teacher directed";

  return {
    score,
    strengths: [...new Set(strengths)].slice(0, 4),
    weaknesses: [...new Set(weaknesses)].slice(0, 4),
    label,
  };
}

export function evaluateRepresentativeness(lessonText: string): RepresentativenessEvaluation {
  const text = lessonText.toLowerCase();
  const flags: string[] = [];
  const alternatives: string[] = [];
  let score = 70;

  const gameSignals = /\b(game|v ?\d|small.?sided|match|rally|score|oppos|defend|attack)\b/i;
  if (gameSignals.test(text)) {
    score += 15;
  } else {
    score -= 20;
    flags.push("Activities may not resemble the actual game");
    alternatives.push("Replace isolated tasks with a modified game form");
  }

  for (const { pattern, flag, alternative } of NON_REPRESENTATIVE_PATTERNS) {
    if (pattern.test(text)) {
      flags.push(flag);
      alternatives.push(`Instead of ${flag.toLowerCase()}: ${alternative}`);
      score -= 12;
    }
  }

  score = Math.max(0, Math.min(100, score));
  return {
    score,
    flags: [...new Set(flags)].slice(0, 3),
    alternatives: [...new Set(alternatives)].slice(0, 3),
    label:
      score >= 70
        ? "Representative learning likely"
        : score >= 45
          ? "Partially representative — review activities"
          : "Low representativeness — add game context",
  };
}

export function evaluateLearnerCentredQuality(lessonText: string): LearnerCentredEvaluation {
  const text = lessonText.toLowerCase();
  const decisionOpportunities = /\b(decision|choose|oppos|v ?\d|when to)\b/i.test(text);
  const questioningOpportunities = /\b(question|ask|why|what did you notice|freeze)\b/i.test(text);
  const autonomy = /\b(choice|captain|role|your turn to|peer)\b/i.test(text);
  const reflection = /\b(reflect|discuss|what would you|review)\b/i.test(text);
  const tacticalThinking = /\b(tactic|space|support|problem|strategy)\b/i.test(text);

  const checks = [decisionOpportunities, questioningOpportunities, autonomy, reflection, tacticalThinking];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  const fixes: string[] = [];
  if (!decisionOpportunities) fixes.push("Add opposition or choice points in the main activity.");
  if (!questioningOpportunities) fixes.push("Plan 2–3 guided questions during game freezes.");
  if (!autonomy) fixes.push("Assign player roles or captains to increase ownership.");
  if (!reflection) fixes.push("Add a brief reflection or partner discussion at lesson end.");
  if (!tacticalThinking) fixes.push("State one tactical problem in WALT before play.");

  const teacherDirectedWarning =
    score < 50 || (!decisionOpportunities && !questioningOpportunities)
      ? "Lesson may be overly teacher directed"
      : null;

  return {
    score,
    decisionOpportunities,
    questioningOpportunities,
    autonomy,
    reflection,
    tacticalThinking,
    teacherDirectedWarning,
    fixes: fixes.slice(0, 3),
  };
}

export function runTGfUQualityAudit(lessonText: string): TGfUQualityWarning[] {
  const text = lessonText.toLowerCase();
  const triggered: TGfUQualityWarning[] = [];

  if (!/\bgame\b|\bsmall.?sided|\bv ?\d|\bmatch\b/i.test(text)) {
    triggered.push(TGfU_QUALITY_WARNINGS.find((w) => w.id === "no-game-form")!);
  }
  if (!/\bquestion|\bask|\breflect|\bdiscuss/i.test(text)) {
    triggered.push(TGfU_QUALITY_WARNINGS.find((w) => w.id === "no-questioning")!);
  }
  if (!/\btactic|\bspace|\bdecision|\bproblem|\bpossess/i.test(text)) {
    triggered.push(TGfU_QUALITY_WARNINGS.find((w) => w.id === "no-tactical-problem")!);
  }
  if (/\bdrill\b/i.test(text) && !/\bgame\b|\breturn/i.test(text)) {
    triggered.push(TGfU_QUALITY_WARNINGS.find((w) => w.id === "technique-dominates")!);
  }
  if (/\bskill\b|\btechnique\b|\bpractice\b/i.test(text) && !/\breturn|\bback to game/i.test(text)) {
    triggered.push(TGfU_QUALITY_WARNINGS.find((w) => w.id === "no-return-to-game")!);
  }
  if (!/\bdecision|\bchoose|\boppos|\bv ?\d/i.test(text)) {
    triggered.push(TGfU_QUALITY_WARNINGS.find((w) => w.id === "no-decisions")!);
  }
  if (!/\bwilf|\bsuccess|\bevidence|\bassess|\bi can\b/i.test(text)) {
    triggered.push(TGfU_QUALITY_WARNINGS.find((w) => w.id === "no-assessment")!);
  }

  const learnerCentred = evaluateLearnerCentredQuality(text);
  if (learnerCentred.teacherDirectedWarning) {
    triggered.push(TGfU_QUALITY_WARNINGS.find((w) => w.id === "teacher-directed")!);
  }

  return triggered.slice(0, 4);
}

export function buildTGfUQualityInsights(lesson: LessonBuilderFormData): TGfUQualityInsight[] {
  if (!isTGfURelevantTopic(lesson.topicId)) return [];

  const text = collectLessonText(lesson);
  const audit = runTGfUQualityAudit(text);
  const learnerCentred = evaluateLearnerCentredQuality(text);

  const insights: TGfUQualityInsight[] = [];

  if (learnerCentred.teacherDirectedWarning) {
    insights.push({
      id: "tgfu-learner-centred",
      area: "Learner centred quality",
      message: learnerCentred.teacherDirectedWarning,
      prompt: "Increase decision opportunities, questioning, and pupil ownership.",
      entryId: "tgfu-master",
      fix: {
        target: "teacherNotes" as LessonApplyTarget,
        text: learnerCentred.fixes.join("\n"),
        actionLabel: "Apply fixes",
      },
    });
  }

  for (const warning of audit.slice(0, 2)) {
    insights.push({
      id: `tgfu-${warning.id}`,
      area: "TGfU quality",
      message: warning.warning,
      prompt: warning.whyItMatters,
      entryId: "tgfu-master",
      fix: {
        target: (warning.id === "no-assessment" ? "assessmentNotes" : warning.id === "no-questioning" ? "reflectionNotes" : "teacherNotes") as LessonApplyTarget,
        text: warning.suggestedFix,
        actionLabel: "Use fix",
      },
    });
  }

  const rep = evaluateRepresentativeness(text);
  if (rep.score < 55 && rep.alternatives[0]) {
    insights.push({
      id: "tgfu-representativeness",
      area: "Representative learning",
      message: rep.label,
      prompt: rep.flags[0],
      entryId: "tgfu-master",
      fix: {
        target: "teacherNotes" as LessonApplyTarget,
        text: rep.alternatives[0],
        actionLabel: "Use alternative",
      },
    });
  }

  return insights;
}

export function buildPedagogyCoachTGfUMetrics(lesson: LessonBuilderFormData): {
  thinkingPlayerScore: number;
  thinkingPlayerLabel: string;
  representativeScore: number;
  representativeLabel: string;
  strengths: string[];
  risks: string[];
  suggestedImprovement: string;
} | null {
  if (!isTGfURelevantTopic(lesson.topicId)) return null;

  const text = collectLessonText(lesson);
  const thinking = evaluateThinkingPlayerScore(text);
  const rep = evaluateRepresentativeness(text);
  const audit = runTGfUQualityAudit(text);

  const risks = [
    ...thinking.weaknesses,
    ...rep.flags,
    ...audit.map((w) => w.warning),
  ].slice(0, 3);

  const suggestedImprovement =
    audit[0]?.suggestedFix ??
    rep.alternatives[0] ??
    thinking.weaknesses[0] ??
    "Add a modified game with guided questioning and return-to-play.";

  return {
    thinkingPlayerScore: thinking.score,
    thinkingPlayerLabel: thinking.label,
    representativeScore: rep.score,
    representativeLabel: rep.label,
    strengths: thinking.strengths.slice(0, 2),
    risks,
    suggestedImprovement,
  };
}

export const GAME_PERFORMANCE_ASSESSMENT = {
  observeAreas: [
    "Decision making",
    "Support play",
    "Movement off ball",
    "Positioning",
    "Communication",
    "Tactical adaptation",
  ],
  evidenceStatements: [
    "I can explain why I chose a pass, shot, or movement in the game.",
    "I can support teammates by moving into useful space.",
    "I can adjust my strategy when the opponent changes approach.",
    "I can communicate roles and calls during play.",
    "I can perform skills with control when under light pressure.",
    "I can recognise patterns and use them to improve decisions.",
  ],
};

export function getGamePerformanceEvidenceSuggestions(count = 3): string[] {
  return GAME_PERFORMANCE_ASSESSMENT.evidenceStatements.slice(0, count);
}
