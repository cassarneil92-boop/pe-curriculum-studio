import { buildSchemeExportHtml, exportDocument } from "@/lib/export";
import { buildSchemeExportFilename } from "./helpers";
import type { ExportFormat, SchemeOfWork } from "@/lib/types";

export function exportSchemeDocument(scheme: SchemeOfWork, format: ExportFormat): void {
  const html = buildSchemeExportHtml(scheme);
  exportDocument(html, buildSchemeExportFilename(scheme), format);
}

export function printSchemePreview(): void {
  window.print();
}
