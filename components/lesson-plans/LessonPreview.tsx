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
import type { LessonActivity, LessonPlan } from "@/lib/types";
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

function ActivityPreview({ activity }: { activity: LessonActivity }) {
  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-4">
      <p className="font-semibold text-slate-900">
        Activity {activity.number}
        {activity.name ? ` – ${activity.name}` : ""}
      </p>
      <dl className="mt-3 space-y-1 text-sm">
        {activity.students && (
          <>
            <dt className="font-medium text-slate-600">Students</dt>
            <dd>{activity.students}</dd>
          </>
        )}
        {activity.time && (
          <>
            <dt className="mt-2 font-medium text-slate-600">Time</dt>
            <dd>{activity.time}</dd>
          </>
        )}
        {activity.spaceEquipment && (
          <>
            <dt className="mt-2 font-medium text-slate-600">Space &amp; equipment</dt>
            <dd>{activity.spaceEquipment}</dd>
          </>
        )}
        {activity.taskDescription && (
          <>
            <dt className="mt-2 font-medium text-slate-600">Task</dt>
            <dd className="whitespace-pre-wrap">{activity.taskDescription}</dd>
          </>
        )}
      </dl>
      {activity.progressions.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Progressions</p>
          <ul className="mt-1 list-disc pl-4">
            {activity.progressions.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
      {(activity.differentiationEasier || activity.differentiationHarder) && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Differentiation</p>
          <ul className="mt-1 list-disc pl-4">
            {activity.differentiationEasier && <li>Easier: {activity.differentiationEasier}</li>}
            {activity.differentiationHarder && <li>Harder: {activity.differentiationHarder}</li>}
          </ul>
        </div>
      )}
      {activity.teachingCues.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Teaching cues</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {activity.teachingCues.map((cue) => (
              <Badge key={cue} tone="teal">
                {cue}
              </Badge>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function LessonPreview({ lesson, showFooter = true }: LessonPreviewProps) {
  const outcomes = getLessonOutcomes(lesson);
  const pathwayLabels = getLessonSelectedPathwayLabels(lesson);
  const activities = lesson.structuredActivities ?? [];
  const endings = [...(lesson.lessonEndings ?? [])].sort((a, b) => a.order - b.order);

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

      <PreviewSection title="Curriculum Reference">
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

      <PreviewSection title="Learning Intentions">
        <TextBlock value={lesson.learningIntention} />
      </PreviewSection>

      <PreviewSection title="WALT">
        <TextBlock value={lesson.walt} />
      </PreviewSection>

      <PreviewSection title="Success Criteria / WILF">
        <TextBlock value={lesson.successCriteria} />
      </PreviewSection>

      <PreviewSection title="PE Activities">
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <ActivityPreview key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <TextBlock value={lesson.activities} />
        )}
      </PreviewSection>

      {lesson.safetyConsiderations.trim() && (
        <PreviewSection title="Safety Considerations">
          <TextBlock value={lesson.safetyConsiderations} />
        </PreviewSection>
      )}

      {endings.length > 0 ? (
        <PreviewSection title="Lesson Ending">
          <div className="space-y-3">
            {endings.map((ending) => (
              <div key={ending.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="font-medium text-slate-900">{ending.title}</p>
                <TextBlock value={ending.content} />
              </div>
            ))}
          </div>
        </PreviewSection>
      ) : (
        <>
          {lesson.assessmentNotes.trim() && (
            <PreviewSection title="Assessment">
              <TextBlock value={lesson.assessmentNotes} />
            </PreviewSection>
          )}
          {lesson.reflectionNotes.trim() && (
            <PreviewSection title="Reflection">
              <TextBlock value={lesson.reflectionNotes} />
            </PreviewSection>
          )}
        </>
      )}

      {showFooter && (
        <footer className="border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
          PE Curriculum Studio © Neil Cassar
        </footer>
      )}
    </article>
  );
}
