import {
  getAcademicTerms,
  migrateAcademicCalendarSettings,
} from "@/lib/calendar/academic-settings";
import type { AcademicCalendarSettings, AcademicTerm, SchemeOfWork } from "@/lib/types";
import { getTopicName } from "@/lib/scheme-builder/helpers";
import { buildSchemeProgressSummary } from "@/lib/progress/summary";

/** @deprecated Use AcademicTerm — alias for backward compatibility */
export type PlanningTerm = AcademicTerm;

export function getPlanningTerms(
  academicCalendar?: AcademicCalendarSettings | null
): AcademicTerm[] {
  return getAcademicTerms(academicCalendar);
}

export function migratePlanningTerms(
  _legacy?: AcademicTerm[] | null,
  academic?: AcademicCalendarSettings | null
): AcademicTerm[] {
  return migrateAcademicCalendarSettings(academic).terms;
}

export interface TermSchemeSummary {
  scheme: SchemeOfWork;
  lessonsPlanned: number;
  outcomesPlanned: number;
  lessonsDelivered: number;
  outcomesTaught: number;
}

export interface PlanningTermOverview {
  term: AcademicTerm;
  topics: string[];
  schemes: TermSchemeSummary[];
  totalLessonsPlanned: number;
  totalOutcomesPlanned: number;
}

export function buildPlanningTermOverview(
  term: AcademicTerm,
  schemes: SchemeOfWork[]
): PlanningTermOverview {
  const termSchemes = schemes.filter((s) => s.term === term.name);
  const topics = new Set<string>();
  const summaries: TermSchemeSummary[] = [];

  for (const scheme of termSchemes) {
    const topic = scheme.topicId ? getTopicName(scheme.topicId) : scheme.title;
    if (topic) topics.add(topic);

    const progress = buildSchemeProgressSummary(scheme);
    summaries.push({
      scheme,
      lessonsPlanned: progress.totalLessons,
      outcomesPlanned: progress.plannedOutcomes,
      lessonsDelivered: progress.deliveredLessons,
      outcomesTaught: progress.taughtOutcomes,
    });
  }

  return {
    term,
    topics: [...topics].sort(),
    schemes: summaries,
    totalLessonsPlanned: summaries.reduce((n, s) => n + s.lessonsPlanned, 0),
    totalOutcomesPlanned: summaries.reduce((n, s) => n + s.outcomesPlanned, 0),
  };
}

export function fallbackTermName(terms: AcademicTerm[]): string {
  return terms[0]?.name ?? "Term 1";
}
