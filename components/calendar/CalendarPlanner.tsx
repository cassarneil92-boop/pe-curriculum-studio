"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { CalendarEntryCard } from "@/components/calendar/CalendarEntryCard";
import { CalendarEntryDetail } from "@/components/calendar/CalendarEntryDetail";
import { CalendarUnscheduledPool } from "@/components/calendar/CalendarUnscheduledPool";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CALENDAR_DRAG_MIME,
  createCalendarEntryFromLesson,
  createCalendarEntryFromSchemeLesson,
  decodeCalendarDrag,
  entryOnDate,
} from "@/lib/calendar/helpers";
import type { CalendarEntry } from "@/lib/types";

type ViewMode = "day" | "week" | "month" | "agenda";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDayLabel(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export function CalendarPlanner() {
  const { data, addCalendarEntry, updateCalendarEntry, deleteCalendarEntry } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [dayDate, setDayDate] = useState(() => new Date());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const weekDays = useMemo(
    () =>
      WEEKDAYS.map((label, i) => ({
        label,
        date: addDays(weekStart, i),
        iso: toIso(addDays(weekStart, i)),
      })),
    [weekStart]
  );

  const selected = data.calendar.find((e) => e.id === selectedId) ?? null;

  const scheduledLessonIds = useMemo(
    () =>
      new Set(
        data.calendar.map((e) => e.linkedLessonId).filter((id): id is string => Boolean(id))
      ),
    [data.calendar]
  );

  const scheduledSchemeLessons = useMemo(
    () =>
      new Set(
        data.calendar
          .filter((e) => e.linkedSchemeId && e.linkedSchemeLessonNumber)
          .map((e) => `${e.linkedSchemeId}:${e.linkedSchemeLessonNumber}`)
      ),
    [data.calendar]
  );

  const sortedEntries = [...data.calendar].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  const handleDropOnDate = (iso: string, raw: string) => {
    const payload = decodeCalendarDrag(raw);
    if (!payload) return;

    if (payload.type === "calendar-entry") {
      updateCalendarEntry(payload.entryId, { startDate: iso, endDate: iso });
      setSelectedId(payload.entryId);
      return;
    }

    if (payload.type === "lesson") {
      const lesson = data.lessons.find((l) => l.id === payload.lessonId);
      if (!lesson) return;
      const entry = addCalendarEntry(createCalendarEntryFromLesson(lesson, iso));
      setSelectedId(entry.id);
      return;
    }

    if (payload.type === "scheme-lesson") {
      const scheme = data.schemes.find((s) => s.id === payload.schemeId);
      if (!scheme) return;
      const draft = createCalendarEntryFromSchemeLesson(
        scheme,
        payload.lessonNumber,
        iso
      );
      if (!draft) return;
      const entry = addCalendarEntry(draft);
      setSelectedId(entry.id);
    }
  };

  const onDayDrop = (iso: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData(CALENDAR_DRAG_MIME);
    if (raw) handleDropOnDate(iso, raw);
  };

  const dayIso = toIso(dayDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {(["day", "week", "month", "agenda"] as ViewMode[]).map((mode) => (
          <Button
            key={mode}
            variant={viewMode === mode ? "primary" : "secondary"}
            onClick={() => setViewMode(mode)}
            className="capitalize"
          >
            {mode}
          </Button>
        ))}

        {viewMode === "week" && (
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setWeekStart(addDays(weekStart, -7))}>
              ← Prev
            </Button>
            <Button variant="ghost" onClick={() => setWeekStart(startOfWeek(new Date()))}>
              This week
            </Button>
            <Button variant="ghost" onClick={() => setWeekStart(addDays(weekStart, 7))}>
              Next →
            </Button>
          </div>
        )}

        {viewMode === "day" && (
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setDayDate(addDays(dayDate, -1))}>
              ← Prev
            </Button>
            <Button variant="ghost" onClick={() => setDayDate(new Date())}>
              Today
            </Button>
            <Button variant="ghost" onClick={() => setDayDate(addDays(dayDate, 1))}>
              Next →
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-4">
          {data.calendar.length === 0 && viewMode !== "week" ? (
            <EmptyState
              title="Your calendar is empty"
              description="Drag a lesson plan or scheme lesson from the pool on the right onto a day."
              icon="📅"
            />
          ) : (
            <>
              {viewMode === "day" && (
                <Card>
                  <CardHeader
                    title={formatDayLabel(dayDate)}
                    description="Drop lessons here to schedule"
                  />
                  <div
                    className="min-h-[280px] space-y-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-3"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDayDrop(dayIso)}
                  >
                    {data.calendar
                      .filter((e) => entryOnDate(e, dayIso))
                      .map((entry) => (
                        <CalendarEntryCard
                          key={entry.id}
                          entry={entry}
                          active={selectedId === entry.id}
                          onSelect={() => setSelectedId(entry.id)}
                        />
                      ))}
                    {data.calendar.filter((e) => entryOnDate(e, dayIso)).length === 0 && (
                      <p className="py-10 text-center text-sm text-slate-400">
                        Drop a lesson here
                      </p>
                    )}
                  </div>
                </Card>
              )}

              {viewMode === "week" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {weekDays.map((day) => {
                    const dayEntries = data.calendar.filter((e) => entryOnDate(e, day.iso));
                    return (
                      <div key={day.iso} className="flex min-w-0 flex-col">
                        <div className="mb-2 rounded-xl bg-white px-3 py-2 text-center shadow-sm ring-1 ring-slate-200/60">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {day.label}
                          </p>
                          <p className="text-sm font-medium text-slate-800">
                            {formatDayLabel(day.date)}
                          </p>
                        </div>
                        <div
                          className="flex min-h-[180px] flex-col gap-2 rounded-2xl border border-dashed border-slate-200/80 bg-white/60 p-2"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={onDayDrop(day.iso)}
                        >
                          {dayEntries.length === 0 ? (
                            <p className="px-2 py-6 text-center text-xs text-slate-400">
                              Drop here
                            </p>
                          ) : (
                            dayEntries.map((entry) => (
                              <CalendarEntryCard
                                key={entry.id}
                                entry={entry}
                                active={selectedId === entry.id}
                                onSelect={() => setSelectedId(entry.id)}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {viewMode === "month" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {sortedEntries.map((entry) => (
                    <CalendarEntryCard
                      key={entry.id}
                      entry={entry}
                      active={selectedId === entry.id}
                      onSelect={() => setSelectedId(entry.id)}
                      draggable={false}
                    />
                  ))}
                </div>
              )}

              {viewMode === "agenda" && (
                <div className="space-y-2">
                  {sortedEntries.map((entry) => (
                    <CalendarEntryCard
                      key={entry.id}
                      entry={entry}
                      active={selectedId === entry.id}
                      onSelect={() => setSelectedId(entry.id)}
                      draggable={false}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader
              title="Unscheduled"
              description="Drag onto a day to schedule"
            />
            <CalendarUnscheduledPool
              lessons={data.lessons}
              schemes={data.schemes}
              scheduledLessonIds={scheduledLessonIds}
              scheduledSchemeLessons={scheduledSchemeLessons}
            />
          </Card>

          {selected ? (
            <CalendarEntryDetail
              entry={selected}
              onUpdate={(patch) => updateCalendarEntry(selected.id, patch)}
              onDelete={() => {
                deleteCalendarEntry(selected.id);
                setSelectedId(null);
              }}
            />
          ) : (
            <Card className="border-dashed bg-slate-50/50">
              <p className="text-sm text-slate-500">
                Select a calendar entry to mark delivered, add reflection, or open the linked
                lesson.
              </p>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
