import type {
  ImportSourceConfig,
  ImportedLearningOutcomeRecord,
  ImportWarning,
} from "../types";
import { cleanDescription, makeRecordId, normaliseSkillId, uniqueSorted } from "../utils";
import { inferSkillsFromDescription } from "./shared";

const MODULE_PATTERN =
  /Module\s+(\d+)\s+([\s\S]*?)(?=Module\s+\d+\s+|IM Syllabus|$)/gi;

const ITEM_PATTERN = /(?:^|\s)([ivx]+|\d+)\)\s+([^\n]+?)(?=\s+[ivx]+\)|\s+\d+\)|Module|$)/gi;

function inferTopicFromModule(title: string): { topic: string; topicId: string } {
  const lower = title.toLowerCase();
  if (/team games|techniques/i.test(lower))
    return { topic: "Team Games", topicId: "team-games" };
  if (/anatomy|physiology/i.test(lower))
    return { topic: "Anatomy & Physiology", topicId: "anatomy-physiology" };
  if (/movement skills/i.test(lower))
    return { topic: "Movement Skills", topicId: "movement-skills" };
  if (/socio-cultural|sport organisations/i.test(lower))
    return { topic: "Sport & Society", topicId: "sport-society" };
  if (/fitness/i.test(lower)) return { topic: "Fitness", topicId: "fitness" };
  return { topic: "IM Syllabus", topicId: "im-syllabus" };
}

export function isImSyllabusDocument(text: string, filename: string): boolean {
  return (
    /im\s*36|im36/i.test(filename) ||
    (/PHYSICAL EDUCATION IM\s*36/i.test(text) && /Module\s+1/i.test(text))
  );
}

export function extractImSyllabusFormat(
  text: string,
  source: ImportSourceConfig,
  sourceFile: string
): { outcomes: ImportedLearningOutcomeRecord[]; warnings: ImportWarning[] } {
  const outcomes: ImportedLearningOutcomeRecord[] = [];
  const warnings: ImportWarning[] = [];

  for (const moduleMatch of text.matchAll(MODULE_PATTERN)) {
    const moduleNumber = moduleMatch[1];
    const moduleBody = moduleMatch[2];
    const titleLine = moduleBody.split("\n").find((line) => line.trim())?.trim() ?? "";
    const { topic, topicId } = inferTopicFromModule(titleLine);

    const moduleSummary = cleanDescription(titleLine);
    if (moduleSummary.length >= 20) {
      outcomes.push({
        id: makeRecordId(["lo", source.pathwayId, `IM36.M${moduleNumber}`]),
        code: `IM36.M${moduleNumber}`,
        description: moduleSummary,
        pathwayId: source.pathwayId,
        pathwayLabel: source.pathwayLabel,
        yearGroups: uniqueSorted(source.defaultYearGroups ?? ["Year 7", "Year 8", "Year 9"]),
        topic,
        topicId,
        skills: [],
        skillIds: [],
        values: [],
        strand: `Module ${moduleNumber}`,
        sourceFile,
        rawExcerpt: moduleSummary.slice(0, 280),
      });
    }

    for (const itemMatch of moduleBody.matchAll(ITEM_PATTERN)) {
      const itemId = itemMatch[1];
      const description = cleanDescription(itemMatch[2]);
      if (description.length < 8) continue;

      const skills = inferSkillsFromDescription(description);
      const code = `IM36.M${moduleNumber}.${itemId}`;

      outcomes.push({
        id: makeRecordId(["lo", source.pathwayId, code]),
        code,
        description,
        pathwayId: source.pathwayId,
        pathwayLabel: source.pathwayLabel,
        yearGroups: uniqueSorted(source.defaultYearGroups ?? ["Year 7", "Year 8", "Year 9"]),
        topic,
        topicId,
        skills,
        skillIds: skills.map((s) => normaliseSkillId(s)),
        values: [],
        strand: `Module ${moduleNumber}`,
        sourceFile,
        rawExcerpt: description.slice(0, 280),
      });
    }
  }

  if (outcomes.length === 0) {
    warnings.push({
      sourceFile,
      message:
        "IM 36 syllabus detected but no module content parsed. Document may be outline-only.",
    });
  }

  return { outcomes, warnings };
}
