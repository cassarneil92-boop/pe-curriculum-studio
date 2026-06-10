# Curriculum Metadata Audit

Audited at: 2026-06-10T20:17:10.364Z

## Summary

- Knowledge base outcomes audited: **17**
- Imported JSON outcomes audited: **569**
- Combined records reviewed: **586**
- Imported outcomes enhanced (skillIds added): **0**
- Knowledge base outcomes enhanced: **8**
- Outcomes with no skillIds (imported): **176**
- Outcomes with missing topicIds (imported): **0**
- Under-tagged topic/pathway groups flagged: **17**

## Skills added to metadata registry

- `pacing`
- `technique`
- `serving`
- `setting`
- `digging`
- `blocking`
- `spiking`
- `positioning`
- `teamwork`
- `leadership`
- `responsibility`
- `fair-play`
- `inclusion`
- `empathy`
- `respect`
- `rules`
- `decision-making`
- `tactics`
- `risk-management`
- `problem-solving`
- `orientation`
- `coaching`
- `organisation`
- `employability`
- `event-management`
- `choreography`
- `rhythm`
- `expression`
- `performance`
- `body-control`
- `apparatus`
- `sequencing`
- `circuit-training`
- `fitness-testing`

## Under-tagged areas (sample)

### ALP Physical Education (early-years-pe)
- Outcomes: 69
- Current skills: balance, catching, communication, coordination, decision-making, expression, kicking, movement, throwing
- Likely missing: —
- Flags: outcomes-without-skills
- Sources: Kinder_1_and_2_Level_3_LOP_Sept_2018 (1).pdf

### ALP Sports Vocational (alp-sports-vocational)
- Outcomes: 42
- Current skills: analysis, apparatus, communication, cooperation, decision-making, flexibility, leadership, officiating, passing, performance, respect, responsibility, rules, safety, sequencing, shooting, sprinting, tactics, technique
- Likely missing: —
- Flags: outcomes-without-skills
- Sources: ACCREDITED ALP SPORTS LOs.docx; ALP supplementary LOS - L2.docx

### Educational Dance (secondary-pe)
- Outcomes: 47
- Current skills: analysis, attacking, balance, body-control, choreography, communication, expression, finishing, flexibility, jumping, movement, performance, positioning, rhythm, running, safety, sequencing, shooting, speed, strength, technique
- Likely missing: —
- Flags: outcomes-without-skills
- Sources: PE_syllabus_Learning_Outcomes_latest.pdf

### Games (secondary-pe)
- Outcomes: 6
- Current skills: dribbling, passing, receiving, shooting
- Likely missing: —
- Flags: outcomes-without-skills
- Sources: PE_syllabus_Learning_Outcomes_latest.pdf

### Healthy Lifestyle (alp-pe)
- Outcomes: 36
- Current skills: communication, cooperation, empathy, expression, flexibility, performance, safety, sequencing
- Likely missing: —
- Flags: outcomes-without-skills
- Sources: ALP Supplementary LOs for PE_Lifeskills_Healthy Lifestyle.docx

### Healthy Lifestyle (pe-option-sec)
- Outcomes: 1
- Current skills: —
- Likely missing: —
- Flags: outcomes-without-skills
- Sources: SEC32PhysicalEducation2026.pdf

### Holistic Development (secondary-pe)
- Outcomes: 62
- Current skills: analysis, attacking, circuit-training, coaching, communication, cooperation, defending, leadership, movement, officiating, performance, positioning, responsibility, rules, safety, shooting, strength, tactics
- Likely missing: —
- Flags: outcomes-without-skills
- Sources: PE_syllabus_Learning_Outcomes_latest.pdf

### Outdoor Recreation (secondary-pe)
- Outcomes: 56
- Current skills: catching, cooperation, decision-making, endurance, leadership, orientation, passing, performance, positioning, rules, running, safety, shooting, technique, throwing, travelling
- Likely missing: —
- Flags: outcomes-without-skills
- Sources: PE_syllabus_Learning_Outcomes_latest.pdf

### PE Option Theory (pe-option-sec)
- Outcomes: 3
- Current skills: —
- Likely missing: —
- Flags: outcomes-without-skills, generic-skills-overused
- Sources: SEC32PhysicalEducation2026.pdf

