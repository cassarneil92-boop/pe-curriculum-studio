// TODO: complete full official school list for each college from Education.gov.mt.

import { COLLEGES, getCollegeById as getCollegeMetaById } from "./colleges";

export type EducationalSetting =
  | "State School"
  | "Church School"
  | "Independent School";

export type SchoolSector = "state" | "church" | "independent";

export type { College } from "./colleges";
export { COLLEGES } from "./colleges";

export interface School {
  id: string;
  name: string;
  sector: SchoolSector;
  collegeId?: string;
}

export interface StateCollegeEntry {
  id: string;
  name: string;
  schools: readonly string[];
}

export const OTHER_SCHOOL_ID = "other";

export const EDUCATIONAL_SETTINGS: EducationalSetting[] = [
  "State School",
  "Church School",
  "Independent School",
];

/** State colleges with their schools — add names here to expand. */
export const STATE_COLLEGE_ENTRIES: readonly StateCollegeEntry[] = [
  {
    id: "st-margaret",
    name: "St Margaret College",
    schools: [
      "Cospicua Primary School",
      "Kalkara Primary School",
      "Senglea Primary School",
      "Vittoriosa Primary School",
      "Xgħajra Primary School",
      "Zabbar Primary School A",
      "Zabbar Primary School B",
      "Cospicua Middle School",
      "Verdala Secondary School",
      "Cospicua Learning Support Centre",
      "Kalkara Learning Support Centre",
    ],
  },
  {
    id: "maria-regina",
    name: "Maria Regina College",
    schools: [
      "Karmnu Sant Gharghur Primary School",
      "Marija Bambina Mellieha Primary School",
      "Naxxar Primary School",
      "Qawra Primary School",
      "St Paul's Bay Primary School",
    ],
  },
  {
    id: "st-benedict",
    name: "St Benedict College",
    schools: [
      "Prof Anton Tabone B'Bugia Primary School",
      "Filippo Castagna Ghaxaq Primary School",
      "William Baker Gudja Primary School",
      "San Benedittu Kirkop Primary School",
      "Francis Xavier Mangion Mqabba Primary School",
      "Carmelo Caruana Safi Primary School",
    ],
  },
  {
    id: "st-nicholas",
    name: "St Nicholas College",
    schools: [
      "Attard Primary School",
      "Mġarr Primary School",
      "Mosta Primary School",
      "Rabat Primary School",
      "San Pawl il-Baħar Primary School",
      "Naxxar Learning Support Centre",
      "Kan P Pullicino Rabat Middle School",
      "Francis Ebejer Dingli Secondary School",
    ],
  },
  {
    id: "st-gorg-preca",
    name: "St Ġorġ Preca College",
    schools: [
      "Antonio Galea Floriana Primary School",
      "Ħamrun ĠP Primary School",
      "Paola Primary School",
      "Valletta Primary School",
      "Marsa Primary School",
      "Blata l-Bajda Middle School",
      "Ħamrun Secondary School",
    ],
  },
  {
    id: "st-theresa",
    name: "St Theresa College",
    schools: [
      "Anthony Valletta B'Kara Primary School",
      "Annibale Preca Lija Primary School",
      "Achille Ferris Msida Primary School",
      "Patri Manwel Gatt St Venera Primary School",
      "Vincenzo Borg Brared Middle School",
      "St Theresa Secondary School Mrieħel",
    ],
  },
  {
    id: "st-ignatius",
    name: "St Ignatius College",
    schools: [
      "Patri Indri Schembri Luqa Primary School",
      "Dr Irene Condachi Qormi SG Primary School",
      "Guze' Muscat Azzopardi Qormi SS Primary School",
      "Patri Guze' Delia Siġġiewi Primary School",
      "Dun Karm Psaila Żebbuġ Primary School",
      "Żebbuġ Learning Support Centre",
      "Prof Edward Debono Ħandaq Middle School",
      "Mikiel Anton Vassalli Ħandaq Secondary School",
    ],
  },
  {
    id: "st-thomas-more",
    name: "St Thomas More College",
    schools: [
      "Dun Ġużepp Żerafa Fgura Primary School A",
      "Emanuel Debono Decesare Fgura Primary School B",
      "M'Scala St Anne Primary School",
      "M'Scala St Joachim Primary School",
      "Ġużeppina Deguara M'Xlokk Primary School",
      "Dun Karm Sant Tarxien Primary School",
      "Dun Alwiġi Camilleri Żejtun Primary School A",
      "Ġiużeppi Caruana Żejtun Primary School B",
      "Alternative Learning Programme (ALP) Paola",
      "Margaret Mortimer St Lucia Secondary School",
      "Maria Goretti Tarxien Middle School",
      "Carlo Diacono Żejtun Secondary School",
      "Hamrun MVPA",
    ],
  },
  {
    id: "st-clare",
    name: "St Clare College",
    schools: [
      "Dun Anton Manche Gżira Primary School",
      "Bice Mizzi Vassallo Pembroke Primary School",
      "Madonna Tal-Mensija San Ġwann Primary School",
      "Guze' Bonnici Sliema Primary School",
      "Dun Guzepp Scerri St Julian's Primary School",
      "Sir Luigi Preziosi Pembroke Secondary School",
      "National Sport School",
      "San Miguel Febres Cordero",
      "GEM 16+ Gżira",
      "Gżira Learning Support Centre",
    ],
  },
  {
    id: "gozo",
    name: "Gozo College",
    schools: [
      "Karmni Grima Għarb Primary School",
      "Peter Paul Grech Kerċem Primary School",
      "Dun Salvu Vella Nadur Primary School",
      "Anton Buttigieg Qala Primary School",
      "Dun Salv Portelli San Lawrenz Primary School",
      "Guze' Aquilina Sannat Primary School & Special Unit",
      "Sir Arturo Refalo Victoria Primary School",
      "Patri Matthew Sultana Xagħra Primary School",
      "Roza Magro Xewkija Primary School",
      "Mons Giovanni Andrea Vella Żebbuġ Primary School",
      "Kan G P Agius De Soldanis Middle School",
      "Ninu Cremona Secondary School",
    ],
  },
  {
    id: "mikiel-anton-vassalli",
    name: "Mikiel Anton Vassalli College",
    schools: [
      "Gozo Visual and Performing Arts School",
      "Malta School of Music",
      "Malta School of Art",
      "Malta School of Drama and Dance",
    ],
  },
  {
    id: "international-learners",
    name: "International Learners'",
    schools: [],
  },
  {
    id: "giovanni-curmi-hss",
    name: "Giovanni Curmi Higher Secondary",
    schools: [],
  },
] as const;

