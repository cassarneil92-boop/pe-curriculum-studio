/**
 * Import pipeline types — separate from runtime curriculum models.
 * Describes raw extracted records written to src/lib/curriculum/data/*.json
 */

export type AlpOutcomeCategory = "Knowledge" | "Skills" | "Competences";

export type CurriculumSourceFormat = "pdf" | "docx";

export interface ImportSourceConfig {
  file: string;
  pathwayId: string;
  pathwayLabel: string;
  defaultYearGroups?: string[];
  format?: CurriculumSourceFormat;
}

export interface ImportSourcesFile {
  sources: ImportSourceConfig[];
}

export interface ImportedValueRecord {
  id: string;
  code: string;
  description: string;
  theme: string;
  topic: string;
  topicId: string;
  skills: string[];
  skillIds: string[];
}

export interface ImportedLearningOutcomeRecord {
  id: string;
  code: string;
  description: string;
  pathwayId: string;
  pathwayLabel: string;
  yearGroups: string[];
  topic: string;
  topicId: string;
  /** Additional topic labels when an outcome spans multiple domains. */
  topics?: string[];
  skills: string[];
  skillIds: string[];
  values: ImportedValueRecord[];
  strand: string;
  sourceFile: string;
  /** Original source document filename (PDF or DOCX). */
  sourceDocument?: string;
  sourcePage?: number;
  /** ALP qualification level, e.g. Level 1 or Level 2. */
  level?: string;
  /** ALP outcome category: Knowledge, Skills, or Competences. */
  category?: AlpOutcomeCategory;
  /** Assessment guidance captured from DOCX additional notes. */
  assessmentNotes?: string;
  rawExcerpt: string;
}

export interface ImportedTopicRecord {
  id: string;
  name: string;
  skillIds: string[];
  sourceFiles: string[];
}

export interface ImportedSkillRecord {
  id: string;
  name: string;
  topicIds: string[];
  sourceFiles: string[];
}

export interface ImportedPathwayRecord {
  id: string;
  label: string;
  sourceFiles: string[];
  learningOutcomeCount: number;
}

export interface ImportWarning {
  sourceFile: string;
  message: string;
  rawExcerpt?: string;
}

export interface ImportManifest {
  importedAt: string;
  sourceDirectory: string;
  outputDirectory: string;
  sourceFiles: string[];
  ignoredFiles: string[];
  pathways: ImportedPathwayRecord[];
  recordCounts: {
    learningOutcomes: number;
    topics: number;
    skills: number;
    values: number;
  };
  alpDocxCounts: {
    alpPe: number;
    alpSportsVocational: number;
  };
  warnings: ImportWarning[];
}
