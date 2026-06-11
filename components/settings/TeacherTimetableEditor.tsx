"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/Input";
import { PATHWAYS, YEAR_GROUP_OPTIONS } from "@/lib/constants";
import { WEEKDAY_LABELS, WEEKDAYS } from "@/lib/timetable/slots";
import { formatSlotTime } from "@/lib/timetable/slots";
import type { PathwayId, TimetableSlot, Weekday, YearGroup } from "@/lib/types";

const EMPTY_SLOT = {
  day: "monday" as Weekday,
  startTime: "08:30",
  endTime: "09:10",
  classGroup: "",
  yearGroup: "year-7" as YearGroup,
  pathway: "" as PathwayId | "",
  location: "",
  notes: "",
};

export function TeacherTimetableEditor() {
  const { data, addTimetableSlot, updateTimetableSlot, deleteTimetableSlot } = useApp();
  const slots = data.timetable ?? [];
  const [form, setForm] = useState(EMPTY_SLOT);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setForm(EMPTY_SLOT);
    setEditingId(null);
  };

  const toSlotPayload = () => ({
    day: form.day,
    startTime: form.startTime,
    endTime: form.endTime,
    classGroup: form.classGroup,
    yearGroup: form.yearGroup,
    pathway: form.pathway || undefined,
    location: form.location || undefined,
    notes: form.notes || undefined,
  });

  const handleSave = () => {
    if (!form.classGroup.trim()) return;
    const payload = toSlotPayload();
    if (editingId) {
      updateTimetableSlot(editingId, payload);
    } else {
      addTimetableSlot(payload);
    }
    resetForm();
  };

  const startEdit = (slot: TimetableSlot) => {
    setEditingId(slot.id);
    setForm({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      classGroup: slot.classGroup,
      yearGroup: slot.yearGroup,
      pathway: slot.pathway ?? "",
      location: slot.location ?? "",
      notes: slot.notes ?? "",
    });
  };

  const grouped = WEEKDAYS.map((day) => ({
    day,
    label: WEEKDAY_LABELS[day],
    slots: slots.filter((s) => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-800">
          {editingId ? "Edit slot" : "Add timetable slot"}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldGroup label="Day">
            <Select
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value as Weekday })}
            >
              {WEEKDAYS.map((day) => (
                <option key={day} value={day}>
                  {WEEKDAY_LABELS[day]}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup label="Class / group">
            <Input
              value={form.classGroup}
              onChange={(e) => setForm({ ...form, classGroup: e.target.value })}
              placeholder="e.g. Form 5"
            />
          </FieldGroup>
          <FieldGroup label="Start time">
            <Input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup label="End time">
            <Input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup label="Year group">
            <Select
              value={form.yearGroup}
              onChange={(e) => setForm({ ...form, yearGroup: e.target.value as YearGroup })}
            >
              {YEAR_GROUP_OPTIONS.map((yg) => (
                <option key={yg.id} value={yg.id}>
                  {yg.label}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup label="Pathway (optional)">
            <Select
              value={form.pathway}
              onChange={(e) =>
                setForm({ ...form, pathway: e.target.value as PathwayId | "" })
              }
            >
              <option value="">Any</option>
              {PATHWAYS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup label="Location (optional)">
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Sports hall"
            />
          </FieldGroup>
        </div>
        <FieldGroup label="Notes (optional)">
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Equipment, co-teacher, etc."
          />
        </FieldGroup>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!form.classGroup.trim()}>
            {editingId ? "Update slot" : "Add slot"}
          </Button>
          {editingId && (
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {slots.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
          No timetable slots yet. Add your weekly PE classes to speed up Calendar Week View
          planning.
        </p>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ day, label, slots: daySlots }) =>
            daySlots.length === 0 ? null : (
              <div key={day}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <div className="space-y-2">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {formatSlotTime(slot.startTime, slot.endTime)} · {slot.classGroup}
                        </p>
                        <p className="text-xs text-slate-500">
                          {YEAR_GROUP_OPTIONS.find((y) => y.id === slot.yearGroup)?.label ??
                            slot.yearGroup}
                          {slot.location ? ` · ${slot.location}` : ""}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" className="text-xs" onClick={() => startEdit(slot)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-xs text-rose-600"
                          onClick={() => deleteTimetableSlot(slot.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
