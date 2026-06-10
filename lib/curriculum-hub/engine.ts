import { getPathwayLabel } from "@/lib/constants";
import type { PathwayId } from "@/lib/types";
import type { YearGroupId } from "@/lib/year-groups";
import { yearGroupMatchesFilter } from "@/lib/year-groups";
import {
  isImportedOutcomeVisible,
  outcomeMatchesAppPathway,
  type TeacherContextSnapshot,
} from "@/lib/teacher-context";
import {
  formatOutcomeTopic,
  formatOutcomeValues,
  formatOutcomeYearGroups,
} from "@/src/lib/curriculum/coverage";
import type { ImportedLearningOutcomeRecord } from "@/src/lib/curriculum/coverage";
import { enhanceImportedOutcome } from "@/src/lib/curriculum/metadata";
import { skillLabelsForIds } from "@/src/lib/curriculum/metadata/infer-skills";
import { getTopicVisualMeta, topicKeyFromLabel } from "./topic-metadata";

export interface HubFilterState {
  appPathways: PathwayId[];
  yearGroupId: YearGroupId | "";
  search: string;
}

export interface HubTopicGroup {
  id: string;
  name: string;
  emoji: string;
  category: string;
  color: ReturnType<typeof getTopicVisualMeta>["color"];
  outcomes: ImportedLearningOutcomeRecord[];
  totalCount: number;
  visibleCount: number;
  skillsCount: number;
  pathwayLabels: string[];
  yearRange: string;
  coverage: number;
}

export interface HubPathwayOutcomeSection {
  pathwayId: PathwayId;
  label: string;
  outcomes: ImportedLearningOutcomeRecord[];
}

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

export function outcomeMatchesAnyAppPathway(
  outcome: ImportedLearningOutcomeRecord,
  pathways: PathwayId[]
): boolean {
  return pathways.some((pathway) => outcomeMatchesAppPathway(outcome, pathway));
}

export function getAppPathwaysForOutcome(
  outcome: ImportedLearningOutcomeRecord,
  selectedPathways: PathwayId[]
): PathwayId[] {
  return selectedPathways.filter((pathway) => outcomeMatchesAppPathway(outcome, pathway));
}

export function filterOutcomesByPathwayAndYear(
  outcomes: ImportedLearningOutcomeRecord[],
  filters: HubFilterState
): ImportedLearningOutcomeRecord[] {
  if (filters.appPathways.length === 0 || !filters.yearGroupId) return [];

  return outcomes.filter(
    (outcome) =>
      outcomeMatchesAnyAppPathway(outcome, filters.appPathways) &&
      yearGroupMatchesFilter(outcome.yearGroups, filters.yearGroupId)
  );
}

export function filterOutcomesForHub(
  outcomes: ImportedLearningOutcomeRecord[],
  filters: HubFilterState,
  context: TeacherContextSnapshot
): ImportedLearningOutcomeRecord[] {
  let list = filterOutcomesByPathwayAndYear(outcomes, filters);
  if (list.length === 0) return [];

  if (!context.exploreAllEnabled) {
    list = list.filter((outcome) => isImportedOutcomeVisible(outcome, context));
  }

  if (filters.search.trim()) {
    const q = normalise(filters.search);
    list = list.filter(
      (outcome) =>
        normalise(formatOutcomeTopic(outcome)).includes(q) ||
        normalise(outcome.description).includes(q) ||
        normalise(outcome.code).includes(q) ||
        outcome.skills?.some((skill) => normalise(skill).includes(q))
    );
  }

  return list;
}

function deriveYearRange(outcomes: ImportedLearningOutcomeRecord[]): string {
  const labels = new Set<string>();
  for (const outcome of outcomes) {
    for (const label of outcome.yearGroups ?? []) {
      if (label) labels.add(label);
    }
  }
  if (labels.size === 0) return "";
  const sorted = [...labels].sort();
  if (sorted.length === 1) return sorted[0];
  return `${sorted[0]} – ${sorted[sorted.length - 1]}`;
}

