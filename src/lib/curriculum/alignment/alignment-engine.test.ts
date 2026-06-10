import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  alignCurriculum,
  findLearningOutcomes,
  findRelevantSkills,
  findRelevantTopics,
  findRelevantValues,
  resolveAlignmentQuery,
} from "./alignment-engine";

const handballPassingSecondary = {
  pathwayId: "secondary-pe" as const,
  topicId: "handball",
  skillIds: ["passing"],
};

describe("Curriculum Alignment Engine v1", () => {
  describe("resolveAlignmentQuery", () => {
    it("resolves teacher-friendly labels", () => {
      const query = resolveAlignmentQuery({
        pathway: "Secondary PE",
        topic: "Handball",
        skill: "Passing",
      });

      assert.ok(query);
      assert.equal(query.pathwayId, "secondary-pe");
      assert.equal(query.topicId, "handball");
      assert.deepEqual(query.skillIds, ["passing"]);
    });
  });

  describe("findLearningOutcomes — year group matching", () => {
    it("matches canonical year id against imported Year labels", () => {
      const outcomes = findLearningOutcomes({
        ...handballPassingSecondary,
        yearGroup: "year-9",
      });

      assert.ok(outcomes.length > 0);
    });

    it("matches Form 4 alias when filtering with year-10 id", () => {
      const withYear10 = findLearningOutcomes({
        pathwayId: "secondary-pe",
        topicId: "handball",
        skillIds: ["passing"],
        yearGroup: "year-10",
      });

      const withLegacyForm4 = findLearningOutcomes({
        pathwayId: "secondary-pe",
        topicId: "handball",
        skillIds: ["passing"],
        yearGroup: "Form 4",
      });

      assert.deepEqual(
        withYear10.map((lo) => lo.id).sort(),
        withLegacyForm4.map((lo) => lo.id).sort()
      );
    });
  });

  describe("findLearningOutcomes — strict topic + skill", () => {
    it("returns handball passing outcomes for Handball + Passing", () => {
      const outcomes = findLearningOutcomes(handballPassingSecondary);

      assert.ok(outcomes.length > 0);
      assert.ok(outcomes.every((lo) => lo.topicIds.includes("handball")));
      assert.ok(
        outcomes.every((lo) => lo.skillIds.map((s) => s.toLowerCase()).includes("passing"))
      );
      assert.ok(outcomes.some((lo) => lo.id === "sec-hb-pass-1"));
    });

    it("does NOT return football kicking outcomes", () => {
      const outcomes = findLearningOutcomes(handballPassingSecondary);
      const codes = outcomes.map((lo) => lo.code);

      assert.ok(!codes.some((code) => code.includes("FB.K")));
      assert.ok(!outcomes.some((lo) => lo.id === "sec-fb-kick-1"));
    });

    it("does NOT return volleyball serving outcomes", () => {
      const outcomes = findLearningOutcomes(handballPassingSecondary);

      assert.ok(!outcomes.some((lo) => lo.id === "sec-vb-serve-1"));
      assert.ok(!outcomes.some((lo) => lo.topicIds.includes("volleyball")));
    });

    it("does NOT return gymnastics outcomes", () => {
      const outcomes = findLearningOutcomes(handballPassingSecondary);

      assert.ok(!outcomes.some((lo) => lo.id === "pri-gym-bal-1"));
      assert.ok(!outcomes.some((lo) => lo.topicIds.includes("gymnastics")));
    });

    it("does NOT return basketball passing for wrong pathway/topic", () => {
      const outcomes = findLearningOutcomes(handballPassingSecondary);

      assert.ok(!outcomes.some((lo) => lo.id === "mid-bb-pass-1"));
    });

    it("rejects football skill on handball topic", () => {
      const outcomes = findLearningOutcomes({
        pathwayId: "secondary-pe",
        topicId: "handball",
        skillIds: ["kicking"],
      });

      assert.equal(outcomes.length, 0);
    });
  });

  describe("findRelevantValues", () => {
    it("returns handball values linked to matched outcomes only", () => {
      const values = findRelevantValues(handballPassingSecondary);

      assert.ok(values.length > 0);
      assert.ok(values.every((val) => val.topicIds.includes("handball")));
      assert.ok(!values.some((val) => val.id === "val-fb-respect"));
    });
  });

  describe("findRelevantSkills", () => {
    it("returns passing skill for handball context", () => {
      const skills = findRelevantSkills(handballPassingSecondary);

      assert.deepEqual(
        skills.map((skill) => skill.id),
        ["passing"]
      );
    });

    it("does NOT return kicking skill for handball + passing", () => {
      const skills = findRelevantSkills(handballPassingSecondary);

      assert.ok(!skills.some((skill) => skill.id === "kicking"));
    });
  });

  describe("findRelevantTopics", () => {
    it("returns handball topic when outcomes exist", () => {
      const topics = findRelevantTopics(handballPassingSecondary);

      assert.deepEqual(
        topics.map((topic) => topic.id),
        ["handball"]
      );
    });

    it("returns empty for invalid topic-skill combination", () => {
      const topics = findRelevantTopics({
        pathwayId: "secondary-pe",
        topicId: "handball",
        skillIds: ["kicking"],
      });

      assert.equal(topics.length, 0);
    });
  });

  describe("alignCurriculum", () => {
    it("composes a coherent strict alignment result", () => {
      const result = alignCurriculum(handballPassingSecondary);

      assert.ok(result.learningOutcomes.length > 0);
      assert.ok(result.topics.length === 1);
      assert.equal(result.topics[0].id, "handball");
      assert.ok(result.skills.some((skill) => skill.id === "passing"));
      assert.ok(
        result.learningOutcomes.every((lo) =>
          lo.skillIds.some((skillId) => skillId === "passing")
        )
      );
    });
  });
});
