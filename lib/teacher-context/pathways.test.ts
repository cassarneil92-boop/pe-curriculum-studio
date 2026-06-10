import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getAvailableYearGroupIdsForPathways,
  getRelevantYearGroupIds,
  pruneYearGroupsForPathways,
} from "./index";

describe("pathway year filtering", () => {
  it("unions year groups across selected pathways", () => {
    assert.deepEqual(
      getAvailableYearGroupIdsForPathways(["general-pe", "alp-pe"]),
      ["year-7", "year-8", "year-9", "year-10", "year-11"]
    );
  });

  it("limits PE Option to Years 9–11", () => {
    assert.deepEqual(getAvailableYearGroupIdsForPathways(["pe-option-sec"]), [
      "year-9",
      "year-10",
      "year-11",
    ]);
  });

  it("does not hardcode ALP years globally", () => {
    assert.deepEqual(getAvailableYearGroupIdsForPathways(["general-pe"]), [
      "year-7",
      "year-8",
      "year-9",
      "year-10",
      "year-11",
    ]);
    assert.deepEqual(getAvailableYearGroupIdsForPathways(["alp-pe"]), [
      "year-10",
      "year-11",
    ]);
  });

  it("includes Early Years and Primary ranges separately", () => {
    assert.deepEqual(getAvailableYearGroupIdsForPathways(["early-years-pe"]), [
      "year-1",
      "year-2",
    ]);
    assert.deepEqual(getAvailableYearGroupIdsForPathways(["primary-pe"]), [
      "year-1",
      "year-2",
      "year-3",
      "year-4",
      "year-5",
      "year-6",
    ]);
  });

  it("prunes invalid years when pathways change", () => {
    assert.deepEqual(
      pruneYearGroupsForPathways(["alp-pe"], ["year-7", "year-10"]),
      ["year-10"]
    );
  });

  it("filters teacher years to pathway-valid ids in intelligent mode", () => {
    assert.deepEqual(
      getRelevantYearGroupIds(
        ["general-pe", "pe-option-sec"],
        ["year-7", "year-9", "year-10"]
      ),
      ["year-7", "year-9", "year-10"]
    );
    assert.deepEqual(
      getRelevantYearGroupIds(["pe-option-sec"], ["year-7", "year-9", "year-10"]),
      ["year-9", "year-10"]
    );
  });
});
