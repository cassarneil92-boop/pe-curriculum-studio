"use client";

import { BrandLogoHorizontal } from "@/components/brand/BrandLogoHorizontal";
import { BRAND_FOOTER } from "@/lib/brand/constants";
import {
  buildLessonAssessmentExport,
  buildLessonDifferentiationExport,
  buildLessonExportMetadata,
  buildLessonFlowRows,
  buildLessonReflectionExport,
} from "@/lib/lesson-plans/export-document";
import { getLessonOutcomes } from "@/lib/lesson-plans/helpers";
import type { ExportDocumentContext } from "@/lib/export/export-context";
import type { LessonPlan } from "@/lib/types";

interface LessonPreviewProps {
  lesson: LessonPlan;
  exportContext?: ExportDocumentContext;
  showFooter?: boolean;
}

function DocSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mb-3.5 print:mb-3 ${className}`}>
      <h2 className="mb-1.5 border-b border-slate-300 pb-0.5 text-[0.72rem] font-bold uppercase tracking-widest text-slate-700">
        {title}
      </h2>
      {children}
    </section>
  );
}

function TextCell({ value }: { value: string }) {
  if (!value.trim() || value.trim() === "—") {
    return <span className="text-slate-400">—</span>;
  }
  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
      {value.split("\n").map((line, index) => (
        <p key={index} className={index > 0 ? "mt-1" : ""}>
          {line}
        </p>
      ))}
    </div>
  );
}

function LabelBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.72rem] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-0.5">
        <TextCell value={value} />
      </div>
    </div>
  );
}

const tableCell =
  "border border-slate-300 px-2 py-1.5 align-top text-sm leading-relaxed text-slate-800";
const tableHead =
  "border border-slate-300 bg-teal-50 px-2 py-1.5 text-left text-[0.72rem] font-semibold uppercase tracking-wide text-teal-800";

export function LessonPreview({
  lesson,
  exportContext,
  showFooter = true,
}: LessonPreviewProps) {
  const meta = buildLessonExportMetadata(lesson, exportContext);
  const outcomes = getLessonOutcomes(lesson);
  const flowRows = buildLessonFlowRows(lesson);
  const differentiation = buildLessonDifferentiationExport(lesson);
  const assessment = buildLessonAssessmentExport(lesson);
  const reflection = buildLessonReflectionExport(lesson);

  const metaRows: [string, string, string, string][] = [
    ["School", meta.school, "College", meta.college],
    ["Teacher", meta.teacher, "Year Group", meta.yearGroup],
    ["Class", meta.classGroup, "Pathway", meta.pathway],
    ["Topic", meta.topic, "Skill", meta.skill],
    ["Date", meta.date, "Duration", meta.duration],
  ];

  return (
    <article className="lesson-print-root mx-auto max-w-[210mm] bg-white text-[10.5pt] leading-snug text-slate-800">
      <div className="lesson-print-brand mb-4 border-b border-slate-200 pb-3">
        <BrandLogoHorizontal height={52} />
      </div>

      <h1 className="mb-3 border-b-2 border-teal-200 pb-1 text-xl font-bold text-teal-800">
        {meta.title}
      </h1>

      <table className="mb-4 w-full border-collapse text-sm">
        <tbody>
          {metaRows.map(([l1, v1, l2, v2]) => (
            <tr key={l1}>
              <th className="w-[14%] border border-slate-300 bg-slate-50 px-2 py-1.5 text-left text-xs font-semibold text-slate-600">
                {l1}
              </th>
              <td className={`w-[36%] ${tableCell}`}>{v1}</td>
              <th className="w-[14%] border border-slate-300 bg-slate-50 px-2 py-1.5 text-left text-xs font-semibold text-slate-600">
                {l2}
              </th>
              <td className={`w-[36%] ${tableCell}`}>{v2}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <DocSection title="Curriculum alignment">
        <p className="mb-1.5 text-[0.72rem] font-semibold uppercase tracking-wide text-slate-500">
          Learning outcome codes
        </p>
        {outcomes.length === 0 ? (
          <p className="text-sm italic text-slate-400">No learning outcomes linked.</p>
        ) : (
          <div className="space-y-2">
            {outcomes.map((outcome) => (
              <div key={outcome!.id} className="border-b border-dotted border-slate-200 pb-1.5 last:border-0">
                <p className="text-xs font-bold text-teal-700">{outcome!.code}</p>
                <p className="text-sm text-slate-700">{outcome!.description}</p>
              </div>
            ))}
          </div>
        )}
      </DocSection>

      <DocSection title="Learning intentions">
        <div className="grid gap-3 sm:grid-cols-2">
          <LabelBlock label="Learning intentions" value={lesson.learningIntention} />
          <LabelBlock label="WALT" value={lesson.walt} />
        </div>
        <div className="mt-3">
          <LabelBlock label="WILF" value={lesson.successCriteria} />
        </div>
      </DocSection>

      <DocSection title="Lesson flow" className="flow-section">
        {flowRows.length === 0 ? (
          <p className="text-sm italic text-slate-400">No lesson flow recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th className={`${tableHead} w-[16%]`}>Phase</th>
                  <th className={`${tableHead} w-[8%]`}>Time</th>
                  <th className={tableHead}>Activity</th>
                  <th className={tableHead}>Organisation</th>
                  <th className={tableHead}>Teaching Points</th>
                </tr>
              </thead>
              <tbody>
                {flowRows.map((row, index) => (
                  <tr key={index} className="print:break-inside-avoid">
                    <td className={`${tableCell} font-semibold`}>{row.phase}</td>
                    <td className={tableCell}>{row.time}</td>
                    <td className={tableCell}>
                      <TextCell value={row.activity} />
                    </td>
                    <td className={tableCell}>
                      <TextCell value={row.organisation} />
                    </td>
                    <td className={tableCell}>
                      <TextCell value={row.teachingPoints} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DocSection>

      <DocSection title="Differentiation">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={`${tableHead} w-1/3`}>Support</th>
              <th className={`${tableHead} w-1/3`}>Core</th>
              <th className={`${tableHead} w-1/3`}>Challenge</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tableCell}>
                <TextCell value={differentiation.support} />
              </td>
              <td className={tableCell}>
                <TextCell value={differentiation.core} />
              </td>
              <td className={tableCell}>
                <TextCell value={differentiation.challenge} />
              </td>
            </tr>
          </tbody>
        </table>
      </DocSection>

      <DocSection title="Assessment">
        <table className="w-full border-collapse">
          <tbody>
            {(
              [
                ["Assessment opportunities", assessment.opportunities],
                ["Observation points", assessment.observation],
                ["Questioning prompts", assessment.questioning],
                ["Success indicators", assessment.successIndicators],
              ] as const
            ).map(([label, value]) => (
              <tr key={label}>
                <th className="w-[28%] border border-slate-300 bg-slate-50 px-2 py-1.5 text-left text-xs font-semibold text-slate-600">
                  {label}
                </th>
                <td className={tableCell}>
                  <TextCell value={value} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DocSection>

      <DocSection title="Safety">
        {lesson.safetyConsiderations.trim() ? (
          <TextCell value={lesson.safetyConsiderations} />
        ) : (
          <p className="text-sm italic text-slate-400">
            Standard PE safety checks — space, equipment, and pupil readiness.
          </p>
        )}
      </DocSection>

      <DocSection title="Reflection">
        <div className="space-y-3">
          <LabelBlock label="Teacher reflection prompt" value={reflection.teacher} />
          <LabelBlock label="Student reflection question" value={reflection.student} />
        </div>
      </DocSection>

      {showFooter && (
        <footer className="lesson-print-footer mt-4 border-t border-slate-300 pt-2 text-center text-xs text-slate-500">
          PE Curriculum Studio · Generated {meta.generatedAt}
          <span className="hidden print:inline"> · {BRAND_FOOTER}</span>
        </footer>
      )}
    </article>
  );
}
