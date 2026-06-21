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
    toast("Scheme saved to your library");
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
    toast("Duplicate scheme saved to your library");
  };

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      {draftResult.needsReview && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
          {schemeDraftReviewMessage(true)}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={handleSaveDraft}>
          Save as editable scheme draft
        </Button>
        <Button type="button" variant="primary" onClick={handleSaveAndOpen}>
          Save and open in Scheme Builder
        </Button>
        <Button type="button" variant="ghost" onClick={handleDuplicate}>
          Duplicate as new scheme
        </Button>
      </div>
    </div>
  );
}
