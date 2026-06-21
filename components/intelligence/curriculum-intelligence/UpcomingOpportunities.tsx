"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import type { PlanningInsightAction } from "@/lib/progress/planning-insights-view";

interface UpcomingOpportunitiesProps {
  opportunities: PlanningInsightAction[];
}

export function UpcomingOpportunities({ opportunities }: UpcomingOpportunitiesProps) {
  if (opportunities.length === 0) return null;

  return (
    <Card>
      <CardHeader
        title="Upcoming opportunities"
        description="Based on your planned lessons and schemes."
      />
      <ul className="space-y-4">
        {opportunities.map((opp) => (
          <li
            key={opp.id}
            className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-slate-900">{opp.message}</p>
              {opp.detail && <p className="mt-0.5 text-sm text-slate-600">{opp.detail}</p>}
            </div>
            <Link href={opp.actionHref} className="shrink-0">
              <Button variant="secondary">{opp.actionLabel}</Button>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
