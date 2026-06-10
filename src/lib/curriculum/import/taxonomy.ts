/**
 * Canonical PE topic and skill taxonomy for import tagging.
 * Used for keyword inference only — never creates new learning outcomes.
 */

export const CANONICAL_TOPICS = [
  "Football",
  "Handball",
  "Basketball",
  "Volleyball",
  "Netball",
  "Rugby",
  "Hockey",
  "Invasion Games",
  "Net Games",
  "Striking and Fielding Games",
  "Athletics",
  "Gymnastics",
  "Educational Dance",
  "Outdoor Recreation",
  "Fitness",
  "Swimming / Aquatics",
  "Healthy Lifestyle",
  "Teamwork",
  "Leadership",
  "Sport Values",
  "PE Option Theory",
  "ALP Physical Education",
  "ALP Sports Vocational",
] as const;

export const CANONICAL_SKILLS = [
  "Passing",
  "Receiving",
  "Throwing",
  "Catching",
  "Kicking",
  "Dribbling",
  "Shooting",
  "Defending",
  "Attacking",
  "Movement",
  "Running",
  "Sprinting",
  "Jumping",
  "Landing",
  "Balance",
  "Rolling",
  "Travelling",
  "Coordination",
  "Agility",
  "Strength",
  "Endurance",
  "Flexibility",
  "Speed",
  "Communication",
  "Cooperation",
  "Officiating",
  "Analysis",
  "Safety",
] as const;

export type CanonicalTopic = (typeof CANONICAL_TOPICS)[number];
export type CanonicalSkill = (typeof CANONICAL_SKILLS)[number];

export interface TopicPattern {
  topic: CanonicalTopic;
  patterns: RegExp[];
  /** Higher priority wins when multiple topics match. */
  priority?: number;
}

export interface SkillPattern {
  skill: CanonicalSkill;
  patterns: RegExp[];
}

/** Topic labels that should be refined when a more specific match exists. */
export const GENERIC_TOPIC_IDS = new Set([
  "general",
  "games",
  "sport",
  "fundamentals",
  "individual-activity",
  "supplementary-studies",
  "holistic-development",
  "communication",
  "empathy",
  "ict",
  "home-economics",
  "nutrition",
  "physical-wellbeing",
  "mental-wellbeing",
  "life-skills",
  "physical-education",
  "pe",
]);

