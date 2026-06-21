"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";

interface ApplySuggestionButtonProps {
  label?: string;
  onApply: () => boolean | void | Promise<boolean | void>;
  className?: string;
}

export function ApplySuggestionButton({
  label = "Apply",
  onApply,
  className,
}: ApplySuggestionButtonProps) {
  const [applied, setApplied] = useState(false);

  const handleClick = useCallback(async () => {
    const result = await onApply();
    if (result !== false) {
      setApplied(true);
      window.setTimeout(() => setApplied(false), 2200);
    }
  }, [onApply]);

  return (
    <Button
      type="button"
      variant="ghost"
      className={`h-6 px-2 text-[10px] ${applied ? "text-emerald-700" : "text-teal-700"} ${className ?? ""}`}
      onClick={handleClick}
      disabled={applied}
    >
      {applied ? "Applied ✓" : label}
    </Button>
  );
}
