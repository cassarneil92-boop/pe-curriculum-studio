import type { Topic } from "./types";

export const TOPICS: Topic[] = [
  {
    id: "handball",
    name: "Handball",
    skillIds: ["passing", "receiving", "throwing", "shooting"],
  },
  {
    id: "football",
    name: "Football",
    skillIds: ["passing", "receiving", "dribbling", "kicking", "finishing"],
  },
  {
    id: "basketball",
    name: "Basketball",
    skillIds: ["passing", "receiving", "dribbling", "shooting"],
  },
  {
    id: "athletics",
    name: "Athletics",
    skillIds: ["running", "throwing", "jumping"],
  },
  {
    id: "fitness",
    name: "Fitness",
    skillIds: ["endurance", "strength", "flexibility", "coordination"],
  },
];
