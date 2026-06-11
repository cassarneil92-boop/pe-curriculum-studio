"use client";

import { useState } from "react";
import { CalendarEntryCard } from "@/components/calendar/CalendarEntryCard";
import { Button } from "@/components/ui/Button";
import { CALENDAR_DRAG_MIME, entryOnDate } from "@/lib/calendar/helpers";
import { addDays, formatShortDate, startOfWeek, toIso } from "@/lib/calendar/dates";
import type { CalendarEntry, LessonDeliveryStatus } from "@/lib/types";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

interface WeekDay {
  label: string;
  date: Date;
  iso: string;
}

interface CalendarWeekViewProps {
  weekStart: Date;
  entries: CalendarEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onWeekChange: (start: Date) => void;
  onDropOnDate: (iso: string, raw: string) => void;
  onDeliveryChange?: (entry: CalendarEntry, status: LessonDeliveryStatus) => void;
}

export function CalendarWeekView({
  weekStart,
  entries,
  selectedId,
  onSelect,
  onWeekChange,
  onDropOnDate,
  onDeliveryChange,
}: CalendarWeekViewProps) {
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);

  const weekDays: WeekDay[] = WEEKDAYS.map((label, i) => {
    const date = addDays(weekStart, i);
    return { label, date, iso: toIso(date) };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">
          Week of {formatShortDate(weekStart)}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => onWeekChange(addDays(weekStart, -7))}>
            ← Prev week
          </Button>
          <Button variant="ghost" onClick={() => onWeekChange(startOfWeek(new Date()))}>
            This week
          </Button>
          <Button variant="ghost" onClick={() => onWeekChange(addDays(weekStart, 7))}>
            Next week →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {weekDays.map((day) => {
          const dayEntries = entries.filter((e) => entryOnDate(e, day.iso));
          const isDragOver = dragOverDay === day.iso;

          return (
            <div
              key={day.iso}
              className="week-day-column flex min-w-0 flex-col"
              data-day={day.iso}
            >
              <div className="week-day-header mb-2 rounded-xl bg-white px-3 py-2 text-center shadow-sm ring-1 ring-slate-200/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {day.label}
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {formatShortDate(day.date)}
                </p>
              </div>

              {/* Timetable slots will attach here in a future release */}
              <div
                className={`week-day-drop-zone flex min-h-[220px] flex-col gap-2 rounded-2xl border-2 border-dashed p-2 transition-colors ${
                  isDragOver
                    ? "border-teal-400 bg-teal-50/80"
                    : "border-slate-200/80 bg-white/60"
                }`}
                data-drop-zone={day.iso}
                onDragEnter={() => setDragOverDay(day.iso)}
                onDragLeave={() => setDragOverDay((prev) => (prev === day.iso ? null : prev))}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverDay(day.iso);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverDay(null);
                  const raw = e.dataTransfer.getData(CALENDAR_DRAG_MIME);
                  if (!raw) return;
                  onDropOnDate(day.iso, raw);
                }}
              >
                {dayEntries.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center px-2 py-6 text-center">
                    <p className="text-xs font-medium text-slate-500">Drop lesson here</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Drag from Lessons to schedule
                    </p>
                  </div>
                ) : (
                  dayEntries.map((entry) => (
                    <div key={entry.id} className="week-day-lesson relative">
                      <CalendarEntryCard
                        entry={entry}
                        active={selectedId === entry.id}
                        onSelect={() => onSelect(entry.id)}
                        showQuickActions
                        onDeliveryChange={
                          onDeliveryChange
                            ? (status) => onDeliveryChange(entry, status)
                            : undefined
                        }
                      />
                      {entry.reflection?.trim() && (
                        <span
                          className="absolute right-2 top-2 text-[10px] text-teal-700"
                          title="Reflection added"
                        >
                          ✎
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
