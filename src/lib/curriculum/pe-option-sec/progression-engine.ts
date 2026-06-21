import { yearGroupMatchesFilter } from "@/lib/year-groups";
import { getPlanningOutcomes } from "../planning/planning-outcomes";
import type { LearningOutcome } from "../types";
import type { LearningDomain, PhysicalLiteracyAttribute } from "../primary-pe/types";
import { LEARNING_DOMAIN_LABELS, PL_ATTRIBUTE_LABELS } from "../primary-pe/progression-framework";
import { buildSecMetadataIndex, buildSecProgressionMetadata } from "./outcome-metadata";
import { isSecPlanningOutcome } from "./planning-bridge";
import {
  ALL_SEC_CATEGORIES,
  ASSESSMENT_RELEVANCE_LABELS,
  ASSESSMENT_STRONG_THRESHOLD,
  CATEGORY_STRONG_THRESHOLD,
  CATEGORY_THIN_THRESHOLD,
  DOMAIN_STRONG_THRESHOLD,
  PL_STRONG_THRESHOLD,
  SEC_CATEGORY_LABELS,
  SEC_EXAM_THEORY_CATEGORIES,
  SEC_REVISION_TOPIC_ORDER,
} from "./progression-framework";
import type {
  AssessmentRelevance,
  SecAssessmentCoverageRow,
  SecAssessmentSuggestions,
  SecCategoryCoverageRow,
  SecDomainCoverageRow,
  SecGapItem,
  SecPeOptionDashboardSummary,
  SecPhysicalLiteracyRow,
  SecProgressionMetadata,
  SecProgressionQuery,
  SecProgressionResult,
  SecRevisionContext,
  SecRevisionReadinessRow,
  SecRevisionTopic,
  SecTopicCategory,
  RevisionStatus,
} from "./types";

function coverageStatus(
  count: number,
  strongThreshold: number,
  thinThreshold = 1
): "strong" | "thin" | "missing" {
  if (count >= strongThreshold) return "strong";
  if (count >= thinThreshold) return "thin";
  return "missing";
}

export function getSecPeOptionOutcomes(yearGroup?: string): LearningOutcome[] {
  return getPlanningOutcomes().filter((outcome) => isSecPlanningOutcome(outcome, yearGroup));
}

export function getSecProgressionMetadata(
  outcomeId: string
): SecProgressionMetadata | undefined {
  const outcome = getPlanningOutcomes().find((o) => o.id === outcomeId);
  if (!outcome) return undefined;
  return buildSecProgressionMetadata(outcome) ?? undefined;
}

function filterByQuery(
  outcomes: LearningOutcome[],
  metadata: Map<string, SecProgressionMetadata>,
  query: SecProgressionQuery
): LearningOutcome[] {
  return outcomes.filter((outcome) => {
    const meta = metadata.get(outcome.id);
    if (!meta) return false;

    if (query.yearGroup && !yearGroupMatchesFilter(outcome.yearGroups, query.yearGroup)) {
      return false;
    }
    if (query.category && !meta.categories.includes(query.category)) return false;
    if (query.anatomySubtopic && !meta.anatomySubtopics?.includes(query.anatomySubtopic)) {
      return false;
    }
    if (query.fitnessSubtopic && !meta.fitnessSubtopics?.includes(query.fitnessSubtopic)) {
      return false;
    }
    if (
      query.skillAcquisitionSubtopic &&
      !meta.skillAcquisitionSubtopics?.includes(query.skillAcquisitionSubtopic)
    ) {
      return false;
    }
    if (query.psychologySubtopic && !meta.psychologySubtopics?.includes(query.psychologySubtopic)) {
      return false;
    }
    if (
      query.performanceSubtopic &&
      !meta.performanceSubtopics?.includes(query.performanceSubtopic)
    ) {
      return false;
    }
    if (query.lifestyleSubtopic && !meta.lifestyleSubtopics?.includes(query.lifestyleSubtopic)) {
      return false;
    }
    if (query.learningDomain && !meta.learningDomains.includes(query.learningDomain)) {
      return false;
    }
    if (query.physicalLiteracy && !meta.physicalLiteracy?.includes(query.physicalLiteracy)) {
      return false;
    }
    if (query.examRelevance && meta.examRelevance !== query.examRelevance) return false;
    if (query.skillHint) {
      const hint = query.skillHint.toLowerCase();
      if (
        !outcome.skillIds.some((id) => id.includes(hint)) &&
        !outcome.description.toLowerCase().includes(hint)
      ) {
        return false;
      }
    }
    return true;
  });
}

