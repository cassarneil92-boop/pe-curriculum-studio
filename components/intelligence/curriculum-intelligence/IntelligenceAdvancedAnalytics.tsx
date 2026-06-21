"use client";

import {
  CurriculumGapsPanel,
  IntelligenceExportButton,
  LearningAreaTermHeatmap,
  TopicCoverageBars,
} from "@/components/intelligence/curriculum-intelligence";
import { TeachingInsightsPanel } from "@/components/progress/teaching-progress";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import type { CurriculumIntelligenceReport } from "@/lib/progress/curriculum-intelligence";
import type { IntelligenceExportContext } from "@/lib/progress/curriculum-intelligence";
import { getTopTopicCoverageRows } from "@/lib/progress/curriculum-intelligence";

interface IntelligenceAdvancedAnalyticsProps {
  report: CurriculumIntelligenceReport;
  exportContext: IntelligenceExportContext;
}

export function IntelligenceAdvancedAnalytics({
  report,
  exportContext,
}: IntelligenceAdvancedAnalyticsProps) {
  const { kpis } = report;
  const topicBars = getTopTopicCoverageRows(report.topicRows);

  return (
    <details className="rounded-[20px] border border-slate-200 bg-white">
      <summary className="cursor-pointer list-none px-6 py-4 text-sm font-semibold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
        ▶ Advanced Insights
        <span className="ml-2 text-xs font-normal text-slate-500">
          Heatmaps, progress KPIs, pathway analysis, and detailed tables
        </span>
      </summary>
      <div className="space-y-6 border-t border-slate-100 px-6 py-4">
        <div className="flex justify-end">
          <IntelligenceExportButton report={report} context={exportContext} />
        </div>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total outcomes" value={kpis.totalOutcomes} hint="In your curriculum corpus" />
          <StatCard label="Planned" value={kpis.plannedOutcomes} hint="Linked to lessons and schemes" tone="blue" />
          <StatCard label="Delivered" value={kpis.deliveredOutcomes} hint="Marked as taught" tone="green" />
          <StatCard label="Remaining" value={kpis.remainingOutcomes} hint="Not yet delivered" tone="amber" />
          <StatCard
            label="Overall coverage"
            value={`${kpis.overallCoveragePercent}%`}
            hint="Delivered vs total corpus"
            tone="teal"
          />
        </section>

        <Card>
          <CardHeader
            title="Curriculum heatmap"
            description="Learning area delivery by term."
          />
          <LearningAreaTermHeatmap cells={report.heatmap} termNames={report.termNames} />
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <CurriculumGapsPanel gaps={report.gaps} />
          <Card>
            <CardHeader title="Coverage by topic" description="Detailed topic breakdown." />
            <TopicCoverageBars rows={topicBars} />
          </Card>
        </div>

        <Card>
          <CardHeader title="Teaching insights" description="Detailed analytics insights." />
          <TeachingInsightsPanel insights={report.insights} />
        </Card>

        <Card className="border-slate-200/80 bg-slate-50/50">
          <CardHeader title="Pathway & year group snapshot" />
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                By pathway
              </p>
              <ul className="space-y-2">
                {report.taught.byPathway
                  .filter((s) => s.totalOutcomes > 0)
                  .slice(0, 6)
                  .map((slice) => (
                    <li
                      key={slice.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="truncate text-slate-700">{slice.label}</span>
                      <span className="shrink-0 tabular-nums font-medium text-slate-900">
                        {slice.coveragePercent}%
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                By year group
              </p>
              <ul className="space-y-2">
                {report.taught.byYearGroup
                  .filter((s) => s.totalOutcomes > 0)
                  .slice(0, 6)
                  .map((slice) => (
                    <li
                      key={slice.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="truncate text-slate-700">{slice.label}</span>
                      <span className="shrink-0 tabular-nums font-medium text-slate-900">
                        {slice.coveragePercent}%
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </details>
  );
}
