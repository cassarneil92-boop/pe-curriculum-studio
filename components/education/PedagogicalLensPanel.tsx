"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { isApprovedEducationDomain, sourceLinkLabel } from "@/lib/education/approved-domains";
import { getPedagogyKnowledge } from "@/lib/education/knowledge-library";
import {
  primaryRecommendedPedagogy,
  recommendPedagogies,
} from "@/lib/education/recommendations";
import type { PedagogyRecommendation } from "@/lib/education/types";
import type { PedagogicalModelId } from "@/src/lib/intelligence/frameworks/pedagogical-models";
import { PEDAGOGICAL_MODELS } from "@/src/lib/intelligence/frameworks/pedagogical-models";
import type { YearGroupId } from "@/lib/year-groups";

const LENS_OPTIONS: PedagogicalModelId[] = [
  "tgfu",
  "direct-instruction",
  "whole-part-whole",
  "cooperative-learning",
  "sport-education",
  "guided-discovery",
  "constraints-led",
];

interface PedagogicalLensPanelProps {
  selected: PedagogicalModelId[];
  topicId: string;
  skillId: string;
  yearGroupId: YearGroupId;
  onChange: (models: PedagogicalModelId[]) => void;
}

export function PedagogicalLensPanel({
  selected,
  topicId,
  skillId,
  yearGroupId,
  onChange,
}: PedagogicalLensPanelProps) {
  const recommendations: PedagogyRecommendation[] =
    topicId && yearGroupId
      ? recommendPedagogies({ topicId, skillId, yearGroupId, limit: 3 })
      : [];

  const toggle = (id: PedagogicalModelId) => {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const applyRecommendation = () => {
    const primary = primaryRecommendedPedagogy({ topicId, skillId, yearGroupId });
    if (primary) onChange([primary]);
  };

  const primarySelected = selected[0] ? getPedagogyKnowledge(selected[0]) : null;

  return (
    <Card>
      <CardHeader
        title="Pedagogical lens"
        description="Choose how you want to teach this scheme — or use the assistant recommendation."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" className="text-xs" onClick={applyRecommendation}>
          Assistant recommendation
        </Button>
        <Button type="button" variant="ghost" className="text-xs" onClick={() => onChange([])}>
          Clear selection
        </Button>
      </div>

      {recommendations.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Recommended approaches
          </p>
          {recommendations.map((rec) => (
            <button
              key={rec.id}
              type="button"
              onClick={() => onChange([rec.id])}
              className="w-full rounded-xl border border-teal-100 bg-teal-50/40 px-3 py-2 text-left text-sm hover:border-teal-200"
            >
              <p className="font-medium text-teal-900">{rec.name}</p>
              <p className="mt-0.5 text-xs text-slate-600">{rec.reason}</p>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {LENS_OPTIONS.map((id) => {
          const model = PEDAGOGICAL_MODELS.find((m) => m.id === id);
          const active = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-teal-500 bg-teal-100 text-teal-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {model?.shortLabel ?? id}
            </button>
          );
        })}
      </div>

      {primarySelected && (
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3 text-sm">
          <p className="font-medium text-slate-800">{primarySelected.name}</p>
          <p className="mt-1 text-xs text-slate-600">{primarySelected.description}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Lesson phases
          </p>
          <ol className="mt-1 list-decimal pl-4 text-xs text-slate-700">
            {primarySelected.lessonPhases.map((phase) => (
              <li key={phase}>{phase}</li>
            ))}
          </ol>
          {primarySelected.sources[0] && (
            <a
              href={primarySelected.sources[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-teal-700 hover:underline"
            >
              View source — {sourceLinkLabel(primarySelected.sources[0])}
              {!isApprovedEducationDomain(primarySelected.sources[0].url) ? " (unverified)" : ""}
            </a>
          )}
        </div>
      )}
    </Card>
  );
}
