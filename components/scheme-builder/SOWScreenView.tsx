"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  formatLearningOutcomesForCell,
  formatWilfLines,
  getSchemeSelectedPathways,
  getSkillName,
  getTopicName,
  lessonHasContent,
  schemeDisplayTitle,
} from "@/lib/scheme-builder/helpers";
import { getPathwayLabel } from "@/lib/constants";
import { getYearGroupLabel } from "@/lib/year-groups";
import type { SchemeOfWork } from "@/lib/types";

interface SOWScreenViewProps {
  scheme: SchemeOfWork;
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
      {open && <div className="border-t border-inherit px-4 py-3 text-sm text-slate-700">{children}</div>}
    </div>
  );
}

export function SOWScreenView({ scheme }: SOWScreenViewProps) {
  const title = schemeDisplayTitle(scheme);
  const topicName = getTopicName(scheme.topicId);
  const skillName = getSkillName(scheme.skillId);
  const pathwayLabels = getSchemeSelectedPathways(scheme).map((id) => getPathwayLabel(id));

  return (
    <div className="scheme-print-root space-y-6">
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

      <div className="space-y-4">
        {scheme.lessons.map((lesson) => {
          const outcomesText = formatLearningOutcomesForCell(lesson.learningOutcomeIds);
          const wilf = formatWilfLines(lesson.wilf);
          const hasContent = lessonHasContent(lesson);

          return (
            <Card key={lesson.id} padding={false} className="overflow-hidden">
              <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white">
                  {lesson.lessonNumber}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">Lesson {lesson.lessonNumber}</p>
                  <p className="truncate text-sm text-slate-500">
                    {lesson.walt.trim()
                      ? lesson.walt.split("\n")[0]
                      : hasContent
                        ? "Planned"
                        : "Not yet planned"}
                  </p>
                </div>
                <Badge tone={hasContent ? "green" : "slate"}>
                  {hasContent ? "Ready" : "Empty"}
                </Badge>
              </div>

              <div className="space-y-3 p-5">
                <LessonSection title="Learning Outcomes" tone="teal">
                  {outcomesText ? (
                    <div className="space-y-2">
                      {outcomesText.split("\n").map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">No learning outcomes linked.</p>
                  )}
                </LessonSection>

                {lesson.walt.trim() && (
                  <LessonSection title="WALT" tone="blue">
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
        })}
      </div>

      <p className="scheme-print-footer hidden text-center text-xs text-slate-400 print:block">
        PE Curriculum Studio © Neil Cassar
      </p>
    </div>
  );
}
