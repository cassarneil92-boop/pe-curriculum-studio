import { enrichImportedOutcomes } from "./enrich-tags";
import type {
  ImportedLearningOutcomeRecord,
  ImportedPathwayRecord,
  ImportedSkillRecord,
  ImportedTopicRecord,
  ImportedValueRecord,
} from "./types";
import { normaliseSkillId, normaliseTopicId, uniqueSorted } from "./utils";

export interface NormalizedImportData {
  pathways: ImportedPathwayRecord[];
  topics: ImportedTopicRecord[];
  skills: ImportedSkillRecord[];
  values: ImportedValueRecord[];
  learningOutcomes: ImportedLearningOutcomeRecord[];
}

export function normalizeImportedData(
  outcomes: ImportedLearningOutcomeRecord[]
): NormalizedImportData {
  const enrichedOutcomes = enrichImportedOutcomes(outcomes);
  const topicMap = new Map<string, ImportedTopicRecord>();
  const skillMap = new Map<string, ImportedSkillRecord>();
  const valueMap = new Map<string, ImportedValueRecord>();
  const outcomeMap = new Map<string, ImportedLearningOutcomeRecord>();
  const pathwayMap = new Map<string, ImportedPathwayRecord>();

  for (const outcome of enrichedOutcomes) {
    const existing = outcomeMap.get(outcome.id);
    if (existing) {
      existing.yearGroups = uniqueSorted([
        ...existing.yearGroups,
        ...outcome.yearGroups,
      ]);
      continue;
    }
    outcomeMap.set(outcome.id, outcome);

    if (!pathwayMap.has(outcome.pathwayId)) {
      pathwayMap.set(outcome.pathwayId, {
        id: outcome.pathwayId,
        label: outcome.pathwayLabel,
        sourceFiles: [],
        learningOutcomeCount: 0,
      });
    }

    const pathway = pathwayMap.get(outcome.pathwayId)!;
    if (!pathway.sourceFiles.includes(outcome.sourceFile)) {
      pathway.sourceFiles.push(outcome.sourceFile);
    }
    pathway.learningOutcomeCount += 1;

    const topicId = outcome.topicId || normaliseTopicId(outcome.topic);
    if (!topicMap.has(topicId)) {
      topicMap.set(topicId, {
        id: topicId,
        name: outcome.topic,
        skillIds: [],
        sourceFiles: [],
      });
    }
    const topic = topicMap.get(topicId)!;
    if (!topic.sourceFiles.includes(outcome.sourceFile)) {
      topic.sourceFiles.push(outcome.sourceFile);
    }

    for (const skillId of outcome.skillIds) {
      if (!topic.skillIds.includes(skillId)) {
        topic.skillIds.push(skillId);
      }

      const skillName =
        outcome.skills[outcome.skillIds.indexOf(skillId)] ?? skillId;
      if (!skillMap.has(skillId)) {
        skillMap.set(skillId, {
          id: skillId,
          name: skillName,
          topicIds: [],
          sourceFiles: [],
        });
      }
      const skill = skillMap.get(skillId)!;
      if (!skill.topicIds.includes(topicId)) {
        skill.topicIds.push(topicId);
      }
      if (!skill.sourceFiles.includes(outcome.sourceFile)) {
        skill.sourceFiles.push(outcome.sourceFile);
      }
    }

    for (const value of outcome.values) {
      if (!valueMap.has(value.id)) {
        valueMap.set(value.id, value);
      }
    }
  }

  const sortByName = <T extends { name?: string; label?: string; id: string }>(
    a: T,
    b: T
  ) => (a.name ?? a.label ?? a.id).localeCompare(b.name ?? b.label ?? b.id);

  return {
    pathways: [...pathwayMap.values()].sort((a, b) => a.label.localeCompare(b.label)),
    topics: [...topicMap.values()].sort(sortByName),
    skills: [...skillMap.values()].sort(sortByName),
    values: [...valueMap.values()].sort((a, b) => a.code.localeCompare(b.code)),
    learningOutcomes: [...outcomeMap.values()].sort((a, b) =>
      a.code.localeCompare(b.code)
    ),
  };
}

/** Guard against cross-topic skill contamination during import review. */
export function findCrossTopicWarnings(
  outcomes: ImportedLearningOutcomeRecord[]
): string[] {
  const warnings: string[] = [];

  for (const outcome of outcomes) {
    for (const skillId of outcome.skillIds) {
      if (skillId === "kicking" && outcome.topicId === "handball") {
        warnings.push(
          `${outcome.code}: kicking skill on handball topic — verify extraction accuracy.`
        );
      }
      if (skillId === "passing" && outcome.topicId === "football" && outcome.code.includes(".HB.")) {
        warnings.push(
          `${outcome.code}: code/topic mismatch — verify extraction accuracy.`
        );
      }
    }
  }

  return warnings;
}
