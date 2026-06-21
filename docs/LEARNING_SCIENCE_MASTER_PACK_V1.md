# Learning Science Master Pack v1

Evidence-informed learning science intelligence for PE Curriculum Studio.

## Framework overview

`LEARNING_SCIENCE_FRAMEWORK` covers thirteen principles:

1. Retrieval practice
2. Spaced practice
3. Interleaving
4. Varied practice
5. Desirable difficulty
6. Elaboration
7. Reflection
8. Feedback
9. Calibration
10. Transfer
11. Avoiding illusion of knowing
12. Prior knowledge connection
13. Generation before instruction

Each principle includes definition, PE relevance, primary/secondary/coaching examples, mistakes, planning prompts, assessment opportunities, differentiation, and Maltese PE relevance.

Core question the layer answers: **Will pupils remember, retrieve, apply, and transfer this learning later?**

## PE Retrieval Bank

`PE_RETRIEVAL_PROMPT_BANK` categories:

- Movement skills
- Games
- Fitness
- Safety
- Responsibility

Age bands: early years, primary, lower secondary, upper secondary, ALP.

## Helper functions

| Function | Purpose |
|----------|---------|
| `evaluateRetrievalPractice` | Recall opportunities and flags |
| `suggestRetrievalPrompts` | Age-appropriate retrieval questions |
| `evaluateSpacingAcrossScheme` | Revisiting across unit lessons |
| `suggestSpacingPlan` | Next revisit, delayed assessment |
| `evaluateInterleaving` | Mixed vs blocked practice |
| `suggestInterleavedPractice` | Simple interleave options |
| `evaluatePracticeVariation` | Context and constraint variation |
| `evaluateDesirableDifficulty` | Too easy / productive / too hard |
| `evaluateElaboration` | Why/when explanation |
| `suggestElaborationQuestions` | Elaboration question bank |
| `evaluateLearningCalibration` | Self-check vs actual performance |
| `evaluateGenerationOpportunity` | Explore before instruct |
| `evaluateTransferPotential` | Low/moderate/high transfer |
| `evaluateLearningScienceQuality` | Overall 0–100 score |
| `buildSchemeMemoryMap` | Scheme retrieval and spacing map |
| `buildLearningSciencePlanningInsights` | Planning Assistant |
| `buildPedagogyCoachLSMetrics` | Pedagogy Coach block |
| `buildLearningScienceQualityReview` | Quality Checklist |
| `buildSchemeLearningScienceTips` | Scheme Progression Coach |

## Scoring logic

Eight dimensions averaged: retrieval, spacing, interleaving, variation, desirable difficulty, elaboration, calibration, transfer.

| Band | Range |
|------|-------|
| Exceptional | 90–100 |
| Strong | 75–89 |
| Developing | 60–74 |
| Limited | Below 60 |

## App integration points

| Surface | Integration |
|---------|-------------|
| Planning Assistant | Learning Science card (after TPSR, before TFL) |
| Pedagogy Coach | Score, retrieval, difficulty, interleaving, transfer, calibration |
| Quality Checklist | Learning Science Review — 8 checks |
| Scheme Progression Coach | Memory map, spacing, interleaving, delayed assessment |
| Knowledge index | `LEARNING_SCIENCE_MASTER_PE_ENTRY` alongside existing `LEARNING_SCIENCE_ENTRIES` |

## Cross-layer connections

- **Teaching for Learning** — feedback and task design; waiting warnings deduplicated
- **TGfU** — tactical retrieval and game transfer
- **Physical Literacy** — calibration avoids false confidence
- **Primary PE** — FMS with variation and spacing
- **Cooperative Learning** — peer retrieval and group reflection
- **TPSR** — responsibility recall; transfer warnings deduplicated when TPSR already flags

## Examples

- *"Add a retrieval question from last lesson."*
- *"Consider interleaving passing and receiving instead of blocking them separately."*
- *"Add a self check so pupils do not confuse easy success with mastery."*

## Future development opportunities

- Automated scheme spacing calendar from lesson dates
- Per-skill retrieval schedule linked to FMS library
- Pupil-facing retrieval quiz widgets
- Integration with curriculum outcome spirals
- Maltese bilingual retrieval prompt variants
