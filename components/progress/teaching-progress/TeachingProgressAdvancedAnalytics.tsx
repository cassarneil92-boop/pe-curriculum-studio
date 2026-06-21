"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CoverageBar } from "@/components/intelligence/CoverageBar";
import {
  CurriculumHealthHero,
  CurriculumJourney,
  ImmediatePriorities,
  TeachingInsightsPanel,
  TopicCoverageTable,
} from "@/components/progress/teaching-progress";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import type { CurriculumAnalyticsReport } from "@/src/lib/intelligence/analytics/coverage-analytics";
import type { CurriculumHealthScore, PriorityTopic, TopicCoverageRow } from "@/lib/progress/teaching-progress-ui";
import { buildTeachingInsights } from "@/lib/progress/teaching-progress-ui";
import type { LessonPlan, SchemeOfWork } from "@/lib/types";
import { buildSchemeProgressSummary } from "@/lib/progress/summary";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { schemeDisplayTitle } from "@/lib/scheme-builder/helpers";

interface TeachingProgressAdvancedAnalyticsProps {
  taught: CurriculumAnalyticsReport;
  planned: CurriculumAnalyticsReport;
  health: CurriculumHealthScore;
  priorities: PriorityTopic[];
  topicRows: TopicCoverageRow[];
  lessons: LessonPlan[];
  schemes: SchemeOfWork[];
}

function KpiIcon({ children }: { children: ReactNode }) {
  return (
    <span className="text-teal-700" aria-hidden>
      {children}
    </span>
  );
}

export function TeachingProgressAdvancedAnalytics({
  taught,
  planned,
  health,
  priorities,
  topicRows,
  lessons,
  schemes,
}: TeachingProgressAdvancedAnalyticsProps) {
  const insights = buildTeachingInsights(taught, planned, lessons, schemes);

  return (
    <details className="rounded-[20px] border border-slate-200 bg-white">
      <summary className="cursor-pointer list-none px-6 py-4 text-sm font-semibold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
        ▶ Advanced Delivery Analytics
        <span className="ml-2 text-xs font-normal text-slate-500">
          Outcome tables, coverage breakdowns, and detailed progress data
        </span>
      </summary>
      <div className="space-y-6 border-t border-slate-100 px-6 py-4">
        <CurriculumHealthHero health={health} />

        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Planned outcomes"
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
            label="Delivered outcomes"
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
            label="Remaining outcomes"
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

        <ImmediatePriorities priorities={priorities} />

        <TopicCoverageTable rows={topicRows} />

        {schemes.length > 0 && (
          <Card>
            <CardHeader
              title="All scheme delivery"
              description="Lessons marked delivered within each scheme of work."
            />
            <div className="space-y-4">
              {schemes.slice(0, 12).map((scheme) => {
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

          <Card>
            <CardHeader title="Teaching insights" description="Detailed analytics insights." />
            <TeachingInsightsPanel insights={insights} />
          </Card>
        </div>

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
            . For planning recommendations, open{" "}
            <Link href="/curriculum-intelligence" className="font-medium text-teal-700 hover:text-teal-800">
              Planning Insights
            </Link>
            .
          </p>
        </Card>
      </div>
    </details>
  );
}
