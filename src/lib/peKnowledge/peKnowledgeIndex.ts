import { isYearGroupId, type YearGroupId } from "@/lib/year-groups";
import type { PathwayId } from "@/lib/types";
import { ASSESSMENT_ENTRIES } from "./assessment";
import { CHILD_DEVELOPMENT_ENTRIES } from "./childDevelopment";
import { CURRICULUM_DESIGN_ENTRIES } from "./curriculumDesign";
import { INCLUSION_ENTRIES } from "./inclusion";
import { LEARNING_SCIENCE_ENTRIES } from "./learningScience";
import { MALTA_CONTEXT_ENTRIES } from "./maltaContext";
import { MOTIVATION_ENTRIES } from "./motivation";
import { PEDAGOGY_MODEL_ENTRIES } from "./pedagogyModels";
import { PHYSICAL_LITERACY_ENTRIES } from "./physicalLiteracy";
import { PHYSICAL_LITERACY_MASTER_PE_ENTRY } from "./physicalLiteracyMaster";
import { TEACHING_FOR_LEARNING_MASTER_PE_ENTRY } from "./teachingForLearningMaster";
import { COOPERATIVE_LEARNING_MASTER_PE_ENTRY, isCooperativeLearningRelevant } from "./cooperativeLearningMaster";
import { TPSR_MASTER_PE_ENTRY, isTPSRRelevant } from "./tpsrMaster";
import { PRIMARY_PE_MASTER_PE_ENTRY, isPrimaryPEYearGroup, isPrimaryPERelevant } from "./primaryPEMaster";
import { LEARNING_SCIENCE_MASTER_PE_ENTRY, isLearningScienceRelevant } from "./learningScienceMaster";
import { EDUCATIONAL_PSYCHOLOGY_MASTER_PE_ENTRY, isEducationalPsychologyRelevant } from "./educationalPsychologyMaster";
import { VISIBLE_LEARNING_MASTER_PE_ENTRY, isVisibleLearningRelevant } from "./visibleLearningMaster";
import { isTGfURelevantTopic, TGfU_MASTER_PE_ENTRY } from "./tgfuMaster";
import type {
  AgePhase,
  LessonKnowledgeContext,
  PEKnowledgeCategory,
  PEKnowledgeEntry,
  SuggestedKnowledgeEntry,
} from "./types";

export const ALL_PE_KNOWLEDGE_ENTRIES: PEKnowledgeEntry[] = [
  ...LEARNING_SCIENCE_ENTRIES,
  ...PEDAGOGY_MODEL_ENTRIES,
  TGfU_MASTER_PE_ENTRY,
  TEACHING_FOR_LEARNING_MASTER_PE_ENTRY,
  COOPERATIVE_LEARNING_MASTER_PE_ENTRY,
  TPSR_MASTER_PE_ENTRY,
  PRIMARY_PE_MASTER_PE_ENTRY,
  LEARNING_SCIENCE_MASTER_PE_ENTRY,
  EDUCATIONAL_PSYCHOLOGY_MASTER_PE_ENTRY,
  VISIBLE_LEARNING_MASTER_PE_ENTRY,
  ...PHYSICAL_LITERACY_ENTRIES,
  PHYSICAL_LITERACY_MASTER_PE_ENTRY,
  ...MOTIVATION_ENTRIES,
  ...INCLUSION_ENTRIES,
  ...ASSESSMENT_ENTRIES,
  ...CURRICULUM_DESIGN_ENTRIES,
  ...CHILD_DEVELOPMENT_ENTRIES,
  ...MALTA_CONTEXT_ENTRIES,
];

const ENTRY_BY_ID = new Map(ALL_PE_KNOWLEDGE_ENTRIES.map((entry) => [entry.id, entry]));

export function getPEKnowledgeEntryById(id: string): PEKnowledgeEntry | undefined {
  return ENTRY_BY_ID.get(id);
}

export function getAllPEKnowledgeEntries(): PEKnowledgeEntry[] {
  return ALL_PE_KNOWLEDGE_ENTRIES;
}

export function getPEKnowledgeEntriesByCategory(
  category: PEKnowledgeCategory
): PEKnowledgeEntry[] {
  return ALL_PE_KNOWLEDGE_ENTRIES.filter((entry) => entry.category === category);
}

