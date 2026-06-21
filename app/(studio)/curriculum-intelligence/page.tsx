"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import {
  CurriculumGapsPanel,
  IntelligenceExportButton,
  LearningAreaTermHeatmap,
  TopicCoverageBars,
} from "@/components/intelligence/curriculum-intelligence";
import { PageHeader } from "@/components/layout/PageHeader";
import { TeachingInsightsPanel } from "@/components/progress/teaching-progress";
import { useApp, useTeacherProfile } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TeachingProgressIllustration } from "@/components/ui/EmptyIllustrations";
import { StatCard } from "@/components/ui/StatCard";
import {
  buildCurriculumIntelligenceReport,
  buildIntelligenceExportMeta,
  getTopTopicCoverageRows,
} from "@/lib/progress/curriculum-intelligence";
import { hasTeachingProgressData } from "@/lib/progress/teaching-progress-ui";
import { getCollegeById, resolveSchoolDisplayName } from "@/src/lib/schools";

function KpiIcon({ children }: { children: ReactNode }) {
  return (
    <span className="text-teal-700" aria-hidden>
      {children}
    </span>
  );
}

export default function CurriculumIntelligencePage() {
  const { data } = useApp();
  const teacher = useTeacherProfile();

  const report = useMemo(
    () =>
      buildCurriculumIntelligenceReport(
        data.lessons,
        data.schemes,
        data.calendar,
        data.academicCalendar
      ),
    [data.lessons, data.schemes, data.calendar, data.academicCalendar]
  );

  const topicBars = useMemo(
    () => getTopTopicCoverageRows(report.topicRows),
    [report.topicRows]
  );

  const exportContext = useMemo(() => {
    const schoolLabel = resolveSchoolDisplayName(teacher.school, teacher.manualSchoolName);
    const collegeLabel = teacher.college
      ? getCollegeById(teacher.college)?.name ?? ""
      : "";
    return buildIntelligenceExportMeta(teacher, schoolLabel, collegeLabel);
  }, [teacher]);

  const hasData = hasTeachingProgressData(data.lessons, data.schemes);

  if (!hasData) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Curriculum intelligence"
          title="Curriculum Intelligence Centre"
          description="What should you teach next and why?"
        />
        <EmptyState
          title="Unlock curriculum recommendations"
          description="Plan a few lessons or schemes first — then we'll suggest what to teach next and where gaps exist."
          icon={<TeachingProgressIllustration />}
          action={
            <Link href="/curriculum-assistant">
              <Button>Ask Planning Assistant</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const { kpis } = report;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Curriculum intelligence"
        title="Curriculum Intelligence Centre"
        description="What should you teach next and why? Recommendations, gaps, and suggested next steps."
        action={
          <IntelligenceExportButton report={report} context={exportContext} />
        }
      />

      <Card className="border-teal-100 bg-teal-50/20">
        <CardHeader
          title="Recommended next steps"
          description="Based on your planned and delivered curriculum."
        />
        <TeachingInsightsPanel insights={report.insights} />
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/schemes">
            <Button variant="secondary">Create scheme</Button>
          </Link>
          <Link href="/lesson-builder">
            <Button variant="ghost">Plan lesson</Button>
          </Link>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <CurriculumGapsPanel gaps={report.gaps} />
        <Card>
          <CardHeader
            title="Coverage by topic"
            description="Topics with the largest delivery gaps."
          />
          <TopicCoverageBars rows={topicBars} />
        </Card>
      </div>

      <details className="group rounded-[20px] border border-slate-200 bg-white">
        <summary className="cursor-pointer list-none px-6 py-4 text-sm font-semibold text-slate-900 marker:content-none">
          Advanced analytics
          <span className="ml-2 text-xs font-normal text-slate-500">Heatmap, KPIs, pathway snapshot</span>
        </summary>
        <div className="space-y-6 border-t border-slate-100 px-6 py-4">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total outcomes"
          value={kpis.totalOutcomes}
          hint="In your curriculum corpus"
          tone="default"
          icon={
            <KpiIcon>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h6" />
              </svg>
            </KpiIcon>
          }
        />
        <StatCard
          label="Planned"
          value={kpis.plannedOutcomes}
          hint="Linked to lessons and schemes"
          tone="blue"
          icon={
            <KpiIcon>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </KpiIcon>
          }
        />
        <StatCard
          label="Delivered"
          value={kpis.deliveredOutcomes}
          hint="Marked as taught"
          tone="green"
          icon={
            <KpiIcon>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </KpiIcon>
          }
        />
        <StatCard
          label="Remaining"
          value={kpis.remainingOutcomes}
          hint="Not yet delivered"
          tone="amber"
          icon={
            <KpiIcon>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </KpiIcon>
          }
        />
        <StatCard
          label="Overall coverage"
          value={`${kpis.overallCoveragePercent}%`}
          hint="Delivered vs total corpus"
          tone="teal"
          icon={
            <KpiIcon>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </KpiIcon>
          }
        />
      </section>

      <Card>
        <CardHeader
          title="Curriculum heatmap"
          description="Learning area delivery by term — green indicates strong coverage, amber moderate, red low or none."
        />
        <LearningAreaTermHeatmap cells={report.heatmap} termNames={report.termNames} />
      </Card>

      <Card className="border-slate-200/80 bg-slate-50/50">
        <CardHeader
          title="Pathway & year group snapshot"
          description="Coverage dimensions from your curriculum analytics engine."
        />
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
    </div>
  );
}
