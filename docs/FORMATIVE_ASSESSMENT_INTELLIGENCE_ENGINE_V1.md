# Formative Assessment Intelligence Engine v1

Formative Assessment intelligence for PE Curriculum Studio — assessment that drives learning, not only measures it after the fact.

## Framework overview

`FORMATIVE_ASSESSMENT_FRAMEWORK` defines ten core domains:

1. Learning Intentions
2. Success Criteria
3. Evidence Elicitation
4. Hinge Questions
5. Feedback
6. Peer Assessment
7. Self Assessment
8. Student Ownership
9. Assessment Decision Making
10. Formative Assessment Quality

Each domain includes definition, PE relevance, examples, coaching prompts, common mistakes, and differentiation implications.

`FORMATIVE_ASSESSMENT_WARNINGS` flags eight common AfL gaps with suggested fixes and teacher prompts.

## Helper functions

| Function | Purpose |
|----------|---------|
| `evaluateFormativeLearningIntentions` | Clarity, specificity, flags, improved WALT |
| `evaluateFormativeSuccessCriteria` | Observable WILF, pupil-friendly criteria |
| `generateEvidenceCollectionPlan` | Teacher, peer, self evidence + timing |
| `generateHingeQuestions` | Diagnostic, tactical, misconception checks |
| `generateMisconceptionChecks` | Tactical, movement, rules, performance confusion |
| `generateFeedForwardFeedback` | Feed up / back / forward with PE examples |
| `generatePeerAssessmentFramework` | Pathway-aware peer observation |
| `generateSelfAssessmentFramework` | Traffic lights, logs, goal-setting |
| `evaluateStudentOwnership` | Reflection, self-monitoring, ownership score |
| `generateExitTicket` | 3–5 questions adapted by pathway |
| `generateInstructionalDecisionSuggestions` | Progress, scaffold, reteach actions |
| `evaluateShortCycleAssessment` | Mid-lesson evidence frequency 0–100 |
| `evaluateFormativeAssessmentQuality` | Holistic 8-domain score |
| `buildFAPlanningInsights` | Planning Assistant when AfL keywords detected |
| `buildPedagogyCoachFAMetrics` | Pedagogy Coach AfL block |
| `buildFAQualityReview` | Quality Checklist — 6 checks |
| `buildSchemeFATips` | Scheme Progression Coach |

Note: `evaluateFormativeLearningIntentions` and `evaluateFormativeSuccessCriteria` are exported from `peKnowledgeIndex.ts` with prefixed names to avoid collision with Visible Learning exports.

## Scoring logic

Eight dimensions averaged for `evaluateFormativeAssessmentQuality`:

- learning intentions
- success criteria
- evidence collection
- hinge questions
- feedback
- peer assessment
- self assessment
- ownership

| Band | Range |
|------|-------|
| Exceptional | 90–100 |
| Strong | 75–89 |
| Developing | 60–74 |
| Limited | Below 60 |

## Pathway support

| Pathway | Adaptations |
|---------|-------------|
| Primary | Picture checklists, thumbs, simplified exit tickets |
| Secondary | Full sentence stems, tactical hinge questions |
| ALP | Vocational observation rubrics, reflection logs |
| SEC PE Option | Oral questioning, theory recall, exam-style hinges |

## Integration points

| Surface | Integration |
|---------|-------------|
| Planning Assistant | FA card first when formative/AfL/hinge keywords detected |
| Pedagogy Coach | Formative Assessment score, evidence, hinge, feedback, ownership |
| Quality Checklist | Formative Assessment Review — 6 checks |
| Scheme Progression Coach | Checkpoints, evidence, retrieval, reflection tips |
| Knowledge index | `FORMATIVE_ASSESSMENT_MASTER_PE_ENTRY` |

## Relationship to Visible Learning

- **Visible Learning** — Is learning visible? Teacher clarity, impact, progress.
- **Formative Assessment** — Does assessment drive learning? Hinge questions, decisions, short-cycle evidence.

Warnings are deduplicated in Quality Checklist when both layers flag the same WALT/WILF issue.

## Examples

**Hinge question:** "Show me you know when to pass to space — thumbs up if ready."  
**Feed forward:** "Next rep — scan before you pass because it improves decision-making."  
**Exit ticket (primary):** "Did I meet success criteria? How do I know?"  
**Instructional decision:** If misunderstanding present → reteach with isolated corrective task.

## Cross-layer connections

- **Learning Science** — retrieval checkpoints across scheme
- **Visible Learning** — WILF evidence and teacher clarity
- **SEM** — role-based assessment evidence
- **Educational Psychology** — metacognition and self-regulation
