import fs from "node:fs/promises";
import path from "node:path";

export interface PdfTextResult {
  filename: string;
  text: string;
  pageCount: number;
}

type PdfParseFn = (buffer: Buffer) => Promise<{ text: string; numpages: number }>;

async function loadPdfParser(): Promise<PdfParseFn> {
  const mod = await import("pdf-parse");
  const parser = (mod as { default?: PdfParseFn }).default ?? (mod as PdfParseFn);
  return parser;
}

export async function readPdfText(filePath: string): Promise<PdfTextResult> {
  const pdfParse = await loadPdfParser();
  const buffer = await fs.readFile(filePath);
  const parsed = await pdfParse(buffer);

  return {
    filename: path.basename(filePath),
    text: parsed.text ?? "",
    pageCount: parsed.numpages ?? 0,
  };
}
