"use client";

interface SchoolCardProps {
  name: string;
  selected: boolean;
  onSelect: () => void;
}

export function SchoolCard({ name, selected, onSelect }: SchoolCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${name}${selected ? ", selected" : ""}`}
      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
        selected
          ? "border-teal-500 bg-teal-50 ring-1 ring-teal-200"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span className={`text-sm ${selected ? "font-medium text-teal-900" : "text-slate-800"}`}>
        {name}
      </span>
      {selected && (
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs text-white"
          aria-hidden="true"
        >
          ✓
        </span>
      )}
    </button>
  );
}
