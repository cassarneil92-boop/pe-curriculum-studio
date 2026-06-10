import { Card, CardHeader } from "@/components/ui/Card";

interface CoachingPanelProps {
  title: string;
  strengths: string[];
  suggestions: string[];
  extra?: string[];
}

export function CoachingPanel({ title, strengths, suggestions, extra }: CoachingPanelProps) {
  return (
    <Card>
      <CardHeader
        title={title}
        description="Advisory coaching only — you decide what to change."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
            Strengths
          </p>
          {strengths.length === 0 ? (
            <p className="text-sm text-slate-500">No strengths identified yet.</p>
          ) : (
            <ul className="space-y-1 text-sm text-slate-700">
              {strengths.map((s) => (
                <li key={s}>✓ {s}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
            Suggestions
          </p>
          {suggestions.length === 0 ? (
            <p className="text-sm text-slate-500">Looking good — no suggestions right now.</p>
          ) : (
            <ul className="space-y-1 text-sm text-slate-700">
              {suggestions.map((s) => (
                <li key={s}>→ {s}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {extra && extra.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <ul className="space-y-1 text-xs text-slate-500">
            {extra.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
