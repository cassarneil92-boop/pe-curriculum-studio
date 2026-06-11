import type { EducationalSetting } from "@/src/lib/schools";
import type { PedagogicalModelId } from "@/src/lib/intelligence/frameworks/pedagogical-models";
import type {
  CollaborationScope,
  ResourceVisibility,
} from "@/src/lib/intelligence/collaboration/scopes";
import type { ResourceFileType } from "@/src/lib/intelligence/resources/warehouse-types";
import type { YearGroupId } from "./year-groups";

export type PathwayId =
  | "early-years-pe"
  | "primary-pe"
  | "general-pe"
  | "pe-option-sec"
  | "alp-pe"
  | "alp-sports-vocational"
  | "fitness-curriculum"
  | "sport-values";

export type YearGroup = YearGroupId;

export type PlanningLevel = "macro" | "meso" | "micro" | "daily";

export type ExportFormat = "pdf" | "word" | "print";

export interface TeacherProfile {
  educationalSetting: EducationalSetting | "";
  college: string;
  school: string;
  manualSchoolName: string;
  yearGroups: YearGroup[];
  pathways: PathwayId[];
}

export interface LearningOutcome {
  id: string;
  code: string;
  description: string;
  pathway: PathwayId;
  /** Imported curriculum labels (e.g. Year 9, Form 4). */
  yearGroups: string[];
  sport: string;
  skills: string[];
  strand: string;
}

export interface CalendarEntry {
  id: string;
  title: string;
  level: PlanningLevel;
  pathway: PathwayId;
  yearGroup: YearGroup;
  sport: string;
  skills: string[];
  startDate: string;
  endDate: string;
  notes: string;
  loIds: string[];
}

export type LessonEndingType =
  | "cool-down"
  | "reflection"
  | "quick-questioning"
  | "assessment"
  | "closing-link"
  | "custom";

/** PE-specific structured activity block. */
export interface LessonActivity {
  id: string;
  number: number;
  name: string;
  students: string;
  time: string;
  spaceEquipment: string;
  taskDescription: string;
  progressions: string[];
  differentiationEasier: string;
  differentiationHarder: string;
  teachingCues: string[];
}

/** Flexible lesson ending — teacher adds, removes, reorders freely. */
export interface LessonEndingComponent {
  id: string;
  type: LessonEndingType;
  title: string;
  content: string;
  order: number;
}

export interface LessonPlan {
  id: string;
  title: string;
  date: string;
  classGroup: string;
  yearGroup: YearGroup;
  duration: number;
  /** Curriculum KB pathway id (e.g. secondary-pe). */
  pathwayId: string;
  topicId: string;
  skillId: string;
  /** App pathway ids when opened from Curriculum Hub multi-select. */
  selectedPathways?: PathwayId[];
  /** Learning intentions (what students will learn). */
  learningIntention: string;
  /** WALT — We Are Learning To… */
  walt: string;
  /** Success criteria / WILF. */
  successCriteria: string;
  /** @deprecated Legacy free-text — synced from structured activities when present. */
  equipment: string;
  safetyConsiderations: string;
  /** @deprecated Legacy free-text differentiation summary. */
  differentiation: string;
  /** @deprecated Legacy free-text — synced from structured activities when present. */
  activities: string;
  /** @deprecated Use lessonEndings — kept for migrated lessons. */
  assessmentNotes: string;
  /** @deprecated Use lessonEndings — kept for migrated lessons. */
  reflectionNotes: string;
  selectedLearningOutcomeIds: string[];
  /** PE-specific structured activities (preferred). */
  structuredActivities?: LessonActivity[];
  /** Flexible lesson ending components. */
  lessonEndings?: LessonEndingComponent[];
  /** Pedagogical models tagged on this lesson (SE, TGfU, etc.). */
  pedagogicalModels?: PedagogicalModelId[];
  /** Collaboration scope — prepared for future multi-user sync. */
  scope?: CollaborationScope;
  createdAt: string;
  updatedAt: string;
}

/** @deprecated Legacy week-based row — migrated to SOWLesson */
export interface SOWWeek {
  weekNumber: number;
  topic: string;
  focus: string;
  loIds: string[];
}

export interface SOWLesson {
  id: string;
  lessonNumber: number;
  learningOutcomeIds: string[];
  walt: string;
  wilf: string;
  activities: string;
  resources: string[];
}

export interface SchemeOfWork {
  id: string;
  title: string;
  classGroup: string;
  /** Primary pathway — first item in selectedPathways when multi-select is used. */
  pathway: PathwayId;
  /** App pathways included in this scheme (Curriculum Hub multi-select). */
  selectedPathways?: PathwayId[];
  yearGroup: YearGroup;
  topicId: string;
  skillId: string;
  term: string;
  /** Planned number of lessons for the term unit. */
  plannedLessonCount: number;
  lessons: SOWLesson[];
  pedagogicalModels?: PedagogicalModelId[];
  scope?: CollaborationScope;
  createdAt: string;
  updatedAt: string;
  /** @deprecated Migrated to lessons */
  sport?: string;
  /** @deprecated Migrated to lessons */
  weeks?: SOWWeek[];
  /** @deprecated Migrated to per-lesson learningOutcomeIds */
  loIds?: string[];
}

export interface ResourceItem {
  id: string;
  name: string;
  type: string;
  pathway: PathwayId | "";
  sport: string;
  notes: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  /** Phase 4 resource warehouse extensions (all optional). */
  fileType?: ResourceFileType;
  yearGroup?: string;
  topicId?: string;
  skillId?: string;
  learningOutcomeIds?: string[];
  pedagogicalModels?: PedagogicalModelId[];
  keywords?: string[];
  visibility?: ResourceVisibility;
  scope?: CollaborationScope;
  storageUri?: string;
}

export interface AppData {
  teacher: TeacherProfile;
  lessons: LessonPlan[];
  schemes: SchemeOfWork[];
  calendar: CalendarEntry[];
  resources: ResourceItem[];
  setupComplete: boolean;
}

export interface LOFilterContext {
  pathway: PathwayId;
  yearGroup: YearGroup;
  sport: string;
  skills: string[];
}
