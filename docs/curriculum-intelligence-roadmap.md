# PE Curriculum Studio — Curriculum Intelligence Roadmap (Phases 2–7)

## Implementation status

| Phase | Status | Location |
|-------|--------|----------|
| 2 — Curriculum Analytics | **Shipped** | `/curriculum-analytics`, `src/lib/intelligence/analytics/` |
| 3 — Advisory Alignment | **Shipped** | Schemes builder, `src/lib/intelligence/advisory/` |
| 4 — Resource Warehouse | **Foundation** | Extended `ResourceItem` types, `/resources` |
| 5 — AI Curriculum Coach | **Rule-based** | `src/lib/intelligence/coach/` |
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

components/curriculum-coverage/   # existing metadata audit UI
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
| `/curriculum-coverage` | Imported metadata quality audit |
| `/curriculum-tester` | Strict + additional alignment tester |
| `/curriculum-visibility-audit` | Teacher context visibility |
| `/lesson-builder` | Lesson planning |
| `/schemes` | Scheme builder + advisory alignment |
| `/resources` | Resource warehouse (metadata) |
| `/settings` | Teacher context |

All existing routes preserved.

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
