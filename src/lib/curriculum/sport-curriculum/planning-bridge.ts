import { yearGroupMatchesFilter } from "@/lib/year-groups";
import type { LearningOutcome } from "../types";
import { getSportDefinitionByTopicId, resolveSportIdFromTopic } from "./progression-framework";

export function isSportTopicId(topicId: string): boolean {
  return resolveSportIdFromTopic(topicId) !== null;
}

export function isSportPlanningOutcome(
  outcome: LearningOutcome,
  topicId?: string,
  yearGroup?: string
): boolean {
  const sportTopic = outcome.topicIds.some((id) => isSportTopicId(id));
  if (!sportTopic) return false;
  if (topicId && !outcome.topicIds.some((id) => id.toLowerCase() === topicId.toLowerCase())) {
    const sport = getSportDefinitionByTopicId(topicId);
    if (!sport || !outcome.topicIds.some((id) => sport.topicIds.includes(id))) return false;
  }
  if (yearGroup && !yearGroupMatchesFilter(outcome.yearGroups, yearGroup)) return false;
  return true;
}

import { SPORT_DEFINITIONS } from "./progression-framework";

export function getSportTopicIds(): string[] {
  return [...new Set(SPORT_DEFINITIONS.flatMap((s) => s.topicIds))];
}
