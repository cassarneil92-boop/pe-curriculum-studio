"use client";

import { Button } from "@/components/ui/Button";
import { exportDocument } from "@/lib/export";
import type { ExportFormat } from "@/lib/types";

interface ExportMenuProps {
  html: string;
  filename: string;
}

export function ExportMenu({ html, filename }: ExportMenuProps) {
  const handleExport = (format: ExportFormat) => {
    exportDocument(html, filename, format);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={() => handleExport("pdf")}>
        Export PDF
      </Button>
      <Button variant="secondary" onClick={() => handleExport("word")}>
        Export Word
      </Button>
      <Button variant="secondary" onClick={() => handleExport("print")}>
        Print
      </Button>
    </div>
  );
}