export function querySecProgression(query: SecProgressionQuery): SecProgressionResult {
  const allSec = getSecPeOptionOutcomes();
  const metadata = buildSecMetadataIndex(allSec);
  const current = filterByQuery(allSec, metadata, query);

  const related = current.length
    ? allSec
        .filter((outcome) => {
          if (current.some((c) => c.id === outcome.id)) return false;
          const other = metadata.get(outcome.id);
          const first = metadata.get(current[0].id);
          if (!other || !first) return false;
          return first.categories.some((c) => other.categories.includes(c));
        })
        .slice(0, 8)
    : [];

  let narrative: string | undefined;
  if (query.category) {
    narrative = `${SEC_CATEGORY_LABELS[query.category]}: ${current.length} outcomes mapped.`;
  } else if (query.anatomySubtopic) {
    narrative = `Anatomy focus — ${query.anatomySubtopic.replace(/-/g, " ")}: ${current.length} outcomes.`;
  }

  return { current, related, metadata, narrative };
}

export function getRelatedSecOutcomes(outcomeId: string, limit = 8): LearningOutcome[] {
  const meta = getSecProgressionMetadata(outcomeId);
  if (!meta) return [];

  const all = getSecPeOptionOutcomes();
  const index = buildSecMetadataIndex(all);

  return all
    .filter((outcome) => {
      if (outcome.id === outcomeId) return false;
      const other = index.get(outcome.id);
      if (!other) return false;
      return meta.categories.some((c) => other.categories.includes(c));
    })
    .slice(0, limit);
}

export function getOutcomesBySecCategory(
  category: SecTopicCategory,
  yearGroup?: string
): LearningOutcome[] {
  const metadata = buildSecMetadataIndex(getSecPeOptionOutcomes(yearGroup));
  return getSecPeOptionOutcomes(yearGroup).filter((outcome) =>
    metadata.get(outcome.id)?.categories.includes(category)
  );
}

function resolveRevisionStatus(
  outcomeIds: string[],
  context?: SecRevisionContext
): RevisionStatus {
  const taught = new Set(context?.taughtOutcomeIds ?? []);
  const planned = new Set(context?.plannedOutcomeIds ?? []);

  const covered = outcomeIds.some((id) => taught.has(id));
  const plannedOnly = outcomeIds.some((id) => planned.has(id));

  if (covered) return "covered";
  if (plannedOnly) return "planned";
  return "not-planned";
}

function outcomesForCategory(
  category: SecTopicCategory,
  allSec: LearningOutcome[],
  metadata: Map<string, SecProgressionMetadata>
): LearningOutcome[] {
  return allSec.filter((outcome) => metadata.get(outcome.id)?.categories.includes(category));
}

export function showRevisionTopics(context?: SecRevisionContext): SecRevisionTopic[] {
  const allSec = getSecPeOptionOutcomes();
  const metadata = buildSecMetadataIndex(allSec);

  return SEC_REVISION_TOPIC_ORDER.map((category) => {
    const outcomes = outcomesForCategory(category, allSec, metadata);
    const outcomeIds = outcomes.map((o) => o.id);
    return {
      id: `revision-${category}`,
      category,
      label: SEC_CATEGORY_LABELS[category],
      outcomeCount: outcomes.length,
      status: resolveRevisionStatus(outcomeIds, context),
      outcomeCodes: outcomes.map((o) => o.code),
    };
  });
}

export function showExamTopicCoverage(context?: SecRevisionContext): SecRevisionTopic[] {
  return showRevisionTopics(context).filter((topic) =>
    SEC_EXAM_THEORY_CATEGORIES.includes(topic.category)
  );
}

export function showWeakTopics(context?: SecRevisionContext): SecRevisionTopic[] {
  return showRevisionTopics(context).filter(
    (topic) => topic.status === "not-planned" || topic.outcomeCount <= 1
  );
}

export function showMissingTopics(context?: SecRevisionContext): SecRevisionTopic[] {
  return showRevisionTopics(context).filter((topic) => topic.status === "not-planned");
}

