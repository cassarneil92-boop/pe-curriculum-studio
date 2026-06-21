import type { LessonActivity, LessonEndingComponent, LessonPlan } from "@/lib/types";
import type { ExportDocumentContext } from "@/lib/export/export-context";
import {
  formatLessonDate,
  getLessonOutcomes,
  getLessonPathwayLabel,
  getLessonSkillName,
  getLessonTopicName,
} from "./helpers";
import { syncLessonLegacyFields } from "./pe-template";
import { getYearGroupLabel } from "@/lib/year-groups";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cell(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "—";
  return escapeHtml(trimmed).replace(/\n/g, "<br />");
}

export interface LessonFlowRow {
  phase: string;
  time: string;
  activity: string;
  organisation: string;
  teachingPoints: string;
}

export interface LessonDifferentiationExport {
  support: string;
  core: string;
  challenge: string;
}

export interface LessonAssessmentExport {
  opportunities: string;
  observation: string;
  questioning: string;
  successIndicators: string;
}

export interface LessonReflectionExport {
  teacher: string;
  student: string;
}

export interface LessonExportMetadata {
  title: string;
  school: string;
  college: string;
  teacher: string;
  yearGroup: string;
  classGroup: string;
  pathway: string;
  topic: string;
  skill: string;
  date: string;
  duration: string;
  generatedAt: string;
}

function flowRowFromActivity(activity: LessonActivity): LessonFlowRow | null {
  const hasContent =
    activity.name.trim() ||
    activity.taskDescription.trim() ||
    activity.time.trim() ||
    activity.students.trim() ||
    activity.spaceEquipment.trim();

  if (!hasContent) return null;

  const teachingPoints = [
    ...activity.teachingCues,
    ...activity.progressions.map((p) => (p.startsWith("Progression") ? p : `Progression: ${p}`)),
  ].join("; ");

  return {
    phase: activity.name.trim() || `Activity ${activity.number}`,
    time: activity.time.trim() || "—",
    activity: activity.taskDescription.trim() || "—",
    organisation:
      [activity.students.trim(), activity.spaceEquipment.trim()].filter(Boolean).join(" · ") || "—",
    teachingPoints: teachingPoints || "—",
  };
}

function flowRowFromEnding(ending: LessonEndingComponent): LessonFlowRow | null {
  if (ending.type === "assessment") return null;
  const content = ending.content.replace(/^\s*Examples:.*$/gim, "").trim();
  if (!ending.title.trim() && !content) return null;

  return {
    phase: ending.title.trim() || "Lesson phase",
    time: "—",
    activity: content || "—",
    organisation: "—",
    teachingPoints: "—",
  };
}

export function buildLessonFlowRows(lesson: LessonPlan): LessonFlowRow[] {
  const rows: LessonFlowRow[] = [];
  const activities = lesson.structuredActivities ?? [];

  if (activities.length > 0) {
    for (const activity of activities) {
      const row = flowRowFromActivity(activity);
      if (row) rows.push(row);
    }
  } else {
    const synced = syncLessonLegacyFields(lesson);
    if (synced.activities.trim()) {
      rows.push({
        phase: "Lesson activities",
        time: "—",
        activity: synced.activities.trim(),
        organisation: synced.equipment.trim() || "—",
        teachingPoints: "—",
      });
    }
  }

  const endings = [...(lesson.lessonEndings ?? [])].sort((a, b) => a.order - b.order);
  for (const ending of endings) {
    const row = flowRowFromEnding(ending);
    if (row) rows.push(row);
  }

  return rows;
}

export function buildLessonDifferentiationExport(lesson: LessonPlan): LessonDifferentiationExport {
  const activities = lesson.structuredActivities ?? [];
  const supportParts = activities.map((a) => a.differentiationEasier.trim()).filter(Boolean);
  const challengeParts = activities.map((a) => a.differentiationHarder.trim()).filter(Boolean);
  const coreParts = activities
    .map((a) => {
      if (!a.taskDescription.trim()) return "";
      const label = a.name.trim() || `Activity ${a.number}`;
      return `${label}: ${a.taskDescription.trim()}`;
    })
    .filter(Boolean);

  const legacy = lesson.differentiation?.trim() ?? "";

  return {
    support: supportParts.join("\n\n") || legacy || "—",
    core: coreParts.join("\n\n") || "Main lesson tasks as planned.",
    challenge: challengeParts.join("\n\n") || "—",
  };
}

export function buildLessonAssessmentExport(lesson: LessonPlan): LessonAssessmentExport {
  const synced = syncLessonLegacyFields(lesson);
  const endings = lesson.lessonEndings ?? [];

  const assessmentEndings = endings.filter(
    (e) => e.type === "assessment" || e.type === "quick-questioning"
  );
  const opportunities = [
    synced.assessmentNotes.trim(),
    ...assessmentEndings.map((e) => {
      const body = e.content.replace(/^\s*Examples:.*$/gim, "").trim();
      return body ? `${e.title}: ${body}` : e.title;
    }),
  ]
    .filter(Boolean)
    .join("\n\n");

  const wilfLines = lesson.successCriteria
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const questioningEndings = endings
    .filter((e) => e.type === "quick-questioning")
    .map((e) => e.content.replace(/^\s*Examples:.*$/gim, "").trim())
    .filter(Boolean);

  return {
    opportunities: opportunities || "—",
    observation: "—",
    questioning:
      questioningEndings.join("\n") || (wilfLines.length ? wilfLines.slice(0, 4).join("\n") : "—"),
    successIndicators: wilfLines.join("\n") || lesson.walt.trim() || "—",
  };
}

