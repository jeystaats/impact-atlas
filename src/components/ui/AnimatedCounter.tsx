"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  formatFn?: (value: number) => string;
  className?: string;
}

// Default formatter: adds K for thousands, M for millions
function defaultFormat(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return Math.round(value).toString();
}

// Spring easing function for overshoot effect
function springEase(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  delay = 0,
  formatFn = defaultFormat,
  className = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now() + delay * 1000;
    const _endTime = startTime + duration * 1000;

    function animate(currentTime: number) {
      if (currentTime < startTime) {
        requestAnimationFrame(animate);
        return;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Use spring easing for overshoot effect
      const easedProgress = springEase(progress);
      const currentValue = easedProgress * value;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    }

    requestAnimationFrame(animate);
  }, [isInView, value, duration, delay]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {formatFn(displayValue)}
    </span>
  );
}
