"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { SettingsAcademicYearTab } from "@/components/settings/SettingsAcademicYearTab";
import { SettingsAdvancedTab } from "@/components/settings/SettingsAdvancedTab";
import { SettingsSchoolTab } from "@/components/settings/SettingsSchoolTab";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { SettingsTeachingContextTab } from "@/components/settings/SettingsTeachingContextTab";
import { TeacherTimetableEditor } from "@/components/settings/TeacherTimetableEditor";
import {
  migrateAcademicCalendarSettings,
} from "@/lib/calendar/academic-settings";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/providers/ToastProvider";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { buildTeacherContext } from "@/lib/teacher-context";
import type { AcademicCalendarSettings } from "@/lib/types";

export default function SettingsPage() {
  const { toast } = useToast();
  const { data, updateTeacher, updateAcademicCalendar } = useApp();
  const { accessMode, setAccessMode, context } = useTeacherContext();
  const [form, setForm] = useState(data.teacher);
  const [academicForm, setAcademicForm] = useState<AcademicCalendarSettings>(() =>
    migrateAcademicCalendarSettings(data.academicCalendar, data.planningTerms)
  );
  const previewContext = buildTeacherContext(form, accessMode);

  useEffect(() => {
    setAcademicForm(
      migrateAcademicCalendarSettings(data.academicCalendar, data.planningTerms)
    );
  }, [data.academicCalendar, data.planningTerms]);

  const handleSave = () => {
    updateTeacher(form);
    updateAcademicCalendar(academicForm);
    toast("Settings saved");
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Profile, school context and planning preferences."
      />

      <SettingsTabs
        panels={{
          school: (
            <SettingsSchoolTab
              form={form}
              onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
            />
          ),
          teaching: (
            <SettingsTeachingContextTab
              form={form}
              accessMode={accessMode}
              detectedRoleLabel={previewContext.roleLabel}
              rolePending={previewContext.role !== context.role}
              onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
              onAccessModeChange={setAccessMode}
            />
          ),
          academic: (
            <SettingsAcademicYearTab
              academicForm={academicForm}
              onChange={setAcademicForm}
            />
          ),
          timetable: (
            <Card>
              <CardHeader
                title="Teacher timetable"
                description="Weekly PE slots — groundwork for faster calendar planning."
              />
              <TeacherTimetableEditor />
            </Card>
          ),
          advanced: <SettingsAdvancedTab />,
        }}
      />

      <div className="mt-8 flex items-center gap-3 border-t border-slate-200 pt-6">
        <Button onClick={handleSave}>Save settings</Button>
      </div>
    </div>
  );
}