export function buildLessonReflectionExport(lesson: LessonPlan): LessonReflectionExport {
  const synced = syncLessonLegacyFields(lesson);
  const endings = lesson.lessonEndings ?? [];

  const reflectionEndings = endings.filter(
    (e) => e.type === "reflection" || e.type === "cool-down" || e.type === "closing-link"
  );

  const teacherParts = [
    lesson.reflection?.trim() ?? "",
    synced.reflectionNotes.trim(),
    ...reflectionEndings.map((e) => {
      const body = e.content.replace(/^\s*Examples:.*$/gim, "").trim();
      return body ? `${e.title}: ${body}` : e.title;
    }),
  ].filter(Boolean);

  const studentQuestion =
    reflectionEndings.find((e) => e.type === "reflection")?.content.replace(/^\s*Examples:.*$/gim, "").trim() ||
    "What did you improve today? What would you focus on next lesson?";

  return {
    teacher: teacherParts.join("\n\n") || "What went well? What would you adapt next time?",
    student: studentQuestion,
  };
}

export function buildLessonExportMetadata(
  lesson: LessonPlan,
  exportContext?: ExportDocumentContext
): LessonExportMetadata {
  const generatedAt =
    exportContext?.generatedAt ??
    new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return {
    title: lesson.title.trim() || "Untitled lesson",
    school: exportContext?.school?.trim() ?? "—",
    college: exportContext?.college?.trim() ?? "—",
    teacher: exportContext?.teacherName?.trim() ?? "—",
    yearGroup: exportContext?.yearGroup?.trim() ?? getYearGroupLabel(lesson.yearGroup),
    classGroup: (exportContext?.classGroup?.trim() ?? lesson.classGroup?.trim()) || "—",
    pathway: exportContext?.pathway?.trim() ?? getLessonPathwayLabel(lesson),
    topic: getLessonTopicName(lesson),
    skill: getLessonSkillName(lesson),
    date: formatLessonDate(lesson.date),
    duration: `${lesson.duration} min`,
    generatedAt,
  };
}

export function buildLessonOutcomesExportHtml(lesson: LessonPlan): string {
  const outcomes = getLessonOutcomes(lesson);
  if (outcomes.length === 0) {
    return `<p class="muted">No learning outcomes linked.</p>`;
  }

  return outcomes
    .map(
      (o) => `
    <div class="outcome-block">
      <div class="outcome-code">${escapeHtml(o!.code)}</div>
      <div class="outcome-text">${escapeHtml(o!.description)}</div>
    </div>`
    )
    .join("");
}

export function buildLessonFlowTableHtml(rows: LessonFlowRow[]): string {
  if (rows.length === 0) {
    return `<p class="muted">No lesson flow recorded.</p>`;
  }

  const body = rows
    .map(
      (row) => `
    <tr>
      <td class="phase-col">${cell(row.phase)}</td>
      <td class="time-col">${cell(row.time)}</td>
      <td>${cell(row.activity)}</td>
      <td>${cell(row.organisation)}</td>
      <td>${cell(row.teachingPoints)}</td>
    </tr>`
    )
    .join("");

  return `
    <table class="flow-table">
      <thead>
        <tr>
          <th>Phase</th>
          <th>Time</th>
          <th>Activity</th>
          <th>Organisation</th>
          <th>Teaching Points</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>`;
}

export function buildLessonMetadataTableHtml(meta: LessonExportMetadata): string {
  const rows: [string, string, string, string][] = [
    ["School", meta.school, "College", meta.college],
    ["Teacher", meta.teacher, "Year Group", meta.yearGroup],
    ["Class", meta.classGroup, "Pathway", meta.pathway],
    ["Topic", meta.topic, "Skill", meta.skill],
    ["Date", meta.date, "Duration", meta.duration],
  ];

  return `
    <table class="meta-table">
      <tbody>
        ${rows
          .map(
            ([l1, v1, l2, v2]) => `
          <tr>
            <th>${escapeHtml(l1)}</th>
            <td>${cell(v1)}</td>
            <th>${escapeHtml(l2)}</th>
            <td>${cell(v2)}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>`;
}

/** @deprecated Used by legacy callers — prefer specialised export builders above. */
export function buildLessonSectionsForExport(lesson: LessonPlan) {
  const outcomesHtml = buildLessonOutcomesExportHtml(lesson);
  const meta = buildLessonExportMetadata(lesson);

  return {
    outcomesHtml,
    meta: {
      title: meta.title,
      pathway: meta.pathway,
      yearGroup: meta.yearGroup,
      classGroup: meta.classGroup === "—" ? "" : meta.classGroup,
      date: meta.date,
      duration: parseInt(meta.duration, 10) || lesson.duration,
      topic: meta.topic,
      skill: meta.skill,
    },
    learningIntention: lesson.learningIntention,
    walt: lesson.walt,
    successCriteria: lesson.successCriteria,
    activities: "",
    safety: lesson.safetyConsiderations,
    endings: "",
  };
}
