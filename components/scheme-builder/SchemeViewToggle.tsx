"use client";

import { Button } from "@/components/ui/Button";

export type SchemeDisplayMode = "screen" | "table";

interface SchemeViewToggleProps {
  mode: SchemeDisplayMode;
  onChange: (mode: SchemeDisplayMode) => void;
  screenLabel?: string;
  tableLabel?: string;
}

export function SchemeViewToggle({
  mode,
  onChange,
  screenLabel = "Screen view",
  tableLabel = "Table view",
}: SchemeViewToggleProps) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
      <Button
        type="button"
        variant={mode === "screen" ? "primary" : "ghost"}
        className="h-8 px-3 text-xs"
        onClick={() => onChange("screen")}
      >
        {screenLabel}
      </Button>
      <Button
        type="button"
        variant={mode === "table" ? "primary" : "ghost"}
        className="h-8 px-3 text-xs"
        onClick={() => onChange("table")}
      >
        {tableLabel}
      </Button>
    </div>
  );
}
