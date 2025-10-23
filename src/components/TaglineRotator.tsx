"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * TaglineRotator
 * - Fades between lines with a long pause in between.
 * - No external deps (pure CSS transition).
 *
 * Props:
 *  - lines: string[]                // taglines to rotate
 *  - delayMs?: number               // pause while visible (default 8000 ms)
 *  - fadeMs?: number                // fade duration (default 600 ms)
 *  - className?: string             // extra classes for text (size/color)
 */
export default function TaglineRotator({
  lines,
  delayMs = 8000,
  fadeMs = 600,
  className = "",
}: {
  lines: string[];
  delayMs?: number;
  fadeMs?: number;
  className?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!lines?.length) return;

    function schedule() {
      // 1) Stay visible for delayMs
      const t1 = window.setTimeout(() => setVisible(false), delayMs);
      // 2) After fade out, swap text and fade in
      const t2 = window.setTimeout(() => {
        setIdx((i) => (i + 1) % lines.length);
        setVisible(true);
        schedule(); // loop
      }, delayMs + fadeMs);

      timers.current.push(t1, t2);
    }

    schedule();

    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current = [];
    };
  }, [lines, delayMs, fadeMs]);

  const line = lines?.[idx] ?? "";

  return (
    <div
      className={className}
      style={{
        transition: `opacity ${fadeMs}ms ease`,
        opacity: visible ? 1 : 0,
      }}
    >
      {line}
    </div>
  );
}
