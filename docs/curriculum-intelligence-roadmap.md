# PE Curriculum Studio — Curriculum Intelligence Roadmap (Phases 2–7)

## Implementation status

| Phase | Status | Location |
|-------|--------|----------|
| 2 — Curriculum Analytics | **Shipped** | `/curriculum-analytics`, `src/lib/intelligence/analytics/` |
| 3 — Advisory Alignment | **Shipped** | Schemes builder, `src/lib/intelligence/advisory/` |
| 4 — Resource Warehouse | **Foundation** | Extended `ResourceItem` types, `/resources` |
| 5 — AI Curriculum Coach | **Rule-based** | `src/lib/intelligence/coach/` |
| 6B — Fitness Curriculum Reconstruction | **Foundation** | `src/lib/curriculum/fitness-curriculum/` |
| 6A — Primary PE Reconstruction | **Foundation** | `src/lib/curriculum/primary-pe/` |
| 6 — Collaboration | **Architecture** | `src/lib/intelligence/collaboration/scopes.ts` |
| 7 — Curriculum Assistant | **Rule-based** | `/curriculum-assistant` |

Strict KB alignment engine is **unchanged** (`src/lib/curriculum/alignment/`).

---

## Architecture

```
src/lib/intelligence/
├── frameworks/          # Learning areas, pedagogy, fitness, expectations
├── analytics/           # Phase 2 — taught vs curriculum coverage
├── advisory/            # Phase 3 — scheme alignment score (advisory)
├── coach/               # Phase 5 — lesson/scheme coaching feedback
├── assistant/           # Phase 7 — curriculum-aware queries
├── collaboration/       # Phase 6 — scope metadata (future auth)
└── resources/           # Phase 4 — warehouse metadata types
```

### Data flow

- **Curriculum source of truth:** imported JSON + KB (`getPlanningOutcomes()`)
- **Taught data:** `AppData.lessons` + `AppData.schemes` (localStorage)
- **Analytics:** compares taught outcome IDs against full planning corpus
- **Advisory alignment:** never auto-modifies plans; recommendations only

---

## Database / schema recommendations (future Supabase)

```sql
-- organisations
colleges (id, name, slug)
departments (id, college_id, name)

-- users (Clerk/Firebase UID)
profiles (id, email, role, college_id, department_id)

-- curriculum (read-only mirror of planning layer)
curriculum_outcomes (id, code, description, pathway_id, topic_ids, skill_ids, year_groups, source)

-- teacher artefacts
lesson_plans (id, user_id, scope, data jsonb, pedagogical_models text[])
schemes_of_work (id, user_id, scope, data jsonb, alignment_score int)
resources (id, user_id, visibility, metadata jsonb, storage_uri)

-- analytics (computed)
coverage_snapshots (id, scope, college_id, report jsonb, created_at)
```

localStorage remains authoritative until auth ships. New fields are optional on existing types.

---

## Component structure

```
components/intelligence/
├── CoverageBar.tsx
├── CoverageHeatmap.tsx
├── AlignmentScoreCard.tsx
└── CoachingPanel.tsx

components/curriculum-coverage/   # Coverage Dashboard + metadata audit UI
components/curriculum-hub/        # browse imported outcomes
components/planning/              # strict + additional outcome sections
```

---

## Route structure

| Route | Purpose |
|-------|---------|
| `/` | Dashboard |
| `/curriculum` | Curriculum Hub (browse) |
| `/curriculum-analytics` | **Phase 2** taught coverage dashboard |
| `/curriculum-assistant` | **Phase 7** curriculum-aware assistant |
| `/curriculum-coverage` | **Coverage Dashboard** — catalogue completeness (pathways, topics, metadata) |
| `/curriculum-tester` | Strict + additional alignment tester |
| `/curriculum-visibility-audit` | Teacher context visibility |
| `/lesson-builder` | Lesson planning |
| `/schemes` | Scheme builder + advisory alignment |
| `/resources` | Resource warehouse (metadata) |
| `/settings` | Teacher context |

All existing routes preserved.

### Coverage Dashboard vs Teaching Progress

| View | Route | Question it answers |
|------|-------|---------------------|
| **Coverage Dashboard** | `/curriculum-coverage` | Is the curriculum catalogue complete? (imports, pathways, topics, metadata) |
| **Teaching Progress** | `/curriculum-analytics` | What have I actually taught against that catalogue? |

Engine: `src/lib/curriculum/coverage/dashboard-engine.ts` builds catalogue metrics from raw imports, `getPlanningOutcomes()`, and KB strict-alignment outcomes. The existing outcome verification filters and list remain below the dashboard sections.

---

## Phase 6A — Primary PE Reconstruction (Foundation)

**Goal:** Transform Primary PE from scattered embedded fundamentals into a structured pathway with progression intelligence — without breaking existing outcomes or strict alignment.

