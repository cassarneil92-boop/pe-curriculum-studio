import { getYearGroupLabel } from "@/lib/year-groups";
import type { YearGroupId } from "@/lib/year-groups";
import { buildSchemesLink } from "@/lib/curriculum-hub/planning-links";
import { suggestedSchemeTitle } from "@/lib/scheme-builder/helpers";
import { buildWaltIdeas, SOW_WILF_CARDS } from "@/lib/scheme-builder/constants";
import { getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import {
  formatPedagogyRecommendations,
  getSkillProgressionAcrossLessons,
  getSportDefinitionByTopicId,
  querySportProgression,
  resolveSportIdFromTopic,
} from "@/src/lib/curriculum/sport-curriculum";
import { SPORT_KNOWLEDGE_TOPICS } from "@/src/lib/peKnowledge/sportCurriculumMaster";
import type { ParsedAssistantQuery } from "./query-parser";
import type { AssistantResponse, AssistantQueryContext } from "./responses";

function toMatches(
  outcomes: ReturnType<typeof querySportProgression>["outcomes"],
  limit = 8
): NonNullable<AssistantResponse["matches"]> {
  return outcomes.slice(0, limit).map((o) => ({
    code: o.code,
    description: o.description,
    topicLabel: getPlanningTopicDisplayName(o.topicIds[0] ?? ""),
  }));
}

function resolveSportYearGroup(parsed: ParsedAssistantQuery): {
  yearGroupId: YearGroupId;
  yearLabel: string;
} {
  const id = parsed.yearGroupId ?? "year-8";
  return { yearGroupId: id, yearLabel: getYearGroupLabel(id) };
}

function resolveSportTopic(parsed: ParsedAssistantQuery): string {
  if (parsed.topicId) return parsed.topicId;
  const q = parsed.normalised;
  if (/\bfootball\b/.test(q)) return "football";
  if (/\bbasketball\b/.test(q)) return "basketball";
  if (/\bvolleyball\b/.test(q)) return "volleyball";
  if (/\bhandball\b/.test(q)) return "handball";
  if (/\bathletics\b/.test(q)) return "athletics";
  if (/\bgymnastics\b/.test(q)) return "gymnastics";
  if (/\bdance\b/.test(q)) return "dance";
  if (/\bbadminton|racket|tennis\b/.test(q)) return "badminton";
  return "football";
}

function resolveSkillHint(q: string): string | undefined {
  const skills = [
    "passing", "receiving", "dribbling", "finishing", "defending", "pressing",
    "shooting", "lay-up", "rebounding", "serve", "dig", "set", "spike", "block",
    "sprint", "jump", "throw", "balance", "rotation",
  ];
  return skills.find((s) => q.includes(s.replace("-", " ")) || q.includes(s));
}

function isSportContext(parsed: ParsedAssistantQuery): boolean {
  const q = parsed.normalised;
  if (parsed.topicId && resolveSportIdFromTopic(parsed.topicId)) return true;
  return /\b(create|progress|suggest|unit|lesson|tgfu|passing|dribbling|serve|spike|small sided)\b/.test(q) &&
    /\b(football|basketball|volleyball|handball|athletics|gymnastics|dance|badminton|racket)\b/.test(q);
}

export function handleSportAssistantQuery(
  parsed: ParsedAssistantQuery,
  _context: AssistantQueryContext
): AssistantResponse | null {
  if (!isSportContext(parsed)) return null;

  const q = parsed.normalised;
  const { yearGroupId, yearLabel } = resolveSportYearGroup(parsed);
  const topicId = resolveSportTopic(parsed);
  const skillHint = resolveSkillHint(q);
  const result = querySportProgression({ topicId, skillId: skillHint, yearGroup: yearLabel });

  if (/\b(create|build|plan)\b/.test(q) && /\blesson\b/.test(q)) {
    const skill = skillHint ?? "passing";
    return {
      answer: `**${yearLabel} ${result.sport?.label ?? topicId} ${skill} lesson** — phase sequence: ${result.lessonPhases.map((p) => p.label).join(" → ")}.\n\nRecommended pedagogy: **${formatPedagogyRecommendations(result.recommendedPedagogy)}**.`,
      detectedContext: {
        intent: "Create sport lesson",
        yearGroup: yearLabel,
        topic: result.sport?.label ?? topicId,
        confidence: parsed.confidence,
      },
      matches: toMatches(result.outcomes),
      waltExamples: buildWaltIdeas(result.sport?.label ?? topicId, skill),
      successCriteria: [...SOW_WILF_CARDS].slice(0, 4),
      relatedOutcomeCodes: result.outcomes.map((o) => o.code),
      relatedTopicIds: [topicId],
      suggestions: [
        ...result.resources,
        ...SPORT_KNOWLEDGE_TOPICS.slice(0, 3),
      ],
    };
  }

  if (/\b(create|build|plan|unit)\b/.test(q) && /\bserv/i.test(q) && /\bvolleyball\b/.test(q)) {
    const lessonCount = parsed.lessonCount ?? 6;
    const sequence = getSkillProgressionAcrossLessons("volleyball", "serve", lessonCount);
    return {
      answer: `**Volleyball serving unit** (${lessonCount} lessons) for **${yearLabel}**:\n\n${sequence.map((s) => `Lesson ${s.lessonNumber}: ${s.focus} (${s.phase})`).join("\n")}`,
      detectedContext: {
        intent: "Create volleyball unit",
        yearGroup: yearLabel,
        topic: "Volleyball",
        lessonCount,
        confidence: parsed.confidence,
      },
      matches: toMatches(result.outcomes),
      planningSequence: sequence.map((s) => ({
        lessonNumber: s.lessonNumber,
        focus: s.focus,
        activity: s.phase,
        waltExample: buildWaltIdeas("Volleyball", "serve")[0],
      })),
      suggestedTitle: suggestedSchemeTitle("volleyball", yearLabel, "Term 1"),
      suggestedLessonCount: lessonCount,
      schemeDraftSource: {
        yearGroupId,
        appPathways: ["general-pe"],
        topicId: "volleyball",
        skillId: "serve",
        term: "Term 1",
        outcomeIds: result.outcomes.map((o) => o.id),
      },
      relatedOutcomeCodes: result.outcomes.map((o) => o.code),
      relatedTopicIds: ["volleyball"],
      suggestions: ["Suggest TGfU activities for volleyball", "Progress volleyball dig across 6 lessons"],
      actions: [{
        label: "Open Scheme Builder",
        href: buildSchemesLink({ appPathways: ["general-pe"], yearGroupId, topicLabel: "Volleyball" }),
        variant: "primary",
      }],
    };
  }

  if (/\bprogress\b/.test(q) && /\b(dribbl|pass|serve|shoot)\b/.test(q) && /\b6 lesson|\bunit\b/.test(q)) {
    const sportId = resolveSportIdFromTopic(topicId);
    const skill = skillHint ?? "dribbling";
    const lessonCount = parsed.lessonCount ?? 6;
    if (!sportId) return null;
    const sequence = getSkillProgressionAcrossLessons(sportId, skill, lessonCount);
    return {
      answer: `**${result.sport?.label} ${skill} progression** across ${lessonCount} lessons:\n\n${sequence.map((s) => `- Lesson ${s.lessonNumber}: ${s.focus}`).join("\n")}`,
      detectedContext: {
        intent: "Skill progression unit",
        yearGroup: yearLabel,
        topic: result.sport?.label,
        lessonCount,
        confidence: parsed.confidence,
      },
      matches: toMatches(result.outcomes),
      planningSequence: sequence.map((s) => ({
        lessonNumber: s.lessonNumber,
        focus: s.focus,
        activity: s.phase,
      })),
      relatedOutcomeCodes: result.outcomes.map((o) => o.code),
      relatedTopicIds: [topicId],
      suggestions: result.relatedSkills.map((s) => `Next skill: ${s.label}`),
    };
  }

  if (/\btgf[uu]?\b/.test(q) || /\bsuggest.*activit/i.test(q)) {
    const sport = getSportDefinitionByTopicId(topicId);
    return {
      answer: `**TGfU activities for ${sport?.label ?? topicId}** — use a modified game that exposes the tactical problem first, then teach skill in context.\n\nRecommended: **${formatPedagogyRecommendations(result.recommendedPedagogy)}**.\n\nExample: reduce players, adapt space/rules, use guided questions after each game bout.`,
      detectedContext: {
        intent: "TGfU sport activities",
        yearGroup: yearLabel,
        topic: sport?.label ?? topicId,
        confidence: parsed.confidence,
      },
      matches: toMatches(result.outcomes),
      waltExamples: [
        `We are learning to solve tactical problems in ${sport?.label ?? topicId}.`,
        `We are learning when to use ${skillHint ?? "the skill"} in a game.`,
      ],
      successCriteria: [
        "I can explain the tactical problem in today's game.",
        "I can apply the skill when the game demands it.",
      ],
      relatedOutcomeCodes: result.outcomes.map((o) => o.code),
      relatedTopicIds: [topicId],
      suggestions: [...SPORT_KNOWLEDGE_TOPICS.slice(0, 4)],
    };
  }

  if (result.sport) {
    return {
      answer: `**${result.sport.label} intelligence** — ${result.outcomes.length} outcomes, ${result.sport.skills.length} skills tracked.\n\n${result.narrative ?? ""}\n\nPedagogy: ${formatPedagogyRecommendations(result.recommendedPedagogy)}.`,
      detectedContext: {
        intent: "Sport overview",
        yearGroup: yearLabel,
        topic: result.sport.label,
        confidence: parsed.confidence,
      },
      matches: toMatches(result.outcomes),
      waltExamples: buildWaltIdeas(result.sport.label, skillHint ?? "skills"),
      relatedOutcomeCodes: result.outcomes.map((o) => o.code),
      relatedTopicIds: [topicId],
      suggestions: [
        `Create a ${yearLabel} ${result.sport.label.toLowerCase()} passing lesson`,
        `Progress ${result.sport.label.toLowerCase()} ${skillHint ?? "skills"} across 6 lessons`,
        `Suggest TGfU activities for ${result.sport.label.toLowerCase()}`,
      ],
    };
  }

  return null;
}
