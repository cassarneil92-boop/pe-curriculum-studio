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
