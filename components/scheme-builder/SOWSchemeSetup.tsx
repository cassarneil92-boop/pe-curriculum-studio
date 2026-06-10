"use client";

import { HubPathwayPicker } from "@/components/curriculum-hub/HubPathwayPicker";
import { Card, CardHeader } from "@/components/ui/Card";
import { FieldGroup, Input, Select } from "@/components/ui/Input";
import { YearGroupSelect } from "@/components/shared/YearGroupSelect";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { getPathwayLabel } from "@/lib/constants";
import { SOW_TERMS } from "@/lib/scheme-builder/constants";
import type {
  SchemeSkillOption,
  SchemeTopicOption,
} from "@/lib/scheme-builder/curriculum-options";
import {
  getSkillName,
  getTopicName,
  suggestedSchemeTitle,
} from "@/lib/scheme-builder/helpers";
import { getYearGroupLabel } from "@/lib/year-groups";
import type { PathwayId, YearGroup } from "@/lib/types";

interface SchemeSetupValues {
  title: string;
  classGroup: string;
  pathway: PathwayId;
  selectedPathways?: PathwayId[];
  yearGroup: YearGroup;
  topicId: string;
  skillId: string;
  term: string;
  plannedLessonCount: number;
}

interface SOWSchemeSetupProps {
  draft: SchemeSetupValues;
  topicOptions: SchemeTopicOption[];
  topicSkills: SchemeSkillOption[];
  suggestedOutcomeCount: number;
  exploreAllNote?: boolean;
  onPathwaysChange: (pathways: PathwayId[]) => void;
  onYearGroupChange: (yearGroup: YearGroup) => void;
  onTopicChange: (topicId: string) => void;
  onSkillChange: (skillId: string) => void;
  onUpdate: (patch: Partial<SchemeSetupValues>) => void;
  onLessonCountChange: (count: number) => void;
}

export function SOWSchemeSetup({
  draft,
  topicOptions,
  topicSkills,
  suggestedOutcomeCount,
  exploreAllNote,
  onPathwaysChange,
  onYearGroupChange,
  onTopicChange,
  onSkillChange,
  onUpdate,
  onLessonCountChange,
}: SOWSchemeSetupProps) {
  const { context } = useTeacherContext();
  const selectedPathways =
    draft.selectedPathways && draft.selectedPathways.length > 0
      ? draft.selectedPathways
      : draft.pathway
        ? [draft.pathway]
        : [];

  const pathwaySummary =
    selectedPathways.length > 1
      ? `${selectedPathways.length} pathways`
      : selectedPathways.length === 1
        ? getPathwayLabel(selectedPathways[0])
        : "No pathway selected";

  return (
    <Card>
      <CardHeader
        title="Scheme setup"
        description="Set your class context, select pathways, then pick a topic to unlock the planning board."
      />
      <div className="mb-6">
        <HubPathwayPicker
          selected={selectedPathways}
          context={context}
          onChange={onPathwaysChange}
        />
        {selectedPathways.length > 1 && (
          <p className="mt-2 text-xs text-amber-800">
            Multiple pathways selected. Strict matches use the primary pathway for now. Additional
            outcomes are shown from all selected pathways.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FieldGroup label="Scheme title">
          <Input
            value={draft.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder={
              draft.topicId
                ? suggestedSchemeTitle(
                    draft.topicId,
                    getYearGroupLabel(draft.yearGroup),
                    draft.term
                  )
                : "e.g. Volleyball — Term 1"
            }
          />
        </FieldGroup>
        <FieldGroup label="Year group">
          <YearGroupSelect
            pathwayIds={selectedPathways}
            value={draft.yearGroup}
            onChange={(e) => onYearGroupChange(e.target.value as YearGroup)}
            disabled={selectedPathways.length === 0}
          />
        </FieldGroup>
        <FieldGroup label="Class / group">
          <Input
            value={draft.classGroup}
            onChange={(e) => onUpdate({ classGroup: e.target.value })}
            placeholder="e.g. 9A"
          />
        </FieldGroup>
        <FieldGroup label="Term">
          <Select value={draft.term} onChange={(e) => onUpdate({ term: e.target.value })}>
            {SOW_TERMS.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Topic">
          <Select
            value={draft.topicId}
            onChange={(e) => onTopicChange(e.target.value)}
            disabled={selectedPathways.length === 0 || topicOptions.length === 0}
          >
            <option value="">
              {selectedPathways.length === 0
                ? "Select pathway first"
                : topicOptions.length === 0
                  ? "No topics for this filter"
                  : "Select topic"}
            </option>
            {topicOptions.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.label}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Skill focus">
          <Select
            value={draft.skillId}
            onChange={(e) => onSkillChange(e.target.value)}
            disabled={!draft.topicId}
          >
            <option value="">
              {draft.topicId ? "Select skill" : "Choose topic first"}
            </option>
            {topicSkills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Number of lessons">
          <Input
            type="number"
            min={1}
            max={52}
            value={draft.plannedLessonCount}
            onChange={(e) => onLessonCountChange(Number(e.target.value) || 1)}
          />
        </FieldGroup>
      </div>

      {draft.topicId && draft.skillId && (
        <p className="mt-4 text-xs text-slate-500">
          {getTopicName(draft.topicId)} · {getSkillName(draft.skillId)} · {pathwaySummary} ·{" "}
          {suggestedOutcomeCount} curriculum outcome
          {suggestedOutcomeCount === 1 ? "" : "s"} ready
          {exploreAllNote ? "" : " · Intelligent Mode active"}
        </p>
      )}
    </Card>
  );
}
