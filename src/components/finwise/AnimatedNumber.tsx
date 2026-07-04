import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// Respect the user's reduced-motion preference — skip animation entirely.
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function AnimatedNumber({
  value,
  format = (n) => n.toLocaleString("pt-BR"),
  duration = 500,
  className,
  style,
}: Props) {
  const target = Number.isFinite(value) ? value : 0;
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    // No-op if unchanged — prevents wasted RAF loops on every re-render.
    if (from === target) return;

    // Small deltas or reduced motion: snap instantly (no CPU cost).
    if (prefersReducedMotion() || Math.abs(target - from) < 0.5) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const current = from + (target - from) * easeOut(p);
      setDisplay(current);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      // Ensure the final value sticks even when interrupted.
      fromRef.current = target;
    };
  }, [target, duration]);

  return (
    <span className={className} style={style}>
      {format(display)}
    </span>
  );
}
