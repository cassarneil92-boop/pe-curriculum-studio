"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SOWPlanningBoard } from "@/components/scheme-builder/SOWPlanningBoard";
import { SOWPreviewTable } from "@/components/scheme-builder/SOWPreviewTable";
import { SOWSchemeSetup } from "@/components/scheme-builder/SOWSchemeSetup";
import { useApp } from "@/components/providers/AppProvider";
import { TopicIcon } from "@/components/design/TopicIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { getDefaultHubPathways } from "@/lib/curriculum-hub/pathway-defaults";
import { DEFAULT_YEAR_GROUP_ID, getPathwayLabel } from "@/lib/constants";
import { getTopicTheme } from "@/lib/design/topic-theme";
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
import {
  createLessonsForCount,
  getSchemeSelectedPathways,
  getSkillName,
  getTopicName,
  lessonCountLabel,
  schemeDisplayTitle,
  suggestedSchemeTitle,
  syncLessonsToCount,
} from "@/lib/scheme-builder/helpers";
import {
  isAppPathwayVisible,
  pickYearGroupForPathwayFilter,
  pickYearGroupForPathwaysFilter,
} from "@/lib/teacher-context";
import { getYearGroupLabel } from "@/lib/year-groups";
import { AlignmentScoreCard } from "@/components/intelligence/AlignmentScoreCard";
import { buildSchemeAdvisoryAlignment } from "@/src/lib/intelligence/advisory/scheme-alignment";
import type { PathwayId, SchemeOfWork, SOWLesson, YearGroup } from "@/lib/types";

type BuilderView = "build" | "preview";

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
  const [builderView, setBuilderView] = useState<BuilderView>("build");
  const [expandedListId, setExpandedListId] = useState<string | null>(null);

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
    setBuilderView("build");
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
    setBuilderView("build");
  };

  const startEditScheme = (scheme: SchemeOfWork) => {
    setEditingId(scheme.id);

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
    setBuilderView("build");
  };

  const closeBuilder = () => {
    setEditingId(null);
    setDraft(null);
    setBuilderView("build");
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
    if (editingId) {
      updateScheme(editingId, draft);
    } else {
      addScheme(draft);
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

  if (draft) {
    const previewScheme: SchemeOfWork = {
      ...draft,
      id: editingId ?? "preview",
      createdAt: "",
      updatedAt: "",
    };

    return (
      <div>
        <PageHeader
          eyebrow="Planning"
          title={editingId ? "Edit scheme of work" : "New scheme of work"}
          description="Pick pathways and a topic, drag cards into lesson rows, then preview your professional scheme table."
          action={
            <div className="flex gap-2">
              <Button variant="ghost" onClick={closeBuilder}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save scheme</Button>
            </div>
          }
        />

        <div className="mb-6 flex gap-2">
          <Button
            variant={builderView === "build" ? "primary" : "secondary"}
            onClick={() => setBuilderView("build")}
          >
            Planning board
          </Button>
          <Button
            variant={builderView === "preview" ? "primary" : "secondary"}
            onClick={() => setBuilderView("preview")}
          >
            Preview table
          </Button>
        </div>

        {builderView === "preview" ? (
          <SOWPreviewTable scheme={previewScheme} />
        ) : (
          <div className="space-y-6">
            <SOWSchemeSetup
              draft={draft}
              topicOptions={topicOptions}
              topicSkills={topicSkills}
              suggestedOutcomeCount={outcomeSuggestions.strict.length + outcomeSuggestions.additional.length}
              exploreAllNote={context.exploreAllEnabled}
              onPathwaysChange={handlePathwaysChange}
              onYearGroupChange={handleYearGroupChange}
              onTopicChange={handleTopicChange}
              onSkillChange={handleSkillChange}
              onUpdate={updateDraft}
              onLessonCountChange={handleLessonCountChange}
            />

            {advisoryAlignment && <AlignmentScoreCard report={advisoryAlignment} />}

            <SOWPlanningBoard
              topicName={getTopicName(draft.topicId)}
              skillName={getSkillName(draft.skillId)}
              outcomeSuggestions={outcomeSuggestions}
              selectedPathways={draftPathways}
              lessons={draft.lessons}
              alignmentReady={alignmentReady}
              onLessonsChange={(lessons) => updateDraft({ lessons })}
            />

            <div className="flex justify-end gap-3 pb-8">
              <Button variant="secondary" onClick={() => setBuilderView("preview")}>
                Preview table →
              </Button>
              <Button onClick={handleSave}>Save scheme</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Planning"
        title="Schemes of Work"
        description="Visual planning boards for term-long schemes — with curriculum-aligned learning outcomes."
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
                        expanded={expandedListId === scheme.id}
                        onToggle={() =>
                          setExpandedListId(expandedListId === scheme.id ? null : scheme.id)
                        }
                        onEdit={() => startEditScheme(scheme)}
                        onDelete={() => deleteScheme(scheme.id)}
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
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  scheme: SchemeOfWork;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const topicName = getTopicName(scheme.topicId) || scheme.title;
  const theme = getTopicTheme(topicName);
  const schemePathways = getSchemeSelectedPathways(scheme);
  const filledLessons = scheme.lessons.filter(
    (lesson) => lesson.walt || lesson.wilf || lesson.activities.trim()
  ).length;
  const coverage = scheme.lessons.length ? filledLessons / scheme.lessons.length : 0;

  return (
    <Card padding={false} className="overflow-hidden">
      <button type="button" onClick={onToggle} className="w-full p-5 text-left">
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
              {scheme.plannedLessonCount ? (
                <span>· {scheme.plannedLessonCount} planned</span>
              ) : null}
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

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-4">
          <SOWPreviewTable scheme={scheme} />
          <div className="mt-4 flex items-center justify-between">
            <Button variant="secondary" onClick={onEdit}>
              Edit scheme
            </Button>
            <Button variant="ghost" className="text-xs text-rose-600" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
