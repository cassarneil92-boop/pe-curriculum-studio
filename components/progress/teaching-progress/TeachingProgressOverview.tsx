"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import type { TeachingProgressOverview as OverviewData } from "@/lib/progress/teaching-progress-teacher-view";

interface TeachingProgressOverviewProps {
  overview: OverviewData;
}

export function TeachingProgressOverview({ overview }: TeachingProgressOverviewProps) {
  const { lessonsPlanned, lessonsDelivered, activeSchemes, deliveryPercent } = overview;

  return (
    <Card className="border-teal-100/80 bg-gradient-to-br from-teal-50/30 to-white">
      <CardHeader
        title="Teaching progress overview"
        description="Lessons, schemes, and delivery at a glance."
      />
      <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lessons planned" value={lessonsPlanned} tone="blue" />
        <StatCard label="Lessons delivered" value={lessonsDelivered} tone="green" />
        <StatCard label="Active schemes" value={activeSchemes} tone="teal" />
        <StatCard
          label="Delivery progress"
          value={`${deliveryPercent}%`}
          hint="Delivered vs planned lessons"
          tone="amber"
        />
      </section>
      {lessonsPlanned > 0 && (
        <ProgressBar
          label={`${lessonsDelivered} of ${lessonsPlanned} lessons delivered`}
          value={lessonsDelivered}
          max={lessonsPlanned}
          fractionLabel={`${deliveryPercent}% complete`}
          showPercent={false}
          variant={deliveryPercent >= 80 ? "green" : "teal"}
        />
      )}
    </Card>
  );
}
