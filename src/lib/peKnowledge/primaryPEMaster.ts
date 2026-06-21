/**
 * Primary PE & Fundamental Movement Master Pack v1.
 * Original educational content — not copied from copyrighted sources.
 */

import type { PEKnowledgeEntry } from "./types";

export type PrimaryYearPhase = "early-years" | "lower-primary" | "upper-primary";

export type FMSCategory = "locomotor" | "stability" | "manipulative";

export interface PrimaryPEFrameworkArea {
  id: string;
  name: string;
  definition: string;
  whyItMatters: string;
  earlyYearsExamples: string[];
  lowerPrimaryExamples: string[];
  upperPrimaryExamples: string[];
  commonMistakes: string[];
  planningPrompts: string[];
  assessmentEvidence: string[];
  differentiationIdeas: string[];
  maltaRelevance: string[];
}

export interface FundamentalMovementSkill {
  id: string;
  name: string;
  category: FMSCategory;
  description: string;
  agePhaseRelevance: PrimaryYearPhase[];
  emergingIndicators: string[];
  developingIndicators: string[];
  competentIndicators: string[];
  commonErrors: string[];
  teachingCues: string[];
  practiceIdeas: string[];
  assessmentEvidence: string[];
  progressionIdeas: string[];
}

export interface MovementConceptCategory {
  id: string;
  name: string;
  concepts: string[];
  teachingPrompts: string[];
}

export interface PrimaryPEWarning {
  id: string;
  warning: string;
  whyItMatters: string;
  suggestedFix: string;
  teacherPrompt: string;
}

export const PRIMARY_PE_CORE_MESSAGE =
  "Primary PE builds fundamental movement skills, movement concepts, and confident participation through developmentally appropriate, inclusive, active lessons.";

