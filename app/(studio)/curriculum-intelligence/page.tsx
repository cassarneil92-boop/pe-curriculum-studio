"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  IntelligenceAdvancedAnalytics,
  SuggestedNextSteps,
  TeachingBalanceSummary,
  UpcomingOpportunities,
} from "@/components/intelligence/curriculum-intelligence";
import { PageHeader } from "@/components/layout/PageHeader";
import { useApp, useTeacherProfile } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { TeachingProgressIllustration } from "@/components/ui/EmptyIllustrations";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import {
  buildCurriculumIntelligenceReport,
  buildIntelligenceExportMeta,
} from "@/lib/progress/curriculum-intelligence";
import { buildPlanningInsightsView } from "@/lib/progress/planning-insights-view";
import { hasTeachingProgressData } from "@/lib/progress/teaching-progress-ui";
import { getCollegeById, resolveSchoolDisplayName } from "@/src/lib/schools";
import type { YearGroupId } from "@/lib/year-groups";
import { DEFAULT_YEAR_GROUP_ID } from "@/lib/constants";

export default function CurriculumIntelligencePage() {
  const { data } = useApp();
  const teacher = useTeacherProfile();
  const { context } = useTeacherContext();

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

  const yearGroupId = (context.teacher.yearGroups[0] ?? DEFAULT_YEAR_GROUP_ID) as YearGroupId;
  const appPathways = context.visibleAppPathways;

  const insights = useMemo(
    () =>
      buildPlanningInsightsView(
        report,
        data.lessons,
        data.schemes,
        data.calendar,
        appPathways,
        yearGroupId
      ),
    [report, data.lessons, data.schemes, data.calendar, appPathways, yearGroupId]
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
          eyebrow="Planning insights"
          title="Planning Insights"
          description="What should you teach next?"
        />
        <EmptyState
          title="Start planning to unlock insights"
          description="Start planning and delivering lessons to unlock curriculum intelligence."
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
        eyebrow="Planning insights"
        title="Planning Insights"
        description="What should you teach next?"
        action={
          <Link href="/curriculum-analytics">
            <Button variant="secondary">Teaching Progress →</Button>
          </Link>
        }
      />

      <SuggestedNextSteps steps={insights.suggestedSteps} />
      <TeachingBalanceSummary balance={insights.balance} />
      <UpcomingOpportunities opportunities={insights.opportunities} />
      <IntelligenceAdvancedAnalytics report={report} exportContext={exportContext} />
    </div>
  );
}
