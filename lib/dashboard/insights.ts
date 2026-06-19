import { buildSchemeProgressSummary, buildSchemesDashboardSummary } from "@/lib/progress/summary";
import { buildTeachingWarnings } from "@/lib/progress/warnings";
import type { AppData, CalendarEntry, LessonPlan, ResourceItem, SchemeOfWork } from "@/lib/types";
import { buildTermUnitBlocks, currentUnitBlock } from "@/lib/calendar/pacing";

export interface DashboardWeekStats {
  scheduled: number;
  delivered: number;
  skipped: number;
  moved: number;
  reflectionsPending: number;
}

export interface DashboardCurrentUnit {
  title: string;
  deliveredLessons: number;
  totalLessons: number;
  taughtOutcomes: number;
  plannedOutcomes: number;
}

export function buildDashboardWeekStats(
  calendar: CalendarEntry[],
  weekStart: string,
  weekEnd: string
): DashboardWeekStats {
  const weekEntries = calendar.filter(
    (e) => e.startDate && e.startDate >= weekStart && e.startDate <= weekEnd
  );

  return {
    scheduled: weekEntries.length,
    delivered: weekEntries.filter((e) => e.deliveryStatus === "delivered").length,
    skipped: weekEntries.filter((e) => e.deliveryStatus === "skipped").length,
    moved: weekEntries.filter((e) => e.deliveryStatus === "moved").length,
    reflectionsPending: weekEntries.filter(
      (e) => e.deliveryStatus === "delivered" && !e.reflection?.trim()
    ).length,
  };
}

export function buildDashboardCurrentUnit(
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[],
  today: string
): DashboardCurrentUnit | null {
  const blocks = buildTermUnitBlocks(schemes, calendar);
  const current = currentUnitBlock(blocks, today);
  if (!current) return null;

  const scheme = schemes.find((s) => s.id === current.schemeId);
  if (!scheme) {
    return {
      title: current.title,
      deliveredLessons: current.deliveredLessons,
      totalLessons: current.totalLessons,
      taughtOutcomes: 0,
      plannedOutcomes: 0,
    };
  }

  const progress = buildSchemeProgressSummary(scheme);
  return {
    title: current.title,
    deliveredLessons: progress.deliveredLessons,
    totalLessons: progress.totalLessons,
    taughtOutcomes: progress.taughtOutcomes,
    plannedOutcomes: progress.plannedOutcomes,
  };
}

export function buildDashboardAttention(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[]
) {
  return buildTeachingWarnings(lessons, schemes, calendar).slice(0, 5);
}

export interface UpcomingLesson {
  id: string;
  title: string;
  date: string;
  time: string;
  classGroup: string;
}

export function buildUpcomingLessons(
  calendar: CalendarEntry[],
  today: string,
  limit = 5
): UpcomingLesson[] {
  return calendar
    .filter((e) => e.startDate && e.startDate >= today)
    .sort((a, b) => {
      const dateCmp = a.startDate.localeCompare(b.startDate);
      if (dateCmp !== 0) return dateCmp;
      return (a.startTime ?? "").localeCompare(b.startTime ?? "");
    })
    .slice(0, limit)
    .map((e) => ({
      id: e.id,
      title: e.title,
      date: e.startDate,
      time: e.startTime ? `${e.startTime}${e.endTime ? `–${e.endTime}` : ""}` : "All day",
      classGroup: e.classGroup ?? "",
    }));
}

export function buildTodaysLessons(
  calendar: CalendarEntry[],
  today: string
): UpcomingLesson[] {
  return calendar
    .filter((e) => e.startDate === today)
    .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""))
    .map((e) => ({
      id: e.id,
      title: e.title,
      date: e.startDate,
      time: e.startTime ? `${e.startTime}${e.endTime ? `–${e.endTime}` : ""}` : "All day",
      classGroup: e.classGroup ?? "",
    }));
}

export interface DashboardCurrentScheme {
  schemeId: string;
  title: string;
  completedLessons: number;
  totalLessons: number;
}

export function buildDashboardCurrentScheme(
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[],
  today: string
): DashboardCurrentScheme | null {
  const unit = buildDashboardCurrentUnit(schemes, calendar, today);
  if (!unit) return null;

  const blocks = buildTermUnitBlocks(schemes, calendar);
  const current = currentUnitBlock(blocks, today);
  if (!current) return null;

  return {
    schemeId: current.schemeId,
    title: unit.title,
    completedLessons: unit.deliveredLessons,
    totalLessons: unit.totalLessons,
  };
}