export const PRIMARY_PE_FRAMEWORK: PrimaryPEFrameworkArea[] = [
  {
    id: "developmentally-appropriate",
    name: "Developmentally appropriate PE",
    definition: "Lessons match pupils' physical, cognitive, and social readiness — not mini-adult sport.",
    whyItMatters: "Appropriate tasks build competence and enjoyment; inappropriate tasks cause frustration and dropout.",
    earlyYearsExamples: ["Free exploration with simple boundaries", "Copy-move games with one cue"],
    lowerPrimaryExamples: ["Short skill blocks with play-based practice", "Pairs before large groups"],
    upperPrimaryExamples: ["Gradual rule introduction in modified games", "Self-selected challenge levels"],
    commonMistakes: ["Full sport rules too early", "Adult fitness drills"],
    planningPrompts: ["What can this year group actually do today?", "How will you simplify if needed?"],
    assessmentEvidence: ["Most pupils attempt task", "Few unsafe or off-task moments"],
    differentiationIdeas: ["Easier equipment size", "Fewer rules", "More space per pupil"],
    maltaRelevance: ["Mixed-age primary classes in some colleges", "Hall time limits need efficient structure"],
  },
  {
    id: "fundamental-movement-skills",
    name: "Fundamental movement skills",
    definition: "Locomotor, stability, and manipulative skills that underpin later sport and active life.",
    whyItMatters: "FMS gaps limit participation in games, dance, and lifelong activity.",
    earlyYearsExamples: ["Run, jump, roll on mats", "Throw soft objects into targets"],
    lowerPrimaryExamples: ["Overarm throw with step", "Two-foot jump for distance"],
    upperPrimaryExamples: ["Combine run and catch", "Dribble with control in space"],
    commonMistakes: ["Assuming skills are learned without teaching", "Sport before FMS"],
    planningPrompts: ["Which FMS is today's clear focus?", "How will pupils get many attempts?"],
    assessmentEvidence: ["Observable cue use", "Improved consistency across attempts"],
    differentiationIdeas: ["Lighter or larger equipment", "Closer targets", "Station choices"],
    maltaRelevance: ["Foundation for Malta primary curriculum movement outcomes"],
  },
  {
    id: "movement-concepts",
    name: "Movement concepts",
    definition: "Ideas about space, body, effort, and relationships that help pupils move with purpose.",
    whyItMatters: "Concept language helps pupils transfer skills across activities.",
    earlyYearsExamples: ["Personal space bubbles", "High and low shapes"],
    lowerPrimaryExamples: ["Pathways: straight, curved, zigzag", "Fast and slow movement"],
    upperPrimaryExamples: ["Open space in games", "Force control when sending objects"],
    commonMistakes: ["No concept vocabulary", "Only skill drills without context"],
    planningPrompts: ["Which concept words will you use today?", "How will pupils show the concept?"],
    assessmentEvidence: ["Pupil uses concept language", "Movement matches concept task"],
    differentiationIdeas: ["Visual floor markers", "Partner mirroring tasks"],
    maltaRelevance: ["Supports bilingual concept teaching in Maltese primary schools"],
  },
  {
    id: "body-management",
    name: "Body management",
    definition: "Balance, landing, rolling, and weight transfer for safe, controlled movement.",
    whyItMatters: "Body management reduces injury and builds confidence on apparatus and in games.",
    earlyYearsExamples: ["Log roll on mat", "Statue balance on one foot"],
    lowerPrimaryExamples: ["Safe two-foot landing", "Bridge and curl shapes"],
    upperPrimaryExamples: ["Controlled roll to stand", "Balance on low apparatus"],
    commonMistakes: ["Landing not taught", "Apparatus before balance readiness"],
    planningPrompts: ["Where must pupils land safely?", "What balance challenge fits this age?"],
    assessmentEvidence: ["Bent knees on landing", "Controlled balance hold"],
    differentiationIdeas: ["Lower apparatus", "Hand support allowed", "Wider balance base"],
    maltaRelevance: ["Essential in shared hall gymnastics rotations"],
  },
  {
    id: "manipulative-skills",
    name: "Manipulative skills",
    definition: "Sending, receiving, and controlling objects — throw, catch, kick, strike, dribble.",
    whyItMatters: "Object control unlocks games and cooperative play.",
    earlyYearsExamples: ["Roll ball to partner", "Two-hand catch of scarf"],
    lowerPrimaryExamples: ["Underarm throw to target", "Stop ball with feet"],
    upperPrimaryExamples: ["Catch while moving", "Strike balloon with hand or bat"],
    commonMistakes: ["One ball per large group", "Catching only with elite pupils"],
    planningPrompts: ["One object per pair where possible?", "Which send/receive focus today?"],
    assessmentEvidence: ["Successful send or receive attempts", "Eyes on object"],
    differentiationIdeas: ["Scarves or larger balls", "Station targets at varied distances"],
    maltaRelevance: ["Prepares for invasion and net games in middle school"],
  },
  {
    id: "rhythmic-movement",
    name: "Rhythmic movement",
    definition: "Movement to beat, pattern, and music — dance, skipping, and coordinated sequences.",
    whyItMatters: "Rhythm supports coordination, expression, and enjoyment.",
    earlyYearsExamples: ["March and stop to drum", "Copy simple action songs"],
    lowerPrimaryExamples: ["Skip with rope exploration", "Mirror dance phrases"],
    upperPrimaryExamples: ["Create 4-beat movement pattern", "Dance with travel and shape"],
    commonMistakes: ["Complex choreography too soon", "Public performance pressure"],
    planningPrompts: ["How will rhythm be felt before performed?", "Can pupils create part of the pattern?"],
    assessmentEvidence: ["Moves with beat", "Remembers short sequence"],
    differentiationIdeas: ["Simplified steps", "Leader-follower pairs"],
    maltaRelevance: ["Cultural dance links in Maltese primary festivals"],
  },
  {
    id: "cooperative-skills",
    name: "Cooperative skills",
    definition: "Working with others — sharing, taking turns, helping, and simple team tasks.",
    whyItMatters: "Cooperation enables safe, inclusive primary PE and prepares for CL structures.",
    earlyYearsExamples: ["Pass object in circle", "Partner copy tasks"],
    lowerPrimaryExamples: ["Cooperative relay with shared goal", "Pair obstacle carry"],
    upperPrimaryExamples: ["Team build-up games", "Peer feedback on one cue"],
    commonMistakes: ["Competition before cooperation", "Same pupils always paired as leaders"],
    planningPrompts: ["How will every pupil contribute?", "What turn-taking structure?"],
    assessmentEvidence: ["Shares equipment", "Encourages partner"],
    differentiationIdeas: ["Mixed-ability pairs with clear roles", "Cooperative not elimination scoring"],
    maltaRelevance: ["Supports inclusive mixed-gender primary classes"],
  },
  {
    id: "games-foundations",
    name: "Games foundations",
    definition: "Simple modified games that teach tactics without full sport complexity.",
    whyItMatters: "Game foundations build decision-making before formal sport units.",
    earlyYearsExamples: ["Chase and flee with tags", "Target knock-down"],
    lowerPrimaryExamples: ["Send and receive in pairs", "Simple territory with one ball"],
    upperPrimaryExamples: ["Small-sided invasion with few rules", "Striking to open space"],
    commonMistakes: ["Full football or basketball rules", "Elimination games"],
    planningPrompts: ["What is the one tactical idea?", "How few rules can you use?"],
    assessmentEvidence: ["Pupils understand aim of game", "Apply one tactical cue"],
    differentiationIdeas: ["Smaller playing area", "More balls in play"],
    maltaRelevance: ["Bridges to middle school sport pathways"],
  },
  {
    id: "lifetime-activity",
    name: "Lifetime activity foundations",
    definition: "Experiences that connect PE to activities pupils might enjoy beyond school.",
    whyItMatters: "Early positive experiences predict lifelong physical activity.",
    earlyYearsExamples: ["Outdoor exploration walk", "Playground movement challenges"],
    lowerPrimaryExamples: ["Swim readiness and water confidence", "Cycle balance activities"],
    upperPrimaryExamples: ["Personal activity choice station", "Family activity challenge homework"],
    commonMistakes: ["Only competitive sport modelled", "No talk of activity outside school"],
    planningPrompts: ["What activity might pupils try at home?", "Where is enjoyment visible?"],
    assessmentEvidence: ["Pupil names enjoyed activity", "Willingness to re-engage"],
    differentiationIdeas: ["Non-competitive personal goals", "Variety of activity types"],
    maltaRelevance: ["Links to Maltese community sport and outdoor life"],
  },
  {
    id: "child-fitness",
    name: "Physical fitness for children",
    definition: "Health-related fitness through play and personal improvement — not adult training.",
    whyItMatters: "Enjoyable fitness builds energy, habit, and body confidence.",
    earlyYearsExamples: ["Animal walks circuit", "Fast-slow running game"],
    lowerPrimaryExamples: ["Personal best jump or step count", "Obstacle course with rest"],
    upperPrimaryExamples: ["Interval games with built-in recovery", "Track own effort not rank"],
    commonMistakes: ["Public ranking", "Burpees or punitive fitness"],
    planningPrompts: ["How is fitness hidden in play?", "How do pupils track personal improvement?"],
    assessmentEvidence: ["Sustained moderate activity", "Self-reported effort"],
    differentiationIdeas: ["Choice of station intensity", "No comparison boards"],
    maltaRelevance: ["Supports health education cross-curricular links"],
  },
  {
    id: "inclusive-primary",
    name: "Inclusive primary PE",
    definition: "All pupils access meaningful movement regardless of SEND, confidence, size, or language.",
    whyItMatters: "Inclusion in primary PE prevents early disengagement.",
    earlyYearsExamples: ["Sensory-friendly equipment choices", "Visual routine cards"],
    lowerPrimaryExamples: ["Adapted rules for all to succeed", "LSA-supported stations"],
    upperPrimaryExamples: ["Alternative WILF for same intention", "Peer helper roles"],
    commonMistakes: ["One task for all with no adaptation", "Anxious pupils sidelined"],
    planningPrompts: ["Who might struggle and how will you adapt?", "What success looks like for each pupil?"],
    assessmentEvidence: ["All pupils active most of lesson", "Adapted success observed"],
    differentiationIdeas: ["Equipment choice", "Simplified rules", "Confidence-first progression"],
    maltaRelevance: ["LSA and mixed-ability Maltese primary context"],
  },
  {
    id: "safe-active-design",
    name: "Safe active lesson design",
    definition: "Organisation that maximises activity while managing space, equipment, and transitions safely.",
    whyItMatters: "Poor organisation creates waiting, chaos, and injury risk.",
    earlyYearsExamples: ["Clear boundary cones", "One-way travel around space"],
    lowerPrimaryExamples: ["Stations with visual start points", "Equipment carried safely"],
    upperPrimaryExamples: ["Group size matched to space", "Landing zones marked"],
    commonMistakes: ["Long queues", "Unclear boundaries", "Too much equipment at once"],
    planningPrompts: ["How many pupils active at once?", "What are transition signals?"],
    assessmentEvidence: ["Smooth transitions", "Safe spacing observed"],
    differentiationIdeas: ["Parallel tasks", "Multiple small groups"],
    maltaRelevance: ["Critical in limited Maltese hall slots"],
  },
];

