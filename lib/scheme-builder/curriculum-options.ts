/**
 * Backwards-compatible re-exports — all planning surfaces should use
 * src/lib/curriculum/planning as the single source of truth.
 */
export {
  getPlanningOutcomes,
  filterPlanningOutcomes,
  getPlanningTopicOptions as getSchemeTopicOptions,
  getPlanningSkillOptions as getSchemeSkillOptions,
  getPlanningTopicDisplayName as getTopicDisplayName,
  getPlanningSkillDisplayName as getSkillDisplayName,
  getPlanningOutcomePathwayBadges,
  isPlanningTopicValid as isSchemeTopicValid,
  isPlanningSkillValid as isSchemeSkillValid,
  resolvePlanningAppPathways as resolveSchemeAppPathways,
  getPlanningOutcomeSuggestions,
  pruneSelectedOutcomeIds,
  type PlanningTopicOption as SchemeTopicOption,
  type PlanningSkillOption as SchemeSkillOption,
  type PlanningOutcomeSuggestions,
} from "@/src/lib/curriculum/planning";

export {
  getCurriculumPathwaysForAppPathways,
  getMatchingAppPathwaysForOutcome,
} from "@/src/lib/curriculum/planning/matching";