export function buildSecAssessmentSuggestions(
  outcomeIds: string[]
): SecAssessmentSuggestions {
  const examStyleQuestions: string[] = [];
  const revisionPrompts: string[] = [];
  const courseworkIdeas: string[] = [];
  const assessmentOpportunities: string[] = [];

  for (const id of outcomeIds) {
    const meta = getSecProgressionMetadata(id);
    const outcome = getPlanningOutcomes().find((o) => o.id === id);
    if (!meta || !outcome) continue;

    if (meta.categories.includes("anatomy-physiology")) {
      examStyleQuestions.push(
        "Explain the role of the cardiovascular system during sustained exercise.",
        "Describe how the muscular system contributes to movement in sport."
      );
      revisionPrompts.push("Label a diagram of the heart and trace the path of blood.");
    }

    if (meta.categories.includes("fitness-training")) {
      examStyleQuestions.push(
        "Apply the principle of overload to design a training week.",
        "Compare two training methods for developing cardiovascular endurance."
      );
      revisionPrompts.push("List health-related fitness components with a sporting example for each.");
    }

    if (meta.categories.includes("skill-acquisition")) {
      examStyleQuestions.push(
        "Compare internal and external feedback with sporting examples.",
        "Explain how guidance types support learners at different stages."
      );
      revisionPrompts.push("Define the stages of learning and identify one skill at each stage.");
    }

    if (meta.categories.includes("sport-psychology")) {
      examStyleQuestions.push(
        "Explain how SMART targets support motivation in sport.",
        "Describe how arousal and aggression can affect performance."
      );
      revisionPrompts.push("Generate revision activities for motivation — create a mind map linking personality, arousal, and goal setting.");
    }

    if (meta.categories.includes("performance-analysis")) {
      courseworkIdeas.push(
        "Observe a peer performance, collect data, and conduct a structured interview.",
        "Prepare and deliver a micro-coaching session with written evaluation."
      );
      assessmentOpportunities.push(
        "Use a performance analysis template: observe → record → evaluate → plan improvement."
      );
    }

    if (meta.categories.includes("practical-sport")) {
      courseworkIdeas.push(
        "Session plan: warm-up, skill block, conditioned game, plenary with self-evaluation.",
        "Officiating log with rule application and fair-play reflection."
      );
      assessmentOpportunities.push(
        "Practical performance rubric: technique, decision-making, officiating accuracy."
      );
    }

    if (meta.categories.includes("health-lifestyle")) {
      examStyleQuestions.push(
        "Discuss the contribution of physical activity to health and wellbeing.",
        "Explain how nutrition and recovery support athletic performance."
      );
    }
  }

  return {
    examStyleQuestions: [...new Set(examStyleQuestions)].slice(0, 5),
    revisionPrompts: [...new Set(revisionPrompts)].slice(0, 5),
    courseworkIdeas: [...new Set(courseworkIdeas)].slice(0, 4),
    assessmentOpportunities: [...new Set(assessmentOpportunities)].slice(0, 4),
  };
}

function buildRevisionReadiness(
  allSec: LearningOutcome[],
  metadata: Map<string, SecProgressionMetadata>,
  context?: SecRevisionContext
): SecRevisionReadinessRow[] {
  const taught = new Set(context?.taughtOutcomeIds ?? []);
  const planned = new Set(context?.plannedOutcomeIds ?? []);

  return ALL_SEC_CATEGORIES.map((category) => {
    const outcomes = outcomesForCategory(category, allSec, metadata);
    let coveredCount = 0;
    let plannedCount = 0;
    let notPlannedCount = 0;

    for (const outcome of outcomes) {
      if (taught.has(outcome.id)) coveredCount++;
      else if (planned.has(outcome.id)) plannedCount++;
      else notPlannedCount++;
    }

    const readiness =
      coveredCount >= outcomes.length && outcomes.length > 0
        ? "ready"
        : coveredCount + plannedCount > 0
          ? "partial"
          : "gap";

    return {
      category,
      label: SEC_CATEGORY_LABELS[category],
      coveredCount,
      plannedCount,
      notPlannedCount,
      readiness,
    };
  });
}

