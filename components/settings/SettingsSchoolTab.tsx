"use client";

import { SchoolSetupFields } from "@/components/shared/SchoolSetupFields";
import { Card, CardHeader } from "@/components/ui/Card";
import { FieldGroup, Input } from "@/components/ui/Input";
import type { TeacherProfile } from "@/lib/types";

interface SettingsSchoolTabProps {
  form: TeacherProfile;
  onChange: (patch: Partial<TeacherProfile>) => void;
}

export function SettingsSchoolTab({ form, onChange }: SettingsSchoolTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Teacher profile"
          description="Your name appears on the dashboard greeting."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Teacher name">
            <Input
              value={form.name ?? ""}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="e.g. Neil Cassar"
            />
          </FieldGroup>
          <FieldGroup label="Preferred display name">
            <Input
              value={form.preferredDisplayName ?? ""}
              onChange={(e) => onChange({ preferredDisplayName: e.target.value })}
              placeholder="e.g. Neil"
            />
          </FieldGroup>
          <FieldGroup label="Role">
            <Input
              value={form.role ?? ""}
              onChange={(e) => onChange({ role: e.target.value })}
              placeholder="e.g. PE Teacher"
            />
          </FieldGroup>
          <FieldGroup label="Email (optional)">
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="you@school.edu.mt"
            />
          </FieldGroup>
        </div>
      </Card>

      <Card>
        <CardHeader title="School" description="Educational setting, college and school." />
        <SchoolSetupFields value={form} onChange={onChange} />
      </Card>
    </div>
  );
}
