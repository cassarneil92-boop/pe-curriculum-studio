"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import {
  buildAssistantLessonDraft,
  duplicateAssistantLessonDraft,
  type AssistantResponse,
} from "@/lib/assistant";
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
    toast("Lesson saved to your library");
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

  const handleDuplicate = () => {
    const copy = duplicateAssistantLessonDraft(draftPayload);
    addLesson(copy);
    toast("Duplicate lesson saved to your library");
  };

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      {response.lessonPreview.needsReview && response.lessonPreview.topicMappingNote && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
          {response.lessonPreview.topicMappingNote} Review before saving.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={handleSaveDraft}>
          Save as editable lesson draft
        </Button>
        <Button type="button" variant="primary" onClick={handleSaveAndOpen}>
          Save and open in Lesson Builder
        </Button>
        <Button type="button" variant="ghost" onClick={handleDuplicate}>
          Duplicate as new lesson
        </Button>
      </div>
    </div>
  );
}
