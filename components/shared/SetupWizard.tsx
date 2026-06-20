"use client";

import { useState } from "react";
import { BrandLogoFull } from "@/components/brand/BrandLogoFull";
import { useApp } from "@/components/providers/AppProvider";
import { SchoolSetupFields } from "@/components/shared/SchoolSetupFields";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { isTeacherSchoolComplete } from "@/src/lib/schools";

const FEATURE_HIGHLIGHTS = [
  {
    icon: "📚",
    title: "Curriculum Aligned Planning",
    description:
      "Create lesson plans and schemes of work linked directly to curriculum outcomes.",
  },
  {
    icon: "📊",
    title: "Teaching Progress",
    description:
      "Track what has been planned, delivered and still needs attention.",
  },
  {
    icon: "🎯",
    title: "Curriculum Coverage",
    description:
      "Identify gaps, monitor coverage and support balanced curriculum delivery.",
  },
  {
    icon: "📁",
    title: "Teaching Resources",
    description:
      "Organise lesson cards, assessments and teaching materials in one place.",
  },
] as const;

const TRUST_ITEMS = [
  "Works offline",
  "No account required",
  "Your data stays on your device",
] as const;

function TrustPanel() {
  return (
    <div className="rounded-2xl border border-teal-100/80 bg-teal-50/40 px-5 py-4">
      <p className="text-sm font-semibold text-teal-900">
        Built around the Malta National Curriculum
      </p>
      <ul className="mt-3 space-y-2">
        {TRUST_ITEMS.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-sm text-teal-800/90">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600/10 text-xs font-bold text-teal-700"
              aria-hidden
            >
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <span className="text-2xl" aria-hidden>
        {icon}
      </span>
      <h3 className="mt-2.5 text-sm font-semibold text-[#0F172A]">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

export function SetupWizard() {
  const { data, updateTeacher, completeSetup } = useApp();
  const [form, setForm] = useState(data.teacher);

  const schoolComplete = isTeacherSchoolComplete(form);

  const handleFinish = () => {
    if (!schoolComplete) return;
    updateTeacher(form);
    completeSetup();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F9FB] via-white to-teal-50/20">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <header className="mx-auto max-w-3xl text-center">
          <BrandLogoFull
            priority
            className="mx-auto max-w-[240px] sm:max-w-[300px] lg:max-w-[360px]"
          />
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700/75">
            Malta
          </p>
          <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-tight text-[#0F172A] sm:text-[40px]">
            PE Curriculum Studio
          </h1>
          <p className="mt-3 text-lg font-medium text-slate-700 sm:text-xl">
            Professional planning for Physical Education teachers in Malta.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Curriculum aligned planning, schemes of work, teaching progress, curriculum coverage
            and resource organisation in one professional workspace.
          </p>
        </header>

        <section
          className="mt-10 grid gap-3 sm:grid-cols-2 lg:mt-12"
          aria-label="Platform features"
        >
          {FEATURE_HIGHLIGHTS.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </section>

        <section className="mt-10 lg:mt-12">
          <Card className="overflow-hidden !p-0">
            <div className="border-b border-slate-100 bg-gradient-to-r from-teal-50/50 to-white px-5 py-5 sm:px-7 sm:py-6">
              <h2 className="text-xl font-semibold tracking-tight text-[#0F172A] sm:text-[22px]">
                Let&apos;s personalise your workspace
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                Select your school context to tailor the platform to your teaching environment.
              </p>
            </div>
            <div className="px-5 py-5 sm:px-7 sm:py-6">
              <SchoolSetupFields
                value={form}
                onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
              />
            </div>
          </Card>
        </section>

        <div className="mt-8 flex flex-col gap-6 lg:mt-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="lg:max-w-sm">
            <TrustPanel />
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            {!schoolComplete && (
              <p className="text-center text-xs text-slate-500 sm:text-right">
                Select your educational setting, college and school to continue.
              </p>
            )}
            <Button
              disabled={!schoolComplete}
              onClick={handleFinish}
              className="w-full px-6 py-3 text-base sm:w-auto sm:min-w-[220px]"
            >
              Enter your workspace
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
