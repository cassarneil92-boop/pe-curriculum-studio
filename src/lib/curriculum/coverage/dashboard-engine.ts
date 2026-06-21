import importedTopicsData from "../data/imported-topics.json";
import { LEARNING_OUTCOMES } from "../learning-outcomes";
import type { ImportedLearningOutcomeRecord } from "../import/types";
import { IMPORTED_LEARNING_OUTCOMES } from "./coverage-engine";
import { PATHWAYS } from "../pathways";
import { getPlanningOutcomeCounts, getPlanningOutcomes } from "../planning/planning-outcomes";
import { GENERIC_TOPIC_IDS, getPlanningTopicDisplayName } from "../planning/topic-labels";
import type { PathwayId, LearningOutcome } from "../types";
import type {
  CatalogueCoverageStatus,
  CatalogueGapItem,
  CurriculumCoverageDashboard,
  HeatmapCell,
  MetadataGapSummary,
  PathwayCoverageRow,
  SportCoverageRow,
  TopicCoverageRow,
  YearGroupCoverageRow,
} from "./types";
import { buildPrimaryPEDashboardSummary } from "../primary-pe/progression-engine";
import type { PrimaryPEDashboardSummary } from "../primary-pe/types";

const YEAR_GROUP_ORDER = [
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
  "Year 7",
  "Year 8",
  "Year 9",
  "Year 10",
  "Year 11",
  "Gifted & Talented",
] as const;

/** Sports that rely on fallback chains when no direct outcomes exist. */
const FALLBACK_SPORT_IDS = new Set([
  "volleyball",
  "badminton",
  "pickleball",
  "tchoukball",
  "hockey",
  "rugby",
  "touch-rugby",
  "netball",
  "handball",
  "basketball",
  "football",
  "gymnastics",
  "dance",
  "athletics",
]);

const TOPIC_FALLBACK_CHAINS: Record<string, string[]> = {
  volleyball: ["net-games", "games", "fundamentals"],
  badminton: ["net-games", "games", "fundamentals"],
  pickleball: ["net-games", "games"],
  tchoukball: ["net-games", "games"],
  hockey: ["invasion-games", "games"],
  rugby: ["invasion-games", "games"],
  "touch-rugby": ["invasion-games", "games"],
  netball: ["net-games", "games"],
  handball: ["invasion-games", "games"],
  basketball: ["invasion-games", "games"],
  football: ["invasion-games", "games"],
  gymnastics: ["fundamentals", "games"],
  dance: ["fundamentals", "games"],
  athletics: ["fundamentals", "games"],
};

const THIN_PATHWAY_THRESHOLD = 25;
const STRONG_PATHWAY_THRESHOLD = 50;
const STRONG_CELL_THRESHOLD = 15;
const THIN_CELL_THRESHOLD = 1;

function countByPathway(outcomes: { pathwayId: string }[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const o of outcomes) {
    map.set(o.pathwayId, (map.get(o.pathwayId) ?? 0) + 1);
  }
  return map;
}

function countByYearGroup(outcomes: { yearGroups?: string[] }[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const o of outcomes) {
    for (const yg of o.yearGroups ?? []) {
      map.set(yg, (map.get(yg) ?? 0) + 1);
    }
  }
  return map;
}

