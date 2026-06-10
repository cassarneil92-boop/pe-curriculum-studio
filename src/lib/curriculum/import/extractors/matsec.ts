import type { ImportSourceConfig, ImportedLearningOutcomeRecord, ImportWarning } from "../types";
import { cleanDescription, makeRecordId, normaliseSkillId, uniqueSorted } from "../utils";
import { inferSkillsFromDescription } from "./shared";

const LO_BLOCK_PATTERN =
  /Learning Outcome\s+(\d+)\s*:\s*([\s\S]*?)(?=Learning Outcome\s+\d+\s*:|Subject Focus\s+\d+:|Assessment Criteria|SEC\s*32\s+SYLLABUS|$)/gi;

const LO_LIST_PATTERN =
  /(?:^|\s)LO\s+(\d{1,2})\s+((?:I can[\s\S]*?))(?=\s+LO\s+\d{1,2}\s+|$)/gi;

function inferTopicFromStrand(strand: string): { topic: string; topicId: string } | null {
  const lower = strand.toLowerCase();
  if (/individual sport/i.test(lower))
    return { topic: "Individual Activity", topicId: "individual-activity" };
  if (/swimming and athletics/i.test(lower))
    return { topic: "Athletics", topicId: "athletics" };
  if (/outdoor trekking/i.test(lower)) return { topic: "Outdoor", topicId: "outdoor" };
  if (/team sport.*handball/i.test(lower))
    return { topic: "Handball", topicId: "handball" };
  if (/team sport.*football/i.test(lower))
    return { topic: "Football", topicId: "football" };
  if (/team sport.*basketball/i.test(lower))
    return { topic: "Basketball", topicId: "basketball" };
  if (/team sport.*rugby/i.test(lower)) return { topic: "Rugby", topicId: "rugby" };
  if (/skill acquisition|sport psychology/i.test(lower))
    return { topic: "Sport Psychology", topicId: "sport-psychology" };
  if (/training|fitness testing/i.test(lower))
    return { topic: "Fitness", topicId: "fitness" };
  if (/health|wellbeing/i.test(lower))
    return { topic: "Health & Wellbeing", topicId: "health-wellbeing" };
  if (/anatomy|physiology/i.test(lower))
    return { topic: "Anatomy & Physiology", topicId: "anatomy-physiology" };
  if (/sport in society/i.test(lower))
    return { topic: "Sport & Society", topicId: "sport-society" };
  return null;
}

function inferTopicFromLoText(text: string): { topic: string; topicId: string } {
  const lower = text.toLowerCase();
  if (/\bhandball\b/.test(lower)) return { topic: "Handball", topicId: "handball" };
  if (/\bfootball\b/.test(lower)) return { topic: "Football", topicId: "football" };
  if (/\bbasketball\b/.test(lower)) return { topic: "Basketball", topicId: "basketball" };
  if (/\bvolleyball\b/.test(lower)) return { topic: "Volleyball", topicId: "volleyball" };
  if (/\bnetball\b/.test(lower)) return { topic: "Netball", topicId: "netball" };
  if (/\brugby\b/.test(lower)) return { topic: "Rugby", topicId: "rugby" };
  if (/\bathletics\b|\bswimming\b/.test(lower))
    return { topic: "Athletics", topicId: "athletics" };
  if (/\bfitness\b|\btraining\b/.test(lower))
    return { topic: "Fitness", topicId: "fitness" };
  if (/\boutdoor\b|\btrekking\b/.test(lower))
    return { topic: "Outdoor", topicId: "outdoor" };
  return { topic: "General", topicId: "general" };
}

function sanitiseMatsecDescription(description: string): string {
  return cleanDescription(
    description
      .replace(/\(Paper[^)]*\)/gi, "")
      .replace(/Assessment Criteria[\s\S]*/i, "")
      .replace(/SEC\s*32\s+SYLLABUS[\s\S]*/i, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function buildMatsecOutcome(
  source: ImportSourceConfig,
  sourceFile: string,
  loNumber: string,
  description: string,
  strand: string
): ImportedLearningOutcomeRecord {
  const cleaned = sanitiseMatsecDescription(description);
  const { topic, topicId } =
    inferTopicFromStrand(strand) ?? inferTopicFromLoText(cleaned);
  const skills = inferSkillsFromDescription(cleaned);
  const code = `SEC.LO${loNumber}`;

  return {
    id: makeRecordId(["lo", source.pathwayId, code]),
    code,
    description: cleaned,
    pathwayId: source.pathwayId,
    pathwayLabel: source.pathwayLabel,
    yearGroups: uniqueSorted(source.defaultYearGroups ?? ["Year 10", "Year 11"]),
    topic,
    topicId,
    skills,
    skillIds: skills.map((s) => normaliseSkillId(s)),
    values: [],
    strand,
    sourceFile,
    rawExcerpt: cleaned.slice(0, 280),
  };
}

export function extractMatsecFormat(
  text: string,
  source: ImportSourceConfig,
  sourceFile: string
): { outcomes: ImportedLearningOutcomeRecord[]; warnings: ImportWarning[] } {
  const outcomes: ImportedLearningOutcomeRecord[] = [];
  const warnings: ImportWarning[] = [];
  const seen = new Set<string>();

  const focusSections = text.split(/Subject Focus\s+(\d+)\s*:\s*([^\n]+)/i);
  for (let i = 1; i < focusSections.length; i += 3) {
    const focusNumber = focusSections[i];
    const focusTitle = focusSections[i + 1]?.trim() ?? `Focus ${focusNumber}`;
    const sectionBody = focusSections[i + 2] ?? "";

    for (const match of sectionBody.matchAll(LO_BLOCK_PATTERN)) {
      const loNumber = match[1];
      const description = sanitiseMatsecDescription(match[2]);
      const key = `block-${loNumber}`;
      if (seen.has(key) || description.length < 20 || description.length > 1200) continue;
      seen.add(key);
      outcomes.push(
        buildMatsecOutcome(source, sourceFile, loNumber, description, focusTitle)
      );
    }
  }

  if (outcomes.length === 0) {
    for (const match of text.matchAll(LO_LIST_PATTERN)) {
      const loNumber = match[1];
      const description = sanitiseMatsecDescription(match[2]);
      const key = `list-${loNumber}`;
      if (seen.has(key) || description.length < 20 || description.length > 1200) continue;
      seen.add(key);
      outcomes.push(
        buildMatsecOutcome(source, sourceFile, loNumber, description, "SEC Syllabus")
      );
    }
  }

  if (outcomes.length === 0) {
    warnings.push({
      sourceFile,
      message: "MATSEC format detected but no LO blocks parsed.",
    });
  }

  return { outcomes, warnings };
}

export function isMatsecDocument(text: string, filename: string): boolean {
  if (/im\s*36|im36/i.test(filename)) return false;
  return (
    /SEC\s*32|sec32/i.test(filename) ||
    (/Learning Outcomes and Assessment Criteria/i.test(text) &&
      /Subject Focus\s+\d+:/i.test(text))
  );
}
