"use client";

import { useEffect, useState } from "react";
import { SOWCardBank } from "@/components/scheme-builder/SOWCardBank";
import { SOWLessonRow } from "@/components/scheme-builder/SOWLessonRow";
import { TopicIcon } from "@/components/design/TopicIcon";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getTopicTheme } from "@/lib/design/topic-theme";
import {
  addActivityToLesson,
  addOutcomeToLesson,
  addResourceToLesson,
  addWaltToLesson,
  addWilfToLesson,
  removeActivityFromLesson,
  removeOutcomeFromLesson,
  removeResourceFromLesson,
  removeWaltFromLesson,
  removeWilfFromLesson,
  replaceActivityInLesson,
  replaceResourceInLesson,
  replaceWaltInLesson,
  replaceWilfInLesson,
  type SOWCardZone,
} from "@/lib/scheme-builder/lesson-actions";
import type { PlanningOutcomeSuggestions } from "@/lib/scheme-builder/curriculum-options";
import type { PathwayId, SOWLesson } from "@/lib/types";

interface SOWPlanningBoardProps {
  topicName: string;
  skillName: string;
  outcomeSuggestions: PlanningOutcomeSuggestions;
  selectedPathways?: PathwayId[];
  lessons: SOWLesson[];
  alignmentReady: boolean;
  onLessonsChange: (lessons: SOWLesson[]) => void;
}

export function SOWPlanningBoard({
  topicName,
  skillName,
  outcomeSuggestions,
  selectedPathways = [],
  lessons,
  alignmentReady,
  onLessonsChange,
}: SOWPlanningBoardProps) {
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number | null>(0);
  const theme = getTopicTheme(topicName);
  const outcomeCount =
    outcomeSuggestions.strict.length + outcomeSuggestions.additional.length;

  useEffect(() => {
    if (selectedLessonIndex !== null && selectedLessonIndex >= lessons.length) {
      setSelectedLessonIndex(Math.max(0, lessons.length - 1));
    }
  }, [lessons.length, selectedLessonIndex]);

  const updateLesson = (index: number, lesson: SOWLesson) => {
    onLessonsChange(lessons.map((existing, i) => (i === index ? lesson : existing)));
  };

  const handleAddCard = (zone: SOWCardZone, payload: string) => {
    if (selectedLessonIndex === null) return;
    const lesson = lessons[selectedLessonIndex];
    if (!lesson) return;

    let next = lesson;
    switch (zone) {
      case "outcomes":
        next = addOutcomeToLesson(lesson, payload);
        break;
      case "walt":
        next = addWaltToLesson(lesson, payload);
        break;
      case "wilf":
        next = addWilfToLesson(lesson, payload);
        break;
      case "activities":
        next = addActivityToLesson(lesson, payload);
        break;
      case "resources":
        next = addResourceToLesson(lesson, payload);
        break;
    }

    updateLesson(selectedLessonIndex, next);
  };

  if (!alignmentReady) {
    return (
      <Card className="text-center">
        <p className="text-sm font-medium text-slate-800">Choose a topic and skill to open the planning board</p>
        <p className="mt-1 text-sm text-slate-500">
          Learning outcome cards appear once your scheme focus is set.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className={`flex items-center gap-4 rounded-2xl border px-5 py-4 ${theme.border} ${theme.bg}`}
      >
        <TopicIcon name={topicName} size="md" />
        <div>
          <p className="text-lg font-semibold text-slate-900">{topicName}</p>
          <p className="text-sm text-slate-600">
            Skill focus: <span className="font-medium">{skillName}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="teal">{outcomeCount} suggested outcomes</Badge>
            <Badge tone="slate">{lessons.length} lessons</Badge>
          </div>
        </div>
      </div>

      <Card>
        <SOWCardBank
          topicName={topicName}
          skillName={skillName}
          outcomeSuggestions={outcomeSuggestions}
          selectedPathways={selectedPathways}
          lessons={lessons}
          selectedLessonIndex={selectedLessonIndex}
          onAddCard={handleAddCard}
        />
      </Card>

      <div>
        <h3 className="mb-3 text-base font-semibold text-slate-900">Lesson rows</h3>
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <SOWLessonRow
              key={lesson.id}
              lesson={lesson}
              selected={selectedLessonIndex === index}
              onSelect={() => setSelectedLessonIndex(index)}
              onRemoveOutcome={(id) =>
                updateLesson(index, removeOutcomeFromLesson(lesson, id))
              }
              onRemoveWalt={(text) => updateLesson(index, removeWaltFromLesson(lesson, text))}
              onEditWalt={(oldText, newText) =>
                updateLesson(index, replaceWaltInLesson(lesson, oldText, newText))
              }
              onRemoveWilf={(text) => updateLesson(index, removeWilfFromLesson(lesson, text))}
              onEditWilf={(oldText, newText) =>
                updateLesson(index, replaceWilfInLesson(lesson, oldText, newText))
              }
              onRemoveActivity={(label) =>
                updateLesson(index, removeActivityFromLesson(lesson, label))
              }
              onEditActivity={(oldLabel, newLabel) =>
                updateLesson(index, replaceActivityInLesson(lesson, oldLabel, newLabel))
              }
              onRemoveResource={(resource) =>
                updateLesson(index, removeResourceFromLesson(lesson, resource))
              }
              onEditResource={(oldResource, newResource) =>
                updateLesson(index, replaceResourceInLesson(lesson, oldResource, newResource))
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
