"use client";

import { useState } from "react";
import {
  activityLabels,
  waltLines,
  wilfLines,
} from "@/lib/scheme-builder/lesson-actions";
import { SchemeLearningOutcomeCard } from "@/components/scheme-builder/SchemeLearningOutcomeCard";
import { SchemeLessonDeliveryControls } from "@/components/progress/SchemeLessonDeliveryControls";
import { resolveSchemeLearningOutcomes } from "@/lib/scheme-builder/helpers";
import type { SOWLesson } from "@/lib/types";

interface SchemeLessonEditorProps {
  lesson: SOWLesson;
  onLessonChange?: (lesson: SOWLesson) => void;
  onRemoveOutcome: (id: string) => void;
  onRemoveWalt: (text: string) => void;
  onEditWalt: (oldText: string, newText: string) => void;
  onRemoveWilf: (text: string) => void;
  onEditWilf: (oldText: string, newText: string) => void;
  onRemoveActivity: (label: string) => void;
  onEditActivity: (oldLabel: string, newLabel: string) => void;
  onRemoveResource: (resource: string) => void;
  onEditResource: (oldResource: string, newResource: string) => void;
}

function Section({
  title,
  hint,
  empty,
  layout = "chips",
  children,
}: {
  title: string;
  hint: string;
  empty: boolean;
  layout?: "chips" | "stack";
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{hint}</p>
        </div>
        <span className="text-xs text-slate-400">{collapsed ? "Expand" : "Collapse"}</span>
      </button>
      {!collapsed && (
        <div className="border-t border-slate-100 px-5 py-4">
          {empty ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-400">
              Use the planning assistant on the right to add cards to this lesson.
            </p>
          ) : (
            <div
              className={
                layout === "stack" ? "flex flex-col gap-3" : "flex flex-wrap gap-2"
              }
            >
              {children}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

const CHIP_TONES = {
  teal: "bg-teal-100 text-teal-900",
  blue: "bg-blue-100 text-blue-900",
  purple: "bg-violet-100 text-violet-900",
  amber: "bg-amber-100 text-amber-900",
  green: "bg-emerald-100 text-emerald-900",
} as const;

function RemovableChip({
  label,
  tone,
  editable = false,
  onRemove,
  onEdit,
}: {
  label: string;
  tone: keyof typeof CHIP_TONES;
  editable?: boolean;
  onRemove: () => void;
  onEdit?: (newText: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);

  if (editing && onEdit) {
    return (
      <span className={`inline-flex max-w-full items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm ${CHIP_TONES[tone]}`}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="min-w-[160px] rounded border border-slate-300 bg-white px-2 py-1 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              onEdit(draft.trim());
              setEditing(false);
            }
            if (e.key === "Escape") setEditing(false);
          }}
          autoFocus
        />
        <button
          type="button"
          className="text-xs font-semibold"
          onClick={() => {
            if (draft.trim()) onEdit(draft.trim());
            setEditing(false);
          }}
        >
          Save
        </button>
      </span>
    );
  }

  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm ${CHIP_TONES[tone]}`}>
      <span className="min-w-0">{label}</span>
      {editable && onEdit && (
        <button
          type="button"
          onClick={() => {
            setDraft(label);
            setEditing(true);
          }}
          className="shrink-0 text-xs opacity-60 hover:opacity-100"
          aria-label={`Edit ${label}`}
        >
          ✎
        </button>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 font-bold opacity-60 hover:opacity-100"
        aria-label={`Remove ${label}`}
      >
        ×
      </button>
    </span>
  );
}

export function SchemeLessonEditor({
  lesson,
  onLessonChange,
  onRemoveOutcome,
  onRemoveWalt,
  onEditWalt,
  onRemoveWilf,
  onEditWilf,
  onRemoveActivity,
  onEditActivity,
  onRemoveResource,
  onEditResource,
}: SchemeLessonEditorProps) {
  const resolvedOutcomes = resolveSchemeLearningOutcomes(lesson.learningOutcomeIds);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/80 to-white px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          Editing lesson {lesson.lessonNumber}
        </p>
        <p className="mt-1 text-lg font-semibold text-slate-900">
          {lesson.walt.trim()
            ? lesson.walt.split("\n")[0]
            : `Lesson ${lesson.lessonNumber}`}
        </p>
      </div>

      {onLessonChange && (
        <SchemeLessonDeliveryControls lesson={lesson} onChange={onLessonChange} />
      )}

      <Section
        title="Learning Outcomes"
        hint="Curriculum outcomes linked to this lesson"
        empty={resolvedOutcomes.length === 0}
        layout="stack"
      >
        {resolvedOutcomes.map((outcome) => (
          <SchemeLearningOutcomeCard
            key={outcome.id}
            outcome={outcome}
            onRemove={() => onRemoveOutcome(outcome.id)}
          />
        ))}
      </Section>

      <Section
        title="WALT"
        hint="We Are Learning To…"
        empty={waltLines(lesson.walt).length === 0}
      >
        {waltLines(lesson.walt).map((line) => (
          <RemovableChip
            key={line}
            label={line}
            tone="blue"
            editable
            onRemove={() => onRemoveWalt(line)}
            onEdit={(newText) => onEditWalt(line, newText)}
          />
        ))}
      </Section>

      <Section
        title="WILF"
        hint="What I'm Looking For — success criteria"
        empty={wilfLines(lesson.wilf).length === 0}
      >
        {wilfLines(lesson.wilf).map((line) => (
          <RemovableChip
            key={line}
            label={line}
            tone="purple"
            editable
            onRemove={() => onRemoveWilf(line)}
            onEdit={(newText) => onEditWilf(line, newText)}
          />
        ))}
      </Section>

      <Section
        title="Activities"
        hint="Lesson activities and structure"
        empty={activityLabels(lesson.activities).length === 0}
      >
        {activityLabels(lesson.activities).map((label) => (
          <RemovableChip
            key={label}
            label={label}
            tone="amber"
            editable
            onRemove={() => onRemoveActivity(label)}
            onEdit={(newText) => onEditActivity(label, newText)}
          />
        ))}
      </Section>

      <Section
        title="Resources"
        hint="Equipment and materials"
        empty={lesson.resources.length === 0}
      >
        {lesson.resources.map((resource) => (
          <RemovableChip
            key={resource}
            label={resource}
            tone="green"
            editable
            onRemove={() => onRemoveResource(resource)}
            onEdit={(newText) => onEditResource(resource, newText)}
          />
        ))}
      </Section>
    </div>
  );
}
