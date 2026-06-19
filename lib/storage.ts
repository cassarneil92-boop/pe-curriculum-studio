import type { AppData, TeacherProfile } from "./types";
import {
  defaultAcademicCalendarSettings,
  migrateAcademicCalendarSettings,
} from "./calendar/academic-settings";
import { migrateCalendarEntry } from "./calendar/migrate";
import { migrateLessons } from "./lesson-plans/migrate";
import { migrateScheme } from "./scheme-builder/migrate";
import { migrateResources } from "./resources/migrate";
import { migrateYearGroupList, migrateYearGroupValue } from "./year-groups";
import {
  findCollegeIdByName,
  OTHER_SCHOOL_ID,
  type EducationalSetting,
} from "@/src/lib/schools";

const STORAGE_KEY = "pe-curriculum-studio-malta";

export const DEFAULT_TEACHER: TeacherProfile = {
  educationalSetting: "",
  college: "",
  school: "",
  manualSchoolName: "",
  yearGroups: [],
  pathways: [],
};

export const DEFAULT_APP_DATA: AppData = {
  teacher: DEFAULT_TEACHER,
  lessons: [],
  schemes: [],
  calendar: [],
  resources: [],
  academicCalendar: defaultAcademicCalendarSettings(),
  timetable: [],
  setupComplete: false,
};

type LegacyTeacher = {
  college?: string;
  school?: string;
  schoolType?: string;
  collegeId?: string;
  schoolId?: string;
  schoolNameManual?: string;
  yearGroups?: TeacherProfile["yearGroups"];
  pathways?: TeacherProfile["pathways"];
};

function migrateAppData(parsed: AppData): AppData {
  return {
    ...DEFAULT_APP_DATA,
    ...parsed,
    teacher: migrateTeacher(parsed.teacher),
    lessons: migrateLessons(parsed.lessons ?? []),
    schemes: (parsed.schemes ?? []).map((scheme) => migrateScheme(scheme)),
    calendar: (parsed.calendar ?? []).map((entry) =>
      migrateCalendarEntry({
        ...entry,
        yearGroup: migrateYearGroupValue(entry.yearGroup),
      })
    ),
    academicCalendar: migrateAcademicCalendarSettings(
      parsed.academicCalendar,
      parsed.planningTerms
    ),
    resources: migrateResources(parsed.resources ?? []),
    timetable: parsed.timetable ?? [],
  };
}

function migrateTeacher(teacher: Partial<TeacherProfile> & LegacyTeacher): TeacherProfile {
  if (teacher.schoolType) {
    let educationalSetting: EducationalSetting | "" = "";
    if (teacher.schoolType === "State") educationalSetting = "State School";
    else if (teacher.schoolType === "Church") educationalSetting = "Church School";
    else if (teacher.schoolType === "Independent") educationalSetting = "Independent School";

    const legacyCollege = teacher.college ?? "";
    const legacySchool = typeof teacher.school === "string" ? teacher.school : "";

    return {
      ...DEFAULT_TEACHER,
      educationalSetting,
      college: findCollegeIdByName(legacyCollege),
      school: legacySchool ? OTHER_SCHOOL_ID : "",
      manualSchoolName: legacySchool,
      yearGroups: migrateYearGroupList(teacher.yearGroups ?? []),
      pathways: teacher.pathways ?? [],
    };
  }

  return {
    ...DEFAULT_TEACHER,
    ...teacher,
    college: teacher.college ?? teacher.collegeId ?? "",
    school: teacher.school ?? teacher.schoolId ?? "",
    manualSchoolName: teacher.manualSchoolName ?? teacher.schoolNameManual ?? "",
    yearGroups: migrateYearGroupList(teacher.yearGroups ?? []),
    pathways: teacher.pathways ?? [],
  };
}

export function loadAppData(): AppData {
  if (typeof window === "undefined") return DEFAULT_APP_DATA;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_APP_DATA;
    const parsed = JSON.parse(raw) as AppData;
    return migrateAppData(parsed);
  } catch (error) {
    if (typeof console !== "undefined") {
      console.warn("[Storage] Failed to load app data, using defaults:", error);
    }
    return DEFAULT_APP_DATA;
  }
}

export function saveAppData(data: AppData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    if (typeof console !== "undefined") {
      console.warn("[Storage] Failed to persist app data:", error);
    }
    throw error;
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
