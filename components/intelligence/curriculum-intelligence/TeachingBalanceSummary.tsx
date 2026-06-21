"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import type { PlanningInsightsView } from "@/lib/progress/planning-insights-view";

interface TeachingBalanceSummaryProps {
  balance: PlanningInsightsView["balance"];
}

function BalanceGroup({
  title,
  items,
  className,
}: {
  title: string;
  items: string[];
  className: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className={`rounded-xl border px-4 py-3 ${className}`}>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-2 space-y-1">
        {items.map((item) => (
          <li key={item} className="text-sm text-slate-800">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TeachingBalanceSummary({ balance }: TeachingBalanceSummaryProps) {
  const hasAny =
    balance.wellRepresented.length > 0 ||
    balance.needsAttention.length > 0 ||
    balance.notYetPlanned.length > 0;

  if (!hasAny) return null;

  return (
    <Card>
      <CardHeader
        title="Teaching balance"
        description="A simple summary of how your planning is spread across curriculum areas."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <BalanceGroup
          title="Well represented"
          items={balance.wellRepresented}
          className="border-emerald-100 bg-emerald-50/30 text-emerald-900"
        />
        <BalanceGroup
          title="Needs attention"
          items={balance.needsAttention}
          className="border-amber-100 bg-amber-50/30 text-amber-900"
        />
        <BalanceGroup
          title="Not yet planned"
          items={balance.notYetPlanned}
          className="border-rose-100 bg-rose-50/30 text-rose-900"
        />
      </div>
    </Card>
  );
}