export interface TeachingSnapshot {
  lessonsPlanned: number;
  lessonsDelivered: number;
  schemesActive: number;
  curriculumCoverage: number;
}

export function buildTeachingSnapshot(data: Pick<AppData, "lessons" | "schemes" | "calendar">): TeachingSnapshot {
  const schemeSummary = buildSchemesDashboardSummary(data.schemes);
  const calendarPlanned = data.calendar.filter(
    (e) => !e.deliveryStatus || e.deliveryStatus === "planned" || e.deliveryStatus === "moved"
  ).length;
  const calendarDelivered = data.calendar.filter((e) => e.deliveryStatus === "delivered").length;
  const schemesActive = data.schemes.filter(
    (s) => s.status === "in_progress" || (s.lessons?.length ?? 0) > 0
  ).length;

  return {
    lessonsPlanned: Math.max(calendarPlanned, data.lessons.length),
    lessonsDelivered: Math.max(calendarDelivered, schemeSummary.lessonsDelivered),
    schemesActive,
    curriculumCoverage: schemeSummary.averageCoveragePercent,
  };
}

export type QuickContinueKind = "lesson" | "scheme" | "resource";

export interface QuickContinueItem {
  kind: QuickContinueKind;
  id: string;
  title: string;
  href: string;
  updatedAt: string;
  subtitle: string;
}

function latestTimestamp(iso?: string): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

export function buildQuickContinue(
  data: Pick<AppData, "lessons" | "schemes" | "resources">
): QuickContinueItem | null {
  const candidates: QuickContinueItem[] = [];

  for (const lesson of data.lessons) {
    candidates.push({
      kind: "lesson",
      id: lesson.id,
      title: lesson.title || "Untitled lesson",
      href: `/lesson-builder?edit=${lesson.id}`,
      updatedAt: lesson.updatedAt,
      subtitle: "Lesson plan",
    });
  }

  for (const scheme of data.schemes) {
    candidates.push({
      kind: "scheme",
      id: scheme.id,
      title: scheme.title || "Untitled scheme",
      href: "/schemes",
      updatedAt: scheme.updatedAt,
      subtitle: "Scheme of work",
    });
  }

  for (const resource of data.resources) {
    candidates.push({
      kind: "resource",
      id: resource.id,
      title: resource.title ?? resource.name,
      href: "/resources",
      updatedAt: resource.createdAt,
      subtitle: "Teaching resource",
    });
  }

  if (candidates.length === 0) return null;

  return candidates.sort((a, b) => latestTimestamp(b.updatedAt) - latestTimestamp(a.updatedAt))[0];
}

export interface SchemeAttentionItem {
  schemeId: string;
  title: string;
  message: string;
}

export function buildSchemesNeedingAttention(schemes: SchemeOfWork[]): SchemeAttentionItem[] {
  const items: SchemeAttentionItem[] = [];

  for (const scheme of schemes) {
    const progress = buildSchemeProgressSummary(scheme);
    if (progress.totalLessons === 0) {
      items.push({
        schemeId: scheme.id,
        title: scheme.title,
        message: "No lessons added yet — continue building your scheme.",
      });
      continue;
    }

    const lessonPct =
      progress.totalLessons > 0
        ? Math.round((progress.deliveredLessons / progress.totalLessons) * 100)
        : 0;

    if (progress.remainingLessons > 0 && lessonPct < 40) {
      items.push({
        schemeId: scheme.id,
        title: scheme.title,
        message: `${progress.remainingLessons} lessons remaining — delivery is behind schedule.`,
      });
    } else if (progress.plannedOutcomes > 0 && progress.taughtOutcomes < progress.plannedOutcomes * 0.5) {
      items.push({
        schemeId: scheme.id,
        title: scheme.title,
        message: "Several planned outcomes have not been taught yet.",
      });
    }
  }

  return items.slice(0, 3);
}

export function countUnplannedOutcomeWarnings(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[]
): number {
  return buildTeachingWarnings(lessons, schemes, calendar).filter((w) =>
    w.message.toLowerCase().includes("not planned")
  ).length;
}
