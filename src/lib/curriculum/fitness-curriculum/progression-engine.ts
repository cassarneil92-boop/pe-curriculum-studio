import { getYearGroupLabel, yearGroupMatchesFilter } from "@/lib/year-groups";
import type { YearGroupId } from "@/lib/year-groups";
import { getPlanningOutcomes } from "../planning/planning-outcomes";
import type { LearningOutcome } from "../types";
import type { LearningDomain, PhysicalLiteracyAttribute } from "../primary-pe/types";
import { LEARNING_DOMAIN_LABELS, PL_ATTRIBUTE_LABELS } from "../primary-pe/progression-framework";
import { buildFitnessMetadataIndex, buildFitnessProgressionMetadata } from "./outcome-metadata";
import { isFitnessPlanningOutcome } from "./planning-bridge";
import {
  ALL_FITNESS_CATEGORIES,
  CATEGORY_STRONG_THRESHOLD,
  CATEGORY_THIN_THRESHOLD,
  DOMAIN_STRONG_THRESHOLD,
  FITNESS_CATEGORY_LABELS,
  FITNESS_YEAR_LABELS,
  getAdjacentFitnessStage,
  getAdjacentFitnessYear,
  PL_STRONG_THRESHOLD,
  PROGRESSION_STAGE_LABELS,
  YEAR_STRONG_THRESHOLD,
} from "./progression-framework";
import type {
  FitnessCategory,
  FitnessCategoryCoverageRow,
  FitnessCurriculumDashboardSummary,
  FitnessDomainCoverageRow,
  FitnessGapItem,
  FitnessPhysicalLiteracyRow,
  FitnessProgressionMetadata,
  FitnessProgressionQuery,
  FitnessProgressionResult,
  FitnessProgressionStage,
  FitnessYearCoverageRow,
  HealthRelatedComponent,
  TrainingMethod,
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

export function getFitnessCurriculumOutcomes(yearGroup?: string): LearningOutcome[] {
  return getPlanningOutcomes().filter((outcome) => isFitnessPlanningOutcome(outcome, yearGroup));
}

export function getFitnessProgressionMetadata(
  outcomeId: string
): FitnessProgressionMetadata | undefined {
  const outcome = getPlanningOutcomes().find((o) => o.id === outcomeId);
  if (!outcome) return undefined;
  return buildFitnessProgressionMetadata(outcome) ?? undefined;
}

function filterByQuery(
  outcomes: LearningOutcome[],
  metadata: Map<string, FitnessProgressionMetadata>,
  query: FitnessProgressionQuery
): LearningOutcome[] {
  return outcomes.filter((outcome) => {
    const meta = metadata.get(outcome.id);
    if (!meta) return false;

    if (query.yearGroup && !yearGroupMatchesFilter(outcome.yearGroups, query.yearGroup)) {
      return false;
    }
    if (query.category && !meta.categories.includes(query.category)) return false;
    if (query.healthComponent && !meta.healthComponents?.includes(query.healthComponent)) {
      return false;
    }
    if (query.skillComponent && !meta.skillComponents?.includes(query.skillComponent)) {
      return false;
    }
    if (query.trainingMethod && !meta.trainingMethods?.includes(query.trainingMethod)) {
      return false;
    }
    if (query.trainingPrinciple && !meta.trainingPrinciples?.includes(query.trainingPrinciple)) {
      return false;
    }
    if (query.testType && !meta.testTypes?.includes(query.testType)) return false;
    if (query.lifestyleTopic && !meta.lifestyleTopics?.includes(query.lifestyleTopic)) {
      return false;
    }
    if (query.progressionStage && meta.progressionStage !== query.progressionStage) return false;
    if (query.learningDomain && !meta.learningDomains.includes(query.learningDomain)) {
      return false;
    }
    if (
      query.physicalLiteracy &&
      !meta.physicalLiteracy?.includes(query.physicalLiteracy)
    ) {
      return false;
    }
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

export function queryFitnessProgression(query: FitnessProgressionQuery): FitnessProgressionResult {
  const allFitness = getFitnessCurriculumOutcomes();
  const metadata = buildFitnessMetadataIndex(allFitness);

  let current = filterByQuery(allFitness, metadata, query);
  let previous: LearningOutcome[] = [];
  let next: LearningOutcome[] = [];
  let related: LearningOutcome[] = [];

  if (query.fromStage && query.toStage) {
    previous = filterByQuery(allFitness, metadata, { progressionStage: query.fromStage });
    current = filterByQuery(allFitness, metadata, { progressionStage: query.toStage });
  } else if (query.progressionStage) {
    const { previous: prevStage, next: nextStage } = getAdjacentFitnessStage(query.progressionStage);
    if (prevStage) {
      previous = filterByQuery(allFitness, metadata, { progressionStage: prevStage });
    }
    if (nextStage) {
      next = filterByQuery(allFitness, metadata, { progressionStage: nextStage });
    }
  }

  if (query.yearGroup) {
    const yearLabel = query.yearGroup.startsWith("year-")
      ? getYearGroupLabel(query.yearGroup as YearGroupId)
      : query.yearGroup;
    const { previous: prevYear, next: nextYear } = getAdjacentFitnessYear(yearLabel);
    if (prevYear && previous.length === 0) {
      previous = filterByQuery(allFitness, metadata, { ...query, yearGroup: prevYear, progressionStage: undefined });
    }
    if (nextYear && next.length === 0) {
      next = filterByQuery(allFitness, metadata, { ...query, yearGroup: nextYear, progressionStage: undefined });
    }
  }

  if (query.healthComponent || query.trainingMethod) {
    related = filterByQuery(allFitness, metadata, {
      category: "training-principles",
      yearGroup: query.yearGroup,
    }).slice(0, 8);
  }

  const narrative = buildNarrative(query, current, previous, next);

  return { current, previous, next, related, metadata, narrative };
}

function buildNarrative(
  query: FitnessProgressionQuery,
  current: LearningOutcome[],
  previous: LearningOutcome[],
  next: LearningOutcome[]
): string | undefined {
  if (query.fromStage && query.toStage) {
    return `Progression from ${PROGRESSION_STAGE_LABELS[query.fromStage]} (${previous.length} outcomes) to ${PROGRESSION_STAGE_LABELS[query.toStage]} (${current.length} outcomes).`;
  }
  if (query.healthComponent) {
    return `Health related fitness — ${query.healthComponent.replace(/-/g, " ")}: ${current.length} outcomes.`;
  }
  if (query.trainingMethod) {
    return `Training method focus: ${current.length} related outcomes.`;
  }
  if (query.progressionStage) {
    return `${PROGRESSION_STAGE_LABELS[query.progressionStage]}: ${current.length} current, ${previous.length} prior stage, ${next.length} next stage outcomes.`;
  }
  return undefined;
}

export function getRelatedFitnessOutcomes(
  outcomeId: string,
  limit = 8
): LearningOutcome[] {
  const meta = getFitnessProgressionMetadata(outcomeId);
  if (!meta) return [];

  const all = getFitnessCurriculumOutcomes();
  const index = buildFitnessMetadataIndex(all);

  return all
    .filter((outcome) => {
      if (outcome.id === outcomeId) return false;
      const other = index.get(outcome.id);
      if (!other) return false;
      return meta.categories.some((c) => other.categories.includes(c));
    })
    .slice(0, limit);
}

export function getPreviousFitnessConcepts(
  stage: FitnessProgressionStage,
  filters?: Omit<FitnessProgressionQuery, "progressionStage">
): LearningOutcome[] {
  const { previous } = getAdjacentFitnessStage(stage);
  if (!previous) return [];
  return queryFitnessProgression({ ...filters, progressionStage: previous }).current;
}

export function getNextFitnessConcepts(
  stage: FitnessProgressionStage,
  filters?: Omit<FitnessProgressionQuery, "progressionStage">
): LearningOutcome[] {
  const { next } = getAdjacentFitnessStage(stage);
  if (!next) return [];
  return queryFitnessProgression({ ...filters, progressionStage: next }).current;
}

export function getOutcomesByFitnessCategory(
  category: FitnessCategory,
  yearGroup?: string
): LearningOutcome[] {
  const metadata = buildFitnessMetadataIndex(getFitnessCurriculumOutcomes(yearGroup));
  return getFitnessCurriculumOutcomes(yearGroup).filter((outcome) =>
    metadata.get(outcome.id)?.categories.includes(category)
  );
}

export function getOutcomesByHealthComponent(
  component: HealthRelatedComponent,
  yearGroup?: string
): LearningOutcome[] {
  const metadata = buildFitnessMetadataIndex(getFitnessCurriculumOutcomes(yearGroup));
  return getFitnessCurriculumOutcomes(yearGroup).filter((outcome) =>
    metadata.get(outcome.id)?.healthComponents?.includes(component)
  );
}

export function getOutcomesByTrainingMethod(
  method: TrainingMethod,
  yearGroup?: string
): LearningOutcome[] {
  const metadata = buildFitnessMetadataIndex(getFitnessCurriculumOutcomes(yearGroup));
  return getFitnessCurriculumOutcomes(yearGroup).filter((outcome) =>
    metadata.get(outcome.id)?.trainingMethods?.includes(method)
  );
}

export function describeTrainingMethodsToProgrammeDesign(): FitnessProgressionResult {
  return queryFitnessProgression({
    fromStage: "training-methods",
    toStage: "programme-design",
  });
}

export function describeCardiovascularEnduranceProgression(): FitnessProgressionResult {
  return queryFitnessProgression({
    healthComponent: "cardiovascular-endurance",
    category: "health-related-fitness",
  });
}

function buildGapAnalysis(
  categoryCoverage: FitnessCategoryCoverageRow[],
  allFitness: LearningOutcome[],
  metadata: Map<string, FitnessProgressionMetadata>
): FitnessGapItem[] {
  const gaps: FitnessGapItem[] = [];

  for (const row of categoryCoverage.filter((r) => r.status !== "strong")) {
    gaps.push({
      id: `gap-${row.category}`,
      title: row.label,
      status: row.status === "missing" ? "missing" : "thin",
      detail: `Only ${row.outcomeCount} outcomes mapped to ${row.label.toLowerCase()}.`,
    });
  }

  const assessmentCount = allFitness.filter((o) =>
    metadata.get(o.id)?.categories.includes("fitness-testing")
  ).length;
  if (assessmentCount < 3) {
    gaps.push({
      id: "gap-assessment-coverage",
      title: "Assessment coverage",
      status: "thin",
      detail: "Few outcomes explicitly tagged for fitness testing and interpretation.",
    });
  }

  const programmeCount = allFitness.filter(
    (o) => metadata.get(o.id)?.progressionStage === "programme-design"
  ).length;
  if (programmeCount < 2) {
    gaps.push({
      id: "gap-programme-design",
      title: "Programme design progression",
      status: "needs-review",
      detail: "Limited outcomes at the programme design stage — upper secondary autonomy may be under-represented.",
    });
  }

  if (allFitness.filter((o) => o.pathwayId === "fitness-curriculum").length <= 2) {
    gaps.push({
      id: "gap-dedicated-import",
      title: "Dedicated fitness import",
      status: "needs-review",
      detail: "Most fitness content is embedded under Secondary PE — dedicated pathway import still pending.",
    });
  }

  return gaps;
}

export function buildFitnessCurriculumDashboardSummary(): FitnessCurriculumDashboardSummary {
  const allFitness = getFitnessCurriculumOutcomes();
  const metadata = buildFitnessMetadataIndex(allFitness);
  const kbOutcomes = allFitness.filter((o) => o.pathwayId === "fitness-curriculum").length;
  const embeddedOutcomes = allFitness.length - kbOutcomes;

  const categoryCoverage: FitnessCategoryCoverageRow[] = ALL_FITNESS_CATEGORIES.map((category) => {
    const count = allFitness.filter((outcome) =>
      metadata.get(outcome.id)?.categories.includes(category)
    ).length;
    return {
      category,
      label: FITNESS_CATEGORY_LABELS[category],
      outcomeCount: count,
      status: coverageStatus(count, CATEGORY_STRONG_THRESHOLD, CATEGORY_THIN_THRESHOLD),
    };
  });

  const learningDomainCoverage: FitnessDomainCoverageRow[] = (
    Object.keys(LEARNING_DOMAIN_LABELS) as LearningDomain[]
  ).map((domain) => {
    const count = allFitness.filter((outcome) =>
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
  const physicalLiteracyCoverage: FitnessPhysicalLiteracyRow[] = plAttributes.map((attribute) => {
    const count = allFitness.filter((outcome) =>
      metadata.get(outcome.id)?.physicalLiteracy?.includes(attribute)
    ).length;
    return {
      attribute,
      label: PL_ATTRIBUTE_LABELS[attribute],
      outcomeCount: count,
      status: coverageStatus(count, PL_STRONG_THRESHOLD),
    };
  });

  const yearCoverage: FitnessYearCoverageRow[] = FITNESS_YEAR_LABELS.map((yearLabel) => {
    const count = allFitness.filter((outcome) =>
      yearGroupMatchesFilter(outcome.yearGroups, yearLabel)
    ).length;
    return {
      yearLabel,
      outcomeCount: count,
      status: coverageStatus(count, YEAR_STRONG_THRESHOLD),
    };
  });

  const gapAnalysis = buildGapAnalysis(categoryCoverage, allFitness, metadata);
  const thinCategories = categoryCoverage.filter((r) => r.status !== "strong").length;
  const overallStatus =
    allFitness.length >= 30 && thinCategories <= 2
      ? "strong"
      : allFitness.length >= 10
        ? "thin"
        : "needs-review";

  return {
    totalOutcomes: allFitness.length,
    kbOutcomes,
    embeddedOutcomes,
    categoryCoverage,
    learningDomainCoverage,
    physicalLiteracyCoverage,
    yearCoverage,
    gapAnalysis,
    overallStatus,
  };
}
