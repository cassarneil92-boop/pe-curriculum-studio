/**
 * Physical Literacy Master Pack v1 — audits, scoring, and quality engines.
 */

import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import type { SchemeOfWork, SOWLesson } from "@/lib/types";
import type { LessonApplyTarget } from "./applySuggestions";
import {
  getPhysicalLiteracyQuestions,
  PL_QUALITY_WARNINGS,
  yearGroupToPLQuestionBand,
  type PLAttributeId,
} from "./physicalLiteracyMaster";

export interface PhysicalLiteracyProfile {
  motivation: number;
  confidence: number;
  competence: number;
  knowledge: number;
  understanding: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface PhysicalLiteracyQualityResult {
  score: number;
  band: "Exceptional" | "Strong" | "Developing" | "Limited";
  profile: PhysicalLiteracyProfile;
  inclusionScore: number;
  participationPotential: "Low" | "Moderate" | "High";
  warnings: { warning: string; explanation: string; suggestedFix: string }[];
}

export interface PLQualityInsight {
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

export interface CurriculumBalanceResult {
  physical: number;
  cognitive: number;
  social: number;
  affective: number;
  flags: string[];
  recommendations: string[];
}

function collectLessonText(lesson: Pick<
  LessonBuilderFormData,
  "walt" | "activities" | "structuredActivities" | "successCriteria" | "reflectionNotes" | "assessmentNotes" | "differentiation"
>): string {
  const structured = (lesson.structuredActivities ?? [])
    .map((a) => `${a.name} ${a.taskDescription} ${a.differentiationEasier} ${a.differentiationHarder}`)
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

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scoreBand(score: number): PhysicalLiteracyQualityResult["band"] {
  if (score >= 90) return "Exceptional";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Developing";
  return "Limited";
}

export function evaluatePhysicalLiteracyProfile(lessonText: string): PhysicalLiteracyProfile {
  const text = lessonText.toLowerCase();
  const scoreDimension = (signals: [RegExp, number][], base = 45): number => {
    let s = base;
    for (const [pattern, delta] of signals) {
      if (pattern.test(text)) s += delta;
    }
    return clampScore(s);
  };

  const motivation = scoreDimension([
    [/\b(choice|choose|autonom|enjoy|fun|personal best|relevant)\b/i, 12],
    [/\b(wait|queue|line up|listen only)\b/i, -15],
    [/\b(motivat|engage|challenge)\b/i, 8],
  ]);
  const confidence = scoreDimension([
    [/\b(confidence|success|achiev|support|easier|personal best|private)\b/i, 12],
    [/\b(eliminat|rank|compare|winner|last picked|embarrass)\b/i, -18],
    [/\b(differentiat|adapt|optional)\b/i, 8],
  ]);
  const competence = scoreDimension([
    [/\b(skill|technique|control|quality|progression|apply)\b/i, 10],
    [/\b(wilf|success criteria|i can)\b/i, 8],
    [/\b(drill only|no application)\b/i, -10],
  ]);
  const knowledge = scoreDimension([
    [/\b(rule|know|understand why|health|safety|explain)\b/i, 10],
    [/\b(walt|learning intention)\b/i, 6],
  ]);
  const understanding = scoreDimension([
    [/\b(reflect|why|transfer|lifelong|outside school|self.?assess)\b/i, 12],
    [/\b(question|discuss|goal)\b/i, 8],
  ]);

  const dims: { name: string; score: number }[] = [
    { name: "Motivation", score: motivation },
    { name: "Confidence", score: confidence },
    { name: "Competence", score: competence },
    { name: "Knowledge", score: knowledge },
    { name: "Understanding", score: understanding },
  ];
  dims.sort((a, b) => b.score - a.score);
  const strengths = dims.slice(0, 2).filter((d) => d.score >= 55).map((d) => d.name);
  const weaknesses = [...dims].reverse().slice(0, 2).filter((d) => d.score < 60).map((d) => d.name);

  const recommendations: string[] = [];
  if (motivation < 60) recommendations.push("Add choice, relevance, or personal challenge to boost motivation.");
  if (confidence < 60) recommendations.push("Plan early success and avoid public comparison.");
  if (competence < 60) recommendations.push("Clarify skill focus and progression in WILF.");
  if (knowledge < 60) recommendations.push("Make rules, health links, or participation knowledge explicit.");
  if (understanding < 60) recommendations.push("Add reflection linking learning to lifelong movement.");

  return {
    motivation,
    confidence,
    competence,
    knowledge,
    understanding,
    strengths,
    weaknesses,
    recommendations: recommendations.slice(0, 4),
  };
}

export function evaluateConfidenceBuilding(lessonText: string): {
  score: number;
  flags: string[];
  fixes: string[];
} {
  const text = lessonText.toLowerCase();
  let score = 55;
  const flags: string[] = [];
  const fixes: string[] = [];

  if (/\b(success|achiev|personal best|support|easier)\b/i.test(text)) score += 15;
  if (/\b(differentiat|adapt|choice|optional role)\b/i.test(text)) score += 12;
  if (/\b(feedback|praise|improvement|effort)\b/i.test(text)) score += 10;
  if (/\b(eliminat|rank|compare|winner|knock out)\b/i.test(text)) {
    score -= 20;
    flags.push("Excessive comparison or elimination");
    fixes.push("Replace elimination with cooperative or personal best tasks.");
  }
  if (/\b(queue|wait|one at a time)\b/i.test(text) && !/\brotate|small group/i.test(text)) {
    flags.push("Limited active participation");
    fixes.push("Use small groups so all pupils attempt frequently.");
  }
  if (!/\b(differentiat|support|easier)\b/i.test(text)) {
    flags.push("Limited challenge adaptation");
    fixes.push("Add easier and harder routes to the same learning intention.");
  }

  return { score: clampScore(score), flags: flags.slice(0, 3), fixes: fixes.slice(0, 3) };
}

export function evaluateMotivationSupport(lessonText: string): {
  score: number;
  flags: string[];
  fixes: string[];
} {
  const text = lessonText.toLowerCase();
  let score = 50;
  const flags: string[] = [];
  const fixes: string[] = [];

  if (/\b(choice|autonom|enjoy|fun|relevant|why we)\b/i.test(text)) score += 14;
  if (/\b(challenge|personal best|goal)\b/i.test(text)) score += 10;
  if (/\b(game|active|engage)\b/i.test(text)) score += 8;
  if (/\b(wait|queue|long briefing|listen for)\b/i.test(text)) {
    score -= 12;
    flags.push("Passive learners or waiting lines");
    fixes.push("Reduce instruction time; start with active exploration.");
  }
  if (/\b(teacher talk|demonstrate only)\b/i.test(text)) {
    flags.push("Excessive instruction");
    fixes.push("Use show-and-play with brief freezes.");
  }
  if (!/\b(enjoy|fun|choice|challenge)\b/i.test(text)) {
    flags.push("Low engagement signals in plan");
    fixes.push("State how the activity is enjoyable and relevant in the opening.");
  }

  return { score: clampScore(score), flags: flags.slice(0, 3), fixes: fixes.slice(0, 3) };
}

export function evaluatePhysicalLiteracyInclusion(lessonText: string): {
  score: number;
  flags: string[];
  fixes: string[];
} {
  const text = lessonText.toLowerCase();
  let score = 55;
  const flags: string[] = [];
  const fixes: string[] = [];

  if (/\b(differentiat|send|inclus|adapt|access|easier|harder)\b/i.test(text)) score += 15;
  if (/\b(choice|role|multiple|all pupils|everyone)\b/i.test(text)) score += 10;
  if (/\b(gender|mixed|pair|cooperat)\b/i.test(text)) score += 6;
  if (!/\b(differentiat|adapt|support)\b/i.test(text)) {
    score -= 15;
    flags.push("No documented differentiation or access routes");
    fixes.push("Add support, core, and extend options with same WALT.");
  }
  if (/\b(eliminat|strongest only|team pick)\b/i.test(text)) {
    flags.push("Exclusion risk from selection-based tasks");
    fixes.push("Use roles and modified tasks so all contribute.");
  }
  if (/\b(compare|rank|fastest)\b/i.test(text) && !/\b(personal best)\b/i.test(text)) {
    flags.push("Confidence barriers from comparison");
    fixes.push("Celebrate personal progress in WILF.");
  }

  return { score: clampScore(score), flags: flags.slice(0, 3), fixes: fixes.slice(0, 3) };
}

export function evaluateLifelongParticipationPotential(lessonText: string): {
  level: "Low" | "Moderate" | "High";
  explanation: string;
} {
  const text = lessonText.toLowerCase();
  let points = 0;
  if (/\b(outside school|weekend|community|club|home|lifelong|active for life)\b/i.test(text)) points += 2;
  if (/\b(enjoy|positive|fun|self.?effic|confidence)\b/i.test(text)) points += 1;
  if (/\b(repeat|continue|pathway|local)\b/i.test(text)) points += 1;
  if (/\b(eliminat|only win|elite|select)\b/i.test(text)) points -= 2;
  if (/\b(low cost|walking|swim|cycle|play)\b/i.test(text)) points += 1;

  if (points >= 3) {
    return {
      level: "High",
      explanation: "Plan links activity to enjoyment, self efficacy, and participation beyond school.",
    };
  }
  if (points >= 1) {
    return {
      level: "Moderate",
      explanation: "Some lifelong links present — strengthen plenary connection to out-of-school activity.",
    };
  }
  return {
    level: "Low",
    explanation: "Little evidence of positive associations or repeatability outside school.",
  };
}

export function evaluatePerformanceBias(lessonText: string): {
  score: number;
  flags: string[];
  alternatives: string[];
} {
  const text = lessonText.toLowerCase();
  const flags: string[] = [];
  const alternatives: string[] = [];
  let score = 70;

  const biasPatterns: [RegExp, string, string][] = [
    [/\beliminat/i, "Elimination games", "Cooperative challenges with shared team goals"],
    [/\b(team pick|captain pick|strongest)\b/i, "Selection based success", "Assigned roles so all contribute"],
    [/\b(tournament|knockout|winner only)\b/i, "Excessive competition", "Personal best or round-robin with multiple success criteria"],
    [/\b(one performer|whole class watch)\b/i, "Limited participation opportunities", "Parallel stations or small group tasks"],
  ];

  for (const [pattern, flag, alt] of biasPatterns) {
    if (pattern.test(text)) {
      flags.push(flag);
      alternatives.push(alt);
      score -= 15;
    }
  }

  return { score: clampScore(score), flags: flags.slice(0, 3), alternatives: alternatives.slice(0, 3) };
}

export function evaluatePhysicalLiteracyQuality(lessonText: string): PhysicalLiteracyQualityResult {
  const profile = evaluatePhysicalLiteracyProfile(lessonText);
  const inclusion = evaluatePhysicalLiteracyInclusion(lessonText);
  const participation = evaluateLifelongParticipationPotential(lessonText);
  const performanceBias = evaluatePerformanceBias(lessonText);

  const participationScore = participation.level === "High" ? 85 : participation.level === "Moderate" ? 65 : 40;
  const composite =
    (profile.motivation +
      profile.confidence +
      profile.competence +
      profile.knowledge +
      profile.understanding +
      inclusion.score +
      participationScore +
      performanceBias.score) /
    8;

  const score = clampScore(composite);
  const warnings: PhysicalLiteracyQualityResult["warnings"] = [];

  for (const w of PL_QUALITY_WARNINGS) {
    if (w.id === "confidence-damage" && profile.confidence < 50) warnings.push(w);
    if (w.id === "limited-ownership" && profile.motivation < 50) warnings.push(w);
    if (w.id === "low-participation" && performanceBias.flags.some((f) => f.includes("participation"))) warnings.push(w);
    if (w.id === "performance-focus" && performanceBias.score < 55) warnings.push(w);
    if (w.id === "weak-inclusion" && inclusion.score < 55) warnings.push(w);
    if (w.id === "limited-challenge" && inclusion.flags.some((f) => f.includes("differentiation"))) warnings.push(w);
    if (w.id === "limited-lifelong" && participation.level === "Low") warnings.push(w);
  }

  return {
    score,
    band: scoreBand(score),
    profile,
    inclusionScore: inclusion.score,
    participationPotential: participation.level,
    warnings: warnings.slice(0, 4).map((w) => ({
      warning: w.warning,
      explanation: w.explanation,
      suggestedFix: w.suggestedFix,
    })),
  };
}

export function evaluateCurriculumBalance(
  lessons: Pick<SOWLesson, "walt" | "activities" | "wilf">[]
): CurriculumBalanceResult {
  const text = lessons.map((l) => `${l.walt} ${l.activities} ${l.wilf}`).join(" ").toLowerCase();

  const physical = (/\b(skill|technique|perform|fitness|run|jump|throw|strike)\b/i.test(text) ? 1 : 0) +
    (/\b(competence|control|quality)\b/i.test(text) ? 0.5 : 0);
  const cognitive = (/\b(decision|tactic|understand|know|explain|strategy)\b/i.test(text) ? 1 : 0) +
    (/\b(problem|think)\b/i.test(text) ? 0.5 : 0);
  const social = (/\b(team|communicat|cooperat|fair|role|support)\b/i.test(text) ? 1 : 0);
  const affective = (/\b(confidence|motivat|enjoy|reflect|effort|respect)\b/i.test(text) ? 1 : 0);

  const total = physical + cognitive + social + affective || 1;
  const norm = (v: number) => clampScore((v / total) * 100);

  const flags: string[] = [];
  const recommendations: string[] = [];

  if (physical / total > 0.55 && affective / total < 0.15) {
    flags.push("Over reliance on sport performance only");
    recommendations.push("Add confidence or motivation outcomes to scheme WALTs.");
  }
  if (/\bfitness test|beep test|circuits only\b/i.test(text) && cognitive / total < 0.2) {
    flags.push("Over reliance on fitness only");
    recommendations.push("Balance fitness with games or expressive movement.");
  }
  if (/\btournament|competition|win\b/i.test(text) && social / total < 0.2) {
    flags.push("Over reliance on competition only");
    recommendations.push("Include cooperative and individual success routes.");
  }

  return {
    physical: norm(physical),
    cognitive: norm(cognitive),
    social: norm(social),
    affective: norm(affective),
    flags,
    recommendations: recommendations.slice(0, 3),
  };
}

export function buildPhysicalLiteracyPlanningInsights(
  lessonText: string,
  yearGroup?: string
): string[] {
  const profile = evaluatePhysicalLiteracyProfile(lessonText);
  const confidence = evaluateConfidenceBuilding(lessonText);
  const motivation = evaluateMotivationSupport(lessonText);
  const inclusion = evaluatePhysicalLiteracyInclusion(lessonText);
  const lifelong = evaluateLifelongParticipationPotential(lessonText);

  const insights: string[] = [];
  if (confidence.score < 65) {
    insights.push(`Confidence: ${confidence.fixes[0] ?? "Plan early achievable success for all learners."}`);
  } else {
    insights.push("Confidence: Include personal best or private self-check opportunities.");
  }
  if (motivation.score < 65) {
    insights.push(`Motivation: ${motivation.fixes[0] ?? "Add choice or relevance within the learning intention."}`);
  } else {
    insights.push("Motivation: Link activity to pupil interests or real-world relevance.");
  }
  if (inclusion.score < 65) {
    insights.push(`Inclusion: ${inclusion.fixes[0] ?? "Document multiple success routes in differentiation."}`);
  } else {
    insights.push("Inclusion: Rotate roles so varied strengths are valued.");
  }
  if (lifelong.level !== "High") {
    insights.push(
      `Lifelong participation (${lifelong.level}): Add plenary — what could you try outside school this week?`
    );
  } else {
    insights.push("Lifelong participation: Signpost a local or low-cost activity linked to today's lesson.");
  }
  if (profile.weaknesses[0]) {
    insights.push(`Strengthen ${profile.weaknesses[0]}: ${profile.recommendations[0] ?? "Review WILF holistically."}`);
  }

  const ageBand = yearGroupToPLQuestionBand(yearGroup);
  insights.push(`Reflection prompt: ${getPhysicalLiteracyQuestions(ageBand, 1)[0]}`);

  return insights.slice(0, 5);
}

export function buildPedagogyCoachPhysicalLiteracyMetrics(lesson: LessonBuilderFormData): {
  score: number;
  band: string;
  strongestDimension: string;
  weakestDimension: string;
  improvementRecommendation: string;
  dimensions: Record<PLAttributeId, number>;
} {
  const text = collectLessonText(lesson);
  const quality = evaluatePhysicalLiteracyQuality(text);
  const dims: { id: PLAttributeId; name: string; score: number }[] = [
    { id: "motivation", name: "Motivation", score: quality.profile.motivation },
    { id: "confidence", name: "Confidence", score: quality.profile.confidence },
    { id: "physical-competence", name: "Competence", score: quality.profile.competence },
    { id: "knowledge", name: "Knowledge", score: quality.profile.knowledge },
    { id: "understanding", name: "Understanding", score: quality.profile.understanding },
  ];
  dims.sort((a, b) => b.score - a.score);

  return {
    score: quality.score,
    band: quality.band,
    strongestDimension: dims[0]?.name ?? "Motivation",
    weakestDimension: dims[dims.length - 1]?.name ?? "Understanding",
    improvementRecommendation:
      quality.warnings[0]?.suggestedFix ??
      quality.profile.recommendations[0] ??
      "Balance affective and cognitive outcomes in WILF.",
    dimensions: {
      motivation: quality.profile.motivation,
      confidence: quality.profile.confidence,
      "physical-competence": quality.profile.competence,
      knowledge: quality.profile.knowledge,
      understanding: quality.profile.understanding,
    },
  };
}

export function buildPhysicalLiteracyQualityReview(lesson: LessonBuilderFormData): PhysicalLiteracyQualityResult {
  return evaluatePhysicalLiteracyQuality(collectLessonText(lesson));
}

export function buildPhysicalLiteracyQualityInsights(lesson: LessonBuilderFormData): PLQualityInsight[] {
  const review = buildPhysicalLiteracyQualityReview(lesson);
  const insights: PLQualityInsight[] = [];

  insights.push({
    id: "pl-overview",
    area: "Physical Literacy Review",
    message: `${review.band} physical literacy quality (${review.score}/100)`,
    prompt: `Participation potential: ${review.participationPotential}. Inclusion: ${review.inclusionScore}/100.`,
    entryId: "physical-literacy-master",
  });

  for (const w of review.warnings.slice(0, 2)) {
    insights.push({
      id: `pl-${w.warning.slice(0, 20)}`,
      area: "Physical Literacy",
      message: w.warning,
      prompt: w.explanation,
      entryId: "physical-literacy-master",
      fix: {
        target: w.warning.includes("confidence") ? "differentiation" : "reflectionNotes",
        text: w.suggestedFix,
        actionLabel: "Apply fix",
      },
    });
  }

  if (review.profile.recommendations[0]) {
    insights.push({
      id: "pl-recommendation",
      area: "Physical Literacy",
      message: review.profile.recommendations[0],
      entryId: "physical-literacy-master",
      fix: {
        target: "successCriteria",
        text: `Add WILF for ${review.profile.weaknesses[0] ?? "confidence"}: e.g. I can describe what helped me succeed.`,
        actionLabel: "Add WILF",
      },
    });
  }

  return insights;
}

export function buildSchemePhysicalLiteracyTips(
  scheme: Pick<SchemeOfWork, "lessons" | "topicId" | "yearGroup">
): string[] {
  const lessons = scheme.lessons;
  if (lessons.length === 0) return [];

  const balance = evaluateCurriculumBalance(lessons);
  const tips: string[] = [];

  tips.push(
    `Confidence progression: start with achievable success in lesson 1; increase challenge gradually by lesson ${Math.min(lessons.length, 4)}.`
  );
  tips.push(
    `Competence progression: spiral skill quality before speed across ${lessons.length} lessons.`
  );
  tips.push("Motivation support: vary roles and include choice at least twice in the unit.");
  if (balance.affective < 50) {
    tips.push("Inclusion: add explicit confidence or motivation WILF in two lessons.");
  } else {
    tips.push("Inclusion: ensure differentiation is documented in every lesson.");
  }
  if (balance.flags.length > 0) {
    tips.push(`Lifelong participation: ${balance.recommendations[0] ?? "Link final lesson to community activity."}`);
  } else {
    tips.push("Lifelong participation: end unit with out-of-school activity suggestions.");
  }

  return tips.slice(0, 4);
}

export function buildPlanningAssistantPhysicalLiteracyCard(
  prompt: string,
  yearGroup?: string
): string[] {
  return buildPhysicalLiteracyPlanningInsights(prompt.toLowerCase(), yearGroup);
}
