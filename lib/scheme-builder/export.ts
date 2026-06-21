import { buildSchemeExportHtml, exportDocument } from "@/lib/export";
import type { ExportDocumentContext } from "@/lib/export/export-context";
import { buildSchemeExportFilename } from "./helpers";
import type { ExportFormat, SchemeOfWork } from "@/lib/types";

export function exportSchemeDocument(
  scheme: SchemeOfWork,
  format: ExportFormat,
  exportContext?: ExportDocumentContext
): void {
  const html = buildSchemeExportHtml(scheme, exportContext);
  exportDocument(html, buildSchemeExportFilename(scheme), format);
}

export function printSchemePreview(): void {
  window.print();
}
