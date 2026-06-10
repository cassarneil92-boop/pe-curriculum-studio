"use client";

import { useMemo, useState } from "react";
import { CollegeCard } from "@/components/shared/CollegeCard";
import { SchoolCard } from "@/components/shared/SchoolCard";
import { FieldGroup, Input, Select } from "@/components/ui/Input";
import { COLLEGES } from "@/src/lib/colleges";
import {
  EDUCATIONAL_SETTINGS,
  getCollegeById,
  getSchoolOptions,
  OTHER_SCHOOL_ID,
  type EducationalSetting,
} from "@/src/lib/schools";
import type { TeacherProfile } from "@/lib/types";

interface SchoolSetupFieldsProps {
  value: Pick<
    TeacherProfile,
    "educationalSetting" | "college" | "school" | "manualSchoolName"
  >;
  onChange: (patch: Partial<TeacherProfile>) => void;
}

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

export function SchoolSetupFields({ value, onChange }: SchoolSetupFieldsProps) {
  const [search, setSearch] = useState("");
  const isState = value.educationalSetting === "State School";
  const schools = getSchoolOptions(value.educationalSetting, value.college);
  const canShowSchoolList =
    value.educationalSetting !== "" && (!isState || value.college !== "");

  const selectedCollege = value.college ? getCollegeById(value.college) : undefined;

  const filteredSchools = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return schools;
    return schools.filter((school) => school.name.toLowerCase().includes(query));
  }, [schools, search]);

  const handleSettingChange = (setting: EducationalSetting | "") => {
    setSearch("");
    onChange({
      educationalSetting: setting,
      college: "",
      school: "",
      manualSchoolName: "",
    });
  };

  const handleCollegeChange = (college: string) => {
    setSearch("");
    onChange({
      college,
      school: "",
      manualSchoolName: "",
    });
  };

  const handleSchoolSelect = (schoolId: string) => {
    onChange({
      school: schoolId,
      manualSchoolName: schoolId === OTHER_SCHOOL_ID ? value.manualSchoolName : "",
    });
  };

  const showEmptyCollegeMessage =
    isState && value.college !== "" && schools.length === 0 && search.trim() === "";
  const showNoSearchResults =
    schools.length > 0 && filteredSchools.length === 0 && search.trim() !== "";

  return (
    <div className="space-y-5">
      <FieldGroup label="Educational setting">
        <Select
          value={value.educationalSetting}
          onChange={(e) =>
            handleSettingChange(e.target.value as EducationalSetting | "")
          }
        >
          <option value="">Select setting</option>
          {EDUCATIONAL_SETTINGS.map((setting) => (
            <option key={setting} value={setting}>
              {setting}
            </option>
          ))}
        </Select>
      </FieldGroup>

      {isState && (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">College</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {COLLEGES.map((college) => (
              <CollegeCard
                key={college.id}
                college={college}
                selected={value.college === college.id}
                onSelect={() => handleCollegeChange(college.id)}
              />
            ))}
          </div>
        </div>
      )}

      {value.educationalSetting === "State School" && !value.college && (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500">
          Select a college to view its schools
        </p>
      )}

      {canShowSchoolList && (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-slate-700">School</p>
            {isState && selectedCollege && schools.length > 0 && (
              <p className="mt-0.5 text-xs text-slate-500">
                {schools.length} school{schools.length !== 1 ? "s" : ""} in{" "}
                {selectedCollege.name}
              </p>
            )}
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </span>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search school..."
              className="pl-9"
              aria-label="Search school"
            />
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/40 p-2">
            {showEmptyCollegeMessage && (
              <p className="px-2 py-3 text-sm text-slate-500">
                No schools have been added for this college yet.
              </p>
            )}

            {showNoSearchResults && (
              <p className="px-2 py-3 text-sm text-slate-500">
                No schools found. Try another search or choose Other / Not listed.
              </p>
            )}

            {filteredSchools.map((school) => (
              <SchoolCard
                key={school.id}
                name={school.name}
                selected={value.school === school.id}
                onSelect={() => handleSchoolSelect(school.id)}
              />
            ))}

            <SchoolCard
              name="Other / Not listed"
              selected={value.school === OTHER_SCHOOL_ID}
              onSelect={() => handleSchoolSelect(OTHER_SCHOOL_ID)}
            />
          </div>
        </div>
      )}

      {value.school === OTHER_SCHOOL_ID && (
        <FieldGroup label="School name">
          <Input
            value={value.manualSchoolName}
            onChange={(e) => onChange({ manualSchoolName: e.target.value })}
            placeholder="Enter your school name"
          />
        </FieldGroup>
      )}
    </div>
  );
}
