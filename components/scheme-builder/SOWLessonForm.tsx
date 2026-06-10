"use client";

/** @deprecated Replaced by SOWPlanningBoard — kept for reference; safe to remove in a future cleanup. */

import { useState } from "react";
import { SOWLearningOutcomePicker } from "@/components/scheme-builder/SOWLearningOutcomePicker";
import { SOWResourcePicker } from "@/components/scheme-builder/SOWResourcePicker";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Textarea } from "@/components/ui/Input";
import {
  ACTIVITY_TEMPLATE,
  WALT_PLACEHOLDER,
  WILF_PLACEHOLDER,
} from "@/lib/scheme-builder/constants";
import type { SOWLesson } from "@/lib/types";
import type { LearningOutcome } from "@/src/lib/curriculum";

interface SOWLessonFormProps {
  lesson: SOWLesson;
  suggestedOutcomes: LearningOutcome[];
  alignmentReady: boolean;
  defaultExpanded?: boolean;
  onChange: (lesson: SOWLesson) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function lessonStatus(lesson: SOWLesson): string {
  const parts: string[] = [];
  if (lesson.learningOutcomeIds.length > 0) {
    parts.push(
      `${lesson.learningOutcomeIds.length} outcome${lesson.learningOutcomeIds.length === 1 ? "" : "s"}`
    );
  }
  if (lesson.walt.trim()) parts.push("WALT");
  if (lesson.wilf.trim()) parts.push("WILF");
  if (lesson.activities.trim() && lesson.activities.trim() !== ACTIVITY_TEMPLATE.trim()) {
    parts.push("Activities");
  }
  if (lesson.resources.length > 0) parts.push("Resources");

  return parts.length > 0 ? parts.join(" · ") : "Not started";
}

export function SOWLessonForm({
  lesson,
  suggestedOutcomes,
  alignmentReady,
  defaultExpanded = false,
  onChange,
  onRemove,
  canRemove,
}: SOWLessonFormProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const update = <K extends keyof SOWLesson>(key: K, value: SOWLesson[K]) => {
    onChange({ ...lesson, [key]: value });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50/80"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-semibold text-teal-800">
          {lesson.lessonNumber}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-slate-900">
            Lesson {lesson.lessonNumber}
          </span>
          <span className="mt-0.5 block text-xs text-slate-500">{lessonStatus(lesson)}</span>
        </span>
        <span className="shrink-0 text-xs font-medium text-teal-700">
          {expanded ? "Collapse" : "Edit"}
        </span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-slate-100 px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <FieldGroup label="Lesson number">
              <Input
                type="number"
                min={1}
                className="max-w-[120px]"
                value={lesson.lessonNumber}
                onChange={(e) => update("lessonNumber", Number(e.target.value) || 1)}
              />
            </FieldGroup>
            {canRemove && (
              <Button type="button" variant="ghost" className="text-rose-600" onClick={onRemove}>
                Remove lesson
              </Button>
            )}
          </div>

          <FieldGroup label="Learning outcomes">
            {!alignmentReady ? (
              <p className="text-sm text-slate-500">
                Complete scheme focus (pathway, year, topic, skill) to see suggestions.
              </p>
            ) : (
              <SOWLearningOutcomePicker
                outcomes={suggestedOutcomes}
                selectedIds={lesson.learningOutcomeIds}
                onChange={(ids) => update("learningOutcomeIds", ids)}
                emptyMessage="No curriculum match in your teaching context. Adjust focus or enable Explore All in Settings."
              />
            )}
          </FieldGroup>

          <FieldGroup label="WALT — We are learning to…">
            <Textarea
              value={lesson.walt}
              onChange={(e) => update("walt", e.target.value)}
              placeholder={WALT_PLACEHOLDER}
              className="min-h-[72px]"
            />
          </FieldGroup>

          <FieldGroup label="WILF — Success criteria (I can…)">
            <Textarea
              value={lesson.wilf}
              onChange={(e) => update("wilf", e.target.value)}
              placeholder={WILF_PLACEHOLDER}
              className="min-h-[96px]"
            />
            <p className="mt-1 text-xs text-slate-500">One criterion per line.</p>
          </FieldGroup>

          <FieldGroup label="Activities">
            <div className="mb-2 flex flex-wrap gap-2">
              {["Warm up", "Main activity", "Cool down", "Activity 1", "Activity 2"].map(
                (label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      const prefix = lesson.activities.trim() ? "\n\n" : "";
                      update("activities", `${lesson.activities}${prefix}${label}:\n`);
                    }}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:border-teal-200 hover:text-teal-700"
                  >
                    + {label}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => update("activities", ACTIVITY_TEMPLATE)}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:border-slate-300"
              >
                Reset template
              </button>
            </div>
            <Textarea
              value={lesson.activities}
              onChange={(e) => update("activities", e.target.value)}
              className="min-h-[180px] font-mono text-[13px]"
            />
          </FieldGroup>

          <FieldGroup label="Resources">
            <SOWResourcePicker
              selected={lesson.resources}
              onChange={(resources) => update("resources", resources)}
            />
          </FieldGroup>
        </div>
      )}
    </div>
  );
}
