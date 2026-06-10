"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { TopicIcon } from "@/components/design/TopicIcon";
import { LOSelector } from "@/components/shared/LOSelector";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import { YearGroupSelect } from "@/components/shared/YearGroupSelect";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { parseHubPathwaysFromQuery } from "@/lib/curriculum-hub/planning-links";
import {
  isAppPathwayVisible,
  pickYearGroupForPathwayFilter,
  pickYearGroupForPathwaysFilter,
} from "@/lib/teacher-context";
import {
  DEFAULT_YEAR_GROUP_ID,
  getPathwayLabel,
  getPlanningLevelLabel,
  PATHWAYS,
  PLANNING_LEVELS,
  SKILLS,
  SPORTS,
} from "@/lib/constants";
import { getTopicTheme } from "@/lib/design/topic-theme";
import { getYearGroupLabel } from "@/lib/year-groups";
import { getTopicById } from "@/src/lib/curriculum";
import type { CalendarEntry, PathwayId, PlanningLevel, YearGroup } from "@/lib/types";

type ViewMode = "week" | "month" | "agenda";

const emptyForm = {
  title: "",
  level: "meso" as PlanningLevel,
  pathway: "general-pe" as PathwayId,
  yearGroup: DEFAULT_YEAR_GROUP_ID,
  sport: "",
  skills: [] as string[],
  startDate: "",
  endDate: "",
  notes: "",
  loIds: [] as string[],
};

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDayLabel(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function entryOnDate(entry: CalendarEntry, iso: string): boolean {
  const end = entry.endDate || entry.startDate;
  return entry.startDate <= iso && end >= iso;
}

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const hubPrefillApplied = useRef(false);
  const { data, addCalendarEntry, deleteCalendarEntry } = useApp();
  const { context } = useTeacherContext();
  const visiblePathways = PATHWAYS.filter((p) => isAppPathwayVisible(p.id, context));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const weekDays = useMemo(
    () => WEEKDAYS.map((label, i) => ({ label, date: addDays(weekStart, i), iso: toIso(addDays(weekStart, i)) })),
    [weekStart]
  );

  const selected = data.calendar.find((e) => e.id === selectedId) ?? null;

  useEffect(() => {
    if (hubPrefillApplied.current || !searchParams || searchParams.get("create") !== "1") {
      return;
    }

    hubPrefillApplied.current = true;

    const pathway = searchParams.get("pathway");
    const selectedPathways = searchParams.get("selectedPathways");
    const yearGroup = searchParams.get("yearGroup");
    const topicId = searchParams.get("topic");
    const skill = searchParams.get("skill");
    const appPathways = parseHubPathwaysFromQuery(pathway, selectedPathways);
    const topic = topicId ? getTopicById(topicId) : null;
    const sport =
      topic?.name && (SPORTS as readonly string[]).includes(topic.name) ? topic.name : "";

    setShowForm(true);
    setForm((prev) => {
      const primaryPathway = appPathways[0];
      const nextPathway =
        primaryPathway && isAppPathwayVisible(primaryPathway, context)
          ? primaryPathway
          : prev.pathway;
      return {
        ...prev,
        pathway: nextPathway,
        yearGroup: yearGroup
          ? appPathways.length > 1
            ? pickYearGroupForPathwaysFilter(
                appPathways,
                yearGroup as YearGroup,
                context.visibleYearGroupIds,
                context.exploreAllEnabled
              )
            : pickYearGroupForPathwayFilter(
                nextPathway,
                yearGroup as YearGroup,
                context.visibleYearGroupIds,
                context.exploreAllEnabled
              )
          : prev.yearGroup,
        sport: sport || prev.sport,
        title: topic && !prev.title ? `${topic.name} unit` : prev.title,
        skills: skill ? [skill] : prev.skills,
      };
    });
  }, [searchParams, context]);

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCalendarEntry(form);
    setForm(emptyForm);
    setShowForm(false);
  };

  const sortedEntries = [...data.calendar].sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div>
      <PageHeader
        eyebrow="Planning"
        title="Calendar"
        description="Your weekly teaching rhythm — plan units, lessons, and key dates in one calm view."
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add lesson"}
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {(["week", "month", "agenda"] as ViewMode[]).map((mode) => (
          <Button
            key={mode}
            variant={viewMode === mode ? "primary" : "secondary"}
            onClick={() => setViewMode(mode)}
            className="capitalize"
          >
            {mode}
          </Button>
        ))}
        {viewMode === "week" && (
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={() => setWeekStart(addDays(weekStart, -7))}>
              ← Prev
            </Button>
            <Button variant="ghost" onClick={() => setWeekStart(startOfWeek(new Date()))}>
              This week
            </Button>
            <Button variant="ghost" onClick={() => setWeekStart(addDays(weekStart, 7))}>
              Next →
            </Button>
          </div>
        )}
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader title="New calendar entry" />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldGroup label="Title">
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Handball unit — passing focus"
                />
              </FieldGroup>
              <FieldGroup label="Planning level">
                <Select
                  value={form.level}
                  onChange={(e) =>
                    setForm({ ...form, level: e.target.value as PlanningLevel })
                  }
                >
                  {PLANNING_LEVELS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label} — {l.description}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup label="Pathway">
                <Select
                  value={form.pathway}
                  onChange={(e) => {
                    const pathway = e.target.value as PathwayId;
                    setForm({
                      ...form,
                      pathway,
                      yearGroup: pickYearGroupForPathwayFilter(
                        pathway,
                        form.yearGroup,
                        context.visibleYearGroupIds,
                        context.exploreAllEnabled
                      ),
                    });
                  }}
                >
                  {visiblePathways.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup label="Year group">
                <YearGroupSelect
                  pathwayId={form.pathway}
                  value={form.yearGroup}
                  onChange={(e) =>
                    setForm({ ...form, yearGroup: e.target.value as YearGroup })
                  }
                />
              </FieldGroup>
              <FieldGroup label="Sport">
                <Select
                  value={form.sport}
                  onChange={(e) => setForm({ ...form, sport: e.target.value })}
                >
                  <option value="">Select sport</option>
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup label="Start date">
                <Input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </FieldGroup>
              <FieldGroup label="End date">
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </FieldGroup>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Skills focus</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`rounded-xl border px-2.5 py-1 text-xs transition-colors ${
                      form.skills.includes(skill)
                        ? "border-teal-300 bg-teal-50 text-teal-800"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <FieldGroup label="Notes">
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional planning notes"
              />
            </FieldGroup>

            <FieldGroup label="Learning outcomes">
              <LOSelector
                context={{
                  pathway: form.pathway,
                  yearGroup: form.yearGroup,
                  sport: form.sport,
                  skills: form.skills,
                }}
                selectedIds={form.loIds}
                onChange={(loIds) => setForm({ ...form, loIds })}
              />
            </FieldGroup>

            <Button type="submit">Save entry</Button>
          </form>
        </Card>
      )}

      {data.calendar.length === 0 ? (
        <EmptyState
          title="Start by adding your first teaching week"
          description="Map lessons across Monday to Friday, link learning outcomes, and build your term rhythm."
          icon="📅"
          action={<Button onClick={() => setShowForm(true)}>Add lesson</Button>}
        />
      ) : (
        <div className="flex gap-6">
          <div className="min-w-0 flex-1">
            {viewMode === "week" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                {weekDays.map((day) => {
                  const dayEntries = data.calendar.filter((e) => entryOnDate(e, day.iso));
                  return (
                    <div key={day.iso} className="flex flex-col">
                      <div className="mb-3 rounded-xl bg-white px-3 py-2 text-center shadow-sm ring-1 ring-slate-200/60">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {day.label}
                        </p>
                        <p className="text-sm font-medium text-slate-800">{formatDayLabel(day.date)}</p>
                      </div>
                      <div className="flex min-h-[200px] flex-col gap-2 rounded-2xl border border-dashed border-slate-200/80 bg-white/50 p-2">
                        {dayEntries.length === 0 ? (
                          <p className="px-2 py-6 text-center text-xs text-slate-400">No lessons</p>
                        ) : (
                          dayEntries.map((entry) => {
                            const theme = getTopicTheme(entry.sport || entry.title);
                            const active = selectedId === entry.id;
                            return (
                              <button
                                key={entry.id}
                                type="button"
                                onClick={() => setSelectedId(entry.id)}
                                className={`rounded-xl border p-3 text-left transition-all ${theme.border} ${theme.bg} ${
                                  active ? "ring-2 ring-teal-500/40" : "hover:shadow-sm"
                                }`}
                              >
                                <p className="text-xs font-medium text-slate-500">{entry.startDate}</p>
                                <p className="mt-0.5 text-sm font-semibold text-slate-800">{entry.title}</p>
                                {entry.sport && (
                                  <p className={`mt-1 text-xs ${theme.text}`}>{entry.sport}</p>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === "month" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {sortedEntries.map((entry) => (
                  <CalendarListCard
                    key={entry.id}
                    entry={entry}
                    active={selectedId === entry.id}
                    onSelect={() => setSelectedId(entry.id)}
                  />
                ))}
              </div>
            )}

            {viewMode === "agenda" && (
              <div className="space-y-2">
                {sortedEntries.map((entry) => (
                  <CalendarListCard
                    key={entry.id}
                    entry={entry}
                    active={selectedId === entry.id}
                    onSelect={() => setSelectedId(entry.id)}
                    compact
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="hidden w-80 shrink-0 lg:block">
            {selected ? (
              <Card className="sticky top-6">
                <CardHeader title="Lesson detail" />
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <TopicIcon name={selected.sport || selected.title} />
                    <div>
                      <p className="font-semibold text-slate-900">{selected.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {selected.startDate}
                        {selected.endDate ? ` → ${selected.endDate}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="teal">{getPlanningLevelLabel(selected.level)}</Badge>
                    <Badge tone="blue">{getPathwayLabel(selected.pathway)}</Badge>
                    <Badge tone="slate">{getYearGroupLabel(selected.yearGroup)}</Badge>
                    {selected.sport && <Badge tone="green">{selected.sport}</Badge>}
                  </div>
                  {selected.skills.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.skills.map((s) => (
                          <Badge key={s} tone="blue">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.notes && (
                    <p className="text-sm leading-relaxed text-slate-600">{selected.notes}</p>
                  )}
                  {selected.loIds.length > 0 && (
                    <p className="text-xs text-slate-500">{selected.loIds.length} linked LOs</p>
                  )}
                  <Button
                    variant="danger"
                    className="w-full text-sm"
                    onClick={() => {
                      deleteCalendarEntry(selected.id);
                      setSelectedId(null);
                    }}
                  >
                    Remove entry
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="sticky top-6 border-dashed bg-slate-50/50">
                <p className="text-sm text-slate-500">Select a lesson to see details here.</p>
              </Card>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function CalendarListCard({
  entry,
  active,
  onSelect,
  compact = false,
}: {
  entry: CalendarEntry;
  active: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  const theme = getTopicTheme(entry.sport || entry.title);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition-all ${theme.border} ${theme.bg} ${
        active ? "ring-2 ring-teal-500/40" : "hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        {!compact && <TopicIcon name={entry.sport || entry.title} size="sm" />}
        <div>
          <p className="font-medium text-slate-800">{entry.title}</p>
          <p className="mt-1 text-sm text-slate-500">
            {entry.startDate}
            {entry.endDate ? ` → ${entry.endDate}` : ""} · {getYearGroupLabel(entry.yearGroup)}
          </p>
          {!compact && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone="teal">{getPlanningLevelLabel(entry.level)}</Badge>
              {entry.sport && <Badge tone="green">{entry.sport}</Badge>}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
