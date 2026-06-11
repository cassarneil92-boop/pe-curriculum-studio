"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { NavIcon } from "@/components/layout/NavIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ADVANCED_NAV_ITEMS } from "@/lib/constants";
import { DEFAULT_APP_DATA, saveAppData } from "@/lib/storage";

export function SettingsAdvancedTab() {
  const { data } = useApp();

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pe-curriculum-studio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          saveAppData({ ...DEFAULT_APP_DATA, ...parsed });
          window.location.reload();
        } catch {
          alert("Could not read backup file. Check the file format.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    if (
      !confirm(
        "Reset all local data? Lessons, schemes, calendar and resources will be cleared. This cannot be undone."
      )
    ) {
      return;
    }
    localStorage.removeItem("pe-curriculum-studio-malta");
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Import / export" description="Back up or restore your local data." />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExport}>
            Export backup
          </Button>
          <Button variant="ghost" onClick={handleImport}>
            Import backup
          </Button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Exports include lessons, schemes, calendar, resources and settings.
        </p>
      </Card>

      <Card>
        <CardHeader
          title="Diagnostics"
          description="Curriculum information checks and alignment tools."
        />
        <div className="space-y-2">
          {ADVANCED_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 transition-colors hover:border-teal-200 hover:bg-teal-50/40"
            >
              <span className="text-teal-700">
                <NavIcon name={item.icon} />
              </span>
              {item.label}
            </Link>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Export formats" description="Available from lesson and scheme views." />
        <div className="flex flex-wrap gap-2">
          <Badge tone="teal">PDF</Badge>
          <Badge tone="teal">Editable Word</Badge>
          <Badge tone="teal">Printable</Badge>
        </div>
      </Card>

      <Card>
        <CardHeader title="Data storage" description="All data is stored locally in your browser." />
        <p className="text-sm text-slate-600">
          {data.lessons.length} lessons · {data.schemes.length} schemes ·{" "}
          {data.calendar.length} calendar entries · {data.resources.length} resources
        </p>
      </Card>

      <Card>
        <CardHeader
          title="Reset options"
          description="Clear all local data and start fresh."
        />
        <Button variant="ghost" className="text-rose-600" onClick={handleReset}>
          Reset all local data
        </Button>
      </Card>

      <Card>
        <CardHeader title="About" description="Official branding and credits." />
        <Link
          href="/about"
          className="inline-flex text-sm font-medium text-teal-700 hover:text-teal-800"
        >
          View about page →
        </Link>
      </Card>
    </div>
  );
}
