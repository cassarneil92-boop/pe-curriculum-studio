"use client";

import { useState } from "react";
import { getCollegeInitials, type College } from "@/src/lib/colleges";

interface CollegeCardProps {
  college: College;
  selected: boolean;
  onSelect: () => void;
}

export function CollegeCard({ college, selected, onSelect }: CollegeCardProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const initials = getCollegeInitials(college.name);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${college.name}${selected ? ", selected" : ""}`}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
        selected
          ? "border-teal-500 bg-teal-50/80 ring-1 ring-teal-200"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {logoFailed ? (
        <span
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          style={{
            backgroundColor: college.secondaryColor,
            color: college.primaryColor,
          }}
        >
          {initials}
        </span>
      ) : (
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white">
          <img
            src={college.logo}
            alt=""
            className="max-h-14 max-w-14 object-contain"
            onError={() => setLogoFailed(true)}
          />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-snug text-slate-800">
          {college.name}
        </span>
        {selected && (
          <span className="mt-0.5 block text-xs text-teal-700">Selected</span>
        )}
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
