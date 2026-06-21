import type { PathwayId as AppPathwayId } from "@/lib/types";
import type { TeacherContextSnapshot } from "@/lib/teacher-context";
import { yearGroupMatchesFilter } from "@/lib/year-groups";
import { getSkillById } from "../registry";
import { getUnifiedCurriculumOutcomes } from "../metadata";
import { skillLabelsForIds } from "../metadata/infer-skills";
import type { LearningOutcome, PathwayId as CurriculumPathwayId } from "../types";
import { LEARNING_OUTCOMES } from "../learning-outcomes";
import { isSchemeCurriculumOutcomeVisible } from "@/lib/scheme-builder/visibility";
import {
  getCurriculumPathwaysForAppPathways,
  getMatchingAppPathwaysForOutcome,
} from "./matching";
import { isPrimaryPlanningOutcome } from "../primary-pe/planning-bridge";
import {
  applyPlanningSkillCorrections,
  resetPlanningSkillCorrectionsLog,
} from "./skill-corrections";
import { getPlanningTopicDisplayName } from "./topic-labels";

export { getPlanningOutcomePathwayBadges } from "./pathway-badges";
export { getPlanningTopicDisplayName, GENERIC_TOPIC_LABELS, GENERIC_TOPIC_IDS } from "./topic-labels";

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

let cachedPlanningOutcomes: LearningOutcome[] | null = null;

const KB_OUTCOME_IDS = new Set(LEARNING_OUTCOMES.map((outcome) => outcome.id));

export function isKnowledgeBaseOutcome(outcomeId: string): boolean {
  return KB_OUTCOME_IDS.has(outcomeId);
}

export function getKnowledgeBaseOutcomeCount(): number {
  return LEARNING_OUTCOMES.length;
}

/** Shared planning curriculum source: imported JSON + KB + metadata + planning corrections. */
export function getPlanningOutcomes(): LearningOutcome[] {
  if (cachedPlanningOutcomes) return cachedPlanningOutcomes;
  cachedPlanningOutcomes = getUnifiedCurriculumOutcomes().map(applyPlanningSkillCorrections);
  return cachedPlanningOutcomes;
}

export function resetPlanningOutcomesCache(): void {
  cachedPlanningOutcomes = null;
  resetPlanningSkillCorrectionsLog();
}

export function getPlanningSkillDisplayName(skillId: string): string {
  const fromRegistry = getSkillById(skillId)?.name;
  if (fromRegistry) return fromRegistry;
  const [label] = skillLabelsForIds([skillId]);
  return label ?? skillId;
}

export interface PlanningFilter {
  appPathways: AppPathwayId[];
  yearGroup?: string;
  topicId?: string;
  skillId?: string;
  search?: string;
  context: TeacherContextSnapshot;
}

function isOutcomeVisibleForPlanning(
  outcome: LearningOutcome,
  appPathways: AppPathwayId[],
  context: TeacherContextSnapshot,
  topicId?: string,
  yearGroup?: string
): boolean {
  if (context.exploreAllEnabled) return true;

  const matchingApps = getMatchingAppPathwaysForOutcome(outcome, appPathways, topicId, yearGroup);
  if (matchingApps.length === 0) return false;

  return matchingApps.some((appPathway) =>
    isSchemeCurriculumOutcomeVisible(outcome, context, {
      appPathway,
      topicId: topicId ?? outcome.topicIds[0] ?? "",
    })
  );
}

function outcomeMatchesSkill(outcome: LearningOutcome, skillId: string): boolean {
  const key = normalise(skillId);
  return outcome.skillIds.some((id) => normalise(id) === key);
}

function outcomeMatchesTopic(outcome: LearningOutcome, topicId: string): boolean {
  const key = normalise(topicId);
  return outcome.topicIds.some((id) => normalise(id) === key);
}

function outcomeMatchesSearch(outcome: LearningOutcome, search: string): boolean {
  const q = normalise(search);
  if (!q) return true;
  return (
    normalise(outcome.description).includes(q) ||
    normalise(outcome.code).includes(q) ||
    outcome.topicIds.some((id) => normalise(getPlanningTopicDisplayName(id)).includes(q))
  );
}

function outcomeMatchesAppPathways(
  outcome: LearningOutcome,
  appPathways: AppPathwayId[],
  yearGroup?: string,
  topicId?: string
): boolean {
  if (appPathways.includes("primary-pe") && isPrimaryPlanningOutcome(outcome, yearGroup)) {
    return true;
  }

  const curriculumPathways = getCurriculumPathwaysForAppPathways(appPathways, topicId ?? "");
  return curriculumPathways.includes(outcome.pathwayId);
}

