"use client";

import { Button } from "@/components/ui/Button";
import { buildIntelligenceReportHtml } from "@/lib/export/intelligence-report";
import { exportDocument } from "@/lib/export";
import type {
  CurriculumIntelligenceReport,
  IntelligenceExportContext,
} from "@/lib/progress/curriculum-intelligence";

export function IntelligenceExportButton({
  report,
  context,
}: {
  report: CurriculumIntelligenceReport;
  context: IntelligenceExportContext;
}) {
  const handleExport = () => {
    const html = buildIntelligenceReportHtml(report, context);
    const date = new Date().toISOString().slice(0, 10);
    exportDocument(html, `curriculum-intelligence-${date}`, "pdf");
  };

  return (
    <Button variant="secondary" onClick={handleExport}>
      Export intelligence report
    </Button>
  );
}
