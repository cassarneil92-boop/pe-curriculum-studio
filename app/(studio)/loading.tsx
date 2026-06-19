export default function StudioLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading page">
      <div className="h-9 w-56 rounded-lg bg-slate-200" />
      <div className="h-4 w-full max-w-xl rounded bg-slate-100" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-32 rounded-2xl bg-slate-100" />
        <div className="h-32 rounded-2xl bg-slate-100" />
      </div>
      <div className="h-64 rounded-2xl bg-slate-100" />
    </div>
  );
}
