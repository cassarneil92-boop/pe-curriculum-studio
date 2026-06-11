"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { TeacherTimetableEditor } from "@/components/settings/TeacherTimetableEditor";
import {
  createAcademicTerm,
  defaultAcademicCalendarSettings,
  migrateAcademicCalendarSettings,
} from "@/lib/calendar/academic-settings";
import type { AcademicCalendarSettings, AcademicTerm } from "@/lib/types";
import { SchoolSetupFields } from "@/components/shared/SchoolSetupFields";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContextualYearGroupPicker } from "@/components/shared/ContextualYearGroupPicker";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import Link from "next/link";
import { ADVANCED_NAV_ITEMS, PATHWAYS } from "@/lib/constants";
import { NavIcon } from "@/components/layout/NavIcon";
import {
  buildTeacherContext,
  pruneYearGroupsForPathways,
  type CurriculumAccessMode,
} from "@/lib/teacher-context";
import type { PathwayId, YearGroup } from "@/lib/types";

export default function SettingsPage() {
  const { data, updateTeacher, updateAcademicCalendar } = useApp();
  const { accessMode, setAccessMode, context } = useTeacherContext();
  const [form, setForm] = useState(data.teacher);
  const [academicForm, setAcademicForm] = useState<AcademicCalendarSettings>(() =>
    migrateAcademicCalendarSettings(data.academicCalendar, data.planningTerms)
  );
  const [saved, setSaved] = useState(false);
  const previewContext = buildTeacherContext(form, accessMode);

  const toggleYear = (yg: YearGroup) => {
    setForm((prev) => ({
      ...prev,
      yearGroups: prev.yearGroups.includes(yg)
        ? prev.yearGroups.filter((y) => y !== yg)
        : [...prev.yearGroups, yg],
    }));
  };

  const togglePathway = (id: PathwayId) => {
    setForm((prev) => {
      const pathways = prev.pathways.includes(id)
        ? prev.pathways.filter((p) => p !== id)
        : [...prev.pathways, id];

      return {
        ...prev,
        pathways,
        yearGroups: pruneYearGroupsForPathways(pathways, prev.yearGroups),
      };
    });
  };

  useEffect(() => {
    setAcademicForm(
      migrateAcademicCalendarSettings(data.academicCalendar, data.planningTerms)
    );
  }, [data.academicCalendar, data.planningTerms]);

  const handleSave = () => {
    updateTeacher(form);
    updateAcademicCalendar(academicForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateTerm = (id: string, patch: Partial<AcademicTerm>) => {
    setAcademicForm((prev) => ({
      ...prev,
      terms: prev.terms.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  };

  const addTerm = () => {
    setAcademicForm((prev) => ({
      ...prev,
      terms: [...prev.terms, createAcademicTerm(prev.terms)],
    }));
  };

  const removeTerm = (id: string) => {
    setAcademicForm((prev) => {
      if (prev.terms.length <= 1) return prev;
      return { ...prev, terms: prev.terms.filter((t) => t.id !== id) };
    });
  };

  const resetAcademicDefaults = () => {
    setAcademicForm(defaultAcademicCalendarSettings());
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Your teaching context. The studio uses this to assist — never to restrict."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader title="School details" />
          <SchoolSetupFields
            value={form}
            onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          />
        </Card>

        <Card>
          <CardHeader title="Subject pathways taught" />
          <div className="space-y-2">
            {PATHWAYS.map((p) => (
              <label
                key={p.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  form.pathways.includes(p.id)
                    ? "border-teal-300 bg-teal-50/50"
                    : "border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.pathways.includes(p.id)}
                  onChange={() => togglePathway(p.id)}
                  className="mt-0.5 accent-teal-600"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.label}</p>
                  <p className="text-xs text-slate-500">{p.description}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Year groups taught"
            description="Only year groups valid for your selected pathways are shown."
          />
          <ContextualYearGroupPicker
            teacher={form}
            selected={form.yearGroups}
            onToggle={toggleYear}
            onPrune={(yearGroups) => setForm((prev) => ({ ...prev, yearGroups }))}
          />
        </Card>

        <Card>
          <CardHeader
            title="Curriculum Access"
            description="Intelligent Mode shows pathways relevant to your profile. Explore All reveals the full curriculum brain."
          />
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3">
              <input
                type="radio"
                name="curriculum-access"
                checked={accessMode === "intelligent"}
                onChange={() => setAccessMode("intelligent")}
                className="mt-0.5 accent-teal-600"
              />
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Intelligent Mode (Recommended)
                </p>
                <p className="text-xs text-slate-500">
                  Show curriculum pathways matched to your teaching context.
                </p>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3">
              <input
                type="radio"
                name="curriculum-access"
                checked={accessMode === "explore-all"}
                onChange={() => setAccessMode("explore-all" as CurriculumAccessMode)}
                className="mt-0.5 accent-teal-600"
              />
              <div>
                <p className="text-sm font-medium text-slate-800">Explore All Curriculum</p>
                <p className="text-xs text-slate-500">
                  Browse every imported pathway and learning outcome.
                </p>
              </div>
            </label>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Detected context:{" "}
            <span className="font-medium text-teal-700">{previewContext.roleLabel}</span>
            {previewContext.role !== context.role && (
              <span className="text-amber-700"> (save profile to apply)</span>
            )}
          </p>
        </Card>

        <Card>
          <CardHeader
            title="Academic Calendar"
            description="Single source of truth for term dates — used by Calendar, Schemes, Dashboard and Teaching Progress."
          />
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <DateField
                label="Academic year start"
                value={academicForm.academicYearStart}
                onChange={(value) =>
                  setAcademicForm((prev) => ({ ...prev, academicYearStart: value }))
                }
              />
              <DateField
                label="Academic year end"
                value={academicForm.academicYearEnd}
                onChange={(value) =>
                  setAcademicForm((prev) => ({ ...prev, academicYearEnd: value }))
                }
              />
            </div>
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
              <Button variant="ghost" className="text-xs" onClick={resetAcademicDefaults}>
                Reset to Malta defaults
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Teacher Timetable"
            description="Define your weekly PE slots. Calendar Week View uses these for faster drag-and-drop scheduling."
          />
          <TeacherTimetableEditor />
        </Card>

        <Card>
          <CardHeader
            title="Export defaults"
            description="Lesson plans and schemes support PDF, Word, and print from their detail view."
          />
          <div className="flex flex-wrap gap-2">
            <Badge tone="teal">PDF</Badge>
            <Badge tone="teal">Editable Word</Badge>
            <Badge tone="teal">Printable</Badge>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Advanced tools"
            description="Technical curriculum tools for curriculum information checks and alignment testing."
          />
          <div className="space-y-2">
            {ADVANCED_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 transition-colors hover:border-teal-200 hover:bg-teal-50/40"
              >
                <span className="text-teal-700">
                  <NavIcon name={item.icon} />
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="About PE Curriculum Studio"
            description="Official branding, mission, and credits."
          />
          <Link
            href="/about"
            className="inline-flex text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            View about page →
          </Link>
        </Card>

        <Card>
          <CardHeader title="Data storage" description="All data is stored locally in your browser." />
          <p className="text-sm text-slate-600">
            {data.lessons.length} lessons · {data.schemes.length} schemes ·{" "}
            {data.calendar.length} calendar entries · {data.resources.length} resources
          </p>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>Save settings</Button>
          {saved && <span className="text-sm text-teal-600">Saved</span>}
        </div>
      </div>
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
