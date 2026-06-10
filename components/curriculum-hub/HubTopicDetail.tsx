"use client";

import Link from "next/link";
import { VisibilityNote } from "@/components/design/VisibilityNote";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TOPIC_THEMES } from "@/lib/design/topic-theme";
import {
  filterOutcomesBySkill,
  formatOutcomeSource,
  formatOutcomeValuesList,
  formatOutcomeYearGroups,
  getSkillsFromOutcomes,
  groupOutcomesByAppPathway,
  type HubTopicGroup,
} from "@/lib/curriculum-hub/engine";
import {
  buildCalendarLink,
  buildLessonBuilderLink,
  buildSchemesLink,
  type HubPlanningParams,
} from "@/lib/curriculum-hub/planning-links";
import {
  IMPORTED_PATHWAY_LABELS,
  isImportedOutcomeVisible,
  type TeacherContextSnapshot,
} from "@/lib/teacher-context";
import { getYearGroupLabel } from "@/lib/year-groups";
import type { ImportedLearningOutcomeRecord } from "@/src/lib/curriculum/coverage";

interface HubTopicDetailProps {
  topic: HubTopicGroup;
  planning: HubPlanningParams;
  context: TeacherContextSnapshot;
  selectedSkill: string;
  onSkillSelect: (skill: string) => void;
  onBack: () => void;
}

export function HubTopicDetail({
  topic,
  planning,
  context,
  selectedSkill,
  onSkillSelect,
  onBack,
}: HubTopicDetailProps) {
  const theme = TOPIC_THEMES[topic.color];
  const skills = getSkillsFromOutcomes(topic.outcomes);
  const displayedOutcomes = filterOutcomesBySkill(topic.outcomes, selectedSkill);
  const pathwaySections = groupOutcomesByAppPathway(
    displayedOutcomes,
    planning.appPathways
  );

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-800"
      >
        ← Back to topics
      </button>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl ${theme.iconBg}`}
          >
            {topic.emoji}
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {topic.category}
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">{topic.name}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {getYearGroupLabel(planning.yearGroupId)} · {topic.totalCount} outcomes ·{" "}
              {topic.skillsCount} skills
            </p>
            {topic.pathwayLabels.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {topic.pathwayLabels.map((label) => (
                  <Badge key={label} tone="teal">
                    {label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={buildLessonBuilderLink({
              ...planning,
              skillLabel: selectedSkill || undefined,
            })}
          >
            <Button variant="secondary">Create lesson</Button>
          </Link>
          <Link
            href={buildSchemesLink({ ...planning, skillLabel: selectedSkill || undefined })}
          >
            <Button variant="secondary">Add to scheme</Button>
          </Link>
          <Link
            href={buildCalendarLink({ ...planning, skillLabel: selectedSkill || undefined })}
          >
            <Button variant="ghost">Add to calendar</Button>
          </Link>
        </div>
      </div>

      {skills.length > 0 && (
        <Card className="mb-6">
          <p className="mb-3 text-sm font-medium text-slate-800">Skills</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSkillSelect("")}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                !selectedSkill
                  ? "border-teal-500 bg-teal-50 text-teal-800"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              All skills
            </button>
            {skills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => onSkillSelect(skill)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  selectedSkill === skill
                    ? "border-teal-500 bg-teal-50 text-teal-800"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </Card>
      )}

      {displayedOutcomes.length === 0 ? (
        <Card>
          <p className="text-sm font-medium text-slate-800">
            No exact learning outcomes found for this selection.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Try another skill, year group, or enable Explore All in Settings.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {pathwaySections.map((section) => (
            <section key={section.pathwayId}>
              <h2 className="mb-3 text-sm font-semibold text-slate-800">{section.label}</h2>
              <ul className="space-y-3">
                {section.outcomes.map((outcome) => (
                  <OutcomeRow
                    key={outcome.id}
                    outcome={outcome}
                    theme={theme}
                    context={context}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function OutcomeRow({
  outcome,
  theme,
  context,
}: {
  outcome: ImportedLearningOutcomeRecord;
  theme: (typeof TOPIC_THEMES)[keyof typeof TOPIC_THEMES];
  context: TeacherContextSnapshot;
}) {
  const inContext = isImportedOutcomeVisible(outcome, context);
  const values = formatOutcomeValuesList(outcome);

  return (
    <li className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-xs font-semibold ${theme.text}`}>{outcome.code}</span>
        <Badge tone="teal">
          {IMPORTED_PATHWAY_LABELS[
            outcome.pathwayId as keyof typeof IMPORTED_PATHWAY_LABELS
          ] ?? outcome.pathwayLabel}
        </Badge>
        {!inContext && <VisibilityNote />}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{outcome.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {outcome.skills?.map((skill) => (
          <Badge key={skill} tone="blue">
            {skill}
          </Badge>
        ))}
      </div>
      {values && values !== "—" && (
        <p className="mt-2 text-xs text-violet-700">Values: {values}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
        <span>{formatOutcomeYearGroups(outcome)}</span>
        <span>Source: {formatOutcomeSource(outcome)}</span>
        {outcome.strand && <span>{outcome.strand}</span>}
      </div>
    </li>
  );
}
