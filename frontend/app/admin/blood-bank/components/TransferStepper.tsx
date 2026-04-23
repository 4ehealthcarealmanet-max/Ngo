"use client";

import React from "react";
import { motion } from "framer-motion";
import type { TransferLogStatus } from "../lib/bloodBankApi";

const steps: TransferLogStatus[] = ["Request Received", "Dispatched", "In Transit", "Delivered"];

const idxOf = (s: TransferLogStatus) => Math.max(0, steps.indexOf(s));

export default function TransferStepper({ status }: { status: TransferLogStatus }) {
  const currentIdx = idxOf(status);
  const pct = (currentIdx / (steps.length - 1)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{steps[0]}</span>
        <span>{steps[steps.length - 1]}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {steps.map((s, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <span
              key={s}
              className={[
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300",
                active
                  ? "border-blue-600 bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                  : done
                    ? "border-blue-100 bg-blue-50 text-blue-800"
                    : "border-slate-200 bg-white text-slate-600",
              ].join(" ")}
            >
              {s}
            </span>
          );
        })}
      </div>
    </div>
  );
}
