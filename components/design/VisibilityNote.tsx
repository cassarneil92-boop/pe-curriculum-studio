export function VisibilityNote({ className = "" }: { className?: string }) {
  return (
    <p
      className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200/60 ${className}`}
    >
      Outside your current teaching context
    </p>
  );
}
