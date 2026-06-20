"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { CoverageBar } from "@/components/intelligence/CoverageBar";
import { CurriculumHealthHero } from "@/components/progress/teaching-progress/CurriculumHealthHero";
import { CurriculumJourney } from "@/components/progress/teaching-progress/CurriculumJourney";
import { ImmediatePriorities } from "@/components/progress/teaching-progress/ImmediatePriorities";
import { TeachingInsightsPanel } from "@/components/progress/teaching-progress/TeachingInsightsPanel";
import { TopicCoverageTable } from "@/components/progress/teaching-progress/TopicCoverageTable";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TeachingProgressIllustration } from "@/components/ui/EmptyIllustrations";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import { buildSchemeProgressSummary } from "@/lib/progress/summary";
import {
  buildImmediatePriorities,
  buildTeachingInsights,
  buildTeachingProgressReports,
  buildTopicCoverageRows,
  computeDeliveredPercent,
  getCurriculumHealthScore,
  hasTeachingProgressData,
} from "@/lib/progress/teaching-progress-ui";
import { schemeDisplayTitle } from "@/lib/scheme-builder/helpers";

function KpiIcon({ children }: { children: ReactNode }) {
  return (
    <span className="text-teal-700" aria-hidden>
      {children}
    </span>
  );
}

export default function CurriculumAnalyticsPage() {
  const { data } = useApp();

  const reports = useMemo(
    () => buildTeachingProgressReports(data.lessons, data.schemes, data.calendar),
    [data.lessons, data.schemes, data.calendar]
  );

  const { taught, planned } = reports;

  const topicRows = useMemo(
    () => buildTopicCoverageRows(taught, planned),
    [taught, planned]
  );

  const health = useMemo(
    () => getCurriculumHealthScore(computeDeliveredPercent(taught)),
    [taught]
  );

  const priorities = useMemo(() => buildImmediatePriorities(topicRows), [topicRows]);

  const insights = useMemo(
    () => buildTeachingInsights(taught, planned, data.lessons, data.schemes),
    [taught, planned, data.lessons, data.schemes]
  );

  const hasData = hasTeachingProgressData(data.lessons, data.schemes);

  if (!hasData) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Curriculum intelligence"
          title="Teaching Progress"
          description="Understand your curriculum health, delivery coverage, and what to teach next."
        />
        <EmptyState
          title="Start planning your curriculum"
          description="Create lessons or schemes of work to begin tracking curriculum coverage."
          icon={<TeachingProgressIllustration />}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/lesson-builder">
                <Button>Create lesson</Button>
              </Link>
              <Link href="/schemes">
                <Button variant="secondary">Create scheme</Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Curriculum intelligence"
        title="Teaching Progress"
        description="Am I doing well? What should I teach next? Your curriculum health at a glance."
      />

      <CurriculumHealthHero health={health} />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Planned"
          value={taught.summary.plannedOutcomeIds}
          hint="Outcomes in your lessons and schemes"
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
          value={taught.summary.taughtOutcomeIds}
          hint="Outcomes from delivered lessons"
          tone="green"
          icon={
            <KpiIcon>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </KpiIcon>
          }
        />
        <StatCard
          label="Remaining"
          value={taught.summary.remainingOutcomeIds}
          hint="Still to deliver across curriculum"
          tone="amber"
          icon={
            <KpiIcon>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </KpiIcon>
          }
        />
      </section>

      <CurriculumJourney
        planned={taught.summary.plannedOutcomeIds}
        delivered={taught.summary.taughtOutcomeIds}
        remaining={taught.summary.remainingOutcomeIds}
        total={taught.summary.totalCurriculumOutcomes}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ImmediatePriorities priorities={priorities} />
        </div>
        <div className="lg:col-span-2">
          <TeachingInsightsPanel insights={insights} />
        </div>
      </div>

      <TopicCoverageTable rows={topicRows} />

      {data.schemes.length > 0 && (
        <Card>
          <CardHeader
            title="Scheme delivery"
            description="Lessons marked delivered within each scheme of work."
          />
          <div className="space-y-4">
            {data.schemes.slice(0, 8).map((scheme) => {
              const summary = buildSchemeProgressSummary(scheme);
              const percent =
                summary.totalLessons > 0
                  ? Math.round((summary.deliveredLessons / summary.totalLessons) * 100)
                  : 0;
              return (
                <ProgressBar
                  key={scheme.id}
                  label={schemeDisplayTitle(scheme)}
                  value={summary.deliveredLessons}
                  max={summary.totalLessons || 1}
                  fractionLabel={`${summary.deliveredLessons} / ${summary.totalLessons} · ${percent}%`}
                  showPercent={false}
                  variant={percent >= 80 ? "green" : "teal"}
                />
              );
            })}
          </div>
        </Card>
      )}

      <div className="border-t border-slate-200/80 pt-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Detailed breakdown
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Learning areas" description="Delivered coverage by learning area." />
            <div className="space-y-4">
              {taught.byLearningArea.map((slice) => (
                <CoverageBar key={slice.id} slice={slice} />
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Holistic development" description="Delivered coverage across holistic strands." />
            <div className="space-y-4">
              {taught.byHolisticDevelopment.map((slice) => (
                <CoverageBar key={slice.id} slice={slice} />
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Fitness strands" description="Health-related fitness coverage." />
            <div className="space-y-4">
              {taught.byFitnessStrand.length === 0 ? (
                <p className="text-sm text-slate-500">No fitness-coded outcomes in current data.</p>
              ) : (
                taught.byFitnessStrand.map((slice) => (
                  <CoverageBar key={slice.id} slice={slice} />
                ))
              )}
            </div>
          </Card>

          <Card className="bg-slate-50/50">
            <CardHeader title="How delivery is counted" />
            <p className="text-sm leading-relaxed text-slate-600">
              Only lessons marked <strong>delivered</strong> count as taught. Planned lessons and
              schemes show intended coverage only. Mark delivery from{" "}
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
          </Card>
        </div>
      </div>
    </div>
  );
}
