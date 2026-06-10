/**
 * Official invasion/net game formats from the PE syllabus pedagogical model table.
 * Used to tag generic IG/NG learning outcomes with applicable sports (metadata only).
 */

export const INVASION_SPORTS_BY_LEVEL: Record<string, string[]> = {
  "7": ["Basketball", "Handball", "Hockey"],
  "8": ["Basketball", "Handball", "Hockey", "Football"],
  "9": ["Basketball", "Handball", "Hockey", "Football", "Touch Rugby", "Tchoukball"],
  "10": ["Basketball", "Handball", "Hockey", "Football", "Touch Rugby", "Tchoukball"],
};

export const NET_SPORTS_BY_LEVEL: Record<string, string[]> = {
  "7": ["Volleyball", "Badminton", "Pickleball"],
  "8": ["Volleyball", "Badminton", "Pickleball"],
  "9": ["Volleyball", "Badminton", "Pickleball"],
  "10": ["Volleyball", "Badminton", "Pickleball"],
};

export function resolveGameTopicsForCode(code: string): string[] {
  const match = code.match(/^(IG|NG)(\d+)\./i);
  if (!match) return [];

  const strand = match[1].toUpperCase();
  const level = match[2];
  const sports =
    strand === "IG"
      ? INVASION_SPORTS_BY_LEVEL[level]
      : NET_SPORTS_BY_LEVEL[level];

  return sports ?? [];
}
