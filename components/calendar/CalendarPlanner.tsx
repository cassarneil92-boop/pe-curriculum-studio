"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { CalendarEntryCard } from "@/components/calendar/CalendarEntryCard";
import { CalendarEntryDetail } from "@/components/calendar/CalendarEntryDetail";
import { CalendarMonthView } from "@/components/calendar/CalendarMonthView";
import { CalendarTermView } from "@/components/calendar/CalendarTermView";
import { CustomEntryModal } from "@/components/calendar/CustomEntryModal";
import { LessonsToSchedulePanel } from "@/components/calendar/LessonsToSchedulePanel";
import { ScheduleSchemeModal } from "@/components/calendar/ScheduleSchemeModal";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  CALENDAR_DRAG_MIME,
  createCalendarEntryFromLesson,
  createCalendarEntryFromSchemeLesson,
  decodeCalendarDrag,
  entryOnDate,
} from "@/lib/calendar/helpers";
import { syncLinkedDeliveryStatus } from "@/lib/calendar/delivery-sync";
import {
  addDays,
  formatShortDate,
  startOfMonth,
  startOfWeek,
  toIso,
} from "@/lib/calendar/dates";
import type { CalendarEntry, LessonDeliveryStatus } from "@/lib/types";

export type CalendarViewMode = "term" | "month" | "week" | "agenda";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

interface CalendarPlannerProps {
  showCustomEntry: boolean;
  onCloseCustomEntry: () => void;
  showScheduleScheme: boolean;
  onCloseScheduleScheme: () => void;
  onOpenScheduleScheme: () => void;
  onOpenCustomEntry: () => void;
}

