/**
 * Collaboration scope architecture — prepared for future Supabase / Firebase / Clerk.
 * No authentication implemented yet; scopes stored as metadata on entities.
 */

export type CollaborationScope = "personal" | "department" | "college";

export type ResourceVisibility = "private" | "shared" | "public";

export interface ScopeMetadata {
  scope: CollaborationScope;
  visibility: ResourceVisibility;
  departmentId?: string;
  collegeId?: string;
  createdBy?: string;
  sharedWith?: string[];
}

export const DEFAULT_PERSONAL_SCOPE: ScopeMetadata = {
  scope: "personal",
  visibility: "private",
};

export function scopeLabel(scope: CollaborationScope): string {
  switch (scope) {
    case "personal":
      return "Personal";
    case "department":
      return "Department";
    case "college":
      return "College";
  }
}
