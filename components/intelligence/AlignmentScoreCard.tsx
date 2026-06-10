import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import type { AdvisoryAlignmentReport } from "@/src/lib/intelligence/advisory/scheme-alignment";

export function AlignmentScoreCard({ report }: { report: AdvisoryAlignmentReport }) {
  const tone =
    report.score >= 80 ? "teal" : report.score >= 50 ? "amber" : "slate";

  return (
    <Card>
      <CardHeader
        title="Curriculum Alignment (Advisory)"
        description="Advisory score — does not modify your scheme. Strict KB alignment unchanged."
      />
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold ${
            tone === "teal"
              ? "bg-teal-50 text-teal-800"
              : tone === "amber"
                ? "bg-amber-50 text-amber-900"
                : "bg-slate-100 text-slate-700"
          }`}
        >
          {report.score}%
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge tone="teal">{report.coveredOutcomes.length} covered</Badge>
            <Badge tone="amber">{report.uncoveredOutcomes.length} uncovered</Badge>
            <Badge tone="slate">{report.suggestedOutcomes.length} suggested</Badge>
          </div>
          {report.recommendations.length > 0 && (
            <ul className="space-y-1 text-sm text-slate-600">
              {report.recommendations.map((rec) => (
                <li key={rec}>• {rec}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
