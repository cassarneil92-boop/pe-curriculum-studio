"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import {
  buildAssistantSchemeDraft,
  duplicateAssistantSchemeDraft,
  schemeDraftReviewMessage,
  type AssistantResponse,
} from "@/lib/assistant";

interface AssistantSchemeDraftActionsProps {
  response: AssistantResponse;
}

export function AssistantSchemeDraftActions({ response }: AssistantSchemeDraftActionsProps) {
  const router = useRouter();
  const { addScheme } = useApp();
  const { toast } = useToast();

  const draftResult = useMemo(() => {
    if (!response.schemeDraftSource || !response.planningSequence?.length) {
      return null;
    }
    return buildAssistantSchemeDraft(response.schemeDraftSource, response);
  }, [response]);

  if (!draftResult) {
    return null;
  }

  const handleSaveDraft = () => {
    addScheme(draftResult.draft);
    toast("Scheme draft saved");
    if (draftResult.needsReview) {
      toast(schemeDraftReviewMessage(true) ?? "", "info");
    }
  };

  const handleSaveAndOpen = () => {
    const saved = addScheme(draftResult.draft);
    if (draftResult.needsReview) {
      toast(schemeDraftReviewMessage(true) ?? "", "info");
    }
    router.push(`/schemes?edit=${saved.id}`);
  };

  const handleDuplicate = () => {
    const copy = duplicateAssistantSchemeDraft(draftResult.draft);
    addScheme(copy);
    toast("New scheme copy saved from assistant preview");
  };

  return (
    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Save this preview
      </p>
      {draftResult.needsReview && (
        <p className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
          {schemeDraftReviewMessage(true)}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" className="text-xs" onClick={handleSaveDraft}>
          Save as scheme draft
        </Button>
        <Button type="button" variant="primary" className="text-xs" onClick={handleSaveAndOpen}>
          Save and open in Scheme Builder
        </Button>
        <Button type="button" variant="ghost" className="text-xs" onClick={handleDuplicate}>
          Duplicate as new scheme
        </Button>
      </div>
    </div>
  );
}
