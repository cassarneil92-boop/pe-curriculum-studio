import { normaliseTopicId } from "./utils";

export interface ResolvedTopic {
  topic: string;
  topicId: string;
}

/** F2/F4/F6 = primary fundamentals; F7+ = secondary fitness. */
export function resolveFundamentalsOrFitness(codePrefix: string): ResolvedTopic | null {
  const prefix = codePrefix.replace(/\d+[a-z]?$/, "");
  if (prefix !== "F") return null;

  const level = Number(codePrefix.replace(/^F/, "").replace(/[a-z]$/, ""));
  if (Number.isNaN(level)) return null;

  if (level >= 7) {
    return { topic: "Fitness", topicId: "fitness" };
  }
  if (level === 2 || level === 4 || level === 6) {
    return { topic: "Fundamentals", topicId: "fundamentals" };
  }
  return null;
}

/** OR sub-activity codes from the official PE syllabus outdoor recreation section. */
export function resolveOutdoorSubTopic(code: string): ResolvedTopic | null {
  const match = code.match(/^OR(\d+)\.(\d+[a-z]?)$/i);
  if (!match) return null;

  const index = Number.parseInt(match[2].replace(/[a-z]$/, ""), 10);
  if (Number.isNaN(index)) return null;

  if (index >= 11 && index <= 12) {
    return { topic: "Mini Tennis / Beach Racquet", topicId: "mini-tennis" };
  }
  if (index >= 13 && index <= 14) {
    return { topic: "Ultimate Frisbee", topicId: "ultimate-frisbee" };
  }
  if (index >= 15 && index <= 16) {
    return { topic: "Archery", topicId: "archery" };
  }
  return null;
}

/** Infer sport-specific topic from parenthetical hints in net/invasion descriptions. */
export function resolveSportHintFromDescription(
  description: string,
  strandPrefix: "NG" | "IG"
): ResolvedTopic | null {
  const text = description.toLowerCase();

  if (strandPrefix === "NG") {
    if (/\(badminton\/tennis\)/i.test(description) || /\bbadminton\b/i.test(text)) {
      return { topic: "Badminton", topicId: "badminton" };
    }
    if (/\(pickleball\)/i.test(description) || /\bpickleball\b/i.test(text)) {
      return { topic: "Pickleball", topicId: "pickleball" };
    }
    if (/\(volleyball\)/i.test(description) || /\bvolleyball\b/i.test(text)) {
      return { topic: "Volleyball", topicId: "volleyball" };
    }
    if (/\(tennis\)/i.test(description) && !/\bbadminton\b/i.test(text)) {
      return { topic: "Mini Tennis / Beach Racquet", topicId: "mini-tennis" };
    }
  }

  if (strandPrefix === "IG") {
    if (/\btouch rugby\b/i.test(text) || /\brugby\b/i.test(text)) {
      return { topic: "Touch Rugby", topicId: "touch-rugby" };
    }
    if (/\btchoukball\b/i.test(text)) {
      return { topic: "Tchoukball", topicId: "tchoukball" };
    }
    if (/\bhockey\b/i.test(text)) {
      return { topic: "Hockey", topicId: "hockey" };
    }
    if (/\bbasketball\b/i.test(text)) {
      return { topic: "Basketball", topicId: "basketball" };
    }
    if (/\bhandball\b/i.test(text)) {
      return { topic: "Handball", topicId: "handball" };
    }
    if (/\bfootball\b/i.test(text)) {
      return { topic: "Football", topicId: "football" };
    }
  }

  return null;
}

/** Trekking vs orienteering from outdoor recreation descriptions. */
export function resolveOutdoorActivityFromDescription(
  code: string,
  description: string
): ResolvedTopic | null {
  if (!/^OR\d/i.test(code)) return null;

  const sub = resolveOutdoorSubTopic(code);
  if (sub) return sub;

  const text = description.toLowerCase();
  if (/\btrek(?:k?ing)?\b/i.test(text) || /\b\d+\s*km\b/i.test(text)) {
    return { topic: "Trekking", topicId: "trekking" };
  }
  if (
    /\bcompass\b/i.test(text) ||
    /\bmap\b/i.test(text) ||
    /\borienteering\b/i.test(text) ||
    /\bgps\b/i.test(text) ||
    /\broute\b/i.test(text)
  ) {
    return { topic: "Orienteering", topicId: "orienteering" };
  }
  if (/\bteam building\b/i.test(text)) {
    return { topic: "Team Building", topicId: "team-building" };
  }

  return { topic: "Outdoor Recreation", topicId: "outdoor-recreation" };
}

export function resolveTopicFromCode(code: string): ResolvedTopic | null {
  const codePrefix = code.replace(/\.\d+[a-z]?$/, "");

  const fundamentals = resolveFundamentalsOrFitness(codePrefix);
  if (fundamentals) return fundamentals;

  const outdoorSub = resolveOutdoorSubTopic(code);
  if (outdoorSub) return outdoorSub;

  if (/^IG\d/i.test(code)) {
    return { topic: "Invasion Games", topicId: "invasion-games" };
  }
  if (/^NG\d/i.test(code)) {
    return { topic: "Net Games", topicId: "net-games" };
  }
  if (/^GY\d/i.test(code)) {
    return { topic: "Gymnastics", topicId: "gymnastics" };
  }
  if (/^A\d/i.test(code)) {
    return { topic: "Athletics", topicId: "athletics" };
  }
  if (/^D\d/i.test(code)) {
    return { topic: "Educational Dance", topicId: "educational-dance" };
  }
  if (/^OR\d/i.test(code)) {
    return { topic: "Outdoor Recreation", topicId: "outdoor-recreation" };
  }
  if (/^S\d/i.test(code)) {
    return { topic: "Swimming / Aquatics", topicId: "swimming-aquatics" };
  }
  if (/^SF\d/i.test(code)) {
    return { topic: "Striking and Fielding Games", topicId: "striking-and-fielding-games" };
  }
  if (/^G\d/i.test(code)) {
    return { topic: "Games", topicId: "games" };
  }
  if (/^HD\d/i.test(code)) {
    return { topic: "Holistic Development", topicId: "holistic-development" };
  }
  if (/^MA\d/i.test(code)) {
    return { topic: "Martial Arts", topicId: "martial-arts" };
  }

  return null;
}

export function refineTopicForOutcome(
  code: string,
  description: string,
  current: ResolvedTopic
): ResolvedTopic {
  const codePrefix = code.replace(/\.\d+[a-z]?$/, "");
  const strand = codePrefix.replace(/\d+[a-z]?$/, "");

  const fundamentals = resolveFundamentalsOrFitness(codePrefix);
  if (fundamentals) return fundamentals;

  const outdoorSub = resolveOutdoorSubTopic(code);
  if (outdoorSub) return outdoorSub;

  if (strand === "NG") {
    const sport = resolveSportHintFromDescription(description, "NG");
    if (sport) return sport;
  }

  if (strand === "IG") {
    const sport = resolveSportHintFromDescription(description, "IG");
    if (sport) return sport;
  }

  if (strand === "OR") {
    const outdoor = resolveOutdoorActivityFromDescription(code, description);
    if (outdoor) return outdoor;
  }

  const fromCode = resolveTopicFromCode(code);
  if (fromCode) return fromCode;

  return {
    topic: current.topic,
    topicId: current.topicId || normaliseTopicId(current.topic),
  };
}
