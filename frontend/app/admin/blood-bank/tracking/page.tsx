"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crosshair, Map as MapIcon, Navigation, Truck } from "lucide-react";
import dynamic from "next/dynamic";
import BloodBankTabs from "../components/BloodBankTabs";
import TransferStepper from "../components/TransferStepper";
import { Skeleton } from "../components/Skeleton";
import type { TransferLog, TransferLogStatus } from "../lib/bloodBankApi";
import { getTransferLogs, patchTransferLog } from "../lib/bloodBankApi";
import { publishBloodBankEvent, subscribeBloodBankEvents } from "../lib/realtime";
import { PREMIUM_CARD, PREMIUM_ICON_CHIP, PREMIUM_INPUT, PREMIUM_PILL } from "../lib/ui";

const TransferMap = dynamic(() => import("../components/TransferMap"), { ssr: false });

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const STATUS: TransferLogStatus[] = ["Request Received", "Dispatched", "In Transit", "Delivered"];

const MP_LOCATIONS: Record<string, { lat: number; lng: number; label: string }> = {
  indore: { lat: 22.7196, lng: 75.8577, label: "Indore" },
  dewas: { lat: 22.9676, lng: 76.0534, label: "Dewas" },
  ujjain: { lat: 23.1765, lng: 75.7885, label: "Ujjain" },
};

function inferLocationFromDestination(destination: string | null | undefined) {
  const name = (destination || "").toLowerCase();
  if (name.includes("dewas")) return MP_LOCATIONS.dewas;
  if (name.includes("ujjain")) return MP_LOCATIONS.ujjain;
  if (name.includes("indore")) return MP_LOCATIONS.indore;
  return null;
}

