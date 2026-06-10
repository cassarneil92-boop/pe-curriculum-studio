import { SKILL_ALIASES, VALUE_KEYWORDS } from "../config";
import { SKILL_PATTERNS } from "../taxonomy";
import type { ImportedValueRecord } from "../types";
import { makeRecordId, normaliseSkillId, normaliseTopicId, uniqueSorted } from "../utils";

export function inferSkillsFromDescription(description: string): string[] {
  const found: string[] = [];

  for (const entry of SKILL_PATTERNS) {
    if (entry.patterns.some((pattern) => pattern.test(description))) {
      if (!found.includes(entry.skill)) found.push(entry.skill);
    }
  }

  for (const [alias, label] of Object.entries(SKILL_ALIASES)) {
    const pattern = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(description) && !found.includes(label)) {
      found.push(label);
    }
  }

  return uniqueSorted(found);
}

export function buildValuesFromTheme(
  theme: string,
  description: string,
  topic: string,
  topicId: string,
  skills: string[],
  parentCode: string
): ImportedValueRecord[] {
  const skillIds = skills.map((s) => normaliseSkillId(s));
  const themeKey = theme.toLowerCase().replace(/\s+/g, "-");
  const matched = VALUE_KEYWORDS.find((entry) =>
    entry.pattern.test(theme) || entry.pattern.test(description)
  );

  return [
    {
      id: makeRecordId(["val", topicId, themeKey, parentCode]),
      code: `VAL.${parentCode}.${themeKey.toUpperCase().slice(0, 3)}`,
      description: cleanValueDescription(description, theme),
      theme: matched?.theme ?? themeKey,
      topic,
      topicId,
      skills,
      skillIds,
    },
  ];
}

function cleanValueDescription(description: string, theme: string): string {
  const cleaned = description.replace(/^LO:\s*/i, "").trim();
  return cleaned || theme;
}

export function parseYearGroupHeader(line: string): string | null {
  const match = line.match(/^Year\s+(\d{1,2})\s*$/i);
  return match ? `Year ${match[1]}` : null;
}

export function slugifyTheme(theme: string): string {
  return normaliseTopicId(theme);
}