### athletics (primary-pe)
- Outcomes: 1
- Current skills: running
- Likely missing: sprinting, technique
- Flags: single-skill-but-text-suggests-more, likely-missing-skills
- Sources: KNOWLEDGE_BASE

### basketball (middle-school-pe)
- Outcomes: 1
- Current skills: passing, receiving
- Likely missing: performance
- Flags: likely-missing-skills
- Sources: KNOWLEDGE_BASE

### fitness (fitness-curriculum)
- Outcomes: 2
- Current skills: endurance, strength
- Likely missing: performance
- Flags: likely-missing-skills
- Sources: KNOWLEDGE_BASE

### gymnastics (primary-pe)
- Outcomes: 1
- Current skills: balance
- Likely missing: apparatus, performance, sequencing
- Flags: single-skill-but-text-suggests-more, likely-missing-skills
- Sources: KNOWLEDGE_BASE

### handball (primary-pe)
- Outcomes: 3
- Current skills: passing, receiving, throwing
- Likely missing: technique
- Flags: likely-missing-skills
- Sources: KNOWLEDGE_BASE

### handball (secondary-pe)
- Outcomes: 2
- Current skills: passing, receiving, shooting, throwing
- Likely missing: defending
- Flags: likely-missing-skills
- Sources: KNOWLEDGE_BASE

### handball (pe-option-sec)
- Outcomes: 1
- Current skills: passing, receiving
- Likely missing: analysis
- Flags: likely-missing-skills
- Sources: KNOWLEDGE_BASE

### handball (alp-pe)
- Outcomes: 1
- Current skills: passing, receiving
- Likely missing: leadership
- Flags: likely-missing-skills
- Sources: KNOWLEDGE_BASE

## Remaining manual review

- Outcomes tagged to generic topics (games, net-games, invasion-games) may need topic refinement — not auto-changed.
- Some imported outcomes have mis-tagged skills (e.g. Shooting on sprint outcomes) — review athletics A10.x rows manually.
- KNOWLEDGE_BASE remains the alignment engine source; imported outcomes enrich filters only.
- Value tagging (values[]) was not auto-expanded in this pass.
- Duplicate topic slugs across pathways are expected (e.g. volleyball under secondary-pe and alp-sports-vocational).

## Limitations

- Skill inference is text-pattern based; ambiguous phrases are not auto-tagged.
- Descriptions are never modified; only skillIds/skills metadata may be enriched.
- Curriculum Hub uses imported outcomes; Lesson Builder and Schemes use unified enhanced outcomes for filters.
- Strict alignment engine still reads raw KNOWLEDGE_BASE learning outcomes.
---

## Planning layer stabilization

Unified planning source: `src/lib/curriculum/planning/planning-outcomes.ts`

- `getPlanningOutcomes()` = imported JSON + KNOWLEDGE_BASE + metadata enhancement + planning skill corrections
- Strict alignment engine remains KNOWLEDGE_BASE only (`alignCurriculumFromInput`)
- Lesson Builder, Schemes, Curriculum Hub, Curriculum Tester, and Curriculum Coverage use the planning layer for topic/skill options

### Outcome counts

- Planning layer outcomes: **586**
- Strict KB outcomes: **17**
- Imported / enhanced outcomes in planning layer: **569**

### Generic topic groups (manual review)

Broad curriculum topic ids are displayed with friendly labels but not retagged to specific sports:

- `games` → Games
- `invasion-games` → Invasion Games
- `net-games` → Net Games
- `holistic-development` → Holistic Development
- `teamwork` → Teamwork
- `leadership` → Leadership
- `sport-values` → Sport Values
- `healthy-lifestyle` → Healthy Lifestyle
- `outdoor-recreation` → Outdoor Recreation
- `educational-dance` → Educational Dance
- `alp-physical-education` → ALP Physical Education
- `alp-sports-vocational` → ALP Sports Vocational

### Skill corrections applied in planning layer

- `lo-secondary-pe-a10-2`: removed `shooting` — Planning-layer correction from outcome text

### Remaining limitations

- Strict alignment uses the primary (first) app pathway when multiple pathways are selected
- Full multi-pathway strict alignment is not yet implemented
- Some imported outcomes may still have weak or missing skill tags pending manual review
- Generic topic groups (games, invasion-games, net-games, etc.) remain broad curriculum areas
- Curriculum Coverage strict checks remain KB-only; planning layer supplements visibility
