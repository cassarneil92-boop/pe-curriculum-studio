# Visible Learning Master Pack v1

Visible Learning and Teacher Impact intelligence for PE Curriculum Studio — helping teachers ask "Did learning occur?" rather than only "Did I teach it?"

## Framework overview

`VISIBLE_LEARNING_FRAMEWORK` covers twelve domains:

1. Teacher Clarity
2. Learning Intentions
3. Success Criteria
4. Challenge
5. Feedback
6. Progress Visibility
7. Student Self Evaluation
8. Assessment Evidence
9. Teacher Impact
10. Visible Learning
11. Visible Teaching
12. Evaluation of Effectiveness

Each domain includes definition, why it matters, PE relevance, primary and secondary examples, coaching examples, planning prompts, assessment prompts, common mistakes, and differentiation implications.

Core message: **Focus on whether learning occurred — not only whether teaching was delivered.**

All content is original educational guidance inspired by visible learning principles. No copyrighted text, effect sizes, or rankings are included.

## Helper functions

| Function | Purpose |
|----------|---------|
| `evaluateTeacherClarity` | WALT/WILF clarity, purpose, competing objectives |
| `evaluateLearningIntentions` | What / why / how successful — improved WALT and pupil version |
| `evaluateSuccessCriteria` | Observable, realistic WILF — flags activity-based criteria |
| `evaluateVisibleLearning` | Visibility score, strengths, blind spots |
| `evaluateChallengeLevel` | Cognitive, physical, tactical challenge — simplify / extend |
| `evaluateVisibleLearningFeedback` | Feed up / back / forward — improved examples |
| `evaluateProgressVisibility` | Baseline, checkpoints, reflection prompts |
| `evaluateStudentSelfEvaluation` | Reflection, confidence, goal review prompts |
| `evaluateTeacherImpactEvidence` | Impact confidence, missing evidence sources |
| `evaluateLessonEffectiveness` | Six-dimension effectiveness score and priority |
| `suggestHighImpactPractices` | High / moderate / context-dependent practices (no effect sizes) |
| `generateVisibleLearningReview` | Learning walk style — what / why / success / next step |
| `evaluateVisibleLearningQuality` | Overall 0–100 score with warnings |
| `buildVisibleLearningPlanningInsights` | Planning Assistant card |
| `buildPedagogyCoachVLMetrics` | Pedagogy Coach block |
| `buildVisibleLearningQualityReview` | Quality Checklist — 8 checks |
| `buildSchemeVisibleLearningTips` | Scheme Progression Coach |

## Scoring logic

**Teacher clarity** — WALT/WILF presence, learning language, observable criteria, progression clarity.

**Visible learning** — Average of clarity, intentions, progress visibility, and self-evaluation scores.

**Lesson effectiveness** — Average of clarity, challenge, feedback, assessment evidence, reflection, and progress visibility.

| Band | Range |
|------|-------|
| Exceptional | 90–100 |
| Strong | 75–89 |
| Developing | 60–74 |
| Limited | Below 60 |

**Challenge verdicts:** `too-easy`, `appropriate-challenge`, `excessive-challenge`

**Learning walk verdicts:** `yes`, `partly`, `no`

## App integration points

| Surface | Integration |
|---------|-------------|
| Planning Assistant | Visible Learning card after Educational Psychology, before Teaching for Learning |
| Pedagogy Coach | Teacher clarity, visible learning score, challenge, feedback, impact evidence, progress visibility |
| Quality Checklist | Visible Learning Review — 8 checks |
| Scheme Progression Coach | Progression visibility, assessment checkpoints, retrieval, reflection, self-evaluation |
| Knowledge index | `VISIBLE_LEARNING_MASTER_PE_ENTRY` |

## Cross-layer connections

- **Learning Science** — retrieval checkpoints in scheme tips; duplicate retrieval warnings suppressed when LS already flags
- **Educational Psychology** — cognitive load and scaffolding inform challenge; feedback deduplicated with EP/TFL
- **Teaching for Learning** — WILF and feedback overlap deduplicated in quality insights
- **TGfU** — tactical success criteria in WILF design
- **TPSR** — responsibility reflection complements self-evaluation
- **Primary PE** — age-appropriate success criteria
- **Physical Literacy** — confidence and competence visibility in progress checks

## Examples

**Planning insight:** "Success criteria are difficult to observe." → Suggest observable WILF linked to WALT.

**Pedagogy Coach:** Teacher clarity 72/100, visible learning 68/100, challenge `appropriate challenge`, feedback feed-forward cue.

**Learning walk review:** What learning — yes; why — partly; how successful — no → recommend pupil-friendly WILF display.

## Future development opportunities

- Unit-level impact tracking across scheme lessons
- Pupil-facing WILF card generator
- Learning walk observation form export
- Integration with assessment rubric builder
- Confidence calibration linked to Learning Science layer
- Video evidence prompts for technique visibility
