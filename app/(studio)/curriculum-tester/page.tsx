"use client";

import { useMemo, useState } from "react";
import { PlanningOutcomeSections } from "@/components/planning/PlanningOutcomeSections";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldGroup, Select } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import { YearGroupSelect } from "@/components/shared/YearGroupSelect";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { curriculumPathwayToAppPathways } from "@/lib/scheme-builder/pathway-map";
import { getYearGroupLabel } from "@/lib/year-groups";
import { getPathwayById, PATHWAYS, type PathwayId } from "@/src/lib/curriculum";
import {
  getPlanningOutcomeSuggestions,
  getPlanningSkillOptions,
  getPlanningTopicOptions,
  getPlanningTopicDisplayName,
  getPlanningSkillDisplayName,
} from "@/src/lib/curriculum/planning";

export default function CurriculumTesterPage() {
  const { context } = useTeacherContext();
  const [pathwayId, setPathwayId] = useState<PathwayId | "">("");
  const [yearGroup, setYearGroup] = useState("");
  const [topicId, setTopicId] = useState("");
  const [skillId, setSkillId] = useState("");
  const [selectedOutcomeIds, setSelectedOutcomeIds] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);

  const appPathways = useMemo(
    () => (pathwayId ? curriculumPathwayToAppPathways(pathwayId) : []),
    [pathwayId]
  );

  const topicOptions = useMemo(() => {
    if (appPathways.length === 0) return [];
    return getPlanningTopicOptions(appPathways, yearGroup, context);
  }, [appPathways, yearGroup, context]);

  const topicSkills = useMemo(() => {
    if (!topicId || appPathways.length === 0) return [];
    return getPlanningSkillOptions(appPathways, yearGroup, topicId, context);
  }, [appPathways, yearGroup, topicId, context]);

  const canSearch = Boolean(pathwayId && topicId && skillId);

  const outcomeSuggestions = useMemo(() => {
    if (!canSearch || appPathways.length === 0) {
      return { strict: [], additional: [], allSuggestedIds: new Set<string>() };
    }
    return getPlanningOutcomeSuggestions({
      appPathways,
      yearGroup,
      topicId,
      skillId,
      context,
    });
  }, [canSearch, appPathways, yearGroup, topicId, skillId, context]);

  function handlePathwayChange(nextPathwayId: PathwayId | "") {
    setPathwayId(nextPathwayId);
    setTopicId("");
    setSkillId("");
    setSelectedOutcomeIds([]);
    setSearched(false);
  }

  function handleTopicChange(nextTopicId: string) {
    setTopicId(nextTopicId);
    setSkillId("");
    setSelectedOutcomeIds([]);
    setSearched(false);
  }

  function handleFindOutcomes() {
    if (!canSearch) return;
    setSearched(true);
  }

  function toggleOutcome(id: string) {
    setSelectedOutcomeIds((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
    );
  }

  const pathwayLabel = pathwayId ? getPathwayById(pathwayId)?.label ?? pathwayId : "";
  const topicLabel = topicId ? getPlanningTopicDisplayName(topicId) : "";
  const skillLabel = skillId ? getPlanningSkillDisplayName(skillId) : "";

  return (
    <div>
      <PageHeader
        title="Curriculum Tester"
        description="Verify strict KB alignment and additional imported outcomes before building lesson plans."
      />

      <p className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Topics and skills come from the unified planning layer. Strict matches use the knowledge
        base alignment engine; additional outcomes include imported and metadata-enhanced content.
        Suggested outcomes are not auto-selected.
      </p>

      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FieldGroup label="Pathway">
            <Select
              value={pathwayId}
              onChange={(e) => handlePathwayChange(e.target.value as PathwayId | "")}
            >
              <option value="">Select pathway</option>
              {PATHWAYS.map((pathway) => (
                <option key={pathway.id} value={pathway.id}>
                  {pathway.label}
                </option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup label="Year group">
            <YearGroupSelect
              allowEmpty
              emptyLabel="Any year"
              value={yearGroup}
              onChange={(e) => {
                setYearGroup(e.target.value);
                setSelectedOutcomeIds([]);
                setSearched(false);
              }}
            />
          </FieldGroup>

          <FieldGroup label="Topic">
            <Select value={topicId} onChange={(e) => handleTopicChange(e.target.value)} disabled={!pathwayId}>
              <option value="">Select topic</option>
              {topicOptions.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.label}
                  {topic.outcomeCount > 0 ? ` (${topic.outcomeCount})` : ""}
                </option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup label="Skill">
            <Select
              value={skillId}
              onChange={(e) => {
                setSkillId(e.target.value);
                setSelectedOutcomeIds([]);
                setSearched(false);
              }}
              disabled={!topicId}
            >
              <option value="">
                {topicId ? "Select skill" : "Choose a topic first"}
              </option>
              {topicSkills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
        </div>

        <div className="mt-5">
          <Button onClick={handleFindOutcomes} disabled={!canSearch}>
            Find Matching Outcomes
          </Button>
        </div>
      </Card>

      {searched && (
        <section>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {pathwayLabel && <Badge tone="teal">{pathwayLabel}</Badge>}
            {yearGroup && <Badge tone="slate">{getYearGroupLabel(yearGroup)}</Badge>}
            {topicLabel && <Badge tone="blue">{topicLabel}</Badge>}
            {skillLabel && <Badge tone="amber">{skillLabel}</Badge>}
          </div>

          <PlanningOutcomeSections
            strict={outcomeSuggestions.strict}
            additional={outcomeSuggestions.additional}
            selectedIds={selectedOutcomeIds}
            selectedPathways={appPathways}
            onToggle={toggleOutcome}
            showMultiPathwayNote={appPathways.length > 1}
          />
        </section>
      )}
    </div>
  );
}
