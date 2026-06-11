export function startOfWeek(date: Date, weekStartsOnMonday = true): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = weekStartsOnMonday
    ? day === 0
      ? -6
      : 1 - day
    : -day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseIso(iso: string): Date {
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(y, m - 1, day);
}

export function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function formatWeekday(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "short" });
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function daysInMonth(date: Date): number {
  return endOfMonth(date).getDate();
}

/** Default Maltese school term window: September → February. */
export function defaultTermRange(reference = new Date()): { start: Date; end: Date } {
  const year =
    reference.getMonth() >= 8 ? reference.getFullYear() : reference.getFullYear() - 1;
  return {
    start: new Date(year, 8, 1),
    end: new Date(year + 1, 1, 28),
  };
}

export function weeksBetween(start: Date, end: Date): Date[] {
  const weeks: Date[] = [];
  let cursor = startOfWeek(start);
  const limit = end.getTime();
  while (cursor.getTime() <= limit) {
    weeks.push(new Date(cursor));
    cursor = addDays(cursor, 7);
  }
  return weeks;
}

export function dayIndexMondayFirst(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}
