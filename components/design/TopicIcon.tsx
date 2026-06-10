import { getTopicTheme } from "@/lib/design/topic-theme";

export function TopicIcon({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const theme = getTopicTheme(name);
  const sizeClass =
    size === "lg" ? "h-12 w-12 text-xl" : size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-lg";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl font-semibold ${sizeClass} ${theme.iconBg}`}
      aria-hidden
    >
      {name.charAt(0)}
    </span>
  );
}
