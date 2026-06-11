import type { ExportFormat, LessonPlan, SchemeOfWork } from "./types";
import { buildLessonPreviewHtml } from "./lesson-plans/export";
import { getPathwayLabel } from "./constants";
import {
  formatLearningOutcomesForCell,
  formatWilfLines,
  getSchemeSelectedPathways,
  getSkillName,
  getTopicName,
  schemeDisplayTitle,
} from "./scheme-builder/helpers";
import { getYearGroupLabel } from "./year-groups";

const SCHEME_FOOTER = "PE Curriculum Studio © Neil Cassar";

function baseStyles(): string {
  return `
    @page { size: A4; margin: 18mm 15mm 22mm; }
    body { font-family: Calibri, Arial, sans-serif; color: #1e293b; line-height: 1.55; max-width: 210mm; margin: 0 auto; padding: 1.5rem; }
    h1 { font-size: 1.35rem; color: #0f766e; border-bottom: 2px solid #99f6e4; padding-bottom: 0.5rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.05rem; margin-top: 1.25rem; color: #334155; }
    .meta { color: #64748b; font-size: 0.88rem; margin-bottom: 1.25rem; }
    ul, ol { padding-left: 1.25rem; }
    .section { margin-bottom: 1.25rem; }
    .doc-footer { margin-top: 2rem; padding-top: 0.75rem; border-top: 1px solid #cbd5e1; font-size: 0.75rem; color: #64748b; text-align: center; }
    @media print {
      body { margin: 0; padding: 0; }
      .doc-footer { position: fixed; bottom: 8mm; left: 0; right: 0; border: none; }
    }
  `;
}

export function buildLessonExportHtml(lesson: LessonPlan): string {
  return buildLessonPreviewHtml(lesson);
}

export function buildSchemeExportHtml(scheme: SchemeOfWork): string {
  const title = schemeDisplayTitle(scheme);
  const lessonsHtml = scheme.lessons
    .map((lesson) => {
      const outcomes = formatLearningOutcomesForCell(lesson.learningOutcomeIds);
      const wilf = formatWilfLines(lesson.wilf)
        .map((line, index) => `<li>${index + 1}. ${line}</li>`)
        .join("");
      const resources = lesson.resources.map((item) => `<li>${item}</li>`).join("");

      return `
      <tr>
        <td>${lesson.lessonNumber}</td>
        <td>
          ${outcomes ? `<div>${outcomes.split("\n").map((line) => `<p>${line}</p>`).join("")}</div>` : ""}
          ${lesson.walt ? `<p><strong>WALT</strong><br />${lesson.walt}</p>` : ""}
        </td>
        <td>${wilf ? `<ol>${wilf}</ol>` : "—"}</td>
        <td>${lesson.activities.replace(/\n/g, "<br />") || "—"}</td>
        <td>${resources ? `<ul>${resources}</ul>` : "—"}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
  <style>
    ${baseStyles()}
    table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; page-break-inside: auto; }
    tr { page-break-inside: avoid; page-break-after: auto; }
    th, td { border: 1px solid #cbd5e1; padding: 0.45rem 0.5rem; text-align: left; font-size: 0.85rem; vertical-align: top; }
    th { background: #f0fdfa; font-weight: 600; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">
    ${getSchemeSelectedPathways(scheme).map((pathwayId) => getPathwayLabel(pathwayId)).join(" + ")} · ${getYearGroupLabel(scheme.yearGroup)}
    ${scheme.classGroup ? ` · ${scheme.classGroup}` : ""} · ${scheme.term}
    ${scheme.topicId ? ` · ${getTopicName(scheme.topicId)}` : ""}
    ${scheme.skillId ? ` · ${getSkillName(scheme.skillId)}` : ""}
    ${scheme.plannedLessonCount ? ` · ${scheme.plannedLessonCount} lessons` : ""}
  </p>
  <div class="section">
    <table>
      <thead>
        <tr>
          <th>Lesson</th>
          <th>Learning Outcomes &amp; WALT</th>
          <th>Success Criteria (WILF)</th>
          <th>Activities</th>
          <th>Resources</th>
        </tr>
      </thead>
      <tbody>${lessonsHtml}</tbody>
    </table>
  </div>
  <p class="doc-footer">${SCHEME_FOOTER}</p>
</body>
</html>`;
}

function downloadBlob(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportDocument(
  html: string,
  filename: string,
  format: ExportFormat
): void {
  if (format === "word") {
    downloadBlob(html, `${filename}.doc`, "application/msword");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  if (format === "print" || format === "pdf") {
    setTimeout(() => printWindow.print(), 300);
  }
}
