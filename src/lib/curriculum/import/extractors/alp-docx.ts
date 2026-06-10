import type {
  AlpOutcomeCategory,
  ImportSourceConfig,
  ImportedLearningOutcomeRecord,
  ImportedValueRecord,
  ImportWarning,
} from "../types";
import { VALUE_KEYWORDS } from "../config";
import {
  cleanDescription,
  makeRecordId,
  normaliseSkillId,
  normaliseTopicId,
  uniqueSorted,
} from "../utils";
import { inferSkillsFromDescription } from "./shared";

const CATEGORY_SECTIONS: {
  category: AlpOutcomeCategory;
  code: string;
  start: RegExp;
  end: RegExp;
}[] = [
  {
    category: "Knowledge",
    code: "2.1",
    start: /2\.1\s+Knowledge\b/i,
    end: /2\.2\s+Skills\b/i,
  },
  {
    category: "Skills",
    code: "2.2",
    start: /2\.2\s+Skills\b[\s\S]*?:/i,
    end: /2\.3\s+Competences\b/i,
  },
  {
    category: "Competences",
    code: "2.3",
    start: /2\.3\s+Competences\b[\s\S]*?:/i,
    end: /3\.\s+Hours\b/i,
  },
];

const LEVEL_SPLIT_PATTERN = /\n\s*ALP Sports Level\s+(\d+)\s*\n/i;

const TOPIC_PATTERNS: { pattern: RegExp; topic: string }[] = [
  { pattern: /\bfootball\b/i, topic: "Football" },
  { pattern: /\bbasketball\b/i, topic: "Basketball" },
  { pattern: /\bhandball\b/i, topic: "Handball" },
  { pattern: /\bvolleyball\b/i, topic: "Volleyball" },
  { pattern: /\btennis\b/i, topic: "Tennis" },
  { pattern: /\bbadminton\b/i, topic: "Badminton" },
  { pattern: /\brugby\b/i, topic: "Rugby" },
  { pattern: /\bhockey\b/i, topic: "Hockey" },
  { pattern: /\bathletics\b/i, topic: "Athletics" },
  { pattern: /\bswimming\b/i, topic: "Swimming" },
  { pattern: /\bhealthy lifestyle\b/i, topic: "Healthy Lifestyle" },
  { pattern: /\bhome economics\b/i, topic: "Home Economics" },
  { pattern: /\blife[\s-]?skills\b/i, topic: "Life Skills" },
  { pattern: /\bnutrition|healthy diet|healthy meal\b/i, topic: "Nutrition" },
  { pattern: /\bphysical (?:activity|wellbeing)\b/i, topic: "Physical Wellbeing" },
  { pattern: /\bmental wellbeing\b/i, topic: "Mental Wellbeing" },
  { pattern: /\bcommunication\b/i, topic: "Communication" },
  { pattern: /\bempathy\b/i, topic: "Empathy" },
  { pattern: /\bICT|software|hardware|internet|programming\b/i, topic: "ICT" },
  { pattern: /\bsport(?:ing)?\b/i, topic: "Sport" },
];

const OUTCOME_VERB_PATTERN =
  /^(Identify|Recall|List|Name|Write|Describe|Define|Sequence|Associate|Practise|Practice|Demonstrate|Compare|Self-evaluate|Complete|Collaborate|Comply|Show|Prepare|Apply|Interact|Discuss|Abide|Make|Adopt|Analyse|Analyze|Follow|Listen|Explain|Transform|Think|Undertake|Develop|Choose|Use|Plan|Participate|Get engaged|Cook|Tell|Give|Understand|Recite)\b/i;

const SKIP_LINE_PATTERN =
  /^(2\.|3\.|4\.|5\.|6\.|7\.|8\.|Hours|Self-Study|Supervised|Assessment|ECVET|discussions|fieldwork|hands-on|lectures|examination|portfolio|Teachers notes|Books|Preference will)/i;

function pathwayCodePrefix(pathwayId: string): string {
  return pathwayId === "alp-pe" ? "PE" : "SV";
}

