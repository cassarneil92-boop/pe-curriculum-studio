"use client";

import { confidenceTone, type AssistantConfidenceReport, type AssistantSchemeQualityReport } from "@/lib/assistant";
import { PedagogicalQualityPanel } from "@/components/education/PedagogyInsightCard";
import type { PedagogicalQualityReport, PedagogyRecommendation } from "@/lib/education/types";

export function AssistantSchemeInsights({
  quality,
  confidence,
  pedagogicalQuality,
  pedagogyRecommendations,
}: {
  quality: AssistantSchemeQualityReport;
  confidence: AssistantConfidenceReport;
  pedagogicalQuality?: PedagogicalQualityReport;
  pedagogyRecommendations?: PedagogyRecommendation[];
}) {
  return (
    <div className="space-y-3">
      <div className={`rounded-xl border px-3 py-2 text-sm ${confidenceTone(confidence.level)}`}>
        <p className="font-semibold">{confidence.label}</p>
        <p className="mt-0.5 text-xs opacity-90">{confidence.detail}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-800">Scheme quality</p>
          <p className="text-lg font-bold tabular-nums text-teal-800">{quality.percentage}%</p>
        </div>
        <ul className="mt-2 space-y-1">
          {quality.checks.map((check) => (
            <li key={check.id} className="flex items-center gap-2 text-xs text-slate-700">
              <span className={check.met ? "text-emerald-600" : "text-amber-600"}>
                {check.met ? "✓" : "○"}
              </span>
              {check.label}
            </li>
          ))}
        </ul>
        {quality.recommendations.length > 0 && (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Recommendations
            </p>
            <ul className="mt-1.5 space-y-1 text-xs text-slate-600">
              {quality.recommendations.slice(0, 3).map((item) => (
                <li key={item.id}>→ {item.message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {pedagogicalQuality && (
        <PedagogicalQualityPanel
          percentage={pedagogicalQuality.percentage}
          strengths={pedagogicalQuality.strengths}
          suggestions={pedagogicalQuality.suggestions}
        />
      )}

      {pedagogyRecommendations && pedagogyRecommendations.length > 0 && (
        <div className="rounded-xl border border-teal-100 bg-teal-50/30 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
            Recommended pedagogical approaches
          </p>
          <ul className="mt-2 space-y-2">
            {pedagogyRecommendations.map((rec) => (
              <li key={rec.id} className="text-xs text-slate-700">
                <span className="font-medium text-teal-900">{rec.name}</span>
                <span className="text-slate-600"> — {rec.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
