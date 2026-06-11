"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarPlanner } from "@/components/calendar/CalendarPlanner";
import { useApp } from "@/components/providers/AppProvider";
import { LOSelector } from "@/components/shared/LOSelector";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
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
  PATHWAYS,
  PLANNING_LEVELS,
} from "@/lib/constants";
import { getTopicById } from "@/src/lib/curriculum";
import type { PathwayId, PlanningLevel, YearGroup } from "@/lib/types";

const emptyForm = {
  title: "",
  level: "daily" as PlanningLevel,
  pathway: "general-pe" as PathwayId,
  yearGroup: DEFAULT_YEAR_GROUP_ID,
  sport: "",
  skills: [] as string[],
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  startTime: "",
  endTime: "",
  classGroup: "",
  topicId: "",
  notes: "",
  loIds: [] as string[],
};

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const hubPrefillApplied = useRef(false);
  const { addCalendarEntry } = useApp();
  const { context } = useTeacherContext();
  const visiblePathways = PATHWAYS.filter((p) => isAppPathwayVisible(p.id, context));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

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
    const sport = topic?.name ?? "";

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
        title: topic && !prev.title ? `${topic.name} lesson` : prev.title,
        skills: skill ? [skill] : prev.skills,
        topicId: topicId ?? "",
      };
    });
  }, [searchParams, context]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCalendarEntry({
      title: form.title,
      level: form.level,
      pathway: form.pathway,
      yearGroup: form.yearGroup,
      sport: form.sport,
      skills: form.skills,
      startDate: form.startDate,
      endDate: form.endDate || form.startDate,
      startTime: form.startTime,
      endTime: form.endTime,
      classGroup: form.classGroup,
      topicId: form.topicId,
      notes: form.notes,
      loIds: form.loIds,
      deliveryStatus: "planned",
    });
    setForm(emptyForm);
    setShowForm(false);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Planning"
        title="Calendar"
        description="Drag lesson plans and scheme lessons onto your week. Mark delivered when taught."
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add custom entry"}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <CardHeader title="Custom calendar entry" />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FieldGroup label="Title">
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Volleyball — serving focus"
                />
              </FieldGroup>
              <FieldGroup label="Date">
                <Input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </FieldGroup>
              <FieldGroup label="Class / group">
                <Input
                  value={form.classGroup}
                  onChange={(e) => setForm({ ...form, classGroup: e.target.value })}
                />
              </FieldGroup>
              <FieldGroup label="Start time">
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </FieldGroup>
              <FieldGroup label="End time">
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </FieldGroup>
              <FieldGroup label="Pathway">
                <Select
                  value={form.pathway}
                  onChange={(e) => setForm({ ...form, pathway: e.target.value as PathwayId })}
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
              <FieldGroup label="Planning level">
                <Select
                  value={form.level}
                  onChange={(e) =>
                    setForm({ ...form, level: e.target.value as PlanningLevel })
                  }
                >
                  {PLANNING_LEVELS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
            </div>

            <FieldGroup label="Notes">
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
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

      <CalendarPlanner />
    </div>
  );
}
