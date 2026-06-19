"use client";

import { useMemo, useRef, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ResourcesEmptyIllustration } from "@/components/ui/EmptyIllustrations";
import { StatCard } from "@/components/ui/StatCard";
import { useToast } from "@/components/providers/ToastProvider";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import { getPathwayLabel, PATHWAYS, SPORTS, YEAR_GROUP_OPTIONS } from "@/lib/constants";
import {
  getResourceCategoryLabel,
  normaliseResourceCategory,
  RESOURCE_CATEGORIES,
} from "@/lib/resources/categories";
import { getYearGroupLabel } from "@/lib/year-groups";
import type { PathwayId, ResourceItem, ResourceVisibilityLevel, YearGroup } from "@/lib/types";

export default function ResourcesPage() {
  const { toast } = useToast();
  const { data, addResource, deleteResource } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [pathwayFilter, setPathwayFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [sportFilter, setSportFilter] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "lesson-cards",
    pathway: "" as PathwayId | "",
    yearGroup: "" as YearGroup | "",
    topicId: "",
    skillId: "",
    notes: "",
    externalLink: "",
    visibilityLevel: "private" as ResourceVisibilityLevel,
    fileName: "",
    fileSize: 0,
    type: "Document",
    sport: "",
  });

  const summary = useMemo(() => {
    const resources = data.resources;
    return {
      total: resources.length,
      lessonCards: resources.filter((r) => normaliseResourceCategory(r.category) === "lesson-cards")
        .length,
      assessments: resources.filter((r) => normaliseResourceCategory(r.category) === "assessments")
        .length,
      linkedOutcomes: resources.filter((r) => (r.learningOutcomeIds?.length ?? 0) > 0).length,
    };
  }, [data.resources]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.resources.filter((r) => {
      const title = (r.title ?? r.name).toLowerCase();
      if (q && !title.includes(q) && !r.notes.toLowerCase().includes(q)) return false;
      if (categoryFilter !== "all" && normaliseResourceCategory(r.category) !== categoryFilter)
        return false;
      if (pathwayFilter && r.pathway !== pathwayFilter) return false;
      if (yearFilter && r.yearGroup !== yearFilter) return false;
      if (sportFilter && r.sport !== sportFilter && r.topicId !== sportFilter) return false;
      return true;
    });
  }, [data.resources, search, categoryFilter, pathwayFilter, yearFilter, sportFilter]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setForm((prev) => ({
      ...prev,
      title: prev.title || file.name.replace(/\.[^.]+$/, ""),
      fileName: file.name,
      fileSize: file.size,
      type: file.type.includes("image")
        ? "Image"
        : file.type.includes("pdf")
          ? "PDF"
          : "Document",
      category:
        file.type.includes("image") ? "images" : prev.category,
    }));
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    addResource({
      name: form.title,
      title: form.title,
      type: form.type,
      category: normaliseResourceCategory(form.category),
      pathway: form.pathway,
      yearGroup: form.yearGroup || undefined,
      topicId: form.topicId || undefined,
      skillId: form.skillId || undefined,
      sport: form.sport || form.topicId,
      notes: form.notes,
      fileName: form.fileName,
      fileSize: form.fileSize,
      externalLink: form.externalLink || undefined,
      visibilityLevel: form.visibilityLevel,
      learningOutcomeIds: [],
    });
    setForm({
      title: "",
      category: "lesson-cards",
      pathway: "",
      yearGroup: "",
      topicId: "",
      skillId: "",
      notes: "",
      externalLink: "",
      visibilityLevel: "private",
      fileName: "",
      fileSize: 0,
      type: "Document",
      sport: "",
    });
    if (fileRef.current) fileRef.current.value = "";
    toast("Resource uploaded");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <PageHeader
        title="Teaching Resources"
        description="Your PE teaching library — lesson cards, rubrics, assessments and more."
      />

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total resources" value={String(summary.total)} />
        <StatCard label="Lesson cards" value={String(summary.lessonCards)} tone="teal" />
        <StatCard label="Assessments" value={String(summary.assessments)} tone="blue" />
        <StatCard label="Linked to outcomes" value={String(summary.linkedOutcomes)} tone="green" />
      </section>

      <Card className="mb-6">
        <CardHeader title="Filters" />
        <div className="flex flex-wrap gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources…"
            className="min-w-[200px] flex-1"
          />
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All categories</option>
            {RESOURCE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </Select>
          <Select value={pathwayFilter} onChange={(e) => setPathwayFilter(e.target.value)}>
            <option value="">All pathways</option>
            {PATHWAYS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
          <Select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
            <option value="">All year groups</option>
            {YEAR_GROUP_OPTIONS.map((yg) => (
              <option key={yg.id} value={yg.id}>
                {yg.label}
              </option>
            ))}
          </Select>
          <Select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)}>
            <option value="">All sports</option>
            {SPORTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Add resource"
            description="Upload a file or save a link with curriculum information."
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`mb-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition-colors ${
              dragOver ? "border-teal-400 bg-teal-50/50" : "border-slate-200 bg-slate-50/30"
            }`}
          >
            <p className="text-sm text-slate-600">Drop files here or browse</p>
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() => fileRef.current?.click()}
            >
              Browse files
            </Button>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          <div className="space-y-3">
            <FieldGroup label="Title">
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Resource title"
              />
            </FieldGroup>
            <FieldGroup label="Category">
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {RESOURCE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldGroup label="Pathway">
                <Select
                  value={form.pathway}
                  onChange={(e) =>
                    setForm({ ...form, pathway: e.target.value as PathwayId | "" })
                  }
                >
                  <option value="">Any</option>
                  {PATHWAYS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup label="Year group">
                <Select
                  value={form.yearGroup}
                  onChange={(e) =>
                    setForm({ ...form, yearGroup: e.target.value as YearGroup | "" })
                  }
                >
                  <option value="">Any</option>
                  {YEAR_GROUP_OPTIONS.map((yg) => (
                    <option key={yg.id} value={yg.id}>
                      {yg.label}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldGroup label="Topic">
                <Select
                  value={form.sport}
                  onChange={(e) => setForm({ ...form, sport: e.target.value, topicId: e.target.value })}
                >
                  <option value="">Any</option>
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup label="Available curriculum">
                <Select
                  value={form.visibilityLevel}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      visibilityLevel: e.target.value as ResourceVisibilityLevel,
                    })
                  }
                >
                  <option value="private">Private</option>
                  <option value="department">Department</option>
                  <option value="public-ready">Public-ready</option>
                </Select>
              </FieldGroup>
            </div>
            <FieldGroup label="External link (optional)">
              <Input
                value={form.externalLink}
                onChange={(e) => setForm({ ...form, externalLink: e.target.value })}
                placeholder="https://"
              />
            </FieldGroup>
            <FieldGroup label="Notes">
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="How you use this resource"
              />
            </FieldGroup>
            {form.fileName && (
              <p className="text-xs text-teal-700">
                File: {form.fileName} ({formatSize(form.fileSize)})
              </p>
            )}
            <Button onClick={handleSave} disabled={!form.title.trim()}>
              Save resource
            </Button>
          </div>
        </Card>

        <div>
          <CardHeader title="Your library" description={`${filtered.length} shown`} />
          {data.resources.length === 0 ? (
            <EmptyState
              title="Build your teaching library"
              description="Upload lesson cards, assessment sheets and curriculum resources."
              icon={<ResourcesEmptyIllustration />}
              action={
                <Button type="button" onClick={() => fileRef.current?.click()}>
                  Upload resource
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              variant="compact"
              title="No matching resources"
              description="Try adjusting your filters or search terms."
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  onDelete={() => {
                    deleteResource(r.id);
                    toast("Resource removed");
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatAddedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function ResourceCard({
  resource,
  onDelete,
}: {
  resource: ResourceItem;
  onDelete: () => void;
}) {
  const title = resource.title ?? resource.name;
  const tags = [
    ...(resource.keywords ?? []),
    resource.sport,
    resource.pathway ? getPathwayLabel(resource.pathway) : "",
  ].filter(Boolean);

  const canPreview = Boolean(resource.externalLink);
  const canDownload = Boolean(resource.fileName);

  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-medium text-slate-900">{title}</p>
          {resource.createdAt && (
            <p className="text-[10px] text-slate-400">{formatAddedDate(resource.createdAt)}</p>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge tone="purple">{getResourceCategoryLabel(resource.category)}</Badge>
          {resource.yearGroup && (
            <Badge tone="slate">{getYearGroupLabel(resource.yearGroup)}</Badge>
          )}
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {resource.notes && (
          <p className="mt-2 line-clamp-2 text-xs text-slate-500">{resource.notes}</p>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-1">
        {canPreview && (
          <a href={resource.externalLink} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" className="h-8 text-xs">
              Preview
            </Button>
          </a>
        )}
        {canDownload && (
          <Button
            variant="ghost"
            className="h-8 text-xs"
            title={`File: ${resource.fileName} — re-upload to download`}
            disabled
          >
            Download
          </Button>
        )}
        <Button variant="ghost" className="h-8 text-xs text-rose-600" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </Card>
  );
}