### Module layout

```
src/lib/curriculum/primary-pe/
├── types.ts                 # Progression strands, learning domains, PL attributes
├── progression-framework.ts # Years 1–6 bands and strand definitions
├── planning-bridge.ts       # Surfaces embedded secondary-pe Y1–6 outcomes for primary-pe
├── outcome-metadata.ts      # Strand / domain / PL metadata (explicit + inferred)
├── progression-engine.ts    # Previous / current / next year queries + dashboard summary
└── index.ts
```

### Progression framework (Years 1–6)

| Strand | Focus |
|--------|--------|
| Fundamental Movement Skills | Locomotor, stability, manipulative foundations |
| Movement Competence | Sequences, control, combined skills |
| Games & Sport Foundations | Modified games and tactical readiness |
| Health & Wellbeing | Healthy lifestyle and safe participation |
| Physical Literacy | Motivation, confidence, competence, understanding |

### Learning domain metadata

Each primary outcome can be tagged (inferred or explicit) with: **Physical**, **Cognitive**, **Social**, **Affective**.

### Physical literacy metadata

Optional tags: **Motivation**, **Confidence**, **Competence**, **Knowledge & Understanding**.

### Integration points

| Surface | Behaviour |
|---------|-----------|
| **Planning layer** | `filterPlanningOutcomes({ appPathways: ["primary-pe"] })` includes KB samples + embedded F2/F4/F6 fundamentals |
| **Coverage Dashboard** | Primary PE section: strand completeness, domain coverage, PL coverage, year coverage |
| **Planning Assistant** | Queries: FMS schemes, balance outcomes, progression chains, confidence outcomes |
| **Strict alignment** | Unchanged — still KB-only |

### Example progression query

> Show progression from Year 2 throwing to Year 4 invasion games.

Uses `queryPrimaryProgression()` / `describeThrowingToInvasionProgression()` in the progression engine.

---

## Phase 6B — Fitness Curriculum Reconstruction

**Goal:** Transform Fitness Curriculum from embedded secondary-pe outcomes into a structured Fitness Intelligence Layer for planning, assessment, coverage analysis, and assistant recommendations.

### Module layout

```
src/lib/curriculum/fitness-curriculum/
├── types.ts                 # Categories, components, progression stages
├── progression-framework.ts # HRF, SRF, principles, methods, testing, lifestyle
├── planning-bridge.ts       # Surfaces F7–F11 + fitness topic under fitness-curriculum
├── outcome-metadata.ts      # Category / domain / PL metadata overlays
├── progression-engine.ts      # queryFitnessProgression, dashboard summary, gaps
└── index.ts

src/lib/peKnowledge/
├── fitnessCurriculumMaster.ts   # Knowledge layer entry
└── fitnessCurriculumEngines.ts  # Planning, scheme, lesson design engines
```

### Framework categories

| Category | Includes |
|----------|----------|
| Health Related Fitness | Cardiovascular endurance, muscular endurance/strength, flexibility, body composition |
| Skill Related Fitness | Agility, balance, coordination, power, reaction time, speed |
| Training Principles | Specificity, overload, progression, reversibility, variation, recovery |
| Training Methods | Continuous, interval, circuit, fartlek, resistance, flexibility |
| Fitness Testing | Aerobic, strength, endurance, flexibility, agility tests |
| Health & Lifestyle | Nutrition, recovery, sleep, activity, sedentary behaviour, wellbeing |

### Progression model

`foundational-knowledge` → `training-methods` → `application` → `assessment-interpretation` → `programme-design`

Utilities: `queryFitnessProgression()`, `getRelatedFitnessOutcomes()`, `getPreviousFitnessConcepts()`, `getNextFitnessConcepts()`.

### Dashboard metrics

Coverage Dashboard **Fitness Curriculum coverage** section shows category coverage, year groups (7–11), learning domains, physical literacy attributes, and **Fitness gap analysis**.

### Assistant capabilities

- Create Form 4 fitness scheme / 6-lesson cardiovascular unit
- Explain and compare training methods
- Muscular endurance and fitness testing queries
- Progression from training methods to programme design
- TGfU-informed fitness lesson guidance

Strict curriculum alignment and official outcome wording are unchanged.

---

## Phase 6C — SEC PE Option Intelligence

**Goal:** Transform SEC PE Option from imported syllabus LOs into a complete examination and curriculum intelligence layer for planning, revision, assessment, and coverage analysis.

### Module layout

