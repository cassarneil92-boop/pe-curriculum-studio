"use client";

import { useState, type ReactNode } from "react";

export type SettingsTabId =
  | "school"
  | "teaching"
  | "academic"
  | "timetable"
  | "advanced";

const TABS: { id: SettingsTabId; label: string; description: string }[] = [
  { id: "school", label: "School", description: "Profile & school" },
  { id: "teaching", label: "Teaching Context", description: "Pathways & access" },
  { id: "academic", label: "Academic Year", description: "Terms & holidays" },
  { id: "timetable", label: "Timetable", description: "Weekly slots" },
  { id: "advanced", label: "Advanced", description: "Tools & data" },
];

interface SettingsTabsProps {
  panels: Record<SettingsTabId, ReactNode>;
}

export function SettingsTabs({ panels }: SettingsTabsProps) {
  const [active, setActive] = useState<SettingsTabId>("school");

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <nav className="flex shrink-0 gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/80 p-1 lg:w-52 lg:flex-col">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`rounded-lg px-3 py-2.5 text-left transition-colors ${
              active === tab.id
                ? "bg-white text-teal-800 shadow-sm ring-1 ring-slate-200/80"
                : "text-slate-600 hover:bg-white/60 hover:text-slate-800"
            }`}
          >
            <p className="text-sm font-medium">{tab.label}</p>
            <p className="hidden text-[10px] text-slate-500 lg:block">{tab.description}</p>
          </button>
        ))}
      </nav>

      <div className="min-w-0 flex-1">{panels[active]}</div>
    </div>
  );
}
