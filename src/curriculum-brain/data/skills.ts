import type { Skill } from "../types";

export const SKILLS: Skill[] = [
  { id: "passing", name: "Passing", sportIds: ["handball", "football", "basketball"] },
  { id: "throwing", name: "Throwing", sportIds: ["handball", "athletics"] },
  { id: "kicking", name: "Kicking", sportIds: ["football"] },
  { id: "dribbling", name: "Dribbling", sportIds: ["football", "basketball"] },
  { id: "shooting", name: "Shooting", sportIds: ["handball", "football", "basketball"] },
  { id: "catching", name: "Catching", sportIds: ["basketball"] },
  { id: "defending", name: "Defending", sportIds: ["handball", "football", "basketball"] },
  { id: "attacking", name: "Attacking", sportIds: ["handball", "football", "basketball"] },
  { id: "tactics", name: "Tactics", sportIds: ["handball", "football", "basketball"] },
  { id: "teamwork", name: "Teamwork", sportIds: ["handball", "football", "basketball"] },
  { id: "movement", name: "Movement", sportIds: ["athletics"] },
  { id: "jumping", name: "Jumping", sportIds: ["athletics"] },
  { id: "speed", name: "Speed", sportIds: ["athletics"] },
  { id: "endurance", name: "Endurance", sportIds: ["athletics", "fitness"] },
  { id: "strength", name: "Strength", sportIds: ["fitness"] },
  { id: "flexibility", name: "Flexibility", sportIds: ["fitness"] },
  { id: "coordination", name: "Coordination", sportIds: ["basketball", "fitness"] },
  { id: "balance", name: "Balance", sportIds: ["fitness"] },
];
