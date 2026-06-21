import { yearGroupMatchesFilter } from "@/lib/year-groups";
import { getPlanningOutcomes } from "../planning/planning-outcomes";
import type { LearningOutcome } from "../types";
import { buildSportMetadataIndex, matchSkillToOutcome } from "./outcome-metadata";
import { isSportPlanningOutcome } from "./planning-bridge";
import {
  ALL_SPORT_IDS,
  formatPedagogyRecommendations,
  getNextSkillsInSport,
  getPreviousSkillsInSport,
  getSkillInSport,
  getSportDefinitionById,
  getSportDefinitionByTopicId,
  SKILL_STRONG_THRESHOLD,
  SPORT_DEFINITIONS,
  SPORT_STRONG_OUTCOME_THRESHOLD,
  SPORT_THIN_OUTCOME_THRESHOLD,
} from "./progression-framework";
import type {
  SportGapItem,
  SportIntelligenceDashboardSummary,
  SportProgressionQuery,
  SportProgressionResult,
  SportSkillCoverageRow,
  SportDepthRow,
  SportId,
} from "./types";

function coverageStatus(count: number, strong: number, thin = 1): "strong" | "thin" | "missing" {
  if (count >= strong) return "strong";
  if (count >= thin) return "thin";
  return "missing";
}

export function getSportOutcomes(query?: SportProgressionQuery): LearningOutcome[] {
  return getPlanningOutcomes().filter((outcome) => {
    if (!isSportPlanningOutcome(outcome, query?.topicId, query?.yearGroup)) return false;
    if (query?.yearGroup && !yearGroupMatchesFilter(outcome.yearGroups, query.yearGroup)) {
      return false;
    }
    if (query?.sportId) {
      const sport = getSportDefinitionById(query.sportId);
      if (!sport || !outcome.topicIds.some((id) => sport.topicIds.includes(id))) return false;
    }
    if (query?.skillId && !matchSkillToOutcome(outcome, query.skillId)) return false;
    return true;
  });
}

export function querySportProgression(query: SportProgressionQuery): SportProgressionResult {
  const sport =
    (query.sportId ? getSportDefinitionById(query.sportId) : null) ??
    (query.topicId ? getSportDefinitionByTopicId(query.topicId) : null);

  const outcomes = getSportOutcomes(query);
  const skill = sport && query.skillId ? getSkillInSport(sport, query.skillId) : null;
  const relatedSkills = sport && query.skillId
    ? getNextSkillsInSport(sport, query.skillId)
    : sport?.skills.slice(0, 3) ?? [];

  let narrative: string | undefined;
  if (sport && skill) {
    const prev = getPreviousSkillsInSport(sport, skill.id);
    narrative = `${sport.label} — ${skill.label}: ${outcomes.length} outcomes. Prior skills: ${prev.map((s) => s.label).join(", ") || "none"}. Next: ${relatedSkills.map((s) => s.label).join(", ") || "performance"}.`;
  } else if (sport) {
    narrative = `${sport.label}: ${outcomes.length} outcomes mapped. Recommended pedagogy: ${formatPedagogyRecommendations(sport.recommendedPedagogy)}.`;
  }

  return {
    sport: sport ?? null,
    skill: skill ?? null,
    outcomes,
    relatedSkills,
    lessonPhases: sport?.lessonPhases ?? [],
    recommendedPedagogy: sport?.recommendedPedagogy ?? [],
    resources: sport?.resources ?? [],
    narrative,
  };
}

export function getSkillProgressionAcrossLessons(
  sportId: SportId,
  skillId: string,
  lessonCount: number
): Array<{ lessonNumber: number; focus: string; phase: string }> {
  const sport = getSportDefinitionById(sportId);
  if (!sport) return [];

  const skill = getSkillInSport(sport, skillId);
  const phases = sport.lessonPhases;
  const focusLabel = skill?.label ?? skillId;

  return Array.from({ length: lessonCount }, (_, index) => {
    const phase = phases[index % phases.length];
    const progressionNote =
      index === 0
        ? `Introduce ${focusLabel}`
        : index < lessonCount - 1
          ? `Develop ${focusLabel} under increasing pressure`
          : `Apply ${focusLabel} in game context`;
    return {
      lessonNumber: index + 1,
      focus: progressionNote,
      phase: phase.label,
    };
  });
}

