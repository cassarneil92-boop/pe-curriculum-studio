import {
  buildLessonExportFilename,
  formatLessonDate,
  getLessonOutcomes,
  getLessonPathwayLabel,
  getLessonSkillName,
  getLessonTopicName,
} from "./helpers";
import { exportDocument } from "@/lib/export";
import type { ExportFormat, LessonPlan } from "@/lib/types";
import { getYearGroupLabel } from "@/lib/year-groups";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sectionHtml(title: string, body: string): string {
  if (!body.trim()) return "";
  return `<div class="section"><h2>${escapeHtml(title)}</h2><div class="body">${body}</div></div>`;
}

function textBlock(value: string): string {
  if (!value.trim()) return "<p><em>—</em></p>";
  return `<p>${escapeHtml(value).replace(/\n/g, "<br />")}</p>`;
}

export function buildLessonPreviewHtml(lesson: LessonPlan): string {
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

  return `<!DOCTYPE html>
<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(lesson.title)}</title>
  <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
  <style>
    body { font-family: Calibri, Arial, sans-serif; color: #1e293b; line-height: 1.55; max-width: 800px; margin: 2rem auto; padding: 0 1.5rem; }
    h1 { font-size: 1.75rem; color: #0f766e; border-bottom: 3px solid #99f6e4; padding-bottom: 0.5rem; margin-bottom: 0.25rem; }
    h2 { font-size: 1rem; margin: 0 0 0.5rem; color: #0f766e; text-transform: uppercase; letter-spacing: 0.04em; }
    .meta { color: #64748b; font-size: 0.95rem; margin-bottom: 1.75rem; }
    .section { margin-bottom: 1.35rem; page-break-inside: avoid; }
    .body { font-size: 0.95rem; }
    ul { padding-left: 1.25rem; margin: 0.25rem 0; }
    li { margin-bottom: 0.35rem; }
    .footer { margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.8rem; color: #94a3b8; text-align: center; }
    @media print {
      body { margin: 0; max-width: none; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(lesson.title)}</h1>
  <p class="meta">
    ${escapeHtml(getLessonPathwayLabel(lesson))} · ${escapeHtml(getYearGroupLabel(lesson.yearGroup))}
    ${lesson.classGroup ? ` · ${escapeHtml(lesson.classGroup)}` : ""}
    <br />
    Date: ${escapeHtml(formatLessonDate(lesson.date))} · Duration: ${lesson.duration} minutes
    <br />
    Topic: ${escapeHtml(getLessonTopicName(lesson))} · Skill: ${escapeHtml(getLessonSkillName(lesson))}
  </p>
  ${sectionHtml("Learning Outcomes", outcomesHtml)}
  ${sectionHtml("Learning Intention / WALT", textBlock(lesson.learningIntention))}
  ${sectionHtml("Success Criteria / WILF", textBlock(lesson.successCriteria))}
  ${sectionHtml("Activities / Lesson Flow", textBlock(lesson.activities))}
  ${sectionHtml("Assessment", textBlock(lesson.assessmentNotes))}
  ${sectionHtml("Resources Needed", textBlock(lesson.equipment))}
  ${sectionHtml("Safety Considerations", textBlock(lesson.safetyConsiderations))}
  ${sectionHtml("Differentiation", textBlock(lesson.differentiation))}
  ${lesson.reflectionNotes.trim() ? sectionHtml("Reflection", textBlock(lesson.reflectionNotes)) : ""}
  <p class="footer">PE Curriculum Studio © Neil Cassar</p>
</body>
</html>`;
}

export function exportLessonDocument(lesson: LessonPlan, format: ExportFormat): void {
  const html = buildLessonPreviewHtml(lesson);
  const filename = buildLessonExportFilename(lesson);
  exportDocument(html, filename, format);
}

export function printLessonPreview(): void {
  window.print();
}
