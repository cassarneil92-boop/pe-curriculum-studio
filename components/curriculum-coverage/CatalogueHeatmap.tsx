import type { CatalogueCoverageStatus, HeatmapCell } from "@/src/lib/curriculum/coverage/types";

const STATUS_CELL: Record<CatalogueCoverageStatus, string> = {
  strong: "bg-teal-100 text-teal-900 border-teal-200",
  thin: "bg-amber-50 text-amber-900 border-amber-200",
  missing: "bg-slate-100 text-slate-500 border-slate-200",
  "fallback-only": "bg-violet-50 text-violet-900 border-violet-200",
  "needs-review": "bg-orange-50 text-orange-900 border-orange-200",
  absent: "bg-slate-50 text-slate-400 border-slate-200",
};

export const STATUS_LABELS: Record<CatalogueCoverageStatus, string> = {
  strong: "Strong",
  thin: "Thin",
  missing: "Missing",
  "fallback-only": "Fallback only",
  "needs-review": "Needs review",
  absent: "Missing",
};

export function CatalogueStatusBadge({ status }: { status: CatalogueCoverageStatus }) {
  const tone =
    status === "strong"
      ? "teal"
      : status === "thin"
        ? "amber"
        : status === "fallback-only"
          ? "violet"
          : status === "needs-review"
            ? "orange"
            : "slate";

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        tone === "teal"
          ? "bg-teal-100 text-teal-800"
          : tone === "amber"
            ? "bg-amber-100 text-amber-900"
            : tone === "violet"
              ? "bg-violet-100 text-violet-800"
              : tone === "orange"
                ? "bg-orange-100 text-orange-900"
                : "bg-slate-100 text-slate-600"
      }`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PathwayYearHeatmap({ cells }: { cells: HeatmapCell[] }) {
  const rowLabels = [...new Set(cells.map((c) => c.rowLabel))];
  const columnLabels = [...new Set(cells.map((c) => c.columnLabel))];

  if (cells.length === 0) {
    return <p className="text-sm text-slate-500">No pathway × year data to display yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white px-2 py-2 text-left font-medium text-slate-500">
              Pathway
            </th>
            {columnLabels.map((col) => (
              <th key={col} className="px-1 py-2 text-center font-medium text-slate-500">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowLabels.map((row) => (
            <tr key={row} className="border-t border-slate-100">
              <th className="sticky left-0 z-10 bg-white px-2 py-1.5 text-left font-medium text-slate-700">
                {row}
              </th>
              {columnLabels.map((col) => {
                const cell = cells.find((c) => c.rowLabel === row && c.columnLabel === col);
                const count = cell?.count ?? 0;
                const status = cell?.status ?? "missing";
                return (
                  <td key={`${row}-${col}`} className="px-1 py-1.5 text-center">
                    <span
                      className={`inline-flex min-w-[2.25rem] justify-center rounded border px-1.5 py-0.5 tabular-nums ${STATUS_CELL[status]}`}
                      title={`${row} · ${col}: ${count} imported outcome${count === 1 ? "" : "s"}`}
                    >
                      {count > 0 ? count : "—"}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
