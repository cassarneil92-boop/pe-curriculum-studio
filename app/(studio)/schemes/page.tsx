"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScheduleLessonModal } from "@/components/calendar/ScheduleLessonModal";
import { ScheduleSchemeModal } from "@/components/calendar/ScheduleSchemeModal";
import { createCalendarEntryFromSchemeLesson } from "@/lib/calendar/helpers";
import { findCalendarEntryForSchemeLesson } from "@/lib/calendar/scheduling-lookup";
import { SchemeProgressionCoach } from "@/components/pe-knowledge/SchemeProgressionCoach";
import { PedagogicalLensPanel } from "@/components/education/PedagogicalLensPanel";
import { PedagogicalQualityPanel } from "@/components/education/PedagogyInsightCard";
import { buildSchemePedagogicalQuality } from "@/lib/education/pedagogical-quality";
import type { PedagogicalModelId } from "@/src/lib/intelligence/frameworks/pedagogical-models";
import { SchemeLessonEditor } from "@/components/scheme-builder/SchemeLessonEditor";
import { SchemeLessonNavigator } from "@/components/scheme-builder/SchemeLessonNavigator";
import { SchemePlanningAssistant } from "@/components/scheme-builder/SchemePlanningAssistant";
import { SchemeViewToggle, type SchemeDisplayMode } from "@/components/scheme-builder/SchemeViewToggle";
import { SOWPreviewTable } from "@/components/scheme-builder/SOWPreviewTable";
import { SOWSchemeSetup } from "@/components/scheme-builder/SOWSchemeSetup";
import { SOWScreenView } from "@/components/scheme-builder/SOWScreenView";
import { useApp } from "@/components/providers/AppProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { buildLessonBuilderDraftFromScheme } from "@/lib/assistant/scheme-to-lesson-builder";
import { saveLessonDraft } from "@/lib/lesson-builder/draft";
import { useDeliverySync } from "@/hooks/useDeliverySync";
import { TopicIcon } from "@/components/design/TopicIcon";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { ExportMenu } from "@/components/shared/ExportMenu";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SchemesEmptyIllustration } from "@/components/ui/EmptyIllustrations";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { getDefaultHubPathways } from "@/lib/curriculum-hub/pathway-defaults";
import { DEFAULT_YEAR_GROUP_ID, getPathwayLabel } from "@/lib/constants";
import { getTopicTheme } from "@/lib/design/topic-theme";
import { syncSchemeStatus } from "@/lib/progress/delivery";
import { buildSchemeExportHtml } from "@/lib/export";
import { parseHubPathwaysFromQuery } from "@/lib/curriculum-hub/planning-links";
import { BrandLogoHorizontal } from "@/components/brand/BrandLogoHorizontal";
import { SchemeHealthCard } from "@/components/progress/SchemeHealthCard";
import { getPlanningTerms } from "@/lib/planning/terms";
import {
  buildSchemeProgressSummary,
  buildSchemesDashboardSummary,
} from "@/lib/progress/summary";
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
  pruneAllLessonsOutcomes,
  pruneLessonOutcomesForSkill,
  resolveLessonSkillId,
} from "@/lib/scheme-builder/lesson-skills";
import {
  isAppPathwayVisible,
  pickYearGroupForPathwayFilter,
  pickYearGroupForPathwaysFilter,
} from "@/lib/teacher-context";
import { getYearGroupLabel } from "@/lib/year-groups";
import { analyseSchemeCoaching } from "@/src/lib/intelligence/coach/scheme-coach";
import { buildSchemeAdvisoryAlignment } from "@/src/lib/intelligence/advisory/scheme-alignment";
import type { CalendarEntry, PathwayId, SchemeOfWork, SOWLesson, TimetableSlot, YearGroup } from "@/lib/types";

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
    pedagogicalModels: [],
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const hubPrefillApplied = useRef(false);
  const editPrefillApplied = useRef<string | null>(null);
  const { data, addScheme, updateScheme, deleteScheme, addCalendarEntry, updateCalendarEntry } =
    useApp();
  const { toast } = useToast();
  const { setSchemeLessonDelivery } = useDeliverySync();
  const { context } = useTeacherContext();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SchemeDraft | null>(null);
  const [viewingScheme, setViewingScheme] = useState<SchemeOfWork | null>(null);
  const [displayMode, setDisplayMode] = useState<SchemeDisplayMode>("screen");
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [setupOpen, setSetupOpen] = useState(true);
  const [scheduleSchemeId, setScheduleSchemeId] = useState<string | null>(null);
  const [scheduleLessonTarget, setScheduleLessonTarget] = useState<{
    schemeId: string;
    lessonNumber: number;
  } | null>(null);

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
    if (!draft?.topicId || draftPathways.length === 0) {
      return { strict: [], additional: [], allSuggestedIds: new Set() };
    }

    const activeLesson = draft.lessons[activeLessonIndex];
    const skillId = activeLesson
      ? resolveLessonSkillId(activeLesson, draft.skillId)
      : draft.skillId;

    if (!skillId) {
      return { strict: [], additional: [], allSuggestedIds: new Set() };
    }

    return getPlanningOutcomeSuggestions({
      appPathways: draftPathways,
      yearGroup: draft.yearGroup,
      topicId: draft.topicId,
      skillId,
      context,
    });
  }, [
    draft?.topicId,
    draft?.skillId,
    draft?.yearGroup,
    draft?.lessons,
    draftPathways,
    context,
    activeLessonIndex,
  ]);

  const activeLessonSkillId = useMemo(() => {
    if (!draft) return "";
    const lesson = draft.lessons[activeLessonIndex];
    if (!lesson) return "";
    return resolveLessonSkillId(lesson, draft.skillId);
  }, [draft, activeLessonIndex]);

  const alignmentReady = Boolean(draft?.topicId && draftPathways.length > 0);
  const lessonPlanningReady = alignmentReady && Boolean(activeLessonSkillId);

  const defaultOutcomeSuggestions: PlanningOutcomeSuggestions = useMemo(() => {
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

  const planningTerms = useMemo(
    () => getPlanningTerms(data.academicCalendar),
    [data.academicCalendar]
  );

  const handleOpenLessonInBuilder = () => {
    if (!draft) return;
    const lesson = draft.lessons[activeLessonIndex];
    if (!lesson) return;
    const form = buildLessonBuilderDraftFromScheme(draft, lesson);
    saveLessonDraft({ form, editingId: null, activeSection: "info" });
    toast("Lesson draft ready in Lesson Builder");
    router.push("/lesson-builder");
  };

  const handleScheduleScheme = (entries: Omit<CalendarEntry, "id">[]) => {
    for (const entry of entries) {
      addCalendarEntry(entry);
    }
  };

  const handleScheduleLesson = (
    scheme: SchemeOfWork,
    lessonNumber: number,
    result: { date: string; slot?: TimetableSlot; startTime?: string; endTime?: string }
  ) => {
    const existing = findCalendarEntryForSchemeLesson(data.calendar, scheme.id, lessonNumber);
    let draft = createCalendarEntryFromSchemeLesson(scheme, lessonNumber, result.date, result.slot);
    if (!draft) return;

    if (!result.slot && result.startTime) {
      draft = { ...draft, startTime: result.startTime, endTime: result.endTime };
    }

    if (existing) {
      updateCalendarEntry(existing.id, draft);
    } else {
      addCalendarEntry(draft);
    }
  };

  const schemesByTerm = useMemo(() => {
    const map = new Map<string, SchemeOfWork[]>();
    for (const term of planningTerms) map.set(term.name, []);
    for (const scheme of data.schemes) {
      const termName = map.has(scheme.term)
        ? scheme.term
        : planningTerms[0]?.name ?? "Term 1";
      if (!map.has(termName)) map.set(termName, []);
      map.get(termName)!.push(scheme);
    }
    return map;
  }, [data.schemes, planningTerms]);

  const dashboardSummary = useMemo(
    () => buildSchemesDashboardSummary(data.schemes),
    [data.schemes]
  );

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

  useEffect(() => {
    const editId = searchParams?.get("edit");
    if (!editId || editPrefillApplied.current === editId) return;

    const scheme = data.schemes.find((item) => item.id === editId);
    if (!scheme) return;

    editPrefillApplied.current = editId;
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
  }, [searchParams, data.schemes, context]);

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

  const pruneLessonsForSchemeContext = (
    lessons: SOWLesson[],
    schemeDefaultSkillId: string,
    topicId: string,
    yearGroup: YearGroup,
    appPathways: PathwayId[]
  ): SOWLesson[] => {
    if (!topicId) {
      return lessons.map((lesson) => ({
        ...lesson,
        skillId: undefined,
        learningOutcomeIds: [],
      }));
    }

    return pruneAllLessonsOutcomes(lessons, schemeDefaultSkillId, (skillId) =>
      getVisibleOutcomeIds(appPathways, yearGroup, topicId, skillId, context)
    );
  };

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
        lessons: prev.lessons.map((lesson) => ({
          ...lesson,
          skillId: undefined,
          learningOutcomeIds: [],
        })),
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

      return {
        ...prev,
        skillId: nextSkillId,
      };
    });
    if (skillId) setSetupOpen(false);
  };

  const handleLessonSkillChange = (lessonIndex: number, skillId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const lesson = prev.lessons[lessonIndex];
      if (!lesson) return prev;

      const appPathways = resolveSchemeAppPathways(prev.selectedPathways, prev.pathway);
      const nextLessonSkillId =
        !skillId || !isSchemeSkillValid(appPathways, prev.yearGroup, prev.topicId, skillId, context)
          ? undefined
          : skillId;

      const resolvedSkill = resolveLessonSkillId(
        { skillId: nextLessonSkillId },
        prev.skillId
      );
      const visibleIds = resolvedSkill
        ? getVisibleOutcomeIds(
            appPathways,
            prev.yearGroup,
            prev.topicId,
            resolvedSkill,
            context
          )
        : new Set<string>();

      const nextLesson: SOWLesson = {
        ...lesson,
        skillId: nextLessonSkillId,
      };

      return {
        ...prev,
        lessons: prev.lessons.map((existing, i) =>
          i === lessonIndex
            ? pruneLessonOutcomesForSkill(nextLesson, visibleIds)
            : existing
        ),
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

      return {
        ...prev,
        yearGroup,
        topicId: nextTopicId,
        skillId: nextSkillId,
        lessons: pruneLessonsForSchemeContext(
          prev.lessons,
          nextSkillId,
          nextTopicId,
          yearGroup,
          appPathways
        ),
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

      return {
        ...prev,
        pathway,
        selectedPathways,
        yearGroup: nextYearGroup,
        topicId: nextTopicId,
        skillId: nextSkillId,
        lessons: pruneLessonsForSchemeContext(
          prev.lessons,
          nextSkillId,
          nextTopicId,
          nextYearGroup,
          selectedPathways
        ),
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

  const liveViewingScheme = viewingScheme
    ? data.schemes.find((s) => s.id === viewingScheme.id) ?? viewingScheme
    : null;

  if (liveViewingScheme) {
    const exportHtml = buildSchemeExportHtml(liveViewingScheme);
    const exportFilename = buildSchemeExportFilename(liveViewingScheme);

    return (
      <div className="scheme-print-area -mx-6 lg:-mx-10">
        <StickyActionBar>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Scheme of work
              </p>
              <p className="truncate text-sm font-semibold text-slate-900">
                {schemeDisplayTitle(liveViewingScheme)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SchemeViewToggle mode={displayMode} onChange={setDisplayMode} />
              <ExportMenu html={exportHtml} filename={exportFilename} />
              <Button variant="secondary" onClick={() => startEditScheme(liveViewingScheme)}>
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
            <SOWScreenView
              scheme={liveViewingScheme}
              calendar={data.calendar}
              timetable={data.timetable}
              editableDelivery
              onLessonDeliveryChange={(lessonNumber, status) =>
                setSchemeLessonDelivery(liveViewingScheme, lessonNumber, status)
              }
              onScheduleLesson={(lessonNumber) =>
                setScheduleLessonTarget({
                  schemeId: liveViewingScheme.id,
                  lessonNumber,
                })
              }
            />
          ) : (
            <SOWPreviewTable scheme={liveViewingScheme} />
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
                  {draft.skillId
                    ? `Default: ${getSkillName(draft.skillId)}`
                    : "Per-lesson skills"} · {draft.lessons.length} lessons
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
                    defaultOutcomeSuggestions.strict.length +
                    defaultOutcomeSuggestions.additional.length
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

          {draft.topicId && (
            <div className="grid gap-4 lg:grid-cols-2">
              <PedagogicalLensPanel
                selected={draft.pedagogicalModels ?? []}
                topicId={draft.topicId}
                skillId={draft.skillId}
                yearGroupId={draft.yearGroup}
                onChange={(models: PedagogicalModelId[]) =>
                  updateDraft({ pedagogicalModels: models })
                }
              />
              {(() => {
                const quality = buildSchemePedagogicalQuality(draft);
                return (
                  <PedagogicalQualityPanel
                    percentage={quality.percentage}
                    strengths={quality.strengths}
                    suggestions={quality.suggestions}
                  />
                );
              })()}
            </div>
          )}

          {draft.topicId && draft.lessons.length > 0 && (
            <SchemeProgressionCoach
              scheme={draft}
              activeLessonIndex={activeLessonIndex}
              onApplyToLesson={(lessonIndex, lesson, message) => {
                updateLesson(lessonIndex, lesson);
                toast(message);
              }}
            />
          )}

          {displayMode === "table" ? (
            <SOWPreviewTable scheme={previewScheme} />
          ) : (
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
              <aside className="xl:w-52 xl:shrink-0">
                <div className="xl:sticky xl:top-[4.5rem]">
                  {alignmentReady ? (
                    <SchemeLessonNavigator
                      lessons={draft.lessons}
                      schemeDefaultSkillId={draft.skillId}
                      activeIndex={activeLessonIndex}
                      onSelect={setActiveLessonIndex}
                    />
                  ) : (
                    <Card className="text-center text-sm text-slate-500">
                      Set a topic to unlock the lesson navigator.
                    </Card>
                  )}
                </div>
              </aside>

              <main className="min-w-0 flex-1">
                {alignmentReady && activeLesson ? (
                  <SchemeLessonEditor
                    lesson={activeLesson}
                    skillOptions={topicSkills}
                    resolvedSkillId={activeLessonSkillId}
                    schemeDefaultSkillId={draft.skillId}
                    onSkillChange={(skillId) => handleLessonSkillChange(activeLessonIndex, skillId)}
                    onLessonChange={(next) => {
                      const prev = activeLesson;
                      updateLesson(activeLessonIndex, next);
                      if (
                        editingId &&
                        draft &&
                        prev.deliveryStatus !== next.deliveryStatus
                      ) {
                        const updatedLessons = draft.lessons.map((l, i) =>
                          i === activeLessonIndex ? next : l
                        );
                        const schemeForSync: SchemeOfWork = {
                          ...draft,
                          lessons: updatedLessons,
                          id: editingId,
                          createdAt:
                            data.schemes.find((s) => s.id === editingId)?.createdAt ?? "",
                          updatedAt: new Date().toISOString(),
                        };
                        setSchemeLessonDelivery(
                          schemeForSync,
                          next.lessonNumber,
                          next.deliveryStatus ?? "planned",
                          next.deliveredDate
                        );
                      }
                    }}
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
                    onOpenInLessonBuilder={handleOpenLessonInBuilder}
                  />
                ) : (
                  <Card className="text-center">
                    <p className="text-sm font-medium text-slate-800">
                      {alignmentReady
                        ? "Select a skill focus for this lesson to start planning"
                        : "Choose a topic to start planning lessons"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {alignmentReady
                        ? "Use the skill dropdown above, or set a default skill in scheme setup."
                        : "Expand scheme setup above to configure your scheme focus."}
                    </p>
                  </Card>
                )}
              </main>

              <aside className="xl:w-80 xl:shrink-0">
                <div className="xl:sticky xl:top-[4.5rem]">
                  <SchemePlanningAssistant
                    topicName={getTopicName(draft.topicId)}
                    skillName={
                      activeLessonSkillId ? getSkillName(activeLessonSkillId) : "Select skill"
                    }
                    outcomeSuggestions={outcomeSuggestions}
                    selectedPathways={draftPathways}
                    lessons={draft.lessons}
                    selectedLessonIndex={activeLessonIndex}
                    alignmentReady={lessonPlanningReady}
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

  const scheduleLessonScheme = scheduleLessonTarget
    ? data.schemes.find((s) => s.id === scheduleLessonTarget.schemeId)
    : null;

  return (
    <div>
      {scheduleSchemeId && (
        <ScheduleSchemeModal
          schemes={data.schemes.filter((s) => s.id === scheduleSchemeId)}
          initialSchemeId={scheduleSchemeId}
          onClose={() => setScheduleSchemeId(null)}
          onSchedule={handleScheduleScheme}
        />
      )}
      {scheduleLessonTarget && scheduleLessonScheme && (
        <ScheduleLessonModal
          title={`${schemeDisplayTitle(scheduleLessonScheme)} — Lesson ${scheduleLessonTarget.lessonNumber}`}
          timetable={data.timetable ?? []}
          onClose={() => setScheduleLessonTarget(null)}
          onSchedule={(result) => {
            handleScheduleLesson(
              scheduleLessonScheme,
              scheduleLessonTarget.lessonNumber,
              result
            );
            setScheduleLessonTarget(null);
          }}
        />
      )}
      <div className="mb-4">
        <BrandLogoHorizontal height={28} className="opacity-90" />
      </div>
      <PageHeader
        eyebrow="Planning"
        title="Schemes of Work"
        description="Plan term-long schemes with calm, card-based views — export when you're ready."
        action={<Button onClick={startNewScheme}>New scheme</Button>}
      />

      {data.schemes.length === 0 ? (
        <EmptyState
          title="No schemes created"
          description="Start planning your first term with a calm, curriculum-aligned scheme of work."
          icon={<SchemesEmptyIllustration />}
          action={<Button onClick={startNewScheme}>New scheme</Button>}
        />
      ) : (
        <>
          <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total Schemes" value={String(dashboardSummary.totalSchemes)} />
            <StatCard label="Total Lessons" value={String(dashboardSummary.totalLessons)} />
            <StatCard
              label="Lessons Delivered"
              value={String(dashboardSummary.lessonsDelivered)}
              tone="green"
            />
            <StatCard
              label="Outcomes Covered"
              value={String(dashboardSummary.outcomesCovered)}
              tone="teal"
            />
            <StatCard
              label="Average Coverage"
              value={`${dashboardSummary.averageCoveragePercent}%`}
              tone="amber"
            />
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            {planningTerms.map((term) => {
              const schemes = schemesByTerm.get(term.name) ?? [];
              return (
                <div key={term.id}>
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                    {term.name}
                  </h2>
                  <div className="space-y-3">
                    {schemes.length === 0 ? (
                      <EmptyState
                        variant="compact"
                        title="No schemes in this term"
                        description="Create a scheme for this planning term."
                        action={
                          <Button variant="secondary" onClick={startNewScheme}>
                            New scheme
                          </Button>
                        }
                      />
                    ) : (
                      schemes.map((scheme) => (
                        <SchemeHealthCard
                          key={scheme.id}
                          scheme={scheme}
                          summary={buildSchemeProgressSummary(scheme)}
                          onView={() => openSchemeView(scheme)}
                          onEdit={() => startEditScheme(scheme)}
                          onSchedule={() => setScheduleSchemeId(scheme.id)}
                          onViewProgress={() => router.push("/curriculum-analytics")}
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
        </>
      )}
    </div>
  );
}
