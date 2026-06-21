"use client";

import { useMemo } from "react";
import { ActionableCoachList } from "@/components/pe-knowledge/ActionableCoachList";
import { PECoachPanel } from "@/components/pe-knowledge/PECoachPanel";
import { PedagogySuggestionList } from "@/components/pe-knowledge/PedagogySuggestionList";
import type { SchemeOfWork, SOWLesson } from "@/lib/types";
import {
  buildSchemeProgressionCoachReport,
  toPEKnowledgeCardViewModel,
} from "@/src/lib/peKnowledge/coaching";
import {
  applyToSchemeLesson,
  buildAppliedSuggestionMessage,
} from "@/src/lib/peKnowledge/applySuggestions";

type SchemeSlice = Pick<
  SchemeOfWork,
  "lessons" | "topicId" | "yearGroup" | "pathway" | "selectedPathways" | "pedagogicalModels"
>;

interface SchemeProgressionCoachProps {
  scheme: SchemeSlice;
  activeLessonIndex: number;
  onApplyToLesson: (lessonIndex: number, lesson: SOWLesson, message: string) => void;
}

export function SchemeProgressionCoach({
  scheme,
  activeLessonIndex,
  onApplyToLesson,
}: SchemeProgressionCoachProps) {
  const report = useMemo(
    () => buildSchemeProgressionCoachReport(scheme, activeLessonIndex),
    [scheme, activeLessonIndex]
  );
  const activeLesson = scheme.lessons[activeLessonIndex];

  const applyScheme = (text: string, target: "coachNote" | "wilf" | "walt", label: string) => {
    if (!activeLesson) return false;
    const { lesson: next, result } = applyToSchemeLesson(activeLesson, target, text, {
      appendOnly: true,
    });
    if (result.applied) {
      onApplyToLesson(activeLessonIndex, next, buildAppliedSuggestionMessage(label));
      return true;
    }
    return false;
  };

  if (!scheme.topicId) {
    return (
      <PECoachPanel
        title="Progression Coach"
        description="Choose a topic to unlock scheme progression guidance."
      >
        <p className="text-xs text-slate-600">
          Specialist advice on sequencing, spacing, and holistic balance appears once your scheme
          has a topic and lessons.
        </p>
      </PECoachPanel>
    );
  }

  const topSuggestions = report.knowledgeSuggestions
    .slice(0, 2)
    .map((s) =>
      toPEKnowledgeCardViewModel(s, {
        topicId: scheme.topicId,
        yearGroup: scheme.yearGroup,
        pathway: scheme.selectedPathways?.[0] ?? scheme.pathway,
      })
    );

  const lessonLabel = activeLesson
    ? `Lesson ${activeLesson.lessonNumber}`
    : "selected lesson";

  return (
    <div className="space-y-4">
      <PECoachPanel
        title="Progression Coach"
        description={`Apply guidance to ${lessonLabel}. Select a lesson in the navigator first.`}
      >
        <ActionableCoachList
          label="Lesson sequencing"
          items={report.sequencingTips.map((text, index) => ({
            id: `seq-${index}`,
            text,
            actionLabel: "Add note",
            onApply: () => applyScheme(text, "coachNote", `${lessonLabel} sequencing`),
          }))}
        />
        <ActionableCoachList
          label="Spacing & retrieval"
          items={report.spacingTips.map((text, index) => ({
            id: `space-${index}`,
            text,
            actionLabel: "Add retrieval",
            onApply: () => applyScheme(`Retrieval: ${text}`, "coachNote", `${lessonLabel} retrieval`),
          }))}
        />
        <ActionableCoachList
          label="Simple → complex"
          items={report.progressionTips.map((text, index) => ({
            id: `prog-${index}`,
            text,
            actionLabel: "Add progression",
            onApply: () => applyScheme(text, "coachNote", `${lessonLabel} progression`),
          }))}
        />
        <ActionableCoachList
          label="Physical · cognitive · social · affective"
          items={report.holisticBalanceTips.map((text, index) => ({
            id: `holistic-${index}`,
            text,
            actionLabel: index === 0 ? "Add balance note" : "Add checkpoint",
            onApply: () =>
              applyScheme(
                text,
                index === 1 ? "wilf" : "coachNote",
                index === 1 ? `${lessonLabel} assessment checkpoint` : `${lessonLabel} domain balance`
              ),
          }))}
        />
        {(report.physicalLiteracyTips ?? []).length > 0 && (
          <ActionableCoachList
            label="Physical literacy progression"
            items={(report.physicalLiteracyTips ?? []).map((text, index) => ({
              id: `pl-${index}`,
              text,
              actionLabel: "Add PL note",
              onApply: () => applyScheme(text, "coachNote", `${lessonLabel} physical literacy`),
            }))}
          />
        )}
        {report.knowledgeSuggestions[0]?.entry.lessonPlanningPrompts[0] && (
          <ActionableCoachList
            label="Questioning focus"
            items={[
              {
                id: "questioning-focus",
                text: report.knowledgeSuggestions[0].entry.lessonPlanningPrompts[0],
                actionLabel: "Add focus",
                onApply: () =>
                  applyScheme(
                    `Questioning focus: ${report.knowledgeSuggestions[0].entry.lessonPlanningPrompts[0]}`,
                    "coachNote",
                    `${lessonLabel} questioning`
                  ),
              },
            ]}
          />
        )}
      </PECoachPanel>

      {topSuggestions.length > 0 && (
        <PedagogySuggestionList
          title="Related specialist guidance"
          description="Focused entries for this scheme context."
          suggestions={topSuggestions}
        />
      )}
    </div>
  );
}
