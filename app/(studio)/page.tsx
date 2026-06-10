"use client";

import Link from "next/link";
import { useMemo } from "react";
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
import { resolveSchoolDisplayName } from "@/src/lib/schools";
import { IMPORTED_LEARNING_OUTCOMES } from "@/src/lib/curriculum/coverage";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { data } = useApp();
  const { context } = useTeacherContext();
  const { teacher, lessons, calendar } = data;
  const schoolName = resolveSchoolDisplayName(teacher.school, teacher.manualSchoolName);
  const today = todayIso();
  const displayName = getTeacherDisplayName(schoolName, teacher.manualSchoolName);

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
      if (entry.startDate <= today && (!entry.endDate || entry.endDate >= today)) {
        items.push({
          id: entry.id,
          title: entry.title,
          time: entry.startDate,
          group: getYearGroupLabel(entry.yearGroup),
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
      <header>
        <p className="text-sm font-medium text-teal-700">
          {getTimeGreeting()}, {displayName}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Today&apos;s teaching
        </h1>
        <p className="mt-2 max-w-xl text-base text-slate-500">
          A calm view of what matters now — your lessons, context, and next steps.
        </p>
      </header>

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
              No lessons scheduled for today. Add one in{" "}
              <Link href="/lesson-builder" className="font-medium text-teal-700">
                Lesson Builder
              </Link>{" "}
              or{" "}
              <Link href="/calendar" className="font-medium text-teal-700">
                Calendar
              </Link>
              .
            </p>
          </Card>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {todaysLessons.map((lesson) => {
              const theme = getTopicTheme(lesson.topic);
              return (
                <div
                  key={lesson.id}
                  className={`min-w-[280px] shrink-0 rounded-2xl border p-5 shadow-sm ${theme.border} ${theme.bg}`}
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
            href="/curriculum"
            title="Curriculum Hub"
            description="Browse topics and learning outcomes for your pathways."
            accent="teal"
            icon={<span>📚</span>}
          />
          <QuickActionCard
            href="/lesson-builder"
            title="Lesson Builder"
            description="Build a lesson with strict curriculum alignment."
            accent="blue"
            icon={<span>✏️</span>}
          />
          <QuickActionCard
            href="/schemes"
            title="Schemes of Work"
            description="Plan term units with linked learning outcomes."
            accent="purple"
            icon={<span>📋</span>}
          />
          <QuickActionCard
            href="/calendar"
            title="Calendar"
            description="Map your week and teaching rhythm."
            accent="green"
            icon={<span>📅</span>}
          />
          <QuickActionCard
            href="/resources"
            title="Resources"
            description="Keep equipment lists and files close at hand."
            accent="amber"
            icon={<span>📁</span>}
          />
        </div>
      </section>

      <section>
        <Card>
          <CardHeader
            title="Curriculum at a glance"
            description="Imported outcomes visible in your current teaching context."
            action={
              <Link href="/curriculum-coverage" className="text-sm font-medium text-teal-700">
                Full coverage
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
            <div className="hidden flex-1 sm:block">
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all"
                  style={{
                    width: `${coverage.total ? (coverage.visible / coverage.total) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {context.exploreAllEnabled ? "Explore All active" : context.roleLabel}
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
