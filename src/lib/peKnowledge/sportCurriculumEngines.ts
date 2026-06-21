import type { SchemeOfWork } from "@/lib/types";
import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import {
  formatPedagogyRecommendations,
  getSportDefinitionByTopicId,
  querySportProgression,
  resolveSportIdFromTopic,
} from "@/src/lib/curriculum/sport-curriculum";
import {
  SPORT_CURRICULUM_CORE_MESSAGE,
  SPORT_KNOWLEDGE_TOPICS,
  isSportCurriculumRelevant,
} from "./sportCurriculumMaster";
import type { PrimaryPEQualityInsight } from "./primaryPEEngines";

export interface SportPlanningContext {
  yearGroup?: string;
  topicId?: string;
  skillId?: string;
  activityArea?: string;
  lessonAim?: string;
}

export function buildSportCurriculumPlanningInsights(
  prompt: string,
  ctx: SportPlanningContext
): string[] {
  if (!isSportCurriculumRelevant(prompt, ctx.topicId)) return [];

  const sport = ctx.topicId ? getSportDefinitionByTopicId(ctx.topicId) : null;
  const insights: string[] = [
    "Name the skill focus and lesson phase (technique → opposed → game) in your WALT.",
  ];

  if (sport) {
    insights.push(
      `Recommended pedagogy for ${sport.label}: ${formatPedagogyRecommendations(sport.recommendedPedagogy)}.`
    );
    insights.push(`Essential resources: ${sport.resources.join(", ")}.`);
  }

  if (/tgfu|game|tactical|decision/i.test(prompt)) {
    insights.push("TGfU: start with a modified game that exposes the tactical problem, then teach skill in context.");
  }
  if (/progress|6 lesson|unit|scheme/i.test(prompt)) {
    insights.push("Sequence skills in progression order — do not jump to full game before technique is secure.");
  }

  return insights.slice(0, 4);
}

export function buildSchemeSportTips(
  scheme: Pick<SchemeOfWork, "topicId" | "yearGroup" | "lessons" | "pathway">
): string[] {
  if (!scheme.topicId || !resolveSportIdFromTopic(scheme.topicId)) return [];

  const result = querySportProgression({ topicId: scheme.topicId, yearGroup: scheme.yearGroup });
  if (!result.sport) return [];

  const tips: string[] = [
    `Sequence ${result.sport.label}: ${result.lessonPhases.map((p) => p.label).join(" → ")}.`,
    `Pedagogy: ${formatPedagogyRecommendations(result.recommendedPedagogy)}.`,
    SPORT_CURRICULUM_CORE_MESSAGE.slice(0, 70) + "…",
  ];

  if (scheme.lessons.length >= 6) {
    tips.push("Mid-unit: opposed practice with increasing defensive pressure.");
    tips.push("Final lessons: small-sided or modified game with assessment focus.");
  }

  return tips.slice(0, 4);
}

export function buildSportLessonDesignHints(input: {
  selectedOutcomeIds: string[];
  topicId: string;
  skillId?: string;
}): {
  walt: string[];
  wilf: string[];
  activities: string[];
  assessment: string[];
  reflection: string[];
  pedagogy: string[];
  resources: string[];
} {
  const sport = getSportDefinitionByTopicId(input.topicId);
  if (!sport && !resolveSportIdFromTopic(input.topicId)) {
    return { walt: [], wilf: [], activities: [], assessment: [], reflection: [], pedagogy: [], resources: [] };
  }

  const result = querySportProgression({
    topicId: input.topicId,
    skillId: input.skillId,
  });

  const walt: string[] = [];
  const wilf: string[] = [];
  const activities: string[] = [];
  const assessment: string[] = [];
  const reflection: string[] = [];
  const pedagogy: string[] = [];

  const skillLabel = result.skill?.label ?? input.skillId?.replace(/-/g, " ") ?? "the focus skill";
  const phase = result.lessonPhases[0]?.label ?? "Technique";

  walt.push(`We are learning to ${skillLabel.toLowerCase()} in ${result.sport?.label ?? "sport"}.`);
  wilf.push(`I can perform ${skillLabel.toLowerCase()} with correct technique.`);
  wilf.push(`I can apply ${skillLabel.toLowerCase()} under light pressure.`);

  for (const p of result.lessonPhases) {
    activities.push(`${p.label}: structured activity developing ${skillLabel.toLowerCase()}.`);
  }

  assessment.push(`Observe ${skillLabel.toLowerCase()} — technique checklist and decision-making in game phase.`);
  reflection.push(`What helped you improve ${skillLabel.toLowerCase()} today? What is your next focus?`);
  pedagogy.push(formatPedagogyRecommendations(result.recommendedPedagogy));

  if (result.sport?.id === "football") {
    activities.push("Technique → opposed practice → 4v4 small sided game → team reflection.");
  } else if (result.sport?.id === "volleyball") {
    activities.push("Cooperative rally → skill stations → modified game → rotation review.");
  } else if (result.sport?.id === "athletics") {
    activities.push("Technique drills → measured application → personal best recording → reflection.");
  }

  return {
    walt: [...new Set(walt)].slice(0, 3),
    wilf: [...new Set(wilf)].slice(0, 4),
    activities: [...new Set(activities)].slice(0, 4),
    assessment: [...new Set(assessment)].slice(0, 3),
    reflection: [...new Set(reflection)].slice(0, 2),
    pedagogy: [...new Set(pedagogy)].slice(0, 2),
    resources: result.resources.slice(0, 5),
  };
}

