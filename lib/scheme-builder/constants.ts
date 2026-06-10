export const SOW_TERMS = ["Term 1", "Term 2", "Term 3"] as const;

export const SOW_RESOURCE_OPTIONS = [
  "Cones",
  "Balls",
  "Bibs",
  "Whistle",
  "Timer",
  "Mats",
  "Skipping ropes",
  "Dumbbells",
] as const;

export const SOW_ACTIVITY_CARDS = [
  "Warm up",
  "Skill practice",
  "Conditioned game",
  "Small sided game",
  "Cool down",
] as const;

export const SOW_WILF_CARDS = [
  "I can perform the skill with control.",
  "I can make effective decisions during play.",
  "I can communicate with teammates.",
  "I can apply tactics in game situations.",
  "I can evaluate my own performance.",
] as const;

export const ACTIVITY_TEMPLATE = `Warm up:


Main activity:


Cool down:
`;

export const WALT_PLACEHOLDER = "We are learning to…";

export const WILF_PLACEHOLDER = `I can…
I can…
I can…`;

export function buildWaltIdeas(topicName: string, skillName: string): string[] {
  const skill = skillName.trim() || "the focus skill";
  const topic = topicName.trim() || "this topic";

  return [
    `We are learning to improve ${skill.toLowerCase()} accuracy.`,
    `We are learning to apply ${skill.toLowerCase()} in ${topic.toLowerCase()}.`,
    `We are learning to use movement into space during ${topic.toLowerCase()}.`,
    `We are learning to use communication during game play.`,
    `We are learning to develop ${skill.toLowerCase()} under pressure.`,
  ];
}
