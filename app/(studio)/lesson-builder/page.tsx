"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { HubPathwayPicker } from "@/components/curriculum-hub/HubPathwayPicker";
import { PlanningOutcomeSections } from "@/components/planning/PlanningOutcomeSections";
import { useApp } from "@/components/providers/AppProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/Input";
import { LessonActivityEditor } from "@/components/lesson-builder/LessonActivityEditor";
import { LessonBuilderProgress } from "@/components/lesson-builder/LessonBuilderProgress";
import { LessonEndingBuilder } from "@/components/lesson-builder/LessonEndingBuilder";
import { LessonQualityChecklist } from "@/components/lesson-builder/LessonQualityChecklist";
import { useToast } from "@/components/providers/ToastProvider";
import { BrandLogoHorizontal } from "@/components/brand/BrandLogoHorizontal";
import { PageHeader } from "@/components/layout/PageHeader";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { YearGroupSelect } from "@/components/shared/YearGroupSelect";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import {
  getLessonOutcomeSuggestions,
  getLessonSkillOptions,
  getLessonTopicOptions,
  getTopicDisplayName,
  isLessonSkillValid,
  isLessonTopicValid,
  lessonAppPathwaysFromQuery,
  pruneSelectedOutcomeIds,
  resolveLessonAppPathways,
} from "@/lib/lesson-builder/curriculum-focus";
import { lessonPlanToFormData } from "@/lib/lesson-plans/migrate";
import {
  primaryCurriculumPathwayFromApp,
} from "@/lib/lesson-plans/helpers";
import {
  createEmptyActivity,
  renumberActivities,
  syncLessonLegacyFields,
} from "@/lib/lesson-plans/pe-template";
import { getDefaultHubPathways } from "@/lib/curriculum-hub/pathway-defaults";
import { getPathwayLabel, DEFAULT_YEAR_GROUP_ID } from "@/lib/constants";
import {
  isAppPathwayVisible,
  pickYearGroupForPathwayFilter,
  pickYearGroupForPathwaysFilter,
} from "@/lib/teacher-context";
import {
  clearLessonDraft,
  computeLessonBuilderCompletion,
  loadLessonDraft,
  saveLessonDraft,
} from "@/lib/lesson-builder/draft";
import type { PathwayId } from "@/lib/types";

