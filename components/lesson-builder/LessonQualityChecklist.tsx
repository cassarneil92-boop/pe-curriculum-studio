"use client";

import { useMemo } from "react";
import { LessonQualityInsight } from "@/components/pe-knowledge/LessonQualityInsight";
import { Card, CardHeader } from "@/components/ui/Card";
import { buildLessonCoachingReport } from "@/lib/lesson-builder/curriculum-coaching";
import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import { PLANNING_COACH } from "@/lib/lesson-builder/planning-coach-labels";
import type { LessonPlan } from "@/lib/types";
import {
  buildKnowledgeQualityInsights,
  buildPhysicalLiteracyQualityReviewForLesson,
  buildTeachingForLearningQualityReviewForLesson,
  buildCooperativeLearningQualityReviewForLesson,
  buildTPSRQualityReviewForLesson,
  buildPrimaryPEQualityReviewForLesson,
  buildLearningScienceQualityReviewForLesson,
  buildEducationalPsychologyQualityReviewForLesson,
  buildVisibleLearningQualityReviewForLesson,
  type KnowledgeQualityInsight,
} from "@/src/lib/peKnowledge/coaching";
import { isPrimaryPEYearGroup } from "@/src/lib/peKnowledge/primaryPEMaster";
import {
  applyQuestioningToLesson,
  applyTextToLessonForm,
  buildAppliedSuggestionMessage,
} from "@/src/lib/peKnowledge/applySuggestions";

type LessonQualityInput = Pick<
  LessonPlan,
  | "selectedLearningOutcomeIds"
  | "learningIntention"
  | "walt"
  | "successCriteria"
  | "safetyConsiderations"
  | "structuredActivities"
  | "activities"
  | "differentiation"
  | "lessonEndings"
  | "assessmentNotes"
  | "reflectionNotes"
  | "topicId"
  | "yearGroup"
  | "pathwayId"
  | "selectedPathways"
  | "pedagogicalModels"
  | "equipment"
  | "skillId"
>;

interface LessonQualityChecklistProps {
  lesson: LessonQualityInput;
  compact?: boolean;
  onApplyLesson?: (form: LessonBuilderFormData, message: string) => void;
}

