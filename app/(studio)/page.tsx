"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BrandLogoHorizontal } from "@/components/brand/BrandLogoHorizontal";
import { useApp } from "@/components/providers/AppProvider";
import { QuickActionCard } from "@/components/design/QuickActionCard";
import { TopicIcon } from "@/components/design/TopicIcon";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { getPathwayLabel } from "@/lib/constants";
import { getTeacherDisplayName, getTimeGreeting } from "@/lib/design/greeting";
import { getTopicTheme } from "@/lib/design/topic-theme";
import { getContextualYearGroupLabel } from "@/lib/teacher-context";
import { countImportedOutcomeVisibility } from "@/lib/teacher-context";
import { getYearGroupLabel } from "@/lib/year-groups";
import { getLessonTopicName } from "@/lib/lesson-plans/helpers";
import { migrateAcademicCalendarSettings } from "@/lib/calendar/academic-settings";
import { buildTermUnitBlocks, currentUnitBlock, upcomingUnitBlock } from "@/lib/calendar/pacing";
import { formatShortDate, startOfWeek, termRangeFromSettings, toIso, addDays } from "@/lib/calendar/dates";
import {
  buildDashboardAttention,
  buildDashboardCurrentUnit,
  buildDashboardWeekStats,
} from "@/lib/dashboard/insights";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { lessonsStillToTeach } from "@/lib/progress/delivery";
import { collectRemainingOutcomeIds, collectTaughtOutcomeIds } from "@/lib/progress/coverage";
import { getPlanningOutcomes } from "@/src/lib/curriculum/planning";
import { resolveSchoolDisplayName } from "@/src/lib/schools";
import { IMPORTED_LEARNING_OUTCOMES } from "@/src/lib/curriculum/coverage";
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { data } = useApp();
  const { context } = useTeacherContext();
  const { teacher, lessons, calendar, schemes } = data;
  const schoolName = resolveSchoolDisplayName(teacher.school, teacher.manualSchoolName);
  const today = todayIso();
  const displayName = getTeacherDisplayName(schoolName, teacher.manualSchoolName);

  const weekStart = toIso(startOfWeek(new Date()));
  const weekEnd = toIso(addDays(startOfWeek(new Date()), 6));

  const academicSettings = useMemo(
    () => migrateAcademicCalendarSettings(data.academicCalendar),
    [data.academicCalendar]
  );
  const academicRange = useMemo(
    () => termRangeFromSettings(academicSettings),
    [academicSettings]
  );

  const termBlocks = useMemo(
    () => buildTermUnitBlocks(schemes, calendar),
    [schemes, calendar]
  );

  const schemeLessonsRemaining = useMemo(
    () => schemes.reduce((sum, scheme) => sum + lessonsStillToTeach(scheme), 0),
    [schemes]
  );
  const currentUnit = currentUnitBlock(termBlocks, today);
  const upcomingUnit = upcomingUnitBlock(termBlocks, today);

  const weekStats = useMemo(
    () => buildDashboardWeekStats(calendar, weekStart, weekEnd),
    [calendar, weekStart, weekEnd]
  );

  const dashboardUnit = useMemo(
    () => buildDashboardCurrentUnit(schemes, calendar, today),
    [schemes, calendar, today]
  );

  const attentionItems = useMemo(
    () => buildDashboardAttention(lessons, schemes, calendar),
    [lessons, schemes, calendar]
  );

  const outcomesRemaining = useMemo(() => {
    const taught = collectTaughtOutcomeIds(lessons, schemes, calendar);
    const all = getPlanningOutcomes().map((o) => o.id);
    return collectRemainingOutcomeIds(all, taught).size;
  }, [lessons, schemes, calendar]);

  const todaysLessons = useMemo(() => {
    const items: {
      id: string;
      title: string;
      time: string;
      group: string;
      topic: string;
      source: string;
    }[] = [];

    for (const lesson of lessons) {
      if (lesson.date === today) {
        items.push({
          id: lesson.id,
          title: lesson.title,
          time: `${lesson.duration} min`,
          group: lesson.classGroup || getYearGroupLabel(lesson.yearGroup),
          topic: getLessonTopicName(lesson) || "PE",
          source: "Lesson plan",
        });
      }
    }

    for (const entry of calendar) {
      if (entry.startDate && entry.startDate <= today && (!entry.endDate || entry.endDate >= today)) {
        items.push({
          id: entry.id,
          title: entry.title,
          time: entry.startTime || entry.startDate,
          group: entry.classGroup || getYearGroupLabel(entry.yearGroup),
          topic: entry.sport || entry.title,
          source: "Calendar",
        });
      }
    }

    return items;
  }, [lessons, calendar, today]);

  const coverage = useMemo(
    () => countImportedOutcomeVisibility(IMPORTED_LEARNING_OUTCOMES, context),
    [context]
  );

  return (
    <div className="space-y-10">
      <div className="mb-2">
        <BrandLogoHorizontal height={36} className="opacity-95" />
      </div>
      <header>
        <p className="text-sm font-medium text-teal-700">
          {getTimeGreeting()}, {displayName}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Today&apos;s teaching
        </h1>
        <p className="mt-2 max-w-xl text-base text-slate-500">
          Plan → teach → mark delivered → see progress → adjust future lessons.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Today / This week" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <DashboardStatInline label="Scheduled" value={String(weekStats.scheduled)} />
            <DashboardStatInline label="Delivered" value={String(weekStats.delivered)} />
            <DashboardStatInline label="Skipped / moved" value={String(weekStats.skipped + weekStats.moved)} />
            <DashboardStatInline label="Reflections pending" value={String(weekStats.reflectionsPending)} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Current unit" />
          {dashboardUnit ? (
            <div className="space-y-3">
              <p className="text-lg font-semibold text-slate-900">{dashboardUnit.title}</p>
              <ProgressBar
                value={
                  dashboardUnit.totalLessons > 0
                    ? Math.round(
                        (dashboardUnit.deliveredLessons / dashboardUnit.totalLessons) * 100
                      )
                    : 0
                }
                label="Lessons delivered"
              />
              <p className="text-sm text-slate-600">
                {dashboardUnit.deliveredLessons} / {dashboardUnit.totalLessons} lessons delivered
              </p>
              <p className="text-sm text-slate-600">
                Outcomes taught: {dashboardUnit.taughtOutcomes} / {dashboardUnit.plannedOutcomes}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No active unit yet.{" "}
              <Link href="/schemes" className="font-medium text-teal-700">
                Schedule a scheme
              </Link>{" "}
              to see progress here.
            </p>
          )}
        </Card>

        <Card>
          <CardHeader
            title="What needs attention"
            action={
              <Link href="/curriculum-analytics" className="text-xs font-medium text-teal-700">
                Teaching Progress
              </Link>
            }
          />
          {attentionItems.length === 0 ? (
            <p className="text-sm text-slate-500">You&apos;re on track — nothing urgent right now.</p>
          ) : (
            <ul className="space-y-2">
              {attentionItems.map((item) => (
                <li key={item.id} className="rounded-lg bg-amber-50/60 px-3 py-2 text-sm text-slate-700">
                  {item.message}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStat
          label="Lessons still to teach"
          value={String(schemeLessonsRemaining)}
          hint="Across your schemes of work"
        />
        <DashboardStat
          label="Outcomes remaining"
          value={String(outcomesRemaining)}
          hint="In your teaching context"
        />
        <DashboardStat
          label="Calendar entries"
          value={String(calendar.length)}
          hint="Scheduled and unscheduled"
        />
        <DashboardStat
          label="Resources saved"
          value={String(data.resources.length)}
          hint="In your teaching library"
        />
      </section>

      <p className="-mt-6 text-xs text-slate-500">
        Academic year: {formatShortDate(academicRange.start)} –{" "}
        {formatShortDate(academicRange.end)} ·{" "}
        <Link href="/settings" className="font-medium text-teal-700 hover:text-teal-800">
          Edit in Settings
        </Link>
      </p>

      {upcomingUnit && !currentUnit && (
        <Card className="border-teal-100 bg-teal-50/30">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Upcoming unit:</span> {upcomingUnit.title} starts{" "}
            {upcomingUnit.startDate}
          </p>
        </Card>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Today&apos;s lessons</h2>
          <Link href="/calendar" className="text-sm font-medium text-teal-700 hover:text-teal-800">
            Open calendar
          </Link>
        </div>
        {todaysLessons.length === 0 ? (
          <Card className="border-dashed bg-gradient-to-r from-white to-teal-50/30">
            <p className="text-sm text-slate-600">
              No lessons scheduled for today.{" "}
              <Link href="/calendar" className="font-medium text-teal-700">
                Open Calendar
              </Link>{" "}
              to plan your week.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {todaysLessons.map((lesson) => {
              const theme = getTopicTheme(lesson.topic);
              return (
                <div
                  key={lesson.id}
                  className={`rounded-2xl border p-5 shadow-sm ${theme.border} ${theme.bg}`}
                >
                  <div className="flex items-start gap-3">
                    <TopicIcon name={lesson.topic} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{lesson.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{lesson.group}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-white/80 px-2 py-0.5 font-medium text-slate-600 ring-1 ring-black/5">
                          {lesson.time}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 font-medium ${theme.text}`}>
                          {lesson.topic}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">{lesson.source}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Teaching context</h2>
        <Card>
          <div className="flex flex-wrap gap-2">
            {schoolName && <Badge tone="teal">{schoolName}</Badge>}
            {teacher.yearGroups.map((yg) => (
              <Badge key={yg} tone="slate">
                {getContextualYearGroupLabel(yg, teacher.pathways)}
              </Badge>
            ))}
            {teacher.pathways.map((id) => (
              <Badge key={id} tone="blue">
                {getPathwayLabel(id)}
              </Badge>
            ))}
            <Badge tone={context.exploreAllEnabled ? "amber" : "green"}>
              {context.exploreAllEnabled ? "Explore All Mode" : "Intelligent Mode"}
            </Badge>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            href="/lesson-builder"
            title="Build lesson"
            description="Create a curriculum-aligned lesson plan."
            accent="blue"
            icon={<span>✏️</span>}
          />
          <QuickActionCard
            href="/schemes"
            title="Create scheme"
            description="Plan a term-long unit with linked outcomes."
            accent="purple"
            icon={<span>📋</span>}
          />
          <QuickActionCard
            href="/calendar"
            title="Schedule week"
            description="Drag lessons onto your weekly timetable."
            accent="green"
            icon={<span>📅</span>}
          />
          <QuickActionCard
            href="/curriculum-analytics"
            title="Teaching Progress"
            description="Planned vs taught coverage and warnings."
            accent="amber"
            icon={<span>📊</span>}
          />
          <QuickActionCard
            href="/resources"
            title="Add resource"
            description="Grow your PE teaching library."
            accent="teal"
            icon={<span>📁</span>}
          />
          <QuickActionCard
            href="/curriculum"
            title="Curriculum Hub"
            description="Browse topics and start planning from outcomes."
            accent="teal"
            icon={<span>📚</span>}
          />
        </div>
      </section>

      <section>
        <Card>
          <CardHeader
            title="Curriculum at a glance"
            description="Imported outcomes visible in your current teaching context."
            action={
              <Link href="/curriculum-analytics" className="text-sm font-medium text-teal-700">
                Teaching Progress
              </Link>
            }
          />
          <div className="flex items-end gap-6">
            <div>
              <p className="text-3xl font-semibold text-teal-700">{coverage.visible}</p>
              <p className="text-sm text-slate-500">visible outcomes</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-700">{coverage.total}</p>
              <p className="text-sm text-slate-500">total imported</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-amber-700">{outcomesRemaining}</p>
              <p className="text-sm text-slate-500">outcomes still to teach</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

function DashboardStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </Card>
  );
}

function DashboardStatInline({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
