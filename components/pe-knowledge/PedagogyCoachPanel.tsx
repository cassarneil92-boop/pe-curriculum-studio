"use client";

import { useMemo } from "react";
import { PECoachPanel } from "@/components/pe-knowledge/PECoachPanel";
import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import { buildLessonPedagogyCoachReport } from "@/src/lib/peKnowledge/coaching";

interface PedagogyCoachPanelProps {
  lesson: LessonBuilderFormData;
}

export function PedagogyCoachPanel({ lesson }: PedagogyCoachPanelProps) {
  const report = useMemo(() => buildLessonPedagogyCoachReport(lesson), [lesson]);

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

      <PECoachPanel.Section label="WALT / WILF" items={report.waltWilfTips} />

      {report.questioningPrompts.length > 0 && (
        <PECoachPanel.Section
          label="Questioning & TGfU prompts"
          items={report.questioningPrompts}
        />
      )}

      <PECoachPanel.Section
        label="Differentiation ideas"
        items={report.differentiationIdeas}
        empty="Add differentiation in activities or notes to unlock targeted ideas."
      />

      <PECoachPanel.Section
        label="Assessment evidence"
        items={report.assessmentEvidence}
        empty="Add a lesson ending or assessment note to plan evidence collection."
      />

      {report.commonMistakes.length > 0 && (
        <PECoachPanel.Section
          label="Watch for common mistakes"
          items={report.commonMistakes}
        />
      )}
    </PECoachPanel>
  );
}
