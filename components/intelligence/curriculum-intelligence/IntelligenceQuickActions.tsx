"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import type { IntelligenceQuickAction } from "@/lib/progress/intelligence-teacher-view";

interface IntelligenceQuickActionsProps {
  actions: IntelligenceQuickAction[];
}

export function IntelligenceQuickActions({ actions }: IntelligenceQuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <Card>
      <CardHeader title="Quick planning actions" />
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Link key={action.id} href={action.href}>
            <Button variant="secondary">{action.label}</Button>
          </Link>
        ))}
      </div>
    </Card>
  );
}
