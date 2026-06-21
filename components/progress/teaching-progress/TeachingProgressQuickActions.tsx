"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import type { TeachingProgressQuickAction } from "@/lib/progress/teaching-progress-teacher-view";

interface TeachingProgressQuickActionsProps {
  actions: TeachingProgressQuickAction[];
}

export function TeachingProgressQuickActions({ actions }: TeachingProgressQuickActionsProps) {
  return (
    <Card>
      <CardHeader title="Quick actions" />
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
