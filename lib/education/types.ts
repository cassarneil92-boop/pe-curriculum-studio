/** Evidence tier for curated educational knowledge — local library only, no live scraping. */
export type KnowledgeTier = "tier-1" | "tier-2" | "tier-3";

export type EvidenceLevel =
  | "Peer-reviewed research"
  | "Professional book"
  | "Verified organisation";

export interface KnowledgeSource {
  id: string;
  title: string;
  author?: string;
  year?: number;
  url: string;
  domain: string;
  tier: KnowledgeTier;
  evidenceLevel: EvidenceLevel;
}

export type EducationPedagogyId =
  | "tgfu"
  | "sport-education"
  | "cooperative-learning"
  | "direct-instruction"
  | "whole-part-whole"
  | "guided-discovery"
  | "constraints-led"
  | "inquiry-based"
  | "whole-analytic-whole"
  | "non-linear-pedagogy"
  | "physical-literacy"
  | "tpsr"
  | "adventure-education"
  | "adventure-based-learning"
  | "activist-approach"
  | "health-optimising-pe";

export interface PedagogyKnowledgeEntry {
  id: EducationPedagogyId;
  name: string;
  category: string;
  description: string;
  suitableFor: string[];
  bestFor: string[];
  ageGroups: string[];
  strengths: string[];
  limitations: string[];
  lessonExamples: string[];
  /** Ordered phases for lesson / activity structure generation. */
  lessonPhases: string[];
  practicalImplications: string[];
  sources: KnowledgeSource[];
}

export interface PedagogyRecommendation {
  id: EducationPedagogyId;
  name: string;
  reason: string;
  confidence: "high" | "medium";
}

export interface PedagogyQueryResult {
  answer: string;
  pedagogyIds: EducationPedagogyId[];
  sources: KnowledgeSource[];
  suggestions: string[];
}

export interface PedagogicalQualityReport {
  score: number;
  percentage: number;
  strengths: string[];
  suggestions: string[];
  checks: Array<{ id: string; label: string; met: boolean }>;
}
