import type {
  AcademicCalendarSettings,
  PlanningTerm,
  SchemeOfWork,
} from "@/lib/types";
import { getTopicName } from "@/lib/scheme-builder/helpers";
import { buildSchemeProgressSummary } from "@/lib/progress/summary";

const DEFAULT_TERM_NAMES = ["Term 1", "Term 2", "Term 3"] as const;

export function defaultPlanningTerms(
  academic?: AcademicCalendarSettings | null
): PlanningTerm[] {
  if (academic) {
    return [
      { id: "term-1", name: "Term 1", start: academic.term1.start, end: academic.term1.end },
      { id: "term-2", name: "Term 2", start: academic.term2.start, end: academic.term2.end },
      { id: "term-3", name: "Term 3", start: academic.term3.start, end: academic.term3.end },
    ];
  }

  const year = new Date().getFullYear();
  return [
    { id: "term-1", name: "Term 1", start: `${year}-09-01`, end: `${year}-12-20` },
    { id: "term-2", name: "Term 2", start: `${year + 1}-01-08`, end: `${year + 1}-03-31` },
    { id: "term-3", name: "Term 3", start: `${year + 1}-04-01`, end: `${year + 1}-06-30` },
  ];
}

export function migratePlanningTerms(
  terms: PlanningTerm[] | undefined,
  academic?: AcademicCalendarSettings | null
): PlanningTerm[] {
  if (terms && terms.length > 0) return terms;
  return defaultPlanningTerms(academic);
}

export interface TermSchemeSummary {
  scheme: SchemeOfWork;
  lessonsPlanned: number;
  outcomesPlanned: number;
  lessonsDelivered: number;
  outcomesTaught: number;
}

export interface PlanningTermOverview {
  term: PlanningTerm;
  topics: string[];
  schemes: TermSchemeSummary[];
  totalLessonsPlanned: number;
  totalOutcomesPlanned: number;
}

export function buildPlanningTermOverview(
  term: PlanningTerm,
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

export function createPlanningTerm(terms: PlanningTerm[]): PlanningTerm {
  const index = terms.length + 1;
  const last = terms[terms.length - 1];
  const start = last?.end ?? new Date().toISOString().slice(0, 10);
  return {
    id: `term-${Date.now()}-${index}`,
    name: `Term ${index}`,
    start,
    end: start,
  };
}

export function renamePlanningTermInSchemes(
  schemes: SchemeOfWork[],
  oldName: string,
  newName: string
): SchemeOfWork[] {
  return schemes.map((scheme) =>
    scheme.term === oldName ? { ...scheme, term: newName } : scheme
  );
}

export function fallbackTermName(terms: PlanningTerm[]): string {
  return terms[0]?.name ?? DEFAULT_TERM_NAMES[0];
}
