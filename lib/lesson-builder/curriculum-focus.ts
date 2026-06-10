import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import {
  appPathwaysFromQuery,
  curriculumPathwayToApp,
  primaryCurriculumPathwayFromApp,
} from "@/lib/lesson-plans/helpers";
import type { TeacherContextSnapshot } from "@/lib/teacher-context";
import type { PathwayId } from "@/lib/types";
import {
  getPlanningOutcomeSuggestions,
  getPlanningSkillOptions as getLessonSkillOptions,
  getPlanningTopicOptions as getLessonTopicOptions,
  getPlanningTopicDisplayName as getTopicDisplayName,
  getPlanningSkillDisplayName as getSkillDisplayName,
  isPlanningSkillValid as isLessonSkillValid,
  isPlanningTopicValid as isLessonTopicValid,
  pruneSelectedOutcomeIds,
  type PlanningOutcomeSuggestions,
} from "@/src/lib/curriculum/planning";

export {
  getLessonSkillOptions,
  getLessonTopicOptions,
  getTopicDisplayName,
  getSkillDisplayName,
  isLessonSkillValid,
  isLessonTopicValid,
  pruneSelectedOutcomeIds,
  type PlanningOutcomeSuggestions,
};

export {
  getPlanningOutcomePathwayBadges,
} from "@/src/lib/curriculum/planning";
export { getMatchingAppPathwaysForOutcome } from "@/src/lib/curriculum/planning/matching";

export function resolveLessonAppPathways(form: LessonBuilderFormData): PathwayId[] {
  if (form.selectedPathways && form.selectedPathways.length > 0) {
    return form.selectedPathways;
  }
  const appPathway = curriculumPathwayToApp(form.pathwayId);
  return appPathway ? [appPathway] : [];
}

export function curriculumPathwayFromForm(form: LessonBuilderFormData): string {
  const appPathways = resolveLessonAppPathways(form);
  return primaryCurriculumPathwayFromApp(appPathways);
}

export function lessonAppPathwaysFromQuery(
  pathway: string | null,
  selectedPathways: string | null
): PathwayId[] {
  return appPathwaysFromQuery(pathway, selectedPathways);
}

export function getLessonOutcomeSuggestions(
  form: LessonBuilderFormData,
  context: TeacherContextSnapshot
): PlanningOutcomeSuggestions {
  const appPathways = resolveLessonAppPathways(form);
  if (!form.topicId || !form.skillId || appPathways.length === 0) {
    return { strict: [], additional: [], allSuggestedIds: new Set() };
  }

  return getPlanningOutcomeSuggestions({
    appPathways,
    yearGroup: form.yearGroup,
    topicId: form.topicId,
    skillId: form.skillId,
    context,
  });
}
