"use client";

import { useState } from "react";
import { CalendarEntryCard } from "@/components/calendar/CalendarEntryCard";
import { CALENDAR_DRAG_MIME } from "@/lib/calendar/helpers";
import { entryOnDate } from "@/lib/calendar/helpers";
import {
  addDays,
  formatMonthYear,
  startOfMonth,
  startOfWeek,
  toIso,
} from "@/lib/calendar/dates";
import type { CalendarEntry } from "@/lib/types";

interface CalendarMonthViewProps {
  month: Date;
  entries: CalendarEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDropOnDate: (iso: string, raw: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarMonthView({
  month,
  entries,
  selectedId,
  onSelect,
  onDropOnDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarMonthViewProps) {
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const monthStart = startOfMonth(month);
  const gridStart = startOfWeek(monthStart);
  const totalCells = 42;
  const cells = Array.from({ length: totalCells }, (_, i) => addDays(gridStart, i));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-semibold text-slate-900">{formatMonthYear(month)}</p>
        <div className="flex gap-2">
          <button type="button" className="text-sm text-teal-700" onClick={onPrevMonth}>
            ← Prev
          </button>
          <button type="button" className="text-sm text-teal-700" onClick={onToday}>
            This month
          </button>
          <button type="button" className="text-sm text-teal-700" onClick={onNextMonth}>
            Next →
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="px-2 py-2">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((date) => {
            const iso = toIso(date);
            const inMonth = date.getMonth() === month.getMonth();
            const dayEntries = entries.filter((e) => entryOnDate(e, iso));

            const isDragOver = dragOverDay === iso;

            return (
              <div
                key={iso}
                className={`min-h-[100px] border-b border-r border-slate-100 p-1.5 transition-colors ${
                  isDragOver
                    ? "bg-teal-50 ring-1 ring-inset ring-teal-300"
                    : inMonth
                      ? "bg-white"
                      : "bg-slate-50/60"
                }`}
                onDragEnter={() => setDragOverDay(iso)}
                onDragLeave={() => setDragOverDay((prev) => (prev === iso ? null : prev))}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverDay(iso);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverDay(null);
                  const raw = e.dataTransfer.getData(CALENDAR_DRAG_MIME);
                  if (raw) onDropOnDate(iso, raw);
                }}
              >
                <p
                  className={`mb-1 text-xs font-medium ${
                    inMonth ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {date.getDate()}
                </p>
                <div className="space-y-1">
                  {dayEntries.slice(0, 3).map((entry) => (
                    <CalendarEntryCard
                      key={entry.id}
                      entry={entry}
                      active={selectedId === entry.id}
                      onSelect={() => onSelect(entry.id)}
                    />
                  ))}
                  {dayEntries.length > 3 && (
                    <p className="text-[10px] text-slate-500">+{dayEntries.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
