"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SchemeLessonEditor } from "@/components/scheme-builder/SchemeLessonEditor";
import { SchemeLessonNavigator } from "@/components/scheme-builder/SchemeLessonNavigator";
import { SchemePlanningAssistant } from "@/components/scheme-builder/SchemePlanningAssistant";
import { SchemeViewToggle, type SchemeDisplayMode } from "@/components/scheme-builder/SchemeViewToggle";
import { SOWPreviewTable } from "@/components/scheme-builder/SOWPreviewTable";
import { SOWSchemeSetup } from "@/components/scheme-builder/SOWSchemeSetup";
import { SOWScreenView } from "@/components/scheme-builder/SOWScreenView";
import { useApp } from "@/components/providers/AppProvider";
import { TopicIcon } from "@/components/design/TopicIcon";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { ExportMenu } from "@/components/shared/ExportMenu";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { getDefaultHubPathways } from "@/lib/curriculum-hub/pathway-defaults";
import { DEFAULT_YEAR_GROUP_ID, getPathwayLabel } from "@/lib/constants";
import { getTopicTheme } from "@/lib/design/topic-theme";
import { syncSchemeStatus } from "@/lib/progress/delivery";
import { buildSchemeExportHtml } from "@/lib/export";
import { parseHubPathwaysFromQuery } from "@/lib/curriculum-hub/planning-links";
import { SOW_TERMS } from "@/lib/scheme-builder/constants";
import {
  getPlanningOutcomeSuggestions,
  getSchemeSkillOptions,
  getSchemeTopicOptions,
  isSchemeSkillValid,
  isSchemeTopicValid,
  resolveSchemeAppPathways,
  type PlanningOutcomeSuggestions,
} from "@/lib/scheme-builder/curriculum-options";
import { exportSchemeDocument } from "@/lib/scheme-builder/export";
import {
  buildSchemeExportFilename,
  createLessonsForCount,
  getSchemeSelectedPathways,
  getSkillName,
  getTopicName,
  lessonCountLabel,
  lessonHasContent,
  schemeDisplayTitle,
  suggestedSchemeTitle,
  syncLessonsToCount,
} from "@/lib/scheme-builder/helpers";
import {
  addActivityToLesson,
  addOutcomeToLesson,
  addResourceToLesson,
  addWaltToLesson,
  addWilfToLesson,
  removeActivityFromLesson,
  removeOutcomeFromLesson,
  removeResourceFromLesson,
  removeWaltFromLesson,
  removeWilfFromLesson,
  replaceActivityInLesson,
  replaceResourceInLesson,
  replaceWaltInLesson,
  replaceWilfInLesson,
  type SOWCardZone,
} from "@/lib/scheme-builder/lesson-actions";
import {
  isAppPathwayVisible,
  pickYearGroupForPathwayFilter,
  pickYearGroupForPathwaysFilter,
} from "@/lib/teacher-context";
import { getYearGroupLabel } from "@/lib/year-groups";
import { analyseSchemeCoaching } from "@/src/lib/intelligence/coach/scheme-coach";
import { buildSchemeAdvisoryAlignment } from "@/src/lib/intelligence/advisory/scheme-alignment";
import type { PathwayId, SchemeOfWork, SOWLesson, YearGroup } from "@/lib/types";

type SchemeDraft = Omit<SchemeOfWork, "id" | "createdAt" | "updatedAt">;

const DEFAULT_LESSON_COUNT = 6;

function createEmptyDraft(contextPathways: PathwayId[]): SchemeDraft {
  const selectedPathways = contextPathways.length > 0 ? contextPathways : ["general-pe" as PathwayId];
  const pathway = selectedPathways[0];

  return {
    title: "",
    classGroup: "",
    pathway,
    selectedPathways,
    yearGroup: DEFAULT_YEAR_GROUP_ID,
    topicId: "",
    skillId: "",
    term: "Term 1",
    plannedLessonCount: DEFAULT_LESSON_COUNT,
    lessons: createLessonsForCount(DEFAULT_LESSON_COUNT),
  };
}