function inferTopics(description: string, subjectTitle: string): string[] {
  const topics = new Set<string>();
  const combined = `${subjectTitle} ${description}`;

  for (const entry of TOPIC_PATTERNS) {
    if (entry.pattern.test(combined)) topics.add(entry.topic);
  }

  if (topics.size === 0) {
    if (/supplementary/i.test(subjectTitle)) topics.add("Supplementary Studies");
    else if (/sport/i.test(subjectTitle)) topics.add("Sport");
    else topics.add("ALP Curriculum");
  }

  return [...topics];
}

function extractValues(
  description: string,
  topics: string[],
  topicId: string,
  skills: string[],
  code: string
): ImportedValueRecord[] {
  const values: ImportedValueRecord[] = [];
  const skillIds = skills.map((s) => normaliseSkillId(s));
  const primaryTopic = topics[0] ?? "ALP Curriculum";

  for (const entry of VALUE_KEYWORDS) {
    if (!entry.pattern.test(description)) continue;
    values.push({
      id: makeRecordId(["val", topicId, entry.theme, code]),
      code: `VAL.${code}.${entry.theme}`,
      description: `${entry.label} in ${primaryTopic} context.`,
      theme: entry.theme,
      topic: primaryTopic,
      topicId,
      skills,
      skillIds,
    });
  }

  if (/\bempathy\b/i.test(description)) {
    values.push({
      id: makeRecordId(["val", topicId, "empathy", code]),
      code: `VAL.${code}.empathy`,
      description: "Empathy in ALP learning context.",
      theme: "respect",
      topic: primaryTopic,
      topicId,
      skills,
      skillIds,
    });
  }

  return values.filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i);
}

function splitOutcomeItems(sectionText: string): string[] {
  const items: string[] = [];
  const paragraphs = sectionText
    .split(/\n\s*\n+/)
    .map((part) => cleanDescription(part))
    .filter(Boolean);

  let buffer = "";

  for (const paragraph of paragraphs) {
    if (SKIP_LINE_PATTERN.test(paragraph)) continue;
    if (paragraph.length < 20) continue;

    if (OUTCOME_VERB_PATTERN.test(paragraph)) {
      if (buffer) items.push(cleanDescription(buffer));
      buffer = paragraph;
      continue;
    }

    if (buffer) buffer = `${buffer} ${paragraph}`;
    else if (paragraph.length >= 30) items.push(paragraph);
  }

  if (buffer) items.push(cleanDescription(buffer));

  return items.filter((item) => item.length >= 20 && OUTCOME_VERB_PATTERN.test(item));
}

function extractAssessmentNotes(text: string): string | undefined {
  const match = text.match(
    /Additional notes\s*([\s\S]*?)(?=7\.\s+Learning Resources|8\.\s+Additional minimum|$)/i
  );
  if (!match) return undefined;
  const notes = cleanDescription(match[1]);
  return notes.length >= 20 ? notes.slice(0, 1200) : undefined;
}

function extractSubjectTitle(levelText: string): string {
  const match = levelText.match(
    /1\.\s*Title of the subject:\s*([\s\S]*?)(?=2\.\s+Learning Outcomes)/i
  );
  return cleanDescription(match?.[1] ?? "");
}

function detectLevel(levelText: string, fallback?: string): string {
  const title = extractSubjectTitle(levelText);
  const fromTitle = title.match(/Level\s*(\d+)/i);
  if (fromTitle) return `Level ${fromTitle[1]}`;

  const fromBody = levelText.match(/Level\s*(\d+)/i);
  if (fromBody) return `Level ${fromBody[1]}`;

  const l2 = levelText.match(/LOs\s*L\s*(\d+)/i);
  if (l2) return `Level ${l2[1]}`;

  return fallback ?? "Level 1";
}

