/** Calm SVG illustrations for empty states — Ministry-grade, not emoji placeholders. */

export function LessonsEmptyIllustration() {
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none" aria-hidden>
      <rect x="12" y="8" width="40" height="48" rx="6" className="fill-teal-50 stroke-teal-200" strokeWidth="1.5" />
      <path d="M20 22h24M20 30h18M20 38h22" className="stroke-teal-400" strokeWidth="2" strokeLinecap="round" />
      <circle cx="44" cy="44" r="10" className="fill-teal-600" />
      <path d="M40 44h8M44 40v8" className="stroke-white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SchemesEmptyIllustration() {
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none" aria-hidden>
      <rect x="10" y="14" width="44" height="36" rx="6" className="fill-teal-50 stroke-teal-200" strokeWidth="1.5" />
      <path d="M18 26h28M18 34h20M18 42h24" className="stroke-teal-300" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 8v8" className="stroke-teal-500" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="8" r="3" className="fill-teal-500" />
    </svg>
  );
}

export function ResourcesEmptyIllustration() {
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none" aria-hidden>
      <path
        d="M16 20h32l-4 28H20L16 20z"
        className="fill-teal-50 stroke-teal-200"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M24 28h16M24 36h12" className="stroke-teal-400" strokeWidth="2" strokeLinecap="round" />
      <rect x="28" y="10" width="8" height="10" rx="2" className="fill-teal-600" />
    </svg>
  );
}

export function CalendarEmptyIllustration() {
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none" aria-hidden>
      <rect x="12" y="16" width="40" height="36" rx="6" className="fill-teal-50 stroke-teal-200" strokeWidth="1.5" />
      <path d="M12 26h40" className="stroke-teal-200" strokeWidth="1.5" />
      <circle cx="24" cy="36" r="3" className="fill-teal-500" />
      <circle cx="32" cy="36" r="3" className="fill-teal-300" />
      <circle cx="40" cy="36" r="3" className="fill-teal-300" />
    </svg>
  );
}
