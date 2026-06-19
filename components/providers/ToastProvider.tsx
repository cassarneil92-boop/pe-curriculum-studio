"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "success" | "info" | "error";

interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 3200;

const TONE_STYLES: Record<ToastTone, string> = {
  success: "border-emerald-200/80 bg-white text-slate-800 shadow-emerald-900/5",
  info: "border-teal-200/80 bg-white text-slate-800 shadow-teal-900/5",
  error: "border-rose-200/80 bg-white text-slate-800 shadow-rose-900/5",
};

const TONE_ICONS: Record<ToastTone, string> = {
  success: "✓",
  info: "·",
  error: "!",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, tone: ToastTone = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const oldest = toasts[0];
    const timer = window.setTimeout(() => dismiss(oldest.id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [toasts, dismiss]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[200] flex w-full max-w-sm flex-col gap-2"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg animate-[toast-in_0.35s_ease-out] ${TONE_STYLES[item.tone]}`}
            role="status"
          >
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                item.tone === "success"
                  ? "bg-emerald-100 text-emerald-700"
                  : item.tone === "error"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-teal-100 text-teal-700"
              }`}
            >
              {TONE_ICONS[item.tone]}
            </span>
            <p className="flex-1 text-sm font-medium leading-snug">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="shrink-0 rounded-lg px-1.5 py-0.5 text-xs text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