function countByTopicPlanning(outcomes: LearningOutcome[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const o of outcomes) {
    for (const topicId of o.topicIds ?? []) {
      const key = topicId.trim().toLowerCase();
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  return map;
}

function countByTopicImported(outcomes: ImportedLearningOutcomeRecord[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const o of outcomes) {
    const topicIds = new Set<string>();
    if (o.topicId?.trim()) topicIds.add(o.topicId.trim().toLowerCase());
    for (const topic of o.topics ?? []) {
      if (topic?.trim()) topicIds.add(topic.trim().toLowerCase());
    }
    for (const topicId of topicIds) {
      map.set(topicId, (map.get(topicId) ?? 0) + 1);
    }
  }
  return map;
}

function pathwayStatus(
  pathwayId: PathwayId,
  rawCount: number,
  planningCount: number,
  kbCount: number,
  missingYearGroupsInPathway: number,
): { status: CatalogueCoverageStatus; note?: string } {
  if (rawCount === 0 && planningCount <= kbCount) {
    if (pathwayId === "primary-pe") {
      const primarySummary = buildPrimaryPEDashboardSummary();
      if (primarySummary.totalOutcomes > kbCount) {
        return {
          status: primarySummary.overallStatus === "strong" ? "strong" : "thin",
          note: `${primarySummary.totalOutcomes} outcomes available via embedded fundamentals (Years 1–6) plus KB samples.`,
        };
      }
      return {
        status: "needs-review",
        note: "No direct import — primary content often appears under Secondary PE / Fundamentals.",
      };
    }
    if (pathwayId === "fitness-curriculum") {
      return {
        status: "needs-review",
        note: "No dedicated import — fitness outcomes often sit under Secondary PE topic fitness.",
      };
    }
    if (pathwayId === "middle-school-pe") {
      return { status: "absent", note: "No imported outcomes for this pathway yet." };
    }
    return { status: "absent", note: "No imported outcomes for this pathway." };
  }

  if (planningCount < THIN_PATHWAY_THRESHOLD) {
    return {
      status: "thin",
      note:
        pathwayId === "pe-option-sec"
          ? "Only a small set of SEC option outcomes imported so far."
          : "Fewer outcomes than expected for full pathway coverage.",
    };
  }

  if (
    (pathwayId === "alp-pe" || pathwayId === "alp-sports-vocational") &&
    missingYearGroupsInPathway > 0
  ) {
    return {
      status: "needs-review",
      note: "Outcomes imported but year groups are not assigned.",
    };
  }

  if (planningCount >= STRONG_PATHWAY_THRESHOLD) {
    return { status: "strong" };
  }

  return { status: "thin" };
}

function cellStatus(count: number): CatalogueCoverageStatus {
  if (count >= STRONG_CELL_THRESHOLD) return "strong";
  if (count >= THIN_CELL_THRESHOLD) return "thin";
  return "missing";
}

function yearGroupStatus(count: number): CatalogueCoverageStatus {
  if (count >= 30) return "strong";
  if (count >= 5) return "thin";
  return "missing";
}

function topicStatus(count: number): CatalogueCoverageStatus {
  if (count >= 10) return "strong";
  if (count >= 1) return "thin";
  return "missing";
}

function sportStatus(
  topicId: string,
  planningCount: number,
): { status: CatalogueCoverageStatus; fallbackChain?: string[] } {
  const chain = TOPIC_FALLBACK_CHAINS[topicId];
  if (planningCount === 0 && FALLBACK_SPORT_IDS.has(topicId)) {
    return { status: "fallback-only", fallbackChain: chain };
  }
  if (planningCount >= 15) return { status: "strong" };
  if (planningCount >= 1) return { status: "thin" };
  return { status: "missing" };
}

function buildCatalogueGaps(
  pathwayRows: PathwayCoverageRow[],
  fitnessTopicCount: number,
): CatalogueGapItem[] {
  const gaps: CatalogueGapItem[] = [];

  const primary = pathwayRows.find((p) => p.pathwayId === "primary-pe");
  if (primary) {
    gaps.push({
      id: "gap-primary-pe",
      title: "Primary PE",
      status: primary.status,
      detail:
        "No proper import file — the catalogue relies mainly on KB samples and outcomes tagged under Secondary PE / Fundamentals.",
    });
  }

  const fitness = pathwayRows.find((p) => p.pathwayId === "fitness-curriculum");
  if (fitness) {
    gaps.push({
      id: "gap-fitness-curriculum",
      title: "Fitness Curriculum",
      status: fitness.status,
      detail: `No successful fitness import — about ${fitnessTopicCount} fitness-topic outcomes appear under Secondary PE instead.`,
    });
  }

  const secOption = pathwayRows.find((p) => p.pathwayId === "pe-option-sec");
  if (secOption) {
    gaps.push({
      id: "gap-pe-option-sec",
      title: "PE Option SEC",
      status: secOption.status,
      detail: `Only ${secOption.planningCount} outcomes in the planning catalogue — pathway remains thin.`,
    });
  }

  const alpPe = pathwayRows.find((p) => p.pathwayId === "alp-pe");
  const alpSports = pathwayRows.find((p) => p.pathwayId === "alp-sports-vocational");
  if (alpPe || alpSports) {
    gaps.push({
      id: "gap-alp-year-groups",
      title: "ALP pathways",
      status: "needs-review",
      detail: `ALP PE (${alpPe?.planningCount ?? 0} outcomes) and ALP Sports Vocational (${alpSports?.planningCount ?? 0} outcomes) lack year group metadata.`,
    });
  }

  return gaps;
}

function countMissingMetadata(outcomes: ImportedLearningOutcomeRecord[]): MetadataGapSummary {
  let missingYearGroups = 0;
  let missingSkills = 0;
  let missingValues = 0;

  for (const o of outcomes) {
    if (!o.yearGroups?.length) missingYearGroups += 1;
    const hasSkills = (o.skills?.length ?? 0) > 0 || (o.skillIds?.length ?? 0) > 0;
    if (!hasSkills) missingSkills += 1;
    if (!o.values?.length) missingValues += 1;
  }

  return {
    missingYearGroups,
    missingSkills,
    missingValues,
    totalOutcomes: outcomes.length,
  };
}

function countMissingYearGroupsInPathway(
  outcomes: ImportedLearningOutcomeRecord[],
  pathwayId: PathwayId,
): number {
  return outcomes.filter((o) => o.pathwayId === pathwayId && !o.yearGroups?.length).length;
}

export function buildCurriculumCoverageDashboard(): CurriculumCoverageDashboard {
  const rawOutcomes = IMPORTED_LEARNING_OUTCOMES;
  const planningOutcomes = getPlanningOutcomes();
  const kbOutcomes = LEARNING_OUTCOMES;
  const counts = getPlanningOutcomeCounts();

  const rawByPathway = countByPathway(rawOutcomes);
  const planningByPathway = countByPathway(planningOutcomes);
  const kbByPathway = countByPathway(kbOutcomes);
  const rawByYear = countByYearGroup(rawOutcomes);
  const planningByYear = countByYearGroup(planningOutcomes);
  const rawByTopic = countByTopicImported(rawOutcomes);
  const planningByTopic = countByTopicPlanning(planningOutcomes);

  const fitnessTopicCount = planningByTopic.get("fitness") ?? 0;

  const pathwayCoverage: PathwayCoverageRow[] = PATHWAYS.map((pathway) => {
    const rawCount = rawByPathway.get(pathway.id) ?? 0;
    const planningCount = planningByPathway.get(pathway.id) ?? 0;
    const kbCount = kbByPathway.get(pathway.id) ?? 0;
    const missingYg = countMissingYearGroupsInPathway(rawOutcomes, pathway.id);
    const { status, note } = pathwayStatus(pathway.id, rawCount, planningCount, kbCount, missingYg);
    return {
      pathwayId: pathway.id,
      label: pathway.label,
      rawCount,
      planningCount,
      kbCount,
      status,
      note,
    };
  });

  const yearGroupCoverage: YearGroupCoverageRow[] = YEAR_GROUP_ORDER.map((yearGroup) => {
    const rawCount = rawByYear.get(yearGroup) ?? 0;
    const planningCount = planningByYear.get(yearGroup) ?? 0;
    return {
      yearGroup,
      label: yearGroup,
      rawCount,
      planningCount,
      status: yearGroupStatus(planningCount),
    };
  });

  const heatmapPathways = PATHWAYS.filter(
    (p) => (planningByPathway.get(p.id) ?? 0) > 0 || (rawByPathway.get(p.id) ?? 0) > 0,
  );

  const pathwayYearHeatmap: HeatmapCell[] = [];
  for (const pathway of heatmapPathways) {
    for (const yearGroup of YEAR_GROUP_ORDER) {
      const count = rawOutcomes.filter(
        (o) =>
          o.pathwayId === pathway.id &&
          (o.yearGroups ?? []).some((yg) => yg === yearGroup),
      ).length;
      pathwayYearHeatmap.push({
        id: `${pathway.id}::${yearGroup}`,
        rowLabel: pathway.label,
        columnLabel: yearGroup.replace("Year ", "Y"),
        count,
        status: cellStatus(count),
      });
    }
  }

  const importedTopicIds = (importedTopicsData as { id: string }[]).map((t) => t.id);
  const topicCoverage: TopicCoverageRow[] = importedTopicIds.map((topicId) => {
    const key = topicId.toLowerCase();
    const rawCount = rawByTopic.get(key) ?? 0;
    const planningCount = planningByTopic.get(key) ?? 0;
    return {
      topicId,
      label: getPlanningTopicDisplayName(topicId),
      rawCount,
      planningCount,
      status: topicStatus(planningCount),
    };
  });

  const sportCoverage: SportCoverageRow[] = importedTopicIds
    .filter((id) => !GENERIC_TOPIC_IDS.has(id.toLowerCase()))
    .filter((id) => {
      const lower = id.toLowerCase();
      return (
        FALLBACK_SPORT_IDS.has(lower) ||
        ["archery", "martial-arts", "mini-tennis", "orienteering", "swimming-aquatics", "team-building", "trekking", "ultimate-frisbee"].includes(
          lower,
        )
      );
    })
    .map((topicId) => {
      const planningCount = planningByTopic.get(topicId.toLowerCase()) ?? 0;
      const { status, fallbackChain } = sportStatus(topicId.toLowerCase(), planningCount);
      return {
        topicId,
        label: getPlanningTopicDisplayName(topicId),
        planningCount,
        status,
        fallbackChain,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return {
    generatedAt: new Date().toISOString(),
    layerTotals: {
      rawImport: rawOutcomes.length,
      planningCatalogue: counts.planningTotal,
      kbStrictAlignment: kbOutcomes.length,
    },
    pathwayCoverage,
    yearGroupCoverage,
    pathwayYearHeatmap,
    topicCoverage,
    sportCoverage,
    metadataGaps: countMissingMetadata(rawOutcomes),
    catalogueGaps: buildCatalogueGaps(pathwayCoverage, fitnessTopicCount),
    primaryPE: buildPrimaryPEDashboardSummary(),
  };
}
