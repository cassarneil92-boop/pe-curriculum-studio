"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { CalendarPlanner } from "@/components/calendar/CalendarPlanner";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const hubPrefillApplied = useRef(false);
  const [showCustomEntry, setShowCustomEntry] = useState(false);
  const [showScheduleScheme, setShowScheduleScheme] = useState(false);
  const [scheduleSchemePrefill, setScheduleSchemePrefill] = useState<string | undefined>();

  useEffect(() => {
    if (hubPrefillApplied.current || !searchParams || searchParams.get("create") !== "1") {
      return;
    }
    hubPrefillApplied.current = true;
    setShowCustomEntry(true);
  }, [searchParams]);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <BrandIcon size={24} />
      </div>
      <PageHeader
        title="Calendar"
        description="Your weekly planning workspace — schedule lessons, mark delivered, and organise term frameworks."
      />

      <CalendarPlanner
        showCustomEntry={showCustomEntry}
        onCloseCustomEntry={() => setShowCustomEntry(false)}
        showScheduleScheme={showScheduleScheme}
        onCloseScheduleScheme={() => {
          setShowScheduleScheme(false);
          setScheduleSchemePrefill(undefined);
        }}
        onOpenScheduleScheme={(prefill) => {
          setScheduleSchemePrefill(prefill?.schemeId);
          setShowScheduleScheme(true);
        }}
        scheduleSchemePrefill={scheduleSchemePrefill}
        onOpenCustomEntry={() => setShowCustomEntry(true)}
      />
    </div>
  );
}
