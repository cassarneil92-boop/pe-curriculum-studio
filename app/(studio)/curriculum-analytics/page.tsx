"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { CoverageBar } from "@/components/intelligence/CoverageBar";
import { CoverageHeatmap } from "@/components/intelligence/CoverageHeatmap";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { buildCurriculumAnalytics } from "@/src/lib/intelligence/analytics/coverage-analytics";

export default function CurriculumAnalyticsPage() {
  const { data } = useApp();

  const report = useMemo(
    () => buildCurriculumAnalytics(data.lessons, data.schemes),
    [data.lessons, data.schemes]
  );

  return (
    <div>
      <PageHeader
        title="Curriculum Analytics"
        description="Coverage intelligence from your saved lessons and schemes — compared against the full planning curriculum."
      />

      <p className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Analytics reflect <strong>outcomes you have selected</strong> in lesson plans and schemes.
        Official curriculum wording is never modified.{" "}
        <Link href="/curriculum-coverage" className="font-medium text-teal-700 hover:underline">
          Curriculum Coverage
        </Link>{" "}
        audits imported metadata quality separately.
      </p>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Overall taught coverage" value={`${report.summary.overallCoveragePercent}%`} />
        <SummaryCard label="Outcomes in plans" value={String(report.summary.taughtOutcomeIds)} />
        <SummaryCard label="Lessons analysed" value={String(report.summary.lessonsAnalysed)} />
        <SummaryCard label="Schemes analysed" value={String(report.summary.schemesAnalysed)} />
      </section>

      {report.overrepresented.length > 0 && (
        <Card className="mb-6 border-teal-100 bg-teal-50/30">
          <CardHeader title="Overrepresented topics" description="High teaching frequency relative to curriculum breadth." />
          <div className="flex flex-wrap gap-2">
            {report.overrepresented.map((s) => (
              <Badge key={s.id} tone="teal">
                {s.label} {s.coveragePercent}%
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {report.underrepresented.length > 0 && (
        <Card className="mb-6 border-amber-100 bg-amber-50/30">
          <CardHeader title="Underrepresented topics" description="Curriculum gaps in your current planning." />
          <div className="flex flex-wrap gap-2">
            {report.underrepresented.map((s) => (
              <Badge key={s.id} tone="amber">
                {s.label} {s.coveragePercent}%
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Topic coverage" />
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