function fms(
  id: string,
  name: string,
  category: FMSCategory,
  description: string,
  phases: PrimaryYearPhase[],
  cues: string[],
  practice: string[],
  errors: string[]
): FundamentalMovementSkill {
  return {
    id,
    name,
    category,
    description,
    agePhaseRelevance: phases,
    emergingIndicators: [`Attempts ${name.toLowerCase()} with support`, "Inconsistent form"],
    developingIndicators: [`Uses one teaching cue during ${name.toLowerCase()}`, "Growing consistency"],
    competentIndicators: [`Performs ${name.toLowerCase()} with control in simple task`, "Applies cue without prompt"],
    commonErrors: errors,
    teachingCues: cues,
    practiceIdeas: practice,
    assessmentEvidence: [`Observe: ${cues[0] ?? "control"}`, "Count successful attempts in 1 minute"],
    progressionIdeas: ["Explore → practise → refine → combine → apply"],
  };
}

export const FUNDAMENTAL_MOVEMENT_SKILLS: FundamentalMovementSkill[] = [
  fms("walking", "Walking", "locomotor", "Controlled travel on feet with alternating steps.", ["early-years", "lower-primary"], ["Tall posture", "Quiet feet", "Eyes forward"], ["Walk on lines", "Slow-fast walk game"], ["Flat feet stomping", "Arms stiff"]),
  fms("running", "Running", "locomotor", "Fast locomotion with flight phase and arm drive.", ["early-years", "lower-primary", "upper-primary"], ["High knees", "Pump arms", "Look ahead"], ["Relay runs in pairs", "Animal run game"], ["Leaning too far", "Looking down"]),
  fms("hopping", "Hopping", "locomotor", "Take-off and landing on same foot.", ["early-years", "lower-primary"], ["Soft landing", "Balance on one foot", "Swing arms"], ["Hop along tape line", "Hopscotch"], ["Landing stiff", "Losing balance"]),
  fms("jumping", "Jumping", "locomotor", "Two-foot take-off and landing for height or distance.", ["early-years", "lower-primary", "upper-primary"], ["Bend knees", "Swing arms", "Land on two feet"], ["River jump markers", "Personal best standing jump"], ["One-foot landing", "No arm swing"]),
  fms("leaping", "Leaping", "locomotor", "Long stride with flight from one foot to the other.", ["lower-primary", "upper-primary"], ["Reach forward", "Soft landing", "Eyes on landing"], ["Leap over low obstacles", "Leaping pathways"], ["Short steps only", "Landing off balance"]),
  fms("galloping", "Galloping", "locomotor", "Forward travel with lead foot stepping and trailing foot closing.", ["early-years", "lower-primary"], ["Lead foot first", "Stay low", "Smooth rhythm"], ["Gallop to signal", "Mirror partner gallop"], ["Both feet same pattern as run", "Stiff upper body"]),
  fms("sliding", "Sliding", "locomotor", "Sideways travel with sideways-facing body.", ["lower-primary", "upper-primary"], ["Side-on", "Step-close", "Stay low"], ["Slide along court line", "Side shuffle to target"], ["Crossing feet", "Facing wrong direction"]),
  fms("skipping", "Skipping", "locomotor", "Step-hop rhythm with alternating feet.", ["lower-primary", "upper-primary"], ["Step-hop", "Swing rope or arms", "Light feet"], ["Skip in personal space", "Skip and turn"], ["Double hop", "Rope timing wrong"]),
  fms("balancing", "Balancing", "stability", "Maintain body control in still or moving positions.", ["early-years", "lower-primary", "upper-primary"], ["Focus point", "Tight core", "Still arms"], ["Statue game", "Balance on line"], ["Wobbling base", "Arms flapping uncorrected"]),
  fms("bending", "Bending", "stability", "Flex at joints to lower or curl body.", ["early-years", "lower-primary"], ["Bend knees not back", "Smooth movement"], ["Touch cone bends", "Shape making"], ["Rounded back bend", "Locked knees"]),
  fms("stretching", "Stretching", "stability", "Extend body into open shapes safely.", ["early-years", "lower-primary"], ["Long shape", "Hold still", "Breathe"], ["Reach high and wide", "Partner mirror stretch"], ["Bouncing stretch", "Over-extending"]),
  fms("twisting", "Twisting", "stability", "Rotate body parts around central axis.", ["early-years", "lower-primary"], ["Feet stay still", "Twist shoulders", "Control return"], ["Twist and freeze", "Pass object around body"], ["Feet moving", "Fast uncontrolled spin"]),
  fms("turning", "Turning", "stability", "Change direction of body orientation while travelling.", ["early-years", "lower-primary", "upper-primary"], ["Small steps", "Eyes lead turn", "Balance after turn"], ["Turn on signal", "Travel and turn pathways"], ["Large uncontrolled turns", "Dizziness ignored"]),
  fms("rolling", "Rolling", "stability", "Rotate body on ground through tuck or log roll.", ["early-years", "lower-primary"], ["Chin tucked", "Round back", "Push with feet"], ["Log roll on mat", "Egg roll"], ["Head contact", "Straight stiff body"]),
  fms("landing", "Landing", "stability", "Safe absorption of force on feet or hands.", ["early-years", "lower-primary", "upper-primary"], ["Bend knees", "Quiet feet", "Land on balls of feet"], ["Jump and stick", "Drop from low step"], ["Straight legs", "Landing on heels only"]),
  fms("weight-transfer", "Transferring weight", "stability", "Shift body weight between feet, hands, or apparatus.", ["lower-primary", "upper-primary"], ["Strong base", "Control shift", "Eyes on balance"], ["Weight shift on bench", "Lunge patterns"], ["Collapsed base", "Rushed transfer"]),
  fms("throwing", "Throwing", "manipulative", "Propel object through air with hand or arm action.", ["early-years", "lower-primary", "upper-primary"], ["Eyes on target", "Step opposite foot", "Follow through"], ["Throw into hoop", "Partner throw and catch"], ["Not stepping", "Pushing not throwing"]),
  fms("catching", "Catching", "manipulative", "Receive and control moving object with hands or body.", ["early-years", "lower-primary", "upper-primary"], ["Hands ready", "Watch ball", "Bring to body"], ["Scarf catch", "Self-toss catch"], ["Turning away", "Hard hands"]),
  fms("kicking", "Kicking", "manipulative", "Strike ball with foot while standing or moving.", ["early-years", "lower-primary", "upper-primary"], ["Plant foot beside ball", "Contact with laces", "Follow through"], ["Kick to target", "Dribble slowly"], ["Toe poke only", "Looking up too early"]),
  fms("striking", "Striking", "manipulative", "Hit object with hand or implement.", ["lower-primary", "upper-primary"], ["Side-on", "Eyes on object", "Swing through"], ["Strike balloon", "Tap cone with bat"], ["Wrong grip", "Stopping swing early"]),
  fms("dribbling", "Dribbling", "manipulative", "Control object while moving in space.", ["lower-primary", "upper-primary"], ["Soft touches", "Eyes up", "Close control"], ["Slow dribble slalom", "Hand dribble relay"], ["Heavy touches", "Staring at ball only"]),
  fms("volleying", "Volleying", "manipulative", "Send object upward before it lands.", ["upper-primary"], ["Flat platform", "Bend knees", "Lift not slap"], ["Volley balloon", "Partner keep-up"], ["Swatting", "Feet planted stiff"]),
  fms("rolling-object", "Rolling an object", "manipulative", "Send ball along ground to target or partner.", ["early-years", "lower-primary"], ["Bowling arm swing", "Release low", "Aim at target"], ["Roll to hit cone", "Partner roll back"], ["Bouncing instead of rolling", "Wrong direction"]),
  fms("trapping", "Trapping", "manipulative", "Stop moving object with feet or body.", ["lower-primary", "upper-primary"], ["Foot on top", "Soft cushion", "Balance after trap"], ["Roll and trap", "Pass and stop"], ["Hard kick at trap", "Loss of balance"]),
];

