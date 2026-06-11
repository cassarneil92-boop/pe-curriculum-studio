"use client";

import { useRef, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/Input";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { PageHeader } from "@/components/layout/PageHeader";
import { getPathwayLabel, PATHWAYS, SPORTS } from "@/lib/constants";
import {
  getResourceCategoryLabel,
  normaliseResourceCategory,
  RESOURCE_CATEGORIES,
} from "@/lib/resources/categories";
import type { PathwayId, ResourceItem } from "@/lib/types";

export default function ResourcesPage() {
  const { data, addResource, deleteResource } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "Document",
    category: "general",
    pathway: "" as PathwayId | "",
    sport: "",
    notes: "",
    fileName: "",
    fileSize: 0,
  });
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setForm((prev) => ({
      ...prev,
      name: prev.name || file.name.replace(/\.[^.]+$/, ""),
      fileName: file.name,
      fileSize: file.size,
      type: file.type.includes("image")
        ? "Image"
        : file.type.includes("pdf")
          ? "PDF"
          : "Document",
    }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSave = () => {
    if (!form.name) return;
    addResource({
      name: form.name,
      type: form.type,
      category: normaliseResourceCategory(form.category),
      pathway: form.pathway,
      sport: form.sport,
      notes: form.notes,
      fileName: form.fileName,
      fileSize: form.fileSize,
    });
    setForm({
      name: "",
      type: "Document",
      category: "general",
      pathway: "",
      sport: "",
      notes: "",
      fileName: "",
      fileSize: 0,
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <PageHeader
        title="Resources"
        description="Keep your teaching materials in one place. Files are tracked locally in your browser."
      />

      <Card className="mb-6">
        <CardHeader
          title="Resource categories"
          description="Foundation for organising lesson cards, assessments, rubrics, and more."
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              categoryFilter === "all"
                ? "bg-teal-100 text-teal-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            All
          </button>
          {RESOURCE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                categoryFilter === cat.id
                  ? "bg-teal-100 text-teal-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Upload area"
            description="Drag and drop or browse — metadata is saved to localStorage."
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`mb-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
              dragOver
                ? "border-teal-400 bg-teal-50/50"
                : "border-slate-200 bg-slate-50/30"
            }`}
          >
            <svg
              className="mb-3 h-10 w-10 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm text-slate-600">Drop files here</p>
            <p className="mt-1 text-xs text-slate-400">or</p>
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

          {form.fileName && (
            <p className="mb-4 text-xs text-teal-700">
              Selected: {form.fileName} ({formatSize(form.fileSize)})
            </p>
          )}

          <div className="space-y-3">
            <FieldGroup label="Name">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Resource name"
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
              <FieldGroup label="Pathway (optional)">
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
              <FieldGroup label="Sport (optional)">
                <Select
                  value={form.sport}
                  onChange={(e) => setForm({ ...form, sport: e.target.value })}
                >
                  <option value="">Any</option>
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
            </div>
            <FieldGroup label="Notes">
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="How you use this resource"
              />
            </FieldGroup>
            <Button onClick={handleSave} disabled={!form.name}>
              Save resource
            </Button>
          </div>
        </Card>

        <div>
          <CardHeader title="Your resources" description={`${data.resources.length} saved`} />
          {data.resources.length === 0 ? (
            <EmptyState
              title="No resources yet"
              description="Store lesson cards, worksheets, assessments and resources."
              icon={<BrandIcon size={48} className="mx-auto" />}
            />
          ) : (
            <ul className="space-y-2">
              {data.resources
                .filter(
                  (r) =>
                    categoryFilter === "all" ||
                    normaliseResourceCategory(r.category) === categoryFilter
                )
                .map((r: ResourceItem) => (
                <Card key={r.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{r.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {r.type}
                      {r.fileName ? ` · ${r.fileName}` : ""}
                      {r.fileSize ? ` · ${formatSize(r.fileSize)}` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge tone="purple">
                        {getResourceCategoryLabel(r.category)}
                      </Badge>
                      {r.pathway && (
                        <Badge tone="teal">{getPathwayLabel(r.pathway)}</Badge>
                      )}
                      {r.sport && <Badge tone="slate">{r.sport}</Badge>}
                    </div>
                    {r.notes && (
                      <p className="mt-2 text-xs text-slate-500">{r.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    className="text-xs text-red-600"
                    onClick={() => deleteResource(r.id)}
                  >
                    Remove
                  </Button>
                </Card>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
