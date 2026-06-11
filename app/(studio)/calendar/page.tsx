"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarPlanner } from "@/components/calendar/CalendarPlanner";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const hubPrefillApplied = useRef(false);
  const [showCustomEntry, setShowCustomEntry] = useState(false);
  const [showScheduleScheme, setShowScheduleScheme] = useState(false);

  useEffect(() => {
    if (hubPrefillApplied.current || !searchParams || searchParams.get("create") !== "1") {
      return;
    }
    hubPrefillApplied.current = true;
    setShowCustomEntry(true);
  }, [searchParams]);

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Plan your term, schedule lessons, and track what has been taught."
      />

      <CalendarPlanner
        showCustomEntry={showCustomEntry}
        onCloseCustomEntry={() => setShowCustomEntry(false)}
        showScheduleScheme={showScheduleScheme}
        onCloseScheduleScheme={() => setShowScheduleScheme(false)}
        onOpenScheduleScheme={() => setShowScheduleScheme(true)}
        onOpenCustomEntry={() => setShowCustomEntry(true)}
      />
    </div>
  );
}
