"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Droplet, Search } from "lucide-react";
import BloodBankTabs from "../components/BloodBankTabs";
import BloodDropMeter from "../components/BloodDropMeter";
import { Skeleton } from "../components/Skeleton";
import type { BloodStock, BloodGroup } from "../lib/bloodBankApi";
import { BLOOD_GROUPS, getStocks } from "../lib/bloodBankApi";
import { PREMIUM_CARD, PREMIUM_ICON_CHIP, PREMIUM_INPUT, PREMIUM_META_BADGE, PREMIUM_PILL } from "../lib/ui";

const LOW_STOCK_THRESHOLD = 5;
const CRITICAL_STOCK_THRESHOLD = 2;

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function StockInventory() {
  const [stocks, setStocks] = useState<BloodStock[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [bloodGroup, setBloodGroup] = useState<"All" | BloodGroup>("All");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setError(null);
        const data = await getStocks();
        if (!alive) return;
        setStocks(data);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load inventory.");
      }
    }
    load();
    const id = window.setInterval(load, 15000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  const rows = useMemo(() => {
    const list = stocks || [];
    const q = query.trim().toLowerCase();
    return list
      .filter((s) => (bloodGroup === "All" ? true : s.blood_group === bloodGroup))
      .filter((s) => (!q ? true : `${s.blood_group} ${s.units_available}`.toLowerCase().includes(q)))
      .sort((a, b) => a.blood_group.localeCompare(b.blood_group));
  }, [stocks, query, bloodGroup]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-medium tracking-tight text-slate-900">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">Real-time stock grid with low-stock alerts.</p>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </div>
        <div className="w-full lg:w-auto space-y-3">
          <BloodBankTabs />
          <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-end">
            <div className="w-full md:w-[200px]">
              <label className="sr-only" htmlFor="inventory-group-filter">
                Blood group
              </label>
              <select
                id="inventory-group-filter"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as any)}
                className={PREMIUM_INPUT}
              >
                <option value="All">All</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full md:w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search blood group..."
                className={`py-2 pl-9 pr-3 ${PREMIUM_INPUT}`}
              />
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {stocks ? (
          rows.map((item) => {
            const units = item.units_available || 0;
            const low = units <= LOW_STOCK_THRESHOLD;
            const critical = units <= CRITICAL_STOCK_THRESHOLD;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={[
                  PREMIUM_CARD,
                  "p-6",
                  low ? "border-rose-100 bg-gradient-to-br from-white to-rose-50/60" : "border-slate-100",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                        <Droplet size={14} strokeWidth={1.5} className="mr-1 text-slate-600" />
                        {item.blood_group}
                      </span>
                      {critical ? (
                        <span className={`${PREMIUM_PILL} border-rose-200 bg-rose-50 text-rose-800`}>
                          <AlertTriangle size={14} strokeWidth={1.5} className="mr-1" />
                          Critical
                        </span>
                      ) : low ? (
                        <span className={`${PREMIUM_PILL} border-rose-200 bg-rose-50 text-rose-800`}>
                          <AlertTriangle size={14} strokeWidth={1.5} className="mr-1" />
                          Low Stock
                        </span>
                      ) : (
                        <span className={`${PREMIUM_PILL} border-emerald-200 bg-emerald-50 text-emerald-800`}>
                          Healthy
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-2xl font-medium text-slate-900 tabular-nums">
                      {units}
                      <span className="ml-1 text-sm font-medium text-slate-500">units</span>
                    </p>
                    <div className="mt-2">
                      <BloodDropMeter units={units} threshold={10} />
                    </div>
                    <div className="mt-3">
                      <span className={PREMIUM_META_BADGE}>Last updated {formatDateTime(item.last_updated)}</span>
                    </div>
                  </div>

                  <div className={PREMIUM_ICON_CHIP}>
                    <Droplet
                      size={20}
                      strokeWidth={1.6}
                      className={[critical ? "text-rose-600 motion-safe:animate-pulse" : low ? "text-rose-600" : "text-blue-600"].join(
                        " "
                      )}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </>
        )}
      </section>
    </div>
  );
}
