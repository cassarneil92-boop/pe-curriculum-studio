import {
  BarChart3,
  BookOpen,
  Calendar,
  ChartNetwork,
  ClipboardList,
  Eye,
  FileText,
  FlaskConical,
  FolderOpen,
  Home,
  LayoutGrid,
  MessageCircle,
  PenLine,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type IconName =
  | "home"
  | "calendar"
  | "lessons"
  | "builder"
  | "schemes"
  | "curriculum"
  | "analytics"
  | "intelligence"
  | "assistant"
  | "tester"
  | "coverage"
  | "audit"
  | "resources"
  | "settings";

const ICONS: Record<IconName, LucideIcon> = {
  home: Home,
  calendar: Calendar,
  lessons: FileText,
  builder: PenLine,
  schemes: LayoutGrid,
  curriculum: BookOpen,
  analytics: BarChart3,
  intelligence: ChartNetwork,
  assistant: MessageCircle,
  tester: FlaskConical,
  coverage: ClipboardList,
  audit: Eye,
  resources: FolderOpen,
  settings: Settings,
};

export function NavIcon({ name }: { name: IconName }) {
  const Icon = ICONS[name];
  return <Icon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />;
}
