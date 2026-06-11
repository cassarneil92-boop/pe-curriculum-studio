# Curriculum Implementation Audit

Audited at: 2026-06-11T11:25:18.726Z

## Data sources

- Imported outcomes: **706**
- Knowledge base outcomes: **17**

## Official syllabus area verification

| Area | Status | Imported outcomes | Notes |
|------|--------|-------------------|-------|
| Fundamentals | PRESENT | 52 | primary |
| Athletics (Primary) | PRESENT | 50 | primary |
| Gymnastics (Primary) | PRESENT | 53 | primary |
| Educational Dance (Primary) | PRESENT | 47 | primary |
| Games (Primary) | PRESENT | 64 | primary |
| Outdoor Recreation (Primary) | PRESENT | 33 | primary |
| Fitness | PRESENT | 36 | secondary |
| Holistic Development | PRESENT | 69 | secondary |
| Athletics | PRESENT | 50 | individual |
| Gymnastics | PRESENT | 53 | individual |
| Educational Dance | PRESENT | 47 | individual |
| Martial Arts | PRESENT | 25 | individual |
| Swimming | PRESENT | 36 | individual |
| Football | PRESENT | 34 | invasion |
| Basketball | PRESENT | 38 | invasion |
| Handball | PRESENT | 36 | invasion |
| Hockey | PRESENT | 32 | invasion |
| Touch Rugby | PRESENT | 18 | invasion |
| Tchoukball | PRESENT | 17 | invasion |
| Invasion Games (Generic) | PRESENT | 31 | invasion |
| Volleyball | PRESENT | 29 | net |
| Badminton | PRESENT | 29 | net |
| Pickleball | PRESENT | 26 | net |
| Net Games (Generic) | PRESENT | 16 | net |
| Outdoor Recreation | PRESENT | 33 | outdoor |
| Orienteering | PRESENT | 3 | outdoor |
| Trekking | PRESENT | 10 | outdoor |
| Team Building | PRESENT | 9 | outdoor |
| Ultimate Frisbee | PRESENT | 8 | other |
| Mini Tennis / Beach Racquet | PRESENT | 10 | other |
| Archery | PRESENT | 8 | other |

## Summary

- Present: **31**
- Partial: **0**
- Missing: **0**

### Missing curriculum areas

- None — all expected areas have at least one imported outcome.

### Partial coverage (needs manual review)

- None flagged.

## Pedagogical framework

Framework definitions implemented in `src/lib/intelligence/frameworks/pedagogical-models.ts`.
Lesson/scheme tagging supported via optional `pedagogicalModels` field.

## Fitness framework

Fitness strands F7–F11 and Common Fitness Battery defined in `src/lib/intelligence/frameworks/fitness-strands.ts`.
Imported fitness outcomes: **36**

## Holistic development

Imported HD outcomes: **69**

## Remaining limitations

- Generic IG/NG outcomes include sport coverage via `topics` metadata from the official pedagogical model table
- Code-level completeness is tracked in `curriculum-completeness-report.md`
- Strict alignment engine remains KB-only (17 outcomes)
- Full cloud collaboration not yet implemented
