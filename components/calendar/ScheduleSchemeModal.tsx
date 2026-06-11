"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Select } from "@/components/ui/Input";
import { scheduleSchemeLessons, type ScheduleFrequency } from "@/lib/calendar/scheduling";
import { schemeDisplayTitle } from "@/lib/scheme-builder/helpers";
import type { CalendarEntry, SchemeOfWork } from "@/lib/types";

interface ScheduleSchemeModalProps {
  schemes: SchemeOfWork[];
  initialSchemeId?: string;
  onClose: () => void;
  onSchedule: (entries: Omit<CalendarEntry, "id">[]) => void;
}

const WEEKDAYS = [
  { id: 0, label: "Monday" },
  { id: 1, label: "Tuesday" },
  { id: 2, label: "Wednesday" },
  { id: 3, label: "Thursday" },
  { id: 4, label: "Friday" },
];

export function ScheduleSchemeModal({
  schemes,
  initialSchemeId,
  onClose,
  onSchedule,
}: ScheduleSchemeModalProps) {
  const [schemeId, setSchemeId] = useState(initialSchemeId ?? schemes[0]?.id ?? "");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [frequency, setFrequency] = useState<ScheduleFrequency>("weekly");
  const [lessonCount, setLessonCount] = useState(
    String(schemes[0]?.lessons.length ?? 6)
  );
  const [customDays, setCustomDays] = useState<number[]>([0, 2]);

  const scheme = schemes.find((s) => s.id === schemeId);

  const toggleDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheme) return;
    const entries = scheduleSchemeLessons({
      scheme,
      startDate,
      frequency,
      customWeekdays: customDays.length > 0 ? customDays : [0],
      lessonCount: Math.min(
        Number(lessonCount) || scheme.lessons.length,
        scheme.lessons.length
      ),
    });
    onSchedule(entries);
    onClose();
  };

  if (schemes.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <p className="text-sm text-slate-600">Create a scheme of work first.</p>
          <Button className="mt-4" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Schedule scheme</h2>
        <p className="mt-1 text-sm text-slate-500">
          Distribute scheme lessons across your term calendar.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <FieldGroup label="Scheme">
            <Select
              value={schemeId}
              onChange={(e) => {
                setSchemeId(e.target.value);
                const next = schemes.find((s) => s.id === e.target.value);
                if (next) setLessonCount(String(next.lessons.length));
              }}
            >
              {schemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {schemeDisplayTitle(s)} ({s.lessons.length} lessons)
                </option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup label="Start date">
            <Input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup label="Frequency">
            <Select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as ScheduleFrequency)}
            >
              <option value="weekly">Once per week</option>
              <option value="twice-weekly">Twice per week</option>
              <option value="custom">Custom days</option>
            </Select>
          </FieldGroup>

          {frequency === "custom" && (
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Teaching days</p>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`rounded-lg border px-2.5 py-1 text-xs ${
                      customDays.includes(day.id)
                        ? "border-teal-300 bg-teal-50 text-teal-800"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <FieldGroup label="Lessons to schedule">
            <Input
              type="number"
              min={1}
              max={scheme?.lessons.length ?? 52}
              value={lessonCount}
              onChange={(e) => setLessonCount(e.target.value)}
            />
          </FieldGroup>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Schedule lessons</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
