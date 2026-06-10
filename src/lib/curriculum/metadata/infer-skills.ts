import { METADATA_SKILL_PATTERNS } from "./skill-patterns";

function normaliseSkillId(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function inferSkillIdsFromText(
  description: string,
  existingSkillIds: string[] = []
): string[] {
  const text = description.trim();
  if (!text) return [...existingSkillIds];

  const found = new Set(existingSkillIds.map(normaliseSkillId));

  for (const pattern of METADATA_SKILL_PATTERNS) {
    if (pattern.patterns.some((regex) => regex.test(text))) {
      found.add(pattern.id);
    }
  }

  return [...found];
}

export function mergeSkillIds(
  existingSkillIds: string[] | undefined,
  inferredSkillIds: string[]
): string[] {
  const merged = new Set<string>();
  for (const id of existingSkillIds ?? []) {
    if (id.trim()) merged.add(normaliseSkillId(id));
  }
  for (const id of inferredSkillIds) {
    if (id.trim()) merged.add(normaliseSkillId(id));
  }
  return [...merged];
}

export function skillLabelsForIds(skillIds: string[]): string[] {
  const labelMap = new Map(
    METADATA_SKILL_PATTERNS.map((pattern) => [pattern.id, pattern.label])
  );

  return skillIds.map((id) => {
    const key = normaliseSkillId(id);
    return labelMap.get(key) ?? key.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  });
}
