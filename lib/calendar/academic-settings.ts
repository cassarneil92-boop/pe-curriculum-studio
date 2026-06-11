import type {
  AcademicCalendarSettings,
  AcademicTerm,
  PlanningTerm,
  TermDateRange,
} from "@/lib/types";

/** Malta-oriented defaults: academic year September → June, three terms. */
export function defaultAcademicCalendarSettings(
  reference = new Date()
): AcademicCalendarSettings {
  const year =
    reference.getMonth() >= 8 ? reference.getFullYear() : reference.getFullYear() - 1;

  return {
    academicYearStart: `${year}-09-01`,
    academicYearEnd: `${year + 1}-06-30`,
    terms: [
      {
        id: "term-1",
        name: "Term 1",
        startDate: `${year}-09-01`,
        endDate: `${year}-12-20`,
        order: 1,
      },
      {
        id: "term-2",
        name: "Term 2",
        startDate: `${year + 1}-01-08`,
        endDate: `${year + 1}-03-31`,
        order: 2,
      },
      {
        id: "term-3",
        name: "Term 3",
        startDate: `${year + 1}-04-01`,
        endDate: `${year + 1}-06-30`,
        order: 3,
      },
    ],
  };
}

function legacyTermRange(
  settings: Partial<AcademicCalendarSettings>,
  key: "term1" | "term2" | "term3",
  fallback: TermDateRange
): TermDateRange {
  const legacy = settings[key];
  return {
    start: legacy?.start ?? fallback.start,
    end: legacy?.end ?? fallback.end,
  };
}

/** Merge planningTerms names with academicCalendar dates into unified terms[]. */
export function migrateAcademicCalendarSettings(
  settings?: Partial<AcademicCalendarSettings> | null,
  legacyPlanningTerms?: PlanningTerm[] | null
): AcademicCalendarSettings {
  const defaults = defaultAcademicCalendarSettings();

  if (settings?.terms && settings.terms.length > 0) {
    return {
      academicYearStart: settings.academicYearStart ?? defaults.academicYearStart,
      academicYearEnd: settings.academicYearEnd ?? defaults.academicYearEnd,
      terms: [...settings.terms]
        .sort((a, b) => a.order - b.order)
        .map((t, i) => ({
          id: t.id || `term-${i + 1}`,
          name: t.name || `Term ${i + 1}`,
          startDate: t.startDate,
          endDate: t.endDate,
          order: t.order ?? i + 1,
        })),
    };
  }

  const t1 = legacyTermRange(settings ?? {}, "term1", {
    start: defaults.terms[0].startDate,
    end: defaults.terms[0].endDate,
  });
  const t2 = legacyTermRange(settings ?? {}, "term2", {
    start: defaults.terms[1].startDate,
    end: defaults.terms[1].endDate,
  });
  const t3 = legacyTermRange(settings ?? {}, "term3", {
    start: defaults.terms[2].startDate,
    end: defaults.terms[2].endDate,
  });

  const legacyRanges = [t1, t2, t3];
  const planning = legacyPlanningTerms?.length ? legacyPlanningTerms : null;

  type LegacyPlanningTerm = PlanningTerm & { start?: string; end?: string };

  const terms: AcademicTerm[] = (planning ?? defaults.terms).map((source, index) => {
    const fromPlanning = planning ? (source as LegacyPlanningTerm) : null;
    const fromDefault = !planning ? (source as AcademicTerm) : null;
    const range = legacyRanges[index] ?? legacyRanges[legacyRanges.length - 1];

    return {
      id: fromPlanning?.id ?? fromDefault?.id ?? `term-${index + 1}`,
      name: fromPlanning?.name ?? fromDefault?.name ?? `Term ${index + 1}`,
      startDate:
        fromPlanning?.startDate ??
        fromPlanning?.start ??
        fromDefault?.startDate ??
        range.start,
      endDate:
        fromPlanning?.endDate ??
        fromPlanning?.end ??
        fromDefault?.endDate ??
        range.end,
      order: index + 1,
    };
  });

  if (planning && planning.length > 3) {
    for (let i = 3; i < planning.length; i++) {
      const extra = planning[i] as LegacyPlanningTerm;
      terms.push({
        id: extra.id,
        name: extra.name,
        startDate: extra.startDate ?? extra.start ?? "",
        endDate: extra.endDate ?? extra.end ?? "",
        order: i + 1,
      });
    }
  }

  return {
    academicYearStart: settings?.academicYearStart ?? defaults.academicYearStart,
    academicYearEnd: settings?.academicYearEnd ?? defaults.academicYearEnd,
    terms,
  };
}

export function getAcademicTerms(settings?: AcademicCalendarSettings | null): AcademicTerm[] {
  return migrateAcademicCalendarSettings(settings).terms;
}

export function academicYearRange(settings: AcademicCalendarSettings): {
  start: Date;
  end: Date;
} {
  const [sy, sm, sd] = settings.academicYearStart.split("-").map(Number);
  const [ey, em, ed] = settings.academicYearEnd.split("-").map(Number);
  return {
    start: new Date(sy, sm - 1, sd),
    end: new Date(ey, em - 1, ed),
  };
}

export function createAcademicTerm(terms: AcademicTerm[]): AcademicTerm {
  const order = terms.length + 1;
  const last = terms[terms.length - 1];
  const startDate = last?.endDate ?? new Date().toISOString().slice(0, 10);
  return {
    id: `term-${Date.now()}-${order}`,
    name: `Term ${order}`,
    startDate,
    endDate: startDate,
    order,
  };
}

export function renameTermInSchemes<T extends { term: string }>(
  items: T[],
  oldName: string,
  newName: string
): T[] {
  return items.map((item) =>
    item.term === oldName ? { ...item, term: newName } : item
  );
}
