"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import type { ActiveSchemeProgress } from "@/lib/progress/teaching-progress-teacher-view";

interface CurrentSchemesPanelProps {
  schemes: ActiveSchemeProgress[];
}

export function CurrentSchemesPanel({ schemes }: CurrentSchemesPanelProps) {
  if (schemes.length === 0) {
    return (
      <Card>
        <CardHeader title="Active schemes" description="No active schemes in progress." />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Active schemes" description="Schemes you are currently teaching." />
      <div className="grid gap-3 sm:grid-cols-2">
        {schemes.map((scheme) => (
          <div
            key={scheme.schemeId}
            className="rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-4"
          >
            <p className="font-semibold text-slate-900">{scheme.title}</p>
            <p className="mt-1 text-sm text-slate-600">
              {scheme.totalLessons} lessons · {scheme.completedLessons} delivered
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-teal-700">
              {scheme.deliveryPercent}%
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-teal-600 transition-all"
                style={{ width: `${scheme.deliveryPercent}%` }}
              />
            </div>
            <Link href={scheme.continueHref} className="mt-3 inline-block">
              <Button variant="secondary" className="text-xs">
                Open
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
}
