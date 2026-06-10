"use client";

import { Input } from "@/components/ui/Input";
import { SOW_RESOURCE_OPTIONS } from "@/lib/scheme-builder/constants";

interface SOWResourcePickerProps {
  selected: string[];
  onChange: (resources: string[]) => void;
}

export function SOWResourcePicker({ selected, onChange }: SOWResourcePickerProps) {
  const toggle = (resource: string) => {
    onChange(
      selected.includes(resource)
        ? selected.filter((item) => item !== resource)
        : [...selected, resource]
    );
  };

  const customResources = selected.filter(
    (item) => !SOW_RESOURCE_OPTIONS.includes(item as (typeof SOW_RESOURCE_OPTIONS)[number])
  );
  const customValue = customResources.join(", ");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {SOW_RESOURCE_OPTIONS.map((resource) => {
          const isSelected = selected.includes(resource);

          return (
            <button
              key={resource}
              type="button"
              onClick={() => toggle(resource)}
              aria-pressed={isSelected}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                isSelected
                  ? "border-teal-500 bg-teal-50 text-teal-900 ring-1 ring-teal-200"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {isSelected && (
                <svg
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-3.5 w-3.5 shrink-0 text-teal-600"
                  aria-hidden
                >
                  <path d="M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2.5-2.5a1 1 0 1 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0z" />
                </svg>
              )}
              {resource}
            </button>
          );
        })}
      </div>
      <Input
        value={customValue}
        onChange={(e) => {
          const extras = e.target.value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
          const preset = selected.filter((item) =>
            SOW_RESOURCE_OPTIONS.includes(item as (typeof SOW_RESOURCE_OPTIONS)[number])
          );
          onChange([...preset, ...extras]);
        }}
        placeholder="Other resources (comma-separated)"
      />
    </div>
  );
}
