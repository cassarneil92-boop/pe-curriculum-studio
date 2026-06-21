# Primary PE & Fundamental Movement Master Pack v1

Primary PE and Fundamental Movement Skills (FMS) intelligence for PE Curriculum Studio.

## Framework overview

`PRIMARY_PE_FRAMEWORK` covers twelve core areas:

1. Developmentally appropriate PE
2. Fundamental movement skills
3. Movement concepts
4. Body management
5. Manipulative skills
6. Rhythmic movement
7. Cooperative skills
8. Games foundations
9. Lifetime activity foundations
10. Physical fitness for children
11. Inclusive primary PE
12. Safe active lesson design

Each area includes definition, examples by phase, planning prompts, assessment evidence, differentiation, and Maltese primary relevance.

## FMS categories

`FUNDAMENTAL_MOVEMENT_SKILLS` organises skills into:

| Category | Skills |
|----------|--------|
| Locomotor | walking, running, hopping, jumping, leaping, galloping, sliding, skipping |
| Stability | balancing, bending, stretching, twisting, turning, rolling, landing, weight transfer |
| Manipulative | throwing, catching, kicking, striking, dribbling, volleying, rolling object, trapping |

Each skill includes indicators (emerging → competent), cues, practice ideas, errors, assessment, and progression.

## Movement concepts

`MOVEMENT_CONCEPTS_FRAMEWORK`:

- **Space** — personal/general space, direction, pathway, levels
- **Body** — parts, shapes, balance, weight transfer
- **Effort** — speed, force, flow
- **Relationships** — with others, equipment, boundaries, rhythm

## Helper functions

| Function | Purpose |
|----------|---------|
| `evaluateDevelopmentalReadiness` | Year-appropriate complexity check |
| `buildPrimaryPELessonStructure` | Six-phase primary lesson |
| `evaluatePrimaryLessonStructure` | Structure flags and fixes |
| `suggestMovementConcepts` | Concepts for year group and activity |
| `evaluatePrimaryActiveParticipation` | Waiting, queues, elimination flags |
| `evaluatePrimarySafetyAndOrganisation` | Safety strengths and risks |
| `evaluatePrimaryPEInclusion` | SEND, confidence, adaptations |
| `suggestPrimaryPEAssessment` | Quick practical assessment prompts |
| `buildPrimarySkillProgression` | Explore → practise → refine → combine → apply |
| `suggestPrimaryGameFoundation` | Age-appropriate games not full sport |
| `suggestChildFriendlyFitnessApproach` | Play-based fitness principles |
| `evaluatePrimaryPEQuality` | Overall 0–100 quality score |
| `buildPrimaryPEPlanningInsights` | Planning Assistant cards |
| `buildPedagogyCoachPrimaryPEMetrics` | Pedagogy Coach (Year 1–6 only) |
| `buildPrimaryPEQualityReview` | Quality Checklist section |
| `buildSchemePrimaryPETips` | Scheme progression coach |

## Scoring logic

`evaluatePrimaryPEQuality` weights ten dimensions: developmental appropriateness, FMS focus, activity time, inclusion, safety, movement concepts, progression, assessment, confidence, enjoyment.

| Band | Range |
|------|-------|
| Exceptional | 90–100 |
| Strong | 75–89 |
| Developing | 60–74 |
| Limited | Below 60 |

## App integration points

| Surface | Integration |
|---------|-------------|
| Planning Assistant | Primary PE card when year 1–6 or primary keywords (after CL, before TPSR) |
| Pedagogy Coach | Primary PE Quality Score block — only for Year 1–6 |
| Quality Checklist | Primary PE Review — eight checks for primary year groups |
| Scheme Progression Coach | FMS progression, concept progression, assessment checkpoints |
| Knowledge index | `PRIMARY_PE_MASTER_PE_ENTRY`; relevance boost for primary year groups |

## Cross-layer connections

- **Physical Literacy** — confidence, motivation, lifelong engagement
- **Teaching for Learning** — practice time; duplicate waiting warnings suppressed
- **Cooperative Learning** — partner tasks and simple roles
- **TPSR** — respect, effort, helping others at primary level
- **TGfU** — simple game foundations only when age appropriate

## Examples

- *"This Year 2 lesson may need a simpler rule structure."*
- *"Use stations to reduce waiting time."*
- *"Replace full football with a simple sending and receiving game."*

## Future development opportunities

- Link FMS to official Malta primary curriculum outcomes
- Visual FMS progression maps per skill
- Early years (KG) dedicated phase templates
- Maltese language movement concept bank
- Equipment recommendation by year group
