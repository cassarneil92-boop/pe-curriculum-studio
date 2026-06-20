"use client";

import { isApprovedEducationDomain, sourceLinkLabel } from "@/lib/education/approved-domains";
import type { KnowledgeSource } from "@/lib/education/types";

export function PedagogySourcesList({ sources }: { sources: KnowledgeSource[] }) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sources</p>
      <ul className="mt-2 space-y-2">
        {sources.slice(0, 4).map((source) => (
          <li key={source.id} className="text-xs text-slate-600">
            <span className="font-medium text-slate-800">{source.evidenceLevel}</span>
            {" · "}
            {sourceLinkLabel(source)}
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-teal-700 hover:underline"
            >
              View source
            </a>
            {!isApprovedEducationDomain(source.url) && (
              <span className="ml-1 text-amber-700">(domain not on approved list)</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PedagogicalQualityPanel({
  percentage,
  strengths,
  suggestions,
  title = "Pedagogical quality",
}: {
  percentage: number;
  strengths: string[];
  suggestions: string[];
  title?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-lg font-bold tabular-nums text-teal-800">{percentage}%</p>
      </div>
      {strengths.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-slate-700">
          {strengths.map((item) => (
            <li key={item}>✓ {item}</li>
          ))}
        </ul>
      )}
      {suggestions.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-amber-800">
          {suggestions.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
