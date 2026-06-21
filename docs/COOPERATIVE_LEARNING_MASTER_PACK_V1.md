# Cooperative Learning Master Pack V1

## Purpose

Phase 4D adds a **Cooperative Learning intelligence layer** that distinguishes genuine cooperative learning from pupils merely working in groups.

Core question: Is this structured cooperation with interdependence, accountability, interaction, taught social skills, and group processing?

All content is original and app-safe. No copyrighted text, book quotes, lesson plans, diagrams, or structures.

## Framework

`COOPERATIVE_LEARNING_FRAMEWORK` — five essential elements:

| Element | Focus |
|---------|--------|
| Positive Interdependence | Shared goals and combined success |
| Individual Accountability | Every pupil contributes evidence |
| Promotive Interaction | Face-to-face support and encouragement |
| Interpersonal Skills | Communication, listening, cooperation — taught explicitly |
| Group Processing | Reflection on teamwork and next steps |

## Structure library

Original app-safe structures inspired by cooperative learning principles:

- Reciprocal teaching pairs
- Jigsaw learning teams
- Pair coaching
- Team challenge score
- Learning teams
- Peer feedback partnerships
- Collaborative problem solving
- Cooperative stations
- Shared goal challenge

## Helper functions

| Function | Purpose |
|----------|---------|
| `evaluateCooperativeLearningQuality(ctx)` | 0–100 composite with band and dimension scores |
| `evaluatePositiveInterdependence(ctx)` | Shared goal detection, redesign suggestions |
| `evaluateIndividualAccountability(ctx)` | Free rider flags, accountability methods |
| `evaluateInterpersonalSkillsDevelopment(ctx)` | Skills developed vs missing |
| `evaluateGroupProcessing(ctx)` | Reflection and discussion audit |
| `suggestCooperativeRoles(ctx)` | Role suggestions with responsibilities |
| `suggestGroupStructures(ctx)` | Grouping options with risks |
| `evaluateCooperativeEquity(ctx)` | Inclusion and participation equity |
| `suggestCooperativeAssessment(ctx)` | Peer, self, group evidence |
| `buildCooperativeLearningLessonSupport(ctx)` | Full lesson cooperative plan |
| `generateGroupProcessingPrompts(ageBand)` | Age-appropriate team review prompts |
| `buildCooperativeLearningPlanningInsights(...)` | Planning Assistant cards |
| `buildPedagogyCoachCLMetrics(lesson)` | Compact Pedagogy Coach block |
| `buildCooperativeLearningQualityReview(lesson)` | Quality checklist review |
| `buildSchemeCooperativeLearningTips(scheme)` | Unit social skill progression |

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
| Planning Assistant | Group size, roles, accountability, reflection, inclusion (when cooperative keywords detected) |
| Pedagogy Coach | CL score, strongest/weakest element, role and reflection suggestions |
| Quality Checklist | Cooperative Learning Review — 6 checks with warnings |
| Scheme Progression Coach | Social skill, leadership, accountability, reflection progression |

## Examples

- Group task with no roles → "No individual accountability — assign Recorder or Feedback Partner."
- Team game with individual winner → "Individual success only — use combined team score."
- No debrief → "No group reflection — add two-minute team review."

## Files

| File | Role |
|------|------|
| `src/lib/peKnowledge/cooperativeLearningMaster.ts` | Framework, structures, roles, warnings |
| `src/lib/peKnowledge/cooperativeLearningEngines.ts` | Evaluation and suggestion engines |
| `src/lib/peKnowledge/coaching.ts` | Integration |
| `src/lib/peKnowledge/peKnowledgeIndex.ts` | Exports and registration |

## Future expansion opportunities

- Role card generator printable from lesson plan
- Group formation wizard from class profile
- Cooperative structure picker in Lesson Builder activities
- Peer assessment rubric templates
- Integration with Sport Education model progression
- Malta syllabus social outcome mapping
