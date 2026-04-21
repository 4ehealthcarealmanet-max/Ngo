"use client";
import React, { useMemo, useState } from "react";
import { AlertTriangle, Calendar, Droplet, Package, Search, Thermometer } from "lucide-react";

type StockStatus = "Healthy" | "Low" | "Critical";

type StockItem = {
  group: string;
  units: number;
  minRequired: number;
  capacityPct: number;
  tempC: number;
  nextExpiryDays: number;
  status: StockStatus;
};

const STOCK: StockItem[] = [
  { group: "O+", units: 12, minRequired: 15, capacityPct: 80, tempC: 4.2, nextExpiryDays: 2, status: "Low" },
  { group: "A-", units: 2, minRequired: 5, capacityPct: 15, tempC: 3.8, nextExpiryDays: 14, status: "Critical" },
  { group: "B+", units: 25, minRequired: 10, capacityPct: 90, tempC: 4.0, nextExpiryDays: 22, status: "Healthy" },
  { group: "AB+", units: 8, minRequired: 5, capacityPct: 40, tempC: 4.1, nextExpiryDays: 8, status: "Healthy" },
];

const HOVER_LIFT_CARD = "hover:shadow-xl hover:-translate-y-2 transition-all duration-300";

const statusPill = (status: StockStatus) => {
  if (status === "Critical") return "border-red-200 bg-red-50 text-red-900";
  if (status === "Low") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-emerald-200 bg-emerald-50 text-emerald-900";
};

const statusBar = (status: StockStatus) => {
  if (status === "Critical") return "bg-red-600";
  if (status === "Low") return "bg-amber-500";
  return "bg-emerald-600";
};

export default function StockInventory() {
  const bloodGroups = useMemo(() => ["All", ...STOCK.map((s) => s.group)], []);
  const [query, setQuery] = useState("");
  const [bloodGroup, setBloodGroup] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STOCK.filter((s) => {
      const matchesGroup = bloodGroup === "All" || s.group === bloodGroup;
      const matchesQuery = !q || `${s.group} ${s.status}`.toLowerCase().includes(q);
      return matchesGroup && matchesQuery;
    });
  }, [query, bloodGroup]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-medium tracking-tight text-slate-900">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">Stock metrics, expiry risk, and replenishment actions.</p>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:justify-end">
          <div className="w-full md:w-[200px]">
            <label className="sr-only" htmlFor="inventory-group-filter">
              Blood group
            </label>
            <select
              id="inventory-group-filter"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {bloodGroups.map((g) => (
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
              placeholder="Search status…"
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filtered.map((item) => {
          const expiryTone =
            item.nextExpiryDays <= 3
              ? "border-red-200 bg-red-50 text-red-900"
              : item.nextExpiryDays <= 10
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-slate-200 bg-white text-slate-700";

          return (
            <div
              key={item.group}
              className={[
                "rounded-lg border border-slate-200 bg-white p-4 shadow-sm",
                HOVER_LIFT_CARD,
                item.status === "Critical" ? "bg-red-50/50 border-red-200" : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700">
                      <Droplet size={14} strokeWidth={1.5} className="mr-1 text-slate-600" />
                      {item.group}
                    </span>
                    <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${statusPill(item.status)}`}>
                      {item.status}
                    </span>
                    <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${expiryTone}`}>
                      <Calendar size={14} strokeWidth={1.5} className="mr-1" />
                      Expiry in {item.nextExpiryDays}d
                    </span>
                  </div>

                  <p className="mt-3 text-2xl font-medium text-slate-900 tabular-nums">
                    {item.units}
                    <span className="ml-1 text-sm font-medium text-slate-500">units</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Threshold <span className="font-medium text-slate-700 tabular-nums">{item.minRequired}</span>
                  </p>
                </div>

                <div className="rounded-md border border-slate-200 bg-white p-2 text-slate-700">
                  <Package size={18} strokeWidth={1.5} />
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Capacity</span>
                    <span className="tabular-nums">{item.capacityPct}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${statusBar(item.status)}`} style={{ width: `${Math.min(100, Math.max(0, item.capacityPct))}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-xs text-slate-500">Cold chain</p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-slate-900 tabular-nums">
                      <Thermometer size={16} strokeWidth={1.5} className="text-blue-600" />
                      {item.tempC.toFixed(1)}°C
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-xs text-slate-500">Expiry risk</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {item.nextExpiryDays <= 3 ? "High" : item.nextExpiryDays <= 10 ? "Medium" : "Low"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <button className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Review lots
                  </button>
                  <button
                    className={[
                      "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white",
                      item.status === "Critical" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700",
                    ].join(" ")}
                  >
                    <AlertTriangle size={16} strokeWidth={1.5} className="mr-2" />
                    {item.status === "Critical" ? "Replenish now" : "Replenish"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
