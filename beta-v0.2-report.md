# PE Curriculum Studio — Beta v0.2 Report

**Date:** 2026-06-10  
**Scope:** Teacher workflow upgrade — progress tracking, calendar drag-drop, coverage modes, navigation simplification.

---

## Files changed (summary)

### Data model & migrations
- `lib/types.ts` — delivery status, progress fields, calendar links
- `lib/progress/delivery.ts` — mark planned/delivered/skipped, scheme status derivation
- `lib/progress/migrate.ts` — lesson & scheme progress migration
- `lib/progress/coverage.ts` — planned vs taught outcome collectors
- `lib/progress/summary.ts` — scheme & topic progress summaries
- `lib/calendar/migrate.ts` — calendar entry field migration
- `lib/calendar/helpers.ts` — drag payloads, entry creation from lessons/schemes
- `lib/storage.ts` — calendar migration on load
- `lib/scheme-builder/migrate.ts` — scheme progress migration
- `lib/lesson-plans/migrate.ts` — lesson progress migration

### Feature 1 — Learning outcomes fix
- `src/lib/curriculum/metadata/unified-outcomes.ts` — `resolveLearningOutcomeById()`
- `lib/scheme-builder/helpers.ts` — `resolveSchemeLearningOutcomes()`, formatting
- `components/scheme-builder/SchemeLearningOutcomeCard.tsx`
- `components/scheme-builder/SchemeLessonEditor.tsx`, `SOWScreenView.tsx`, `SOWPreviewTable.tsx`, `SOWLessonRow.tsx`
- `lib/export.ts` — scheme PDF/Word LO rendering
- `lib/lesson-plans/helpers.ts` — unified resolver for lesson exports

### Feature 2 — Progress tracking
- `components/progress/DeliveryStatusBadge.tsx`
- `components/progress/DeliveryControls.tsx`
- `components/progress/SchemeLessonDeliveryControls.tsx`
- `components/progress/SchemeProgressCard.tsx`
- `app/(studio)/lessons/page.tsx` — delivery controls in library & preview
- `app/(studio)/schemes/page.tsx` — per-lesson delivery + auto scheme status on save

### Feature 3 — Calendar drag & drop
- `components/calendar/CalendarPlanner.tsx`
- `components/calendar/CalendarEntryCard.tsx`
- `components/calendar/CalendarUnscheduledPool.tsx`
- `components/calendar/CalendarEntryDetail.tsx`
- `app/(studio)/calendar/page.tsx` — day/week/month/agenda + custom entry form

### Feature 4 — Professional lesson template
- Already shipped in v0.1 (7-step builder, structured activities, endings, quality checklist, exports)
- v0.2 adds delivery status integration in lesson library preview

### Feature 5 — Coverage tracker
- `src/lib/intelligence/analytics/coverage-analytics.ts` — planned / taught / remaining modes
- `app/(studio)/curriculum-analytics/page.tsx` — Coverage Tracker UI
- `lib/constants.ts` — teacher-friendly nav labels + `ADVANCED_NAV_ITEMS`
- `app/(studio)/settings/page.tsx` — Advanced tools section
- `src/lib/intelligence/assistant/curriculum-assistant.ts` — taught vs planned wording

---

## Data model changes

| Entity | New fields |
|--------|------------|
| `LessonPlan` | `deliveryStatus`, `plannedDate`, `deliveredDate`, `reflection`, `taughtOutcomeIds`, `outcomeOverrides` |
| `SOWLesson` | Same delivery fields as lessons |
| `SchemeOfWork` | `status` (`draft` \| `in_progress` \| `completed`) |
| `CalendarEntry` | `startTime`, `endTime`, `classGroup`, `topicId`, `linkedLessonId`, `linkedSchemeId`, `linkedSchemeLessonNumber`, `deliveryStatus`, `reflection` |

**Defaults on migration:** all existing lessons/scheme lessons/calendar entries → `deliveryStatus: "planned"`. No data deleted.

---

## Migration added

On every `loadAppData()`:
1. Lessons → `migrateLessonProgress()` (defaults + `plannedDate` from `date`)
2. Schemes → `migrateSchemeProgress()` (lesson defaults + derived `status`)
3. Calendar → `migrateCalendarEntry()` (new optional fields)

---

## Feature 1 — Learning outcome rendering fix

