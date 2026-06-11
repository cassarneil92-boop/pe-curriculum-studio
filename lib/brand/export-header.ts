import { BRAND_FOOTER, BRAND_PATHS } from "./constants";

/** Resolve public brand asset URL for client-side export windows. */
export function resolveBrandAssetUrl(path: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  return path;
}

export function buildExportBrandHeaderHtml(): string {
  const src = resolveBrandAssetUrl(BRAND_PATHS.logoHorizontal);
  return `
    <div class="export-brand-header">
      <img src="${src}" alt="PE Curriculum Studio" />
    </div>
  `;
}

export function buildExportBrandFooterHtml(): string {
  return `<p class="doc-footer">${BRAND_FOOTER}</p>`;
}

export const EXPORT_BRAND_STYLES = `
  .export-brand-header { margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; }
  .export-brand-header img { max-height: 52px; width: auto; height: auto; display: block; object-fit: contain; }
`;
