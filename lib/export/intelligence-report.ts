import {
  buildExportBrandFooterHtml,
  buildExportBrandHeaderHtml,
  EXPORT_BRAND_STYLES,
} from "@/lib/brand/export-header";
import type { CurriculumIntelligenceReport } from "@/lib/progress/curriculum-intelligence";
import type { IntelligenceExportContext } from "@/lib/progress/curriculum-intelligence";
import { getSidebarProfileName } from "@/lib/design/greeting";

const HEATMAP_COLOURS: Record<string, string> = {
  strong: "#ccfbf1",
  moderate: "#fef3c7",
  weak: "#ffedd5",
  missing: "#f1f5f9",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function heatmapTableHtml(report: CurriculumIntelligenceReport): string {
  const { heatmap, termNames } = report;
  const areas = [...new Set(heatmap.map((c) => c.learningAreaLabel))];

  const header = termNames
    .map((name) => `<th style="text-align:center">${name}</th>`)
    .join("");

  const rows = areas
    .map((area) => {
      const cells = termNames
        .map((term) => {
          const cell = heatmap.find(
            (c) => c.learningAreaLabel === area && c.termName === term
          );
          if (!cell) return `<td>—</td>`;
          const bg = HEATMAP_COLOURS[cell.status] ?? "#f8fafc";
          return `<td style="background:${bg};text-align:center;font-size:0.8rem">${cell.coveragePercent}%<br /><span style="color:#64748b">${cell.delivered}/${cell.total}</span></td>`;
        })
        .join("");
      return `<tr><td><strong>${area}</strong></td>${cells}</tr>`;
    })
    .join("");

  return `
    <table>
      <thead><tr><th>Learning area</th>${header}</tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function topicBarsHtml(report: CurriculumIntelligenceReport): string {
  const rows = report.topicRows
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 15)
    .map(
      (row) => `
      <tr>
        <td>${row.topic}</td>
        <td>${row.delivered} / ${row.total}</td>
        <td>${row.coveragePercent}%</td>
      </tr>`
    )
    .join("");

  return `
    <table>
      <thead><tr><th>Topic</th><th>Delivered / Total</th><th>Coverage</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

export function buildIntelligenceReportHtml(
  report: CurriculumIntelligenceReport,
  context: IntelligenceExportContext
): string {
  const teacherName = getSidebarProfileName(context.teacher);
  const role = context.teacher.role?.trim() ?? "";
  const { kpis, gaps, insights } = report;

  const gapsHtml =
    gaps.length > 0
      ? `<ul>${gaps.map((g) => `<li>${g.message}</li>`).join("")}</ul>`
      : "<p>No significant curriculum gaps identified.</p>";

  const insightsHtml =
    insights.length > 0
      ? `<ul>${insights.map((i) => `<li>${i}</li>`).join("")}</ul>`
      : "<p>No additional insights at this time.</p>";

  const recommendations = [
    ...gaps.slice(0, 4).map((g) => g.message.replace(/^No /, "Plan ").replace(/ not yet delivered$/, " — schedule delivery")),
    ...insights.slice(0, 2),
  ];
  const recHtml =
    recommendations.length > 0
      ? `<ul>${[...new Set(recommendations)].map((r) => `<li>${r}</li>`).join("")}</ul>`
      : "<p>Continue balanced delivery across all learning areas.</p>";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Curriculum Intelligence Report</title>
  <style>
    @page { size: A4; margin: 18mm 15mm 22mm; }
    body { font-family: Calibri, Arial, sans-serif; color: #1e293b; line-height: 1.55; max-width: 210mm; margin: 0 auto; padding: 1.5rem; }
    h1 { font-size: 1.35rem; color: #0f766e; border-bottom: 2px solid #99f6e4; padding-bottom: 0.5rem; }
    h2 { font-size: 1.05rem; margin-top: 1.25rem; color: #334155; }
    .meta { color: #64748b; font-size: 0.88rem; margin-bottom: 1.25rem; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin: 1rem 0; }
    .kpi { border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.65rem; background: #f8fafc; }
    .kpi strong { display: block; font-size: 1.25rem; color: #0f766e; }
    .kpi span { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; page-break-inside: auto; font-size: 0.85rem; }
    th, td { border: 1px solid #cbd5e1; padding: 0.45rem 0.5rem; text-align: left; vertical-align: top; }
    th { background: #f0fdfa; font-weight: 600; }
    .doc-footer { margin-top: 2rem; padding-top: 0.75rem; border-top: 1px solid #cbd5e1; font-size: 0.75rem; color: #64748b; text-align: center; }
    ${EXPORT_BRAND_STYLES}
    @media print { body { margin: 0; padding: 0; } }
  </style>
</head>
<body>
  ${buildExportBrandHeaderHtml()}
  <h1>Curriculum Intelligence Report</h1>
  <p class="meta">
    <strong>${teacherName}</strong>${role ? ` · ${role}` : ""}<br />
    ${context.collegeLabel ? `${context.collegeLabel}<br />` : ""}
    ${context.schoolLabel ? `${context.schoolLabel}<br />` : ""}
    Generated ${formatDate(report.generatedAt)}
  </p>

  <h2>Coverage summary</h2>
  <div class="kpi-grid">
    <div class="kpi"><span>Total outcomes</span><strong>${kpis.totalOutcomes}</strong></div>
    <div class="kpi"><span>Planned</span><strong>${kpis.plannedOutcomes}</strong></div>
    <div class="kpi"><span>Delivered</span><strong>${kpis.deliveredOutcomes}</strong></div>
    <div class="kpi"><span>Remaining</span><strong>${kpis.remainingOutcomes}</strong></div>
    <div class="kpi"><span>Overall coverage</span><strong>${kpis.overallCoveragePercent}%</strong></div>
  </div>

  <h2>Learning area heatmap</h2>
  ${heatmapTableHtml(report)}

  <h2>Coverage by topic</h2>
  ${topicBarsHtml(report)}

  <h2>Curriculum gaps</h2>
  ${gapsHtml}

  <h2>Teacher insights</h2>
  ${insightsHtml}

  <h2>Recommendations</h2>
  ${recHtml}

  ${buildExportBrandFooterHtml()}
</body>
</html>`;
}
