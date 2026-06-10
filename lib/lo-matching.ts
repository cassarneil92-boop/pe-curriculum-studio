import type { LearningOutcome, LOFilterContext } from "./types";
import { LEARNING_OUTCOMES } from "./curriculum/learning-outcomes";
import { yearGroupMatchesFilter } from "./year-groups";

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Strict matching for auto-suggestions.
 * All selected filters must align — e.g. Handball + Passing will never
 * surface Football kicking outcomes.
 */
export function strictMatchLOs(context: LOFilterContext): LearningOutcome[] {
  const sport = normalise(context.sport);
  const skills = context.skills.map(normalise).filter(Boolean);

  return LEARNING_OUTCOMES.filter((lo) => {
    if (lo.pathway !== context.pathway) return false;
    if (!yearGroupMatchesFilter(lo.yearGroups, context.yearGroup)) return false;

    if (sport && sport !== "general") {
      const loSport = normalise(lo.sport);
      if (loSport !== sport && loSport !== "general") return false;
    }

    if (skills.length > 0) {
      const loSkills = lo.skills.map(normalise);
      const hasSkillOverlap = skills.some((skill) => loSkills.includes(skill));
      if (!hasSkillOverlap) return false;
    }

    return true;
  });
}

/**
 * Broad matching for manual search — text query across fields,
 * with optional pathway/year filters but no strict sport-skill coupling.
 */
export function broadSearchLOs(
  query: string,
  filters?: Partial<LOFilterContext>
): LearningOutcome[] {
  const q = normalise(query);

  return LEARNING_OUTCOMES.filter((lo) => {
    if (filters?.pathway && lo.pathway !== filters.pathway) return false;
    if (filters?.yearGroup && !yearGroupMatchesFilter(lo.yearGroups, filters.yearGroup)) {
      return false;
    }

    if (!q) return true;

    const haystack = [
      lo.code,
      lo.description,
      lo.sport,
      lo.strand,
      ...lo.skills,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function validateLOAlignment(
  loIds: string[],
  context: LOFilterContext
): { valid: boolean; mismatched: LearningOutcome[] } {
  const strict = new Set(strictMatchLOs(context).map((lo) => lo.id));
  const selected = loIds
    .map((id) => LEARNING_OUTCOMES.find((lo) => lo.id === id))
    .filter((lo): lo is LearningOutcome => Boolean(lo));

  const mismatched = selected.filter((lo) => !strict.has(lo.id));
  return { valid: mismatched.length === 0, mismatched };
}
