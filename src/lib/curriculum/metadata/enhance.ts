import type { LearningOutcome } from "../types";
import type { ImportedLearningOutcomeRecord } from "../import/types";
import { inferSkillIdsFromText, mergeSkillIds, skillLabelsForIds } from "./infer-skills";

export interface EnhancedSkillMetadata {
  skillIds: string[];
  skills: string[];
  inferredSkillIds: string[];
  wasEnhanced: boolean;
}

export function enhanceSkillMetadata(
  description: string,
  existingSkillIds: string[] | undefined
): EnhancedSkillMetadata {
  const base = (existingSkillIds ?? []).map((id) => id.trim().toLowerCase());
  const inferred = inferSkillIdsFromText(description, base);
  const skillIds = mergeSkillIds(base, inferred);
  const added = inferred.filter((id) => !base.includes(id));

  return {
    skillIds,
    skills: skillLabelsForIds(skillIds),
    inferredSkillIds: added,
    wasEnhanced: added.length > 0,
  };
}

export function enhanceKnowledgeBaseOutcome(outcome: LearningOutcome): LearningOutcome {
  const enhanced = enhanceSkillMetadata(outcome.description, outcome.skillIds);
  if (!enhanced.wasEnhanced) return outcome;

  return {
    ...outcome,
    skillIds: enhanced.skillIds,
  };
}

export function enhanceImportedOutcome(
  outcome: ImportedLearningOutcomeRecord
): ImportedLearningOutcomeRecord {
  const enhanced = enhanceSkillMetadata(outcome.description, outcome.skillIds);
  if (!enhanced.wasEnhanced) return outcome;

  return {
    ...outcome,
    skillIds: enhanced.skillIds,
    skills: enhanced.skills,
  };
}

export function importedToLearningOutcome(
  record: ImportedLearningOutcomeRecord
): LearningOutcome {
  const topicIds = [
    record.topicId,
    ...(record.topics ?? []).map((topic) =>
      topic.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
    ),
  ].filter(Boolean);

  return {
    id: record.id,
    code: record.code,
    description: record.description,
    pathwayId: record.pathwayId as LearningOutcome["pathwayId"],
    topicIds: [...new Set(topicIds)],
    skillIds: record.skillIds ?? [],
    valueIds: (record.values ?? []).map((value) => value.id).filter(Boolean),
    assessmentIds: [],
    strand: record.strand ?? "",
    yearGroups: record.yearGroups,
  };
}
