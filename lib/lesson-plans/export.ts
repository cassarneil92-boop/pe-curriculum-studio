import { buildExportBrandFooterHtml, buildExportBrandHeaderHtml, EXPORT_BRAND_STYLES } from "@/lib/brand/export-header";
import type { ExportDocumentContext } from "@/lib/export/export-context";
import { buildLessonExportFilename } from "./helpers";
import {
  buildLessonAssessmentExport,
  buildLessonDifferentiationExport,
  buildLessonExportMetadata,
  buildLessonFlowRows,
  buildLessonFlowTableHtml,
  buildLessonMetadataTableHtml,
  buildLessonOutcomesExportHtml,
  buildLessonReflectionExport,
} from "./export-document";
import { exportDocument } from "@/lib/export";
import type { ExportFormat, LessonPlan } from "@/lib/types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textBlock(value: string): string {
  if (!value.trim() || value.trim() === "—") return "";
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function section(title: string, body: string, className = "doc-section"): string {
  if (!body.trim()) return "";
  return `
    <section class="${className}">
      <h2 class="section-title">${escapeHtml(title)}</h2>
      ${body}
    </section>`;
}

function labelBlock(label: string, value: string): string {
  const content = textBlock(value) || "—";
  return `
    <div class="label-block">
      <div class="label-heading">${escapeHtml(label)}</div>
      <div class="label-body">${content}</div>
    </div>`;
}

function buildLessonExportStyles(generatedAt: string): string {
  return `
    @page {
      size: A4 portrait;
      margin: 16mm 14mm 20mm;
    }
    @page {
      @bottom-center {
        content: "PE Curriculum Studio · Generated ${escapeHtml(generatedAt)} · Page " counter(page) " of " counter(pages);
        font-size: 8pt;
        color: #64748b;
      }
    }
    * { box-sizing: border-box; }
    body {
      font-family: Calibri, "Segoe UI", Arial, sans-serif;
      color: #1e293b;
      line-height: 1.45;
      max-width: 210mm;
      margin: 0 auto;
      padding: 0;
      font-size: 10.5pt;
    }
    h1 {
      font-size: 1.35rem;
      color: #0f766e;
      border-bottom: 2px solid #99f6e4;
      padding-bottom: 0.35rem;
      margin: 0.5rem 0 0.75rem;
      font-weight: 700;
    }
    .doc-section {
      margin-bottom: 0.85rem;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #334155;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 0.2rem;
      margin: 0 0 0.45rem;
    }
    .meta-table, .flow-table, .diff-table, .assessment-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }
    .meta-table th,
    .meta-table td,
    .flow-table th,
    .flow-table td,
    .diff-table th,
    .diff-table td,
    .assessment-table th,
    .assessment-table td {
      border: 1px solid #cbd5e1;
      padding: 0.35rem 0.45rem;
      text-align: left;
      vertical-align: top;
    }
    .meta-table th {
      width: 14%;
      background: #f8fafc;
      font-weight: 600;
      color: #475569;
      font-size: 0.78rem;
    }
    .meta-table td { width: 36%; }
    .flow-table th {
      background: #f0fdfa;
      font-weight: 600;
      color: #0f766e;
      font-size: 0.78rem;
    }
    .flow-table .phase-col { width: 16%; font-weight: 600; }
    .flow-table .time-col { width: 8%; white-space: nowrap; }
    .diff-table th { width: 33%; background: #f8fafc; font-weight: 600; }
    .assessment-table th { width: 28%; background: #f8fafc; font-weight: 600; }
    .outcome-block {
      margin-bottom: 0.45rem;
      padding-bottom: 0.35rem;
      border-bottom: 1px dotted #e2e8f0;
    }
    .outcome-block:last-child { border-bottom: none; margin-bottom: 0; }
    .outcome-code {
      font-weight: 700;
      color: #0f766e;
      font-size: 0.82rem;
      margin-bottom: 0.1rem;
    }
    .outcome-text { font-size: 0.88rem; color: #334155; }
    .subsection-label {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
      margin: 0 0 0.35rem;
    }
    .intentions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.65rem;
    }
    .label-block { margin: 0; }
    .label-heading {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
      margin-bottom: 0.15rem;
    }
    .label-body { font-size: 0.9rem; color: #1e293b; }
    .muted { color: #94a3b8; font-size: 0.88rem; font-style: italic; }
    .safety-text, .reflection-text { font-size: 0.9rem; }
    .doc-footer-screen {
      margin-top: 1rem;
      padding-top: 0.5rem;
      border-top: 1px solid #cbd5e1;
      font-size: 0.75rem;
      color: #64748b;
      text-align: center;
    }
    ${EXPORT_BRAND_STYLES}
    @media print {
      body { margin: 0; padding: 0; }
      .doc-footer-screen { display: none; }
      .doc-section.flow-section { page-break-inside: auto; }
      .flow-table tr { page-break-inside: avoid; }
    }
  `;
}

