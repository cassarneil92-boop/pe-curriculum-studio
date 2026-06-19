"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Thin top bar — only visible if route transition exceeds delay threshold. */
export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const delayRef = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (delayRef.current !== null) window.clearTimeout(delayRef.current);
    if (animRef.current !== null) window.cancelAnimationFrame(animRef.current);

    setActive(false);
    setProgress(0);

    delayRef.current = window.setTimeout(() => {
      setActive(true);
      setProgress(30);

      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const next = Math.min(90, 30 + elapsed / 20);
        setProgress(next);
        if (next < 90) animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
    }, 280);

    const complete = window.setTimeout(() => {
      setProgress(100);
      window.setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 180);
    }, 320);

    return () => {
      if (delayRef.current !== null) window.clearTimeout(delayRef.current);
      if (animRef.current !== null) window.cancelAnimationFrame(animRef.current);
      window.clearTimeout(complete);
    };
  }, [pathname]);

  if (!active && progress === 0) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[150] h-0.5 bg-teal-100/80"
      aria-hidden
    >
      <div
        className="h-full bg-teal-600 transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