function buildGapAnalysis(
  sportDepth: SportDepthRow[],
  missingSports: SportId[]
): SportGapItem[] {
  const gaps: SportGapItem[] = [];

  for (const row of sportDepth.filter((r) => r.status !== "strong")) {
    gaps.push({
      id: `gap-sport-${row.sportId}`,
      title: row.label,
      status: row.status === "missing" ? "missing" : "thin",
      detail: `${row.outcomeCount} outcomes, ${row.skillsCovered}/${row.skillCount} skills covered (${row.progressionCompleteness}% progression complete).`,
    });
  }

  if (missingSports.length > 0) {
    gaps.push({
      id: "gap-missing-sports",
      title: "Missing sport intelligence",
      status: "needs-review",
      detail: `No outcomes mapped for: ${missingSports.map((id) => getSportDefinitionById(id)?.label ?? id).join(", ")}.`,
    });
  }

  const thinProgression = sportDepth.filter((r) => r.progressionCompleteness < 50);
  if (thinProgression.length >= 3) {
    gaps.push({
      id: "gap-progression-depth",
      title: "Skill progression completeness",
      status: "needs-review",
      detail: "Several sports have fewer than half of defined skills represented in outcomes.",
    });
  }

  return gaps;
}

export function buildSportIntelligenceDashboardSummary(): SportIntelligenceDashboardSummary {
  const allSportOutcomes = getSportOutcomes();
  const metadata = buildSportMetadataIndex(allSportOutcomes);

  const sportDepth: SportDepthRow[] = SPORT_DEFINITIONS.map((sport) => {
    const outcomes = allSportOutcomes.filter((o) =>
      o.topicIds.some((id) => sport.topicIds.includes(id))
    );
    const skillsCovered = sport.skills.filter((skill) =>
      outcomes.some((o) => matchSkillToOutcome(o, skill.id))
    ).length;
    const progressionCompleteness =
      sport.skills.length > 0
        ? Math.round((skillsCovered / sport.skills.length) * 100)
        : 0;

    return {
      sportId: sport.id,
      label: sport.label,
      outcomeCount: outcomes.length,
      skillCount: sport.skills.length,
      skillsCovered,
      progressionCompleteness,
      status: coverageStatus(
        outcomes.length,
        SPORT_STRONG_OUTCOME_THRESHOLD,
        SPORT_THIN_OUTCOME_THRESHOLD
      ),
    };
  });

  const skillCoverage: SportSkillCoverageRow[] = SPORT_DEFINITIONS.flatMap((sport) =>
    sport.skills.map((skill) => {
      const count = allSportOutcomes.filter(
        (o) =>
          o.topicIds.some((id) => sport.topicIds.includes(id)) &&
          matchSkillToOutcome(o, skill.id)
      ).length;
      return {
        sportId: sport.id,
        sportLabel: sport.label,
        skillId: skill.id,
        skillLabel: skill.label,
        outcomeCount: count,
        status: coverageStatus(count, SKILL_STRONG_THRESHOLD),
      };
    })
  );

  const missingSports = ALL_SPORT_IDS.filter(
    (id) => sportDepth.find((r) => r.sportId === id)?.outcomeCount === 0
  );

  const gapAnalysis = buildGapAnalysis(sportDepth, missingSports);
  const thinSports = sportDepth.filter((r) => r.status !== "strong").length;
  const overallStatus =
    allSportOutcomes.length >= 100 && thinSports <= 3
      ? "strong"
      : allSportOutcomes.length >= 30
        ? "thin"
        : "needs-review";

  return {
    totalSportOutcomes: allSportOutcomes.length,
    sportsTracked: SPORT_DEFINITIONS.length,
    sportDepth,
    skillCoverage,
    gapAnalysis,
    missingSports,
    overallStatus,
  };
}
