import type { PathwayId as AppPathwayId } from "@/lib/types";
import type { LearningOutcome, PathwayId as CurriculumPathwayId, Skill } from "@/src/lib/curriculum";
import { alignCurriculumFromInput, getSkillById } from "@/src/lib/curriculum";
import { getPlanningOutcomes } from "@/src/lib/curriculum/planning";
import { yearGroupMatchesFilter } from "@/lib/year-groups";
import { appPathwayToCurriculum } from "./pathway-map";

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

/** Curriculum pathways to query for a scheme focus (topic may widen pathway). */
export function getAlignmentPathways(
  appPathway: AppPathwayId,
  topicId: string
): CurriculumPathwayId[] {
  const primary = appPathwayToCurriculum(appPathway);
  if (!primary) return [];

  const pathways = new Set<CurriculumPathwayId>([primary]);

  // Fitness units under General / Sport Values PE draw from fitness-curriculum LOs.
  if (
    normalise(topicId) === "fitness" &&
    (appPathway === "general-pe" || appPathway === "sport-values")
  ) {
    pathways.add("fitness-curriculum");
  }

  if (appPathway === "fitness-curriculum") {
    pathways.add("fitness-curriculum");
  }

  return [...pathways];
}

function resolveAppPathways(input: {
  appPathway?: AppPathwayId;
  appPathways?: AppPathwayId[];
}): AppPathwayId[] {
  if (input.appPathways && input.appPathways.length > 0) {
    return input.appPathways;
  }
  if (input.appPathway) {
    return [input.appPathway];
  }
  return [];
}

export function alignSchemeCurriculum(input: {
  appPathway?: AppPathwayId;
  appPathways?: AppPathwayId[];
  yearGroup: string;
  topicId: string;
  skillId: string;
}): LearningOutcome[] {
  if (!input.topicId || !input.skillId) return [];

  const appPathways = resolveAppPathways(input);
  if (appPathways.length === 0) return [];

  const curriculumPathways = new Set<CurriculumPathwayId>();
  for (const appPathway of appPathways) {
    for (const pathway of getAlignmentPathways(appPathway, input.topicId)) {
      curriculumPathways.add(pathway);
    }
  }

  const seen = new Set<string>();
  const outcomes: LearningOutcome[] = [];

  for (const pathway of curriculumPathways) {
    const result = alignCurriculumFromInput({
      pathway,
      yearGroup: input.yearGroup,
      topic: input.topicId,
      skill: input.skillId,
    });

    if (!result) continue;

    for (const outcome of result.learningOutcomes) {
      if (!seen.has(outcome.id)) {
        seen.add(outcome.id);
        outcomes.push(outcome);
      }
    }
  }

  return outcomes;
}

/** Skills valid for the selected topic that have alignable outcomes for the pathway(s). */
export function getSkillsForSchemeFocus(
  topicId: string,
  appPathway: AppPathwayId,
  yearGroup?: string,
  appPathways?: AppPathwayId[]
): Skill[] {
  if (!topicId) return [];

  const pathways = new Set<CurriculumPathwayId>();
  for (const app of resolveAppPathways({ appPathway, appPathways })) {
    for (const pathway of getAlignmentPathways(app, topicId)) {
      pathways.add(pathway);
    }
  }

  const skillIds = new Set<string>();
  for (const outcome of getPlanningOutcomes()) {
    if (!pathways.has(outcome.pathwayId)) continue;
    if (!outcome.topicIds.map(normalise).includes(normalise(topicId))) continue;
    if (!yearGroupMatchesFilter(outcome.yearGroups, yearGroup)) continue;
    for (const skillId of outcome.skillIds) {
      skillIds.add(skillId);
    }
  }

  return [...skillIds]
    .map((id) => getSkillById(id))
    .filter((skill): skill is Skill => Boolean(skill))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function isSkillValidForTopic(
  topicId: string,
  skillId: string,
  appPathway?: AppPathwayId,
  yearGroup?: string,
  appPathways?: AppPathwayId[]
): boolean {
  if (!topicId || !skillId) return false;

  const pathways = new Set<CurriculumPathwayId>();
  for (const app of resolveAppPathways({ appPathway, appPathways })) {
    for (const pathway of getAlignmentPathways(app, topicId)) {
      pathways.add(pathway);
    }
  }

  return getPlanningOutcomes().some(
    (outcome) =>
      pathways.has(outcome.pathwayId) &&
      outcome.topicIds.map(normalise).includes(normalise(topicId)) &&
      outcome.skillIds.map(normalise).includes(normalise(skillId)) &&
      yearGroupMatchesFilter(outcome.yearGroups, yearGroup)
  );
}