export function yearGroupToAgePhase(yearGroup: string): AgePhase | null {
  if (!isYearGroupId(yearGroup)) return null;

  const primary: YearGroupId[] = ["year-1", "year-2", "year-3", "year-4", "year-5", "year-6"];
  const middle: YearGroupId[] = ["year-7", "year-8"];
  const secondary: YearGroupId[] = ["year-9", "year-10", "year-11"];

  if (primary.includes(yearGroup)) return "primary";
  if (middle.includes(yearGroup)) return "middle-school";
  if (secondary.includes(yearGroup)) return "secondary";
  return null;
}

export function getPEKnowledgeEntriesByAgePhase(agePhase: AgePhase): PEKnowledgeEntry[] {
  return ALL_PE_KNOWLEDGE_ENTRIES.filter(
    (entry) => entry.agePhaseRelevance.includes(agePhase) || entry.agePhaseRelevance.includes("all")
  );
}

export function getPEKnowledgeEntriesByYearGroup(yearGroup: string): PEKnowledgeEntry[] {
  const phase = yearGroupToAgePhase(yearGroup);
  if (!phase) return ALL_PE_KNOWLEDGE_ENTRIES.filter((e) => e.agePhaseRelevance.includes("all"));
  return getPEKnowledgeEntriesByAgePhase(phase);
}

export function getPEKnowledgeEntriesByPathway(pathway: PathwayId | "all"): PEKnowledgeEntry[] {
  return ALL_PE_KNOWLEDGE_ENTRIES.filter(
    (entry) => entry.pathwayRelevance.includes("all") || entry.pathwayRelevance.includes(pathway)
  );
}

export function getPEKnowledgeEntriesByTag(tag: string): PEKnowledgeEntry[] {
  const normalised = tag.trim().toLowerCase();
  return ALL_PE_KNOWLEDGE_ENTRIES.filter((entry) =>
    entry.tags.some((t) => t.toLowerCase() === normalised || t.toLowerCase().includes(normalised))
  );
}

function normaliseText(value: string): string {
  return value.trim().toLowerCase();
}

function textMatchesEntry(text: string, entry: PEKnowledgeEntry): boolean {
  const haystack = [
    entry.title,
    entry.summary,
    ...entry.tags,
    ...entry.relatedModels,
    entry.category,
  ]
    .join(" ")
    .toLowerCase();

  return text
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .some((word) => haystack.includes(word));
}

