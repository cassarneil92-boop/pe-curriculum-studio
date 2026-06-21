"use client";

import { useMemo, useState } from "react";
import { LessonQualityInsight } from "@/components/pe-knowledge/LessonQualityInsight";
import { PedagogyCoachPanel } from "@/components/pe-knowledge/PedagogyCoachPanel";
import { LessonStructureCoach } from "@/components/lesson-builder/LessonStructureCoach";
import { Card } from "@/components/ui/Card";
import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
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
  buildSEMQualityReviewForLesson,
  buildFormativeAssessmentQualityReviewForLesson,
  type KnowledgeQualityInsight,
} from "@/src/lib/peKnowledge/coaching";
import { isPrimaryPEYearGroup } from "@/src/lib/peKnowledge/primaryPEMaster";
import {
  applyQuestioningToLesson,
  applyTextToLessonForm,
  buildAppliedSuggestionMessage,
} from "@/src/lib/peKnowledge/applySuggestions";

type AdvancedReviewInput = Pick<
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
  | "duration"
>;

interface AdvancedCoachingReviewProps {
  lesson: AdvancedReviewInput;
  defaultOpen?: boolean;
  showStructureCoach?: boolean;
  showPedagogyCoach?: boolean;
  onApplyLesson?: (form: LessonBuilderFormData, message: string) => void;
}