function splitLevelSections(text: string): { level: string; body: string }[] {
  const sections: { level: string; body: string }[] = [];
  const splitIndex = text.search(LEVEL_SPLIT_PATTERN);

  if (splitIndex >= 0) {
    const levelMatch = text.slice(splitIndex).match(LEVEL_SPLIT_PATTERN);
    const levelNumber = levelMatch?.[1] ?? "2";
    sections.push({
      level: "Level 1",
      body: text.slice(0, splitIndex),
    });
    sections.push({
      level: `Level ${levelNumber}`,
      body: text.slice(splitIndex),
    });
    return sections;
  }

  return [{ level: detectLevel(text), body: text }];
}

function extractCategorySection(body: string, section: (typeof CATEGORY_SECTIONS)[number]): string {
  const startMatch = body.match(section.start);
  if (!startMatch || startMatch.index === undefined) return "";

  const start = startMatch.index + startMatch[0].length;
  const remainder = body.slice(start);
  const endMatch = remainder.match(section.end);
  const end = endMatch?.index ?? remainder.length;
  return remainder.slice(0, end);
}

function buildOutcome(
  source: ImportSourceConfig,
  sourceFile: string,
  level: string,
  category: AlpOutcomeCategory,
  categoryCode: string,
  index: number,
  description: string,
  subjectTitle: string,
  assessmentNotes?: string
): ImportedLearningOutcomeRecord {
  const prefix = pathwayCodePrefix(source.pathwayId);
  const levelNumber = level.replace(/\D/g, "") || "1";
  const categoryShort =
    category === "Knowledge" ? "K" : category === "Skills" ? "S" : "C";
  const code = `ALP.${prefix}.L${levelNumber}.${categoryCode}${categoryShort}${String(index).padStart(2, "0")}`;
  const topics = inferTopics(description, subjectTitle);
  const topic = topics[0];
  const topicId = normaliseTopicId(topic);
  const skills = inferSkillsFromDescription(description);
  const skillIds = skills.map((s) => normaliseSkillId(s));

  return {
    id: makeRecordId(["lo", source.pathwayId, code]),
    code,
    description,
    pathwayId: source.pathwayId,
    pathwayLabel: source.pathwayLabel,
    yearGroups: uniqueSorted(source.defaultYearGroups ?? []),
    topic,
    topicId,
    topics,
    skills,
    skillIds,
    values: extractValues(description, topics, topicId, skills, code),
    strand: subjectTitle || category,
    sourceFile,
    sourceDocument: sourceFile,
    level,
    category,
    assessmentNotes,
    rawExcerpt: description.slice(0, 280),
  };
}

export function isAlpDocxDocument(filename: string): boolean {
  return /\.docx$/i.test(filename) && /alp/i.test(filename);
}

export function extractAlpDocxFormat(
  text: string,
  source: ImportSourceConfig,
  sourceFile: string
): { outcomes: ImportedLearningOutcomeRecord[]; warnings: ImportWarning[] } {
  const outcomes: ImportedLearningOutcomeRecord[] = [];
  const warnings: ImportWarning[] = [];
  const assessmentNotes = extractAssessmentNotes(text);
  const levelSections = splitLevelSections(text);

  for (const { level, body } of levelSections) {
    const subjectTitle = extractSubjectTitle(body);
    const resolvedLevel = detectLevel(body, level);

    for (const section of CATEGORY_SECTIONS) {
      const sectionText = extractCategorySection(body, section);
      if (!sectionText.trim()) {
        warnings.push({
          sourceFile,
          message: `${resolvedLevel} ${section.category} section not found or empty.`,
        });
        continue;
      }

      const items = splitOutcomeItems(sectionText);
      items.forEach((description, index) => {
        outcomes.push(
          buildOutcome(
            source,
            sourceFile,
            resolvedLevel,
            section.category,
            section.code,
            index + 1,
            description,
            subjectTitle,
            assessmentNotes
          )
        );
      });
    }
  }

  if (outcomes.length === 0) {
    warnings.push({
      sourceFile,
      message: "ALP DOCX format detected but no Knowledge/Skills/Competences outcomes parsed.",
    });
  }

  return { outcomes, warnings };
}
