import type { PathwayId } from "@/lib/types";
import type { PedagogicalModelId } from "../frameworks/pedagogical-models";
import type { ResourceVisibility, CollaborationScope } from "../collaboration/scopes";

export type ResourceFileType =
  | "pdf"
  | "image"
  | "powerpoint"
  | "worksheet"
  | "assessment"
  | "video"
  | "lesson-plan"
  | "scheme"
  | "document";

export interface ResourceWarehouseMetadata {
  yearGroup?: string;
  topicId?: string;
  skillId?: string;
  pathwayId?: PathwayId | "";
  learningOutcomeIds?: string[];
  pedagogicalModels?: PedagogicalModelId[];
  keywords?: string[];
  scope?: CollaborationScope;
  visibility?: ResourceVisibility;
  /** Future: cloud storage URI */
  storageUri?: string;
}

export const RESOURCE_TYPE_OPTIONS: { id: ResourceFileType; label: string }[] = [
  { id: "pdf", label: "PDF" },
  { id: "image", label: "Image" },
  { id: "powerpoint", label: "PowerPoint" },
  { id: "worksheet", label: "Worksheet" },
  { id: "assessment", label: "Assessment document" },
  { id: "video", label: "Video" },
  { id: "lesson-plan", label: "Lesson plan" },
  { id: "scheme", label: "Scheme of work" },
  { id: "document", label: "Document" },
];
