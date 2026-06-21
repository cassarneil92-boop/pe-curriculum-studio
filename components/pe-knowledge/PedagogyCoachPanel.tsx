"use client";

import { useMemo } from "react";
import { ActionableCoachList } from "@/components/pe-knowledge/ActionableCoachList";
import { PECoachPanel } from "@/components/pe-knowledge/PECoachPanel";
import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import { buildLessonPedagogyCoachReport } from "@/src/lib/peKnowledge/coaching";
import {
  applyCommonMistakeNote,
  applyQuestioningToLesson,
  applyTextToLessonForm,
  buildAppliedSuggestionMessage,
} from "@/src/lib/peKnowledge/applySuggestions";

interface PedagogyCoachPanelProps {
  lesson: LessonBuilderFormData;
  onApplyLesson: (form: LessonBuilderFormData, message: string) => void;
}

export function PedagogyCoachPanel({ lesson, onApplyLesson }: PedagogyCoachPanelProps) {
  const report = useMemo(() => buildLessonPedagogyCoachReport(lesson), [lesson]);

  const applyField = (
    target: Parameters<typeof applyTextToLessonForm>[1],
    text: string,
    label: string,
    appendOnly = false
  ) => {
    const { form: next, result } = applyTextToLessonForm(lesson, target, text, { appendOnly });
    if (result.applied) {
      onApplyLesson(next, buildAppliedSuggestionMessage(label));
      return true;
    }
    return false;
  };

  if (!lesson.topicId) {
    return (
      <PECoachPanel
        title="Pedagogy Coach"
        description="Set a curriculum topic to unlock PE specialist guidance."
        tone="blue"
      >
        <p className="text-xs text-slate-600">
          The knowledge base will suggest teaching models, WALT/WILF refinements, questioning, and
          differentiation matched to your lesson.
        </p>
      </PECoachPanel>
    );
  }

  return (
    <PECoachPanel
      title="Pedagogy Coach"
      description="PE specialist review of your current lesson draft."
      tone="blue"
    >
      {report.teachingModel && (
        <div className="rounded-lg border border-blue-100 bg-white/70 px-3 py-2">
          <p className="text-xs font-semibold text-blue-900">Suggested teaching model</p>
          <p className="mt-0.5 text-sm font-medium text-slate-900">{report.teachingModel.title}</p>
          <p className="mt-1 text-xs text-slate-600">{report.teachingModel.summary}</p>
        </div>
      )}

      {report.cooperativeLearningMetrics && (
        <div className="rounded-lg border border-teal-100 bg-teal-50/50 px-3 py-2 space-y-2">
          <p className="text-xs font-semibold text-teal-900">Cooperative Learning Score</p>
          <p className="text-xs text-slate-700">
            Overall: <strong>{report.cooperativeLearningMetrics.score}</strong>/100 (
            {report.cooperativeLearningMetrics.band})
          </p>
          <p className="text-xs text-slate-600">
            Strongest: {report.cooperativeLearningMetrics.strongestElement} · Weakest:{" "}
            {report.cooperativeLearningMetrics.weakestElement}
          </p>
          <p className="text-xs text-slate-700">
            Improve: {report.cooperativeLearningMetrics.improvementSuggestion}
          </p>
          <p className="text-xs text-slate-600">
            Roles: {report.cooperativeLearningMetrics.roleSuggestion}
          </p>
          <p className="text-xs text-slate-700">
            Reflect: {report.cooperativeLearningMetrics.reflectionSuggestion}
          </p>
        </div>
      )}

      {report.physicalLiteracyMetrics && (
        <div className="rounded-lg border border-violet-100 bg-violet-50/50 px-3 py-2 space-y-2">
          <p className="text-xs font-semibold text-violet-900">Physical Literacy Score</p>
          <div className="flex gap-3 text-xs text-slate-700">
            <span>
              Overall: <strong>{report.physicalLiteracyMetrics.score}</strong>/100 (
              {report.physicalLiteracyMetrics.band})
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Strongest: {report.physicalLiteracyMetrics.strongestDimension} · Weakest:{" "}
            {report.physicalLiteracyMetrics.weakestDimension}
          </p>
          <p className="text-xs text-slate-700">
            Improve: {report.physicalLiteracyMetrics.improvementRecommendation}
          </p>
        </div>
      )}

      {report.teachingForLearningMetrics && (
        <div className="rounded-lg border border-sky-100 bg-sky-50/50 px-3 py-2 space-y-2">
          <p className="text-xs font-semibold text-sky-900">Teaching for Learning</p>
          <p className="text-xs text-slate-700">
            Learning experience: <strong>{report.teachingForLearningMetrics.learningExperienceScore}</strong>/100 (
            {report.teachingForLearningMetrics.learningExperienceBand})
          </p>
          {report.teachingForLearningMetrics.taskDesignWarning && (
            <p className="text-xs text-amber-800">{report.teachingForLearningMetrics.taskDesignWarning}</p>
          )}
          <p className="text-xs text-slate-600">{report.teachingForLearningMetrics.contentBalance}</p>
          <p className="text-xs text-slate-700">
            Feedback: {report.teachingForLearningMetrics.feedbackSuggestion}
          </p>
          <p className="text-xs text-slate-600">
            Observe: {report.teachingForLearningMetrics.observationFocus[0]}
          </p>
          <p className="text-xs text-slate-700">
            Assessment: {report.teachingForLearningMetrics.assessmentIdea}
          </p>
        </div>
      )}

      {report.tgfuMetrics && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2 space-y-2">
          <p className="text-xs font-semibold text-emerald-900">Game based pedagogy check</p>
          <div className="flex gap-3 text-xs text-slate-700">
            <span title={report.tgfuMetrics.thinkingPlayerLabel}>
              Thinking player: <strong>{report.tgfuMetrics.thinkingPlayerScore}</strong>/100
            </span>
            <span title={report.tgfuMetrics.representativeLabel}>
              Representative: <strong>{report.tgfuMetrics.representativeScore}</strong>/100
            </span>
          </div>
          {report.tgfuMetrics.strengths.length > 0 && (
            <p className="text-xs text-slate-600">
              Strengths: {report.tgfuMetrics.strengths.join("; ")}
            </p>
          )}
          {report.tgfuMetrics.risks.length > 0 && (
            <p className="text-xs text-amber-800">
              Risks: {report.tgfuMetrics.risks.join("; ")}
            </p>
          )}
          <p className="text-xs text-slate-700">
            Improve: {report.tgfuMetrics.suggestedImprovement}
          </p>
        </div>
      )}

      <ActionableCoachList
        label="WALT / WILF"
        items={report.waltWilfTips.map((text, index) => ({
          id: `walt-${index}`,
          text,
          actionLabel: index === 0 ? "Apply WALT" : "Apply",
          onApply: () => applyField(index === 0 ? "walt" : "successCriteria", text, index === 0 ? "WALT" : "WILF"),
        }))}
      />

      <ActionableCoachList
        label="Questioning & TGfU prompts"
        items={report.questioningPrompts.map((text, index) => ({
          id: `q-${index}`,
          text,
          actionLabel: "Add questions",
          onApply: () => {
            const { form: next, applied } = applyQuestioningToLesson(lesson, [text]);
            if (applied) {
              onApplyLesson(next, buildAppliedSuggestionMessage("questioning"));
              return true;
            }
            return false;
          },
        }))}
      />

      <ActionableCoachList
        label="Differentiation ideas"
        items={report.differentiationIdeas.map((text, index) => ({
          id: `diff-${index}`,
          text,
          actionLabel: "Add differentiation",
          onApply: () => applyField("differentiation", text, "differentiation", true),
        }))}
        empty="Add differentiation in activities or notes to unlock targeted ideas."
      />

      <ActionableCoachList
        label="Assessment evidence"
        items={report.assessmentEvidence.map((text, index) => ({
          id: `assess-${index}`,
          text,
          actionLabel: "Add evidence",
          onApply: () => applyField("assessmentNotes", text, "assessment evidence", true),
        }))}
        empty="Add a lesson ending or assessment note to plan evidence collection."
      />

      <ActionableCoachList
        label="Watch for common mistakes"
        items={report.commonMistakes.map((text, index) => ({
          id: `mistake-${index}`,
          text,
          actionLabel: "Add note",
          onApply: () => {
            const { form: next, result } = applyCommonMistakeNote(lesson, text);
            if (result.applied) {
              onApplyLesson(next, buildAppliedSuggestionMessage("teacher notes"));
              return true;
            }
            return false;
          },
        }))}
      />
    </PECoachPanel>
  );
}
