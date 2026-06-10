/**
 * Curriculum Alignment Engine v1 — sample usage
 *
 * Run: npm run sample:alignment
 */
import {
  alignCurriculum,
  alignCurriculumFromInput,
  findLearningOutcomes,
  findRelevantSkills,
  findRelevantTopics,
  findRelevantValues,
} from "./alignment-engine";

const handballPassing = {
  pathwayId: "secondary-pe" as const,
  topicId: "handball",
  skillIds: ["passing"],
};

console.log("=== Curriculum Alignment Engine v1 ===\n");

console.log("Query: Secondary PE · Handball · Passing\n");

const outcomes = findLearningOutcomes(handballPassing);
console.log("Matching learning outcomes:");
for (const outcome of outcomes) {
  console.log(`  - [${outcome.code}] ${outcome.description}`);
}

const values = findRelevantValues(handballPassing);
console.log("\nMatching values:");
for (const value of values) {
  console.log(`  - [${value.code}] ${value.description}`);
}

const skills = findRelevantSkills(handballPassing);
console.log("\nMatching skills:");
for (const skill of skills) {
  console.log(`  - ${skill.name}`);
}

const topics = findRelevantTopics(handballPassing);
console.log("\nMatching topics:");
for (const topic of topics) {
  console.log(`  - ${topic.name}`);
}

const fromLabels = alignCurriculumFromInput({
  pathway: "Secondary PE",
  topic: "Handball",
  skill: "Passing",
});

console.log("\nLabel-based query result:");
console.log(
  `  ${fromLabels?.learningOutcomes.length ?? 0} outcomes, ` +
    `${fromLabels?.values.length ?? 0} values, ` +
    `${fromLabels?.skills.length ?? 0} skills, ` +
    `${fromLabels?.topics.length ?? 0} topics`
);

const full = alignCurriculum(handballPassing);
const excluded = ["sec-fb-kick-1", "sec-vb-serve-1", "pri-gym-bal-1"];
const leaked = full.learningOutcomes.filter((lo) => excluded.includes(lo.id));

console.log("\nStrictness check:");
console.log(
  leaked.length === 0
    ? "  ✓ No football kicking, volleyball serving, or gymnastics outcomes leaked."
    : `  ✗ Leaked outcomes: ${leaked.map((lo) => lo.code).join(", ")}`
);