export function LessonQualityChecklist({
  lesson,
  compact = false,
  onApplyLesson,
}: LessonQualityChecklistProps) {
  const report = buildLessonCoachingReport(lesson as LessonPlan);
  const knowledgeInsights = useMemo(
    () => buildKnowledgeQualityInsights(lesson as LessonBuilderFormData),
    [lesson]
  );
  const plReview = useMemo(
    () => buildPhysicalLiteracyQualityReviewForLesson(lesson as LessonBuilderFormData),
    [lesson]
  );
  const tflReview = useMemo(
    () => buildTeachingForLearningQualityReviewForLesson(lesson as LessonBuilderFormData),
    [lesson]
  );
  const clReview = useMemo(
    () => buildCooperativeLearningQualityReviewForLesson(lesson as LessonBuilderFormData),
    [lesson]
  );
  const tpsrReview = useMemo(
    () => buildTPSRQualityReviewForLesson(lesson as LessonBuilderFormData),
    [lesson]
  );
  const primaryPEReview = useMemo(
    () => buildPrimaryPEQualityReviewForLesson(lesson as LessonBuilderFormData),
    [lesson]
  );
  const lsReview = useMemo(
    () => buildLearningScienceQualityReviewForLesson(lesson as LessonBuilderFormData),
    [lesson]
  );
  const epReview = useMemo(
    () => buildEducationalPsychologyQualityReviewForLesson(lesson as LessonBuilderFormData),
    [lesson]
  );
  const vlReview = useMemo(
    () => buildVisibleLearningQualityReviewForLesson(lesson as LessonBuilderFormData),
    [lesson]
  );

  const handleApplyFix = (insight: KnowledgeQualityInsight) => {
    if (!insight.fix || !onApplyLesson) return false;
    const form = lesson as LessonBuilderFormData;

    if (insight.fix.asQuestions) {
      const questions = insight.fix.text.split("\n").filter(Boolean);
      const { form: next, applied } = applyQuestioningToLesson(form, questions);
      if (applied) {
        onApplyLesson(next, buildAppliedSuggestionMessage("questioning"));
        return true;
      }
      return false;
    }

    const { form: next, result } = applyTextToLessonForm(
      form,
      insight.fix.target,
      insight.fix.text,
      { appendOnly: insight.fix.target !== "walt" }
    );
    if (result.applied) {
      onApplyLesson(next, buildAppliedSuggestionMessage(insight.area.toLowerCase()));
      return true;
    }
    return false;
  };

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
        <span className="font-semibold text-slate-700">Coaching: </span>
        <span className="text-teal-700">
          {report.strengths.length} strengths · {report.suggestions.length} to review
        </span>
        <LessonQualityInsight insights={knowledgeInsights} compact />
        <span className="text-slate-400">(advisory)</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader
        title={PLANNING_COACH.coachingTitle}
        description={`${report.mentorSummary} ${PLANNING_COACH.advisoryOnly}`}
      />

      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-lg font-bold text-teal-800">
          {report.strengths.length}/{report.strengths.length + report.suggestions.length}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">Planning readiness</p>
          <p className="text-xs text-slate-500">{report.percentage}% of checklist complete</p>
        </div>
      </div>

      {report.strengths.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Strengths
          </p>
          <ul className="space-y-1.5">
            {report.strengths.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm text-slate-800">
                <span className="text-emerald-600">✓</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.suggestions.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
            Suggestions
          </p>
          <ul className="space-y-1.5">
            {report.suggestions.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="text-amber-600">⚠</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-slate-100 pt-4">
        <div className="mb-4 rounded-lg border border-violet-100 bg-violet-50/40 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">
            Physical Literacy Review
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {plReview.band} — {plReview.score}/100
          </p>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 sm:grid-cols-5">
            <span>Motivation: {plReview.dimensions.motivation}</span>
            <span>Confidence: {plReview.dimensions.confidence}</span>
            <span>Competence: {plReview.dimensions.competence}</span>
            <span>Knowledge: {plReview.dimensions.knowledge}</span>
            <span>Understanding: {plReview.dimensions.understanding}</span>
          </div>
          {plReview.warnings.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-amber-800">
              {plReview.warnings.slice(0, 2).map((w) => (
                <li key={w.warning}>⚠ {w.warning} — {w.suggestedFix}</li>
              ))}
            </ul>
          )}
          {plReview.recommendations[0] && (
            <p className="mt-2 text-xs text-slate-700">{plReview.recommendations[0]}</p>
          )}
        </div>
        <div className="mb-4 rounded-lg border border-sky-100 bg-sky-50/40 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">
            Teaching for Learning Review
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {tflReview.band} — {tflReview.score}/100
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {tflReview.checks.map((c) => (
              <li key={c.label}>
                {c.met ? "✓" : "○"} {c.label}
              </li>
            ))}
          </ul>
          {tflReview.warnings.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-amber-800">
              {tflReview.warnings.slice(0, 2).map((w) => (
                <li key={w}>⚠ {w}</li>
              ))}
            </ul>
          )}
          {tflReview.recommendations[0] && (
            <p className="mt-2 text-xs text-slate-700">{tflReview.recommendations[0]}</p>
          )}
        </div>
        <div className="mb-4 rounded-lg border border-teal-100 bg-teal-50/40 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
            Cooperative Learning Review
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {clReview.band} — {clReview.score}/100
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {clReview.checks.map((c) => (
              <li key={c.label}>
                {c.met ? "✓" : "○"} {c.label}
              </li>
            ))}
          </ul>
          {clReview.warnings.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-amber-800">
              {clReview.warnings.slice(0, 2).map((w) => (
                <li key={w}>⚠ {w}</li>
              ))}
            </ul>
          )}
          {clReview.recommendations[0] && (
            <p className="mt-2 text-xs text-slate-700">{clReview.recommendations[0]}</p>
          )}
        </div>
        <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50/40 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            TPSR Review
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {tpsrReview.band} — {tpsrReview.score}/100
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {tpsrReview.checks.map((c) => (
              <li key={c.label}>
                {c.met ? "✓" : "○"} {c.label}
              </li>
            ))}
          </ul>
          {tpsrReview.warnings.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-amber-800">
              {tpsrReview.warnings.slice(0, 2).map((w) => (
                <li key={w}>⚠ {w}</li>
              ))}
            </ul>
          )}
          {tpsrReview.recommendations[0] && (
            <p className="mt-2 text-xs text-slate-700">{tpsrReview.recommendations[0]}</p>
          )}
        </div>
        {isPrimaryPEYearGroup(String(lesson.yearGroup ?? "")) && (
          <div className="mb-4 rounded-lg border border-orange-100 bg-orange-50/40 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-800">
              Primary PE Review
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {primaryPEReview.band} — {primaryPEReview.score}/100
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {primaryPEReview.checks.map((c) => (
                <li key={c.label}>
                  {c.met ? "✓" : "○"} {c.label}
                </li>
              ))}
            </ul>
            {primaryPEReview.warnings.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-amber-800">
                {primaryPEReview.warnings.slice(0, 2).map((w) => (
                  <li key={w}>⚠ {w}</li>
                ))}
              </ul>
            )}
            {primaryPEReview.recommendations[0] && (
              <p className="mt-2 text-xs text-slate-700">{primaryPEReview.recommendations[0]}</p>
            )}
          </div>
        )}
        <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50/40 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-800">
            Learning Science Review
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {lsReview.band} — {lsReview.score}/100
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {lsReview.checks.map((c) => (
              <li key={c.label}>
                {c.met ? "✓" : "○"} {c.label}
              </li>
            ))}
          </ul>
          {lsReview.warnings.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-amber-800">
              {lsReview.warnings.slice(0, 2).map((w) => (
                <li key={w}>⚠ {w}</li>
              ))}
            </ul>
          )}
          {lsReview.recommendations[0] && (
            <p className="mt-2 text-xs text-slate-700">{lsReview.recommendations[0]}</p>
          )}
        </div>
        <div className="mb-4 rounded-lg border border-purple-100 bg-purple-50/40 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-800">
            Educational Psychology Review
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {epReview.band} — {epReview.score}/100
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {epReview.checks.map((c) => (
              <li key={c.label}>
                {c.met ? "✓" : "○"} {c.label}
              </li>
            ))}
          </ul>
          {epReview.warnings.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-amber-800">
              {epReview.warnings.slice(0, 2).map((w) => (
                <li key={w}>⚠ {w}</li>
              ))}
            </ul>
          )}
          {epReview.recommendations[0] && (
            <p className="mt-2 text-xs text-slate-700">{epReview.recommendations[0]}</p>
          )}
        </div>
        <div className="mb-4 rounded-lg border border-teal-100 bg-teal-50/40 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
            Visible Learning Review
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {vlReview.band} — {vlReview.score}/100
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {vlReview.checks.map((c) => (
              <li key={c.label}>
                {c.met ? "✓" : "○"} {c.label}
              </li>
            ))}
          </ul>
          {vlReview.warnings.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-amber-800">
              {vlReview.warnings.slice(0, 2).map((w) => (
                <li key={w}>⚠ {w}</li>
              ))}
            </ul>
          )}
          {vlReview.recommendations[0] && (
            <p className="mt-2 text-xs text-slate-700">{vlReview.recommendations[0]}</p>
          )}
        </div>
        <LessonQualityInsight
          insights={knowledgeInsights}
          onApplyFix={onApplyLesson ? handleApplyFix : undefined}
        />
      </div>
    </Card>
  );
}