function scoreEntryForContext(
  entry: PEKnowledgeEntry,
  context: LessonKnowledgeContext
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (context.yearGroup) {
    const phase = yearGroupToAgePhase(context.yearGroup);
    if (phase && (entry.agePhaseRelevance.includes(phase) || entry.agePhaseRelevance.includes("all"))) {
      score += 3;
      reasons.push(`Relevant for ${phase.replace("-", " ")}`);
    }
    if (context.yearGroup === "year-1" && entry.agePhaseRelevance.includes("early-years")) {
      score += 2;
      reasons.push("Relevant for early years");
    }
  }

  if (context.pathway) {
    const pathway = context.pathway as PathwayId;
    if (entry.pathwayRelevance.includes("all") || entry.pathwayRelevance.includes(pathway)) {
      score += 3;
      reasons.push(`Matches ${pathway} pathway`);
    }
  }

  if (context.activityArea || context.topicId) {
    const area = normaliseText(`${context.topicId ?? ""} ${context.activityArea ?? ""}`);
    const areaMatches =
      entry.tags.some((tag) => area.includes(tag) || tag.includes(area)) ||
      textMatchesEntry(area, entry);
    if (areaMatches) {
      score += 4;
      reasons.push(`Links to ${context.activityArea ?? context.topicId}`);
    }
    if (
      isTGfURelevantTopic(context.topicId, context.activityArea) &&
      (entry.id === "tgfu-master" || entry.id === "tgfu")
    ) {
      score += 8;
      reasons.push("TGfU specialist guidance for this game category");
    }
    if (
      /\bgame.?based|\bgb[a]\b|\btgfu\b|\bgame sense/i.test(area) &&
      (entry.id === "tgfu-master" || entry.tags.includes("gba"))
    ) {
      score += 5;
      reasons.push("Game Based Approaches ecosystem match");
    }
    if (
      (entry.id === "teaching-for-learning-master" || entry.tags.includes("teaching-for-learning")) &&
      (context.lessonAim || context.activityArea || context.yearGroup)
    ) {
      score += 5;
      reasons.push("Teaching for Learning design guidance");
    }
    if (
      (entry.id === "cooperative-learning-master" ||
        entry.id === "cooperative-learning" ||
        entry.tags.includes("cooperative-learning")) &&
      (context.lessonAim || context.activityArea || isCooperativeLearningRelevant(`${context.lessonAim ?? ""} ${area}`))
    ) {
      score += 6;
      reasons.push("Cooperative Learning design guidance");
    }
    if (
      (entry.id === "tpsr-master" || entry.tags.includes("tpsr")) &&
      (context.lessonAim || context.activityArea || isTPSRRelevant(`${context.lessonAim ?? ""} ${area}`))
    ) {
      score += 5;
      reasons.push("TPSR responsibility development guidance");
    }
    if (
      (entry.id === "primary-pe-master" || entry.tags.includes("primary-pe")) &&
      (isPrimaryPEYearGroup(context.yearGroup) ||
        isPrimaryPERelevant(`${context.lessonAim ?? ""} ${area}`, context.yearGroup))
    ) {
      score += 7;
      reasons.push("Primary PE and fundamental movement guidance");
    }
    if (
      (entry.id === "learning-science-master" || entry.tags.includes("learning-science")) &&
      (context.lessonAim || context.activityArea || isLearningScienceRelevant(`${context.lessonAim ?? ""} ${area}`))
    ) {
      score += 6;
      reasons.push("Learning Science — durable learning design");
    }
    if (
      (entry.id === "educational-psychology-master" || entry.tags.includes("educational-psychology")) &&
      (context.lessonAim || context.activityArea || isEducationalPsychologyRelevant(`${context.lessonAim ?? ""} ${area}`))
    ) {
      score += 6;
      reasons.push("Educational Psychology — memory and load design");
    }
    if (
      (entry.id === "visible-learning-master" || entry.tags.includes("visible-learning")) &&
      (context.lessonAim || context.activityArea || isVisibleLearningRelevant(`${context.lessonAim ?? ""} ${area}`))
    ) {
      score += 6;
      reasons.push("Visible Learning — clarity, impact, and evidence");
    }
    if (
      (entry.id === "physical-literacy-master" ||
        entry.id === "physical-literacy-overview" ||
        entry.category === "physical-literacy") &&
      (context.lessonAim || context.activityArea || context.yearGroup)
    ) {
      score += 4;
      reasons.push("Physical literacy holistic development");
    }
  }

  if (context.lessonAim) {
    if (textMatchesEntry(normaliseText(context.lessonAim), entry)) {
      score += 3;
      reasons.push("Aligns with lesson aim");
    }
  }

  if (context.studentNeeds?.length) {
    for (const need of context.studentNeeds) {
      const needNorm = normaliseText(need);
      const needTags = ["send", "eal", "inclusion", "differentiation", "mixed-ability", "confidence"];
      const matchedTag = entry.tags.find(
        (tag) => needNorm.includes(tag) || tag.includes(needNorm.replace(/\s+/g, "-"))
      );
      if (matchedTag || needTags.some((t) => needNorm.includes(t) && entry.tags.includes(t))) {
        score += 4;
        reasons.push(`Supports ${need}`);
      }
    }
  }

  if (context.availableFacilities?.length) {
    for (const facility of context.availableFacilities) {
      const facilityNorm = normaliseText(facility);
      if (
        entry.tags.some((tag) => facilityNorm.includes(tag)) ||
        entry.id === "malta-facilities-context" ||
        (facilityNorm.includes("hall") && entry.tags.includes("hall"))
      ) {
        score += 2;
        reasons.push(`Considers ${facility} constraints`);
      }
    }
  }

  return { score, reasons: [...new Set(reasons)] };
}

