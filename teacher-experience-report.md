# PE Curriculum Studio — Teacher Experience Overhaul Report

Generated: 2026-06-10

## Summary

This phase transformed PE Curriculum Studio from a curriculum-heavy tool into a **teacher-first planning platform**. Scheme planning uses a split-screen layout; lessons follow a **PE-specific template** with structured activities and flexible endings; exports are professional; quality guidance is advisory only.

**Build:** `npm run build` passes (16 routes)  
**Alignment tests:** `npm run test:alignment` passes

---

## Phases completed

### Phase 1 — Scheme Builder UX (split-screen planner)

| Panel | Implementation |
|-------|----------------|
| **Left** | `SchemeLessonNavigator` — lesson list with Empty / Partial / Complete status |
| **Centre** | `SchemeLessonEditor` — one lesson at a time, collapsible sections |
| **Right** | `SchemePlanningAssistant` — tabbed card bank + alignment + coaching |

- Collapsible scheme setup bar (no scrolling to top)
- Sticky action bar: Save, Cancel, Export, view toggle

### Phase 2 — Scheme View (Screen ↔ Table)

| Mode | Component | Default |
|------|-----------|---------|
| Screen view | `SOWScreenView` — vertical lesson cards | ✓ |
| Table view | `SOWPreviewTable` — print/export format | |

- Saved schemes open in dedicated view (not cramped inline table)
- `SchemeViewToggle` in sticky bar

### Phase 3 — Export system

- **PDF** — A4, print-friendly, footer `PE Curriculum Studio © Neil Cassar`
- **Word** — editable `.doc` with Word-compatible HTML
- Filename pattern: `Year-11-Fitness-Term-1-Scheme-of-Work.doc`
- Available: schemes list, scheme view, scheme editor (`ExportMenu`)

### Phase 4 — Software-wide navigation

| Area | Improvement |
|------|-------------|
| Scheme Builder | 3-panel layout, sticky bar, collapsible setup |
| Lesson Builder | Sticky save bar, sidebar quality score, 7-step PE flow |
| App shell | Wider `xl` content area for laptop planning |
| Print CSS | Scheme + lesson print areas hide chrome |

### Phase 5 — PE-specific lesson template

**Mandatory components (dedicated sections):**

- Curriculum Reference (learning outcome codes + descriptions)
- Learning Intentions
- WALT
- Success Criteria / WILF

**Structured PE activities** (`LessonActivity`):

- Activity number & name
- Number of students (presets: Whole Class, Pairs, Teams of 4, etc.)
- Time
- Space & equipment
- Task description
- Progressions (list)
- Differentiation (easier / harder)
- Teaching cues (suggestions + custom)

### Phase 6 — Flexible Lesson Ending Builder

Teachers add any combination of:

- Cool Down
- Reflection
- Quick Questioning
- Assessment Opportunity
- Closing Link
- Custom Component

Actions: add, remove, rename, duplicate, reorder — **no forced structure**.

### Phase 7 — Lesson Quality Checklist (advisory)

9-point checklist in sidebar + review step + sticky bar compact score:

1. Curriculum Reference  
2. Learning Intentions  
3. WALT  
4. Success Criteria  
5. Activities Present  
6. Progressions Included  
7. Differentiation Included  
8. Teaching Cues Included  
9. Lesson Ending Added  

**Does not block saving.**

---

## Files changed

### New files

```
components/layout/StickyActionBar.tsx
components/scheme-builder/SOWScreenView.tsx
components/scheme-builder/SchemeLessonNavigator.tsx
components/scheme-builder/SchemeLessonEditor.tsx
components/scheme-builder/SchemePlanningAssistant.tsx
components/scheme-builder/SchemeViewToggle.tsx
components/lesson-builder/LessonActivityEditor.tsx
components/lesson-builder/LessonEndingBuilder.tsx
components/lesson-builder/LessonQualityChecklist.tsx
lib/scheme-builder/export.ts
lib/lesson-plans/pe-template.ts
lib/lesson-plans/quality-checklist.ts
lib/lesson-plans/preview-html.ts
teacher-experience-report.md
```

### Modified files

```
lib/types.ts                          — LessonActivity, LessonEndingComponent, walt field
lib/lesson-plans/migrate.ts           — safe migration from legacy text activities
lib/lesson-plans/helpers.ts           — duplicate with new IDs, export helpers
lib/lesson-plans/export.ts            — PE-structured export HTML
lib/scheme-builder/helpers.ts         — completion status, export filename
lib/export.ts                         — A4 scheme export + footer
app/(studio)/schemes/page.tsx         — full scheme UX overhaul
app/(studio)/lesson-builder/page.tsx  — PE lesson template + quality checklist
components/lesson-plans/LessonPreview.tsx
components/scheme-builder/SOWCardBank.tsx
components/layout/AppShell.tsx
app/globals.css
```

---

## Data migration (preserved)

- Existing lessons: free-text `activities` → one structured activity block on load
- Legacy `learningIntention` retained; new `walt` field added (empty if not set)
- Legacy `assessmentNotes` / `reflectionNotes` still render until teacher uses ending builder
- `syncLessonLegacyFields()` keeps export compatibility when structured data is used
- Schemes and localStorage unchanged in structure — no data loss

---

## Export functionality

| Entity | PDF | Word | Print |
|--------|-----|------|-------|
| Scheme | ✓ | ✓ | ✓ |
| Lesson | ✓ | ✓ | ✓ |

Lesson exports now include structured activities and flexible lesson endings.

---

## Test checklist

| Test | Status |
|------|--------|
| Create lesson | ✓ PE template with structured activities |
| Save / reopen lesson | ✓ Migration + walt field |
| Create / save scheme | ✓ 3-panel planner |
| Navigate lessons (scheme) | ✓ Left navigator, no full-page scroll |
| Edit lesson 5 without excessive scroll | ✓ Single-lesson centre panel |
| Screen / Table view | ✓ Both modes |
| Export PDF / Word | ✓ Schemes + lessons |
| Existing schemes / lessons load | ✓ Migrated safely |
| npm run build | ✓ Passes |

---

## Remaining UX recommendations

1. **Mobile scheme planner** — bottom sheet for planning assistant on phones
2. **True `.docx` export** — OOXML for richer Word formatting
3. **Lesson template presets** — topic-specific WALT/WILF/activity starters
4. **Dashboard resume card** — “Continue last scheme / lesson”
5. **Curriculum Hub / Analytics** — apply sticky headers + collapsible sections consistently
6. **Keyboard shortcuts** — Ctrl+S save, arrow keys between scheme lessons
7. **Differentiation ideas panel** — optional suggestions in planning assistant (guide, not dictate)

---

*Curriculum intelligence, analytics, assistant, and alignment engine unchanged.*