export const MOVEMENT_CONCEPTS_FRAMEWORK: MovementConceptCategory[] = [
  {
    id: "space",
    name: "Space",
    concepts: ["Personal space", "General space", "Direction", "Pathway", "Levels"],
    teachingPrompts: ["Show me personal space", "Travel on a curved pathway", "Move at a low level"],
  },
  {
    id: "body",
    name: "Body",
    concepts: ["Body parts", "Shapes", "Balance", "Weight transfer"],
    teachingPrompts: ["Make a wide shape", "Balance on three body parts", "Transfer weight forward"],
  },
  {
    id: "effort",
    name: "Effort",
    concepts: ["Speed", "Force", "Flow"],
    teachingPrompts: ["Move fast then slow", "Send with soft force", "Smooth flowing movement"],
  },
  {
    id: "relationships",
    name: "Relationships",
    concepts: ["With others", "With equipment", "With boundaries", "With rhythm"],
    teachingPrompts: ["Mirror your partner", "Keep ball inside boundary", "Move with the beat"],
  },
];

export const PRIMARY_PE_WARNINGS: PrimaryPEWarning[] = [
  { id: "too-sport-specific", warning: "Lesson too sport specific for age", whyItMatters: "Full sport rules exceed primary cognitive and skill readiness.", suggestedFix: "Use simple sending, receiving, or target game instead.", teacherPrompt: "What is the one movement idea behind this game?" },
  { id: "too-much-waiting", warning: "Too much waiting", whyItMatters: "Primary pupils learn by doing — waiting reduces activity and engagement.", suggestedFix: "Use stations, pairs, or multiple balls.", teacherPrompt: "How many pupils are moving in the first minute?" },
  { id: "no-fms", warning: "No fundamental movement focus", whyItMatters: "Without FMS focus, activity is fun but learning is unclear.", suggestedFix: "Name one locomotor, stability, or manipulative skill in WILF.", teacherPrompt: "Today's skill focus is…" },
  { id: "unclear-learning", warning: "Activity is fun but learning unclear", whyItMatters: "Enjoyment needs a clear movement intention.", suggestedFix: "Link WALT to one observable skill or concept.", teacherPrompt: "You will know learning happened when…" },
  { id: "rules-complex", warning: "Rules too complex", whyItMatters: "Complex rules reduce practice time and confuse younger pupils.", suggestedFix: "One rule at a time; add only when first is secure.", teacherPrompt: "What is the only rule that matters right now?" },
  { id: "equipment-age", warning: "Equipment not age appropriate", whyItMatters: "Oversized or heavy equipment causes failure and safety issues.", suggestedFix: "Use lighter, larger, or softer equipment.", teacherPrompt: "Can every pupil succeed with this equipment?" },
  { id: "competition-early", warning: "Competition too early", whyItMatters: "Early competition can humiliate and exclude less skilled pupils.", suggestedFix: "Cooperative challenge or personal best.", teacherPrompt: "How do all pupils experience success?" },
  { id: "no-inclusion", warning: "No inclusion adaptation", whyItMatters: "Some pupils cannot access the same task without adaptation.", suggestedFix: "Offer equipment choice or simplified rule.", teacherPrompt: "Who needs a different way to succeed?" },
  { id: "no-assessment", warning: "No assessment evidence", whyItMatters: "Quick observation guides next lesson progression.", suggestedFix: "Plan one thing to watch for in final practice.", teacherPrompt: "I will look for…" },
  { id: "no-concept-language", warning: "No movement concept language", whyItMatters: "Concept words help transfer across units.", suggestedFix: "Add one space, body, effort, or relationship cue.", teacherPrompt: "Use words like pathway, level, or force today." },
];

