"use client";

import { Badge } from "@/components/ui/Badge";

export type SchemeBuilderMode = "planning" | "review";

interface SchemeBuilderModeToggleProps {
  mode: SchemeBuilderMode;
  onChange: (mode: SchemeBuilderMode) => void;
  reviewAvailable?: boolean;
}

export function SchemeBuilderModeToggle({
  mode,
  onChange,
  reviewAvailable = false,
}: SchemeBuilderModeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50/80 p-0.5">
        <button
          type="button"
          onClick={() => onChange("planning")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "planning"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Planning
        </button>
        <button
          type="button"
          onClick={() => onChange("review")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "review"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Review
        </button>
      </div>
      {reviewAvailable && mode === "planning" && (
        <Badge tone="amber">Review available</Badge>
      )}
    </div>
  );
}
