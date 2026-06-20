"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { buildAssistantLessonDraft } from "@/lib/assistant/lesson-draft-builder";
import type { AssistantResponse } from "@/lib/assistant";
import { saveLessonDraft } from "@/lib/lesson-builder/draft";

interface AssistantLessonDraftActionsProps {
  response: AssistantResponse;
}

export function AssistantLessonDraftActions({ response }: AssistantLessonDraftActionsProps) {
  const router = useRouter();
  const { addLesson } = useApp();
  const { toast } = useToast();

  const draftPayload = useMemo(() => {
    if (!response.lessonDraftSource || !response.lessonPreview) return null;
    return buildAssistantLessonDraft(response.lessonDraftSource, response.lessonPreview);
  }, [response]);

  if (!draftPayload || !response.lessonPreview) {
    return null;
  }

  const handleSaveDraft = () => {
    addLesson(draftPayload);
    toast("Lesson draft saved");
    if (response.lessonPreview?.needsReview) {
      toast("Review curriculum alignment before teaching.", "info");
    }
  };

  const handleSaveAndOpen = () => {
    saveLessonDraft({ form: draftPayload, editingId: null, activeSection: "info" });
    if (response.lessonPreview?.needsReview) {
      toast("Review curriculum alignment before teaching.", "info");
    }
    router.push("/lesson-builder");
  };

  return (
    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
      {response.lessonPreview.needsReview && response.lessonPreview.topicMappingNote && (
        <p className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
          {response.lessonPreview.topicMappingNote} Review before saving.
        </p>
      )}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Save this preview
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" className="text-xs" onClick={handleSaveDraft}>
            Save as lesson draft
          </Button>
          <Button type="button" variant="primary" className="text-xs" onClick={handleSaveAndOpen}>
            Open in Lesson Builder
          </Button>
        </div>
      </div>
    </div>
  );
}