export const TOPIC_PATTERNS: TopicPattern[] = [
  { topic: "Football", patterns: [/\bfootball\b/i, /\bsoccer\b/i], priority: 100 },
  { topic: "Handball", patterns: [/\bhandball\b/i], priority: 100 },
  { topic: "Basketball", patterns: [/\bbasketball\b/i], priority: 100 },
  { topic: "Volleyball", patterns: [/\bvolleyball\b/i], priority: 100 },
  { topic: "Netball", patterns: [/\bnetball\b/i], priority: 100 },
  { topic: "Rugby", patterns: [/\brugby\b/i], priority: 100 },
  { topic: "Hockey", patterns: [/\bhockey\b/i, /\bfield hockey\b/i], priority: 100 },
  {
    topic: "Striking and Fielding Games",
    patterns: [
      /\bstriking and fielding\b/i,
      /\brounders\b/i,
      /\bcricket\b/i,
      /\bsoftball\b/i,
      /\bbaseball\b/i,
      /\bbatting\b/i,
      /\bfielding\b/i,
    ],
    priority: 90,
  },
  {
    topic: "Invasion Games",
    patterns: [
      /\binvasion games?\b/i,
      /\bpossession\b/i,
      /\b1vs1\b/i,
      /\b2vs2\b/i,
      /\boverlap\b/i,
      /\bbackdoor\b/i,
    ],
    priority: 70,
  },
  {
    topic: "Net Games",
    patterns: [/\bnet games?\b/i, /\bbadminton\b/i, /\btennis\b/i, /\boverhead pass\b/i],
    priority: 70,
  },
  { topic: "Athletics", patterns: [/\bathletics\b/i, /\btrack\b/i, /\bfield events?\b/i], priority: 85 },
  {
    topic: "Gymnastics",
    patterns: [/\bgymnastics\b/i, /\bapparatus\b/i, /\bvault\b/i, /\bbeam\b/i, /\bfloor routine\b/i],
    priority: 85,
  },
  {
    topic: "Educational Dance",
    patterns: [/\beducational dance\b/i, /\bdance\b/i, /\bchoreograph/i, /\brhythm\b/i],
    priority: 80,
  },
  {
    topic: "Outdoor Recreation",
    patterns: [
      /\boutdoor recreation\b/i,
      /\boutdoor activities?\b/i,
      /\bnavigation\b/i,
      /\bcamping\b/i,
      /\bhiking\b/i,
      /\borienteering\b/i,
      /\bclimbing\b/i,
      /\bcanoeing\b/i,
      /\bkayak/i,
    ],
    priority: 85,
  },
  {
    topic: "Fitness",
    patterns: [
      /\bfitness\b/i,
      /\bphysical fitness\b/i,
      /\bcardio\b/i,
      /\bhybrid training\b/i,
      /\binterval training\b/i,
      /\bworkout\b/i,
      /\bconditioning\b/i,
      /\bheart rate\b/i,
    ],
    priority: 85,
  },
  {
    topic: "Swimming / Aquatics",
    patterns: [/\bswimming\b/i, /\baquatics?\b/i, /\bpool\b/i, /\bfront crawl\b/i, /\bbackstroke\b/i],
    priority: 85,
  },
  {
    topic: "Healthy Lifestyle",
    patterns: [
      /\bhealthy lifestyle\b/i,
      /\bhealth(?:y)?\s*(?:and\s*)?wellbeing\b/i,
      /\bnutrition\b/i,
      /\bhealthy diet\b/i,
      /\bhealthy meal\b/i,
      /\bphysical wellbeing\b/i,
      /\bmental wellbeing\b/i,
      /\blife[\s-]?skills\b/i,
    ],
    priority: 80,
  },
  { topic: "Teamwork", patterns: [/\bteamwork\b/i, /\bteam[\s-]?work\b/i], priority: 75 },
  { topic: "Leadership", patterns: [/\bleadership\b/i, /\bleader\b/i], priority: 75 },
  { topic: "Sport Values", patterns: [/\bsport values?\b/i, /\bfair play\b/i, /\bsportsmanship\b/i], priority: 75 },
  {
    topic: "PE Option Theory",
    patterns: [
      /\bsport psychology\b/i,
      /\banatomy\b/i,
      /\bphysiology\b/i,
      /\bsport(?:ing)? society\b/i,
      /\benergy systems?\b/i,
      /\bskeletal\b/i,
      /\bmuscular\b/i,
      /\btraining principles?\b/i,
      /\bperiodisation\b/i,
      /\bsec\b/i,
    ],
    priority: 65,
  },
  {
    topic: "ALP Physical Education",
    patterns: [/\balp physical education\b/i, /\balp pe\b/i, /\blifeskills\b/i, /\bhome economics\b/i],
    priority: 60,
  },
  {
    topic: "ALP Sports Vocational",
    patterns: [/\balp sports vocational\b/i, /\balp sports level\b/i, /\bvocational sports\b/i],
    priority: 60,
  },
];

