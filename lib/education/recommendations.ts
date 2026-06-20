import { getPlanningSkillDisplayName, getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import { getYearGroupLabel } from "@/lib/year-groups";
import type { YearGroupId } from "@/lib/year-groups";
import { getAllPedagogyKnowledge, getPedagogyKnowledge } from "./knowledge-library";
import type { EducationPedagogyId, KnowledgeSource, PedagogyRecommendation } from "./types";

function topicMatches(entryTopics: string[], topicLabel: string, topicId: string): boolean {
  const haystack = `${topicLabel} ${topicId}`.toLowerCase();
  if (entryTopics.some((t) => t.toLowerCase() === "all activities")) return true;
  return entryTopics.some((topic) => haystack.includes(topic.toLowerCase()));
}

function skillMatches(entryBestFor: string[], skillLabel: string): boolean {
  const skill = skillLabel.toLowerCase();
  const map: Record<string, string[]> = {
    passing: ["decision making", "tactical awareness", "game understanding", "communication"],
    shooting: ["technique accuracy", "technique refinement", "adaptability"],
    defending: ["tactical awareness", "decision making", "adaptability"],
    dribbling: ["adaptability", "skill under pressure", "technique refinement"],
  };
  for (const [key, tags] of Object.entries(map)) {
    if (skill.includes(key)) {
      return entryBestFor.some((b) => tags.includes(b.toLowerCase()));
    }
  }
  return entryBestFor.some((b) => skill.includes(b.toLowerCase().split(" ")[0] ?? ""));
}

function yearMatches(entryAgeGroups: string[], yearGroupId: YearGroupId): boolean {
  const label = getYearGroupLabel(yearGroupId);
  return entryAgeGroups.some((age) => age.toLowerCase() === label.toLowerCase());
}

export function recommendPedagogies(input: {
  topicId: string;
  skillId: string;
  yearGroupId: YearGroupId;
  limit?: number;
}): PedagogyRecommendation[] {
  const topicLabel = getPlanningTopicDisplayName(input.topicId);
  const skillLabel = input.skillId ? getPlanningSkillDisplayName(input.skillId) : "";

  const scored = getAllPedagogyKnowledge()
    .map((entry) => {
      let score = 0;
      if (topicMatches(entry.suitableFor, topicLabel, input.topicId)) score += 3;
      if (skillLabel && skillMatches(entry.bestFor, skillLabel)) score += 3;
      if (yearMatches(entry.ageGroups, input.yearGroupId)) score += 1;

      let reason = "";
      if (skillLabel && skillMatches(entry.bestFor, skillLabel)) {
        reason = `${entry.bestFor.slice(0, 2).join(" and ")} are central to ${skillLabel.toLowerCase()} in this unit.`;
      } else if (topicMatches(entry.suitableFor, topicLabel, input.topicId)) {
        reason = `Well suited to ${topicLabel} units at ${getYearGroupLabel(input.yearGroupId)}.`;
      } else {
        reason = entry.practicalImplications[0] ?? entry.description.slice(0, 120);
      }

      return {
        id: entry.id,
        name: entry.name,
        reason,
        confidence: (score >= 5 ? "high" : "medium") as PedagogyRecommendation["confidence"],
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const primary = scored.slice(0, input.limit ?? 3);
  return primary.map(({ id, name, reason, confidence }) => ({ id, name, reason, confidence }));
}

export function recommendPedagogyIds(input: {
  topicId: string;
  skillId: string;
  yearGroupId: YearGroupId;
  limit?: number;
}): EducationPedagogyId[] {
  return recommendPedagogies(input).map((item) => item.id);
}

export function primaryRecommendedPedagogy(input: {
  topicId: string;
  skillId: string;
  yearGroupId: YearGroupId;
}): EducationPedagogyId | null {
  return recommendPedagogies({ ...input, limit: 1 })[0]?.id ?? null;
}

export function comparePedagogies(
  idA: EducationPedagogyId,
  idB: EducationPedagogyId
): { summary: string; sources: KnowledgeSource[] } | null {
  const a = getPedagogyKnowledge(idA);
  const b = getPedagogyKnowledge(idB);
  if (!a || !b) return null;

  const summary = [
    `**${a.name}** (${a.category}): ${a.description}`,
    `Strengths: ${a.strengths.slice(0, 2).join("; ")}.`,
    "",
    `**${b.name}** (${b.category}): ${b.description}`,
    `Strengths: ${b.strengths.slice(0, 2).join("; ")}.`,
    "",
    `Choose ${a.name} when ${a.bestFor.slice(0, 2).join(" and ").toLowerCase()} matter most.`,
    `Choose ${b.name} when ${b.bestFor.slice(0, 2).join(" and ").toLowerCase()} are the priority.`,
  ].join("\n");

  return {
    summary,
    sources: [...a.sources, ...b.sources],
  };
}
