"use client";

import { useEffect, useMemo, useState } from "react";
import {
  HubFilters,
  createDefaultHubFilters,
  reconcileHubYearGroup,
} from "@/components/curriculum-hub/HubFilters";
import { HubTopicCard } from "@/components/curriculum-hub/HubTopicCard";
import { HubTopicDetail } from "@/components/curriculum-hub/HubTopicDetail";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import {
  filterOutcomesByPathwayAndYear,
  filterOutcomesForHub,
  groupOutcomesIntoTopicCards,
  type HubFilterState,
  type HubTopicGroup,
} from "@/lib/curriculum-hub/engine";
import { getPathwayLabel } from "@/lib/constants";
import { hasHiddenCurriculumContent } from "@/lib/teacher-context";
import type { PathwayId } from "@/lib/types";
import type { YearGroupId } from "@/lib/year-groups";
import { IMPORTED_LEARNING_OUTCOMES } from "@/src/lib/curriculum/coverage";

export default function CurriculumPage() {
  const { context } = useTeacherContext();
  const [filters, setFilters] = useState<HubFilterState>(() =>
    createDefaultHubFilters(context)
  );
  const [selectedTopic, setSelectedTopic] = useState<HubTopicGroup | null>(null);
  const [selectedSkill, setSelectedSkill] = useState("");

  useEffect(() => {
    if (filters.appPathways.length === 0 && !context.exploreAllEnabled) {
      const next = createDefaultHubFilters(context);
      setFilters((prev) => ({ ...prev, ...next }));
    }
  }, [context.teacher.pathways, context.exploreAllEnabled]);

  const showExploreBadge = hasHiddenCurriculumContent(context);

  const pathwayYearOutcomes = useMemo(
    () => filterOutcomesByPathwayAndYear(IMPORTED_LEARNING_OUTCOMES, filters),
    [filters.appPathways, filters.yearGroupId]
  );

  const filteredOutcomes = useMemo(
    () => filterOutcomesForHub(IMPORTED_LEARNING_OUTCOMES, filters, context),
    [filters, context]
  );

  const topicCards = useMemo(
    () =>
      groupOutcomesIntoTopicCards(
        filteredOutcomes,
        pathwayYearOutcomes,
        filters.appPathways,
        context
      ),
    [filteredOutcomes, pathwayYearOutcomes, filters.appPathways, context]
  );

  const contextReady = filters.appPathways.length > 0 && Boolean(filters.yearGroupId);

  const handlePathwaysChange = (appPathways: PathwayId[]) => {
    setSelectedTopic(null);
    setSelectedSkill("");
    setFilters((prev) => ({
      ...prev,
      appPathways,
      yearGroupId: reconcileHubYearGroup(appPathways, prev.yearGroupId, context),
    }));
  };

  const handleYearChange = (yearGroupId: YearGroupId) => {
    setSelectedTopic(null);
    setSelectedSkill("");
    setFilters((prev) => ({ ...prev, yearGroupId }));
  };

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  const handleTopicSelect = (topic: HubTopicGroup) => {
    setSelectedTopic(topic);
    setSelectedSkill("");
  };

  const handleBack = () => {
    setSelectedTopic(null);
    setSelectedSkill("");
  };

  const pathwaySummary = filters.appPathways.map((id) => getPathwayLabel(id)).join(" · ");

  if (selectedTopic && contextReady && filters.yearGroupId) {
    return (
      <div>
        <HubTopicDetail
          topic={selectedTopic}
          planning={{
            appPathways: filters.appPathways,
            yearGroupId: filters.yearGroupId,
            topicLabel: selectedTopic.name,
          }}
          context={context}
          selectedSkill={selectedSkill}
          onSkillSelect={setSelectedSkill}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Curriculum Hub"
        description="Explore your curriculum by year, topic and skill."
      />

      <HubFilters
        filters={filters}
        context={context}
        showExploreBadge={showExploreBadge}
        onPathwaysChange={handlePathwaysChange}
        onYearChange={handleYearChange}
        onSearchChange={handleSearchChange}
      />

      {filters.appPathways.length === 0 ? (
        <Card>
          <p className="text-sm font-medium text-slate-800">
            Choose at least one curriculum pathway to explore topics.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Select the pathways you teach, then pick a year group to browse topic cards.
          </p>
        </Card>
      ) : !filters.yearGroupId ? (
        <Card>
          <p className="text-sm font-medium text-slate-800">
            Select a year group to explore topics.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Year options reflect the combined range of your selected pathways.
          </p>
        </Card>
      ) : topicCards.length === 0 ? (
        <Card>
          <p className="text-sm font-medium text-slate-800">
            No topics found for this pathway and year group.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Try another year group, adjust your pathway selection, or enable Explore All
            Curriculum.
          </p>
        </Card>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500">
            {topicCards.length} topic{topicCards.length !== 1 ? "s" : ""} ·{" "}
            {filteredOutcomes.length} outcome{filteredOutcomes.length !== 1 ? "s" : ""} ·{" "}
            {pathwaySummary}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {topicCards.map((topic) => (
              <HubTopicCard
                key={topic.id}
                topic={topic}
                onClick={() => handleTopicSelect(topic)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
