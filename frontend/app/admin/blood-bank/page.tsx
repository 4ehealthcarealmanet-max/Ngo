"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Droplet, History, RotateCw, Truck, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiUrl } from "../../lib/api";
import BloodBankTabs from "./components/BloodBankTabs";
import BloodDropMeter from "./components/BloodDropMeter";
import { Skeleton } from "./components/Skeleton";
import TransferStepper from "./components/TransferStepper";
import type { BloodStock, DonorRegistry, TransferLog } from "./lib/bloodBankApi";
import { BLOOD_GROUPS, getDonors, getStocks, getTransferLogs } from "./lib/bloodBankApi";
import { subscribeBloodBankEvents } from "./lib/realtime";
import { PREMIUM_CARD, PREMIUM_ICON_CHIP, PREMIUM_PILL } from "./lib/ui";

const KPI_CARD_BASE = "rounded-3xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1";
const LOW_STOCK_THRESHOLD = 5;

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default function BloodBankCommandCenter() {
  const router = useRouter();
  const [stocks, setStocks] = useState<BloodStock[] | null>(null);
  const [donors, setDonors] = useState<DonorRegistry[] | null>(null);
  const [logs, setLogs] = useState<TransferLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setError(null);
      const [s, d, l] = await Promise.all([getStocks(), getDonors(), getTransferLogs()]);
      setStocks(s);
      setDonors(d);
      setLogs(l);

      // Debug logging requested: helps verify API connection + response payloads.
      // eslint-disable-next-line no-console
      console.log("[BloodBank] API:", {
        stocksUrl: apiUrl("/api/blood-stocks/"),
        donorsUrl: apiUrl("/api/blood-donors/"),
        logsUrl: apiUrl("/api/transfer-logs/"),
      });
      // eslint-disable-next-line no-console
      console.log("[BloodBank] /api/blood-stocks/ response:", s);
    } catch (e: any) {
      setError(e?.message || "Failed to load data.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await load();
    })();
    const id = window.setInterval(() => {
      if (!alive) return;
      load();
    }, 15000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [load]);

  useEffect(() => {
    return subscribeBloodBankEvents((evt) => {
      if (evt.type === "transfer_created" || evt.type === "transfer_updated" || evt.type === "donation_created") {
        load();
      }
    });
  }, [load]);

  const stockByGroup = useMemo(() => {
    const map = new Map<string, BloodStock>();
    (stocks || []).forEach((s) => map.set(s.blood_group, s));
    return map;
  }, [stocks]);

  const kpis = useMemo(() => {
    const allStocks = stocks || [];
    const totalUnits = allStocks.reduce((sum, s) => sum + (s.units_available || 0), 0);
    const low = allStocks.filter((s) => (s.units_available || 0) <= LOW_STOCK_THRESHOLD).length;
    const activeTransfers = (logs || []).filter((l) => l.status !== "Delivered").length;
    const donorCount = donors?.length || 0;
    return [
      {
        label: "Total units",
        value: totalUnits.toLocaleString(),
        sub: "Across all blood groups",
        icon: Droplet,
        bg: "bg-gradient-to-br from-white to-blue-50/70",
        border: "border-blue-100",
        hoverBorder: "hover:border-blue-200",
        accent: "text-blue-600",
      },
      {
        label: "Low stock",
        value: low.toLocaleString(),
        sub: `≤ ${LOW_STOCK_THRESHOLD} units`,
        icon: AlertCircle,
        bg: "bg-gradient-to-br from-white to-rose-50/70",
        border: "border-rose-100",
        hoverBorder: "hover:border-rose-200",
        accent: "text-rose-600",
      },
      {
        label: "Active transfers",
        value: activeTransfers.toLocaleString(),
        sub: "Not delivered",
        icon: Truck,
        bg: "bg-gradient-to-br from-white to-amber-50/70",
        border: "border-amber-100",
        hoverBorder: "hover:border-amber-200",
        accent: "text-amber-700",
      },
      {
        label: "Donors",
        value: donorCount.toLocaleString(),
        sub: "In registry",
        icon: Users,
        bg: "bg-gradient-to-br from-white to-emerald-50/70",
        border: "border-emerald-100",
        hoverBorder: "hover:border-emerald-200",
        accent: "text-emerald-700",
      },
    ] as const;
  }, [stocks, logs, donors]);

  const recentDonors = useMemo(() => {
    const list = [...(donors || [])];
    list.sort((a, b) => (b.last_donation_date || "").localeCompare(a.last_donation_date || ""));
    return list.slice(0, 6);
  }, [donors]);

  const activeTransfers = useMemo(() => {
    const list = (logs || []).filter((l) => l.status !== "Delivered");
    return list.slice(0, 4);
  }, [logs]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-medium tracking-tight text-slate-900">Blood Bank</h1>
          <p className="mt-1 text-sm text-slate-500">Live inventory, donor registry, and transfer tracking.</p>
          {error ? (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          ) : (
            <p className="mt-2 text-xs text-slate-400">Auto-refresh every 15 seconds</p>
          )}
        </div>
        <div className="w-full lg:w-auto space-y-3">
          <BloodBankTabs />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={load}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              aria-label="Refresh"
              title="Refresh"
            >
              <RotateCw size={14} strokeWidth={1.5} className={refreshing ? "motion-safe:animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`${KPI_CARD_BASE} ${kpi.bg} ${kpi.border} ${kpi.hoverBorder}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-900">{kpi.label}</p>
                <p className={`mt-3 text-3xl font-black tabular-nums ${kpi.accent}`}>{kpi.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{kpi.sub}</p>
              </div>

              <div className="shrink-0 rounded-full bg-white p-3 shadow-sm ring-1 ring-slate-100">
                <kpi.icon size={22} strokeWidth={1.8} className={kpi.accent} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        <section className="space-y-6 xl:col-span-7">
          <div className={`${PREMIUM_CARD} p-5`}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-sm font-medium text-slate-900">Inventory snapshot</h2>
                <p className="mt-1 text-sm text-slate-500">Units per blood group with low-stock alerts.</p>
              </div>
              <button
                onClick={() => router.push("/admin/blood-bank/inventory")}
                className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white"
              >
                View inventory
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {BLOOD_GROUPS.map((bg) => {
                const item = stockByGroup.get(bg);
                const units = item?.units_available ?? 0;
                const low = units <= LOW_STOCK_THRESHOLD;
                return (
                  <motion.div
                    key={bg}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={[
                      "rounded-3xl border p-4 shadow-sm transition-all duration-300 hover:shadow-md bg-gradient-to-br from-white to-slate-50/50",
                      low ? "border-rose-100 bg-gradient-to-br from-white to-rose-50/60" : "border-slate-100",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {bg}
                          </span>
                          {low ? (
                            <span className={`${PREMIUM_PILL} border-rose-200 bg-rose-50 text-rose-800`}>
                              Low stock
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-2 text-2xl font-medium text-slate-900 tabular-nums">
                          {stocks ? units : <Skeleton className="h-8 w-20" />}
                        </div>
                        <div className="mt-2">
                          <BloodDropMeter units={units} threshold={10} />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">Updated {item?.last_updated ? formatDate(item.last_updated) : "—"}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-2 text-slate-700 shadow-sm ring-1 ring-slate-100">
                        <Droplet size={18} strokeWidth={1.5} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className={`${PREMIUM_CARD} overflow-hidden`}>
            <div className="border-b border-slate-100 p-5 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <Users size={18} strokeWidth={1.5} className="text-slate-700" /> Recent donors
              </p>
              <button
                onClick={() => router.push("/admin/blood-bank/donors")}
                className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white"
              >
                View donors
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Name</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Blood group</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Last donation</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donors ? (
                    recentDonors.map((d) => (
                      <tr key={d.id} className="border-b border-slate-50 hover:bg-white/70 transition-colors">
                        <td className="px-5 py-4 text-sm font-semibold text-slate-900">{d.name}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {d.blood_group}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-700 tabular-nums">{formatDate(d.last_donation_date)}</td>
                        <td className="px-5 py-4">
                          <span
                            className={[
                              PREMIUM_PILL,
                              d.status === "Available"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border-amber-200 bg-amber-50 text-amber-900",
                            ].join(" ")}
                          >
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-5 py-5" colSpan={4}>
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="space-y-6 xl:col-span-5">
          <div className={`${PREMIUM_CARD} p-5`}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-sm font-medium text-slate-900">Live tracking</h2>
                <p className="mt-1 text-sm text-slate-500">Transfer timeline with status stepper.</p>
              </div>
              <button
                onClick={() => router.push("/admin/blood-bank/tracking")}
                className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white"
              >
                Open tracking
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {logs ? (
                activeTransfers.length ? (
                  activeTransfers.map((t) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 p-4 shadow-sm transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{t.destination_hospital}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {t.blood_group} • {t.units_transferred} units • {formatDate(t.timestamp)}
                          </p>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                          #{t.id}
                        </span>
                      </div>
                      <div className="mt-3">
                        <TransferStepper status={t.status} />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 p-8 text-center shadow-sm">
                    <div className="mx-auto inline-flex rounded-full bg-white p-3 text-slate-700 shadow-sm ring-1 ring-slate-100">
                      <Truck size={22} strokeWidth={1.5} />
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-900">No active movements</p>
                    <p className="mt-1 text-sm text-slate-500">Start a transfer from the Logs tab.</p>
                  </div>
                )
              ) : (
                <Skeleton className="h-24 w-full" />
              )}
            </div>
          </div>

          <div className={`${PREMIUM_CARD} p-5`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-medium text-slate-900">Operator shortcuts</h2>
                <p className="mt-1 text-sm text-slate-500">Quick access to core workflows.</p>
              </div>
              <div className={PREMIUM_ICON_CHIP}>
                <History size={18} strokeWidth={1.5} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <button
                onClick={() => router.push("/admin/blood-bank/donors")}
                className="inline-flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md"
              >
                <span className="inline-flex items-center gap-2">
                  <Users size={18} strokeWidth={1.5} /> Donors
                </span>
                <span className="text-xs text-slate-500">Directory</span>
              </button>
              <button
                onClick={() => router.push("/admin/blood-bank/inventory")}
                className="inline-flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md"
              >
                <span className="inline-flex items-center gap-2">
                  <Droplet size={18} strokeWidth={1.5} /> Inventory
                </span>
                <span className="text-xs text-slate-500">Stock</span>
              </button>
              <button
                onClick={() => router.push("/admin/blood-bank/logs")}
                className="inline-flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md"
              >
                <span className="inline-flex items-center gap-2">
                  <History size={18} strokeWidth={1.5} /> Transfer logs
                </span>
                <span className="text-xs text-slate-500">Audit</span>
              </button>
              <button
                onClick={() => router.push("/admin/blood-bank/tracking")}
                className="inline-flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md"
              >
                <span className="inline-flex items-center gap-2">
                  <Truck size={18} strokeWidth={1.5} /> Tracking
                </span>
                <span className="text-xs text-slate-500">Live</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
