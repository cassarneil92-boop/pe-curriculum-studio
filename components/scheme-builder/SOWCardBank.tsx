"use client";

import { useState } from "react";
import { SOWPlanningCard } from "@/components/scheme-builder/SOWPlanningCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  buildWaltIdeas,
  SOW_ACTIVITY_CARDS,
  SOW_RESOURCE_OPTIONS,
  SOW_WILF_CARDS,
} from "@/lib/scheme-builder/constants";
import {
  isActivityUsedInLessons,
  isOutcomeUsedInLessons,
  isResourceUsedInLessons,
  isWaltUsedInLessons,
  isWilfUsedInLessons,
  type SOWCardZone,
} from "@/lib/scheme-builder/lesson-actions";
import type { PlanningOutcomeSuggestions } from "@/lib/scheme-builder/curriculum-options";
import {
  getPlanningOutcomePathwayBadges,
  getPlanningTopicDisplayName,
} from "@/src/lib/curriculum/planning";
import type { PathwayId, SOWLesson } from "@/lib/types";
import type { LearningOutcome } from "@/src/lib/curriculum";

interface SOWCardBankProps {
  topicName: string;
  skillName: string;
  outcomeSuggestions: PlanningOutcomeSuggestions;
  selectedPathways?: PathwayId[];
  lessons: SOWLesson[];
  selectedLessonIndex: number | null;
  onAddCard: (zone: SOWCardZone, payload: string) => void;
}

