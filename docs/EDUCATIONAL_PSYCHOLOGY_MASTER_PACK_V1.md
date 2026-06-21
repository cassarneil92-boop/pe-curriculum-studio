# Educational Psychology Master Pack v1

Educational psychology intelligence for PE Curriculum Studio — memory, load, scaffolding, and learning design.

## Framework overview

`EDUCATIONAL_PSYCHOLOGY_FRAMEWORK` covers thirteen domains:

1. Memory
2. Cognitive Load
3. Prior Knowledge
4. Schema Development
5. Metacognition
6. Scaffolding
7. Instruction
8. Feedback
9. Assessment
10. Transfer
11. Motivation
12. Context
13. Misconceptions

Each domain includes definition, PE relevance, examples by phase, planning prompts, assessment opportunities, common mistakes, and differentiation implications.

Core question: **Will pupils remember, understand, and apply learning — not only perform once in class?**

## Helper functions

| Function | Purpose |
|----------|---------|
| `evaluateWorkingMemoryLoad` | Instruction count, verdict, simplification |
| `evaluateCognitiveLoad` | Intrinsic, extraneous, germane load |
| `evaluatePriorKnowledgeActivation` | Retrieval and activation checks |
| `evaluateSchemaBuilding` | Unit connection and progression |
| `evaluateLearnerExpertise` | Novice vs expert match |
| `evaluateMetacognition` | Plan, monitor, evaluate prompts |
| `evaluateScaffolding` | Demo, guided practice, fade |
| `evaluateInstructionalClarity` | Clarity flags and fixes |
| `evaluateInstructionStrategy` | Explicit, discovery, CL, mixed — with rationale |
| `evaluateFeedbackQuality` | Feed up / back / forward |
| `evaluateAssessmentForLearning` | AfL during lesson |
| `evaluateLearningTransfer` | Sport, health, life transfer |
| `evaluateLearningContext` | Culture, inclusion, environment |
| `detectLearningMisconceptions` | Performance vs learning myths |
| `evaluateEducationalPsychologyQuality` | Overall 0–100 score |
| `buildEducationalPsychologyPlanningInsights` | Planning Assistant |
| `buildPedagogyCoachEPMetrics` | Pedagogy Coach block |
| `buildEducationalPsychologyQualityReview` | Quality Checklist |
| `buildSchemeEducationalPsychologyTips` | Scheme Progression Coach |

## Scoring logic

Ten dimensions averaged: memory, load, prior knowledge, schema, metacognition, scaffolding, instruction, feedback, assessment, transfer.

| Band | Range |
|------|-------|
| Exceptional | 90–100 |
| Strong | 75–89 |
| Developing | 60–74 |
| Limited | Below 60 |

## App integration points

| Surface | Integration |
|---------|-------------|
| Planning Assistant | EP card after Learning Science, before TFL |
| Pedagogy Coach | Score, working memory, cognitive load risk, metacognition, feedback, transfer |
| Quality Checklist | Educational Psychology Review — 8 checks |
| Scheme Progression Coach | Schema, retrieval, scaffolding, transfer, AfL checkpoints |
| Knowledge index | `EDUCATIONAL_PSYCHOLOGY_MASTER_PE_ENTRY` |

## Cross-layer connections

- **Learning Science** — retrieval/spacing; duplicate retrieval warnings suppressed when LS already flags
- **Teaching for Learning** — feedback and AfL complement EP engines
- **TGfU** — tactical schema and guided discovery strategy
- **TPSR** — metacognitive reflection; transfer deduplicated with TPSR/LS
- **Primary PE** — age-appropriate working memory thresholds
- **Physical Literacy** — confidence without false success (misconception detection)

## Examples

- *"Working memory may be overloaded."*
- *"Too many coaching points for this age group."*
- *"Add retrieval before introducing new content."*

## Future development opportunities

- Per-year-group cognitive load thresholds from curriculum data
- Misconception library linked to sport-specific tactics
- Scaffold fade tracking across scheme lessons
- Integration with lesson timing / phase duration estimates
- Maltese bilingual instruction clarity prompts