export function filterPlanningOutcomes(filter: PlanningFilter): LearningOutcome[] {
  const { appPathways, yearGroup, topicId, skillId, search, context } = filter;
  if (appPathways.length === 0) return [];

  return getPlanningOutcomes().filter((outcome) => {
    if (!outcomeMatchesAppPathways(outcome, appPathways, yearGroup, topicId)) return false;
    if (yearGroup && !yearGroupMatchesFilter(outcome.yearGroups, yearGroup)) return false;
    if (topicId && !outcomeMatchesTopic(outcome, topicId)) return false;
    if (skillId && !outcomeMatchesSkill(outcome, skillId)) return false;
    if (search && !outcomeMatchesSearch(outcome, search)) return false;
    if (!isOutcomeVisibleForPlanning(outcome, appPathways, context, topicId, yearGroup)) return false;
    return true;
  });
}

export interface PlanningTopicOption {
  id: string;
  label: string;
  outcomeCount: number;
}

export interface PlanningSkillOption {
  id: string;
  name: string;
}

export function getPlanningTopicOptions(
  appPathways: AppPathwayId[],
  yearGroup: string,
  context: TeacherContextSnapshot
): PlanningTopicOption[] {
  const outcomes = filterPlanningOutcomes({ appPathways, yearGroup, context });
  const groups = new Map<string, number>();

  for (const outcome of outcomes) {
    for (const topicId of outcome.topicIds) {
      groups.set(topicId, (groups.get(topicId) ?? 0) + 1);
    }
  }

  return [...groups.entries()]
    .map(([id, outcomeCount]) => ({
      id,
      label: getPlanningTopicDisplayName(id),
      outcomeCount,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getPlanningSkillOptions(
  appPathways: AppPathwayId[],
  yearGroup: string,
  topicId: string,
  context: TeacherContextSnapshot
): PlanningSkillOption[] {
  if (!topicId) return [];

  const outcomes = filterPlanningOutcomes({ appPathways, yearGroup, topicId, context });
  const skillIds = new Set<string>();

  for (const outcome of outcomes) {
    for (const skillId of outcome.skillIds) {
      skillIds.add(skillId);
    }
  }

  return [...skillIds]
    .map((id) => ({ id, name: getPlanningSkillDisplayName(id) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function isPlanningTopicValid(
  appPathways: AppPathwayId[],
  yearGroup: string,
  topicId: string,
  context: TeacherContextSnapshot
): boolean {
  return getPlanningTopicOptions(appPathways, yearGroup, context).some(
    (topic) => normalise(topic.id) === normalise(topicId)
  );
}

export function isPlanningSkillValid(
  appPathways: AppPathwayId[],
  yearGroup: string,
  topicId: string,
  skillId: string,
  context: TeacherContextSnapshot
): boolean {
  return getPlanningSkillOptions(appPathways, yearGroup, topicId, context).some(
    (skill) => normalise(skill.id) === normalise(skillId)
  );
}

export function groupPlanningOutcomesByTopic(
  outcomes: LearningOutcome[]
): Map<string, LearningOutcome[]> {
  const groups = new Map<string, LearningOutcome[]>();
  for (const outcome of outcomes) {
    for (const topicId of outcome.topicIds) {
      const list = groups.get(topicId) ?? [];
      list.push(outcome);
      groups.set(topicId, list);
    }
  }
  return groups;
}

export function groupPlanningOutcomesByPathway(
  outcomes: LearningOutcome[]
): Map<CurriculumPathwayId, LearningOutcome[]> {
  const groups = new Map<CurriculumPathwayId, LearningOutcome[]>();
  for (const outcome of outcomes) {
    const list = groups.get(outcome.pathwayId) ?? [];
    list.push(outcome);
    groups.set(outcome.pathwayId, list);
  }
  return groups;
}

export function resolvePlanningAppPathways(
  selectedPathways: AppPathwayId[] | undefined,
  primaryPathway: AppPathwayId
): AppPathwayId[] {
  if (selectedPathways && selectedPathways.length > 0) {
    return selectedPathways;
  }
  return primaryPathway ? [primaryPathway] : [];
}

export function getPlanningOutcomeCounts(): {
  planningTotal: number;
  knowledgeBase: number;
  importedEnhanced: number;
} {
  const planning = getPlanningOutcomes();
  return {
    planningTotal: planning.length,
    knowledgeBase: LEARNING_OUTCOMES.length,
    importedEnhanced: planning.filter((o) => !isKnowledgeBaseOutcome(o.id)).length,
  };
}
