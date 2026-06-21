# TGfU Master Pack V2

## Overview

Phase 4A.1 upgrades the PE Curriculum Studio TGfU engine from basic "games before drills" guidance toward **intelligent game based pedagogy** that develops thinking players and self regulated learners.

All content is original, practical, and evidence informed. No copyrighted text, book quotes, or reproduced diagrams.

## New intelligence added

### Game Based Approaches (GBA) ecosystem

The system now treats TGfU as one approach within a broader family:

- TGfU
- Game Sense
- Tactical Games Model
- Tactical Decision Learning
- Game Insight
- Play With Purpose
- Constraints-Led (informed)
- Hybrid models

Each approach includes summary, characteristics, unique features, ideal contexts, age suitability, and planning implications.

### Thinking Player Framework

Evaluates lessons for learner centred, decision rich, questioning driven pedagogy. Returns a 0–100 score with strengths and weaknesses.

### Learner centred quality metric

Audits decision opportunities, questioning, autonomy, reflection, and tactical thinking. Flags overly teacher directed lessons with practical fixes.

### Tactical complexity ladders

Category-specific progression levels for invasion, net/wall, striking/fielding, and target games with `getTacticalComplexityLevel()` and `suggestNextComplexityStep()`.

### Curriculum by game category

Shared tactical problems, decision concepts, assessment opportunities, questioning prompts, and progression ideas per category — enabling cross-sport planning (e.g. football and basketball share invasion outcomes).

### Representative learning check

Flags non-representative activities (isolated cone dribbling, passing without opposition, drill-heavy plans) and suggests game-based alternatives.

### Questioning Engine V2

Six question categories with age bands (primary, lower secondary, upper secondary): observation, tactical, decision making, prediction, reflection, transfer.

### TGfU unit builder

Six-lesson unit progression: game appreciation → simple tactical problem → decision making → skill refinement → pressure/complexity → assessment game.

### Game performance assessment

Evidence statements for decision making, support play, movement off ball, positioning, communication, and tactical adaptation.

## New files

| File | Purpose |
|------|---------|
| `src/lib/peKnowledge/tgfuProgressions.ts` | Complexity ladders, unit progression, scheme tips |
| `src/lib/peKnowledge/tgfuCurriculum.ts` | Category curriculum and planning assistant summaries |
| `src/lib/peKnowledge/tgfuQualityChecks.ts` | Thinking player, representativeness, quality audit |

## Modified files

| File | Changes |
|------|---------|
| `src/lib/peKnowledge/tgfuMaster.ts` | GBA ecosystem, questioning V2, `classifyGame()` |
| `src/lib/peKnowledge/coaching.ts` | Pedagogy Coach metrics, quality insights, scheme V2 tips |
| `src/lib/peKnowledge/peKnowledgeIndex.ts` | Exports and GBA scoring boost |
| `components/pe-knowledge/PedagogyCoachPanel.tsx` | Compact thinking player / representative scores |
| `components/pe-knowledge/SchemeProgressionCoach.tsx` | Active lesson index for progression tips |

## Helper functions

| Helper | Returns |
|--------|---------|
| `classifyGame(sport)` | Category, label, GBA family |
| `evaluateThinkingPlayerScore(text)` | 0–100 score, strengths, weaknesses |
| `evaluateRepresentativeness(text)` | Score, flags, alternatives |
| `evaluateLearnerCentredQuality(text)` | Domain checks, teacher-directed warning |
| `getTacticalComplexityLevel(category, level)` | Complexity step |
| `suggestNextComplexityStep(category, current)` | Next ladder step |
| `buildTGfUUnitProgression(topic)` | Six-lesson unit outline |
| `buildPlanningAssistantCurriculumSummary(topic)` | Category, problem, complexity, prompts |
| `getTGfUQuestionsV2(category, ageBand)` | Age-appropriate question bank |
| `runTGfUQualityAudit(text)` | TGfU-specific warnings with fixes |
| `buildPedagogyCoachTGfUMetrics(lesson)` | Scores, strengths, risks, improvement |
| `getSchemeProgressionV2Tips(...)` | Complexity, retrieval, assessment, questioning |

## Planning capabilities

- **Planning Assistant**: Surfaces category, tactical problem, complexity level, questioning, differentiation, and assessment for game topics.
- **Pedagogy Coach**: Shows thinking player and representative learning scores with risks and suggested improvement.
- **Progression Coach**: Recommends tactical complexity progression, retrieval, assessment checkpoints, and questioning focus per scheme lesson.
- **Quality Checklist**: Adds learner centred and TGfU quality insights with actionable fixes.

## Future extension opportunities

- Visual tactical complexity ladder in Scheme Builder timeline
- Per-lesson complexity level tagging in lesson form
- GBA approach selector (TGfU vs Game Sense vs hybrid) influencing coach tone
- Video freeze-frame integration for Game Insight prompts
- Category-wide outcome mapping to Malta curriculum codes
- Pupil-facing self assessment cards from game performance evidence statements
