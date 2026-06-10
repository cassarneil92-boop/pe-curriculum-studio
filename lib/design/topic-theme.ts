export type TopicColor =
  | "teal"
  | "green"
  | "blue"
  | "amber"
  | "rose"
  | "purple"
  | "slate";

export interface TopicTheme {
  color: TopicColor;
  bg: string;
  border: string;
  text: string;
  iconBg: string;
  bar: string;
}

export const TOPIC_THEMES: Record<TopicColor, TopicTheme> = {
  teal: {
    color: "teal",
    bg: "bg-teal-50",
    border: "border-teal-100",
    text: "text-teal-800",
    iconBg: "bg-teal-100 text-teal-700",
    bar: "bg-teal-500",
  },
  green: {
    color: "green",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-800",
    iconBg: "bg-emerald-100 text-emerald-700",
    bar: "bg-emerald-500",
  },
  blue: {
    color: "blue",
    bg: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-800",
    iconBg: "bg-blue-100 text-blue-700",
    bar: "bg-blue-500",
  },
  amber: {
    color: "amber",
    bg: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-900",
    iconBg: "bg-amber-100 text-amber-800",
    bar: "bg-amber-500",
  },
  rose: {
    color: "rose",
    bg: "bg-rose-50",
    border: "border-rose-100",
    text: "text-rose-800",
    iconBg: "bg-rose-100 text-rose-700",
    bar: "bg-rose-400",
  },
  purple: {
    color: "purple",
    bg: "bg-violet-50",
    border: "border-violet-100",
    text: "text-violet-800",
    iconBg: "bg-violet-100 text-violet-700",
    bar: "bg-violet-500",
  },
  slate: {
    color: "slate",
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-700",
    iconBg: "bg-slate-100 text-slate-600",
    bar: "bg-slate-400",
  },
};

export function getTopicTheme(name: string): TopicTheme {
  const key = name.toLowerCase();
  if (key.includes("football") || key.includes("rugby") || key.includes("hockey")) {
    return TOPIC_THEMES.green;
  }
  if (key.includes("handball") || key.includes("basketball")) {
    return TOPIC_THEMES.teal;
  }
  if (key.includes("volleyball") || key.includes("netball") || key.includes("swim")) {
    return TOPIC_THEMES.blue;
  }
  if (key.includes("athletic") || key.includes("fitness")) {
    return TOPIC_THEMES.amber;
  }
  if (key.includes("gymnastic") || key.includes("dance")) {
    return TOPIC_THEMES.rose;
  }
  if (key.includes("outdoor")) {
    return TOPIC_THEMES.green;
  }
  if (key.includes("healthy") || key.includes("lifestyle")) {
    return TOPIC_THEMES.purple;
  }
  if (key.includes("sport values") || key.includes("teamwork") || key.includes("leadership")) {
    return TOPIC_THEMES.purple;
  }
  if (key.includes("alp") || key.includes("option")) {
    return TOPIC_THEMES.slate;
  }
  return TOPIC_THEMES.teal;
}