function buildGapAnalysis(
  categoryCoverage: SecCategoryCoverageRow[],
  allSec: LearningOutcome[],
  metadata: Map<string, SecProgressionMetadata>
): SecGapItem[] {
  const gaps: SecGapItem[] = [];

  for (const row of categoryCoverage.filter((r) => r.status !== "strong")) {
    gaps.push({
      id: `gap-${row.category}`,
      title: row.label,
      status: row.status === "missing" ? "missing" : "thin",
      detail: `Only ${row.outcomeCount} outcomes mapped to ${row.label.toLowerCase()}.`,
    });
  }

  const examTheoryCount = allSec.filter((o) => {
    const cats = metadata.get(o.id)?.categories ?? [];
    return cats.some((c) => SEC_EXAM_THEORY_CATEGORIES.includes(c));
  }).length;
  if (examTheoryCount < 5) {
    gaps.push({
      id: "gap-exam-theory",
      title: "Exam theory coverage",
      status: "needs-review",
      detail: "Theory strands (anatomy, fitness, skill acquisition, psychology) need fuller import beyond 10 syllabus LOs.",
    });
  }

  const assessmentCount = allSec.filter((o) =>
    metadata.get(o.id)?.assessmentRelevance.includes("exam-paper")
  ).length;
  if (assessmentCount < 4) {
    gaps.push({
      id: "gap-assessment-coverage",
      title: "Assessment coverage",
      status: "thin",
      detail: "Few outcomes explicitly tagged for exam-paper assessment opportunities.",
    });
  }

  if (allSec.length <= 11) {
    gaps.push({
      id: "gap-import-depth",
      title: "Syllabus import depth",
      status: "needs-review",
      detail: "SEC PE Option has 10 official LOs — granular sub-outcomes still pending import.",
    });
  }

  return gaps;
}

export function buildSecPeOptionDashboardSummary(
  revisionContext?: SecRevisionContext
): SecPeOptionDashboardSummary {
  const allSec = getSecPeOptionOutcomes();
  const metadata = buildSecMetadataIndex(allSec);
  const kbOutcomes = allSec.filter((o) => /^opt-|sec-/i.test(o.id) && !o.id.startsWith("lo-")).length;
  const importedOutcomes = allSec.length - kbOutcomes;

  const categoryCoverage: SecCategoryCoverageRow[] = ALL_SEC_CATEGORIES.map((category) => {
    const count = allSec.filter((outcome) =>
      metadata.get(outcome.id)?.categories.includes(category)
    ).length;
    return {
      category,
      label: SEC_CATEGORY_LABELS[category],
      outcomeCount: count,
      status: coverageStatus(count, CATEGORY_STRONG_THRESHOLD, CATEGORY_THIN_THRESHOLD),
    };
  });

  const learningDomainCoverage: SecDomainCoverageRow[] = (
    Object.keys(LEARNING_DOMAIN_LABELS) as LearningDomain[]
  ).map((domain) => {
    const count = allSec.filter((outcome) =>
      metadata.get(outcome.id)?.learningDomains.includes(domain)
    ).length;
    return {
      domain,
      label: LEARNING_DOMAIN_LABELS[domain],
      outcomeCount: count,
      status: coverageStatus(count, DOMAIN_STRONG_THRESHOLD),
    };
  });

  const plAttributes = Object.keys(PL_ATTRIBUTE_LABELS) as PhysicalLiteracyAttribute[];
  const physicalLiteracyCoverage: SecPhysicalLiteracyRow[] = plAttributes.map((attribute) => {
    const count = allSec.filter((outcome) =>
      metadata.get(outcome.id)?.physicalLiteracy?.includes(attribute)
    ).length;
    return {
      attribute,
      label: PL_ATTRIBUTE_LABELS[attribute],
      outcomeCount: count,
      status: coverageStatus(count, PL_STRONG_THRESHOLD),
    };
  });

  const assessmentTypes = Object.keys(ASSESSMENT_RELEVANCE_LABELS) as AssessmentRelevance[];
  const assessmentCoverage: SecAssessmentCoverageRow[] = assessmentTypes.map((relevance) => {
    const count = allSec.filter((outcome) =>
      metadata.get(outcome.id)?.assessmentRelevance.includes(relevance)
    ).length;
    return {
      relevance,
      label: ASSESSMENT_RELEVANCE_LABELS[relevance],
      outcomeCount: count,
      status: coverageStatus(count, ASSESSMENT_STRONG_THRESHOLD),
    };
  });

  const revisionReadiness = buildRevisionReadiness(allSec, metadata, revisionContext);
  const gapAnalysis = buildGapAnalysis(categoryCoverage, allSec, metadata);
  const thinCategories = categoryCoverage.filter((r) => r.status !== "strong").length;
  const overallStatus =
    allSec.length >= 10 && thinCategories <= 3
      ? "strong"
      : allSec.length >= 5
        ? "thin"
        : "needs-review";

  return {
    totalOutcomes: allSec.length,
    kbOutcomes,
    importedOutcomes,
    categoryCoverage,
    learningDomainCoverage,
    physicalLiteracyCoverage,
    assessmentCoverage,
    revisionReadiness,
    gapAnalysis,
    overallStatus,
  };
}
