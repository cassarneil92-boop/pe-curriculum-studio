"use client";

import { ContextualYearGroupPicker } from "@/components/shared/ContextualYearGroupPicker";
import { Card, CardHeader } from "@/components/ui/Card";
import { PATHWAYS } from "@/lib/constants";
import { pruneYearGroupsForPathways, type CurriculumAccessMode } from "@/lib/teacher-context";
import type { PathwayId, TeacherProfile, YearGroup } from "@/lib/types";

interface SettingsTeachingContextTabProps {
  form: TeacherProfile;
  accessMode: CurriculumAccessMode;
  detectedRoleLabel: string;
  rolePending: boolean;
  onChange: (patch: Partial<TeacherProfile>) => void;
  onAccessModeChange: (mode: CurriculumAccessMode) => void;
}

export function SettingsTeachingContextTab({
  form,
  accessMode,
  detectedRoleLabel,
  rolePending,
  onChange,
  onAccessModeChange,
}: SettingsTeachingContextTabProps) {
  const toggleYear = (yg: YearGroup) => {
    onChange({
      yearGroups: form.yearGroups.includes(yg)
        ? form.yearGroups.filter((y) => y !== yg)
        : [...form.yearGroups, yg],
    });
  };

  const togglePathway = (id: PathwayId) => {
    const pathways = form.pathways.includes(id)
      ? form.pathways.filter((p) => p !== id)
      : [...form.pathways, id];
    onChange({
      pathways,
      yearGroups: pruneYearGroupsForPathways(pathways, form.yearGroups),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Subject pathways taught" />
        <div className="space-y-2">
          {PATHWAYS.map((p) => (
            <label
              key={p.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                form.pathways.includes(p.id)
                  ? "border-teal-300 bg-teal-50/50"
                  : "border-slate-200"
              }`}
            >
              <input
                type="checkbox"
                checked={form.pathways.includes(p.id)}
                onChange={() => togglePathway(p.id)}
                className="mt-0.5 accent-teal-600"
              />
              <div>
                <p className="text-sm font-medium text-slate-800">{p.label}</p>
                <p className="text-xs text-slate-500">{p.description}</p>
              </div>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Year groups taught"
          description="Only year groups valid for your selected pathways are shown."
        />
        <ContextualYearGroupPicker
          teacher={form}
          selected={form.yearGroups}
          onToggle={toggleYear}
          onPrune={(yearGroups) => onChange({ yearGroups })}
        />
      </Card>

      <Card>
        <CardHeader
          title="Curriculum access"
          description="Intelligent Mode shows pathways relevant to your profile."
        />
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3">
            <input
              type="radio"
              name="curriculum-access"
              checked={accessMode === "intelligent"}
              onChange={() => onAccessModeChange("intelligent")}
              className="mt-0.5 accent-teal-600"
            />
            <div>
              <p className="text-sm font-medium text-slate-800">Intelligent Mode (Recommended)</p>
              <p className="text-xs text-slate-500">
                Show curriculum pathways matched to your teaching context.
              </p>
            </div>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3">
            <input
              type="radio"
              name="curriculum-access"
              checked={accessMode === "explore-all"}
              onChange={() => onAccessModeChange("explore-all")}
              className="mt-0.5 accent-teal-600"
            />
            <div>
              <p className="text-sm font-medium text-slate-800">Explore All Curriculum</p>
              <p className="text-xs text-slate-500">Browse every imported pathway and outcome.</p>
            </div>
          </label>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Detected context:{" "}
          <span className="font-medium text-teal-700">{detectedRoleLabel}</span>
          {rolePending && <span className="text-amber-700"> (save to apply)</span>}
        </p>
      </Card>
    </div>
  );
}