export function buildSportActivityBlocks(input: {
  topicId: string;
  skillName: string;
  topicName: string;
  duration: number;
}): Array<{
  blockType: "warm-up" | "skill-practice" | "conditioned-practice" | "small-sided-game" | "reflection";
  name: string;
  purpose: string;
  durationMinutes: number;
  equipment: string;
  progression: string;
}> {
  const sport = getSportDefinitionByTopicId(input.topicId);
  if (!sport) return [];

  const phases = sport.lessonPhases;
  const equipment = sport.resources.join(", ");
  const focus = input.skillName || sport.label;
  const total = Math.max(input.duration, 30);

  const durations = [
    Math.round(total * 0.15),
    Math.round(total * 0.25),
    Math.round(total * 0.35),
    Math.max(5, Math.round(total * 0.12)),
  ];

  const blockTypes: Array<"warm-up" | "skill-practice" | "conditioned-practice" | "small-sided-game" | "reflection"> = [
    "warm-up",
    "skill-practice",
    sport.id === "football" || sport.id === "basketball" || sport.id === "handball"
      ? "small-sided-game"
      : "conditioned-practice",
    "reflection",
  ];

  return phases.slice(0, 4).map((phase, index) => ({
    blockType: blockTypes[index] ?? "skill-practice",
    name: phase.label,
    purpose: `${phase.label} — develop ${focus} in ${sport.label}.`,
    durationMinutes: durations[index] ?? 10,
    equipment,
    progression: index === 0
      ? "Pulse raiser → dynamic mobility → skill activation"
      : index === phases.length - 1
        ? "Self and peer assessment → target setting"
        : `Build from unopposed → opposed → game application`,
  }));
}

export function buildSportQualityInsights(
  lesson: Pick<LessonBuilderFormData, "topicId" | "walt" | "selectedLearningOutcomeIds">
): PrimaryPEQualityInsight[] {
  if (!lesson.topicId || !resolveSportIdFromTopic(lesson.topicId)) return [];

  const insights: PrimaryPEQualityInsight[] = [];
  const sport = getSportDefinitionByTopicId(lesson.topicId);
  const walt = lesson.walt?.toLowerCase() ?? "";

  if (!/pass|dribbl|shoot|serve|sprint|balance|choreograph|skill|technique|tactic/i.test(walt)) {
    insights.push({
      id: "sport-walt-skill",
      area: "Sport Intelligence",
      message: "WALT does not name a specific sport skill or tactical focus.",
      prompt: `Add the skill focus for ${sport?.label ?? "this sport"} (e.g. passing, serve, sprint technique).`,
      entryId: "sport-curriculum-master",
    });
  }

  if (sport && !walt.includes(sport.label.toLowerCase().slice(0, 4))) {
    insights.push({
      id: "sport-context",
      area: "Sport Intelligence",
      message: `${sport.label} context could be clearer in learning design.`,
      prompt: `Link WALT to ${sport.label} — recommended: ${formatPedagogyRecommendations(sport.recommendedPedagogy)}.`,
      entryId: "sport-curriculum-master",
    });
  }

  return insights;
}

export { SPORT_KNOWLEDGE_TOPICS, SPORT_CURRICULUM_CORE_MESSAGE };
