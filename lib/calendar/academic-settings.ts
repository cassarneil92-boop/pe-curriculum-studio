import type { AcademicCalendarSettings } from "@/lib/types";

/** Malta-oriented defaults: academic year September → June, three terms. */
export function defaultAcademicCalendarSettings(
  reference = new Date()
): AcademicCalendarSettings {
  const year =
    reference.getMonth() >= 8 ? reference.getFullYear() : reference.getFullYear() - 1;

  return {
    academicYearStart: `${year}-09-01`,
    academicYearEnd: `${year + 1}-06-30`,
    term1: { start: `${year}-09-01`, end: `${year}-12-20` },
    term2: { start: `${year + 1}-01-08`, end: `${year + 1}-03-31` },
    term3: { start: `${year + 1}-04-01`, end: `${year + 1}-06-30` },
  };
}

export function migrateAcademicCalendarSettings(
  settings?: Partial<AcademicCalendarSettings> | null
): AcademicCalendarSettings {
  const defaults = defaultAcademicCalendarSettings();
  if (!settings) return defaults;

  return {
    academicYearStart: settings.academicYearStart ?? defaults.academicYearStart,
    academicYearEnd: settings.academicYearEnd ?? defaults.academicYearEnd,
    term1: {
      start: settings.term1?.start ?? defaults.term1.start,
      end: settings.term1?.end ?? defaults.term1.end,
    },
    term2: {
      start: settings.term2?.start ?? defaults.term2.start,
      end: settings.term2?.end ?? defaults.term2.end,
    },
    term3: {
      start: settings.term3?.start ?? defaults.term3.start,
      end: settings.term3?.end ?? defaults.term3.end,
    },
  };
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