**Root cause:** Scheme lessons store imported outcome IDs (`lo-secondary-pe-ma9-1`) but display used KB-only `getLearningOutcomeById()` (17 outcomes).

**Fix:** `resolveLearningOutcomeById()` searches unified catalogue (512 imported + KB). Readable `SchemeLearningOutcomeCard` shows code, description, pathway, topic. Exports render LOs **before WALT**.

---

## Feature 2 — Progress tracking

- Teachers mark lessons **Planned / Delivered / Skipped** in Lesson Plans and Scheme Builder.
- **Only delivered** lessons contribute `taughtOutcomeIds` to coverage.
- Scheme `status` auto-derived on save from lesson delivery counts.
- `outcomeOverrides` supported in data model for manual per-outcome status (UI for overrides is a future enhancement).

---

## Feature 3 — Calendar drag & drop

- **Views:** day, week, month, agenda.
- **Unscheduled pool:** drag saved lesson plans or scheme lessons onto any weekday column.
- **Move:** drag existing calendar entries between days.
- **Links:** entries store `linkedLessonId` / `linkedSchemeId` + lesson number.
- **Quick actions:** mark delivered/skipped/moved, reflection, open linked lesson/scheme.
- HTML5 drag-and-drop (no new dependencies).

---

## Feature 4 — Professional PE lesson template

Shipped in v0.1; unchanged structurally. Includes:
- Curriculum reference, WALT, WILF, structured activities (progressions, differentiation, cues)
- Flexible lesson endings, advisory 9-point quality checklist
- PDF/Word export with footer `PE Curriculum Studio © Neil Cassar`
- Safe migration from legacy free-text lessons

---

## Feature 5 — Coverage tracker

Three modes:
1. **Planned** — outcomes in saved lessons & schemes
2. **Taught** — outcomes from **delivered** lessons/scheme lessons/calendar entries only
3. **Remaining** — curriculum outcomes not yet taught

Navigation:
- Curriculum Analytics → **Coverage Tracker**
- Curriculum Hub → **Browse Curriculum**
- Curriculum Assistant → **Planning Assistant**
- Tester / Coverage / Visibility Audit → **Settings → Advanced tools** (routes preserved)

---

## Verification

| Check | Result |
|-------|--------|
| `npm run audit-completeness` | 512/512 (100%) |
| `npm run audit-implementation` | Pass |
| `npm run test:alignment` | 15/15 pass |
| `npm run build` | Pass |

---

## Remaining limitations

1. **Per-outcome manual override UI** — data model ready; dedicated toggle UI not yet in scheme/lesson editors.
2. **Bulk scheme scheduling** — `distributeSchemeLessons()` helper exists; one-click “spread 6 lessons over 6 weeks” button not yet in UI (manual drag per lesson works).
3. **Calendar ↔ lesson delivery sync** — marking calendar delivered does not auto-update linked lesson plan delivery (separate records).
4. **True .docx** — Word export remains HTML-based `.doc` via browser download.
5. **Class/group filters on Coverage Tracker** — summary cards show global counts; per-class filter UI deferred.
6. **Mobile calendar drag** — desktop-first; touch drag may need polish on tablets.

---

## Manual test checklist

### Learning outcomes
- [ ] Select MA9.1 + MA9.5 in Scheme Builder — cards show code + description
- [ ] Save scheme, reload — LOs persist
- [ ] Table preview — LOs before WALT
- [ ] Export PDF and Word — LOs visible with descriptions

### Progress tracking
- [ ] Create lesson, mark Planned (default)
- [ ] Mark Delivered — Coverage Tracker taught count increases
- [ ] Mark Skipped — does not count as taught
- [ ] Scheme lesson 1–2 delivered — scheme shows In progress, 2/N delivered

### Calendar
- [ ] Drag lesson plan onto Wednesday
- [ ] Drag scheme lesson onto another day
- [ ] Move entry by dragging to new day
- [ ] Mark delivered on calendar detail panel

### Lesson template
- [ ] Full PE lesson with activities + endings
- [ ] Quality checklist shows e.g. 7/9
- [ ] Export PDF and Word with all sections

### Coverage tracker
- [ ] Switch Planned / Taught / Remaining modes
- [ ] Confirm taught only updates after delivery marks
- [ ] Topic bars reflect selected mode
