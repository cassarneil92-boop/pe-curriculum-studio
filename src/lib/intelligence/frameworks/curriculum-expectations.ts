/**
 * Expected curriculum areas from the official Maltese PE syllabus.
 * Used for implementation audit — compares against imported data presence.
 */

export interface CurriculumExpectation {
  id: string;
  label: string;
  category: "primary" | "secondary" | "individual" | "invasion" | "net" | "outdoor" | "other";
  topicIds: string[];
  minOutcomes?: number;
}

export const OFFICIAL_CURRICULUM_EXPECTATIONS: CurriculumExpectation[] = [
  // Primary
  { id: "fundamentals", label: "Fundamentals", category: "primary", topicIds: ["fundamentals", "movement"] },
  { id: "primary-athletics", label: "Athletics (Primary)", category: "primary", topicIds: ["athletics"] },
  { id: "primary-gymnastics", label: "Gymnastics (Primary)", category: "primary", topicIds: ["gymnastics"] },
  { id: "primary-dance", label: "Educational Dance (Primary)", category: "primary", topicIds: ["educational-dance", "dance"] },
  { id: "primary-games", label: "Games (Primary)", category: "primary", topicIds: ["games", "invasion-games", "net-games"] },
  { id: "primary-outdoor", label: "Outdoor Recreation (Primary)", category: "primary", topicIds: ["outdoor-recreation"] },

  // Secondary MELA
  { id: "fitness", label: "Fitness", category: "secondary", topicIds: ["fitness"], minOutcomes: 20 },
  { id: "holistic-development", label: "Holistic Development", category: "secondary", topicIds: ["holistic-development"], minOutcomes: 20 },
  { id: "secondary-athletics", label: "Athletics", category: "individual", topicIds: ["athletics"] },
  { id: "secondary-gymnastics", label: "Gymnastics", category: "individual", topicIds: ["gymnastics"] },
  { id: "secondary-dance", label: "Educational Dance", category: "individual", topicIds: ["educational-dance"] },
  { id: "martial-arts", label: "Martial Arts", category: "individual", topicIds: ["martial-arts"] },
  { id: "swimming", label: "Swimming", category: "individual", topicIds: ["swimming", "swimming-aquatics"] },

  // Invasion games
  { id: "football", label: "Football", category: "invasion", topicIds: ["football"] },
  { id: "basketball", label: "Basketball", category: "invasion", topicIds: ["basketball"] },
  { id: "handball", label: "Handball", category: "invasion", topicIds: ["handball"] },
  { id: "hockey", label: "Hockey", category: "invasion", topicIds: ["hockey"] },
  { id: "touch-rugby", label: "Touch Rugby", category: "invasion", topicIds: ["touch-rugby", "rugby"] },
  { id: "tchoukball", label: "Tchoukball", category: "invasion", topicIds: ["tchoukball"] },
  { id: "invasion-games", label: "Invasion Games (Generic)", category: "invasion", topicIds: ["invasion-games"] },

  // Net games
  { id: "volleyball", label: "Volleyball", category: "net", topicIds: ["volleyball"] },
  { id: "badminton", label: "Badminton", category: "net", topicIds: ["badminton"] },
  { id: "pickleball", label: "Pickleball", category: "net", topicIds: ["pickleball"] },
  { id: "net-games", label: "Net Games (Generic)", category: "net", topicIds: ["net-games"] },

  // Outdoor & other
  { id: "outdoor-recreation", label: "Outdoor Recreation", category: "outdoor", topicIds: ["outdoor-recreation"] },
  { id: "orienteering", label: "Orienteering", category: "outdoor", topicIds: ["orienteering"] },
  { id: "trekking", label: "Trekking", category: "outdoor", topicIds: ["trekking"] },
  { id: "team-building", label: "Team Building", category: "outdoor", topicIds: ["team-building", "teamwork"] },
  { id: "ultimate-frisbee", label: "Ultimate Frisbee", category: "other", topicIds: ["ultimate-frisbee", "frisbee"] },
  { id: "mini-tennis", label: "Mini Tennis / Beach Racquet", category: "other", topicIds: ["mini-tennis", "tennis", "beach-racquet"] },
  { id: "archery", label: "Archery", category: "other", topicIds: ["archery"] },
];
