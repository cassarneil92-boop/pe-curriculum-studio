/** Approved domains for educational source links — verification layer, no open web scraping. */
export const APPROVED_EDUCATION_DOMAINS = [
  "scholar.google.com",
  "eric.ed.gov",
  "shapeamerica.org",
  "afpe.org.uk",
  "ukcoaching.org",
  "sportnz.org.nz",
  "physical-literacy.org.uk",
  "aussiesport.gov.au",
  "youthsporttrust.org",
  "oecd.org",
  "researchgate.net",
  "gov.uk",
  "gov.mt",
] as const;

export function isApprovedEducationDomain(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return APPROVED_EDUCATION_DOMAINS.some(
      (domain) => host === domain || host.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

export function sourceLinkLabel(source: { author?: string; year?: number; title: string }): string {
  const parts = [source.author, source.year?.toString(), source.title].filter(Boolean);
  return parts.join(" · ");
}
