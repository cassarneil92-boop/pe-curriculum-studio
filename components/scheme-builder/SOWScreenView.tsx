"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SchemeLearningOutcomeCard } from "@/components/scheme-builder/SchemeLearningOutcomeCard";
import {
  formatWilfLines,
  resolveSchemeLearningOutcomes,
  getLessonCompletionStatus,
  getSchemeSelectedPathways,
  getSkillName,
  getTopicName,
  lessonHasContent,
  schemeDisplayTitle,
} from "@/lib/scheme-builder/helpers";
import { activityLabels, isActivitiesEmpty } from "@/lib/scheme-builder/lesson-actions";
import { getPathwayLabel } from "@/lib/constants";
import { getYearGroupLabel } from "@/lib/year-groups";
import { BrandLogoHorizontal } from "@/components/brand/BrandLogoHorizontal";
import { BRAND_FOOTER } from "@/lib/brand/constants";
import { SchemeLessonDeliveryControls } from "@/components/progress/SchemeLessonDeliveryControls";
import type { LessonDeliveryStatus, SchemeOfWork, SOWLesson } from "@/lib/types";

interface SOWScreenViewProps {
  scheme: SchemeOfWork;
  editableDelivery?: boolean;
  onLessonDeliveryChange?: (
    lessonNumber: number,
    status: LessonDeliveryStatus
  ) => void;
}

type LessonFilter = "all" | "with-content" | "empty";

function activityCount(activities: string): number {
  if (isActivitiesEmpty(activities)) return 0;
  const labels = activityLabels(activities);
  return labels.length > 0 ? labels.length : 1;
}

function lessonPreviewTitle(lesson: SOWLesson): string {
  if (lesson.walt.trim()) return lesson.walt.split("\n")[0]?.trim() ?? "";
  return `Lesson ${lesson.lessonNumber}`;
}

function lessonStatusBadge(lesson: SOWLesson): {
  label: "Empty" | "Partial" | "Ready" | "Delivered";
  tone: "slate" | "amber" | "green";
} {
  if (lesson.deliveryStatus === "delivered") {
    return { label: "Delivered", tone: "green" };
  }

  const status = getLessonCompletionStatus(lesson);
  if (status === "empty") return { label: "Empty", tone: "slate" };
  if (status === "partial") return { label: "Partial", tone: "amber" };
  return { label: "Ready", tone: "green" };
}