/** Suggest the most relevant knowledge entries for a lesson planning context. */
export function suggestRelevantPEKnowledge(
  context: LessonKnowledgeContext,
  limit = 6
): SuggestedKnowledgeEntry[] {
  const scored = ALL_PE_KNOWLEDGE_ENTRIES.map((entry) => {
    const { score, reasons } = scoreEntryForContext(entry, context);
    return { entry, relevanceScore: score, reasons };
  })
    .filter((item) => item.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  if (scored.length === 0) {
    return ALL_PE_KNOWLEDGE_ENTRIES.slice(0, limit).map((entry) => ({
      entry,
      relevanceScore: 1,
      reasons: ["General PE planning guidance"],
    }));
  }

  return scored.slice(0, limit);
}

export function searchPEKnowledge(query: string): PEKnowledgeEntry[] {
  const q = normaliseText(query);
  if (!q) return [];

  return ALL_PE_KNOWLEDGE_ENTRIES.filter(
    (entry) =>
      entry.title.toLowerCase().includes(q) ||
      entry.summary.toLowerCase().includes(q) ||
      entry.tags.some((tag) => tag.includes(q)) ||
      entry.keyPrinciples.some((p) => p.toLowerCase().includes(q))
  );
}

export {
  TGfU_CORE_DEFINITION,
  TGfU_SIX_PHASES,
  TGfU_GAME_CATEGORIES,
  TGfU_PEDAGOGICAL_PRINCIPLES,
  TGfU_QUESTION_BANK,
  TGfU_DIFFERENTIATION,
  TGfU_ASSESSMENT_DOMAINS,
  TGfU_PLANNING_MISTAKES,
  TGfU_SCHEME_UNIT_PROGRESSION,
  TGfU_LESSON_TEMPLATES_BY_CATEGORY,
  TGfU_MASTER_PE_ENTRY,
  GBA_ECOSYSTEM,
  GBA_CORE_MESSAGE,
  TGfU_QUESTION_BANK_V2,
  classifyGame,
  getTGfUQuestionsV2,
  yearGroupToQuestionBand,
  isTGfURelevantTopic,
  resolveTGfUGameCategory,
  suggestTGfUApproach,
  buildTGfULessonTemplate,
  getTGfUQuestionsByGameCategory,
  getTGfUDifferentiationOptions,
  getTGfUSchemeUnitProgressionTips,
  getTGfULessonTemplateByCategory,
  enrichTGfUKnowledgeCard,
  flagTGfUPlanningIssues,
  type TGfUGameCategory,
  type TGfUApproachSuggestion,
  type TGfULessonTemplate,
  type GBAApproach,
  type GameClassification,
  type QuestionAgeBand,
} from "./tgfuMaster";

export {
  TACTICAL_COMPLEXITY_LADDERS,
  getTacticalComplexityLevel,
  getTacticalComplexityLadder,
  suggestNextComplexityStep,
  buildTGfUUnitProgression,
  getSchemeProgressionV2Tips,
  inferComplexityLevelFromLessonIndex,
  type TGfUUnitProgression,
  type TacticalComplexityLevel,
} from "./tgfuProgressions";

export {
  CATEGORY_CURRICULUM,
  getCategoryCurriculum,
  getCurriculumForTopic,
  getSharedOutcomesForSport,
  buildPlanningAssistantCurriculumSummary,
  type CategoryCurriculum,
} from "./tgfuCurriculum";

export {
  evaluateThinkingPlayerScore,
  evaluateRepresentativeness,
  evaluateLearnerCentredQuality,
  runTGfUQualityAudit,
  buildTGfUQualityInsights,
  buildPedagogyCoachTGfUMetrics,
  getGamePerformanceEvidenceSuggestions,
  GAME_PERFORMANCE_ASSESSMENT,
  TGfU_QUALITY_WARNINGS,
  THINKING_PLAYER_FRAMEWORK,
  type ThinkingPlayerEvaluation,
  type RepresentativenessEvaluation,
  type LearnerCentredEvaluation,
} from "./tgfuQualityChecks";

export {
  PHYSICAL_LITERACY_FRAMEWORK,
  PHYSICAL_LITERACY_CORE_MESSAGE,
  MOVEMENT_EXPERIENCE_FRAMEWORK,
  PHYSICAL_LITERACY_QUESTION_BANK,
  PHYSICAL_LITERACY_MASTER_PE_ENTRY,
  getPhysicalLiteracyQuestions,
  getPLAttributeById,
  yearGroupToPLQuestionBand,
  type PLAttribute,
  type PLAttributeId,
} from "./physicalLiteracyMaster";

export {
  evaluatePhysicalLiteracyProfile,
  evaluateConfidenceBuilding,
  evaluateMotivationSupport,
  evaluatePhysicalLiteracyInclusion,
  evaluateLifelongParticipationPotential,
  evaluatePerformanceBias,
  evaluatePhysicalLiteracyQuality,
  evaluateCurriculumBalance,
  buildPhysicalLiteracyPlanningInsights,
  buildPedagogyCoachPhysicalLiteracyMetrics,
  buildPhysicalLiteracyQualityReview,
  buildPhysicalLiteracyQualityInsights,
  buildSchemePhysicalLiteracyTips,
  buildPlanningAssistantPhysicalLiteracyCard,
  type PhysicalLiteracyProfile,
  type PhysicalLiteracyQualityResult,
  type CurriculumBalanceResult,
} from "./physicalLiteracyAudits";

export {
  TEACHING_FOR_LEARNING_FRAMEWORK,
  TEACHING_FOR_LEARNING_CORE_MESSAGE,
  CONTENT_DEVELOPMENT_MODEL,
  TEACHING_FOR_LEARNING_MASTER_PE_ENTRY,
  getTFLAreaById,
  type TFLFrameworkArea,
  type ContentDevelopmentType,
} from "./teachingForLearningMaster";

export {
  evaluateLearningExperienceQuality,
  evaluateMovementTaskDesign,
  buildMovementTaskSuggestion,
  classifyTaskDevelopmentType,
  suggestNextContentDevelopmentStep,
  evaluateTaskPresentationQuality,
  generateLearningCues,
  evaluatePracticeOpportunity,
  evaluateFeedbackQuality,
  generateFeedbackPrompts,
  generateTeacherObservationFocus,
  evaluatePlanningCoherence,
  suggestInstructionalAssessment,
  suggestTeachingStrategy,
  evaluateLearningEnvironment,
  generateTeacherReflectionPrompts,
  buildTeachingForLearningPlanningInsights,
  buildPedagogyCoachTFLMetrics,
  buildTeachingForLearningQualityReview,
  buildTeachingForLearningQualityInsights,
  buildSchemeTeachingForLearningTips,
  lessonToTFLContext,
  type LearningExperienceQualityResult,
  type MovementTaskSuggestion,
  type TFLQualityBand,
} from "./teachingForLearningEngines";

export {
  COOPERATIVE_LEARNING_FRAMEWORK,
  COOPERATIVE_LEARNING_CORE_MESSAGE,
  COOPERATIVE_STRUCTURE_LIBRARY,
  COOPERATIVE_ROLES,
  GROUP_STRUCTURE_OPTIONS,
  COOPERATIVE_LEARNING_WARNINGS,
  COOPERATIVE_LEARNING_MASTER_PE_ENTRY,
  generateGroupProcessingPrompts,
  isCooperativeLearningRelevant,
  type CLElement,
  type CooperativeStructure,
} from "./cooperativeLearningMaster";

export {
  evaluateCooperativeLearningQuality,
  evaluatePositiveInterdependence,
  evaluateIndividualAccountability,
  evaluateInterpersonalSkillsDevelopment,
  evaluateGroupProcessing,
  suggestCooperativeRoles,
  suggestGroupStructures,
  evaluateCooperativeEquity,
  suggestCooperativeAssessment,
  buildCooperativeLearningLessonSupport,
  buildCooperativeLearningPlanningInsights,
  buildPedagogyCoachCLMetrics,
  buildCooperativeLearningQualityReview,
  buildCooperativeLearningQualityInsights,
  buildSchemeCooperativeLearningTips,
  lessonToCLContext,
  type CLQualityBand,
} from "./cooperativeLearningEngines";

export {
  TPSR_FRAMEWORK,
  TPSR_CORE_MESSAGE,
  TPSR_QUESTION_BANK,
  TPSR_WARNINGS,
  TPSR_MASTER_PE_ENTRY,
  getTPSRLevelDefinition,
  getTPSRQuestions,
  isTPSRRelevant,
  yearGroupToTPSRQuestionBand,
  ACTIVITY_EMBEDDING_HINTS,
  type TPSRLevel,
  type TPSRLevelDefinition,
  type TPSRQuestionAgeBand,
} from "./tpsrMaster";

export {
  evaluateTPSRQuality,
  suggestTPSRLevelFocus,
  buildTPSRLessonStructure,
  embedResponsibilityIntoActivity,
  evaluateRelationalTeaching,
  evaluateStudentVoiceAndEmpowerment,
  evaluateTransferBeyondPE,
  suggestTPSRAssessment,
  buildTPSRUnitProgression,
  buildTPSRPlanningInsights,
  buildPedagogyCoachTPSRMetrics,
  buildTPSRQualityReview,
  buildTPSRQualityInsights,
  buildSchemeTPSRTips,
  lessonToTPSRContext,
  type TPSRQualityBand,
} from "./tpsrEngines";

export {
  PRIMARY_PE_FRAMEWORK,
  PRIMARY_PE_CORE_MESSAGE,
  FUNDAMENTAL_MOVEMENT_SKILLS,
  MOVEMENT_CONCEPTS_FRAMEWORK,
  PRIMARY_PE_WARNINGS,
  PRIMARY_PE_MASTER_PE_ENTRY,
  isPrimaryPEYearGroup,
  isPrimaryPERelevant,
  yearGroupToPrimaryPhase,
  getFMSSkillById,
  getFMSSkillsByCategory,
  type PrimaryPEFrameworkArea,
  type FundamentalMovementSkill,
  type FMSCategory,
  type PrimaryYearPhase,
} from "./primaryPEMaster";

export {
  evaluateDevelopmentalReadiness,
  buildPrimaryPELessonStructure,
  evaluatePrimaryLessonStructure,
  suggestMovementConcepts,
  evaluatePrimaryActiveParticipation,
  evaluatePrimarySafetyAndOrganisation,
  evaluatePrimaryPEInclusion,
  suggestPrimaryPEAssessment,
  buildPrimarySkillProgression,
  suggestPrimaryGameFoundation,
  suggestChildFriendlyFitnessApproach,
  evaluatePrimaryPEQuality,
  buildPrimaryPEPlanningInsights,
  buildPedagogyCoachPrimaryPEMetrics,
  buildPrimaryPEQualityReview,
  buildPrimaryPEQualityInsights,
  buildSchemePrimaryPETips,
  lessonToPrimaryPEContext,
  detectFMSSkillFocus,
  type PrimaryPEQualityBand,
  type ReadinessVerdict,
  type SkillProgressionStage,
} from "./primaryPEEngines";

export {
  LEARNING_SCIENCE_FRAMEWORK,
  LEARNING_SCIENCE_CORE_MESSAGE,
  PE_RETRIEVAL_PROMPT_BANK,
  LEARNING_SCIENCE_WARNINGS,
  LEARNING_SCIENCE_MASTER_PE_ENTRY,
  isLearningScienceRelevant,
  yearGroupToLSAgeBand,
  getRetrievalPrompts,
  getLearningSciencePrinciple,
  type LearningSciencePrinciple,
  type LSAgeBand,
} from "./learningScienceMaster";

export {
  evaluateRetrievalPractice,
  suggestRetrievalPrompts,
  evaluateSpacingAcrossScheme,
  suggestSpacingPlan,
  evaluateInterleaving,
  suggestInterleavedPractice,
  evaluatePracticeVariation,
  evaluateDesirableDifficulty,
  evaluateElaboration,
  suggestElaborationQuestions,
  evaluateLearningCalibration,
  evaluateGenerationOpportunity,
  evaluateTransferPotential,
  evaluateLearningScienceQuality,
  buildSchemeMemoryMap,
  buildLearningSciencePlanningInsights,
  buildPedagogyCoachLSMetrics,
  buildLearningScienceQualityReview,
  buildLearningScienceQualityInsights,
  buildSchemeLearningScienceTips,
  lessonToLSContext,
  type LSQualityBand,
  type DifficultyVerdict,
  type TransferPotential,
} from "./learningScienceEngines";

export {
  EDUCATIONAL_PSYCHOLOGY_FRAMEWORK,
  EDUCATIONAL_PSYCHOLOGY_CORE_MESSAGE,
  EDUCATIONAL_PSYCHOLOGY_WARNINGS,
  EDUCATIONAL_PSYCHOLOGY_MASTER_PE_ENTRY,
  isEducationalPsychologyRelevant,
  getEducationalPsychologyDomain,
  type EducationalPsychologyDomain,
} from "./educationalPsychologyMaster";

export {
  evaluateWorkingMemoryLoad,
  evaluateCognitiveLoad,
  evaluatePriorKnowledgeActivation,
  evaluateSchemaBuilding,
  evaluateLearnerExpertise,
  evaluateMetacognition,
  evaluateScaffolding,
  evaluateInstructionalClarity,
  evaluateInstructionStrategy,
  evaluateFeedbackQuality as evaluateEPFeedbackQuality,
  evaluateAssessmentForLearning as evaluateEPAssessmentForLearning,
  evaluateLearningTransfer,
  evaluateLearningContext,
  detectLearningMisconceptions,
  evaluateEducationalPsychologyQuality,
  buildEducationalPsychologyPlanningInsights,
  buildPedagogyCoachEPMetrics,
  buildEducationalPsychologyQualityReview,
  buildEducationalPsychologyQualityInsights,
  buildSchemeEducationalPsychologyTips,
  lessonToEPContext,
  type EPQualityBand,
  type WorkingMemoryVerdict,
  type ExpertiseLevel,
  type EPTransferPotential,
} from "./educationalPsychologyEngines";

export {
  VISIBLE_LEARNING_FRAMEWORK,
  VISIBLE_LEARNING_CORE_MESSAGE,
  VISIBLE_LEARNING_WARNINGS,
  VISIBLE_LEARNING_MASTER_PE_ENTRY,
  isVisibleLearningRelevant,
  getVisibleLearningDomain,
  type VisibleLearningDomain,
} from "./visibleLearningMaster";

export {
  evaluateTeacherClarity,
  evaluateLearningIntentions,
  evaluateSuccessCriteria,
  evaluateVisibleLearning,
  evaluateChallengeLevel,
  evaluateVisibleLearningFeedback,
  evaluateProgressVisibility,
  evaluateStudentSelfEvaluation,
  evaluateTeacherImpactEvidence,
  evaluateLessonEffectiveness,
  suggestHighImpactPractices,
  generateVisibleLearningReview,
  evaluateVisibleLearningQuality,
  buildVisibleLearningPlanningInsights,
  buildPedagogyCoachVLMetrics,
  buildVisibleLearningQualityReview,
  buildVisibleLearningQualityInsights,
  buildSchemeVisibleLearningTips,
  lessonToVLContext,
  type VLQualityBand,
  type ChallengeVerdict,
  type LearningWalkVerdict,
} from "./visibleLearningEngines";

export {
  LEARNING_SCIENCE_ENTRIES,
  PEDAGOGY_MODEL_ENTRIES,
  PHYSICAL_LITERACY_ENTRIES,
  MOTIVATION_ENTRIES,
  INCLUSION_ENTRIES,
  ASSESSMENT_ENTRIES,
  CURRICULUM_DESIGN_ENTRIES,
  CHILD_DEVELOPMENT_ENTRIES,
  MALTA_CONTEXT_ENTRIES,
};

export {
  appendUniqueText,
  mergePromptList,
  buildAppliedSuggestionMessage,
  avoidDuplicateSuggestions,
  safeApplyText,
  applyTextToLessonForm,
  applyQuestioningToLesson,
  applyCommonMistakeNote,
  applyToSchemeLesson,
  buildImprovedWalt,
  buildImprovedWilf,
  buildMinimalLessonDraftFromContext,
} from "./applySuggestions";

export {
  buildKnowledgeContextFromPrompt,
  buildLessonPedagogyCoachReport,
  buildSchemeProgressionCoachReport,
  buildKnowledgeQualityInsights,
  getPlanningAssistantKnowledgeSuggestions,
  toPEKnowledgeCardViewModel,
  type PEKnowledgeCardViewModel,
  type LessonPedagogyCoachReport,
  type SchemeProgressionCoachReport,
  type KnowledgeQualityInsight,
  type PhysicalLiteracyQualityReview,
  type TeachingForLearningQualityReview,
  type CooperativeLearningQualityReview,
  type TPSRQualityReview,
  type PrimaryPEQualityReview,
  type LearningScienceQualityReview,
  type EducationalPsychologyQualityReview,
  buildPhysicalLiteracyQualityReviewForLesson,
  buildTeachingForLearningQualityReviewForLesson,
  buildCooperativeLearningQualityReviewForLesson,
  buildTPSRQualityReviewForLesson,
  buildPrimaryPEQualityReviewForLesson,
  buildLearningScienceQualityReviewForLesson,
  buildEducationalPsychologyQualityReviewForLesson,
} from "./coaching";

export type {
  PEKnowledgeEntry,
  PEKnowledgeCategory,
  AgePhase,
  LessonKnowledgeContext,
  SuggestedKnowledgeEntry,
} from "./types";
