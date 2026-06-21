"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApp } from "@/components/providers/AppProvider";
import {
  AreasStillMissingPanel,
  CurrentSchemesPanel,
  CurriculumAreaBars,
  TeachingProgressAdvancedAnalytics,
  TeachingProgressOverview,
  TeachingProgressQuickActions,
  UpcomingTeachingPanel,
} from "@/components/progress/teaching-progress";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { TeachingProgressIllustration } from "@/components/ui/EmptyIllustrations";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  buildImmediatePriorities,
  buildTeachingProgressReports,
  buildTopicCoverageRows,
  computeDeliveredPercent,
  getCurriculumHealthScore,
  hasTeachingProgressData,
} from "@/lib/progress/teaching-progress-ui";
import { buildTeachingProgressTeacherView } from "@/lib/progress/teaching-progress-teacher-view";

export default function CurriculumAnalyticsPage() {
  const { data } = useApp();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

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

  const teacherView = useMemo(
    () =>
      buildTeachingProgressTeacherView(
        data.lessons,
        data.schemes,
        data.calendar,
        taught,
        today
      ),
    [data.lessons, data.schemes, data.calendar, taught, today]
  );

  const hasData = hasTeachingProgressData(data.lessons, data.schemes);

  if (!hasData) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Teaching progress"
          title="Teaching Progress"
          description="Track planned lessons, delivered lessons, and active schemes."
        />
        <EmptyState
          title="No teaching data yet"
          description="Create your first lesson or scheme to start tracking what you have planned and delivered."
          icon={<TeachingProgressIllustration />}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/lesson-builder">
                <Button>Create Lesson</Button>
              </Link>
              <Link href="/schemes?create=1">
                <Button variant="secondary">Create Scheme</Button>
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
        eyebrow="Teaching progress"
        title="Teaching Progress"
        description="Track planned lessons, delivered lessons, active schemes, and upcoming teaching."
        action={
          <Link href="/curriculum-intelligence">
            <Button variant="secondary">What to teach next →</Button>
          </Link>
        }
      />

      <TeachingProgressOverview overview={teacherView.overview} />
      <CurrentSchemesPanel schemes={teacherView.activeSchemes} />
      <UpcomingTeachingPanel lessons={teacherView.upcomingLessons} />
      <CurriculumAreaBars items={teacherView.areasCovered} />
      <AreasStillMissingPanel areas={teacherView.areasMissing} />
      <TeachingProgressQuickActions actions={teacherView.quickActions} />

      <TeachingProgressAdvancedAnalytics
        taught={taught}
        planned={planned}
        health={health}
        priorities={priorities}
        topicRows={topicRows}
        lessons={data.lessons}
        schemes={data.schemes}
      />
    </div>
  );
}
