"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { FieldGroup, Input, Textarea } from "@/components/ui/Input";
import {
  createEndingFromPreset,
  LESSON_ENDING_PRESETS,
} from "@/lib/lesson-plans/pe-template";
import type { LessonEndingComponent } from "@/lib/types";
import { generateId } from "@/lib/storage";

interface LessonEndingBuilderProps {
  endings: LessonEndingComponent[];
  onChange: (endings: LessonEndingComponent[]) => void;
}

export function LessonEndingBuilder({ endings, onChange }: LessonEndingBuilderProps) {
  const sorted = [...endings].sort((a, b) => a.order - b.order);

  const updateEnding = (id: string, patch: Partial<LessonEndingComponent>) => {
    onChange(endings.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const removeEnding = (id: string) => {
    const next = endings
      .filter((e) => e.id !== id)
      .map((e, index) => ({ ...e, order: index }));
    onChange(next);
  };

  const moveEnding = (id: string, direction: -1 | 1) => {
    const index = sorted.findIndex((e) => e.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= sorted.length) return;

    const reordered = [...sorted];
    const [item] = reordered.splice(index, 1);
    reordered.splice(target, 0, item);
    onChange(reordered.map((e, i) => ({ ...e, order: i })));
  };

  const duplicateEnding = (ending: LessonEndingComponent) => {
    onChange([
      ...endings,
      {
        ...ending,
        id: generateId(),
        title: `${ending.title} (copy)`,
        order: endings.length,
      },
    ]);
  };

  const addPreset = (presetIndex: number) => {
    const preset = LESSON_ENDING_PRESETS[presetIndex];
    onChange([...endings, createEndingFromPreset(preset, endings.length)]);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Add lesson ending"
          description="Choose what fits your lesson — add, remove, rename, duplicate, or reorder freely."
        />
        <div className="flex flex-wrap gap-2">
          {LESSON_ENDING_PRESETS.map((preset, index) => (
            <Button
              key={preset.type}
              type="button"
              variant="secondary"
              className="h-8 text-xs"
              onClick={() => addPreset(index)}
            >
              + {preset.title}
            </Button>
          ))}
        </div>
      </Card>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center text-sm text-slate-500">
          No lesson endings yet. Add cool downs, reflection, questioning, assessment, or custom
          sections above.
        </div>
      ) : (
        sorted.map((ending, index) => (
          <div
            key={ending.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-900">{ending.title}</p>
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  disabled={index === 0}
                  onClick={() => moveEnding(ending.id, -1)}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  disabled={index === sorted.length - 1}
                  onClick={() => moveEnding(ending.id, 1)}
                >
                  ↓
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 text-xs"
                  onClick={() => duplicateEnding(ending)}
                >
                  Duplicate
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 text-xs text-rose-600"
                  onClick={() => removeEnding(ending.id)}
                >
                  Remove
                </Button>
              </div>
            </div>

            <FieldGroup label="Section title">
              <Input
                value={ending.title}
                onChange={(e) => updateEnding(ending.id, { title: e.target.value })}
              />
            </FieldGroup>
            <div className="mt-3">
              <FieldGroup label="Content / notes">
                <Textarea
                  value={ending.content}
                  onChange={(e) => updateEnding(ending.id, { content: e.target.value })}
                  placeholder="What will happen in this part of the lesson?"
                />
              </FieldGroup>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
