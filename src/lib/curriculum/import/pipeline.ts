import fs from "node:fs/promises";
import path from "node:path";
import { inferPathwayFromFilename, isIgnoredSourceFile, KNOWN_PATHWAYS } from "./config";
import { extractFromDocx, extractFromText } from "./extract";
import { findCrossTopicWarnings, normalizeImportedData } from "./normalize";
import { readDocxText } from "./parse-docx";
import { readPdfText } from "./parse-pdf";
import type {
  ImportManifest,
  ImportSourceConfig,
  ImportSourcesFile,
  ImportWarning,
  ImportedLearningOutcomeRecord,
} from "./types";

const SOURCE_DIR = path.join(process.cwd(), "data", "curriculum-pdfs");
const OUTPUT_DIR = path.join(process.cwd(), "src", "lib", "curriculum", "data");
const SOURCES_FILE = path.join(SOURCE_DIR, "import-sources.json");

const SUPPORTED_EXTENSIONS = [".pdf", ".docx"] as const;

export interface PipelineResult {
  manifest: ImportManifest;
  success: boolean;
}

async function ensureDirectory(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function listCurriculumFiles(): Promise<string[]> {
  try {
    const entries = await fs.readdir(SOURCE_DIR);
    return entries.filter((file) =>
      SUPPORTED_EXTENSIONS.some((ext) => file.toLowerCase().endsWith(ext))
    );
  } catch {
    return [];
  }
}

async function loadSourceConfig(filename: string): Promise<ImportSourceConfig> {
  const format = filename.toLowerCase().endsWith(".docx") ? "docx" : "pdf";

  try {
    const raw = await fs.readFile(SOURCES_FILE, "utf8");
    const parsed = JSON.parse(raw) as ImportSourcesFile;
    const match = parsed.sources.find(
      (source) => source.file.toLowerCase() === filename.toLowerCase()
    );
    if (match) return { ...match, format: match.format ?? format };
  } catch {
    // Optional config file — fall back to filename inference.
  }

  const inferred = inferPathwayFromFilename(filename);
  if (inferred) return inferred;

  return {
    file: filename,
    pathwayId: "secondary-pe",
    pathwayLabel: KNOWN_PATHWAYS["secondary-pe"].label,
    format,
  };
}

async function writeJson(fileName: string, data: unknown): Promise<void> {
  const filePath = path.join(OUTPUT_DIR, fileName);
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function countAlpDocxOutcomes(outcomes: ImportedLearningOutcomeRecord[]): {
  alpPe: number;
  alpSportsVocational: number;
} {
  const docxOutcomes = outcomes.filter((outcome) =>
    outcome.sourceDocument?.toLowerCase().endsWith(".docx")
  );

  return {
    alpPe: docxOutcomes.filter((outcome) => outcome.pathwayId === "alp-pe").length,
    alpSportsVocational: docxOutcomes.filter(
      (outcome) => outcome.pathwayId === "alp-sports-vocational"
    ).length,
  };
}

function buildEmptyManifest(warnings: ImportWarning[]): ImportManifest {
  return {
    importedAt: new Date().toISOString(),
    sourceDirectory: SOURCE_DIR,
    outputDirectory: OUTPUT_DIR,
    sourceFiles: [],
    ignoredFiles: [],
    pathways: [],
    recordCounts: {
      learningOutcomes: 0,
      topics: 0,
      skills: 0,
      values: 0,
    },
    alpDocxCounts: {
      alpPe: 0,
      alpSportsVocational: 0,
    },
    warnings,
  };
}

export async function runCurriculumImport(): Promise<PipelineResult> {
  await ensureDirectory(SOURCE_DIR);
  await ensureDirectory(OUTPUT_DIR);

  const allFiles = await listCurriculumFiles();
  const ignoredFiles = allFiles.filter((file) => isIgnoredSourceFile(file));
  const sourceFiles = allFiles.filter((file) => !isIgnoredSourceFile(file));
  const warnings: ImportWarning[] = [];
  const allOutcomes: ImportedLearningOutcomeRecord[] = [];

  for (const filename of ignoredFiles) {
    warnings.push({
      sourceFile: filename,
      message: "Ignored — IM 36 is out of scope (coverage up to Form 5 only).",
    });
  }

  if (sourceFiles.length === 0) {
    warnings.push({
      sourceFile: "(none)",
      message:
        "No curriculum PDF or DOCX files found in data/curriculum-pdfs. Add source documents and rerun npm run import-curriculum.",
    });

    const emptyManifest = buildEmptyManifest(warnings);
    await writeJson("imported-pathways.json", []);
    await writeJson("imported-topics.json", []);
    await writeJson("imported-skills.json", []);
    await writeJson("imported-values.json", []);
    await writeJson("imported-learning-outcomes.json", []);
    await writeJson("import-manifest.json", emptyManifest);

    return { manifest: emptyManifest, success: true };
  }

  for (const filename of sourceFiles) {
    const filePath = path.join(SOURCE_DIR, filename);
    const source = await loadSourceConfig(filename);
    const isDocx = filename.toLowerCase().endsWith(".docx");

    try {
      if (isDocx) {
        const docx = await readDocxText(filePath);
        if (!docx.text.trim()) {
          warnings.push({
            sourceFile: filename,
            message: "DOCX produced no extractable text.",
          });
          continue;
        }

        const extracted = extractFromDocx(docx.text, source, filename);
        allOutcomes.push(...extracted.outcomes);
        warnings.push(...extracted.warnings);
        continue;
      }

      const pdf = await readPdfText(filePath);
      if (!pdf.text.trim()) {
        warnings.push({
          sourceFile: filename,
          message: "PDF produced no extractable text. It may be scanned — OCR is not supported yet.",
        });
        continue;
      }

      const extracted = extractFromText(pdf.text, source, filename);
      allOutcomes.push(...extracted.outcomes);
      warnings.push(...extracted.warnings);

      const crossTopic = findCrossTopicWarnings(extracted.outcomes);
      for (const message of crossTopic) {
        warnings.push({ sourceFile: filename, message });
      }
    } catch (error) {
      const label = isDocx ? "DOCX" : "PDF";
      warnings.push({
        sourceFile: filename,
        message: `Failed to parse ${label}: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  const normalized = normalizeImportedData(allOutcomes);
  const alpDocxCounts = countAlpDocxOutcomes(normalized.learningOutcomes);

  const manifest: ImportManifest = {
    importedAt: new Date().toISOString(),
    sourceDirectory: SOURCE_DIR,
    outputDirectory: OUTPUT_DIR,
    sourceFiles,
    ignoredFiles,
    pathways: normalized.pathways,
    recordCounts: {
      learningOutcomes: normalized.learningOutcomes.length,
      topics: normalized.topics.length,
      skills: normalized.skills.length,
      values: normalized.values.length,
    },
    alpDocxCounts,
    warnings,
  };

  await writeJson("imported-pathways.json", normalized.pathways);
  await writeJson("imported-topics.json", normalized.topics);
  await writeJson("imported-skills.json", normalized.skills);
  await writeJson("imported-values.json", normalized.values);
  await writeJson("imported-learning-outcomes.json", normalized.learningOutcomes);
  await writeJson("import-manifest.json", manifest);

  return {
    manifest,
    success: warnings.every((w) => !w.message.startsWith("Failed to parse")),
  };
}
