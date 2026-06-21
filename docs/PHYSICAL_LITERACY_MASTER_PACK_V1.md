# Physical Literacy Master Pack V1

## Overview

Phase 4B adds a **Physical Literacy Intelligence Layer** to PE Curriculum Studio. The system evaluates whether lessons develop physically literate individuals — not only whether learners can perform.

All content is original and inspired by accepted physical literacy principles. No copyrighted text, book quotes, or reproduced material.

## Framework

`PHYSICAL_LITERACY_FRAMEWORK` covers five core attributes:

| Attribute | Focus |
|-----------|--------|
| Motivation | Enjoyment, relevance, autonomy, challenge |
| Confidence | Success, safety, willingness to attempt |
| Physical Competence | Control, efficiency, adaptability |
| Knowledge | Rules, health, safe participation |
| Understanding | Why movement matters, self-regulation, transfer |

Each attribute includes description, why it matters, examples, lesson implications, assessment opportunities, and common mistakes.

## Movement Experience Framework

Nine movement categories: locomotion, balance, coordination, object control, rhythm and expression, outdoor and adventurous activity, games, health and fitness, movement exploration.

Each includes developmental value, confidence/competence contribution, and planning prompts.

## Helper functions

| Function | Purpose |
|----------|---------|
| `evaluatePhysicalLiteracyProfile(text)` | Five dimension scores 0–100, strengths, weaknesses, recommendations |
| `evaluateConfidenceBuilding(text)` | Success, differentiation, feedback; flags comparison/elimination |
| `evaluateMotivationSupport(text)` | Autonomy, enjoyment, engagement flags |
| `evaluatePhysicalLiteracyInclusion(text)` | Access, SEND, multiple success routes |
| `evaluateLifelongParticipationPotential(text)` | Low / Moderate / High with explanation |
| `evaluatePerformanceBias(text)` | Anti-elitism check; alternatives for elimination/competition |
| `evaluatePhysicalLiteracyQuality(text)` | Composite 0–100 with band (Exceptional → Limited) |
| `evaluateCurriculumBalance(lessons)` | Physical, cognitive, social, affective balance for schemes |
| `getPhysicalLiteracyQuestions(ageBand)` | Age-appropriate question bank |
| `buildPhysicalLiteracyPlanningInsights(...)` | 3–5 Planning Assistant recommendations |
| `buildPedagogyCoachPhysicalLiteracyMetrics(lesson)` | Compact coach scores |
| `buildPhysicalLiteracyQualityReview(lesson)` | Full quality review for checklist |
| `buildSchemePhysicalLiteracyTips(scheme)` | Scheme progression PL guidance |

## Scoring bands

| Score | Band |
|-------|------|
| 90–100 | Exceptional |
| 75–89 | Strong |
| 60–74 | Developing |
| Below 60 | Limited |

## Integration points

- **Planning Assistant** — Physical literacy insights on specialist cards (confidence, motivation, inclusion, lifelong participation)
- **Pedagogy Coach** — Physical Literacy Score with strongest/weakest dimension and improvement tip
- **Quality Checklist** — Physical Literacy Review section with five dimension scores and warnings
- **Scheme Progression Coach** — Confidence, competence, motivation, inclusion, lifelong participation tips
- **PE Knowledge Index** — `physical-literacy-master` entry with relevance scoring

## Files

| File | Role |
|------|------|
| `src/lib/peKnowledge/physicalLiteracyMaster.ts` | Framework, movement categories, question bank, master entry |
| `src/lib/peKnowledge/physicalLiteracyAudits.ts` | Evaluation engines and integration helpers |
| `src/lib/peKnowledge/coaching.ts` | Wired into all coaches and checklist |
| `src/lib/peKnowledge/peKnowledgeIndex.ts` | Exports and knowledge base registration |

## Future expansion opportunities

- Pupil self-assessment widgets for confidence and motivation
- Scheme-level PL dashboard across a year group
- Link PL dimensions to Malta curriculum outcome codes
- Movement experience tagging on lesson form
- Longitudinal tracking of confidence shifts across units
- Integration with SEND-specific inclusion prompts from inclusion knowledge base
