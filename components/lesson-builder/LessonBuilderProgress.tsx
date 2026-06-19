"use client";

import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import { isLessonSectionComplete } from "@/lib/lesson-builder/draft";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface Section {
  id: string;
  label: string;
  number: number;
}

export function LessonBuilderProgress({
  sections,
  form,
  activeSection,
  onSectionSelect,
  completionPercent,
}: {
  sections: readonly Section[];
  form: LessonBuilderFormData;
  activeSection: string;
  onSectionSelect: (id: string) => void;
  completionPercent: number;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Lesson progress
          </p>
          <span className="text-sm font-semibold tabular-nums text-teal-700">{completionPercent}%</span>
        </div>
        <ProgressBar value={completionPercent} max={100} showPercent={false} variant="teal" />
      </div>

      <div className="space-y-1">
        {sections.map((section) => {
          const active = activeSection === section.id;
          const complete = isLessonSectionComplete(section.id, form);

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionSelect(section.id)}
              className={`flex w-full min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                active
                  ? "bg-teal-50 font-medium text-teal-900 ring-1 ring-teal-100"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  complete
                    ? "bg-teal-600 text-white"
                    : active
                      ? "bg-teal-100 text-teal-800"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {complete ? "✓" : section.number}
              </span>
              <span className="min-w-0 flex-1 truncate">{section.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