function FrameworkReviewPanel({
  title,
  band,
  score,
  borderClass,
  bgClass,
  textClass,
  checks,
  warnings,
  recommendation,
  children,
}: {
  title: string;
  band: string;
  score: number;
  borderClass: string;
  bgClass: string;
  textClass: string;
  checks?: { label: string; met: boolean }[];
  warnings?: string[];
  recommendation?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`mb-4 rounded-lg border px-3 py-3 ${borderClass} ${bgClass}`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${textClass}`}>{title}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">
        {band} — {score}/100
      </p>
      {children}
      {checks && checks.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-slate-600">
          {checks.map((c) => (
            <li key={c.label}>
              {c.met ? "✓" : "○"} {c.label}
            </li>
          ))}
        </ul>
      )}
      {warnings && warnings.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-amber-800">
          {warnings.slice(0, 2).map((w) => (
            <li key={w}>⚠ {w}</li>
          ))}
        </ul>
      )}
      {recommendation && <p className="mt-2 text-xs text-slate-700">{recommendation}</p>}
    </div>
  );
}

export function AdvancedCoachingReview({
  lesson,
  defaultOpen = false,
  showStructureCoach = true,
  showPedagogyCoach = true,
  onApplyLesson,
}: AdvancedCoachingReviewProps) {
  const [open, setOpen] = useState(defaultOpen);
  const form = lesson as LessonBuilderFormData;

  const knowledgeInsights = useMemo(() => buildKnowledgeQualityInsights(form), [lesson]);
  const plReview = useMemo(() => buildPhysicalLiteracyQualityReviewForLesson(form), [lesson]);
  const tflReview = useMemo(() => buildTeachingForLearningQualityReviewForLesson(form), [lesson]);
  const clReview = useMemo(() => buildCooperativeLearningQualityReviewForLesson(form), [lesson]);
  const tpsrReview = useMemo(() => buildTPSRQualityReviewForLesson(form), [lesson]);
  const primaryPEReview = useMemo(() => buildPrimaryPEQualityReviewForLesson(form), [lesson]);
  const lsReview = useMemo(() => buildLearningScienceQualityReviewForLesson(form), [lesson]);
  const epReview = useMemo(() => buildEducationalPsychologyQualityReviewForLesson(form), [lesson]);
  const vlReview = useMemo(() => buildVisibleLearningQualityReviewForLesson(form), [lesson]);
  const semReview = useMemo(() => buildSEMQualityReviewForLesson(form), [lesson]);
  const faReview = useMemo(() => buildFormativeAssessmentQualityReviewForLesson(form), [lesson]);

  const handleApplyFix = (insight: KnowledgeQualityInsight) => {
    if (!insight.fix || !onApplyLesson) return false;

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

  return (
    <Card padding={false} className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50/80"
      >
        <div>
          <p className="text-sm font-semibold text-slate-900">Advanced coaching review</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Specialist framework reviews and pedagogy insights
          </p>
        </div>
        <span className="text-xs text-slate-400">{open ? "Collapse" : "Expand"}</span>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 py-4">
          {showStructureCoach && <LessonStructureCoach lesson={form} />}
          {showPedagogyCoach && (
            <div className="mb-4">
              <PedagogyCoachPanel
                lesson={form}
                onApplyLesson={onApplyLesson ?? (() => {})}
              />
            </div>
          )}

          <FrameworkReviewPanel
            title="Physical Literacy Review"
            band={plReview.band}
            score={plReview.score}
            borderClass="border-violet-100"
            bgClass="bg-violet-50/40"
            textClass="text-violet-800"
            warnings={plReview.warnings.map((w) => `${w.warning} — ${w.suggestedFix}`)}
            recommendation={plReview.recommendations[0]}
          >
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 sm:grid-cols-5">
              <span>Motivation: {plReview.dimensions.motivation}</span>
              <span>Confidence: {plReview.dimensions.confidence}</span>
              <span>Competence: {plReview.dimensions.competence}</span>
              <span>Knowledge: {plReview.dimensions.knowledge}</span>
              <span>Understanding: {plReview.dimensions.understanding}</span>
            </div>
          </FrameworkReviewPanel>

          <FrameworkReviewPanel
            title="Teaching for Learning Review"
            band={tflReview.band}
            score={tflReview.score}
            borderClass="border-sky-100"
            bgClass="bg-sky-50/40"
            textClass="text-sky-800"
            checks={tflReview.checks}
            warnings={tflReview.warnings}
            recommendation={tflReview.recommendations[0]}
          />

          <FrameworkReviewPanel
            title="Visible Learning Review"
            band={vlReview.band}
            score={vlReview.score}
            borderClass="border-teal-100"
            bgClass="bg-teal-50/40"
            textClass="text-teal-800"
            checks={vlReview.checks}
            warnings={vlReview.warnings}
            recommendation={vlReview.recommendations[0]}
          />

          <FrameworkReviewPanel
            title="Learning Science Review"
            band={lsReview.band}
            score={lsReview.score}
            borderClass="border-indigo-100"
            bgClass="bg-indigo-50/40"
            textClass="text-indigo-800"
            checks={lsReview.checks}
            warnings={lsReview.warnings}
            recommendation={lsReview.recommendations[0]}
          />

          <FrameworkReviewPanel
            title="Educational Psychology Review"
            band={epReview.band}
            score={epReview.score}
            borderClass="border-purple-100"
            bgClass="bg-purple-50/40"
            textClass="text-purple-800"
            checks={epReview.checks}
            warnings={epReview.warnings}
            recommendation={epReview.recommendations[0]}
          />

          <FrameworkReviewPanel
            title="SEM Review"
            band={semReview.band}
            score={semReview.score}
            borderClass="border-amber-100"
            bgClass="bg-amber-50/40"
            textClass="text-amber-800"
            checks={semReview.checks}
            warnings={semReview.warnings}
            recommendation={semReview.recommendations[0]}
          />

          <FrameworkReviewPanel
            title="TPSR Review"
            band={tpsrReview.band}
            score={tpsrReview.score}
            borderClass="border-amber-100"
            bgClass="bg-amber-50/40"
            textClass="text-amber-800"
            checks={tpsrReview.checks}
            warnings={tpsrReview.warnings}
            recommendation={tpsrReview.recommendations[0]}
          />

          <FrameworkReviewPanel
            title="Cooperative Learning Review"
            band={clReview.band}
            score={clReview.score}
            borderClass="border-teal-100"
            bgClass="bg-teal-50/40"
            textClass="text-teal-800"
            checks={clReview.checks}
            warnings={clReview.warnings}
            recommendation={clReview.recommendations[0]}
          />

          <FrameworkReviewPanel
            title="Formative Assessment Review"
            band={faReview.band}
            score={faReview.score}
            borderClass="border-sky-100"
            bgClass="bg-sky-50/40"
            textClass="text-sky-800"
            checks={faReview.checks}
            warnings={faReview.warnings}
            recommendation={faReview.recommendations[0]}
          />

          {isPrimaryPEYearGroup(String(lesson.yearGroup ?? "")) && (
            <FrameworkReviewPanel
              title="Primary PE Review"
              band={primaryPEReview.band}
              score={primaryPEReview.score}
              borderClass="border-orange-100"
              bgClass="bg-orange-50/40"
              textClass="text-orange-800"
              checks={primaryPEReview.checks}
              warnings={primaryPEReview.warnings}
              recommendation={primaryPEReview.recommendations[0]}
            />
          )}

          <LessonQualityInsight
            insights={knowledgeInsights}
            onApplyFix={onApplyLesson ? handleApplyFix : undefined}
          />
        </div>
      )}
    </Card>
  );
}