export default function LiveTrackingPage() {
  const [logs, setLogs] = useState<TransferLog[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    try {
      setError(null);
      const data = await getTransferLogs();
      setLogs(data);
      if (!selectedId && data.length) setSelectedId(data[0].id);
    } catch (e: any) {
      setError(e?.message || "Failed to load tracking.");
    }
  }

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 10000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return subscribeBloodBankEvents((evt) => {
      if (evt.type === "transfer_created" || evt.type === "transfer_updated") {
        refresh();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = useMemo(() => (logs || []).filter((l) => l.status !== "Delivered"), [logs]);
  const selected = useMemo(() => (logs || []).find((l) => l.id === selectedId) || null, [logs, selectedId]);
  const inferred = useMemo(() => inferLocationFromDestination(selected?.destination_hospital), [selected?.destination_hospital]);
  const mapLat = selected?.current_lat ?? inferred?.lat ?? null;
  const mapLng = selected?.current_lng ?? inferred?.lng ?? null;

  async function updateSelected(input: Partial<Pick<TransferLog, "status" | "current_lat" | "current_lng" | "rider_contact">>) {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await patchTransferLog(selected.id, input);
      setLogs((prev) => (prev ? prev.map((l) => (l.id === updated.id ? updated : l)) : [updated]));
      publishBloodBankEvent({ type: "transfer_updated" });
    } catch (e: any) {
      setError(e?.message || "Failed to update transfer.");
    } finally {
      setSaving(false);
    }
  }

  async function setLiveLocation() {
    if (!navigator.geolocation || !selected) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateSelected({ current_lat: pos.coords.latitude, current_lng: pos.coords.longitude });
      },
      () => setError("Location permission denied.")
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-medium tracking-tight text-slate-900">Live Tracking</h1>
          <p className="mt-1 text-sm text-slate-500">Visual stepper + map preview for transfer logs.</p>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : <p className="mt-2 text-xs text-slate-400">Auto-refresh every 10 seconds</p>}
        </div>
        <div className="w-full lg:w-auto">
          <BloodBankTabs />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="xl:col-span-5 space-y-4">
          <div className={`${PREMIUM_CARD} overflow-hidden`}>
            <div className="border-b border-slate-100 p-5 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <Truck size={18} strokeWidth={1.5} className="text-slate-700" /> Active transfers
              </p>
              <p className="text-xs text-slate-500">
                {logs ? <span className="font-medium text-slate-700">{active.length}</span> : "—"} active
              </p>
            </div>

            <div className="p-5">
              {logs ? (
                active.length ? (
                  <div className="space-y-3">
                    {active.map((l) => {
                      const selectedRow = selectedId === l.id;
                      return (
                        <button
                          key={l.id}
                          onClick={() => setSelectedId(l.id)}
                          className={[
                            "w-full text-left rounded-3xl border p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1",
                            selectedRow
                              ? "border-blue-200 bg-gradient-to-br from-white to-blue-50/60"
                              : "border-slate-100 bg-gradient-to-br from-white to-slate-50/50",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{l.destination_hospital}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {l.blood_group} • {l.units_transferred} units • {formatDateTime(l.timestamp)}
                              </p>
                            </div>
                            <span className={`${PREMIUM_PILL} border-slate-200 bg-white text-slate-700`}>#{l.id}</span>
                          </div>
                          <div className="mt-4">
                            <TransferStepper status={l.status} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-10">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="rounded-full bg-white p-3 text-slate-700 shadow-sm ring-1 ring-slate-100">
                        <Truck size={22} strokeWidth={1.5} />
                      </div>
                      <p className="mt-3 text-sm font-medium text-slate-900">No active movements</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Start a transfer from the Logs tab.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="p-2">
                  <Skeleton className="h-24 w-full" />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="xl:col-span-7 space-y-4">
          <div className={`${PREMIUM_CARD} p-5`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-sm font-medium text-slate-900">Tracking console</h2>
                <p className="mt-1 text-sm text-slate-500">Update status and location for the selected transfer.</p>
              </div>
              <div className={PREMIUM_ICON_CHIP}>
                <MapIcon size={18} strokeWidth={1.5} />
              </div>
            </div>

            {selected ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mt-4 space-y-4">
                <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900 truncate">{selected.destination_hospital}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {selected.blood_group} • {selected.units_transferred} units • #{selected.id}
                  </p>
                  <div className="mt-3">
                    <TransferStepper status={selected.status} />
                  </div>
                </div>

                <div className="relative">
                  <TransferMap lat={mapLat} lng={mapLng} label={inferred?.label || selected.destination_hospital} zoom={13} />
                  {!selected.current_lat || !selected.current_lng ? (
                    <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 rounded-2xl border border-slate-100 bg-white/80 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-md">
                      Showing {inferred?.label || "Indore"} map preview
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Status</label>
                    <select
                      value={selected.status}
                      onChange={(e) => updateSelected({ status: e.target.value as TransferLogStatus })}
                      className={`mt-1 ${PREMIUM_INPUT}`}
                      disabled={saving}
                    >
                      {STATUS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">Rider contact</label>
                    <input
                      value={selected.rider_contact || ""}
                      onChange={(e) => updateSelected({ rider_contact: e.target.value })}
                      placeholder="Optional"
                      className={`mt-1 ${PREMIUM_INPUT}`}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <button
                    onClick={setLiveLocation}
                    disabled={saving || !navigator.geolocation}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md disabled:opacity-60"
                  >
                    <Crosshair size={16} strokeWidth={1.5} /> Use my location
                  </button>
                  <button
                    onClick={() => updateSelected({ status: "Dispatched" })}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-slate-900 hover:shadow-md disabled:opacity-60"
                  >
                    <Navigation size={16} strokeWidth={1.5} /> Mark dispatched
                  </button>
                  <button
                    onClick={() => updateSelected({ status: "Delivered" })}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition-all duration-300 hover:bg-emerald-100 hover:shadow-md disabled:opacity-60"
                  >
                    Mark delivered
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">No selection</p>
                  <p className="mt-1 text-sm text-slate-500">Pick an active transfer to see its status and location.</p>
                </div>
                <TransferMap lat={22.7196} lng={75.8577} label="Indore" zoom={13} />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
