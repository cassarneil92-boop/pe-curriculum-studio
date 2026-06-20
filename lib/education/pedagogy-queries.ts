import { getPlanningSkillDisplayName, getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import { getYearGroupLabel } from "@/lib/year-groups";
import type { YearGroupId } from "@/lib/year-groups";
import { getAllPedagogyKnowledge, getPedagogyKnowledge } from "./knowledge-library";
import { recommendPedagogies } from "./recommendations";
import type { EducationPedagogyId, PedagogyQueryResult } from "./types";

const PEDAGOGY_ALIASES: Record<string, EducationPedagogyId> = {
  tgfu: "tgfu",
  "teaching games for understanding": "tgfu",
  "whole part whole": "whole-part-whole",
  wpw: "whole-part-whole",
  "whole-part-whole": "whole-part-whole",
  "whole analytic whole": "whole-analytic-whole",
  "guided discovery": "guided-discovery",
  "direct instruction": "direct-instruction",
  "constraints led": "constraints-led",
  "constraints-led": "constraints-led",
  cla: "constraints-led",
  "cooperative learning": "cooperative-learning",
  "sport education": "sport-education",
  "inquiry based": "inquiry-based",
  "inquiry-based": "inquiry-based",
  "non linear": "non-linear-pedagogy",
  "non-linear pedagogy": "non-linear-pedagogy",
  "physical literacy": "physical-literacy",
};

function resolvePedagogyId(text: string): EducationPedagogyId | null {
  const key = text.trim().toLowerCase();
  if (PEDAGOGY_ALIASES[key]) return PEDAGOGY_ALIASES[key];
  for (const [alias, id] of Object.entries(PEDAGOGY_ALIASES)) {
    if (key.includes(alias)) return id;
  }
  const byId = getAllPedagogyKnowledge().find(
    (entry) => entry.name.toLowerCase() === key || entry.id === key
  );
  return byId?.id ?? null;
}

function extractPedagogyIdsFromQuery(query: string): EducationPedagogyId[] {
  const found: EducationPedagogyId[] = [];
  for (const [alias, id] of Object.entries(PEDAGOGY_ALIASES)) {
    if (query.includes(alias) && !found.includes(id)) found.push(id);
  }
  return found;
}

export function explainPedagogy(id: EducationPedagogyId): PedagogyQueryResult | null {
  const entry = getPedagogyKnowledge(id);
  if (!entry) return null;

  return {
    answer: [
      `**${entry.name}** (${entry.category})`,
      entry.description,
      "",
      `**Strengths:** ${entry.strengths.join("; ")}.`,
      `**Limitations:** ${entry.limitations.join("; ")}.`,
      `**Practical implications:** ${entry.practicalImplications.join(" ")}`,
    ].join("\n"),
    pedagogyIds: [id],
    sources: entry.sources,
    suggestions: [
      `Suggest a ${entry.name} lesson for my class`,
      `Compare ${entry.name} with Whole Part Whole`,
    ],
  };
}

export function handlePedagogyQuery(
  query: string,
  context?: {
    topicId?: string;
    skillId?: string;
    yearGroupId?: YearGroupId;
  }
): PedagogyQueryResult | null {
  const q = query.toLowerCase();

  if (/\bcompare\b/.test(q)) {
    const ids = extractPedagogyIdsFromQuery(q);
    if (ids.length >= 2) {
      const a = getPedagogyKnowledge(ids[0]);
      const b = getPedagogyKnowledge(ids[1]);
      if (a && b) {
        return {
          answer: [
            `**${a.name}** focuses on ${a.bestFor.slice(0, 2).join(" and ").toLowerCase()}. ${a.description}`,
            "",
            `**${b.name}** focuses on ${b.bestFor.slice(0, 2).join(" and ").toLowerCase()}. ${b.description}`,
            "",
            `Use ${a.name} when tactical understanding and game context come first.`,
            `Use ${b.name} when structured technical progression with return to context is the priority.`,
          ].join("\n"),
          pedagogyIds: [ids[0], ids[1]],
          sources: [...a.sources, ...b.sources],
          suggestions: [`When should I use ${a.name}?`, `Suggest a lesson using ${b.name}`],
        };
      }
    }
  }

  if (/\bwhen should i use\b|\bwhen to use\b|\bbest pedagogical\b|\bbest approach\b/.test(q)) {
    if (context?.topicId && context.yearGroupId) {
      const recs = recommendPedagogies({
        topicId: context.topicId,
        skillId: context.skillId ?? "",
        yearGroupId: context.yearGroupId,
        limit: 3,
      });
      if (recs.length > 0) {
        const topic = getPlanningTopicDisplayName(context.topicId);
        const skill = context.skillId ? getPlanningSkillDisplayName(context.skillId) : "";
        return {
          answer: [
            `For **${getYearGroupLabel(context.yearGroupId)}** ${topic}${skill ? ` — ${skill}` : ""}, these approaches fit well:`,
            ...recs.map((r) => `- **${r.name}** — ${r.reason}`),
          ].join("\n"),
          pedagogyIds: recs.map((r) => r.id),
          sources: recs.flatMap((r) => getPedagogyKnowledge(r.id)?.sources ?? []),
          suggestions: recs.map((r) => `Explain ${r.name}`),
        };
      }
    }
  }

  if (/\bsuggest\b.*\blesson\b/.test(q)) {
    const ids = extractPedagogyIdsFromQuery(q);
    const id = ids[0] ?? resolvePedagogyId(q);
    if (id) {
      const entry = getPedagogyKnowledge(id);
      if (entry) {
        return {
          answer: [
            `**Suggested ${entry.name} lesson structure:**`,
            entry.lessonPhases.map((phase, i) => `${i + 1}. ${phase}`).join("\n"),
            "",
            `Example: ${entry.lessonExamples[0] ?? entry.practicalImplications[0]}`,
          ].join("\n"),
          pedagogyIds: [id],
          sources: entry.sources,
          suggestions: [`Explain ${entry.name}`, `Compare ${entry.name} with TGfU`],
        };
      }
    }
  }

  if (/\badvantages\b|\bbenefits\b/.test(q)) {
    const id = extractPedagogyIdsFromQuery(q)[0] ?? resolvePedagogyId(q);
    if (id) {
      const entry = getPedagogyKnowledge(id);
      if (entry) {
        return {
          answer: [
            `**Advantages of ${entry.name}:**`,
            ...entry.strengths.map((s) => `- ${s}`),
            "",
            `Best for: ${entry.bestFor.join(", ")}.`,
          ].join("\n"),
          pedagogyIds: [id],
          sources: entry.sources,
          suggestions: [`When should I use ${entry.name}?`],
        };
      }
    }
  }

  if (/\bexplain\b|\bwhat is\b/.test(q)) {
    const id = extractPedagogyIdsFromQuery(q)[0] ?? resolvePedagogyId(q);
    if (id) return explainPedagogy(id);
  }

  const directId = extractPedagogyIdsFromQuery(q)[0];
  if (directId && /\btgfu\b|pedagog|approach|model|learning\b/.test(q)) {
    return explainPedagogy(directId);
  }

  return null;
}

export function detectPedagogyQuery(query: string): boolean {
  const q = query.toLowerCase();
  return (
    /\bexplain\b.*\b(tgfu|pedagog|approach|whole part|guided discovery|constraints)\b/.test(q) ||
    /\bcompare\b.*\b(tgfu|whole|guided|constraints|cooperative|sport education)\b/.test(q) ||
    /\bwhen should i use\b/.test(q) ||
    /\bbest pedagogical approach\b/.test(q) ||
    /\badvantages of\b.*\b(cooperative|tgfu|learning)\b/.test(q) ||
    /\bsuggest\b.*\blesson\b.*\b(approach|constraints|tgfu)\b/.test(q)
  );
}

export { resolvePedagogyId, extractPedagogyIdsFromQuery };
