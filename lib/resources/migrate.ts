import { normaliseResourceCategory } from "@/lib/resources/categories";
import type { ResourceItem } from "@/lib/types";

export function migrateResourceItem(resource: ResourceItem): ResourceItem {
  return {
    ...resource,
    title: resource.title ?? resource.name,
    name: resource.name || resource.title || "Untitled resource",
    category: normaliseResourceCategory(resource.category),
    visibilityLevel: resource.visibilityLevel ?? "private",
    learningOutcomeIds: resource.learningOutcomeIds ?? [],
  };
}

export function migrateResources(resources: ResourceItem[]): ResourceItem[] {
  return (resources ?? []).map(migrateResourceItem);
}