function getVisibleOutcomeIds(
  appPathways: PathwayId[],
  yearGroup: YearGroup,
  topicId: string,
  skillId: string,
  context: ReturnType<typeof useTeacherContext>["context"]
): Set<string> {
  if (!topicId || !skillId || appPathways.length === 0) return new Set();

  const suggestions = getPlanningOutcomeSuggestions({
    appPathways,
    yearGroup,
    topicId,
    skillId,
    context,
  });

  return suggestions.allSuggestedIds;
}

export default function SchemesPage() {
  const searchParams = useSearchParams();
  const hubPrefillApplied = useRef(false);
  const { data, addScheme, updateScheme, deleteScheme } = useApp();
  const { context } = useTeacherContext();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SchemeDraft | null>(null);
  const [viewingScheme, setViewingScheme] = useState<SchemeOfWork | null>(null);
  const [displayMode, setDisplayMode] = useState<SchemeDisplayMode>("screen");
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [setupOpen, setSetupOpen] = useState(true);

  const draftPathways = useMemo(
    () => (draft ? resolveSchemeAppPathways(draft.selectedPathways, draft.pathway) : []),
    [draft]
  );

  const topicOptions = useMemo(() => {
    if (!draft || draftPathways.length === 0) return [];
    return getSchemeTopicOptions(draftPathways, draft.yearGroup, context);
  }, [draft, draftPathways, context]);

  const topicSkills = useMemo(() => {
    if (!draft?.topicId || draftPathways.length === 0) return [];
    return getSchemeSkillOptions(draftPathways, draft.yearGroup, draft.topicId, context);
  }, [draft?.topicId, draft?.yearGroup, draftPathways, context]);

  const outcomeSuggestions: PlanningOutcomeSuggestions = useMemo(() => {
    if (!draft?.topicId || !draft.skillId || draftPathways.length === 0) {
      return { strict: [], additional: [], allSuggestedIds: new Set() };
    }

    return getPlanningOutcomeSuggestions({
      appPathways: draftPathways,
      yearGroup: draft.yearGroup,
      topicId: draft.topicId,
      skillId: draft.skillId,
      context,
    });
  }, [draft?.topicId, draft?.skillId, draft?.yearGroup, draftPathways, context]);

  const alignmentReady = Boolean(draft?.topicId && draft?.skillId && draftPathways.length > 0);

  const advisoryAlignment = useMemo(() => {
    if (!draft || !alignmentReady) return null;
    return buildSchemeAdvisoryAlignment(draft, context);
  }, [draft, alignmentReady, context]);

  const coaching = useMemo(() => {
    if (!draft || !alignmentReady) return null;
    const preview: SchemeOfWork = {
      ...draft,
      id: editingId ?? "preview",
      createdAt: "",
      updatedAt: "",
    };
    return analyseSchemeCoaching(preview, context);
  }, [draft, alignmentReady, context, editingId]);

  const schemesByTerm = useMemo(() => {
    const map = new Map<string, SchemeOfWork[]>();
    for (const term of SOW_TERMS) map.set(term, []);
    for (const scheme of data.schemes) {
      const term = SOW_TERMS.includes(scheme.term as (typeof SOW_TERMS)[number])
        ? scheme.term
        : "Term 1";
      map.get(term)!.push(scheme);
    }
    return map;
  }, [data.schemes]);

  useEffect(() => {
    if (hubPrefillApplied.current || !searchParams || searchParams.get("create") !== "1") {
      return;
    }

    hubPrefillApplied.current = true;

    const pathway = searchParams.get("pathway");
    const selectedPathwaysParam = searchParams.get("selectedPathways");
    const yearGroup = searchParams.get("yearGroup") as YearGroup | null;
    const topicId = searchParams.get("topic");
    const skillId = searchParams.get("skill");
    const appPathways = parseHubPathwaysFromQuery(pathway, selectedPathwaysParam).filter((p) =>
      isAppPathwayVisible(p, context)
    );

    const defaultPathways =
      appPathways.length > 0 ? appPathways : getDefaultHubPathways(context);
    const next = createEmptyDraft(defaultPathways);

    if (defaultPathways.length > 0) {
      next.selectedPathways = defaultPathways;
      next.pathway = defaultPathways[0];
    }

    if (yearGroup) {
      next.yearGroup =
        defaultPathways.length > 1
          ? pickYearGroupForPathwaysFilter(
              defaultPathways,
              yearGroup,
              context.visibleYearGroupIds,
              context.exploreAllEnabled
            )
          : pickYearGroupForPathwayFilter(
              next.pathway,
              yearGroup,
              context.visibleYearGroupIds,
              context.exploreAllEnabled
            );
    } else if (defaultPathways.length > 0) {
      next.yearGroup = pickYearGroupForPathwaysFilter(
        defaultPathways,
        context.teacher.yearGroups[0] ?? DEFAULT_YEAR_GROUP_ID,
        context.visibleYearGroupIds,
        context.exploreAllEnabled
      );
    }

    if (topicId && isSchemeTopicValid(defaultPathways, next.yearGroup, topicId, context)) {
      next.topicId = topicId;
      next.title = suggestedSchemeTitle(
        topicId,
        getYearGroupLabel(next.yearGroup),
        next.term
      );
    }

    if (
      skillId &&
      next.topicId &&
      isSchemeSkillValid(defaultPathways, next.yearGroup, next.topicId, skillId, context)
    ) {
      next.skillId = skillId;
    }

    setEditingId(null);
    setDraft(next);
    setViewingScheme(null);
    setActiveLessonIndex(0);
    setSetupOpen(true);
  }, [searchParams, context]);

  const startNewScheme = () => {
    const defaultPathways = getDefaultHubPathways(context);
    const next = createEmptyDraft(defaultPathways);

    if (defaultPathways.length > 0) {
      next.yearGroup = pickYearGroupForPathwaysFilter(
        defaultPathways,
        context.teacher.yearGroups[0] ?? DEFAULT_YEAR_GROUP_ID,
        context.visibleYearGroupIds,
        context.exploreAllEnabled
      );
    }

    setEditingId(null);
    setDraft(next);
    setViewingScheme(null);
    setActiveLessonIndex(0);
    setSetupOpen(true);
    setDisplayMode("screen");
  };

  const startEditScheme = (scheme: SchemeOfWork) => {
    setEditingId(scheme.id);
    setViewingScheme(null);

    const appPathways = getSchemeSelectedPathways(scheme);
    const topicStillValid = isSchemeTopicValid(
      appPathways,
      scheme.yearGroup,
      scheme.topicId,
      context
    );
    const topicId = topicStillValid ? scheme.topicId : "";

    const skills = topicId
      ? getSchemeSkillOptions(appPathways, scheme.yearGroup, topicId, context)
      : [];
    const skillStillValid = skills.some((skill) => skill.id === scheme.skillId);
    const skillId = skillStillValid ? scheme.skillId : "";

    const visibleIds = getVisibleOutcomeIds(
      appPathways,
      scheme.yearGroup,
      topicId,
      skillId,
      context
    );

    setDraft({
      title: scheme.title,
      classGroup: scheme.classGroup,
      pathway: scheme.pathway,
      selectedPathways: appPathways,
      yearGroup: scheme.yearGroup,
      topicId,
      skillId,
      term: scheme.term,
      plannedLessonCount: scheme.plannedLessonCount ?? scheme.lessons.length,
      lessons: scheme.lessons.map((lesson) => ({
        ...lesson,
        learningOutcomeIds: lesson.learningOutcomeIds.filter((id) => visibleIds.has(id)),
      })),
    });
    setActiveLessonIndex(0);
    setSetupOpen(false);
    setDisplayMode("screen");
  };

  const openSchemeView = (scheme: SchemeOfWork) => {
    setViewingScheme(scheme);
    setDraft(null);
    setEditingId(null);
    setDisplayMode("screen");
  };

  const closeBuilder = () => {
    setEditingId(null);
    setDraft(null);
    setActiveLessonIndex(0);
  };

  const closeViewer = () => {
    setViewingScheme(null);
  };

  const updateDraft = (patch: Partial<SchemeDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const pruneLessonOutcomeSelections = (
    lessons: SOWLesson[],
    validOutcomeIds: Set<string>
  ): SOWLesson[] =>
    lessons.map((lesson) => ({
      ...lesson,
      learningOutcomeIds: lesson.learningOutcomeIds.filter((id) => validOutcomeIds.has(id)),
    }));

  const handleTopicChange = (topicId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        topicId,
        skillId: "",
        title:
          prev.title ||
          suggestedSchemeTitle(topicId, getYearGroupLabel(prev.yearGroup), prev.term),
        lessons: pruneLessonOutcomeSelections(prev.lessons, new Set()),
      };
    });
  };

  const handleSkillChange = (skillId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;

      const appPathways = resolveSchemeAppPathways(prev.selectedPathways, prev.pathway);
      const validSkill =
        !skillId ||
        isSchemeSkillValid(appPathways, prev.yearGroup, prev.topicId, skillId, context);
      const nextSkillId = validSkill ? skillId : "";
      const visibleIds = getVisibleOutcomeIds(
        appPathways,
        prev.yearGroup,
        prev.topicId,
        nextSkillId,
        context
      );

      return {
        ...prev,
        skillId: nextSkillId,
        lessons: pruneLessonOutcomeSelections(prev.lessons, visibleIds),
      };
    });
    if (skillId) setSetupOpen(false);
  };

  const handleYearGroupChange = (yearGroup: YearGroup) => {
    setDraft((prev) => {
      if (!prev) return prev;

      const appPathways = resolveSchemeAppPathways(prev.selectedPathways, prev.pathway);
      const topicStillValid = isSchemeTopicValid(appPathways, yearGroup, prev.topicId, context);
      const nextTopicId = topicStillValid ? prev.topicId : "";

      const skills = nextTopicId
        ? getSchemeSkillOptions(appPathways, yearGroup, nextTopicId, context)
        : [];
      const skillStillValid = skills.some((skill) => skill.id === prev.skillId);
      const nextSkillId = skillStillValid ? prev.skillId : "";

      const visibleIds = getVisibleOutcomeIds(
        appPathways,
        yearGroup,
        nextTopicId,
        nextSkillId,
        context
      );

      return {
        ...prev,
        yearGroup,
        topicId: nextTopicId,
        skillId: nextSkillId,
        lessons: pruneLessonOutcomeSelections(prev.lessons, visibleIds),
      };
    });
  };

  const handlePathwaysChange = (selectedPathways: PathwayId[]) => {
    setDraft((prev) => {
      if (!prev) return prev;

      const pathway = selectedPathways[0] ?? prev.pathway;
      const nextYearGroup =
        selectedPathways.length > 0
          ? pickYearGroupForPathwaysFilter(
              selectedPathways,
              prev.yearGroup,
              context.visibleYearGroupIds,
              context.exploreAllEnabled
            )
          : prev.yearGroup;

      const topicStillValid = isSchemeTopicValid(
        selectedPathways,
        nextYearGroup,
        prev.topicId,
        context
      );
      const nextTopicId = topicStillValid ? prev.topicId : "";

      const skills = nextTopicId
        ? getSchemeSkillOptions(selectedPathways, nextYearGroup, nextTopicId, context)
        : [];
      const skillStillValid = skills.some((skill) => skill.id === prev.skillId);
      const nextSkillId = skillStillValid ? prev.skillId : "";

      const visibleIds = getVisibleOutcomeIds(
        selectedPathways,
        nextYearGroup,
        nextTopicId,
        nextSkillId,
        context
      );

      return {
        ...prev,
        pathway,
        selectedPathways,
        yearGroup: nextYearGroup,
        topicId: nextTopicId,
        skillId: nextSkillId,
        lessons: pruneLessonOutcomeSelections(prev.lessons, visibleIds),
      };
    });
  };

  const handleSave = () => {
    if (!draft) return;
    const payload = syncSchemeStatus(draft);
    if (editingId) {
      updateScheme(editingId, payload);
    } else {
      addScheme(payload);
    }
    closeBuilder();
  };

  const handleLessonCountChange = (count: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const plannedLessonCount = Math.max(1, Math.min(52, count));
      return {
        ...prev,
        plannedLessonCount,
        lessons: syncLessonsToCount(plannedLessonCount, prev.lessons),
      };
    });
  };

  const updateLesson = (index: number, lesson: SOWLesson) => {
    if (!draft) return;
    updateDraft({
      lessons: draft.lessons.map((existing, i) => (i === index ? lesson : existing)),
    });
  };

  const handleAddCard = (zone: SOWCardZone, payload: string) => {
    if (!draft) return;
    const lesson = draft.lessons[activeLessonIndex];
    if (!lesson) return;

    let next = lesson;
    switch (zone) {
      case "outcomes":
        next = addOutcomeToLesson(lesson, payload);
        break;
      case "walt":
        next = addWaltToLesson(lesson, payload);
        break;
      case "wilf":
        next = addWilfToLesson(lesson, payload);
        break;
      case "activities":
        next = addActivityToLesson(lesson, payload);
        break;
      case "resources":
        next = addResourceToLesson(lesson, payload);
        break;
    }
    updateLesson(activeLessonIndex, next);
  };

  useEffect(() => {
    if (draft && activeLessonIndex >= draft.lessons.length) {
      setActiveLessonIndex(Math.max(0, draft.lessons.length - 1));
    }
  }, [draft, activeLessonIndex]);

  if (viewingScheme) {
    const exportHtml = buildSchemeExportHtml(viewingScheme);
    const exportFilename = buildSchemeExportFilename(viewingScheme);

    return (
      <div className="scheme-print-area -mx-6 lg:-mx-10">
        <StickyActionBar>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Scheme of work
              </p>
              <p className="truncate text-sm font-semibold text-slate-900">
                {schemeDisplayTitle(viewingScheme)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SchemeViewToggle mode={displayMode} onChange={setDisplayMode} />
              <ExportMenu html={exportHtml} filename={exportFilename} />
              <Button variant="secondary" onClick={() => startEditScheme(viewingScheme)}>
                Edit
              </Button>
              <Button variant="ghost" onClick={closeViewer}>
                ← Back
              </Button>
            </div>
          </div>
        </StickyActionBar>

        <div className="px-6 pt-6 lg:px-10">
          {displayMode === "screen" ? (
            <SOWScreenView scheme={viewingScheme} />
          ) : (
            <SOWPreviewTable scheme={viewingScheme} />
          )}
        </div>
      </div>
    );
  }

  if (draft) {
    const previewScheme: SchemeOfWork = {
      ...draft,
      id: editingId ?? "preview",
      createdAt: "",
      updatedAt: "",
    };
    const exportHtml = buildSchemeExportHtml(previewScheme);
    const exportFilename = buildSchemeExportFilename(previewScheme);
    const activeLesson = draft.lessons[activeLessonIndex];

    return (
      <div className="-mx-6 lg:-mx-10">
        <StickyActionBar>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {editingId ? "Editing scheme" : "New scheme"}
              </p>
              <p className="truncate text-sm font-semibold text-slate-900">
                {draft.title || "Untitled scheme"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SchemeViewToggle
                mode={displayMode}
                onChange={setDisplayMode}
                screenLabel="Planning"
                tableLabel="Table preview"
              />
              <ExportMenu html={exportHtml} filename={exportFilename} />
              <Button variant="ghost" onClick={closeBuilder}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save scheme</Button>
            </div>
          </div>
        </StickyActionBar>

        <div className="space-y-4 px-6 pt-4 lg:px-10">
          <Card padding={false} className="overflow-hidden">
            <button
              type="button"
              onClick={() => setSetupOpen((v) => !v)}
              className="flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-slate-50/80"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">Scheme setup</p>
                <p className="text-xs text-slate-500">
                  {getTopicName(draft.topicId) || "Choose topic"} ·{" "}
                  {getSkillName(draft.skillId) || "Choose skill"} · {draft.lessons.length} lessons
                </p>
              </div>
              <span className="text-xs text-slate-400">{setupOpen ? "Collapse" : "Expand"}</span>
            </button>
            {setupOpen && (
              <div className="border-t border-slate-100 px-5 py-4">
                <SOWSchemeSetup
                  draft={draft}
                  topicOptions={topicOptions}
                  topicSkills={topicSkills}
                  suggestedOutcomeCount={
                    outcomeSuggestions.strict.length + outcomeSuggestions.additional.length
                  }
                  exploreAllNote={context.exploreAllEnabled}
                  onPathwaysChange={handlePathwaysChange}
                  onYearGroupChange={handleYearGroupChange}
                  onTopicChange={handleTopicChange}
                  onSkillChange={handleSkillChange}
                  onUpdate={updateDraft}
                  onLessonCountChange={handleLessonCountChange}
                />
              </div>
            )}
          </Card>

          {displayMode === "table" ? (
            <SOWPreviewTable scheme={previewScheme} />
          ) : (
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
              <aside className="xl:w-52 xl:shrink-0">
                <div className="xl:sticky xl:top-[4.5rem]">
                  {alignmentReady ? (
                    <SchemeLessonNavigator
                      lessons={draft.lessons}
                      activeIndex={activeLessonIndex}
                      onSelect={setActiveLessonIndex}
                    />
                  ) : (
                    <Card className="text-center text-sm text-slate-500">
                      Set topic &amp; skill to unlock lesson navigator.
                    </Card>
                  )}
                </div>
              </aside>

              <main className="min-w-0 flex-1">
                {alignmentReady && activeLesson ? (
                  <SchemeLessonEditor
                    lesson={activeLesson}
                    onLessonChange={(next) => updateLesson(activeLessonIndex, next)}
                    onRemoveOutcome={(id) =>
                      updateLesson(activeLessonIndex, removeOutcomeFromLesson(activeLesson, id))
                    }
                    onRemoveWalt={(text) =>
                      updateLesson(activeLessonIndex, removeWaltFromLesson(activeLesson, text))
                    }
                    onEditWalt={(oldText, newText) =>
                      updateLesson(
                        activeLessonIndex,
                        replaceWaltInLesson(activeLesson, oldText, newText)
                      )
                    }
                    onRemoveWilf={(text) =>
                      updateLesson(activeLessonIndex, removeWilfFromLesson(activeLesson, text))
                    }
                    onEditWilf={(oldText, newText) =>
                      updateLesson(
                        activeLessonIndex,
                        replaceWilfInLesson(activeLesson, oldText, newText)
                      )
                    }
                    onRemoveActivity={(label) =>
                      updateLesson(
                        activeLessonIndex,
                        removeActivityFromLesson(activeLesson, label)
                      )
                    }
                    onEditActivity={(oldLabel, newLabel) =>
                      updateLesson(
                        activeLessonIndex,
                        replaceActivityInLesson(activeLesson, oldLabel, newLabel)
                      )
                    }
                    onRemoveResource={(resource) =>
                      updateLesson(
                        activeLessonIndex,
                        removeResourceFromLesson(activeLesson, resource)
                      )
                    }
                    onEditResource={(oldResource, newResource) =>
                      updateLesson(
                        activeLessonIndex,
                        replaceResourceInLesson(activeLesson, oldResource, newResource)
                      )
                    }
                  />
                ) : (
                  <Card className="text-center">
                    <p className="text-sm font-medium text-slate-800">
                      Choose a topic and skill to start planning lessons
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Expand scheme setup above to configure your scheme focus.
                    </p>
                  </Card>
                )}
              </main>

              <aside className="xl:w-80 xl:shrink-0">
                <div className="xl:sticky xl:top-[4.5rem]">
                  <SchemePlanningAssistant
                    topicName={getTopicName(draft.topicId)}
                    skillName={getSkillName(draft.skillId)}
                    outcomeSuggestions={outcomeSuggestions}
                    selectedPathways={draftPathways}
                    lessons={draft.lessons}
                    selectedLessonIndex={activeLessonIndex}
                    alignmentReady={alignmentReady}
                    advisoryAlignment={advisoryAlignment}
                    coaching={coaching}
                    onAddCard={handleAddCard}
                  />
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Planning"
        title="Schemes of Work"
        description="Plan term-long schemes with calm, card-based views — export when you're ready."
        action={<Button onClick={startNewScheme}>New scheme</Button>}
      />

      {data.schemes.length === 0 ? (
        <EmptyState
          title="Create your first Scheme of Work"
          description="Build a term-long progression linked to the right learning outcomes."
          icon="📋"
          action={<Button onClick={startNewScheme}>New scheme</Button>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {SOW_TERMS.map((term) => {
            const schemes = schemesByTerm.get(term) ?? [];
            return (
              <div key={term}>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  {term}
                </h2>
                <div className="space-y-3">
                  {schemes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                      No schemes yet
                    </div>
                  ) : (
                    schemes.map((scheme) => (
                      <SchemeCard
                        key={scheme.id}
                        scheme={scheme}
                        onView={() => openSchemeView(scheme)}
                        onEdit={() => startEditScheme(scheme)}
                        onDelete={() => deleteScheme(scheme.id)}
                        onExportPdf={() => exportSchemeDocument(scheme, "pdf")}
                        onExportWord={() => exportSchemeDocument(scheme, "word")}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SchemeCard({
  scheme,
  onView,
  onEdit,
  onDelete,
  onExportPdf,
  onExportWord,
}: {
  scheme: SchemeOfWork;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExportPdf: () => void;
  onExportWord: () => void;
}) {
  const topicName = getTopicName(scheme.topicId) || scheme.title;
  const theme = getTopicTheme(topicName);
  const schemePathways = getSchemeSelectedPathways(scheme);
  const filledLessons = scheme.lessons.filter(lessonHasContent).length;
  const coverage = scheme.lessons.length ? filledLessons / scheme.lessons.length : 0;

  return (
    <Card padding={false} className="overflow-hidden transition-shadow hover:shadow-md">
      <button type="button" onClick={onView} className="w-full p-5 text-left">
        <div className="flex items-start gap-3">
          <TopicIcon name={topicName} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">{schemeDisplayTitle(scheme)}</p>
            <p className="mt-1 text-sm text-slate-500">
              {scheme.classGroup || "No class set"}
              {scheme.topicId ? ` · ${getTopicName(scheme.topicId)}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {schemePathways.map((pathwayId) => (
                <Badge key={pathwayId} tone="blue">
                  {getPathwayLabel(pathwayId)}
                </Badge>
              ))}
              <Badge tone="slate">{getYearGroupLabel(scheme.yearGroup)}</Badge>
              {scheme.skillId && (
                <Badge tone="green">{getSkillName(scheme.skillId)}</Badge>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
              <span>{lessonCountLabel(scheme)}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${theme.bar}`}
                style={{ width: `${coverage * 100}%` }}
              />
            </div>
          </div>
        </div>
      </button>

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/50 px-4 py-3">
        <Button variant="secondary" className="h-8 text-xs" onClick={onView}>
          Open
        </Button>
        <Button variant="ghost" className="h-8 text-xs" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="ghost" className="h-8 text-xs" onClick={onExportPdf}>
          PDF
        </Button>
        <Button variant="ghost" className="h-8 text-xs" onClick={onExportWord}>
          Word
        </Button>
        <Button
          variant="ghost"
          className="ml-auto h-8 text-xs text-rose-600"
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}
