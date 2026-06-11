import type { LessonActivity, LessonEndingComponent, LessonPlan } from "@/lib/types";
import {
  formatLessonDate,
  getLessonOutcomes,
  getLessonPathwayLabel,
  getLessonSkillName,
  getLessonTopicName,
} from "./helpers";
import { getYearGroupLabel } from "@/lib/year-groups";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textBlock(value: string): string {
  if (!value.trim()) return "<p><em>—</em></p>";
  return `<p>${escapeHtml(value).replace(/\n/g, "<br />")}</p>`;
}

function sectionHtml(title: string, body: string): string {
  if (!body.trim()) return "";
  return `<div class="section"><h2>${escapeHtml(title)}</h2><div class="body">${body}</div></div>`;
}

function activityHtml(activity: LessonActivity): string {
  const lines = [
    `<h3>Activity ${activity.number}${activity.name ? ` – ${escapeHtml(activity.name)}` : ""}</h3>`,
    activity.students ? `<p><strong>Students:</strong> ${escapeHtml(activity.students)}</p>` : "",
    activity.time ? `<p><strong>Time:</strong> ${escapeHtml(activity.time)}</p>` : "",
    activity.spaceEquipment
      ? `<p><strong>Space &amp; Equipment:</strong> ${escapeHtml(activity.spaceEquipment)}</p>`
      : "",
    activity.taskDescription
      ? `<p><strong>Task:</strong> ${escapeHtml(activity.taskDescription).replace(/\n/g, "<br />")}</p>`
      : "",
    activity.progressions.length
      ? `<p><strong>Progressions:</strong></p><ul>${activity.progressions.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>`
      : "",
    activity.differentiationEasier || activity.differentiationHarder
      ? `<p><strong>Differentiation:</strong></p><ul>${activity.differentiationEasier ? `<li>Easier: ${escapeHtml(activity.differentiationEasier)}</li>` : ""}${activity.differentiationHarder ? `<li>Harder: ${escapeHtml(activity.differentiationHarder)}</li>` : ""}</ul>`
      : "",
    activity.teachingCues.length
      ? `<p><strong>Teaching Cues:</strong></p><ul>${activity.teachingCues.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>`
      : "",
  ].filter(Boolean);
  return lines.join("");
}

function endingsHtml(endings: LessonEndingComponent[]): string {
  return [...endings]
    .sort((a, b) => a.order - b.order)
    .map(
      (ending) =>
        `<div class="ending"><h3>${escapeHtml(ending.title)}</h3>${textBlock(ending.content)}</div>`
    )
    .join("");
}

export function buildStructuredActivitiesHtml(lesson: LessonPlan): string {
  const activities = lesson.structuredActivities ?? [];
  if (activities.length === 0) return textBlock(lesson.activities);
  return activities.map(activityHtml).join("");
}

export function buildLessonEndingsHtml(lesson: LessonPlan): string {
  const endings = lesson.lessonEndings ?? [];
  if (endings.length === 0) {
    const legacy = [
      lesson.assessmentNotes.trim()
        ? `<div class="ending"><h3>Assessment</h3>${textBlock(lesson.assessmentNotes)}</div>`
        : "",
      lesson.reflectionNotes.trim()
        ? `<div class="ending"><h3>Reflection</h3>${textBlock(lesson.reflectionNotes)}</div>`
        : "",
    ].filter(Boolean);
    return legacy.join("") || "";
  }
  return endingsHtml(endings);
}

export function buildLessonSectionsForExport(lesson: LessonPlan) {
  const outcomes = getLessonOutcomes(lesson);
  const outcomesHtml =
    outcomes.length > 0
      ? `<ul>${outcomes
          .map(
            (o) =>
              `<li><strong>${escapeHtml(o!.code)}</strong> — ${escapeHtml(o!.description)}</li>`
          )
          .join("")}</ul>`
      : "<p><em>No learning outcomes linked.</em></p>";

  return {
    outcomesHtml,
    meta: {
      title: lesson.title,
      pathway: getLessonPathwayLabel(lesson),
      yearGroup: getYearGroupLabel(lesson.yearGroup),
      classGroup: lesson.classGroup,
      date: formatLessonDate(lesson.date),
      duration: lesson.duration,
      topic: getLessonTopicName(lesson),
      skill: getLessonSkillName(lesson),
    },
    learningIntention: textBlock(lesson.learningIntention),
    walt: textBlock(lesson.walt),
    successCriteria: textBlock(lesson.successCriteria),
    activities: buildStructuredActivitiesHtml(lesson),
    safety: textBlock(lesson.safetyConsiderations),
    endings: buildLessonEndingsHtml(lesson),
  };
}
