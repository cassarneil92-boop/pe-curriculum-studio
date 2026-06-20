"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { QuickActionCard } from "@/components/design/QuickActionCard";
import { useApp } from "@/components/providers/AppProvider";
import { Card, CardHeader } from "@/components/ui/Card";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { formatShortDate, parseIso, startOfWeek, toIso, addDays } from "@/lib/calendar/dates";
import {
  buildDashboardAttention,
  buildDashboardCurrentScheme,
  buildDashboardWeekStats,
  buildQuickContinue,
  buildSchemesNeedingAttention,
  buildTeachingSnapshot,
  buildTodaysLessons,
  buildUpcomingLessons,
  countUnplannedOutcomeWarnings,
} from "@/lib/dashboard/insights";
import {
  buildTeacherPersonalisation,
  formatWeeklyLessonSummary,
} from "@/lib/design/personalisation";
import { getCoverageScore } from "@/lib/progress/coverage-score";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { data } = useApp();
  const { teacher, calendar, schemes, lessons } = data;
  const { context } = useTeacherContext();
  const today = todayIso();
  const personal = buildTeacherPersonalisation(teacher, context.roleLabel);

  const weekStart = toIso(startOfWeek(new Date()));
  const weekEnd = toIso(addDays(startOfWeek(new Date()), 6));

  const weekStats = useMemo(
    () => buildDashboardWeekStats(calendar, weekStart, weekEnd),
    [calendar, weekStart, weekEnd]
  );

  const teachingSnapshot = useMemo(
    () => buildTeachingSnapshot({ lessons, schemes, calendar }),
    [lessons, schemes, calendar]
  );

  const todaysLessons = useMemo(() => buildTodaysLessons(calendar, today), [calendar, today]);

  const currentScheme = useMemo(
    () => buildDashboardCurrentScheme(schemes, calendar, today),
    [schemes, calendar, today]
  );

  const upcomingLessons = useMemo(
    () => buildUpcomingLessons(calendar, today, 4),
    [calendar, today]
  );

  const quickContinue = useMemo(
    () => buildQuickContinue({ lessons, schemes, resources: data.resources }),
    [lessons, schemes, data.resources]
  );

  const schemeAttention = useMemo(() => buildSchemesNeedingAttention(schemes), [schemes]);

  const unplannedCount = useMemo(
    () => countUnplannedOutcomeWarnings(lessons, schemes, calendar),
    [lessons, schemes, calendar]
  );

  const attentionItems = useMemo(
    () => buildDashboardAttention(lessons, schemes, calendar).slice(0, 3),
    [lessons, schemes, calendar]
  );

  const coverageScore = getCoverageScore(teachingSnapshot.curriculumCoverage);

  return (
    <div className="space-y-6">
      <DashboardHero
        personal={personal}
        subtitle={formatWeeklyLessonSummary(weekStats.scheduled)}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Lessons planned" value={teachingSnapshot.lessonsPlanned} tone="teal" />
        <StatCard label="Lessons delivered" value={teachingSnapshot.lessonsDelivered} tone="green" />
        <StatCard label="Schemes active" value={teachingSnapshot.schemesActive} tone="blue" />
        <StatCard
          label="Curriculum coverage"
          value={`${teachingSnapshot.curriculumCoverage}%`}
          tone="amber"
          hint={coverageScore.label}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Today's focus"
            description={
              todaysLessons.length > 0
                ? `${todaysLessons.length} lesson${todaysLessons.length === 1 ? "" : "s"} scheduled today`
                : "Nothing scheduled for today"
            }
            action={
              <Link href="/calendar" className="text-xs font-medium text-teal-700 hover:text-teal-800">
                Open calendar
              </Link>
            }
          />
          <div className="space-y-3">
            {todaysLessons.length > 0 ? (
              <ul className="space-y-2">
                {todaysLessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between gap-3 rounded-[14px] border border-slate-100 bg-slate-50/70 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#0F172A]">{lesson.title}</p>
                      <p className="text-xs text-slate-500">
                        {lesson.time}
                        {lesson.classGroup ? ` · ${lesson.classGroup}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                Plan today&apos;s sessions in Calendar to see them here.
              </p>
            )}

            {(schemeAttention.length > 0 || unplannedCount > 0) && (
              <div className="rounded-[14px] border border-amber-100 bg-amber-50/50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                  Needs attention
                </p>
                <ul className="mt-2 space-y-1.5">
                  {schemeAttention.map((item) => (
                    <li key={item.schemeId} className="text-sm text-amber-900/90">
                      <span className="font-medium">{item.title}</span> — {item.message}
                    </li>
                  ))}
                  {unplannedCount > 0 && (
                    <li className="text-sm text-amber-900/90">
                      {unplannedCount} curriculum {unplannedCount === 1 ? "area" : "areas"} not yet
                      planned
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Curriculum coverage" />
          <div className="flex flex-col items-center gap-4 py-1">
            <CircularProgress
              value={teachingSnapshot.curriculumCoverage}
              variant={coverageScore.barVariant}
              size={104}
            />
            <ProgressBar
              value={teachingSnapshot.curriculumCoverage}
              max={100}
              label="Overall progress"
              variant={coverageScore.barVariant}
              className="w-full"
            />
            <Link href="/curriculum-analytics" className="text-xs font-medium text-teal-700">
              View teaching progress →
            </Link>
          </div>
        </Card>
      </section>

      {quickContinue && (
        <Card className="border-teal-100/80 bg-gradient-to-br from-teal-50/35 to-white">
          <CardHeader title="Quick continue" description="Pick up where you left off" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700/70">
                Most recently edited · {quickContinue.subtitle}
              </p>
              <p className="mt-1 text-lg font-semibold text-[#0F172A]">{quickContinue.title}</p>
            </div>
            <Link href={quickContinue.href}>
              <Button>Continue editing</Button>
            </Link>
          </div>
        </Card>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader
            title="This week"
            action={
              <Link href="/calendar" className="text-xs font-medium text-teal-700">
                Calendar
              </Link>
            }
          />
          <div className="mb-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p className="text-xl font-bold text-[#0F172A]">{weekStats.scheduled}</p>
              <p className="text-xs text-slate-500">Planned</p>
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-700">{weekStats.delivered}</p>
              <p className="text-xs text-slate-500">Delivered</p>
            </div>
            <div>
              <p className="text-xl font-bold text-amber-700">
                {Math.max(0, weekStats.scheduled - weekStats.delivered)}
              </p>
              <p className="text-xs text-slate-500">Remaining</p>
            </div>
          </div>
          <ProgressBar
            value={weekStats.delivered}
            max={weekStats.scheduled || 1}
            fractionLabel={`${weekStats.delivered} / ${weekStats.scheduled} delivered`}
            showPercent={false}
            variant="green"
          />
        </Card>

        <Card>
          <CardHeader
            title="Current scheme"
            action={
              currentScheme ? (
                <Link href="/schemes" className="text-xs font-medium text-teal-700">
                  Open
                </Link>
              ) : undefined
            }
          />
          {currentScheme ? (
            <div className="space-y-3">
              <p className="font-semibold text-[#0F172A]">{currentScheme.title}</p>
              <ProgressBar
                value={currentScheme.completedLessons}
                max={currentScheme.totalLessons || 1}
                fractionLabel={`${currentScheme.completedLessons} / ${currentScheme.totalLessons} lessons`}
                showPercent={false}
                variant="teal"
              />
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No active scheme.{" "}
              <Link href="/schemes" className="font-medium text-teal-700">
                Start planning
              </Link>
            </p>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Upcoming"
            action={
              <Link href="/calendar" className="text-xs font-medium text-teal-700">
                View all
              </Link>
            }
          />
          {upcomingLessons.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing scheduled ahead.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingLessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="rounded-[14px] border border-slate-100 bg-slate-50/60 px-3 py-2"
                >
                  <p className="text-sm font-medium text-[#0F172A]">{lesson.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatShortDate(parseIso(lesson.date))}
                    {lesson.time !== "All day" ? ` · ${lesson.time}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {attentionItems.length > 0 && (
        <Card className="border-amber-100 bg-amber-50/25">
          <CardHeader
            title="Teaching reminders"
            action={
              <Link href="/curriculum-analytics" className="text-xs font-medium text-teal-700">
                Teaching Progress
              </Link>
            }
          />
          <ul className="space-y-1.5">
            {attentionItems.map((item) => (
              <li key={item.id} className="text-sm text-slate-700">
                {item.message}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <section>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            href="/calendar"
            title="Schedule week"
            description="Week view planning"
            accent="green"
            icon={<span aria-hidden>📅</span>}
          />
          <QuickActionCard
            href="/lesson-builder"
            title="Build lesson"
            description="Curriculum-aligned plan"
            accent="blue"
            icon={<span aria-hidden>✏️</span>}
          />
          <QuickActionCard
            href="/schemes"
            title="Schemes"
            description="Term-long units"
            accent="purple"
            icon={<span aria-hidden>📋</span>}
          />
          <QuickActionCard
            href="/curriculum-analytics"
            title="Progress"
            description="Coverage & warnings"
            accent="amber"
            icon={<span aria-hidden>📊</span>}
          />
        </div>
      </section>

      {!context.exploreAllEnabled && (
        <p className="text-xs text-slate-400">
          Intelligent Mode ·{" "}
          <Link href="/settings" className="text-teal-600 hover:underline">
            Settings
          </Link>
        </p>
      )}
    </div>
  );
}
