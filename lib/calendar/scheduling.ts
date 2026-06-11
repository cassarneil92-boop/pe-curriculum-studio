import type { CalendarEntry, SchemeOfWork } from "@/lib/types";
import { addDays, parseIso, toIso } from "./dates";
import { createCalendarEntryFromSchemeLesson } from "./helpers";

export type ScheduleFrequency = "weekly" | "twice-weekly" | "custom";

export interface ScheduleSchemeOptions {
  scheme: SchemeOfWork;
  startDate: string;
  frequency: ScheduleFrequency;
  /** 0=Mon … 4=Fri when frequency is custom */
  customWeekdays?: number[];
  lessonCount?: number;
}

function nextCustomDate(
  start: Date,
  lessonIndex: number,
  weekdays: number[]
): Date {
  const sorted = [...weekdays].sort((a, b) => a - b);
  const week = Math.floor(lessonIndex / sorted.length);
  const daySlot = lessonIndex % sorted.length;
  const weekStart = addDays(start, week * 7);
  const monday = new Date(weekStart);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  return addDays(monday, sorted[daySlot]);
}

export function scheduleSchemeLessons(
  options: ScheduleSchemeOptions
): Omit<CalendarEntry, "id">[] {
  const { scheme, startDate, frequency, customWeekdays = [0, 2] } = options;
  const count = options.lessonCount ?? scheme.lessons.length;
  const lessons = scheme.lessons.slice(0, count);
  const start = parseIso(startDate);
  const entries: Omit<CalendarEntry, "id">[] = [];

  lessons.forEach((lesson, index) => {
    let date: Date;
    if (frequency === "weekly") {
      date = addDays(start, index * 7);
    } else if (frequency === "twice-weekly") {
      const week = Math.floor(index / 2);
      const slot = index % 2;
      date = addDays(start, week * 7 + slot * 3);
    } else {
      date = nextCustomDate(start, index, customWeekdays);
    }

    const iso = toIso(date);
    const entry = createCalendarEntryFromSchemeLesson(scheme, lesson.lessonNumber, iso);
    if (entry) entries.push(entry);
  });

  return entries;
}
