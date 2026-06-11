import type { TimetableSlot, Weekday } from "@/lib/types";

export const WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
};

export function weekdayFromDate(date: Date): Weekday {
  const map: Record<number, Weekday> = {
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
  };
  return map[date.getDay()] ?? "monday";
}

export function slotsForWeekday(
  slots: TimetableSlot[],
  weekday: Weekday
): TimetableSlot[] {
  return [...slots]
    .filter((s) => s.day === weekday)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function formatSlotTime(start: string, end: string): string {
  return `${start}–${end}`;
}
