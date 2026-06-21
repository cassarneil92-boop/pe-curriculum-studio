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

  const openInBuilder = () => {
    const saved = addScheme(draftResult.draft);
    if (draftResult.needsReview) {
      toast(schemeDraftReviewMessage(true) ?? "", "info");
    }
    router.push(`/schemes?edit=${saved.id}`);
  };

  const handleSaveDraft = () => {
    addScheme(draftResult.draft);
    toast("Scheme draft saved to your library");
    if (draftResult.needsReview) {
      toast(schemeDraftReviewMessage(true) ?? "", "info");
    }
  };

  const handleDuplicate = () => {
    const copy = duplicateAssistantSchemeDraft(draftResult.draft);
    addScheme(copy);
    toast("Duplicate draft saved");
  };

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      {draftResult.needsReview && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
          {schemeDraftReviewMessage(true)}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="primary" onClick={openInBuilder}>
          Open in Scheme Builder
        </Button>
        <Button type="button" variant="secondary" onClick={handleSaveDraft}>
          Save Draft
        </Button>
        <Button type="button" variant="secondary" onClick={handleDuplicate}>
          Duplicate Draft
        </Button>
      </div>
    </div>
  );
}
