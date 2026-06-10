"use client";

import { useState } from "react";
import {
  activityLabels,
  waltLines,
  wilfLines,
} from "@/lib/scheme-builder/lesson-actions";
import { formatLearningOutcomesForCell } from "@/lib/scheme-builder/helpers";
import type { SOWLesson } from "@/lib/types";

interface SOWLessonRowProps {
  lesson: SOWLesson;
  selected: boolean;
  onSelect: () => void;
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

function Zone({
  title,
  emptyLabel,
  children,
}: {
  title: string;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  const hasContent = Boolean(children);

  return (
    <div className="min-h-[88px] rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-2.5">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      {hasContent ? (
        <div className="flex flex-wrap gap-1.5">{children}</div>
      ) : (
        <p className="text-xs text-slate-400">{emptyLabel}</p>
      )}
    </div>
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
  const display = label.length > 52 ? `${label.slice(0, 52)}…` : label;

  if (editing && onEdit) {
    return (
      <span
        className={`inline-flex max-w-full items-center gap-1 rounded-lg px-2 py-1 text-xs ${CHIP_TONES[tone]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="min-w-[120px] rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs"
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
          className="text-[10px] font-semibold"
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
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-lg px-2 py-1 text-xs ${CHIP_TONES[tone]}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="min-w-0">{display}</span>
      {editable && onEdit && (
        <button
          type="button"
          onClick={() => {
            setDraft(label);
            setEditing(true);
          }}
          className="shrink-0 text-[10px] opacity-60 hover:opacity-100"
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

export function SOWLessonRow({
  lesson,
  selected,
  onSelect,
  onRemoveOutcome,
  onRemoveWalt,
  onEditWalt,
  onRemoveWilf,
  onEditWilf,
  onRemoveActivity,
  onEditActivity,
  onRemoveResource,
  onEditResource,
}: SOWLessonRowProps) {
  const outcomeEntries = lesson.learningOutcomeIds.map((id) => {
    const line = formatLearningOutcomesForCell([id]);
    const code = line.split(" ")[0] ?? id;
    return { id, code };
  });

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        selected
          ? "border-teal-500 bg-teal-50/40 ring-2 ring-teal-300 shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <button type="button" onClick={onSelect} className="mb-3 flex w-full items-center gap-3 text-left">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
            selected ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700"
          }`}
        >
          {lesson.lessonNumber}
        </span>
        <div>
          <p className="font-semibold text-slate-900">Lesson {lesson.lessonNumber}</p>
          <p className="text-xs text-slate-500">
            {selected ? "Selected — click cards above to add" : "Click to select this lesson"}
          </p>
        </div>
      </button>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Zone title="Outcomes & WALT" emptyLabel="Add LOs or WALT cards">
          {outcomeEntries.map((entry) => (
            <RemovableChip
              key={entry.id}
              label={entry.code}
              tone="teal"
              onRemove={() => onRemoveOutcome(entry.id)}
            />
          ))}
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
        </Zone>

        <Zone title="WILF" emptyLabel="Add success criteria cards">
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
        </Zone>

        <Zone title="Activities" emptyLabel="Add activity cards">
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
        </Zone>

        <Zone title="Resources" emptyLabel="Add resource cards">
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
        </Zone>
      </div>
    </div>
  );
}