function LessonSection({
  title,
  tone,
  children,
  defaultOpen = true,
}: {
  title: string;
  tone: "teal" | "blue" | "purple" | "amber" | "green";
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const tones = {
    teal: "border-teal-100 bg-teal-50/50",
    blue: "border-blue-100 bg-blue-50/40",
    purple: "border-violet-100 bg-violet-50/40",
    amber: "border-amber-100 bg-amber-50/40",
    green: "border-emerald-100 bg-emerald-50/40",
  };

  return (
    <div className={`rounded-xl border ${tones[tone]}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
      >
        <span className="text-xs font-bold uppercase tracking-wide text-slate-700">{title}</span>
        <span className="text-xs text-slate-500">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="border-t border-inherit px-4 py-3 text-sm text-slate-700">{children}</div>
      )}
    </div>
  );
}

function LessonScreenCard({
  lesson,
  expanded,
  onToggle,
  editableDelivery,
  onLessonDeliveryChange,
}: {
  lesson: SOWLesson;
  expanded: boolean;
  onToggle: () => void;
  editableDelivery?: boolean;
  onLessonDeliveryChange?: (lessonNumber: number, status: LessonDeliveryStatus) => void;
}) {
  const resolvedOutcomes = resolveSchemeLearningOutcomes(lesson.learningOutcomeIds);
  const wilf = formatWilfLines(lesson.wilf);
  const status = lessonStatusBadge(lesson);
  const loCount = lesson.learningOutcomeIds.length;
  const actCount = activityCount(lesson.activities);
  const resCount = lesson.resources.length;

  return (
    <Card key={lesson.id} padding={false} className="scheme-lesson-card overflow-hidden">
      <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white">
          {lesson.lessonNumber}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{lessonPreviewTitle(lesson)}</p>
          <p className="truncate text-sm text-slate-500">
            Lesson {lesson.lessonNumber}
            {!expanded && (
              <span className="text-slate-400">
                {" "}
                · {loCount} LO{loCount === 1 ? "" : "s"} · {actCount} activit
                {actCount === 1 ? "y" : "ies"} · {resCount} resource
                {resCount === 1 ? "" : "s"}
              </span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
          <Badge tone={status.tone}>{status.label}</Badge>
          <Button
            variant="ghost"
            className="no-print text-xs"
            onClick={onToggle}
            aria-expanded={expanded}
          >
            {expanded ? "Collapse lesson" : "Expand lesson"}
          </Button>
        </div>
      </div>

      <div
        className={
          expanded
            ? "scheme-lesson-body space-y-3 p-5"
            : "scheme-lesson-body hidden space-y-3 p-5 print:block"
        }
      >
        {editableDelivery && onLessonDeliveryChange && (
          <SchemeLessonDeliveryControls
            lesson={lesson}
            onDeliveryChange={(status) => onLessonDeliveryChange(lesson.lessonNumber, status)}
          />
        )}

        <LessonSection title="Learning Outcomes" tone="teal">
          {resolvedOutcomes.length > 0 ? (
            <div className="space-y-2">
              {resolvedOutcomes.map((outcome) => (
                <SchemeLearningOutcomeCard key={outcome.id} outcome={outcome} />
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No learning outcomes linked.</p>
          )}
        </LessonSection>

        {lesson.walt.trim() && (
          <LessonSection title="Learning Intentions / WALT" tone="blue">
            <p className="whitespace-pre-wrap">{lesson.walt}</p>
          </LessonSection>
        )}

        {wilf.length > 0 && (
          <LessonSection title="WILF — Success Criteria" tone="purple">
            <ol className="list-decimal space-y-1.5 pl-4">
              {wilf.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          </LessonSection>
        )}

        {lesson.activities.trim() && (
          <LessonSection title="Activities" tone="amber">
            <p className="whitespace-pre-wrap">{lesson.activities}</p>
          </LessonSection>
        )}

        {lesson.resources.length > 0 && (
          <LessonSection title="Resources" tone="green">
            <ul className="list-disc space-y-1 pl-4">
              {lesson.resources.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </LessonSection>
        )}
      </div>
    </Card>
  );
}

export function SOWScreenView({
  scheme,
  editableDelivery = false,
  onLessonDeliveryChange,
}: SOWScreenViewProps) {
  const title = schemeDisplayTitle(scheme);
  const topicName = getTopicName(scheme.topicId);
  const skillName = getSkillName(scheme.skillId);
  const pathwayLabels = getSchemeSelectedPathways(scheme).map((id) => getPathwayLabel(id));

  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());
  const [filter, setFilter] = useState<LessonFilter>("all");

  const visibleLessons = useMemo(() => {
    return scheme.lessons.filter((lesson) => {
      if (filter === "with-content") return lessonHasContent(lesson);
      if (filter === "empty") return !lessonHasContent(lesson);
      return true;
    });
  }, [scheme.lessons, filter]);

  const expandAll = () => setCollapsedIds(new Set());
  const collapseAll = () => setCollapsedIds(new Set(visibleLessons.map((l) => l.id)));

  const toggleLesson = (lessonId: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  return (
    <div className="scheme-print-root space-y-6">
      <div className="scheme-print-brand hidden print:block">
        <BrandLogoHorizontal height={36} />
      </div>
      <Card className="scheme-print-header">
        <h2 className="text-xl font-semibold text-teal-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {getYearGroupLabel(scheme.yearGroup)}
          {scheme.classGroup ? ` · ${scheme.classGroup}` : ""} · {scheme.term} ·{" "}
          {pathwayLabels.join(" + ")}
          {topicName ? ` · ${topicName}` : ""}
          {skillName ? ` · ${skillName}` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="slate">{scheme.lessons.length} lessons</Badge>
          <Badge tone="teal">
            {scheme.lessons.filter(lessonHasContent).length} with content
          </Badge>
        </div>
      </Card>

      <div className="no-print flex flex-wrap gap-2">
        <Button variant="secondary" className="text-xs" onClick={expandAll}>
          Expand all lessons
        </Button>
        <Button variant="secondary" className="text-xs" onClick={collapseAll}>
          Collapse all lessons
        </Button>
        <Button
          variant={filter === "with-content" ? "primary" : "secondary"}
          className="text-xs"
          onClick={() => setFilter((f) => (f === "with-content" ? "all" : "with-content"))}
        >
          Show only lessons with content
        </Button>
        <Button
          variant={filter === "empty" ? "primary" : "secondary"}
          className="text-xs"
          onClick={() => setFilter((f) => (f === "empty" ? "all" : "empty"))}
        >
          Show empty lessons
        </Button>
      </div>

      <div className="space-y-4">
        {visibleLessons.length === 0 ? (
          <Card className="text-center">
            <p className="text-sm text-slate-500">No lessons match the current filter.</p>
          </Card>
        ) : (
          visibleLessons.map((lesson) => (
            <LessonScreenCard
              key={lesson.id}
              lesson={lesson}
              expanded={!collapsedIds.has(lesson.id)}
              onToggle={() => toggleLesson(lesson.id)}
              editableDelivery={editableDelivery}
              onLessonDeliveryChange={onLessonDeliveryChange}
            />
          ))
        )}
      </div>

      <p className="scheme-print-footer hidden text-center text-xs text-slate-400 print:block">
        {BRAND_FOOTER}
      </p>
    </div>
  );
}
