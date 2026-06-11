"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BrandLogoHorizontal } from "@/components/brand/BrandLogoHorizontal";
import { useApp } from "@/components/providers/AppProvider";
import { QuickActionCard } from "@/components/design/QuickActionCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { formatShortDate, parseIso, startOfWeek, toIso, addDays } from "@/lib/calendar/dates";
import {
  buildDashboardAttention,
  buildDashboardCurrentScheme,
  buildDashboardWeekStats,
  buildUpcomingLessons,
} from "@/lib/dashboard/insights";
import { getTeacherGreetingName, getTimeGreeting } from "@/lib/design/greeting";
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { data } = useApp();
  const { teacher, calendar, schemes } = data;
  const { context } = useTeacherContext();
  const today = todayIso();
  const greetingName = getTeacherGreetingName(teacher);

  const weekStart = toIso(startOfWeek(new Date()));
  const weekEnd = toIso(addDays(startOfWeek(new Date()), 6));

  const weekStats = useMemo(
    () => buildDashboardWeekStats(calendar, weekStart, weekEnd),
    [calendar, weekStart, weekEnd]
  );

  const weekRemaining = Math.max(0, weekStats.scheduled - weekStats.delivered);

  const currentScheme = useMemo(
    () => buildDashboardCurrentScheme(schemes, calendar, today),
    [schemes, calendar, today]
  );

  const upcomingLessons = useMemo(
    () => buildUpcomingLessons(calendar, today, 5),
    [calendar, today]
  );

  const attentionItems = useMemo(
    () => buildDashboardAttention(data.lessons, schemes, calendar).slice(0, 3),
    [data.lessons, schemes, calendar]
  );

  return (
    <div className="space-y-8">
      <div className="opacity-90">
        <BrandLogoHorizontal height={32} />
      </div>

      <header>
        <p className="text-base font-medium text-teal-700">
          {getTimeGreeting()}, {greetingName} 👋
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          What do you teach next?
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Your week at a glance — plan, deliver, and track progress.
        </p>
      </header>

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
              <p className="text-lg font-semibold text-slate-900">{weekStats.scheduled}</p>
              <p className="text-xs text-slate-500">Planned</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-emerald-700">{weekStats.delivered}</p>
              <p className="text-xs text-slate-500">Delivered</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-amber-700">{weekRemaining}</p>
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
              <p className="font-semibold text-slate-900">{currentScheme.title}</p>
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
                Create one
              </Link>{" "}
              and schedule lessons on your calendar.
            </p>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Upcoming lessons"
            action={
              <Link href="/calendar" className="text-xs font-medium text-teal-700">
                View all
              </Link>
            }
          />
          {upcomingLessons.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing scheduled ahead. Plan your week in Calendar.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingLessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2"
                >
                  <p className="text-sm font-medium text-slate-800">{lesson.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatShortDate(parseIso(lesson.date))}
                    {lesson.time !== "All day" ? ` · ${lesson.time}` : ""}
                    {lesson.classGroup ? ` · ${lesson.classGroup}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {attentionItems.length > 0 && (
        <Card className="border-amber-100 bg-amber-50/30">
          <CardHeader
            title="Needs attention"
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
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            href="/calendar"
            title="Schedule week"
            description="Week view planning"
            accent="green"
            icon={<span>📅</span>}
          />
          <QuickActionCard
            href="/lesson-builder"
            title="Build lesson"
            description="Curriculum-aligned plan"
            accent="blue"
            icon={<span>✏️</span>}
          />
          <QuickActionCard
            href="/schemes"
            title="Schemes"
            description="Term-long units"
            accent="purple"
            icon={<span>📋</span>}
          />
          <QuickActionCard
            href="/curriculum-analytics"
            title="Progress"
            description="Coverage & warnings"
            accent="amber"
            icon={<span>📊</span>}
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