export function CalendarPlanner({
  showCustomEntry,
  onCloseCustomEntry,
  showScheduleScheme,
  onCloseScheduleScheme,
  onOpenScheduleScheme,
  onOpenCustomEntry,
}: CalendarPlannerProps) {
  const {
    data,
    addCalendarEntry,
    updateCalendarEntry,
    deleteCalendarEntry,
    updateLesson,
    updateScheme,
  } = useApp();

  const [viewMode, setViewMode] = useState<CalendarViewMode>("term");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));
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
        data.calendar
          .filter((e) => e.linkedLessonId && e.startDate)
          .map((e) => e.linkedLessonId!)
      ),
    [data.calendar]
  );

  const scheduledSchemeLessons = useMemo(
    () =>
      new Set(
        data.calendar
          .filter((e) => e.linkedSchemeId && e.linkedSchemeLessonNumber && e.startDate)
          .map((e) => `${e.linkedSchemeId}:${e.linkedSchemeLessonNumber}`)
      ),
    [data.calendar]
  );

  const sortedEntries = [...data.calendar]
    .filter((e) => e.startDate)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const applyDeliverySync = (entry: CalendarEntry, status: LessonDeliveryStatus) => {
    const { lessonUpdates, schemeUpdates } = syncLinkedDeliveryStatus(
      entry,
      status,
      data.lessons,
      data.schemes
    );
    for (const { id, patch } of lessonUpdates) updateLesson(id, patch);
    for (const { id, patch } of schemeUpdates) updateScheme(id, patch);
    updateCalendarEntry(entry.id, { deliveryStatus: status });
  };

  const handleDropOnDate = (iso: string, raw: string) => {
    const payload = decodeCalendarDrag(raw);
    if (!payload) return;

    if (payload.type === "calendar-entry" || payload.type === "custom-entry") {
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

  const handleScheduleScheme = (entries: Omit<CalendarEntry, "id">[]) => {
    for (const entry of entries) {
      addCalendarEntry(entry);
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["term", "month", "week", "agenda"] as CalendarViewMode[]).map((mode) => (
          <Button
            key={mode}
            variant={viewMode === mode ? "primary" : "secondary"}
            onClick={() => setViewMode(mode)}
            className="capitalize"
          >
            {mode}
          </Button>
        ))}
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="secondary" className="text-xs" onClick={onOpenScheduleScheme}>
            Schedule scheme
          </Button>
          <Button variant="secondary" className="text-xs" onClick={onOpenCustomEntry}>
            Add custom entry
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          {viewMode === "term" && (
            <CalendarTermView
              schemes={data.schemes}
              calendar={data.calendar}
              onSelectBlock={(schemeId) => {
                const entry = data.calendar.find((e) => e.linkedSchemeId === schemeId);
                if (entry) setSelectedId(entry.id);
              }}
            />
          )}

          {viewMode === "month" && (
            <CalendarMonthView
              month={monthDate}
              entries={data.calendar}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDropOnDate={handleDropOnDate}
              onPrevMonth={() =>
                setMonthDate(
                  new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1)
                )
              }
              onNextMonth={() =>
                setMonthDate(
                  new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1)
                )
              }
              onToday={() => setMonthDate(startOfMonth(new Date()))}
            />
          )}

          {viewMode === "week" && (
            <>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" onClick={() => setWeekStart(addDays(weekStart, -7))}>
                  ← Prev week
                </Button>
                <Button variant="ghost" onClick={() => setWeekStart(startOfWeek(new Date()))}>
                  This week
                </Button>
                <Button variant="ghost" onClick={() => setWeekStart(addDays(weekStart, 7))}>
                  Next week →
                </Button>
              </div>
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
                          {formatShortDate(day.date)}
                        </p>
                      </div>
                      <div
                        className="flex min-h-[200px] flex-col gap-2 rounded-2xl border border-dashed border-slate-200/80 bg-white/60 p-2"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={onDayDrop(day.iso)}
                      >
                        {dayEntries.length === 0 ? (
                          <p className="px-2 py-8 text-center text-xs text-slate-400">
                            Drop a lesson here
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
            </>
          )}

          {viewMode === "agenda" && (
            <div className="space-y-2">
              {sortedEntries.length === 0 ? (
                <Card className="text-center">
                  <p className="text-sm text-slate-500">No scheduled lessons yet.</p>
                </Card>
              ) : (
                sortedEntries.map((entry) => (
                  <CalendarEntryCard
                    key={entry.id}
                    entry={entry}
                    active={selectedId === entry.id}
                    onSelect={() => setSelectedId(entry.id)}
                    draggable={false}
                  />
                ))
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader
              title="Lessons to schedule"
              description="Drag onto the calendar to plan your term"
            />
            <LessonsToSchedulePanel
              lessons={data.lessons}
              schemes={data.schemes}
              calendar={data.calendar}
              scheduledLessonIds={scheduledLessonIds}
              scheduledSchemeLessons={scheduledSchemeLessons}
            />
          </Card>

          {selected ? (
            <CalendarEntryDetail
              entry={selected}
              onUpdate={(patch) => {
                if (patch.deliveryStatus) {
                  applyDeliverySync({ ...selected, ...patch }, patch.deliveryStatus);
                } else {
                  updateCalendarEntry(selected.id, patch);
                }
              }}
              onDelete={() => {
                deleteCalendarEntry(selected.id);
                setSelectedId(null);
              }}
            />
          ) : (
            <Card className="border-dashed bg-slate-50/50">
              <p className="text-sm text-slate-500">
                Select a scheduled lesson to mark delivered, add reflection, or open the
                linked lesson or scheme.
              </p>
            </Card>
          )}
        </aside>
      </div>

      {showCustomEntry && (
        <CustomEntryModal
          onClose={onCloseCustomEntry}
          onSave={(entry) => addCalendarEntry(entry)}
        />
      )}

      {showScheduleScheme && (
        <ScheduleSchemeModal
          schemes={data.schemes}
          onClose={onCloseScheduleScheme}
          onSchedule={handleScheduleScheme}
        />
      )}
    </>
  );
}
