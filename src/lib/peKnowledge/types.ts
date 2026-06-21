import type { PathwayId } from "@/lib/types";
import type { YearGroupId } from "@/lib/year-groups";

/** Domain category for knowledge base organisation and filtering. */
export type PEKnowledgeCategory =
  | "learning-science"
  | "pedagogy-model"
  | "physical-literacy"
  | "motivation"
  | "inclusion"
  | "assessment"
  | "curriculum-design"
  | "child-development"
  | "malta-context";

/** Broad age bands used for relevance filtering across the app. */
export type AgePhase =
  | "early-years"
  | "primary"
  | "middle-school"
  | "secondary"
  | "all";

export interface PEKnowledgeEntry {
  id: string;
  title: string;
  category: PEKnowledgeCategory;
  summary: string;
  keyPrinciples: string[];
  whyItMattersInPE: string;
  whenToUse: string[];
  commonMistakes: string[];
  practicalApplications: string[];
  lessonPlanningPrompts: string[];
  assessmentPrompts: string[];
  differentiationPrompts: string[];
  agePhaseRelevance: AgePhase[];
  pathwayRelevance: (PathwayId | "all")[];
  relatedModels: string[];
  tags: string[];
}

/** Context passed from Lesson Builder, Scheme Builder, or Planning Assistant. */
export interface LessonKnowledgeContext {
  yearGroup?: YearGroupId | string;
  pathway?: PathwayId | string;
  activityArea?: string;
  lessonAim?: string;
  studentNeeds?: string[];
  availableFacilities?: string[];
}

export interface SuggestedKnowledgeEntry {
  entry: PEKnowledgeEntry;
  relevanceScore: number;
  reasons: string[];
}
