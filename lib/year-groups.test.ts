import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getYearGroupLabel,
  normalizeYearGroupForMatching,
  toImportedYearGroupLabels,
  yearGroupMatchesFilter,
} from "./year-groups";

describe("year group helpers", () => {
  it("maps canonical ids to Malta display labels", () => {
    assert.equal(getYearGroupLabel("year-9"), "Year 9 / Form 3");
    assert.equal(getYearGroupLabel("year-10"), "Year 10 / Form 4");
  });

  it("normalizes canonical ids to imported labels", () => {
    assert.deepEqual(toImportedYearGroupLabels("year-10"), ["Year 10", "Form 4"]);
    assert.deepEqual(normalizeYearGroupForMatching("year-9"), ["Year 9", "Form 3"]);
  });

  it("normalizes legacy labels for matching", () => {
    assert.deepEqual(normalizeYearGroupForMatching("Form 4"), ["Year 10", "Form 4"]);
    assert.deepEqual(normalizeYearGroupForMatching("Year 11"), ["Year 11", "Form 5"]);
  });

  it("matches imported outcome labels against canonical filter ids", () => {
    assert.equal(
      yearGroupMatchesFilter(["Year 9", "Year 10", "Form 4"], "year-10"),
      true
    );
    assert.equal(yearGroupMatchesFilter(["Year 7", "Year 8"], "year-10"), false);
    assert.equal(yearGroupMatchesFilter(["KG1"], "year-1"), true);
  });
});
