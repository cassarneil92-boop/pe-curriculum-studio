"use client";

import { Badge } from "@/components/ui/Badge";
import {
  formatLessonDate,
  getLessonOutcomes,
  getLessonPathwayLabel,
  getLessonSelectedPathwayLabels,
  getLessonSkillName,
  getLessonTopicName,
} from "@/lib/lesson-plans/helpers";
import type { LessonPlan } from "@/lib/types";
import { getYearGroupLabel } from "@/lib/year-groups";

interface LessonPreviewProps {
  lesson: LessonPlan;
  showFooter?: boolean;
}

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-teal-700">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

function TextBlock({ value }: { value: string }) {
  if (!value.trim()) return <p className="text-slate-400">—</p>;
  return (
    <div className="space-y-1 whitespace-pre-wrap">
      {value.split("\n").map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
}

export function LessonPreview({ lesson, showFooter = true }: LessonPreviewProps) {
  const outcomes = getLessonOutcomes(lesson);
  const pathwayLabels = getLessonSelectedPathwayLabels(lesson);

  return (
    <article className="lesson-print-root space-y-4">
      <header className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">{lesson.title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {lesson.classGroup || "No class set"} · {getYearGroupLabel(lesson.yearGroup)} ·{" "}
          {formatLessonDate(lesson.date)} · {lesson.duration} min
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone="teal">{getLessonPathwayLabel(lesson)}</Badge>
          <Badge tone="slate">{getLessonTopicName(lesson)}</Badge>
          <Badge tone="blue">{getLessonSkillName(lesson)}</Badge>
          {pathwayLabels.length > 1 &&
            pathwayLabels.map((label) => (
              <Badge key={label} tone="amber">
                {label}
              </Badge>
            ))}
        </div>
      </header>

      <PreviewSection title="Learning Outcomes">
        {outcomes.length === 0 ? (
          <p className="text-slate-400">No learning outcomes linked.</p>
        ) : (
          <ul className="space-y-2">
            {outcomes.map((outcome) => (
              <li key={outcome!.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-xs font-semibold text-teal-700">{outcome!.code}</span>
                <p className="mt-0.5">{outcome!.description}</p>
              </li>
            ))}
          </ul>
        )}
      </PreviewSection>

      <PreviewSection title="Learning Intention / WALT">
        <TextBlock value={lesson.learningIntention} />
      </PreviewSection>

      <PreviewSection title="Success Criteria / WILF">
        <TextBlock value={lesson.successCriteria} />
      </PreviewSection>

      <PreviewSection title="Activities / Lesson Flow">
        <TextBlock value={lesson.activities} />
      </PreviewSection>

      <div className="grid gap-4 sm:grid-cols-2">
        <PreviewSection title="Assessment">
          <TextBlock value={lesson.assessmentNotes} />
        </PreviewSection>
        <PreviewSection title="Resources Needed">
          <TextBlock value={lesson.equipment} />
        </PreviewSection>
        <PreviewSection title="Safety Considerations">
          <TextBlock value={lesson.safetyConsiderations} />
        </PreviewSection>
        <PreviewSection title="Differentiation">
          <TextBlock value={lesson.differentiation} />
        </PreviewSection>
      </div>

      {lesson.reflectionNotes.trim() && (
        <PreviewSection title="Reflection">
          <TextBlock value={lesson.reflectionNotes} />
        </PreviewSection>
      )}

      {showFooter && (
        <footer className="border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
          PE Curriculum Studio © Neil Cassar
        </footer>
      )}
    </article>
  );
}
