"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { ActiveSchemeProgress } from "@/lib/progress/teaching-progress-teacher-view";

interface CurrentSchemesPanelProps {
  schemes: ActiveSchemeProgress[];
}

export function CurrentSchemesPanel({ schemes }: CurrentSchemesPanelProps) {
  if (schemes.length === 0) {
    return (
      <Card>
        <CardHeader
          title="Current schemes"
          description="No active schemes in progress."
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Current schemes"
        description="Schemes you are currently teaching."
      />
      <ul className="space-y-4">
        {schemes.map((scheme) => (
          <li
            key={scheme.schemeId}
            className="rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-900">{scheme.title}</p>
              <Link href={scheme.continueHref}>
                <Button variant="secondary" className="text-xs">
                  Continue scheme
                </Button>
              </Link>
            </div>
            <ProgressBar
              label={`${scheme.completedLessons}/${scheme.totalLessons} lessons complete`}
              value={scheme.completedLessons}
              max={scheme.totalLessons || 1}
              fractionLabel={
                scheme.remainingLessons > 0
                  ? `${scheme.remainingLessons} remaining`
                  : undefined
              }
              showPercent={false}
              variant={scheme.deliveryPercent >= 80 ? "green" : "teal"}
            />
          </li>
        ))}
      </ul>
    </Card>
  );
}
