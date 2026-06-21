"use client";

import { SOWCardBank } from "@/components/scheme-builder/SOWCardBank";
import { AlignmentScoreCard } from "@/components/intelligence/AlignmentScoreCard";
import { CoachingPanel } from "@/components/intelligence/CoachingPanel";
import { Card } from "@/components/ui/Card";
import type { PlanningOutcomeSuggestions } from "@/lib/scheme-builder/curriculum-options";
import type { AdvisoryAlignmentReport } from "@/src/lib/intelligence/advisory/scheme-alignment";
import type { SchemeCoachingFeedback } from "@/src/lib/intelligence/coach/scheme-coach";
import type { PathwayId, SOWLesson } from "@/lib/types";
import type { SOWCardZone } from "@/lib/scheme-builder/lesson-actions";

interface SchemePlanningAssistantProps {
  topicName: string;
  skillName: string;
  outcomeSuggestions: PlanningOutcomeSuggestions;
  selectedPathways: PathwayId[];
  lessons: SOWLesson[];
  selectedLessonIndex: number;
  alignmentReady: boolean;
  advisoryAlignment?: AdvisoryAlignmentReport | null;
  coaching?: SchemeCoachingFeedback | null;
  showReviewContent?: boolean;
  onAddCard: (zone: SOWCardZone, payload: string) => void;
}

export function SchemePlanningAssistant({
  topicName,
  skillName,
  outcomeSuggestions,
  selectedPathways,
  lessons,
  selectedLessonIndex,
  alignmentReady,
  advisoryAlignment,
  coaching,
  showReviewContent = false,
  onAddCard,
}: SchemePlanningAssistantProps) {
  if (!alignmentReady) {
    return (
      <Card className="text-center">
        <p className="text-sm font-medium text-slate-800">Planning assistant</p>
        <p className="mt-2 text-sm text-slate-500">
          Choose a topic in scheme setup to unlock suggestions.
        </p>
      </Card>
    );
  }

  const lessonNumber = lessons[selectedLessonIndex]?.lessonNumber ?? selectedLessonIndex + 1;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-teal-100 bg-teal-50/40 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
          Planning assistant
        </p>
        <p className="mt-1 text-sm text-slate-700">
          Adding to <span className="font-semibold">Lesson {lessonNumber}</span>
          {skillName && skillName !== "Select skill" ? (
            <>
              {" "}
              · <span className="font-medium">{skillName}</span>
            </>
          ) : null}{" "}
          — click a card to insert.
        </p>
      </div>

      {!alignmentReady ? (
        <Card className="text-center text-sm text-slate-500">
          Select a skill focus for this lesson to see curriculum suggestions.
        </Card>
      ) : (
        <Card padding={false} className="overflow-hidden">
          <div className="max-h-[min(52vh,520px)] overflow-y-auto p-3">
            <SOWCardBank
              topicName={topicName}
              skillName={skillName}
              outcomeSuggestions={outcomeSuggestions}
              selectedPathways={selectedPathways}
              lessons={lessons}
              selectedLessonIndex={selectedLessonIndex}
              onAddCard={onAddCard}
              compact
            />
          </div>
        </Card>
      )}

      {showReviewContent && alignmentReady && advisoryAlignment && (
        <AlignmentScoreCard report={advisoryAlignment} />
      )}

      {showReviewContent && alignmentReady && coaching && (
        <CoachingPanel
          title="Curriculum coaching"
          strengths={coaching.strengths}
          suggestions={coaching.suggestions}
          extra={coaching.strandBalance}
        />
      )}
    </div>
  );
}
