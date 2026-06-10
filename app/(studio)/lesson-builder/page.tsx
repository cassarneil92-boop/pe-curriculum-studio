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
import { PageHeader } from "@/components/layout/PageHeader";
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
import { getDefaultHubPathways } from "@/lib/curriculum-hub/pathway-defaults";
import { getPathwayLabel, DEFAULT_YEAR_GROUP_ID } from "@/lib/constants";
import {
  isAppPathwayVisible,
  pickYearGroupForPathwayFilter,
  pickYearGroupForPathwaysFilter,
} from "@/lib/teacher-context";
import type { PathwayId } from "@/lib/types";

const SECTIONS = [
  { id: "info", label: "Lesson Info", number: 1 },
  { id: "focus", label: "Curriculum Focus", number: 2 },
  { id: "outcomes", label: "Learning Outcomes", number: 3 },
  { id: "activities", label: "Activities", number: 4 },
  { id: "assessment", label: "Assessment", number: 5 },
  { id: "reflection", label: "Reflection", number: 6 },
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
  successCriteria: "",
  equipment: "",
  safetyConsiderations: "",
  differentiation: "",
  activities: "",
  assessmentNotes: "",
  reflectionNotes: "",
  selectedLearningOutcomeIds: [],
  selectedPathways: [],
});

export default function LessonBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hubPrefillApplied = useRef(false);
  const editLoaded = useRef(false);
  const defaultsApplied = useRef(false);
  const { data, addLesson, updateLesson } = useApp();
  const { context } = useTeacherContext();
  const [form, setForm] = useState<LessonBuilderFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("info");
  const [removedOutcomeIds, setRemovedOutcomeIds] = useState<string[]>([]);

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
    if (editingId) {
      updateLesson(editingId, form);
      router.push("/lessons");
      return;
    }

    addLesson(form);
    setForm(emptyForm());
    setActiveSection("info");
    router.push("/lessons");
  }

  const alignmentReady = Boolean(
    appPathways.length > 0 && form.topicId && form.skillId
  );
  const multiPathwayNote = appPathways.length > 1 ? appPathways : null;

  return (
    <div>
      <PageHeader
        eyebrow="Planning"
        title={editingId ? "Edit lesson" : "Lesson Builder"}
        description="A guided builder — work through each section and attach strict curriculum links."
        action={
          <Link href="/lessons">
            <Button variant="secondary">Lesson library</Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-8 lg:flex-row">
          <nav className="lg:w-56 lg:shrink-0">
            <div className="sticky top-6 space-y-1">
              {SECTIONS.map((section) => {
                const active = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      active
                        ? "bg-teal-50 font-medium text-teal-800 ring-1 ring-teal-100"
                        : "text-slate-600 hover:bg-slate-100/80"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                        active ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {section.number}
                    </span>
                    {section.label}
                  </button>
                );
              })}
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
                  title="Learning Outcomes"
                  description="Strict curriculum suggestions based on your pathway, topic, and skill."
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
                  <Button type="button" variant="secondary" onClick={() => setActiveSection("activities")}>
                    Next: Activities →
                  </Button>
                </div>
              </Card>
            )}

            {activeSection === "activities" && (
              <Card>
                <CardHeader title="Activities" description="Equipment, safety, differentiation, and lesson flow." />
                <div className="grid gap-4">
                  <FieldGroup label="Learning intention">
                    <Textarea
                      value={form.learningIntention}
                      onChange={(e) => updateForm("learningIntention", e.target.value)}
                      placeholder="What will students learn?"
                    />
                  </FieldGroup>
                  <FieldGroup label="Success criteria">
                    <Textarea
                      value={form.successCriteria}
                      onChange={(e) => updateForm("successCriteria", e.target.value)}
                      placeholder="How will you know they have learned it?"
                    />
                  </FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldGroup label="Equipment">
                      <Textarea
                        value={form.equipment}
                        onChange={(e) => updateForm("equipment", e.target.value)}
                      />
                    </FieldGroup>
                    <FieldGroup label="Safety considerations">
                      <Textarea
                        value={form.safetyConsiderations}
                        onChange={(e) => updateForm("safetyConsiderations", e.target.value)}
                      />
                    </FieldGroup>
                  </div>
                  <FieldGroup label="Differentiation">
                    <Textarea
                      value={form.differentiation}
                      onChange={(e) => updateForm("differentiation", e.target.value)}
                    />
                  </FieldGroup>
                  <FieldGroup label="Activities / lesson flow">
                    <Textarea
                      value={form.activities}
                      onChange={(e) => updateForm("activities", e.target.value)}
                      placeholder="Warm-up, main activities, cool-down…"
                    />
                  </FieldGroup>
                </div>
                <div className="mt-6 flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setActiveSection("outcomes")}>
                    ← Back
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setActiveSection("assessment")}>
                    Next: Assessment →
                  </Button>
                </div>
              </Card>
            )}

            {activeSection === "assessment" && (
              <Card>
                <CardHeader title="Assessment" description="How you will check learning during and after the lesson." />
                <FieldGroup label="Assessment notes">
                  <Textarea
                    value={form.assessmentNotes}
                    onChange={(e) => updateForm("assessmentNotes", e.target.value)}
                    placeholder="Observation, questioning, peer assessment…"
                  />
                </FieldGroup>
                <div className="mt-6 flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setActiveSection("activities")}>
                    ← Back
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setActiveSection("reflection")}>
                    Next: Reflection →
                  </Button>
                </div>
              </Card>
            )}

            {activeSection === "reflection" && (
              <Card>
                <CardHeader title="Reflection" description="Notes for after the lesson — what worked, what to adjust." />
                <FieldGroup label="Reflection notes">
                  <Textarea
                    value={form.reflectionNotes}
                    onChange={(e) => updateForm("reflectionNotes", e.target.value)}
                  />
                </FieldGroup>
                <div className="mt-6 flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setActiveSection("assessment")}>
                    ← Back
                  </Button>
                  <Button type="submit" disabled={!form.title || !form.date}>
                    {editingId ? "Update lesson" : "Save to library"}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