function derivePathwayLabels(
  outcomes: ImportedLearningOutcomeRecord[],
  selectedPathways: PathwayId[]
): string[] {
  const labels = new Set<string>();
  for (const pathwayId of selectedPathways) {
    const hasOutcomes = outcomes.some((outcome) =>
      outcomeMatchesAppPathway(outcome, pathwayId)
    );
    if (hasOutcomes) labels.add(getPathwayLabel(pathwayId));
  }
  return [...labels];
}

export function groupOutcomesIntoTopicCards(
  filteredOutcomes: ImportedLearningOutcomeRecord[],
  allMatchingOutcomes: ImportedLearningOutcomeRecord[],
  selectedPathways: PathwayId[],
  context: TeacherContextSnapshot
): HubTopicGroup[] {
  const groups = new Map<string, ImportedLearningOutcomeRecord[]>();

  for (const outcome of filteredOutcomes) {
    const name = formatOutcomeTopic(outcome);
    if (!name || name === "—") continue;
    const key = topicKeyFromLabel(name);
    const bucket = groups.get(key) ?? [];
    bucket.push(outcome);
    groups.set(key, bucket);
  }

  return [...groups.entries()]
    .map(([id, outcomes]) => {
      const name = formatOutcomeTopic(outcomes[0]);
      const meta = getTopicVisualMeta(name);
      const allForTopic = allMatchingOutcomes.filter(
        (o) => topicKeyFromLabel(formatOutcomeTopic(o)) === id
      );
      const visibleCount = allForTopic.filter((o) =>
        isImportedOutcomeVisible(o, context)
      ).length;

      return {
        id,
        name,
        emoji: meta.emoji,
        category: meta.category,
        color: meta.color,
        outcomes,
        totalCount: allForTopic.length,
        visibleCount,
        skillsCount: getSkillsFromOutcomes(allForTopic).length,
        pathwayLabels: derivePathwayLabels(allForTopic, selectedPathways),
        yearRange: deriveYearRange(allForTopic),
        coverage: allForTopic.length ? visibleCount / allForTopic.length : 0,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function groupOutcomesByAppPathway(
  outcomes: ImportedLearningOutcomeRecord[],
  selectedPathways: PathwayId[]
): HubPathwayOutcomeSection[] {
  return selectedPathways
    .map((pathwayId) => ({
      pathwayId,
      label: getPathwayLabel(pathwayId),
      outcomes: outcomes.filter((outcome) => outcomeMatchesAppPathway(outcome, pathwayId)),
    }))
    .filter((section) => section.outcomes.length > 0);
}

export function getSkillsFromOutcomes(
  outcomes: ImportedLearningOutcomeRecord[]
): string[] {
  const skills = new Set<string>();
  for (const raw of outcomes) {
    const outcome = enhanceImportedOutcome(raw);
    for (const skill of outcome.skills ?? []) {
      if (skill.trim()) skills.add(skill.trim());
    }
    if (outcome.skillIds?.length) {
      for (const label of skillLabelsForIds(outcome.skillIds)) {
        if (label.trim()) skills.add(label.trim());
      }
    }
  }
  return [...skills].sort((a, b) => a.localeCompare(b));
}

export function filterOutcomesBySkill(
  outcomes: ImportedLearningOutcomeRecord[],
  skill: string
): ImportedLearningOutcomeRecord[] {
  if (!skill) return outcomes;
  const key = normalise(skill);
  return outcomes.filter((outcome) =>
    outcome.skills?.some((s) => normalise(s) === key)
  );
}

export function formatOutcomeValuesList(outcome: ImportedLearningOutcomeRecord): string {
  return formatOutcomeValues(outcome);
}

export { formatOutcomeSource, formatOutcomeYearGroups } from "@/src/lib/curriculum/coverage";
