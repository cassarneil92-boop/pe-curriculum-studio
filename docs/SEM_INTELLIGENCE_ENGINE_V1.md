# Sport Education Model (SEM) Intelligence Engine v1

Sport Education Model intelligence for PE Curriculum Studio — season-based units with teams, roles, competition, records, and festivity.

## Framework overview

`SEM_FRAMEWORK` defines SEM as a season-based curriculum model — not simply competition. Core elements:

- Team affiliation across a multi-lesson season
- Formal competition with balanced structures
- Authentic student roles beyond playing
- Record keeping and statistics
- Culminating festive event
- Reflection on responsibility and participation

`SEM_CHARACTERISTICS` covers seven implementation features: Seasons, Team Affiliation, Formal Competition, Student Roles, Record Keeping, Culminating Event, and Festivity.

`SEM_ROLES` includes eight roles: Coach, Captain, Referee, Statistician, Journalist, Equipment Manager, Wellbeing Officer, and Fair Play Officer.

## Helper functions

| Function | Purpose |
|----------|---------|
| `generateSEMSeason` | Seven-phase season plan lesson-by-lesson |
| `generateSEMTeams` | Team names, colours, values, allocation guidance |
| `generateSEMRoleAssignments` | Balanced role allocations by class size |
| `generateSEMAssessmentFramework` | Physical, cognitive, social, affective rubrics |
| `evaluateSEMMotivationPotential` | Autonomy, competence, relatedness check |
| `evaluateSEMInclusion` | SEND, EAL, confidence, skill adaptations |
| `evaluateSEMCompetitionBalance` | Flags elimination; suggests round-robin and fair play |
| `generateFairPlayFramework` | Values, points, tracking, recognition |
| `generateSEMRecordKeeping` | Tables, attendance, effort, fair play stats |
| `generateSEMCulminatingEvent` | Awards, celebrations — not winners only |
| `buildSEMLessonTemplate` | Warm-up, team meeting, tasks, reflection, roles |
| `evaluateSEMQuality` | 0–100 score across seven SEM dimensions |
| `buildSEMPlanningInsights` | Planning Assistant when season/competition keywords detected |
| `buildPedagogyCoachSEMMetrics` | Pedagogy Coach SEM block |
| `buildSEMQualityReview` | Quality Checklist — 5 checks |
| `buildSchemeSEMTips` | Scheme Progression Coach |
| `buildSEMSeasonRecord` | Future-ready season record for dashboards/printables |

## Season generation logic

Seven phases distributed across `lessonCount`:

1. Orientation
2. Team Building
3. Skill Development
4. Tactical Development
5. Competition
6. Final Event
7. Reflection

Short seasons (≤4 lessons) compress to orientation, team building, competition, and reflection. Longer seasons weight competition phase most heavily. Each lesson includes suggested WALT, activities, roles, and competition notes.

Output includes `SEMSeasonRecord` — foundation for future dashboards, team tracking, statistics, and printable sheets (UI not built in v1).

## Role logic

Roles scale by age:

- **Primary:** Captain, Referee, Statistician, Equipment Manager — rotate every 2 lessons
- **Secondary:** Full eight-role portfolio — rotate each lesson

Assignment counts balance across class size and team count. Every pupil should hold at least two different roles across the season.

## Assessment logic

Four domains:

| Domain | Focus |
|--------|-------|
| Physical | Skill execution, performance under competition |
| Cognitive | Tactics, rules, decision making, role literacy |
| Social | Teamwork, communication, collaboration |
| Affective | Leadership, responsibility, sportsmanship |

Fair play and effort points provide affective evidence alongside performance statistics.

## Scoring logic

Seven dimensions averaged: affiliation, roles, competition, records, reflection, inclusion, festivity.

| Band | Range |
|------|-------|
| Exceptional | 90–100 |
| Strong | 75–89 |
| Developing | 60–74 |
| Limited | Below 60 |

## App integration points

| Surface | Integration |
|---------|-------------|
| Planning Assistant | SEM card first when season/tournament/league/competition/sport education detected |
| Pedagogy Coach | SEM Guidance — roles, responsibility, reflection, team affiliation |
| Quality Checklist | SEM Review — 5 checks |
| Scheme Progression Coach | Season phases, competition structure, assessment when unit ≥5 lessons |
| Knowledge index | `SEM_MASTER_PE_ENTRY` |

## Cross-layer connections

- **TPSR** — responsibility and fair play; role warnings deduplicated with TPSR leadership flags
- **Cooperative Learning** — team structures complement SEM affiliation
- **TGfU** — tactical development phase aligns with modified games
- **Visible Learning** — WILF evidence during fixtures and role performance
- **Learning Science** — retrieval across season phases

## Future development opportunities

- SEM dashboards with live league tables
- Team tracking and season statistics UI
- Award systems and ceremony builder
- Printable team sheets and score sheets
- Pupil role rotation manager
- Fair play point entry interface