```
src/lib/curriculum/pe-option-sec/
├── types.ts                 # Categories, subtopics, revision/assessment types
├── progression-framework.ts # Theory categories, exam topics, thresholds
├── planning-bridge.ts       # Native pe-option-sec outcome filtering
├── outcome-metadata.ts      # Category / domain / PL / exam metadata overlays
├── progression-engine.ts    # Revision engine, assessment suggestions, dashboard
└── index.ts

src/lib/peKnowledge/
├── secPeOptionMaster.ts     # Knowledge layer entry
└── secPeOptionEngines.ts    # Planning, scheme, lesson design, assessment engines
```

### Framework categories

| Category | Includes |
|----------|----------|
| Anatomy & Physiology | Skeletal, muscular, cardiovascular, respiratory systems |
| Fitness & Training | Components, principles, methods of training |
| Skill Acquisition | Stages of learning, feedback, guidance, practice types |
| Sport Psychology | Motivation, goal setting, confidence, anxiety, concentration |
| Performance Analysis | Observation, evaluation, improvement planning |
| Health & Lifestyle | Physical activity, nutrition, recovery, wellbeing |
| Practical Sport | Team/individual sport, officiating, coursework |

### Revision intelligence

Utilities: `showRevisionTopics()`, `showExamTopicCoverage()`, `showWeakTopics()`, `showMissingTopics()`.

Each topic reports **covered**, **planned**, or **not planned** status when teaching progress context is supplied.

### Assessment intelligence

`buildSecAssessmentSuggestions()` generates exam-style questions, revision prompts, coursework ideas, and assessment opportunities from selected outcomes.

### Dashboard metrics

Coverage Dashboard **SEC PE Option coverage** section shows topic coverage, assessment coverage, learning domains, revision readiness, and **SEC gap analysis**.

### Assistant capabilities

- Create SEC PE Option anatomy scheme
- Create cardiovascular system lesson
- Explain principles of training
- Generate revision activities for motivation
- Show fitness testing outcomes
- Revision topic overview (exam coverage, missing topics)

Strict curriculum alignment and official outcome wording are unchanged.

---

## Phase 6D — Sport Intelligence Layer

**Goal:** Teach PE Curriculum Studio how sports work — skills, progressions, pedagogy, resources, and realistic lesson sequences.

### Module layout

```
src/lib/curriculum/sport-curriculum/
├── types.ts                 # Sport definitions, dimensions, pedagogy models
├── progression-framework.ts # 8 sports, skill chains, lesson phases, resources
├── planning-bridge.ts       # isSportPlanningOutcome, topic matching
├── outcome-metadata.ts      # Skill and dimension metadata overlays
├── progression-engine.ts    # querySportProgression, dashboard, skill sequences
└── index.ts

src/lib/peKnowledge/
├── sportCurriculumMaster.ts   # Knowledge layer entry
└── sportCurriculumEngines.ts  # Lesson design, activity blocks, scheme tips

lib/assistant/
├── sport-pe-queries.ts        # Sport-specific assistant handler
└── sport-progressions.ts      # Extended to use sport-curriculum definitions
```

### Sports tracked

Football, Basketball, Volleyball, Handball, Athletics, Gymnastics, Dance, Racket Sports (badminton, tennis, etc.)

Each sport includes dimensions: Technical, Tactical, Physical, Psychological, Social.

### Skill progressions

Per-sport skill chains with prerequisite relationships (e.g. football: passing → receiving → dribbling → finishing → defending → transition → pressing).

### Pedagogy mapping

| Sport | Recommended pedagogy |
|-------|---------------------|
| Football | TGfU + CLA + Cooperative Learning |
| Basketball | TGfU + CLA + Sport Education |
| Volleyball | TGfU + Whole-Part-Whole |
| Handball | TGfU + CLA |
| Athletics | Whole-Part-Whole + Whole-Analytical-Whole |
| Gymnastics | Whole-Part-Whole |
| Dance | Whole-Part-Whole + Cooperative Learning |
| Racket Sports | Whole-Part-Whole + CLA + TGfU |

### Assistant capabilities

- Create sport-specific lessons (e.g. Year 8 football passing)
- Create sport units (e.g. volleyball serving)
- Progress skills across 6 lessons
- Suggest TGfU activities with pedagogy recommendations

### Dashboard metrics

Coverage Dashboard **Sport intelligence coverage** section shows sport depth, skill coverage, progression completeness, and gap analysis.

---

## Priority ranking

1. **P0 (done):** Analytics dashboard, advisory alignment, implementation audit
2. **P1:** Pedagogical model pickers in Lesson Builder + Schemes UI
3. **P1:** Resource warehouse search (keyword, LO, topic)
4. **P2:** Lesson coaching panel in Lesson Builder
5. **P2:** Fitness battery tracking UI (Hexagon, Plank, Shuttle)
6. **P3:** Supabase sync + department/college scopes
7. **P3:** External LLM integration for Assistant/Coach (with curriculum RAG)

---

## Build verification

```bash
npm run audit-implementation
npm run audit-metadata
npm run test:alignment
npm run build
```
