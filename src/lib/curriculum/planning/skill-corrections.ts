import type { LearningOutcome } from "../types";
import { inferSkillIdsFromText } from "../metadata/infer-skills";

export interface PlanningSkillCorrection {
  outcomeId: string;
  removed: string[];
  reason: string;
}

const correctionsLog: PlanningSkillCorrection[] = [];

export function getPlanningSkillCorrectionsLog(): PlanningSkillCorrection[] {
  return [...correctionsLog];
}

export function resetPlanningSkillCorrectionsLog(): void {
  correctionsLog.length = 0;
}

function normaliseSkillId(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Planning-layer skill polish only — does not modify imported JSON or KB source files.
 */
export function applyPlanningSkillCorrections(outcome: LearningOutcome): LearningOutcome {
  const topicKey = outcome.topicIds[0]?.toLowerCase() ?? "";
  const text = outcome.description;
  let skillIds = [...outcome.skillIds];
  const removed: string[] = [];

  // Athletics sprint/running outcomes wrongly tagged with shooting
  if (
    topicKey === "athletics" &&
    skillIds.map(normaliseSkillId).includes("shooting") &&
    /\b(sprint|sprinting|running|middle distance|velocity)\b/i.test(text) &&
    !/\bshoot|goal|scor/i.test(text)
  ) {
    skillIds = skillIds.filter((id) => {
      if (normaliseSkillId(id) === "shooting") {
        removed.push(id);
        return false;
      }
      return true;
    });
  }

  // Reinfer from text when skills were stripped or empty
  if (skillIds.length === 0 || removed.length > 0) {
    skillIds = inferSkillIdsFromText(text, skillIds);
  }

  if (removed.length > 0) {
    correctionsLog.push({
      outcomeId: outcome.id,
      removed,
      reason: "Planning-layer correction from outcome text",
    });
  }

  const unique = [...new Set(skillIds.map(normaliseSkillId))];
  if (
    unique.length === outcome.skillIds.length &&
    unique.every((id, index) => id === normaliseSkillId(outcome.skillIds[index] ?? ""))
  ) {
    return outcome;
  }

  return { ...outcome, skillIds: unique };
}
