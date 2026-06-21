"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LessonPreview } from "@/components/lesson-plans/LessonPreview";
import { ExportMenu } from "@/components/shared/ExportMenu";
import { TopicIcon } from "@/components/design/TopicIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LessonsEmptyIllustration } from "@/components/ui/EmptyIllustrations";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/providers/ToastProvider";
import { LessonDeliveryControls } from "@/components/progress/DeliveryControls";
import { LessonLibraryStatusBadge } from "@/components/progress/LessonLibraryStatusBadge";
import { useApp } from "@/components/providers/AppProvider";
import { useDeliverySync } from "@/hooks/useDeliverySync";
import { getTopicTheme } from "@/lib/design/topic-theme";
import { buildExportDocumentContext } from "@/lib/export/export-context";
import { buildLessonExportHtml } from "@/lib/export";
import {
  buildLessonExportFilename,
  duplicateLessonData,
  formatLessonDate,
  formatTimestamp,
  getLessonSkillName,
  getLessonTopicName,
  getLessonPathwayLabel,
} from "@/lib/lesson-plans/helpers";
import { exportLessonDocument } from "@/lib/lesson-plans/export";
import { getYearGroupLabel } from "@/lib/year-groups";
import type { LessonDeliveryStatus, LessonPlan } from "@/lib/types";

type LibraryView = "grid" | "preview";

export default function LessonsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data, addLesson, deleteLesson } = useApp();
  const { setLessonDelivery } = useDeliverySync();
  const [view, setView] = useState<LibraryView>("grid");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sortedLessons = useMemo(
    () =>
      [...data.lessons].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [data.lessons]
  );

  const selectedLesson = sortedLessons.find((l) => l.id === selectedId) ?? null;

  const lessonExportContext = useMemo(() => {
    if (!selectedLesson) return undefined;
    return buildExportDocumentContext(data.teacher, {
      pathwayId: selectedLesson.pathwayId,
      yearGroup: selectedLesson.yearGroup,
      classGroup: selectedLesson.classGroup,
    });
  }, [data.teacher, selectedLesson]);

  const openPreview = (lesson: LessonPlan) => {
    setSelectedId(lesson.id);
    setView("preview");
  };

  const handleDuplicate = (lesson: LessonPlan) => {
    addLesson(duplicateLessonData(lesson));
    toast("Lesson duplicated");
  };

  const handleDelete = (id: string) => {
    deleteLesson(id);
    toast("Lesson removed");
    if (selectedId === id) {
      setSelectedId(null);
      setView("grid");
    }
  };

  if (view === "preview" && selectedLesson && lessonExportContext) {
    const exportHtml = buildLessonExportHtml(selectedLesson, lessonExportContext);
    const exportFilename = buildLessonExportFilename(selectedLesson);

    return (
      <div className="lesson-print-area">
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => setView("grid")}>
            ← Back to library
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push(`/lesson-builder?edit=${selectedLesson.id}`)}
            >
              Edit
            </Button>
            <ExportMenu html={exportHtml} filename={exportFilename} />
          </div>
        </div>

        <Card className="no-print mb-6 p-4">
          <p className="mb-2 text-sm font-semibold text-slate-800">Lesson progress</p>
          <LessonLibraryStatusBadge lesson={selectedLesson} />
          <LessonDeliveryControls
            lesson={selectedLesson}
            status={selectedLesson.deliveryStatus}
            onDeliveryChange={(status) => setLessonDelivery(selectedLesson, status)}
          />
        </Card>

        <LessonPreview lesson={selectedLesson} exportContext={lessonExportContext} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Lesson Plans"
        description="Your saved lesson library — built in Lesson Builder and ready to preview, edit, or export."
        action={
          <Link href="/lesson-builder">
            <Button>New lesson in Builder</Button>
          </Link>
        }
      />

      {sortedLessons.length === 0 ? (
        <EmptyState
          title="No lesson plans yet"
          description="Create your first curriculum-aligned lesson plan. Build it in Lesson Builder and it will appear here instantly."
          icon={<LessonsEmptyIllustration />}
          action={
            <Link href="/lesson-builder">
              <Button>Build lesson</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedLessons.map((lesson) => (
            <LessonLibraryCard
              key={lesson.id}
              lesson={lesson}
              onDeliveryChange={(status) => setLessonDelivery(lesson, status)}
              onView={() => openPreview(lesson)}
              onEdit={() => router.push(`/lesson-builder?edit=${lesson.id}`)}
              onDuplicate={() => handleDuplicate(lesson)}
              onDelete={() => handleDelete(lesson.id)}
              onExportPdf={() => openPreview(lesson)}
              onExportWord={() =>
                exportLessonDocument(
                  lesson,
                  "word",
                  buildExportDocumentContext(data.teacher, {
                    pathwayId: lesson.pathwayId,
                    yearGroup: lesson.yearGroup,
                    classGroup: lesson.classGroup,
                  })
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LessonLibraryCard({
  lesson,
  onDeliveryChange,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onExportPdf,
  onExportWord,
}: {
  lesson: LessonPlan;
  onDeliveryChange: (status: LessonDeliveryStatus) => void;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExportPdf: () => void;
  onExportWord: () => void;
}) {
  const topicName = getLessonTopicName(lesson);
  const theme = getTopicTheme(topicName);

  return (
    <Card className={`overflow-hidden ${theme.border}`}>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <TopicIcon name={topicName} size="sm" />
          <div className="min-w-0 flex-1">
            <button type="button" onClick={onView} className="text-left">
              <p className="font-semibold text-slate-900 hover:text-teal-800">{lesson.title}</p>
            </button>
            <p className="mt-1 text-sm text-slate-500">
              {lesson.classGroup || "No class"} · {getYearGroupLabel(lesson.yearGroup)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {formatLessonDate(lesson.date)} · {lesson.duration} min
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <LessonLibraryStatusBadge lesson={lesson} />
          {lesson.deliveryStatus === "delivered" && lesson.deliveredDate && (
            <Badge tone="green">Delivered {lesson.deliveredDate}</Badge>
          )}
          <Badge tone="teal">{getLessonPathwayLabel(lesson)}</Badge>
          <Badge tone="slate">{topicName}</Badge>
          <Badge tone="blue">{getLessonSkillName(lesson)}</Badge>
          <Badge tone="amber">{lesson.selectedLearningOutcomeIds.length} LOs</Badge>
        </div>

        <LessonDeliveryControls
          lesson={lesson}
          compact
          onDeliveryChange={onDeliveryChange}
        />

        <p className="mt-3 text-xs text-slate-400">
          Updated {formatTimestamp(lesson.updatedAt)}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" className="text-xs" onClick={onView}>
            View
          </Button>
          <Button variant="ghost" className="text-xs" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="ghost" className="text-xs" onClick={onDuplicate}>
            Duplicate
          </Button>
          <Button variant="ghost" className="text-xs" onClick={onExportPdf}>
            PDF
          </Button>
          <Button variant="ghost" className="text-xs" onClick={onExportWord}>
            Word
          </Button>
          <Button variant="ghost" className="text-xs text-rose-600" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
