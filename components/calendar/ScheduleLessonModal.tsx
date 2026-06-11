"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Select } from "@/components/ui/Input";
import { formatSlotTime, slotsForWeekday, weekdayFromDate } from "@/lib/timetable/slots";
import { getYearGroupLabel } from "@/lib/year-groups";
import type { TimetableSlot } from "@/lib/types";

export interface ScheduleLessonResult {
  date: string;
  slot?: TimetableSlot;
  startTime?: string;
  endTime?: string;
}

interface ScheduleLessonModalProps {
  title: string;
  timetable: TimetableSlot[];
  initialDate?: string;
  onClose: () => void;
  onSchedule: (result: ScheduleLessonResult) => void;
}

export function ScheduleLessonModal({
  title,
  timetable,
  initialDate,
  onClose,
  onSchedule,
}: ScheduleLessonModalProps) {
  const [date, setDate] = useState(initialDate ?? new Date().toISOString().slice(0, 10));
  const [slotId, setSlotId] = useState("");
  const [customStart, setCustomStart] = useState("08:30");
  const [customEnd, setCustomEnd] = useState("09:10");
  const [useCustomTime, setUseCustomTime] = useState(false);

  const daySlots = useMemo(() => {
    const weekday = weekdayFromDate(new Date(date));
    return slotsForWeekday(timetable, weekday);
  }, [date, timetable]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slot = daySlots.find((s) => s.id === slotId);
    if (slot && !useCustomTime) {
      onSchedule({ date, slot });
    } else {
      onSchedule({
        date,
        startTime: customStart,
        endTime: customEnd,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-slate-900">Schedule lesson</h2>
        <p className="mt-1 text-sm text-slate-600">{title}</p>

        <div className="mt-4 space-y-3">
          <FieldGroup label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </FieldGroup>

          {daySlots.length > 0 && !useCustomTime ? (
            <FieldGroup label="Timetable slot">
              <Select value={slotId} onChange={(e) => setSlotId(e.target.value)} required>
                <option value="">Choose a slot</option>
                {daySlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {formatSlotTime(slot.startTime, slot.endTime)} · {slot.classGroup} ·{" "}
                    {getYearGroupLabel(slot.yearGroup)}
                  </option>
                ))}
              </Select>
            </FieldGroup>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldGroup label="Start time">
                <Input
                  type="time"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  required
                />
              </FieldGroup>
              <FieldGroup label="End time">
                <Input
                  type="time"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  required
                />
              </FieldGroup>
            </div>
          )}

          {daySlots.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={useCustomTime}
                onChange={(e) => setUseCustomTime(e.target.checked)}
                className="accent-teal-600"
              />
              Use custom time instead of timetable slot
            </label>
          )}

          {timetable.length === 0 && (
            <p className="text-xs text-slate-500">
              Add your timetable in Settings to choose slots quickly.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Schedule</Button>
        </div>
      </form>
    </div>
  );
}
