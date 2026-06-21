# TPSR Master Pack v1

Teaching Personal and Social Responsibility (TPSR) intelligence for PE Curriculum Studio.

## Framework overview

PE and physical activity can develop personal and social responsibility across six levels:

| Level | Name | Focus |
|-------|------|--------|
| 0 | Irresponsibility | Baseline — disengagement or dependence |
| 1 | Respect and self control | Fair play, safety, impulse management |
| 2 | Participation and effort | Engagement and persistence |
| 3 | Self direction | Choice, challenge, independent learning |
| 4 | Helping others and leadership | Peer support, captain roles |
| 5 | Transfer beyond PE | Life application outside the lesson |

Each level in `TPSR_FRAMEWORK` includes meaning, teacher/pupil indicators, PE examples, coaching examples, common mistakes, planning and reflection prompts, assessment evidence, age adaptations, and Maltese school relevance.

Core export: `TPSR_FRAMEWORK` from `src/lib/peKnowledge/tpsrMaster.ts`.

## Helper functions

### Quality and focus

- **`evaluateTPSRQuality(context)`** — Scores 0–100 across respect, effort, self direction, leadership, helping others, reflection, and transfer. Returns strongest/weakest level, warnings, and practical fixes.
- **`suggestTPSRLevelFocus(context)`** — Recommends responsibility level from year group, pathway, behaviour context, and lesson aim.
- **`buildTPSRLessonStructure(context)`** — Six-phase lesson: relational start → awareness talk → activity → group meeting → reflection → transfer question.

### Embedding and relational teaching

- **`embedResponsibilityIntoActivity(context)`** — Activity-specific responsibility prompts (football, fitness, gymnastics, generic).
- **`evaluateRelationalTeaching(context)`** — Strengths, risks, and relational actions (trust, dignity, voice).
- **`evaluateStudentVoiceAndEmpowerment(context)`** — Choice, goals, leadership, reflection; flags teacher-dominated lessons.
- **`evaluateTransferBeyondPE(context)`** — Transfer potential (low/moderate/high) with questions and prompts.

### Assessment and progression

- **`suggestTPSRAssessment(context)`** — Self/peer/teacher prompts, evidence statements, targets, follow-up.
- **`buildTPSRUnitProgression(context)`** — Seven-lesson responsibility arc, scaled to scheme length.

### Planning and integration helpers

- **`buildTPSRPlanningInsights`** — Concise Planning Assistant cards.
- **`buildPedagogyCoachTPSRMetrics`** — Pedagogy Coach score block.
- **`buildTPSRQualityReview` / `buildTPSRQualityInsights`** — Quality Checklist review.
- **`buildSchemeTPSRTips`** — Scheme Progression Coach tips.

## Scoring logic

Dimension scores start at 40 and gain +35 when lesson text matches keyword patterns for each area. Weighted average produces the overall score:

| Band | Range |
|------|-------|
| Exceptional | 90–100 |
| Strong | 75–89 |
| Developing | 60–74 |
| Limited | Below 60 |

Warnings trigger when individual dimensions fall below thresholds (e.g. transfer &lt; 40, self direction &lt; 45).

## App integration points

| Surface | Integration |
|---------|-------------|
| Planning Assistant | TPSR insight card when `buildTPSRPlanningInsights` returns suggestions (priority after Cooperative Learning) |
| Pedagogy Coach | TPSR Score block: level, prompts, reflection, transfer, warning |
| Quality Checklist | TPSR Review section with seven checks |
| Scheme Progression Coach | Responsibility progression, leadership, self direction, transfer, reflection tips |
| Knowledge index | `TPSR_MASTER_PE_ENTRY` in `ALL_PE_KNOWLEDGE_ENTRIES`; relevance scoring via `isTPSRRelevant` |

## Cross-layer connections

- **Physical Literacy** — Confidence and motivation support effort (Level 2) and lifelong engagement (Level 5).
- **Cooperative Learning** — Roles and group processing align with helping others and leadership (Level 4); duplicate group-reflection warnings are suppressed when CL already flags reflection.
- **Teaching for Learning** — Reflection and assessment evidence complement TPSR exit tasks.
- **TGfU** — Respect, effort, and leadership in game-based lessons map to Levels 1–4.

## Examples

**Planning insight:** “This lesson has a strong effort focus but limited self direction.”

**Pedagogy Coach:** Recommended level “Participation and effort” with reflection “Where did you keep going even when it was hard?”

**Scheme tip:** “Responsibility progression: Respect and safety → Effort and participation → Personal challenge → Self direction”

## Future development opportunities

- Link TPSR level to official curriculum outcomes and behaviour policies.
- Pupil self-assessment widgets tied to responsibility level.
- Scheme auto-tagging of lessons with recommended TPSR level.
- Deeper integration with Sport Education and values-based pathways.
- Localised Maltese language question bank variants.
