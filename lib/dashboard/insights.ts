import { buildSchemeProgressSummary } from "@/lib/progress/summary";
import { buildTeachingWarnings } from "@/lib/progress/warnings";
import type { CalendarEntry, LessonPlan, SchemeOfWork } from "@/lib/types";
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
