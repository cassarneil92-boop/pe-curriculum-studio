import { SKILL_ALIASES, TOPIC_ALIASES } from "./config";

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normaliseTopicId(name: string): string {
  return toSlug(name);
}

export function normaliseSkillId(name: string): string {
  return toSlug(name);
}

export function resolveTopicName(raw: string): string | null {
  const key = raw.trim().toLowerCase();
  return TOPIC_ALIASES[key] ?? (raw.trim() ? raw.trim() : null);
}

export function resolveSkillName(raw: string): string | null {
  const key = raw.trim().toLowerCase();
  return SKILL_ALIASES[key] ?? (raw.trim() ? raw.trim() : null);
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

export function cleanDescription(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/^[\-–:•]\s*/, "")
    .trim();
}

export function makeRecordId(parts: string[]): string {
  return parts.map((p) => toSlug(p)).filter(Boolean).join("-");
}
