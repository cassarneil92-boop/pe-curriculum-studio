"use client";

import { useMemo } from "react";
import { PECoachPanel } from "@/components/pe-knowledge/PECoachPanel";
import { PedagogySuggestionList } from "@/components/pe-knowledge/PedagogySuggestionList";
import type { SchemeOfWork } from "@/lib/types";
import {
  buildSchemeProgressionCoachReport,
  toPEKnowledgeCardViewModel,
} from "@/src/lib/peKnowledge/coaching";

type SchemeSlice = Pick<
  SchemeOfWork,
  "lessons" | "topicId" | "yearGroup" | "pathway" | "selectedPathways" | "pedagogicalModels"
>;

interface SchemeProgressionCoachProps {
  scheme: SchemeSlice;
}

export function SchemeProgressionCoach({ scheme }: SchemeProgressionCoachProps) {
  const report = useMemo(() => buildSchemeProgressionCoachReport(scheme), [scheme]);

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
    .map(toPEKnowledgeCardViewModel);

  return (
    <div className="space-y-4">
      <PECoachPanel
        title="Progression Coach"
        description="Scheme-level guidance from the PE knowledge base."
      >
        <PECoachPanel.Section label="Lesson sequencing" items={report.sequencingTips} />
        <PECoachPanel.Section label="Spacing & retrieval" items={report.spacingTips} />
        <PECoachPanel.Section label="Simple → complex" items={report.progressionTips} />
        <PECoachPanel.Section
          label="Physical · cognitive · social · affective"
          items={report.holisticBalanceTips}
        />
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
