import type { LessonPlan } from "@/lib/types";

export type LessonBuilderPlan = LessonPlan;

export type LessonBuilderFormData = Omit<LessonPlan, "id" | "createdAt" | "updatedAt">;
