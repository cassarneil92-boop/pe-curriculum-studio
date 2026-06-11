"use client";

import { SchemeLearningOutcomeCard } from "@/components/scheme-builder/SchemeLearningOutcomeCard";
import {
  formatWilfLines,
  resolveSchemeLearningOutcomes,
  getSchemeSelectedPathways,
  getSkillName,
  getTopicName,
  schemeDisplayTitle,
} from "@/lib/scheme-builder/helpers";
import { getPathwayLabel } from "@/lib/constants";
import { getYearGroupLabel } from "@/lib/year-groups";
import type { SchemeOfWork } from "@/lib/types";

interface SOWPreviewTableProps {
  scheme: SchemeOfWork;
}

function ActivityText({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1 text-sm leading-relaxed text-slate-700">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-2" />;

        const isHeading = /:$/.test(trimmed) && trimmed.length < 48;
        if (isHeading) {
          return (
            <p key={index} className="font-semibold text-slate-900">
              {trimmed}
            </p>
          );
        }

        if (/^[-•*]\s/.test(trimmed)) {
          return (
            <p key={index} className="pl-3 text-slate-700">
              {trimmed}
            </p>
          );
        }

        return (
          <p key={index} className="text-slate-700">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

export function SOWPreviewTable({ scheme }: SOWPreviewTableProps) {
  const title = schemeDisplayTitle(scheme);
  const topicName = getTopicName(scheme.topicId);
  const skillName = getSkillName(scheme.skillId);
  const pathwayLabels = getSchemeSelectedPathways(scheme).map((pathwayId) =>
    getPathwayLabel(pathwayId)
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-br from-teal-50 via-white to-slate-50 px-6 py-5">
        <h2 className="text-xl font-semibold text-teal-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {getYearGroupLabel(scheme.yearGroup)}
          {scheme.classGroup ? ` · ${scheme.classGroup}` : ""} · {scheme.term} ·{" "}
          {pathwayLabels.join(" + ")}
          {topicName ? ` · ${topicName}` : ""}
          {skillName ? ` · ${skillName}` : ""}
          {scheme.plannedLessonCount
            ? ` · ${scheme.plannedLessonCount} lesson${scheme.plannedLessonCount === 1 ? "" : "s"}`
            : ""}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[960px] w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-100/80">
              <th className="w-[72px] border border-slate-200 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Lesson
              </th>
              <th className="min-w-[220px] border border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Learning Outcomes &amp; WALT
              </th>
              <th className="min-w-[180px] border border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Success Criteria (WILF)
              </th>
              <th className="min-w-[260px] border border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Activities
              </th>
              <th className="min-w-[140px] border border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Resources
              </th>
            </tr>
          </thead>
          <tbody>
            {scheme.lessons.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="border border-slate-200 px-4 py-10 text-center text-sm text-slate-500"
                >
                  Add lessons in the builder to populate this preview.
                </td>
              </tr>
            ) : (
              scheme.lessons.map((lesson) => {
                const resolvedOutcomes = resolveSchemeLearningOutcomes(lesson.learningOutcomeIds);
                const wilfLines = formatWilfLines(lesson.wilf);

                return (
                  <tr key={lesson.id} className="align-top">
                    <td className="border border-slate-200 px-3 py-4 text-center text-lg font-semibold text-slate-800">
                      {lesson.lessonNumber}
                    </td>
                    <td className="border border-slate-200 px-4 py-4">
                      {resolvedOutcomes.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {resolvedOutcomes.map((outcome) => (
                            <SchemeLearningOutcomeCard key={outcome.id} outcome={outcome} />
                          ))}
                        </div>
                      )}
                      {lesson.walt && (
                        <div className="rounded-lg bg-teal-50/60 px-3 py-2">
                          <p className="text-xs font-bold uppercase tracking-wide text-teal-800">
                            WALT
                          </p>
                          <p className="mt-1 text-sm text-slate-800">{lesson.walt}</p>
                        </div>
                      )}
                      {resolvedOutcomes.length === 0 && !lesson.walt && (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="border border-slate-200 px-4 py-4">
                      {wilfLines.length > 0 ? (
                        <ol className="list-decimal space-y-1.5 pl-4 text-sm text-slate-700">
                          {wilfLines.map((line, index) => (
                            <li key={index}>{line}</li>
                          ))}
                        </ol>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="border border-slate-200 px-4 py-4">
                      {lesson.activities.trim() ? (
                        <ActivityText text={lesson.activities} />
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="border border-slate-200 px-4 py-4">
                      {lesson.resources.length > 0 ? (
                        <ul className="space-y-1 text-sm text-slate-700">
                          {lesson.resources.map((resource) => (
                            <li key={resource}>{resource}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
