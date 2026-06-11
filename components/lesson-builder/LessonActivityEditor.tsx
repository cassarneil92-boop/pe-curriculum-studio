"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/Input";
import {
  STUDENT_GROUP_PRESETS,
  TEACHING_CUE_SUGGESTIONS,
} from "@/lib/lesson-plans/pe-template";
import type { LessonActivity } from "@/lib/types";

interface LessonActivityEditorProps {
  activity: LessonActivity;
  onChange: (activity: LessonActivity) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function ListEditor({
  label,
  items,
  placeholder,
  onChange,
}: {
  label: string;
  items: string[];
  placeholder: string;
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div>
      {label ? <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p> : null}
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, index) => (
          <Badge key={`${item}-${index}`} tone="slate">
            {item}
            <button
              type="button"
              className="ml-1 font-bold"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              onChange([...items, draft.trim()]);
              setDraft("");
            }
          }}
        />
        <Button
          type="button"
          variant="ghost"
          className="shrink-0"
          disabled={!draft.trim()}
          onClick={() => {
            if (!draft.trim()) return;
            onChange([...items, draft.trim()]);
            setDraft("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

export function LessonActivityEditor({
  activity,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: LessonActivityEditorProps) {
  const patch = (partial: Partial<LessonActivity>) => onChange({ ...activity, ...partial });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold text-amber-900">
            {activity.number}
          </span>
          <p className="font-semibold text-slate-900">
            Activity {activity.number}
            {activity.name ? ` – ${activity.name}` : ""}
          </p>
        </div>
        <div className="flex gap-1">
          {onMoveUp && (
            <Button type="button" variant="ghost" className="h-8 px-2 text-xs" onClick={onMoveUp}>
              ↑
            </Button>
          )}
          {onMoveDown && (
            <Button type="button" variant="ghost" className="h-8 px-2 text-xs" onClick={onMoveDown}>
              ↓
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            className="h-8 text-xs text-rose-600"
            onClick={onRemove}
          >
            Remove
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Activity name">
          <Input
            value={activity.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="e.g. Passing Challenge"
          />
        </FieldGroup>
        <FieldGroup label="Number of students">
          <Select
            value={activity.students}
            onChange={(e) => patch({ students: e.target.value })}
          >
            <option value="">Select group format</option>
            {STUDENT_GROUP_PRESETS.map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Time">
          <Input
            value={activity.time}
            onChange={(e) => patch({ time: e.target.value })}
            placeholder="e.g. 10 minutes"
          />
        </FieldGroup>
        <FieldGroup label="Space & equipment">
          <Input
            value={activity.spaceEquipment}
            onChange={(e) => patch({ spaceEquipment: e.target.value })}
            placeholder="e.g. 20x20 area, cones, footballs"
          />
        </FieldGroup>
      </div>

      <div className="mt-4">
        <FieldGroup label="Task description">
          <Textarea
            value={activity.taskDescription}
            onChange={(e) => patch({ taskDescription: e.target.value })}
            placeholder="Describe what students will do…"
          />
        </FieldGroup>
      </div>

      <div className="mt-4 space-y-4">
        <ListEditor
          label="Progressions"
          items={activity.progressions}
          placeholder="Add a progression"
          onChange={(progressions) => patch({ progressions })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Differentiation — easier">
            <Textarea
              value={activity.differentiationEasier}
              onChange={(e) => patch({ differentiationEasier: e.target.value })}
              placeholder="Easier option"
            />
          </FieldGroup>
          <FieldGroup label="Differentiation — harder">
            <Textarea
              value={activity.differentiationHarder}
              onChange={(e) => patch({ differentiationHarder: e.target.value })}
              placeholder="Harder option"
            />
          </FieldGroup>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Teaching cues</p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {TEACHING_CUE_SUGGESTIONS.map((cue) => (
              <button
                key={cue}
                type="button"
                className="rounded-lg bg-teal-50 px-2 py-1 text-xs text-teal-800 hover:bg-teal-100"
                onClick={() => {
                  if (!activity.teachingCues.includes(cue)) {
                    patch({ teachingCues: [...activity.teachingCues, cue] });
                  }
                }}
              >
                + {cue}
              </button>
            ))}
          </div>
          <ListEditor
            label=""
            items={activity.teachingCues}
            placeholder="Custom teaching cue"
            onChange={(teachingCues) => patch({ teachingCues })}
          />
        </div>
      </div>
    </div>
  );
}
