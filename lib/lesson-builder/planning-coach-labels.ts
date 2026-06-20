/** Professional vocabulary for curriculum-first planning coach UI. */
export const PLANNING_COACH = {
  learningDesignTitle: "Learning Design Coach",
  activitiesTitle: "Activity Planning Coach",
  endingTitle: "Lesson Ending Coach",
  structureTitle: "Lesson Structure Advisor",
  memoryTitle: "Unit Progression Insight",
  coachingTitle: "Curriculum Coaching",

  emptyOutcomes: "Select curriculum outcomes first to unlock learning design guidance.",
  guidanceHint:
    "Tap a card to add to your plan — wording is adapted from your selected outcomes, not official syllabus text.",
  refreshGuidance: "Refresh curriculum guidance",
  applyAllGuidance: "Apply all guidance",
  dismissGuidance: "Dismiss guidance panel",
  awaitingGuidance: 'Tap "Refresh curriculum guidance" to review recommended planning points.',

  addAllLearningIntentions: "Add all learning intentions",
  addAllWalt: "Add all WALT",
  addAllWilf: "Add all WILF",
  addAllAssessment: "Add all assessment checks",
  addAllSafety: "Add all safety notes",

  contextChanged: "Your topic, skill, or outcomes changed — refresh guidance when ready.",

  addActivity: "Add activity",
  addBlock: "Add block",
  applySequence: "Apply recommended sequence",
  refreshActivities: "Refresh activity guidance",

  addEnding: "Add to lesson ending",
  applyAllEndings: "Apply all ending guidance",
  refreshEndings: "Refresh ending guidance",

  advisoryOnly: "Advisory only — never blocks saving.",
} as const;

export type SuggestionBadge = "CURRICULUM" | "SKILL" | "ASSESSMENT" | "SAFETY";

export const BADGE_STYLES: Record<
  SuggestionBadge,
  { bg: string; text: string; border: string }
> = {
  CURRICULUM: {
    bg: "bg-teal-50",
    text: "text-teal-800",
    border: "border-teal-200",
  },
  SKILL: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  ASSESSMENT: {
    bg: "bg-violet-50",
    text: "text-violet-800",
    border: "border-violet-200",
  },
  SAFETY: {
    bg: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-200",
  },
};
