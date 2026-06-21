# Teaching for Learning Master Pack V1

## Purpose

Phase 4C adds a **Teaching for Learning intelligence layer** to PE Curriculum Studio. The app evaluates whether lessons are valid learning experiences — not only what activity is planned.

Questions the layer helps answer:

- Is this a valid learning experience?
- Is the task designed well?
- Is progression clear (extension → refinement → application)?
- Is feedback useful and specific?
- Is assessment part of instruction?
- Is the teacher helping pupils move from activity to learning?

All content is original. No copyrighted text, book quotes, or reproduced tables.

## Framework

`TEACHING_FOR_LEARNING_FRAMEWORK` covers 14 areas:

1. Goal-oriented teaching
2. Learning experience quality
3. Movement task design
4. Task presentation
5. Content development (extension / refinement / application)
6. Practice time and success rate
7. Teacher observation
8. Feedback quality
9. Learning environment
10. Teaching strategies
11. Motivation and inclusion
12. Planning and unit design
13. Assessment in instruction
14. Teacher reflection

Each area includes description, why it matters in PE, teacher questions, planning implications, common mistakes, fixes, assessment implications, age phase relevance, and Malta PE context notes.

## Helper functions

| Function | Purpose |
|----------|---------|
| `evaluateLearningExperienceQuality(ctx)` | 0–100 score, band, strengths, weaknesses, flags |
| `evaluateMovementTaskDesign(ctx)` | Missing task elements, organisation alternatives |
| `buildMovementTaskSuggestion(ctx)` | Full task template |
| `classifyTaskDevelopmentType(text)` | extension / refinement / application / unclear |
| `suggestNextContentDevelopmentStep(ctx)` | Next E/R/A step |
| `evaluateTaskPresentationQuality(ctx)` | Presentation score, cues, wording |
| `generateLearningCues(ctx)` | Short age-appropriate cues |
| `evaluatePracticeOpportunity(ctx)` | Practice score, bottlenecks, fixes |
| `evaluateFeedbackQuality(ctx)` | Feedback quality audit |
| `generateFeedbackPrompts(ctx)` | Specific feedback stems |
| `generateTeacherObservationFocus(ctx)` | What to watch for |
| `evaluatePlanningCoherence(ctx)` | WALT/WILF/activity alignment |
| `suggestInstructionalAssessment(ctx)` | Practical in-lesson assessment ideas |
| `suggestTeachingStrategy(ctx)` | Strategy with organisation and role |
| `evaluateLearningEnvironment(ctx)` | Routines, safety, inclusion risks |
| `generateTeacherReflectionPrompts(ctx)` | Post-lesson reflection |
| `buildTeachingForLearningPlanningInsights(...)` | Planning Assistant cards |
| `buildPedagogyCoachTFLMetrics(lesson)` | Compact Pedagogy Coach block |
| `buildTeachingForLearningQualityReview(lesson)` | Quality checklist review |
| `buildSchemeTeachingForLearningTips(scheme)` | Unit coherence and E/R/A sequence |

## Scoring bands

| Score | Band |
|-------|------|
| 90–100 | Exceptional |
| 75–89 | Strong |
| 60–74 | Developing |
| Below 60 | Limited |

## Integration points

| Surface | What appears |
|---------|----------------|
| Planning Assistant | Teaching for Learning insight card with 3–5 concise recommendations |
| Pedagogy Coach | Learning Experience Quality score, task warning, E/R/A balance, feedback, observation, assessment idea |
| Quality Checklist | Teaching for Learning Review with 8 checks, warnings, recommendations |
| Scheme Progression Coach | Unit coherence, E/R/A sequence, retrieval, assessment checkpoints |

## Examples of use

- Lesson with WALT but no WILF → "Your lesson aim is clear but assessment evidence is missing."
- Queue-based relay → "This task may have too much waiting time — use stations."
- Game without cues → "Consider adding a refinement cue before the application game."
- WALT says decision making but drill-only plan → coherence mismatch flagged.

## Files

| File | Role |
|------|------|
| `src/lib/peKnowledge/teachingForLearningMaster.ts` | Framework, content development model, master PE entry |
| `src/lib/peKnowledge/teachingForLearningEngines.ts` | All evaluation and suggestion engines |
| `src/lib/peKnowledge/coaching.ts` | Integration with coaches and checklist |
| `src/lib/peKnowledge/peKnowledgeIndex.ts` | Exports and knowledge base registration |

## Future development ideas

- Structured activity form fields for E/R/A tagging per task
- Equipment ratio calculator from class size
- Live practice-time estimator from group sizes
- Link teaching strategy selector to pedagogy model picker
- Malta curriculum outcome mapping for assessment in instruction
- Teacher reflection journal in lesson delivery workflow
