# Scheme Builder & Navigation UX Overhaul — Report

Generated: 2026-06-10

## Executive summary

This phase focused on **usability, not new curriculum intelligence**. Teachers can now plan schemes in a calm 3-panel layout, view saved schemes as readable lesson cards, export professionally, and keep key actions visible while scrolling.

**Build status:** `npm run build` passes (16 routes).

---

## UX improvements completed

### Issue 1 — Scheme layout (Screen View / Table View)

| Mode | Purpose | Implementation |
|------|---------|----------------|
| **Screen view** (default) | Primary reading/planning experience — vertical lesson cards, collapsible sections, badges | `SOWScreenView.tsx` |
| **Table view** | Preview, print, PDF/Word export — professional table layout | `SOWPreviewTable.tsx` (existing, retained) |

- Saved schemes open in a dedicated **view mode** (not inline table expand).
- Toggle via `SchemeViewToggle` in sticky action bar.
- No horizontal scrolling in screen view.

### Issue 2 — Scheme export (PDF & Word)

- **Export PDF** — browser print-to-PDF with A4 layout, hidden chrome, footer.
- **Export Word** — editable `.doc` (HTML-as-Word, opens in Microsoft Word).
- Footer on all exports: `PE Curriculum Studio © Neil Cassar`
- Export available in:
  - Saved schemes list (per-card PDF / Word buttons)
  - Individual scheme view (Export menu)
  - Scheme editor (Export menu in sticky bar)

### Issue 3 — Scheme creation (3-panel planner)

| Panel | Role |
|-------|------|
| **Left** | Lesson navigator — status, completion dot, title preview |
| **Centre** | Active lesson editor — one lesson at a time, collapsible sections |
| **Right** | Planning assistant — tabbed card bank (LOs, WALT, WILF, activities, resources) + alignment + coaching |

- Scheme setup is **collapsible** — stays accessible without dominating the page.
- Teachers no longer scroll through all lesson rows while planning.
- Planning assistant stays visible (sticky on desktop).

### Issue 4 — Software-wide navigation

- **`StickyActionBar`** — reusable sticky top bar (Save, Cancel, Export, view toggle).
- **Lesson Builder** — persistent Save button in sticky bar while editing sections.
- **App shell** — slightly wider max width (`xl:max-w-7xl`) for laptop planning.
- **Print CSS** — scheme print area hides navigation/sidebars.

---

## Files changed

### New files

| File | Purpose |
|------|---------|
| `components/layout/StickyActionBar.tsx` | Sticky action bar component |
| `components/scheme-builder/SOWScreenView.tsx` | Screen view lesson cards |
| `components/scheme-builder/SchemeLessonNavigator.tsx` | Left lesson nav panel |
| `components/scheme-builder/SchemeLessonEditor.tsx` | Centre single-lesson editor |
| `components/scheme-builder/SchemePlanningAssistant.tsx` | Right planning assistant |
| `components/scheme-builder/SchemeViewToggle.tsx` | Screen / table toggle |
| `lib/scheme-builder/export.ts` | Scheme export wrapper |

### Modified files

| File | Changes |
|------|---------|
| `app/(studio)/schemes/page.tsx` | Full UX overhaul — view/edit/list modes, 3-panel builder, exports |
| `app/(studio)/lesson-builder/page.tsx` | Sticky save bar |
| `components/scheme-builder/SOWCardBank.tsx` | Compact tabbed mode for right panel; flex-wrap (no forced horizontal scroll) |
| `components/layout/AppShell.tsx` | Wider content area on xl screens |
| `lib/export.ts` | A4 print styles, Word xmlns, scheme footer |
| `lib/scheme-builder/helpers.ts` | `buildSchemeExportFilename`, `lessonPreviewTitle` |
| `app/globals.css` | Scheme print area styles |

### Preserved (unchanged behaviour)

- `localStorage` / `AppProvider` persistence
- Curriculum intelligence, alignment engine, analytics, assistant routes
- Existing scheme and lesson data structures (`SchemeOfWork`, `SOWLesson`)
- `SOWPreviewTable` for table view and export HTML source

---

## Export functionality

```typescript
// lib/scheme-builder/export.ts
exportSchemeDocument(scheme, "pdf" | "word" | "print")
```

- PDF: opens print dialog in new window (user saves as PDF).
- Word: downloads `.doc` blob with `application/msword`.
- HTML includes official table format matching `SOWPreviewTable` columns.

---

## Navigation improvements

| Area | Improvement |
|------|-------------|
| Schemes list | Card actions row — Open, Edit, PDF, Word, Delete |
| Scheme view | Sticky bar — toggle, export, edit, back |
| Scheme editor | Sticky bar — planning/table toggle, export, save |
| Lesson builder | Sticky save always visible |
| Planning board | Removed stacked lesson rows; single-lesson focus |

---

## Test checklist

| Test | Status |
|------|--------|
| Create scheme | ✅ 3-panel layout with collapsible setup |
| Edit scheme | ✅ Loads existing lessons into navigator |
| Navigate between lessons | ✅ Left panel selection |
| Save scheme | ✅ Sticky Save + localStorage |
| Open saved scheme | ✅ Dedicated view mode |
| Screen view | ✅ Vertical lesson cards |
| Table view | ✅ Professional table |
| Export PDF | ✅ Print dialog with footer |
| Export Word | ✅ `.doc` download |
| Existing schemes load | ✅ Migration unchanged |
| Existing lessons load | ✅ Unchanged |
| `npm run build` | ✅ Passes |

---

## Remaining usability concerns

1. **Mobile 3-panel** — On small screens panels stack vertically; right assistant appears below editor (acceptable but not ideal for phones).
2. **Table view horizontal scroll** — Table view still scrolls horizontally on narrow viewports (by design for print fidelity).
3. **PDF export** — Relies on browser print-to-PDF (no native PDF binary generation).
4. **Word export** — HTML-as-Word, not OOXML `.docx` (works in Word but formatting may vary slightly).
5. **Curriculum analytics / assistant** — Not yet given sticky action bars (lower traffic than planning flows).
6. **Scheme setup on first visit** — Still requires expanding setup before topic/skill selection unlocks planner.

---

## Recommendations for next UX phase

1. **Mobile scheme planner** — Bottom sheet for planning assistant; swipe between lessons.
2. **True `.docx` export** — Add `docx` library for richer Word compatibility.
3. **Client PDF generation** — Optional `html2pdf` or server-side PDF for one-click download.
4. **Scheme templates** — Pre-filled WALT/WILF/activity patterns per topic to reduce card hunting.
5. **Keyboard shortcuts** — `Ctrl+S` save, arrow keys between lessons.
6. **Dashboard quick actions** — Resume last-edited scheme from dashboard card.
7. **Analytics / assistant pages** — Apply sticky headers and collapsible sections consistently.

---

*PE Curriculum Studio — usability phase complete. Curriculum intelligence unchanged.*