function ColumnShell({
  title,
  emoji,
  accent,
  children,
}: {
  title: string;
  emoji: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex min-w-[200px] flex-1 flex-col rounded-2xl border p-3 ${accent}`}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-700">
        {emoji} {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CustomCardInput({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (value: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="flex gap-1.5 pt-1">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-8 text-xs"
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) {
            onAdd(value.trim());
            setValue("");
          }
        }}
      />
      <Button
        type="button"
        variant="ghost"
        className="h-8 shrink-0 px-2 text-xs"
        disabled={!value.trim()}
        onClick={() => {
          if (!value.trim()) return;
          onAdd(value.trim());
          setValue("");
        }}
      >
        +
      </Button>
    </div>
  );
}

function OutcomeCards({
  outcomes,
  selectedPathways,
  lessons,
  disabled,
  onAdd,
}: {
  outcomes: LearningOutcome[];
  selectedPathways: PathwayId[];
  lessons: SOWLesson[];
  disabled: boolean;
  onAdd: (id: string) => void;
}) {
  return (
    <>
      {outcomes.map((outcome) => {
        const badges = getPlanningOutcomePathwayBadges(outcome, selectedPathways);
        const topicLabel = getPlanningTopicDisplayName(outcome.topicIds[0] ?? "");
        const pathwayFooter =
          badges.length > 0
            ? badges.join(" · ")
            : topicLabel !== ""
              ? topicLabel
              : undefined;

        return (
          <SOWPlanningCard
            key={outcome.id}
            tone="teal"
            title={outcome.code}
            subtitle={outcome.description}
            footer={pathwayFooter}
            used={isOutcomeUsedInLessons(lessons, outcome.id)}
            disabled={disabled}
            onClick={() => onAdd(outcome.id)}
          />
        );
      })}
    </>
  );
}

export function SOWCardBank({
  topicName,
  skillName,
  outcomeSuggestions,
  selectedPathways = [],
  lessons,
  selectedLessonIndex,
  onAddCard,
}: SOWCardBankProps) {
  const disabled = selectedLessonIndex === null;
  const waltIdeas = buildWaltIdeas(topicName, skillName);
  const { strict, additional } = outcomeSuggestions;
  const hasStrict = strict.length > 0;
  const hasAdditional = additional.length > 0;
  const hasOutcomes = hasStrict || hasAdditional;

  const handleAdd = (zone: SOWCardZone, payload: string) => {
    if (disabled) return;
    onAddCard(zone, payload);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Planning cards</h3>
          <p className="text-sm text-slate-500">
            {disabled
              ? "Select a lesson row below, then click a card to add it."
              : `Adding to Lesson ${(selectedLessonIndex ?? 0) + 1} — click any card`}
          </p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        <ColumnShell title="Learning Outcomes" emoji="🎯" accent="border-teal-100 bg-teal-50/30">
          {!hasOutcomes ? (
            <p className="text-xs text-slate-500">Complete topic &amp; skill to see LOs.</p>
          ) : (
            <>
              {selectedPathways.length > 1 && (
                <p className="mb-2 rounded-lg border border-amber-200 bg-amber-50/60 px-2 py-1.5 text-[10px] leading-snug text-amber-900">
                  Multiple pathways selected. Strict cards use the primary pathway. Additional cards
                  include all selected pathways.
                </p>
              )}

              {hasStrict && (
                <div className="mb-3">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-teal-800">
                    Strict curriculum matches
                  </p>
                  <OutcomeCards
                    outcomes={strict}
                    selectedPathways={selectedPathways}
                    lessons={lessons}
                    disabled={disabled}
                    onAdd={(id) => handleAdd("outcomes", id)}
                  />
                </div>
              )}

              {hasAdditional && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    {hasStrict
                      ? "Additional relevant outcomes"
                      : "Imported curriculum matches"}
                  </p>
                  {!hasStrict && (
                    <p className="mb-2 text-[10px] leading-snug text-slate-500">
                      No strict curated match — these imported outcomes match your topic and skill.
                    </p>
                  )}
                  <OutcomeCards
                    outcomes={additional}
                    selectedPathways={selectedPathways}
                    lessons={lessons}
                    disabled={disabled}
                    onAdd={(id) => handleAdd("outcomes", id)}
                  />
                </div>
              )}
            </>
          )}
        </ColumnShell>

        <ColumnShell title="WALT Ideas" emoji="💡" accent="border-blue-100 bg-blue-50/30">
          {waltIdeas.map((idea) => (
            <SOWPlanningCard
              key={idea}
              tone="blue"
              title={idea}
              used={isWaltUsedInLessons(lessons, idea)}
              disabled={disabled}
              onClick={() => handleAdd("walt", idea)}
            />
          ))}
          <CustomCardInput placeholder="Custom WALT" onAdd={(value) => handleAdd("walt", value)} />
        </ColumnShell>

        <ColumnShell title="WILF Ideas" emoji="✅" accent="border-purple-100 bg-purple-50/30">
          {SOW_WILF_CARDS.map((idea) => (
            <SOWPlanningCard
              key={idea}
              tone="purple"
              title={idea}
              used={isWilfUsedInLessons(lessons, idea)}
              disabled={disabled}
              onClick={() => handleAdd("wilf", idea)}
            />
          ))}
          <CustomCardInput placeholder="Custom WILF" onAdd={(value) => handleAdd("wilf", value)} />
        </ColumnShell>

        <ColumnShell title="Activities" emoji="🏃" accent="border-amber-100 bg-amber-50/30">
          {SOW_ACTIVITY_CARDS.map((activity) => (
            <SOWPlanningCard
              key={activity}
              tone="amber"
              title={activity}
              used={isActivityUsedInLessons(lessons, activity)}
              disabled={disabled}
              onClick={() => handleAdd("activities", activity)}
            />
          ))}
          <CustomCardInput
            placeholder="Custom activity"
            onAdd={(value) => handleAdd("activities", value)}
          />
        </ColumnShell>

        <ColumnShell title="Resources" emoji="📦" accent="border-slate-200 bg-slate-50/50">
          {SOW_RESOURCE_OPTIONS.map((resource) => (
            <SOWPlanningCard
              key={resource}
              tone="green"
              title={resource}
              used={isResourceUsedInLessons(lessons, resource)}
              disabled={disabled}
              onClick={() => handleAdd("resources", resource)}
            />
          ))}
          <CustomCardInput
            placeholder="Custom resource"
            onAdd={(value) => handleAdd("resources", value)}
          />
        </ColumnShell>
      </div>
    </div>
  );
}
