"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarEntryCard } from "@/components/calendar/CalendarEntryCard";
import { Button } from "@/components/ui/Button";
import { CALENDAR_DRAG_MIME, entryOnDate } from "@/lib/calendar/helpers";
import { addDays, formatShortDate, startOfWeek, toIso } from "@/lib/calendar/dates";
import {
  formatSlotTime,
  slotsForWeekday,
  weekdayFromDate,
  WEEKDAY_LABELS,
} from "@/lib/timetable/slots";
import type { CalendarEntry, LessonDeliveryStatus, TimetableSlot } from "@/lib/types";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

interface WeekDay {
  label: string;
  date: Date;
  iso: string;
  weekday: keyof typeof WEEKDAY_LABELS;
}

interface CalendarWeekViewProps {
  weekStart: Date;
  entries: CalendarEntry[];
  timetable?: TimetableSlot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onWeekChange: (start: Date) => void;
  onDropOnDate: (iso: string, raw: string, slot?: TimetableSlot) => void;
  onDeliveryChange?: (entry: CalendarEntry, status: LessonDeliveryStatus) => void;
}

export function CalendarWeekView({
  weekStart,
  entries,
  timetable = [],
  selectedId,
  onSelect,
  onWeekChange,
  onDropOnDate,
  onDeliveryChange,
}: CalendarWeekViewProps) {
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const hasTimetable = timetable.length > 0;

  const weekDays: WeekDay[] = WEEKDAYS.map((label, i) => {
    const date = addDays(weekStart, i);
    const weekday = weekdayFromDate(date);
    return { label, date, iso: toIso(date), weekday };
  });

  const handleDrop = (key: string, iso: string, raw: string, slot?: TimetableSlot) => {
    setDragOverKey(null);
    const payload = raw;
    if (!payload) return;
    onDropOnDate(iso, payload, slot);
  };

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

      {!hasTimetable && (
        <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/40 px-4 py-3 text-sm text-slate-600">
          Add your timetable in{" "}
          <Link href="/settings" className="font-medium text-teal-700 hover:text-teal-800">
            Settings
          </Link>{" "}
          to make weekly planning faster.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {weekDays.map((day) => {
          const daySlots = slotsForWeekday(timetable, day.weekday);
          const dayEntries = entries.filter((e) => entryOnDate(e, day.iso));

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

              <div className="flex min-h-[220px] flex-col gap-2">
                {daySlots.length > 0 ? (
                  daySlots.map((slot) => {
                    const slotKey = `${day.iso}:${slot.id}`;
                    const slotEntries = dayEntries.filter(
                      (e) =>
                        e.startTime === slot.startTime &&
                        e.endTime === slot.endTime &&
                        e.classGroup === slot.classGroup
                    );
                    const isDragOver = dragOverKey === slotKey;

                    return (
                      <div
                        key={slot.id}
                        className={`week-slot-drop-zone rounded-xl border-2 border-dashed p-2 transition-colors ${
                          isDragOver
                            ? "border-teal-400 bg-teal-50/80"
                            : "border-slate-200/80 bg-white/80"
                        }`}
                        onDragEnter={() => setDragOverKey(slotKey)}
                        onDragLeave={() =>
                          setDragOverKey((prev) => (prev === slotKey ? null : prev))
                        }
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverKey(slotKey);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const raw = e.dataTransfer.getData(CALENDAR_DRAG_MIME);
                          handleDrop(slotKey, day.iso, raw, slot);
                        }}
                      >
                        <div className="mb-1.5 rounded-lg bg-slate-50 px-2 py-1">
                          <p className="text-[10px] font-semibold text-slate-700">
                            {formatSlotTime(slot.startTime, slot.endTime)}
                          </p>
                          <p className="text-[10px] text-slate-500">{slot.classGroup}</p>
                        </div>
                        {slotEntries.length === 0 ? (
                          <p className="px-1 py-2 text-center text-[10px] text-slate-400">
                            Drop lesson here
                          </p>
                        ) : (
                          slotEntries.map((entry) => (
                            <div key={entry.id} className="week-day-lesson relative mb-1">
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
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })
                ) : (
                  <DayDropZone
                    iso={day.iso}
                    isDragOver={dragOverKey === day.iso}
                    onDragEnter={() => setDragOverKey(day.iso)}
                    onDragLeave={() =>
                      setDragOverKey((prev) => (prev === day.iso ? null : prev))
                    }
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverKey(day.iso);
                    }}
                    onDrop={(raw) => handleDrop(day.iso, day.iso, raw)}
                    entries={dayEntries}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    onDeliveryChange={onDeliveryChange}
                  />
                )}

                {daySlots.length > 0 &&
                  dayEntries
                    .filter(
                      (e) =>
                        !daySlots.some(
                          (s) =>
                            e.startTime === s.startTime &&
                            e.endTime === s.endTime &&
                            e.classGroup === s.classGroup
                        )
                    )
                    .map((entry) => (
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
                      </div>
                    ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayDropZone({
  iso,
  isDragOver,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  entries,
  selectedId,
  onSelect,
  onDeliveryChange,
}: {
  iso: string;
  isDragOver: boolean;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (raw: string) => void;
  entries: CalendarEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDeliveryChange?: (entry: CalendarEntry, status: LessonDeliveryStatus) => void;
}) {
  return (
    <div
      className={`week-day-drop-zone flex min-h-[220px] flex-col gap-2 rounded-2xl border-2 border-dashed p-2 transition-colors ${
        isDragOver ? "border-teal-400 bg-teal-50/80" : "border-slate-200/80 bg-white/60"
      }`}
      data-drop-zone={iso}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={(e) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData(CALENDAR_DRAG_MIME);
        onDrop(raw);
      }}
    >
      {entries.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-2 py-6 text-center">
          <p className="text-xs font-medium text-slate-500">Drop lesson here</p>
          <p className="mt-1 text-[10px] text-slate-400">Drag from Lessons to schedule</p>
        </div>
      ) : (
        entries.map((entry) => (
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
  );
}