export function buildLessonPreviewHtml(
  lesson: LessonPlan,
  exportContext?: ExportDocumentContext
): string {
  const meta = buildLessonExportMetadata(lesson, exportContext);
  const flowRows = buildLessonFlowRows(lesson);
  const differentiation = buildLessonDifferentiationExport(lesson);
  const assessment = buildLessonAssessmentExport(lesson);
  const reflection = buildLessonReflectionExport(lesson);

  const intentionsHtml = `
    <div class="intentions-grid">
      ${labelBlock("Learning intentions", lesson.learningIntention)}
      ${labelBlock("WALT", lesson.walt)}
    </div>
    ${labelBlock("WILF", lesson.successCriteria)}`;

  const differentiationHtml = `
    <table class="diff-table">
      <thead>
        <tr><th>Support</th><th>Core</th><th>Challenge</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>${textBlock(differentiation.support) || "—"}</td>
          <td>${textBlock(differentiation.core) || "—"}</td>
          <td>${textBlock(differentiation.challenge) || "—"}</td>
        </tr>
      </tbody>
    </table>`;

  const assessmentHtml = `
    <table class="assessment-table">
      <tbody>
        <tr><th>Assessment opportunities</th><td>${textBlock(assessment.opportunities) || "—"}</td></tr>
        <tr><th>Observation points</th><td>${textBlock(assessment.observation) || "—"}</td></tr>
        <tr><th>Questioning prompts</th><td>${textBlock(assessment.questioning) || "—"}</td></tr>
        <tr><th>Success indicators</th><td>${textBlock(assessment.successIndicators) || "—"}</td></tr>
      </tbody>
    </table>`;

  const safetyHtml = lesson.safetyConsiderations.trim()
    ? `<p class="safety-text">${textBlock(lesson.safetyConsiderations)}</p>`
    : `<p class="muted">Standard PE safety checks — space, equipment, and pupil readiness.</p>`;

  const reflectionHtml = `
    ${labelBlock("Teacher reflection prompt", reflection.teacher)}
    ${labelBlock("Student reflection question", reflection.student)}`;

  return `<!DOCTYPE html>
<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(meta.title)}</title>
  <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
  <style>${buildLessonExportStyles(meta.generatedAt)}</style>
</head>
<body>
  ${buildExportBrandHeaderHtml()}
  <h1>${escapeHtml(meta.title)}</h1>
  ${buildLessonMetadataTableHtml(meta)}

  ${section(
    "Curriculum alignment",
    `<p class="subsection-label">Learning outcome codes</p><div class="outcomes-list">${buildLessonOutcomesExportHtml(lesson)}</div>`
  )}
  ${section("Learning intentions", intentionsHtml)}
  ${section("Lesson flow", buildLessonFlowTableHtml(flowRows), "doc-section flow-section")}
  ${section("Differentiation", differentiationHtml)}
  ${section("Assessment", assessmentHtml)}
  ${section("Safety", safetyHtml)}
  ${section("Reflection", reflectionHtml)}

  <p class="doc-footer-screen">PE Curriculum Studio · Generated ${escapeHtml(meta.generatedAt)}</p>
  ${buildExportBrandFooterHtml()}
</body>
</html>`;
}

export function exportLessonDocument(
  lesson: LessonPlan,
  format: ExportFormat,
  exportContext?: ExportDocumentContext
): void {
  const html = buildLessonPreviewHtml(lesson, exportContext);
  const filename = buildLessonExportFilename(lesson);
  exportDocument(html, filename, format);
}

export function printLessonPreview(): void {
  window.print();
}
