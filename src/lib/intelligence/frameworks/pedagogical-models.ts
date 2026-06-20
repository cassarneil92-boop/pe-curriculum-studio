/**
 * Official Maltese PE pedagogical models + extended educational knowledge library.
 */

import { getAllPedagogyKnowledge } from "@/lib/education/knowledge-library";
import type { EducationPedagogyId } from "@/lib/education/types";

export type PedagogicalModelId = EducationPedagogyId;

export interface PedagogicalModelDefinition {
  id: PedagogicalModelId;
  label: string;
  shortLabel: string;
  description: string;
  recommendedFor: string[];
}

export const PEDAGOGICAL_MODELS: PedagogicalModelDefinition[] = getAllPedagogyKnowledge().map(
  (entry) => ({
    id: entry.id,
    label: entry.name,
    shortLabel: entry.name.split("(")[0]?.trim() ?? entry.name,
    description: entry.description,
    recommendedFor: entry.suitableFor.map((s) => s.toLowerCase().replace(/\s+/g, "-")),
  })
);

export function getPedagogicalModelById(id: PedagogicalModelId): PedagogicalModelDefinition | undefined {
  return PEDAGOGICAL_MODELS.find((m) => m.id === id);
}

export function getPedagogicalModelLabel(id: PedagogicalModelId): string {
  return getPedagogicalModelById(id)?.shortLabel ?? id;
}
