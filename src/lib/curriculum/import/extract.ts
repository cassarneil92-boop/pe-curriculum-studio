import type {
  ImportedLearningOutcomeRecord,
  ImportSourceConfig,
  ImportWarning,
} from "./types";
import { extractAlpDocxFormat, isAlpDocxDocument } from "./extractors/alp-docx";
import { extractCodedLoFormat } from "./extractors/coded-lo";
import { extractEarlyYearsFormat, isEarlyYearsDocument } from "./extractors/early-years";
import { extractImSyllabusFormat, isImSyllabusDocument } from "./extractors/im-syllabus";
import { extractMatsecFormat, isMatsecDocument } from "./extractors/matsec";
import { extractPeSyllabusFormat, isPeSyllabusDocument } from "./extractors/pe-syllabus";
import { extractSportValuesFormat, isSportValuesDocument } from "./extractors/sport-values";

/**
 * Route PDF text to the best-fit Malta curriculum extractor.
 * Multiple extractors may run; results are merged and deduped by code.
 */
export function extractFromText(
  text: string,
  source: ImportSourceConfig,
  sourceFile: string
): { outcomes: ImportedLearningOutcomeRecord[]; warnings: ImportWarning[] } {
  const warnings: ImportWarning[] = [];
  const outcomeMap = new Map<string, ImportedLearningOutcomeRecord>();

  const run = (result: {
    outcomes: ImportedLearningOutcomeRecord[];
    warnings: ImportWarning[];
  }) => {
    for (const outcome of result.outcomes) {
      outcomeMap.set(outcome.code, outcome);
    }
    warnings.push(...result.warnings);
  };

  if (isEarlyYearsDocument(text, sourceFile)) {
    run(extractEarlyYearsFormat(text, source, sourceFile));
  }

  if (isPeSyllabusDocument(text, sourceFile)) {
    run(extractPeSyllabusFormat(text, source, sourceFile));
  }

  if (isSportValuesDocument(text, sourceFile)) {
    run(extractSportValuesFormat(text, source, sourceFile));
  }

  if (isImSyllabusDocument(text, sourceFile)) {
    run(extractImSyllabusFormat(text, source, sourceFile));
  }

  if (isMatsecDocument(text, sourceFile)) {
    run(extractMatsecFormat(text, source, sourceFile));
  }

  // Coded LO format (e.g. PRI.HB.P1) — fallback for documents without a dedicated extractor.
  if (
    !isEarlyYearsDocument(text, sourceFile) &&
    !isPeSyllabusDocument(text, sourceFile) &&
    !isSportValuesDocument(text, sourceFile) &&
    !isImSyllabusDocument(text, sourceFile) &&
    !isMatsecDocument(text, sourceFile)
  ) {
    run(extractCodedLoFormat(text, source, sourceFile));
  }

  const outcomes = [...outcomeMap.values()];

  if (
    outcomes.length === 0 &&
    (/Outlook\s+FW:/i.test(text) || /robert\.portelli@ilearn\.edu\.mt/i.test(text))
  ) {
    warnings.push({
      sourceFile,
      message:
        "PDF appears to be an email notification without embedded curriculum content. Add the linked document PDF instead.",
    });
  }

  if (outcomes.length === 0) {
    warnings.push({
      sourceFile,
      message:
        "No learning outcomes extracted. Check PDF structure or add an entry to data/curriculum-pdfs/import-sources.json.",
    });
  }

  return { outcomes, warnings };
}

/** Route DOCX text to the ALP Word document extractor. */
export function extractFromDocx(
  text: string,
  source: ImportSourceConfig,
  sourceFile: string
): { outcomes: ImportedLearningOutcomeRecord[]; warnings: ImportWarning[] } {
  const warnings: ImportWarning[] = [];

  if (!text.trim()) {
    warnings.push({
      sourceFile,
      message: "DOCX produced no extractable text.",
    });
    return { outcomes: [], warnings };
  }

  if (!isAlpDocxDocument(sourceFile)) {
    warnings.push({
      sourceFile,
      message:
        "DOCX file is not a recognised ALP curriculum document. Add an entry to data/curriculum-pdfs/import-sources.json.",
    });
    return { outcomes: [], warnings };
  }

  const extracted = extractAlpDocxFormat(text, source, sourceFile);
  warnings.push(...extracted.warnings);

  if (extracted.outcomes.length === 0) {
    warnings.push({
      sourceFile,
      message: "No learning outcomes extracted from DOCX.",
    });
  }

  return { outcomes: extracted.outcomes, warnings };
}
