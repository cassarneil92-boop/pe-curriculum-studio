"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { CoverageBar } from "@/components/intelligence/CoverageBar";
import { CoverageHeatmap } from "@/components/intelligence/CoverageHeatmap";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { buildTeachingWarnings } from "@/lib/progress/warnings";
import {
  buildCurriculumAnalytics,
  type CoverageMode,
} from "@/src/lib/intelligence/analytics/coverage-analytics";

const MODE_LABELS: Record<CoverageMode, string> = {
  planned: "Planned coverage",
  taught: "Taught coverage",
  remaining: "Remaining to teach",
};

export default function CurriculumAnalyticsPage() {
  const { data } = useApp();
  const [mode, setMode] = useState<CoverageMode>("taught");

  const report = useMemo(
    () => buildCurriculumAnalytics(data.lessons, data.schemes, undefined, mode, data.calendar),
    [data.lessons, data.schemes, data.calendar, mode]
  );

  const warnings = useMemo(
    () => buildTeachingWarnings(data.lessons, data.schemes, data.calendar),
    [data.lessons, data.schemes, data.calendar]
  );

  return (
    <div>
      <PageHeader
        title="Teaching Progress"
        description="See what you have planned, what you have delivered, and what is still left to teach."
      />

      <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Only lessons marked <strong>delivered</strong> count as taught. Planned lessons and schemes
        show intended coverage only. Mark delivery from{" "}
        <Link href="/calendar" className="font-medium text-teal-700 hover:text-teal-800">
          Calendar
        </Link>
        ,{" "}
        <Link href="/lessons" className="font-medium text-teal-700 hover:text-teal-800">
          Lesson Plans
        </Link>
        , or{" "}
        <Link href="/schemes" className="font-medium text-teal-700 hover:text-teal-800">
          Schemes of Work
        </Link>
        . Official curriculum wording is never modified.
      </p>

      {warnings.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50/40">
          <CardHeader
            title="Topics needing attention"
            description="Automatic checks based on your planned and delivered lessons."
          />
          <ul className="space-y-2">
            {warnings.map((warning) => (
              <li
                key={warning.id}
                className={`flex items-start gap-2 text-sm ${
                  warning.tone === "rose" ? "text-rose-800" : "text-amber-900"
                }`}
              >
                <span aria-hidden>⚠</span>
                <span>{warning.message}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {(["planned", "taught", "remaining"] as CoverageMode[]).map((value) => (
          <Button
            key={value}
            variant={mode === value ? "primary" : "secondary"}
            onClick={() => setMode(value)}
          >
            {MODE_LABELS[value]}
          </Button>
        ))}
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Planned outcomes" value={String(report.summary.plannedOutcomeIds)} />
        <SummaryCard label="Taught outcomes" value={String(report.summary.taughtOutcomeIds)} />
        <SummaryCard label="Remaining outcomes" value={String(report.summary.remainingOutcomeIds)} />
        <SummaryCard
          label={`${MODE_LABELS[mode]} %`}
          value={`${report.summary.overallCoveragePercent}%`}
        />
      </section>

      {report.underrepresented.length > 0 && mode !== "planned" && (
        <Card className="mb-6 border-amber-100 bg-amber-50/30">
          <CardHeader
            title="Topics needing attention"
            description="Low coverage in your current teaching context."
          />
          <div className="flex flex-wrap gap-2">
            {report.underrepresented.map((s) => (
              <Badge key={s.id} tone="amber">
                {s.label}: {s.modeCount ?? 0}/{s.totalOutcomes}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Topic coverage" description={MODE_LABELS[mode]} />
          <div className="space-y-4">
            {report.byTopic.slice(0, 12).map((slice) => (
              <CoverageBar key={slice.id} slice={slice} />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Learning area coverage" />
          <div className="space-y-4">
            {report.byLearningArea.map((slice) => (
              <CoverageBar key={slice.id} slice={slice} />
            ))}
          </div>
        </Card>
      </div>

      <Card className="mb-8">
        <CoverageHeatmap slices={report.byTopic} title="Topic heat map" />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Holistic development" />
          <div className="space-y-3">
            {report.byHolisticDevelopment.map((slice) => (
              <CoverageBar key={slice.id} slice={slice} />
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Fitness strands" />
          <div className="space-y-3">
            {report.byFitnessStrand.length === 0 ? (
              <p className="text-sm text-slate-500">No fitness-coded outcomes in current data.</p>
            ) : (
              report.byFitnessStrand.map((slice) => (
                <CoverageBar key={slice.id} slice={slice} />
              ))
            )}
          </div>
        </Card>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Metadata quality checks live under{" "}
        <Link href="/settings" className="font-medium text-teal-700 hover:underline">
          Settings → Advanced tools
        </Link>
        .
      </p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </Card>
  );
}
