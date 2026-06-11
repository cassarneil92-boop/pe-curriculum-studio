"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { CalendarEntryCard } from "@/components/calendar/CalendarEntryCard";
import { CalendarEntryDetail } from "@/components/calendar/CalendarEntryDetail";
import { CalendarMonthView } from "@/components/calendar/CalendarMonthView";
import { CalendarPlanningTermsView } from "@/components/calendar/CalendarPlanningTermsView";
import { CalendarWeekView } from "@/components/calendar/CalendarWeekView";
import { CustomEntryModal } from "@/components/calendar/CustomEntryModal";
import { LessonsToSchedulePanel } from "@/components/calendar/LessonsToSchedulePanel";
import { ScheduleSchemeModal } from "@/components/calendar/ScheduleSchemeModal";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  createCalendarEntryFromLesson,
  createCalendarEntryFromSchemeLesson,
  decodeCalendarDrag,
} from "@/lib/calendar/helpers";
import { useDeliverySync } from "@/hooks/useDeliverySync";
import { startOfMonth, startOfWeek } from "@/lib/calendar/dates";
import { migratePlanningTerms } from "@/lib/planning/terms";
import type { CalendarEntry } from "@/lib/types";

interface ScheduleSchemePrefill {
  schemeId: string;
}

export type CalendarViewMode = "week" | "month" | "terms" | "agenda";

const VIEW_MODES: { id: CalendarViewMode; label: string }[] = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "terms", label: "Terms" },
  { id: "agenda", label: "Agenda" },
];

interface CalendarPlannerProps {
  showCustomEntry: boolean;
  onCloseCustomEntry: () => void;
  showScheduleScheme: boolean;
  onCloseScheduleScheme: () => void;
  onOpenScheduleScheme: (prefill?: ScheduleSchemePrefill) => void;
  onOpenCustomEntry: () => void;
  scheduleSchemePrefill?: string;
}

export function CalendarPlanner({
  showCustomEntry,
  onCloseCustomEntry,
  showScheduleScheme,
  onCloseScheduleScheme,
  onOpenScheduleScheme,
  onOpenCustomEntry,
  scheduleSchemePrefill,
}: CalendarPlannerProps) {
  const router = useRouter();
  const {
    data,
    addCalendarEntry,
    updateCalendarEntry,
    deleteCalendarEntry,
    updateScheme,
    updatePlanningTerm,
    addPlanningTerm,
    removePlanningTerm,
  } = useApp();
  const { setCalendarDelivery } = useDeliverySync();

  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const planningTerms = useMemo(
    () => migratePlanningTerms(data.planningTerms, data.academicCalendar),
    [data.planningTerms, data.academicCalendar]
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

  const handleScheduleScheme = (entries: Omit<CalendarEntry, "id">[]) => {
    for (const entry of entries) {
      addCalendarEntry(entry);
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {VIEW_MODES.map(({ id, label }) => (
          <Button
            key={id}
            variant={viewMode === id ? "primary" : "secondary"}
            onClick={() => setViewMode(id)}
          >
            {label}
          </Button>
        ))}
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            variant="secondary"
            className="text-xs"
            onClick={() => onOpenScheduleScheme()}
          >
            Schedule scheme
          </Button>
          <Button variant="secondary" className="text-xs" onClick={onOpenCustomEntry}>
            Add custom entry
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          {viewMode === "week" && (
            <CalendarWeekView
              weekStart={weekStart}
              entries={data.calendar}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onWeekChange={setWeekStart}
              onDropOnDate={handleDropOnDate}
              onDeliveryChange={(entry, status) => setCalendarDelivery(entry, status)}
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

          {viewMode === "terms" && (
            <CalendarPlanningTermsView
              terms={planningTerms}
              schemes={data.schemes}
              onUpdateTerm={updatePlanningTerm}
              onAddTerm={addPlanningTerm}
              onRemoveTerm={removePlanningTerm}
              onMoveScheme={(schemeId, termName) =>
                updateScheme(schemeId, { term: termName })
              }
              onOpenScheme={() => router.push("/schemes")}
            />
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
              description="Drag onto Week or Month to plan your teaching"
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
              onDeliveryChange={(status) => setCalendarDelivery(selected, status)}
              onUpdate={(patch) => updateCalendarEntry(selected.id, patch)}
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
          initialSchemeId={scheduleSchemePrefill}
          onClose={onCloseScheduleScheme}
          onSchedule={handleScheduleScheme}
        />
      )}
    </>
  );
}