export const PRIMARY_PE_MASTER_PE_ENTRY: PEKnowledgeEntry = {
  id: "primary-pe-master",
  title: "Primary PE & Fundamental Movement",
  category: "child-development",
  summary: PRIMARY_PE_CORE_MESSAGE,
  keyPrinciples: PRIMARY_PE_FRAMEWORK.map((a) => a.name),
  whyItMattersInPE: "Primary PE lays the movement foundation for confidence, health, and later sport.",
  whenToUse: [
    "Year 1–6 and early years PE planning",
    "Fundamental movement skill units",
    "Inclusive primary lesson design",
    "Scheme progression for FMS",
  ],
  commonMistakes: PRIMARY_PE_WARNINGS.slice(0, 5).map((w) => w.warning),
  practicalApplications: PRIMARY_PE_FRAMEWORK.slice(0, 4).map((a) => `${a.name}: ${a.lowerPrimaryExamples[0]}`),
  lessonPlanningPrompts: PRIMARY_PE_FRAMEWORK.flatMap((a) => a.planningPrompts).slice(0, 6),
  assessmentPrompts: PRIMARY_PE_FRAMEWORK.flatMap((a) => a.assessmentEvidence).slice(0, 4),
  differentiationPrompts: PRIMARY_PE_FRAMEWORK.flatMap((a) => a.differentiationIdeas).slice(0, 4),
  agePhaseRelevance: ["early-years", "primary", "all"],
  pathwayRelevance: ["all"],
  relatedModels: ["physical-literacy-overview", "cooperative-learning", "tpsr-master", "tgfu-master"],
  tags: ["primary-pe", "fms", "fundamental-movement", "locomotor", "manipulative", "movement-concepts", "early-years", "inclusion"],
};

