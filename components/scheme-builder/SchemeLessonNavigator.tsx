"use client";

import {
  getLessonCompletionStatus,
  lessonPreviewTitle,
} from "@/lib/scheme-builder/helpers";
import type { SOWLesson } from "@/lib/types";

interface SchemeLessonNavigatorProps {
  lessons: SOWLesson[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function SchemeLessonNavigator({
  lessons,
  activeIndex,
  onSelect,
}: SchemeLessonNavigatorProps) {
  return (
    <nav className="space-y-1" aria-label="Lesson navigator">
      <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Lessons
      </p>
      {lessons.map((lesson, index) => {
        const active = index === activeIndex;
        const status = getLessonCompletionStatus(lesson);
        const preview = lessonPreviewTitle(lesson);
        const statusLabel =
          status === "complete" ? "Complete" : status === "partial" ? "Partial" : "Empty";
        const statusColor =
          status === "complete"
            ? "text-emerald-600"
            : status === "partial"
              ? "text-amber-600"
              : "text-slate-400";
        const dotColor =
          status === "complete"
            ? "bg-emerald-500"
            : status === "partial"
              ? "bg-amber-400"
              : "bg-slate-300";

        return (
          <button
            key={lesson.id}
            type="button"
            onClick={() => onSelect(index)}
            className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
              active
                ? "bg-teal-50 font-medium text-teal-900 ring-1 ring-teal-200"
                : "text-slate-600 hover:bg-slate-100/80"
            }`}
          >
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                active ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {lesson.lessonNumber}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate">{preview}</span>
              <span
                className={`mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide ${statusColor}`}
              >
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotColor}`} />
                {statusLabel}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
