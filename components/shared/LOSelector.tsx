"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { broadSearchLOs, strictMatchLOs } from "@/lib/lo-matching";
import type { LOFilterContext } from "@/lib/types";

interface LOSelectorProps {
  context: LOFilterContext;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function LOSelector({ context, selectedIds, onChange }: LOSelectorProps) {
  const [mode, setMode] = useState<"strict" | "broad">("strict");
  const [search, setSearch] = useState("");

  const suggestions = useMemo(() => {
    if (mode === "strict") return strictMatchLOs(context);
    return broadSearchLOs(search, {
      pathway: context.pathway,
      yearGroup: context.yearGroup,
    });
  }, [mode, context, search]);

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex rounded-lg border border-slate-200 p-0.5">
          <button
            type="button"
            onClick={() => setMode("strict")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "strict"
                ? "bg-teal-600 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Auto suggestions
          </button>
          <button
            type="button"
            onClick={() => setMode("broad")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "broad"
                ? "bg-teal-600 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Manual search
          </button>
        </div>
        {mode === "strict" && (
          <p className="text-xs text-slate-500">Strict match on sport &amp; skills</p>
        )}
      </div>

      {mode === "broad" && (
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search outcomes by code, sport, skill…"
        />
      )}

      {mode === "strict" && suggestions.length === 0 && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          No strict matches yet. Select a sport and skill, or switch to manual search.
        </p>
      )}

      <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/50 p-2">
        {suggestions.map((lo) => (
          <label
            key={lo.id}
            className={`flex cursor-pointer gap-3 rounded-lg border bg-white p-3 transition-colors ${
              selectedIds.includes(lo.id)
                ? "border-teal-300 ring-1 ring-teal-200"
                : "border-slate-100 hover:border-slate-200"
            }`}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(lo.id)}
              onChange={() => toggle(lo.id)}
              className="mt-1 accent-teal-600"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-teal-700">{lo.code}</span>
                <Badge tone="slate">{lo.sport}</Badge>
                {lo.skills.slice(0, 2).map((s) => (
                  <Badge key={s} tone="blue">
                    {s}
                  </Badge>
                ))}
              </div>
              <p className="mt-1 text-sm text-slate-700">{lo.description}</p>
            </div>
          </label>
        ))}
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">{selectedIds.length} outcome(s) selected</p>
          <Button variant="ghost" className="text-xs" onClick={() => onChange([])}>
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
