import type { SOWLesson } from "@/lib/types";

/** Effective skill for a scheme lesson — custom lesson skill or scheme default. */
export function resolveLessonSkillId(
  lesson: Pick<SOWLesson, "skillId">,
  schemeDefaultSkillId: string
): string {
  const custom = lesson.skillId?.trim();
  if (custom) return custom;
  return schemeDefaultSkillId.trim();
}

export function isCustomLessonSkill(lesson: Pick<SOWLesson, "skillId">): boolean {
  return Boolean(lesson.skillId?.trim());
}

export function pruneLessonOutcomesForSkill(
  lesson: SOWLesson,
  visibleOutcomeIds: Set<string>
): SOWLesson {
  return {
    ...lesson,
    learningOutcomeIds: lesson.learningOutcomeIds.filter((id) => visibleOutcomeIds.has(id)),
  };
}

export function pruneAllLessonsOutcomes(
  lessons: SOWLesson[],
  schemeDefaultSkillId: string,
  getVisibleOutcomeIds: (skillId: string) => Set<string>
): SOWLesson[] {
  return lessons.map((lesson) => {
    const skillId = resolveLessonSkillId(lesson, schemeDefaultSkillId);
    if (!skillId) {
      return { ...lesson, learningOutcomeIds: [] };
    }
    return pruneLessonOutcomesForSkill(lesson, getVisibleOutcomeIds(skillId));
  });
}

/** Advisory / coaching skill filter — topic-wide when lessons use mixed skills. */
export function resolveSchemeAdvisorySkillId(
  lessons: SOWLesson[],
  schemeDefaultSkillId: string
): string {
  const skills = new Set(
    lessons
      .map((lesson) => resolveLessonSkillId(lesson, schemeDefaultSkillId))
      .filter(Boolean)
  );
  if (skills.size === 1) return [...skills][0];
  return schemeDefaultSkillId.trim() || "";
}
