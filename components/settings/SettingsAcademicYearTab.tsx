"use client";

import {
  createAcademicTerm,
  defaultAcademicCalendarSettings,
} from "@/lib/calendar/academic-settings";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import type { AcademicCalendarSettings, AcademicTerm } from "@/lib/types";

interface SettingsAcademicYearTabProps {
  academicForm: AcademicCalendarSettings;
  onChange: (settings: AcademicCalendarSettings) => void;
}

export function SettingsAcademicYearTab({
  academicForm,
  onChange,
}: SettingsAcademicYearTabProps) {
  const updateTerm = (id: string, patch: Partial<AcademicTerm>) => {
    onChange({
      ...academicForm,
      terms: academicForm.terms.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  };

  const addTerm = () => {
    onChange({
      ...academicForm,
      terms: [...academicForm.terms, createAcademicTerm(academicForm.terms)],
    });
  };

  const removeTerm = (id: string) => {
    if (academicForm.terms.length <= 1) return;
    onChange({
      ...academicForm,
      terms: academicForm.terms.filter((t) => t.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Academic year"
          description="Used by Calendar, Schemes, Dashboard and Teaching Progress."
        />
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <DateField
              label="Academic year start"
              value={academicForm.academicYearStart}
              onChange={(value) =>
                onChange({ ...academicForm, academicYearStart: value })
              }
            />
            <DateField
              label="Academic year end"
              value={academicForm.academicYearEnd}
              onChange={(value) => onChange({ ...academicForm, academicYearEnd: value })}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Terms" />
        <div className="space-y-3">
          {academicForm.terms.map((term) => (
            <TermEditor
              key={term.id}
              term={term}
              canRemove={academicForm.terms.length > 1}
              onChange={(patch) => updateTerm(term.id, patch)}
              onRemove={() => removeTerm(term.id)}
            />
          ))}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" className="text-xs" onClick={addTerm}>
              Add term
            </Button>
            <Button
              variant="ghost"
              className="text-xs"
              onClick={() => onChange(defaultAcademicCalendarSettings())}
            >
              Reset to Malta defaults
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Holidays"
          description="School holiday calendar — coming in a future update."
        />
        <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
          Holiday planning will be added here. Term dates above are used for pacing today.
        </p>
      </Card>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
    </label>
  );
}

function TermEditor({
  term,
  canRemove,
  onChange,
  onRemove,
}: {
  term: AcademicTerm;
  canRemove: boolean;
  onChange: (patch: Partial<AcademicTerm>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="block flex-1 text-sm">
          <span className="mb-1 block font-semibold text-slate-800">Term name</span>
          <input
            type="text"
            value={term.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="mt-5 text-xs text-rose-600 hover:text-rose-700"
          >
            Remove
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <DateField
          label="Start"
          value={term.startDate}
          onChange={(startDate) => onChange({ startDate })}
        />
        <DateField
          label="End"
          value={term.endDate}
          onChange={(endDate) => onChange({ endDate })}
        />
      </div>
    </div>
  );
}
