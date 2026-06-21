import type { CalendarEntry, LessonPlan, SchemeOfWork } from "@/lib/types";
import { buildSchemeProgressSummary } from "@/lib/progress/summary";
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

export interface RecentDeliveryItem {
  id: string;
  title: string;
  date: string;
  source: "lesson" | "scheme" | "calendar";
}

export interface AttentionItem {
  id: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface TeachingProgressTeacherView {
  overview: TeachingProgressOverview;
  activeSchemes: ActiveSchemeProgress[];
  recentDelivery: RecentDeliveryItem[];
  attentionItems: AttentionItem[];
  continueSchemeHref: string | null;
}

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

function buildRecentDelivery(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[],
  limit = 6
): RecentDeliveryItem[] {
  const items: RecentDeliveryItem[] = [];

  for (const lesson of lessons) {
    if (lesson.deliveryStatus !== "delivered") continue;
    items.push({
      id: `lesson-${lesson.id}`,
      title: lesson.title || lesson.topicId,
      date: lesson.deliveredDate ?? lesson.date ?? "",
      source: "lesson",
    });
  }

  for (const scheme of schemes) {
    for (const lesson of scheme.lessons ?? []) {
      if (lesson.deliveryStatus !== "delivered") continue;
      items.push({
        id: `scheme-${scheme.id}-${lesson.lessonNumber}`,
        title: `${schemeDisplayTitle(scheme)} — Lesson ${lesson.lessonNumber}`,
        date: lesson.deliveredDate ?? "",
        source: "scheme",
      });
    }
  }

  for (const entry of calendar) {
    if (entry.deliveryStatus !== "delivered") continue;
    items.push({
      id: `cal-${entry.id}`,
      title: entry.title,
      date: entry.startDate,
      source: "calendar",
    });
  }

  return items
    .filter((i) => i.date)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

function daysSince(dateStr: string, today: string): number {
  const a = new Date(dateStr);
  const b = new Date(today);
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function buildAttentionItems(
  schemes: SchemeOfWork[],
  lessons: LessonPlan[],
  calendar: CalendarEntry[],
  today: string
): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const scheme of schemes) {
    if (deriveSchemeStatus(scheme) !== "in_progress") continue;
    const summary = buildSchemeProgressSummary(scheme);
    const lastUpdate = scheme.updatedAt ?? scheme.createdAt;
    if (lastUpdate && daysSince(lastUpdate.slice(0, 10), today) >= 21) {
      items.push({
        id: `att-stale-${scheme.id}`,
        message: `${schemeDisplayTitle(scheme)} has not been updated for 3 weeks.`,
        actionLabel: "Open",
        actionHref: `/schemes?edit=${scheme.id}`,
      });
    }
    if (summary.remainingLessons > 0 && summary.remainingLessons <= 2) {
      items.push({
        id: `att-ending-${scheme.id}`,
        message: `${schemeDisplayTitle(scheme)} is ending soon.`,
        actionLabel: "Open",
        actionHref: `/schemes?edit=${scheme.id}`,
      });
    }
  }

  const overdueCalendar = calendar.filter(
    (e) =>
      e.startDate &&
      e.startDate < today &&
      (!e.deliveryStatus || e.deliveryStatus === "planned")
  );
  if (overdueCalendar.length > 0) {
    items.push({
      id: "att-overdue",
      message: "Lesson planned but not delivered.",
      actionLabel: "Calendar",
      actionHref: "/calendar",
    });
  }

  const plannedNotDelivered = lessons.filter(
    (l) => l.date && l.date < today && l.deliveryStatus !== "delivered"
  );
  if (plannedNotDelivered.length > 0 && !items.some((i) => i.id === "att-overdue")) {
    items.push({
      id: "att-lesson-planned",
      message: "Lesson planned but not delivered.",
      actionLabel: "Open Lessons",
      actionHref: "/lessons",
    });
  }

  return items.slice(0, 5);
}

export function buildTeachingProgressTeacherView(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[],
  _taught: unknown,
  today: string
): TeachingProgressTeacherView {
  const overview = buildOverview(lessons, schemes);
  const activeSchemes = buildActiveSchemes(schemes);
  const recentDelivery = buildRecentDelivery(lessons, schemes, calendar);
  const attentionItems = buildAttentionItems(schemes, lessons, calendar, today);
  const continueSchemeHref = activeSchemes[0]?.continueHref ?? null;

  return {
    overview,
    activeSchemes,
    recentDelivery,
    attentionItems,
    continueSchemeHref,
  };
}
