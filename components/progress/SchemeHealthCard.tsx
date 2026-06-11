"use client";

import { TopicIcon } from "@/components/design/TopicIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  coveragePercentFromSummary,
  getCoverageScore,
  lessonProgressPercent,
} from "@/lib/progress/coverage-score";
import type { SchemeProgressSummary } from "@/lib/progress/summary";
import { getPathwayLabel } from "@/lib/constants";
import { getYearGroupLabel } from "@/lib/year-groups";
import type { SchemeOfWork } from "@/lib/types";
import {
  getSchemeSelectedPathways,
  getSkillName,
  getTopicName,
  schemeDisplayTitle,
} from "@/lib/scheme-builder/helpers";

interface SchemeHealthCardProps {
  scheme: SchemeOfWork;
  summary: SchemeProgressSummary;
  onView: () => void;
  onEdit: () => void;
  onSchedule?: () => void;
  onViewProgress?: () => void;
  onDelete: () => void;
  onExportPdf: () => void;
  onExportWord: () => void;
}

export function SchemeHealthCard({
  scheme,
  summary,
  onView,
  onEdit,
  onSchedule,
  onViewProgress,
  onDelete,
  onExportPdf,
  onExportWord,
}: SchemeHealthCardProps) {
  const topicName = getTopicName(scheme.topicId) || scheme.title;
  const lessonPercent = lessonProgressPercent(summary);
  const coveragePercent = coveragePercentFromSummary(summary);
  const coverageScore = getCoverageScore(coveragePercent);
  const schemePathways = getSchemeSelectedPathways(scheme);

  return (
    <Card padding={false} className="overflow-hidden transition-shadow hover:shadow-md">
      <button type="button" onClick={onView} className="w-full p-5 text-left">
        <div className="flex items-start gap-3">
          <TopicIcon name={topicName} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">{schemeDisplayTitle(scheme)}</p>
            <p className="mt-1 text-sm text-slate-500">
              {scheme.classGroup || "No class set"}
              {scheme.topicId ? ` · ${topicName}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {schemePathways.map((pathwayId) => (
                <Badge key={pathwayId} tone="blue">
                  {getPathwayLabel(pathwayId)}
                </Badge>
              ))}
              <Badge tone="slate">{getYearGroupLabel(scheme.yearGroup)}</Badge>
              {scheme.skillId && <Badge tone="green">{getSkillName(scheme.skillId)}</Badge>}
              <Badge tone={coverageScore.tone}>Coverage: {coverageScore.label}</Badge>
            </div>

            <div className="mt-4">
              <ProgressBar
                value={lessonPercent}
                label="Progress"
                variant={coverageScore.barVariant}
              />
            </div>

            <div className="mt-3 grid gap-1 text-xs text-slate-600">
              <p>
                <span className="font-semibold text-slate-800">Lessons taught:</span>{" "}
                {summary.deliveredLessons} / {summary.totalLessons}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Outcomes taught:</span>{" "}
                {summary.taughtOutcomes} / {summary.plannedOutcomes}
              </p>
            </div>
          </div>
        </div>
      </button>

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/50 px-4 py-3">
        {onSchedule && (
          <Button variant="primary" className="h-8 text-xs" onClick={onSchedule}>
            Schedule scheme
          </Button>
        )}
        <Button variant="secondary" className="h-8 text-xs" onClick={onEdit}>
          Continue planning
        </Button>
        <Button variant="ghost" className="h-8 text-xs" onClick={onView}>
          View
        </Button>
        {onViewProgress && (
          <Button variant="ghost" className="h-8 text-xs" onClick={onViewProgress}>
            View progress
          </Button>
        )}
        <Button variant="ghost" className="h-8 text-xs" onClick={onExportPdf}>
          PDF
        </Button>
        <Button variant="ghost" className="h-8 text-xs" onClick={onExportWord}>
          Word
        </Button>
        <Button
          variant="ghost"
          className="ml-auto h-8 text-xs text-rose-600"
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}
