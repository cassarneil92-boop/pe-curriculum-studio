"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { SchoolSetupFields } from "@/components/shared/SchoolSetupFields";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ContextualYearGroupPicker } from "@/components/shared/ContextualYearGroupPicker";
import { APP_NAME, PATHWAYS } from "@/lib/constants";
import { pruneYearGroupsForPathways } from "@/lib/teacher-context";
import { isTeacherSchoolComplete } from "@/src/lib/schools";
import type { PathwayId, YearGroup } from "@/lib/types";

export function SetupWizard() {
  const { data, updateTeacher, completeSetup } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(data.teacher);

  const toggleYear = (yg: YearGroup) => {
    setForm((prev) => ({
      ...prev,
      yearGroups: prev.yearGroups.includes(yg)
        ? prev.yearGroups.filter((y) => y !== yg)
        : [...prev.yearGroups, yg],
    }));
  };

  const togglePathway = (id: PathwayId) => {
    setForm((prev) => {
      const pathways = prev.pathways.includes(id)
        ? prev.pathways.filter((p) => p !== id)
        : [...prev.pathways, id];

      return {
        ...prev,
        pathways,
        yearGroups: pruneYearGroupsForPathways(pathways, prev.yearGroups),
      };
    });
  };

  const schoolComplete = isTeacherSchoolComplete(form);
  const canProceedStep1 = schoolComplete;
  const canProceedStep2 = form.yearGroups.length > 0 && form.pathways.length > 0;
  const canProceed = step === 1 ? canProceedStep1 : canProceedStep2;

  const handleFinish = () => {
    updateTeacher(form);
    completeSetup();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50 p-6">
      <Card className="w-full max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-wider text-teal-600">
          Welcome
        </p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">{APP_NAME}</h1>
        <p className="mt-2 text-sm text-slate-500">
          A few details so the studio can assist your planning — nothing restrictive.
        </p>

        <div className="mt-6 flex gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${s <= step ? "bg-teal-500" : "bg-slate-200"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="mt-6">
            <SchoolSetupFields
              value={form}
              onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
            />
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Subject pathways taught</p>
              <div className="space-y-2">
                {PATHWAYS.map((p) => (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      form.pathways.includes(p.id)
                        ? "border-teal-300 bg-teal-50/50"
                        : "border-slate-200 hover:border-slate-300"
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
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Year groups taught</p>
              <ContextualYearGroupPicker
                teacher={form}
                selected={form.yearGroups}
                onToggle={toggleYear}
                onPrune={(yearGroups) => setForm((prev) => ({ ...prev, yearGroups }))}
              />
            </div>
          </div>
        )}

        <div className="mt-8">
          {step === 1 && !canProceedStep1 && (
            <p className="mb-3 text-center text-xs text-slate-500">
              Choose your school to continue
            </p>
          )}
          <div className="flex justify-between">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <Button disabled={!canProceed} onClick={() => setStep(2)}>
                Continue
              </Button>
            ) : (
              <Button disabled={!canProceed} onClick={handleFinish}>
                Open studio
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
