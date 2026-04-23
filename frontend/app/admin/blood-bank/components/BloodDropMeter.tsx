"use client";

import React from "react";
import { Droplet } from "lucide-react";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export default function BloodDropMeter({
  units,
  threshold,
  maxDrops = 10,
}: {
  units: number;
  threshold: number;
  maxDrops?: number;
}) {
  const ratio = threshold > 0 ? units / threshold : 0;
  const filled = clamp(Math.round(ratio * maxDrops), 0, maxDrops);

  return (
    <div className="flex items-center gap-1" aria-label={`Stock meter ${filled} of ${maxDrops}`}>
      {Array.from({ length: maxDrops }).map((_, i) => {
        const on = i < filled;
        return (
          <Droplet
            key={i}
            size={16}
            strokeWidth={1.5}
            className={on ? "text-red-600" : "text-slate-300"}
            fill={on ? "currentColor" : "none"}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