export function isPrimaryPEYearGroup(yearGroup?: string): boolean {
  if (!yearGroup) return false;
  const y = yearGroup.toLowerCase();
  return /year-[1-6]|early.?years|kg1|kg2|primary/i.test(y);
}

export function yearGroupToPrimaryPhase(yearGroup?: string): PrimaryYearPhase {
  if (!yearGroup) return "lower-primary";
  const y = yearGroup.toLowerCase();
  if (/early|kg|year-1|year-2/i.test(y)) return "early-years";
  if (/year-[3-4]/i.test(y)) return "lower-primary";
  return "upper-primary";
}

export function isPrimaryPERelevant(text: string, yearGroup?: string): boolean {
  if (isPrimaryPEYearGroup(yearGroup)) return true;
  return /\b(primary|year [1-6]|early years|fms|fundamental movement|locomotor|hop|skip|throw|catch|kg1)\b/i.test(text);
}

export function getFMSSkillById(id: string): FundamentalMovementSkill | undefined {
  return FUNDAMENTAL_MOVEMENT_SKILLS.find((s) => s.id === id);
}

export function getFMSSkillsByCategory(category: FMSCategory): FundamentalMovementSkill[] {
  return FUNDAMENTAL_MOVEMENT_SKILLS.filter((s) => s.category === category);
}