/** Placeholder church-sector schools — expand from official sources. */
const CHURCH_SCHOOL_NAMES: readonly string[] = [
  "Primary — Church sector (placeholder)",
  "Secondary — Church sector (placeholder)",
];

/** Placeholder independent-sector schools — expand from official sources. */
const INDEPENDENT_SCHOOL_NAMES: readonly string[] = [
  "Independent school (placeholder)",
];

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function makeSchoolId(prefix: string, name: string): string {
  return `${prefix}-${toSlug(name)}`;
}

function buildStateSchools(): School[] {
  return STATE_COLLEGE_ENTRIES.flatMap((entry) =>
    entry.schools.map((name) => ({
      id: makeSchoolId(entry.id, name),
      name,
      sector: "state" as const,
      collegeId: entry.id,
    }))
  );
}

function buildSectorSchools(
  names: readonly string[],
  sector: "church" | "independent"
): School[] {
  return names.map((name) => ({
    id: makeSchoolId(sector, name),
    name,
    sector,
  }));
}

export const STATE_COLLEGES = COLLEGES;

export const SCHOOLS: School[] = [
  ...buildStateSchools(),
  ...buildSectorSchools(CHURCH_SCHOOL_NAMES, "church"),
  ...buildSectorSchools(INDEPENDENT_SCHOOL_NAMES, "independent"),
];

export function getColleges() {
  return STATE_COLLEGES;
}

export function getCollegeById(id: string) {
  return getCollegeMetaById(id);
}

export function getSchoolById(id: string): School | undefined {
  return SCHOOLS.find((s) => s.id === id);
}

export function getSchoolsByCollege(collegeId: string): School[] {
  return SCHOOLS.filter((s) => s.sector === "state" && s.collegeId === collegeId);
}

export function getSchoolsBySector(sector: "church" | "independent"): School[] {
  return SCHOOLS.filter((s) => s.sector === sector);
}

export function getSchoolOptions(
  educationalSetting: EducationalSetting | "",
  college: string
): School[] {
  if (!educationalSetting) return [];

  if (educationalSetting === "State School") {
    if (!college) return [];
    return getSchoolsByCollege(college);
  }

  if (educationalSetting === "Church School") {
    return getSchoolsBySector("church");
  }

  return getSchoolsBySector("independent");
}

export function resolveSchoolDisplayName(
  school: string,
  manualSchoolName: string
): string {
  if (school === OTHER_SCHOOL_ID) return manualSchoolName.trim();
  return getSchoolById(school)?.name ?? "";
}

export function resolveTeacherSchoolLabel(profile: {
  educationalSetting: EducationalSetting | "";
  college: string;
  school: string;
  manualSchoolName: string;
}): string {
  const schoolName = resolveSchoolDisplayName(profile.school, profile.manualSchoolName);
  if (!schoolName) return "";

  if (profile.educationalSetting === "State School" && profile.college) {
    const collegeEntry = getCollegeById(profile.college);
    return collegeEntry ? `${schoolName}, ${collegeEntry.name}` : schoolName;
  }

  return schoolName;
}

export function isTeacherSchoolComplete(profile: {
  educationalSetting: EducationalSetting | "";
  college: string;
  school: string;
  manualSchoolName: string;
}): boolean {
  if (!profile.educationalSetting) return false;

  if (profile.educationalSetting === "State School" && !profile.college) {
    return false;
  }

  if (!profile.school) return false;

  if (profile.school === OTHER_SCHOOL_ID) {
    return profile.manualSchoolName.trim().length > 0;
  }

  return true;
}

export function findCollegeIdByName(name: string): string {
  if (!name) return "";
  return STATE_COLLEGES.find((c) => c.name === name)?.id ?? "";
}
