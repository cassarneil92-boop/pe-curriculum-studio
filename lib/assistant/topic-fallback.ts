import type { PathwayId } from "@/lib/types";
import type { YearGroupId } from "@/lib/year-groups";
import { getYearGroupLabel } from "@/lib/year-groups";
import type { TeacherContextSnapshot } from "@/lib/teacher-context";
import {
  filterPlanningOutcomes,
  getPlanningOutcomeSuggestions,
  getPlanningTopicDisplayName,
} from "@/src/lib/curriculum/planning";
import type { LearningOutcome } from "@/src/lib/curriculum/types";

/** When a sport/topic has no direct outcomes, try related curriculum families (longest match first). */
const TOPIC_FALLBACK_CHAINS: Record<string, string[]> = {
  volleyball: ["net-games", "games", "fundamentals"],
  badminton: ["net-games", "games", "fundamentals"],
  pickleball: ["net-games", "games"],
  tchoukball: ["net-games", "games"],
  hockey: ["invasion-games", "games"],
  rugby: ["invasion-games", "games"],
  "touch-rugby": ["invasion-games", "games"],
  netball: ["net-games", "games"],
  handball: ["invasion-games", "games"],
  basketball: ["invasion-games", "games"],
  football: ["invasion-games", "games"],
  gymnastics: ["fundamentals", "games"],
  dance: ["fundamentals", "games"],
  athletics: ["fundamentals", "games"],
};

const DEFAULT_FALLBACK_CHAIN = ["games", "fundamentals"];

export interface TopicResolution {
  requestedTopicId: string;
  resolvedTopicId: string;
  requestedLabel: string;
  resolvedLabel: string;
  mappingNote: string | null;
  usedFallback: boolean;
  needsReview: boolean;
}

export interface OutcomeResolution {
  outcomes: LearningOutcome[];
  ranked: LearningOutcome[];
  topic: TopicResolution;
  primarySkillId: string;
}

function buildMappingNote(
  requestedTopicId: string,
  resolvedTopicId: string,
  yearGroup: YearGroupId
): string {
  const yearLabel = getYearGroupLabel(yearGroup);
  const requested = getPlanningTopicDisplayName(requestedTopicId);
  const resolved = getPlanningTopicDisplayName(resolvedTopicId);

  if (requestedTopicId === "volleyball" && resolvedTopicId === "net-games") {
    return `Volleyball has been mapped to Net/Wall Games / sending and receiving outcomes for ${yearLabel}.`;
  }

  if (requestedTopicId !== resolvedTopicId) {
    return `${requested} has been mapped to ${resolved} outcomes for ${yearLabel}.`;
  }

  return `${requested} outcomes for ${yearLabel} — review curriculum alignment before saving.`;
}

function inferPrimarySkill(topicId: string, outcomes: LearningOutcome[]): string {
  if (outcomes[0]?.skillIds[0]) return outcomes[0].skillIds[0];

  const defaults: Record<string, string> = {
    volleyball: "passing",
    "net-games": "passing",
    football: "passing",
    basketball: "passing",
    handball: "passing",
    gymnastics: "movement",
    athletics: "running",
    dance: "movement",
    fundamentals: "movement",
    games: "cooperation",
  };

  return defaults[topicId] ?? "movement";
}

export function resolveOutcomesForTopic(input: {
  appPathways: PathwayId[];
  yearGroup: YearGroupId;
  topicId: string;
  skillId?: string;
  context: TeacherContextSnapshot;
}): OutcomeResolution {
  const requestedLabel = getPlanningTopicDisplayName(input.topicId);
  const skillId = input.skillId ?? "";

  const tryTopic = (topicId: string) =>
    filterPlanningOutcomes({
      appPathways: input.appPathways,
      yearGroup: input.yearGroup,
      topicId,
      skillId: skillId || undefined,
      context: input.context,
    });

  let outcomes = tryTopic(input.topicId);
  if (outcomes.length > 0) {
    const ranked = rankOutcomes(input, input.topicId, skillId, outcomes);
    return {
      outcomes,
      ranked,
      topic: {
        requestedTopicId: input.topicId,
        resolvedTopicId: input.topicId,
        requestedLabel,
        resolvedLabel: requestedLabel,
        mappingNote: null,
        usedFallback: false,
        needsReview: false,
      },
      primarySkillId: inferPrimarySkill(input.topicId, ranked.length > 0 ? ranked : outcomes),
    };
  }

  const chain = TOPIC_FALLBACK_CHAINS[input.topicId] ?? DEFAULT_FALLBACK_CHAIN;
  for (const fallbackId of chain) {
    outcomes = tryTopic(fallbackId);
    if (outcomes.length > 0) {
      const ranked = rankOutcomes(input, fallbackId, skillId, outcomes);
      return {
        outcomes,
        ranked,
        topic: {
          requestedTopicId: input.topicId,
          resolvedTopicId: fallbackId,
          requestedLabel,
          resolvedLabel: getPlanningTopicDisplayName(fallbackId),
          mappingNote: buildMappingNote(input.topicId, fallbackId, input.yearGroup),
          usedFallback: true,
          needsReview: true,
        },
        primarySkillId: inferPrimarySkill(fallbackId, ranked.length > 0 ? ranked : outcomes),
      };
    }
  }

  outcomes = filterPlanningOutcomes({
    appPathways: input.appPathways,
    yearGroup: input.yearGroup,
    context: input.context,
  }).slice(0, 12);

  const resolvedTopicId = outcomes[0]?.topicIds[0] ?? input.topicId;
  return {
    outcomes,
    ranked: outcomes.slice(0, 8),
    topic: {
      requestedTopicId: input.topicId,
      resolvedTopicId,
      requestedLabel,
      resolvedLabel: getPlanningTopicDisplayName(resolvedTopicId),
      mappingNote:
        outcomes.length > 0
          ? buildMappingNote(input.topicId, resolvedTopicId, input.yearGroup)
          : `No exact curriculum match for ${requestedLabel} — using nearest ${getYearGroupLabel(input.yearGroup)} movement outcomes. Teacher review required.`,
      usedFallback: true,
      needsReview: true,
    },
    primarySkillId: inferPrimarySkill(resolvedTopicId, outcomes),
  };
}

function rankOutcomes(
  input: {
    appPathways: PathwayId[];
    yearGroup: YearGroupId;
    context: TeacherContextSnapshot;
  },
  topicId: string,
  skillId: string,
  outcomes: LearningOutcome[]
): LearningOutcome[] {
  if (!skillId) return outcomes.slice(0, 8);

  const suggestions = getPlanningOutcomeSuggestions({
    appPathways: input.appPathways,
    yearGroup: input.yearGroup,
    topicId,
    skillId,
    context: input.context,
  });
  const ranked = [...suggestions.strict, ...suggestions.additional];
  return ranked.length > 0 ? ranked : outcomes.slice(0, 8);
}
