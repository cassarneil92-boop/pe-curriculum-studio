# Curriculum Audit Report

**Audited:** 2026-06-10T00:59:25.006Z
**Import snapshot:** 2026-06-10T00:59:24.636Z
**Data directory:** `C:\Users\User\Desktop\pe-curriculum-studio\src\lib\curriculum\data`

## Summary

- **Total learning outcomes:** 569
- **Pathways with data:** 5
- **Topics:** 23
- **Skills:** 28
- **Value records:** 27
- **Source files processed:** 13
- **Ignored files:** 2

## Outcome counts by pathway

Pathway                | Outcomes
---------------------- | --------
Secondary PE           | 393     
Early Years PE         | 69      
ALP Sports Vocational  | 59      
ALP Physical Education | 38      
PE Option SEC          | 10      

## Outcome counts by year group

Year group        | Outcomes
----------------- | --------
Gifted & Talented | 68      
Year 1            | 89      
Year 10           | 88      
Year 11           | 89      
Year 2            | 89      
Year 3            | 25      
Year 4            | 25      
Year 5            | 29      
Year 6            | 29      
Year 7            | 86      
Year 8            | 86      
Year 9            | 79      

## Outcome counts by topic

Topic                  | Outcomes
---------------------- | --------
ALP Physical Education | 69      
Holistic Development   | 62      
Outdoor Recreation     | 57      
Educational Dance      | 47      
Fitness                | 44      
ALP Sports Vocational  | 42      
Healthy Lifestyle      | 38      
Gymnastics             | 38      
Athletics              | 32      
Invasion Games         | 30      
Martial Arts           | 21      
Swimming / Aquatics    | 20      
Sport Values           | 16      
Net Games              | 13      
Football               | 11      
Volleyball             | 8       
Games                  | 6       
Teamwork               | 4       
Handball               | 4       
PE Option Theory       | 3       
Basketball             | 2       
Hockey                 | 1       
Leadership             | 1       

## Outcome counts by skill

Skill         | Outcomes
------------- | --------
Movement      | 88      
Cooperation   | 52      
Balance       | 40      
Passing       | 38      
Communication | 32      
Shooting      | 29      
Running       | 26      
Defending     | 25      
Attacking     | 19      
Throwing      | 18      
Speed         | 17      
Analysis      | 17      
Endurance     | 16      
Jumping       | 16      
Safety        | 16      
Officiating   | 15      
Strength      | 15      
Sprinting     | 13      
Landing       | 11      
Catching      | 9       
Receiving     | 7       
Kicking       | 6       
Travelling    | 6       
Rolling       | 5       
Flexibility   | 4       
Dribbling     | 4       
Coordination  | 3       
Agility       | 2       

## Outcome counts by value theme

Theme          | Outcomes | Value records
-------------- | -------- | -------------
respect        | 9        | 9            
fair-play      | 3        | 3            
responsibility | 3        | 3            
teamwork       | 2        | 2            
discipline     | 2        | 2            
inclusion      | 2        | 2            
leadership     | 1        | 1            
excellence     | 1        | 1            
match-fixing   | 1        | 1            
perseverance   | 1        | 1            
communication  | 1        | 1            
commitment     | 1        | 1            

## Issues

### Duplicate outcomes

- **description** `recall one idea-generating tool, for example: brainstorming, discussion, consider all factors.` — 2 records across pathways: alp-pe, alp-sports-vocational
- **description** `plan ahead in programming and everyday life.` — 2 records across pathways: alp-pe, alp-sports-vocational
- **description** `think creatively in different situations.` — 2 records across pathways: alp-pe, alp-sports-vocational
- **description** `complete a sequence of skills and actions leading to the main aim of the sport (e.g. passing to score a goal).` — 2 records across pathways: alp-sports-vocational
- **description** `i can create and copy different footwork movements using different implements such as ‘square’, ‘hexagon’.` — 2 records across pathways: secondary-pe
- **description** `i can perform with precision and accuracy in a team sport. i can observe a performance, collect relevant data and interv` — 2 records across pathways: pe-option-sec
- **description** `work harmoniously in a team to achieve team goals in practice and during play.` — 2 records across pathways: secondary-pe
- **description** `show discipline in practice situations and in games or competitions.` — 2 records across pathways: secondary-pe
- **description** `participate and compete fairly in sports.` — 2 records across pathways: secondary-pe
- **description** `ensures inclusion in practice and games or competition.` — 2 records across pathways: secondary-pe
- **description** `shows respect to others during practice and games.` — 2 records across pathways: secondary-pe
- **description** `show responsible behaviour during practice and play situations.` — 2 records across pathways: secondary-pe

### Outcomes missing year groups

**97** outcomes without year groups.
- ALP Sports Vocational: 59
- ALP Physical Education: 38

### Outcomes missing topics

**0** outcomes with missing or generic topics.

### Outcomes missing skills

**228** outcomes without skills.
- Secondary PE: 106
- Early Years PE: 59
- ALP Sports Vocational: 31
- ALP Physical Education: 28
- PE Option SEC: 4

### Outcomes missing values

**544** outcomes without linked values.

### Pathways with weak coverage

#### ALP Physical Education (38 outcomes)
- All 38 outcomes lack year groups.
- _Recommendation:_ Map year groups from source documents or import-sources.json defaults.

#### ALP Sports Vocational (59 outcomes)
- All 59 outcomes lack year groups.
- _Recommendation:_ Map year groups from source documents or import-sources.json defaults.

#### PE Option SEC (10 outcomes)
- Only 10 outcomes (threshold: 25). SEC syllabus deduplication may be collapsing multi-year LO variants.
- _Recommendation:_ Verify SEC32 PDF extraction retains all 10 subject-focus outcomes per cycle.

### Absent pathways (no imported data)

- **Primary PE** (`primary-pe`): Primary outcomes may be embedded in Secondary PE syllabus (F2–F6 codes) without a dedicated pathway split.
- **Middle School PE** (`middle-school-pe`): IM 36 sources intentionally excluded (scope up to Form 5).
- **Fitness Curriculum** (`fitness-curriculum`): Fitness PDFs present but produced zero extractable outcomes.

---

_Generated by `npm run audit-curriculum`. Audit-only — imported data was not modified._
