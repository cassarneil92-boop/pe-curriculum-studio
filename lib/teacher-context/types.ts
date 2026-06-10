import type { PathwayId, TeacherProfile } from "@/lib/types";
import type { YearGroupId } from "@/lib/year-groups";

export type CurriculumAccessMode = "intelligent" | "explore-all";

/** Imported curriculum brain pathway identifiers. */
export type ImportedPathwayId =
  | "early-years-pe"
  | "primary-pe"
  | "secondary-pe"
  | "sport-values"
  | "pe-option-sec"
  | "alp-pe"
  | "alp-sports-vocational"
  | "fitness-curriculum";

export type TeacherContextRole =
  | "unset"
  | "primary-school"
  | "secondary-pe"
  | "secondary-pe-option"
  | "alp-teacher"
  | "alp-sports-vocational";

export interface TeacherContextSnapshot {
  role: TeacherContextRole;
  roleLabel: string;
  accessMode: CurriculumAccessMode;
  teacher: TeacherProfile;
  visibleAppPathways: PathwayId[];
  hiddenAppPathways: PathwayId[];
  visibleImportedPathways: ImportedPathwayId[];
  hiddenImportedPathways: ImportedPathwayId[];
  visibleYearGroupIds: YearGroupId[];
  exploreAllEnabled: boolean;
}

export interface ImportedOutcomeVisibilityResult {
  total: number;
  visible: number;
  hidden: number;
}
