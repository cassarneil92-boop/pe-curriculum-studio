import { getYearGroupLabel, yearGroupMatchesFilter } from "@/lib/year-groups";
import type { YearGroupId } from "@/lib/year-groups";
import { getPlanningOutcomes } from "../planning/planning-outcomes";
import type { LearningOutcome } from "../types";
import { buildPrimaryMetadataIndex, buildPrimaryProgressionMetadata } from "./outcome-metadata";
import { isPrimaryPlanningOutcome } from "./planning-bridge";
import {
  getAdjacentYearLabels,
  getStrandLabel,
  LEARNING_DOMAIN_LABELS,
  PL_ATTRIBUTE_LABELS,
  PRIMARY_PROGRESSION_STRANDS,
  PRIMARY_YEAR_LABELS,
  STRAND_LABELS,
  STRAND_STRONG_THRESHOLD,
  STRAND_THIN_THRESHOLD,
  DOMAIN_STRONG_THRESHOLD,
  PL_STRONG_THRESHOLD,
  YEAR_STRONG_THRESHOLD,
} from "./progression-framework";
import type {
  LearningDomain,
  PhysicalLiteracyAttribute,
  PrimaryDomainCoverageRow,
  PrimaryPEDashboardSummary,
  PrimaryPhysicalLiteracyRow,
  PrimaryProgressionMetadata,
  PrimaryProgressionQuery,
  PrimaryProgressionResult,
  PrimaryProgressionStrand,
  PrimaryStrandCoverageRow,
  PrimaryYearCoverageRow,
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

export function getPrimaryPEOutcomes(yearGroup?: string): LearningOutcome[] {
  return getPlanningOutcomes().filter((outcome) => isPrimaryPlanningOutcome(outcome, yearGroup));
}

export function getPrimaryProgressionMetadata(
  outcomeId: string
): PrimaryProgressionMetadata | undefined {
  const outcome = getPlanningOutcomes().find((o) => o.id === outcomeId);
  if (!outcome) return undefined;
  return buildPrimaryProgressionMetadata(outcome) ?? undefined;
}

function filterByQuery(
  outcomes: LearningOutcome[],
  metadata: Map<string, PrimaryProgressionMetadata>,
  query: PrimaryProgressionQuery
): LearningOutcome[] {
  return outcomes.filter((outcome) => {
    const meta = metadata.get(outcome.id);
    if (!meta) return false;

    if (query.yearGroup && !yearGroupMatchesFilter(outcome.yearGroups, query.yearGroup)) {
      return false;
    }
    if (query.topicId) {
      const key = query.topicId.toLowerCase();
      if (!outcome.topicIds.some((id) => id.toLowerCase() === key)) return false;
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
    if (query.strand && !meta.strands.includes(query.strand)) return false;
    if (query.learningDomain && !meta.learningDomains.includes(query.learningDomain)) return false;
    if (
      query.physicalLiteracy &&
      !meta.physicalLiteracy?.includes(query.physicalLiteracy)
    ) {
      return false;
    }
    return true;
  });
}

function yearLabelFromId(yearGroupId: YearGroupId): string {
  return getYearGroupLabel(yearGroupId);
}

export function queryPrimaryProgression(query: PrimaryProgressionQuery): PrimaryProgressionResult {
  const allPrimary = getPrimaryPEOutcomes();
  const metadata = buildPrimaryMetadataIndex(allPrimary);

  let current = filterByQuery(allPrimary, metadata, query);

  let previous: LearningOutcome[] = [];
  let next: LearningOutcome[] = [];

  const anchorYear =
    query.fromYearGroup ??
    query.yearGroup ??
    (current[0]?.yearGroups?.[0] ?? undefined);

  if (anchorYear) {
    const yearLabel = anchorYear.startsWith("year-")
      ? yearLabelFromId(anchorYear as YearGroupId)
      : anchorYear;
    const { previous: prevLabel, next: nextLabel } = getAdjacentYearLabels(yearLabel);

    if (prevLabel) {
      previous = filterByQuery(allPrimary, metadata, {
        ...query,
        yearGroup: prevLabel,
        fromYearGroup: undefined,
        toYearGroup: undefined,
      });
    }
    if (nextLabel) {
      next = filterByQuery(allPrimary, metadata, {
        ...query,
        yearGroup: nextLabel,
        fromYearGroup: undefined,
        toYearGroup: undefined,
      });
    }
  }

  if (query.fromTopicId && query.toTopicId && query.fromYearGroup && query.toYearGroup) {
    previous = filterByQuery(allPrimary, metadata, {
      topicId: query.fromTopicId,
      yearGroup: query.fromYearGroup,
      skillHint: query.skillHint,
    });
    current = filterByQuery(allPrimary, metadata, {
      topicId: query.toTopicId,
      yearGroup: query.toYearGroup,
      skillHint: query.skillHint,
    });
    next = [];
  }

  const narrative = buildProgressionNarrative(query, current, previous, next);

  return { current, previous, next, metadata, narrative };
}

function buildProgressionNarrative(
  query: PrimaryProgressionQuery,
  current: LearningOutcome[],
  previous: LearningOutcome[],
  next: LearningOutcome[]
): string | undefined {
  if (query.fromTopicId && query.toTopicId) {
    const fromLabel = query.fromTopicId.replace(/-/g, " ");
    const toLabel = query.toTopicId.replace(/-/g, " ");
    return `Progression from ${query.fromYearGroup ?? "earlier years"} ${fromLabel} (${previous.length} outcomes) toward ${query.toYearGroup ?? "later years"} ${toLabel} (${current.length} outcomes).`;
  }
  if (query.strand) {
    return `${getStrandLabel(query.strand)}: ${current.length} current, ${previous.length} prior-year, ${next.length} next-year outcomes.`;
  }
  if (query.physicalLiteracy) {
    return `${PL_ATTRIBUTE_LABELS[query.physicalLiteracy]} development: ${current.length} supporting outcomes.`;
  }
  return undefined;
}

export function getOutcomesByStrand(
  strand: PrimaryProgressionStrand,
  yearGroup?: string
): LearningOutcome[] {
  const metadata = buildPrimaryMetadataIndex(getPrimaryPEOutcomes(yearGroup));
  return getPrimaryPEOutcomes(yearGroup).filter((outcome) =>
    metadata.get(outcome.id)?.strands.includes(strand)
  );
}

export function getOutcomesByLearningDomain(
  domain: LearningDomain,
  yearGroup?: string
): LearningOutcome[] {
  const metadata = buildPrimaryMetadataIndex(getPrimaryPEOutcomes(yearGroup));
  return getPrimaryPEOutcomes(yearGroup).filter((outcome) =>
    metadata.get(outcome.id)?.learningDomains.includes(domain)
  );
}

export function getOutcomesByPhysicalLiteracy(
  attribute: PhysicalLiteracyAttribute,
  yearGroup?: string
): LearningOutcome[] {
  const metadata = buildPrimaryMetadataIndex(getPrimaryPEOutcomes(yearGroup));
  return getPrimaryPEOutcomes(yearGroup).filter((outcome) =>
    metadata.get(outcome.id)?.physicalLiteracy?.includes(attribute)
  );
}

export function getPreviousYearOutcomes(
  yearGroup: string,
  filters?: Omit<PrimaryProgressionQuery, "yearGroup" | "fromYearGroup" | "toYearGroup">
): LearningOutcome[] {
  const yearLabel = yearGroup.startsWith("year-")
    ? yearLabelFromId(yearGroup as YearGroupId)
    : yearGroup;
  const { previous } = getAdjacentYearLabels(yearLabel);
  if (!previous) return [];
  return queryPrimaryProgression({ ...filters, yearGroup: previous }).current;
}

export function getNextYearOutcomes(
  yearGroup: string,
  filters?: Omit<PrimaryProgressionQuery, "yearGroup" | "fromYearGroup" | "toYearGroup">
): LearningOutcome[] {
  const yearLabel = yearGroup.startsWith("year-")
    ? yearLabelFromId(yearGroup as YearGroupId)
    : yearGroup;
  const { next } = getAdjacentYearLabels(yearLabel);
  if (!next) return [];
  return queryPrimaryProgression({ ...filters, yearGroup: next }).current;
}

export function buildPrimaryPEDashboardSummary(): PrimaryPEDashboardSummary {
  const allPrimary = getPrimaryPEOutcomes();
  const metadata = buildPrimaryMetadataIndex(allPrimary);

  const kbOutcomes = allPrimary.filter((o) => o.pathwayId === "primary-pe").length;
  const embeddedOutcomes = allPrimary.length - kbOutcomes;

  const progressionCompleteness: PrimaryStrandCoverageRow[] = PRIMARY_PROGRESSION_STRANDS.map(
    (strandDef) => {
      const count = allPrimary.filter((outcome) =>
        metadata.get(outcome.id)?.strands.includes(strandDef.id)
      ).length;
      return {
        strand: strandDef.id,
        label: strandDef.label,
        outcomeCount: count,
        status: coverageStatus(count, STRAND_STRONG_THRESHOLD, STRAND_THIN_THRESHOLD),
      };
    }
  );

  const learningDomainCoverage: PrimaryDomainCoverageRow[] = (
    Object.keys(LEARNING_DOMAIN_LABELS) as LearningDomain[]
  ).map((domain) => {
    const count = allPrimary.filter((outcome) =>
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
  const physicalLiteracyCoverage: PrimaryPhysicalLiteracyRow[] = plAttributes.map((attribute) => {
    const count = allPrimary.filter((outcome) =>
      metadata.get(outcome.id)?.physicalLiteracy?.includes(attribute)
    ).length;
    return {
      attribute,
      label: PL_ATTRIBUTE_LABELS[attribute],
      outcomeCount: count,
      status: coverageStatus(count, PL_STRONG_THRESHOLD),
    };
  });

  const yearCoverage: PrimaryYearCoverageRow[] = PRIMARY_YEAR_LABELS.map((yearLabel) => {
    const count = allPrimary.filter((outcome) =>
      yearGroupMatchesFilter(outcome.yearGroups, yearLabel)
    ).length;
    return {
      yearLabel,
      outcomeCount: count,
      status: coverageStatus(count, YEAR_STRONG_THRESHOLD),
    };
  });

  const thinStrands = progressionCompleteness.filter((row) => row.status !== "strong").length;
  const overallStatus =
    allPrimary.length >= 40 && thinStrands <= 1
      ? "strong"
      : allPrimary.length >= 15
        ? "thin"
        : "needs-review";

  return {
    totalOutcomes: allPrimary.length,
    kbOutcomes,
    embeddedOutcomes,
    progressionCompleteness,
    learningDomainCoverage,
    physicalLiteracyCoverage,
    yearCoverage,
    overallStatus,
  };
}

export function describeThrowingToInvasionProgression(): PrimaryProgressionResult {
  return queryPrimaryProgression({
    fromYearGroup: "Year 2",
    fromTopicId: "fundamentals",
    skillHint: "throw",
    toYearGroup: "Year 4",
    toTopicId: "invasion-games",
  });
}
