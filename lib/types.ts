import type { EducationalSetting } from "@/src/lib/schools";
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
  learningIntention: string;
  successCriteria: string;
  equipment: string;
  safetyConsiderations: string;
  differentiation: string;
  activities: string;
  assessmentNotes: string;
  reflectionNotes: string;
  selectedLearningOutcomeIds: string[];
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