const SECTIONS = [
  { id: "info", label: "Lesson Info", number: 1 },
  { id: "focus", label: "Curriculum Focus", number: 2 },
  { id: "outcomes", label: "Curriculum Reference", number: 3 },
  { id: "design", label: "Learning Design", number: 4 },
  { id: "activities", label: "Activities", number: 5 },
  { id: "ending", label: "Lesson Ending", number: 6 },
  { id: "review", label: "Quality Review", number: 7 },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const emptyForm = (): LessonBuilderFormData => ({
  title: "",
  date: "",
  classGroup: "",
  yearGroup: DEFAULT_YEAR_GROUP_ID,
  duration: 60,
  pathwayId: "secondary-pe",
  topicId: "",
  skillId: "",
  learningIntention: "",
  walt: "",
  successCriteria: "",
  equipment: "",
  safetyConsiderations: "",
  differentiation: "",
  activities: "",
  assessmentNotes: "",
  reflectionNotes: "",
  selectedLearningOutcomeIds: [],
  selectedPathways: [],
  structuredActivities: [],
  lessonEndings: [],
});

export default function LessonBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hubPrefillApplied = useRef(false);
  const editLoaded = useRef(false);
  const defaultsApplied = useRef(false);
  const { data, addLesson, updateLesson } = useApp();
  const { toast } = useToast();
  const { context } = useTeacherContext();
  const [form, setForm] = useState<LessonBuilderFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("info");
  const [removedOutcomeIds, setRemovedOutcomeIds] = useState<string[]>([]);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const draftApplied = useRef(false);

  const appPathways = useMemo(() => resolveLessonAppPathways(form), [form.selectedPathways, form.pathwayId]);

  const topicOptions = useMemo(() => {
    if (appPathways.length === 0) return [];
    return getLessonTopicOptions(appPathways, form.yearGroup, context);
  }, [appPathways, form.yearGroup, context]);

  const topicSkills = useMemo(() => {
    if (!form.topicId || appPathways.length === 0) return [];
    return getLessonSkillOptions(appPathways, form.yearGroup, form.topicId, context);
  }, [appPathways, form.topicId, form.yearGroup, context]);

  const outcomeSuggestions = useMemo(
    () => getLessonOutcomeSuggestions(form, context),
    [form, context]
  );

  const completion = useMemo(() => computeLessonBuilderCompletion(form), [form]);

  useEffect(() => {
    if (draftApplied.current || editLoaded.current || searchParams?.get("edit")) return;
    const draft = loadLessonDraft();
    if (!draft || draft.editingId) return;
    if (draft.form.title || draft.form.topicId || draft.form.walt) {
      setForm(draft.form);
      setActiveSection(draft.activeSection as SectionId);
      setDraftSavedAt(draft.savedAt);
      draftApplied.current = true;
    }
  }, [searchParams]);

  useEffect(() => {
    if (editingId) return;
    const hasContent = Boolean(form.title?.trim() || form.topicId || form.walt?.trim());
    if (!hasContent) return;

    const timer = window.setTimeout(() => {
      saveLessonDraft({ form, editingId, activeSection });
      setDraftSavedAt(new Date().toISOString());
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [form, editingId, activeSection]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!form.title?.trim() && !form.topicId) return;
      saveLessonDraft({ form, editingId, activeSection });
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [form, editingId, activeSection]);

  useEffect(() => {
    if (editLoaded.current || !searchParams) return;
    const editId = searchParams.get("edit");
    if (!editId) return;

    const lesson = data.lessons.find((item) => item.id === editId);
    if (!lesson) return;

    editLoaded.current = true;
    setEditingId(editId);
    setForm(lessonPlanToFormData(lesson));
    setActiveSection("info");
  }, [data.lessons, searchParams]);

  useEffect(() => {
    if (
      defaultsApplied.current ||
      editLoaded.current ||
      hubPrefillApplied.current ||
      searchParams?.get("edit")
    ) {
      return;
    }

    const hasHubParams =
      searchParams?.get("pathway") ||
      searchParams?.get("selectedPathways") ||
      searchParams?.get("yearGroup") ||
      searchParams?.get("topic") ||
      searchParams?.get("skill");

    if (hasHubParams) return;

    const defaultPathways = getDefaultHubPathways(context);
    if (defaultPathways.length === 0) return;

    defaultsApplied.current = true;
    setForm((prev) => ({
      ...prev,
      selectedPathways: defaultPathways,
      pathwayId: primaryCurriculumPathwayFromApp(defaultPathways),
      yearGroup: pickYearGroupForPathwaysFilter(
        defaultPathways,
        prev.yearGroup,
        context.visibleYearGroupIds,
        context.exploreAllEnabled
      ),
    }));
  }, [context, searchParams]);

  useEffect(() => {
    if (hubPrefillApplied.current || !searchParams || searchParams.get("edit")) return;

    const pathway = searchParams.get("pathway");
    const selectedPathwaysParam = searchParams.get("selectedPathways");
    const yearGroup = searchParams.get("yearGroup");
    const topic = searchParams.get("topic");
    const skill = searchParams.get("skill");
    if (!pathway && !selectedPathwaysParam && !yearGroup && !topic && !skill) return;

    hubPrefillApplied.current = true;

    const hubAppPathways = lessonAppPathwaysFromQuery(pathway, selectedPathwaysParam).filter((p) =>
      isAppPathwayVisible(p, context)
    );
    const effectivePathways =
      hubAppPathways.length > 0 ? hubAppPathways : getDefaultHubPathways(context);
    const pathwayId = primaryCurriculumPathwayFromApp(effectivePathways);

    const nextYearGroup = yearGroup
      ? effectivePathways.length > 1
        ? pickYearGroupForPathwaysFilter(
            effectivePathways,
            yearGroup as LessonBuilderFormData["yearGroup"],
            context.visibleYearGroupIds,
            context.exploreAllEnabled
          )
        : pickYearGroupForPathwayFilter(
            pathwayId,
            yearGroup as LessonBuilderFormData["yearGroup"],
            context.visibleYearGroupIds,
            context.exploreAllEnabled
          )
      : effectivePathways.length > 0
        ? pickYearGroupForPathwaysFilter(
            effectivePathways,
            DEFAULT_YEAR_GROUP_ID,
            context.visibleYearGroupIds,
            context.exploreAllEnabled
          )
        : DEFAULT_YEAR_GROUP_ID;

    const validTopic =
      topic && isLessonTopicValid(effectivePathways, nextYearGroup, topic, context) ? topic : "";
    const validSkill =
      validTopic &&
      skill &&
      isLessonSkillValid(effectivePathways, nextYearGroup, validTopic, skill, context)
        ? skill
        : "";

    setForm((prev) => ({
      ...prev,
      pathwayId,
      selectedPathways: effectivePathways,
      yearGroup: nextYearGroup,
      topicId: validTopic || prev.topicId,
      skillId: validSkill || prev.skillId,
      title:
        prev.title ||
        (validTopic ? `${getTopicDisplayName(validTopic)} lesson` : prev.title),
    }));

    if (topic || skill) setActiveSection("focus");
  }, [searchParams, context]);

  function applyOutcomeSelectionPrune(validIds: Set<string>) {
    setForm((prev) => {
      const { kept, removed } = pruneSelectedOutcomeIds(
        prev.selectedLearningOutcomeIds,
        validIds
      );
      setRemovedOutcomeIds(removed);
      return { ...prev, selectedLearningOutcomeIds: kept };
    });
  }

  useEffect(() => {
    if (!form.topicId || !form.skillId) {
      setRemovedOutcomeIds([]);
      return;
    }
    applyOutcomeSelectionPrune(outcomeSuggestions.allSuggestedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcomeSuggestions.allSuggestedIds, form.topicId, form.skillId, form.pathwayId]);

  function updateForm<K extends keyof LessonBuilderFormData>(
    key: K,
    value: LessonBuilderFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handlePathwaysChange(selectedPathways: PathwayId[]) {
    setForm((prev) => {
      const pathwayId = primaryCurriculumPathwayFromApp(selectedPathways);
      const nextYearGroup =
        selectedPathways.length > 0
          ? pickYearGroupForPathwaysFilter(
              selectedPathways,
              prev.yearGroup,
              context.visibleYearGroupIds,
              context.exploreAllEnabled
            )
          : prev.yearGroup;

      const topicStillValid = isLessonTopicValid(
        selectedPathways,
        nextYearGroup,
        prev.topicId,
        context
      );
      const nextTopicId = topicStillValid ? prev.topicId : "";

      const skillStillValid =
        nextTopicId &&
        isLessonSkillValid(
          selectedPathways,
          nextYearGroup,
          nextTopicId,
          prev.skillId,
          context
        );
      const nextSkillId = skillStillValid ? prev.skillId : "";

      return {
        ...prev,
        selectedPathways,
        pathwayId,
        yearGroup: nextYearGroup,
        topicId: nextTopicId,
        skillId: nextSkillId,
      };
    });
  }

  function handleYearGroupChange(yearGroup: LessonBuilderFormData["yearGroup"]) {
    setForm((prev) => {
      const pathways = resolveLessonAppPathways(prev);
      const topicStillValid = isLessonTopicValid(pathways, yearGroup, prev.topicId, context);
      const nextTopicId = topicStillValid ? prev.topicId : "";

      const skillStillValid =
        nextTopicId &&
        isLessonSkillValid(pathways, yearGroup, nextTopicId, prev.skillId, context);
      const nextSkillId = skillStillValid ? prev.skillId : "";

      return {
        ...prev,
        yearGroup,
        topicId: nextTopicId,
        skillId: nextSkillId,
      };
    });
  }

  function handleTopicChange(topicId: string) {
    setForm((prev) => ({
      ...prev,
      topicId,
      skillId: "",
    }));
    setRemovedOutcomeIds([]);
  }

  function toggleLearningOutcome(id: string) {
    setForm((prev) => ({
      ...prev,
      selectedLearningOutcomeIds: prev.selectedLearningOutcomeIds.includes(id)
        ? prev.selectedLearningOutcomeIds.filter((loId) => loId !== id)
        : [...prev.selectedLearningOutcomeIds, id],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, ...syncLessonLegacyFields(form) };

    if (editingId) {
      updateLesson(editingId, payload);
      clearLessonDraft();
      toast("Lesson saved");
      router.push("/lessons");
      return;
    }

    addLesson(payload);
    clearLessonDraft();
    toast("Lesson saved");
    setForm(emptyForm());
    setActiveSection("info");
    router.push("/lessons");
  }

  function handleSaveDraft() {
    saveLessonDraft({ form, editingId, activeSection });
    setDraftSavedAt(new Date().toISOString());
    toast("Draft saved — continue later anytime");
  }

  const updateActivities = (structuredActivities: typeof form.structuredActivities) => {
    setForm((prev) => ({
      ...prev,
      structuredActivities: renumberActivities(structuredActivities ?? []),
    }));
  };

  const alignmentReady = Boolean(
    appPathways.length > 0 && form.topicId && form.skillId
  );
  const multiPathwayNote = appPathways.length > 1 ? appPathways : null;

  return (
    <div className="-mx-6 lg:-mx-10">
      <StickyActionBar>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Lesson builder
            </p>
            <p className="truncate text-sm font-semibold text-slate-900">
              {form.title || (editingId ? "Editing lesson" : "New lesson")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {draftSavedAt && !editingId && (
              <span className="hidden text-xs text-slate-500 sm:inline">
                Draft saved locally
              </span>
            )}
            <LessonQualityChecklist lesson={form} compact />
            <Link href="/lessons">
              <Button variant="ghost" type="button">
                Library
              </Button>
            </Link>
            <Button type="button" variant="secondary" onClick={handleSaveDraft}>
              Save draft
            </Button>
            <Button
              type="submit"
              form="lesson-builder-form"
              disabled={!form.title || !form.date}
            >
              {editingId ? "Save changes" : "Save lesson"}
            </Button>
          </div>
        </div>
      </StickyActionBar>

      <div className="px-6 pt-4 lg:px-10">
        <div className="mb-4">
          <BrandLogoHorizontal height={28} className="opacity-90" />
        </div>
        <PageHeader
          eyebrow="Planning"
          title={editingId ? "Edit lesson" : "Lesson Builder"}
          description="Work through each section — your save button stays visible at the top."
        />

      <form id="lesson-builder-form" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-8 lg:flex-row">
          <nav className="lg:w-56 lg:shrink-0">
            <div className="sticky top-[4.5rem] space-y-4">
              <LessonBuilderProgress
                sections={SECTIONS}
                form={form}
                activeSection={activeSection}
                onSectionSelect={(id) => setActiveSection(id as SectionId)}
                completionPercent={completion.percent}
              />
              <div className="hidden lg:block">
                <LessonQualityChecklist lesson={form} />
              </div>
            </div>
          </nav>

          <div className="min-w-0 flex-1 space-y-6">
            {activeSection === "info" && (
              <Card>
                <CardHeader
                  title="Lesson Info"
                  description="Core information for this session."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldGroup label="Lesson title">
                    <Input
                      required
                      value={form.title}
                      onChange={(e) => updateForm("title", e.target.value)}
                      placeholder="e.g. Handball — passing under pressure"
                    />
                  </FieldGroup>
                  <FieldGroup label="Date">
                    <Input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => updateForm("date", e.target.value)}
                    />
                  </FieldGroup>
                  <FieldGroup label="Class / Group">
                    <Input
                      value={form.classGroup}
                      onChange={(e) => updateForm("classGroup", e.target.value)}
                      placeholder="e.g. 9A"
                    />
                  </FieldGroup>
                  <FieldGroup label="Year group">
                    <YearGroupSelect
                      pathwayIds={appPathways}
                      value={form.yearGroup}
                      onChange={(e) =>
                        handleYearGroupChange(e.target.value as LessonBuilderFormData["yearGroup"])
                      }
                      disabled={appPathways.length === 0}
                    />
                  </FieldGroup>
                  <FieldGroup label="Duration (minutes)">
                    <Input
                      type="number"
                      min={20}
                      max={120}
                      value={form.duration}
                      onChange={(e) => updateForm("duration", Number(e.target.value))}
                    />
                  </FieldGroup>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button type="button" variant="secondary" onClick={() => setActiveSection("focus")}>
                    Next: Curriculum Focus →
                  </Button>
                </div>
              </Card>
            )}

            {activeSection === "focus" && (
              <Card>
                <CardHeader
                  title="Curriculum Focus"
                  description="Pathway, topic and skill drive strict learning outcome suggestions."
                />
                <div className="mb-6">
                  <HubPathwayPicker
                    selected={appPathways}
                    context={context}
                    onChange={handlePathwaysChange}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldGroup label="Topic">
                    <Select
                      value={form.topicId}
                      onChange={(e) => handleTopicChange(e.target.value)}
                      disabled={appPathways.length === 0}
                    >
                      <option value="">
                        {appPathways.length === 0
                          ? "Select pathway first"
                          : topicOptions.length === 0
                            ? "No topics available"
                            : "Select topic"}
                      </option>
                      {topicOptions.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.label}
                        </option>
                      ))}
                    </Select>
                    {appPathways.length > 0 && topicOptions.length === 0 && (
                      <p className="mt-1.5 text-xs text-slate-500">
                        No topics found for this pathway and year group.
                      </p>
                    )}
                  </FieldGroup>
                  <FieldGroup label="Skill focus">
                    <Select
                      value={form.skillId}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          skillId: e.target.value,
                        }))
                      }
                      disabled={!form.topicId}
                    >
                      <option value="">
                        {form.topicId ? "Select skill" : "Choose topic first"}
                      </option>
                      {topicSkills.map((skill) => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name}
                        </option>
                      ))}
                    </Select>
                    {form.topicId && topicSkills.length === 0 && (
                      <p className="mt-1.5 text-xs text-slate-500">
                        No skills found for this topic.
                      </p>
                    )}
                  </FieldGroup>
                </div>

                {multiPathwayNote && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3">
                    <p className="text-xs font-medium text-amber-900">Selected pathways</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {multiPathwayNote.map((pathway) => (
                        <Badge key={pathway} tone="amber">
                          {getPathwayLabel(pathway)}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-amber-800">
                      Multiple pathways selected. Strict matches use the primary pathway for now.
                      Additional outcomes are shown from all selected pathways.
                    </p>
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setActiveSection("info")}>
                    ← Back
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setActiveSection("outcomes")}
                    disabled={!alignmentReady}
                  >
                    Next: Learning Outcomes →
                  </Button>
                </div>
              </Card>
            )}

            {activeSection === "outcomes" && (
              <Card>
                <CardHeader
                  title="Curriculum Reference"
                  description="Official learning outcome codes and descriptions for this lesson focus."
                />
                {!alignmentReady ? (
                  <p className="text-sm text-slate-500">
                    Complete Curriculum Focus first to see aligned outcomes.
                  </p>
                ) : (
                  <>
                    {removedOutcomeIds.length > 0 && (
                      <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-900">
                        {removedOutcomeIds.length} previously selected outcome
                        {removedOutcomeIds.length === 1 ? " is" : "s are"} no longer valid for this
                        focus and {removedOutcomeIds.length === 1 ? "was" : "were"} removed. You can
                        choose new suggestions below.
                      </p>
                    )}
                    <PlanningOutcomeSections
                      strict={outcomeSuggestions.strict}
                      additional={outcomeSuggestions.additional}
                      selectedIds={form.selectedLearningOutcomeIds}
                      selectedPathways={appPathways}
                      onToggle={toggleLearningOutcome}
                      showMultiPathwayNote={appPathways.length > 1}
                    />
                  </>
                )}
                <div className="mt-6 flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setActiveSection("focus")}>
                    ← Back
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setActiveSection("design")}>
                    Next: Learning Design →
                  </Button>
                </div>
              </Card>
            )}

            {activeSection === "design" && (
              <Card>
                <CardHeader
                  title="Learning Design"
                  description="Learning intentions, WALT, and success criteria — the backbone of your PE lesson."
                />
                <div className="grid gap-4">
                  <FieldGroup label="Learning intentions">
                    <Textarea
                      value={form.learningIntention}
                      onChange={(e) => updateForm("learningIntention", e.target.value)}
                      placeholder="What will students learn in this lesson?"
                    />
                  </FieldGroup>
                  <FieldGroup label="WALT — We Are Learning To…">
                    <Textarea
                      value={form.walt}
                      onChange={(e) => updateForm("walt", e.target.value)}
                      placeholder="e.g. We are learning to pass accurately under pressure"
                    />
                  </FieldGroup>
                  <FieldGroup label="Success criteria / WILF">
                    <Textarea
                      value={form.successCriteria}
                      onChange={(e) => updateForm("successCriteria", e.target.value)}
                      placeholder="How will you know students have achieved the learning?"
                    />
                  </FieldGroup>
                  <FieldGroup label="Safety considerations">
                    <Textarea
                      value={form.safetyConsiderations}
                      onChange={(e) => updateForm("safetyConsiderations", e.target.value)}
                      placeholder="Key safety points for this session"
                    />
                  </FieldGroup>
                </div>
                <div className="mt-6 flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setActiveSection("outcomes")}>
                    ← Back
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setActiveSection("activities")}>
                    Next: PE Activities →
                  </Button>
                </div>
              </Card>
            )}

            {activeSection === "activities" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader
                    title="PE Activities"
                    description="Structured activity blocks with progressions, differentiation, and teaching cues."
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      updateActivities([
                        ...(form.structuredActivities ?? []),
                        createEmptyActivity((form.structuredActivities ?? []).length + 1),
                      ])
                    }
                  >
                    + Add activity
                  </Button>
                </Card>

                {(form.structuredActivities ?? []).map((activity, index, list) => (
                  <LessonActivityEditor
                    key={activity.id}
                    activity={activity}
                    onChange={(next) =>
                      updateActivities(list.map((item, i) => (i === index ? next : item)))
                    }
                    onRemove={() => updateActivities(list.filter((_, i) => i !== index))}
                    onMoveUp={
                      index > 0
                        ? () => {
                            const next = [...list];
                            [next[index - 1], next[index]] = [next[index], next[index - 1]];
                            updateActivities(next);
                          }
                        : undefined
                    }
                    onMoveDown={
                      index < list.length - 1
                        ? () => {
                            const next = [...list];
                            [next[index], next[index + 1]] = [next[index + 1], next[index]];
                            updateActivities(next);
                          }
                        : undefined
                    }
                  />
                ))}

                <div className="flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setActiveSection("design")}>
                    ← Back
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setActiveSection("ending")}>
                    Next: Lesson Ending →
                  </Button>
                </div>
              </div>
            )}

            {activeSection === "ending" && (
              <div className="space-y-4">
                <LessonEndingBuilder
                  endings={form.lessonEndings ?? []}
                  onChange={(lessonEndings) => updateForm("lessonEndings", lessonEndings)}
                />
                <div className="flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setActiveSection("activities")}>
                    ← Back
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setActiveSection("review")}>
                    Next: Quality Review →
                  </Button>
                </div>
              </div>
            )}

            {activeSection === "review" && (
              <div className="space-y-4">
                <LessonQualityChecklist lesson={form} />
                <div className="flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setActiveSection("ending")}>
                    ← Back
                  </Button>
                  <Button type="submit" disabled={!form.title || !form.date}>
                    {editingId ? "Update lesson" : "Save to library"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
      </div>
    </div>
  );
}
