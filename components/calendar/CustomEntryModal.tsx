"use client";

import { useState } from "react";
import { LOSelector } from "@/components/shared/LOSelector";
import { YearGroupSelect } from "@/components/shared/YearGroupSelect";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/Input";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { DEFAULT_YEAR_GROUP_ID, PATHWAYS, PLANNING_LEVELS } from "@/lib/constants";
import { isAppPathwayVisible } from "@/lib/teacher-context";
import type { CalendarEntry, PathwayId, PlanningLevel, YearGroup } from "@/lib/types";

interface CustomEntryModalProps {
  initial?: Partial<CalendarEntry>;
  onClose: () => void;
  onSave: (entry: Omit<CalendarEntry, "id">) => void;
  saveToPool?: boolean;
}

export function CustomEntryModal({
  initial,
  onClose,
  onSave,
  saveToPool = false,
}: CustomEntryModalProps) {
  const { context } = useTeacherContext();
  const visiblePathways = PATHWAYS.filter((p) => isAppPathwayVisible(p.id, context));

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    level: (initial?.level ?? "daily") as PlanningLevel,
    pathway: (initial?.pathway ?? "general-pe") as PathwayId,
    yearGroup: (initial?.yearGroup ?? DEFAULT_YEAR_GROUP_ID) as YearGroup,
    sport: initial?.sport ?? "",
    skills: initial?.skills ?? ([] as string[]),
    startDate: initial?.startDate ?? "",
    classGroup: initial?.classGroup ?? "",
    notes: initial?.notes ?? "",
    loIds: initial?.loIds ?? ([] as string[]),
    addToPool: saveToPool,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: form.title,
      level: form.level,
      pathway: form.pathway,
      yearGroup: form.yearGroup,
      sport: form.sport,
      skills: form.skills,
      startDate: form.addToPool ? "" : form.startDate || new Date().toISOString().slice(0, 10),
      endDate: form.addToPool ? "" : form.startDate || new Date().toISOString().slice(0, 10),
      classGroup: form.classGroup,
      topicId: initial?.topicId ?? "",
      notes: form.notes,
      loIds: form.loIds,
      deliveryStatus: "planned",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Custom calendar entry</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add a one-off lesson or event. Save to the schedule pool to drag onto a day later.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <FieldGroup label="Title">
            <Input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Athletics — sprint technique"
            />
          </FieldGroup>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="Date (optional if saving to pool)">
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                disabled={form.addToPool}
              />
            </FieldGroup>
            <FieldGroup label="Class / group">
              <Input
                value={form.classGroup}
                onChange={(e) => setForm({ ...form, classGroup: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup label="Pathway">
              <Select
                value={form.pathway}
                onChange={(e) =>
                  setForm({ ...form, pathway: e.target.value as PathwayId })
                }
              >
                {visiblePathways.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="Year group">
              <YearGroupSelect
                pathwayId={form.pathway}
                value={form.yearGroup}
                onChange={(e) =>
                  setForm({ ...form, yearGroup: e.target.value as YearGroup })
                }
              />
            </FieldGroup>
          </div>

          <FieldGroup label="Notes">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </FieldGroup>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.addToPool}
              onChange={(e) => setForm({ ...form, addToPool: e.target.checked })}
              className="accent-teal-600"
            />
            Save to Lessons to schedule (drag onto calendar later)
          </label>

          {!form.addToPool && (
            <FieldGroup label="Learning outcomes (optional)">
              <LOSelector
                context={{
                  pathway: form.pathway,
                  yearGroup: form.yearGroup,
                  sport: form.sport,
                  skills: form.skills,
                }}
                selectedIds={form.loIds}
                onChange={(loIds) => setForm({ ...form, loIds })}
              />
            </FieldGroup>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save entry</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
