import type { CalendarEntry, LessonPlan, SchemeOfWork } from "@/lib/types";
import { buildUpcomingLessons, type UpcomingLesson } from "@/lib/dashboard/insights";
import { buildSchemeProgressSummary } from "@/lib/progress/summary";
import type { CurriculumAnalyticsReport } from "@/src/lib/intelligence/analytics/coverage-analytics";
import {
  getLearningAreaForTopic,
  type LearningAreaId,
} from "@/src/lib/intelligence/frameworks/learning-areas";
import { lessonHasContent, schemeDisplayTitle } from "@/lib/scheme-builder/helpers";
import { deriveSchemeStatus } from "@/lib/progress/delivery";

export interface TeachingProgressOverview {
  lessonsPlanned: number;
  lessonsDelivered: number;
  activeSchemes: number;
  deliveryPercent: number;
}

export interface ActiveSchemeProgress {
  schemeId: string;
  title: string;
  completedLessons: number;
  totalLessons: number;
  remainingLessons: number;
  deliveryPercent: number;
  continueHref: string;
}

export interface CurriculumAreaBar {
  label: string;
  barLength: number;
}

export interface MissingCurriculumArea {
  id: LearningAreaId;
  label: string;
}

export interface TeachingProgressQuickAction {
  id: string;
  label: string;
  href: string;
}

export interface TeachingProgressTeacherView {
  overview: TeachingProgressOverview;
  activeSchemes: ActiveSchemeProgress[];
  upcomingLessons: UpcomingLesson[];
  areasCovered: CurriculumAreaBar[];
  areasMissing: MissingCurriculumArea[];
  quickActions: TeachingProgressQuickAction[];
  continueSchemeHref: string | null;
}

const TEACHER_FOCUS_AREAS: { id: LearningAreaId; label: string }[] = [
  { id: "team-games", label: "Team Games" },
  { id: "individual-activity", label: "Athletics" },
  { id: "fitness", label: "Fitness" },
  { id: "healthy-lifestyle", label: "Healthy Lifestyle" },
  { id: "sport-values", label: "Sport Values" },
  { id: "outdoor-recreation", label: "Outdoor & Recreation" },
];

function countLessonDelivery(lessons: LessonPlan[], schemes: SchemeOfWork[]) {
  let planned = 0;
  let delivered = 0;

  for (const lesson of lessons) {
    planned += 1;
    if (lesson.deliveryStatus === "delivered") delivered += 1;
  }

  for (const scheme of schemes) {
    for (const lesson of scheme.lessons ?? []) {
      if (!lessonHasContent(lesson) && lesson.deliveryStatus !== "delivered") continue;
      planned += 1;
      if (lesson.deliveryStatus === "delivered") delivered += 1;
    }
  }

  return { planned, delivered };
}

function countAreaActivity(
  areaId: LearningAreaId,
  lessons: LessonPlan[],
  schemes: SchemeOfWork[]
): { planned: number; delivered: number } {
  let planned = 0;
  let delivered = 0;

  for (const lesson of lessons) {
    if (getLearningAreaForTopic(lesson.topicId) !== areaId) continue;
    planned += 1;
    if (lesson.deliveryStatus === "delivered") delivered += 1;
  }

  for (const scheme of schemes) {
    if (getLearningAreaForTopic(scheme.topicId) !== areaId) continue;
    for (const lesson of scheme.lessons ?? []) {
      if (!lessonHasContent(lesson) && lesson.deliveryStatus !== "delivered") continue;
      planned += 1;
      if (lesson.deliveryStatus === "delivered") delivered += 1;
    }
  }

  return { planned, delivered };
}

function buildOverview(lessons: LessonPlan[], schemes: SchemeOfWork[]): TeachingProgressOverview {
  const { planned, delivered } = countLessonDelivery(lessons, schemes);
  const activeSchemes = schemes.filter((scheme) => {
    const status = deriveSchemeStatus(scheme);
    return status === "in_progress";
  }).length;

  const deliveryPercent =
    planned > 0 ? Math.round((delivered / planned) * 100) : 0;

  return {
    lessonsPlanned: planned,
    lessonsDelivered: delivered,
    activeSchemes,
    deliveryPercent,
  };
}

function buildActiveSchemes(schemes: SchemeOfWork[]): ActiveSchemeProgress[] {
  return schemes
    .filter((scheme) => deriveSchemeStatus(scheme) === "in_progress")
    .map((scheme) => {
      const summary = buildSchemeProgressSummary(scheme);
      const deliveryPercent =
        summary.totalLessons > 0
          ? Math.round((summary.deliveredLessons / summary.totalLessons) * 100)
          : 0;

      return {
        schemeId: scheme.id,
        title: schemeDisplayTitle(scheme),
        completedLessons: summary.deliveredLessons,
        totalLessons: summary.totalLessons,
        remainingLessons: summary.remainingLessons,
        deliveryPercent,
        continueHref: `/schemes?edit=${scheme.id}`,
      };
    })
    .sort((a, b) => b.deliveryPercent - a.deliveryPercent);
}

function buildAreaBars(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  taught: CurriculumAnalyticsReport
): CurriculumAreaBar[] {
  const scores = TEACHER_FOCUS_AREAS.map((area) => {
    const activity = countAreaActivity(area.id, lessons, schemes);
    const deliveredOutcomes =
      taught.byLearningArea.find((s) => s.id === area.id)?.modeCount ?? 0;
    const score = activity.planned + activity.delivered * 2 + deliveredOutcomes * 0.5;
    return { label: area.label, score };
  });

  const holisticDelivered = taught.byHolisticDevelopment.reduce(
    (n, slice) => n + (slice.modeCount ?? 0),
    0
  );
  scores.push({
    label: "Holistic Development",
    score: holisticDelivered,
  });

  const maxScore = Math.max(...scores.map((s) => s.score), 1);

  return scores.map(({ label, score }) => ({
    label,
    barLength: score === 0 ? 0 : Math.max(1, Math.round((score / maxScore) * 10)),
  }));
}

function buildMissingAreas(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[]
): MissingCurriculumArea[] {
  return TEACHER_FOCUS_AREAS.filter((area) => {
    const activity = countAreaActivity(area.id, lessons, schemes);
    return activity.planned === 0 && activity.delivered === 0;
  });
}

function buildQuickActions(continueSchemeHref: string | null): TeachingProgressQuickAction[] {
  const actions: TeachingProgressQuickAction[] = [
    { id: "qa-lesson", label: "Create Lesson", href: "/lesson-builder" },
    { id: "qa-scheme", label: "Create Scheme", href: "/schemes?create=1" },
  ];

  if (continueSchemeHref) {
    actions.push({
      id: "qa-continue",
      label: "Continue Current Scheme",
      href: continueSchemeHref,
    });
  }

  return actions;
}

export function buildTeachingProgressTeacherView(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[],
  taught: CurriculumAnalyticsReport,
  today: string
): TeachingProgressTeacherView {
  const overview = buildOverview(lessons, schemes);
  const activeSchemes = buildActiveSchemes(schemes);
  const upcomingLessons = buildUpcomingLessons(calendar, today, 5);
  const areasCovered = buildAreaBars(lessons, schemes, taught);
  const areasMissing = buildMissingAreas(lessons, schemes);
  const continueSchemeHref = activeSchemes[0]?.continueHref ?? null;

  return {
    overview,
    activeSchemes,
    upcomingLessons,
    areasCovered,
    areasMissing,
    quickActions: buildQuickActions(continueSchemeHref),
    continueSchemeHref,
  };
}