export const SKILL_PATTERNS: SkillPattern[] = [
  { skill: "Passing", patterns: [/\bpass(?:es|ing)?\b/i, /\bpass the ball\b/i] },
  { skill: "Receiving", patterns: [/\breceiv(?:e|es|ing)\b/i, /\bcontrol(?:ling)? the ball\b/i] },
  { skill: "Throwing", patterns: [/\bthrow(?:s|ing)?\b/i, /\boverarm throw\b/i, /\bunderarm throw\b/i] },
  { skill: "Catching", patterns: [/\bcatch(?:es|ing)?\b/i] },
  { skill: "Kicking", patterns: [/\bkick(?:s|ing)?\b/i] },
  { skill: "Dribbling", patterns: [/\bdribbl(?:e|es|ing)\b/i] },
  {
    skill: "Shooting",
    patterns: [
      /\bshoot(?:s|ing)?\b/i,
      /\bfinish(?:es|ing)?\b/i,
      /\bscor(?:e|es|ing)\b/i,
      /\bscoring target\b/i,
      /\bgoal\b/i,
    ],
  },
  { skill: "Defending", patterns: [/\bdefend(?:s|ing)?\b/i, /\bdefensive\b/i, /\bwin the ball\b/i] },
  { skill: "Attacking", patterns: [/\battack(?:s|ing)?\b/i, /\boffensive\b/i, /\bexploit\b/i] },
  { skill: "Movement", patterns: [/\bmovement\b/i, /\bmove(?:s|ing)?\b/i, /\blocomotor\b/i] },
  {
    skill: "Running",
    patterns: [
      /\brun(?:s|ning)?\b/i,
      /\bpace\b/i,
      /\bmiddle distance\b/i,
      /\b400m\b/i,
      /\b3000m\b/i,
      /\bjog(?:ging)?\b/i,
    ],
  },
  {
    skill: "Sprinting",
    patterns: [/\bsprint(?:s|ing)?\b/i, /\bcrouch start\b/i, /\bstanding start\b/i, /\b3-point start\b/i],
  },
  { skill: "Jumping", patterns: [/\bjump(?:s|ing)?\b/i, /\bleap(?:s|ing)?\b/i, /\bhop(?:s|ping)?\b/i] },
  { skill: "Landing", patterns: [/\bland(?:s|ing)?\b/i] },
  { skill: "Balance", patterns: [/\bbalance(?:s|d|ing)?\b/i, /\bbalanc(?:e|ing)\b/i] },
  { skill: "Rolling", patterns: [/\broll(?:s|ing)?\b/i, /\bforward roll\b/i, /\bbackward roll\b/i] },
  { skill: "Travelling", patterns: [/\btravel(?:s|ling)?\b/i, /\btravell(?:e|ing)\b/i] },
  { skill: "Coordination", patterns: [/\bcoordination\b/i, /\bcoordinate\b/i, /\bco-ordination\b/i] },
  { skill: "Agility", patterns: [/\bagility\b/i, /\bagile\b/i, /\bchange of direction\b/i] },
  { skill: "Strength", patterns: [/\bstrength\b/i, /\bstrong\b/i, /\bmuscular\b/i, /\bresistance\b/i] },
  {
    skill: "Endurance",
    patterns: [
      /\bendurance\b/i,
      /\bstamina\b/i,
      /\baerobic\b/i,
      /\bwithout stopping\b/i,
      /\bconstant(?:ly)?\b/i,
      /\bfitness level\b/i,
    ],
  },
  { skill: "Flexibility", patterns: [/\bflexibility\b/i, /\bflexible\b/i, /\bstretch(?:es|ing)?\b/i] },
  { skill: "Speed", patterns: [/\bspeed\b/i, /\bfast\b/i, /\bvelocity\b/i, /\bquick(?:ly)?\b/i] },
  { skill: "Communication", patterns: [/\bcommunicat(?:e|es|ing|ion)\b/i, /\blisten(?:ing)?\b/i] },
  {
    skill: "Cooperation",
    patterns: [
      /\bcooperat(?:e|es|ing|ion)\b/i,
      /\bcollaborat(?:e|es|ing|ion)\b/i,
      /\bteam[\s-]?mates?\b/i,
      /\bhelp my team\b/i,
      /\bteammates?\b/i,
    ],
  },
  { skill: "Officiating", patterns: [/\bofficiat(?:e|es|ing)\b/i, /\breferee\b/i, /\bumpire\b/i, /\brules\b/i] },
  {
    skill: "Analysis",
    patterns: [
      /\banalys(?:e|es|ing|is)\b/i,
      /\banalyz(?:e|es|ing)\b/i,
      /\bobserve\b/i,
      /\bevaluate\b/i,
      /\bself-evaluat/i,
      /\btactics?\b/i,
      /\bstrateg(?:y|ies)\b/i,
    ],
  },
  { skill: "Safety", patterns: [/\bsafety\b/i, /\bsafe(?:ly)?\b/i, /\brisk\b/i, /\bhazard\b/i] },
];

/** Topic-specific skill hints when description lacks explicit skill words. */
export const TOPIC_DEFAULT_SKILLS: Partial<Record<CanonicalTopic, CanonicalSkill[]>> = {
  Athletics: ["Running", "Movement"],
  Gymnastics: ["Balance", "Movement"],
  Fitness: ["Endurance", "Strength"],
  "Swimming / Aquatics": ["Movement"],
  Football: ["Passing", "Cooperation"],
  Handball: ["Passing", "Throwing"],
  Basketball: ["Dribbling", "Passing"],
  Volleyball: ["Passing", "Movement"],
  "Invasion Games": ["Passing", "Cooperation"],
  "Net Games": ["Passing", "Movement"],
  "Sport Values": ["Cooperation", "Communication"],
  Teamwork: ["Cooperation", "Communication"],
  Leadership: ["Communication", "Cooperation"],
};

/** Rename legacy imported topic labels to canonical taxonomy names. */
export const TOPIC_LABEL_ALIASES: Record<string, CanonicalTopic> = {
  Swimming: "Swimming / Aquatics",
  Dance: "Educational Dance",
  "Educational Dance": "Educational Dance",
  Outdoor: "Outdoor Recreation",
  "Outdoor Recreation": "Outdoor Recreation",
  "Health & Wellbeing": "Healthy Lifestyle",
  "Sport Psychology": "PE Option Theory",
  "Anatomy & Physiology": "PE Option Theory",
  "Sport & Society": "PE Option Theory",
  "Supplementary Studies": "PE Option Theory",
  Sport: "ALP Sports Vocational",
  "Early Years": "ALP Physical Education",
};
