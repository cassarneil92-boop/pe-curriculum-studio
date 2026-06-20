"use client";

import { useMemo, useState } from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader } from "@/components/ui/Card";
import type { TopicCoverageRow } from "@/lib/progress/teaching-progress-ui";

type SortKey = "topic" | "planned" | "delivered" | "remaining" | "coveragePercent";
type SortDir = "asc" | "desc";

export function TopicCoverageTable({ rows }: { rows: TopicCoverageRow[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("coveragePercent");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q ? rows.filter((r) => r.topic.toLowerCase().includes(q)) : [...rows];

    list.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });

    return list;
  }, [rows, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "topic" ? "asc" : "desc");
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return null;
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Topic coverage</h2>
        <p className="mt-1 text-sm text-slate-500">
          Search and sort every topic — planned, delivered, and remaining outcomes.
        </p>
        <div className="mt-4 max-w-md">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics…"
            aria-label="Search topics"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">
                <button type="button" className="hover:text-slate-800" onClick={() => toggleSort("topic")}>
                  Topic{sortIndicator("topic")}
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button type="button" className="hover:text-slate-800" onClick={() => toggleSort("planned")}>
                  Planned{sortIndicator("planned")}
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button type="button" className="hover:text-slate-800" onClick={() => toggleSort("delivered")}>
                  Delivered{sortIndicator("delivered")}
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button type="button" className="hover:text-slate-800" onClick={() => toggleSort("remaining")}>
                  Remaining{sortIndicator("remaining")}
                </button>
              </th>
              <th className="px-6 py-3 min-w-[140px]">
                <button type="button" className="hover:text-slate-800" onClick={() => toggleSort("coveragePercent")}>
                  Coverage{sortIndicator("coveragePercent")}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                  No topics match your search.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-3.5 font-medium text-slate-800">{row.topic}</td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-slate-600">{row.planned}</td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-emerald-700">{row.delivered}</td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-amber-700">{row.remaining}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-slate-600">
                        {row.coveragePercent}%
                      </span>
                      <ProgressBar
                        className="min-w-[80px] flex-1"
                        value={row.coveragePercent}
                        max={100}
                        showPercent={false}
                        variant={
                          row.coveragePercent >= 70
                            ? "green"
                            : row.coveragePercent >= 30
                              ? "teal"
                              : row.coveragePercent > 0
                                ? "amber"
                                : "rose"
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
