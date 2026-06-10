import type { Sport } from "../types";

export const SPORTS: Sport[] = [
  {
    id: "handball",
    name: "Handball",
    category: "invasion-game",
    skillIds: ["passing", "throwing", "shooting", "defending", "attacking", "tactics", "teamwork"],
  },
  {
    id: "football",
    name: "Football",
    category: "invasion-game",
    skillIds: ["passing", "kicking", "dribbling", "shooting", "defending", "attacking", "tactics", "teamwork"],
  },
  {
    id: "basketball",
    name: "Basketball",
    category: "invasion-game",
    skillIds: ["passing", "dribbling", "shooting", "catching", "defending", "attacking", "coordination", "teamwork"],
  },
  {
    id: "athletics",
    name: "Athletics",
    category: "athletics",
    skillIds: ["movement", "throwing", "jumping", "endurance", "speed"],
  },
  {
    id: "fitness",
    name: "Fitness",
    category: "fitness",
    skillIds: ["endurance", "strength", "flexibility", "coordination", "balance"],
  },
];
