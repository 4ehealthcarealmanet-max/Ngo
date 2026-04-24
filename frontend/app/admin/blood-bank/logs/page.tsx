"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Droplet, History, Plus, Search } from "lucide-react";
import BloodBankTabs from "../components/BloodBankTabs";
import TransferStepper from "../components/TransferStepper";
import { Skeleton } from "../components/Skeleton";
import type { BloodGroup, TransferLog, TransferLogStatus } from "../lib/bloodBankApi";
import { BLOOD_GROUPS, createTransferLog, getTransferLogs } from "../lib/bloodBankApi";
import { publishBloodBankEvent } from "../lib/realtime";
import { PREMIUM_CARD, PREMIUM_ICON_CHIP, PREMIUM_INPUT, PREMIUM_PILL } from "../lib/ui";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const STATUS: Array<"All" | TransferLogStatus> = ["All", "Request Received", "Dispatched", "In Transit", "Delivered"];

export default function TransferLogsPage() {
  const [logs, setLogs] = useState<TransferLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [bloodGroup, setBloodGroup] = useState<"All" | BloodGroup>("All");
  const [status, setStatus] = useState<(typeof STATUS)[number]>("All");

  const [creating, setCreating] = useState(false);
  const [newLog, setNewLog] = useState({
    destination_hospital: "",
    blood_group: "O+" as BloodGroup,
    units_transferred: 1,
    status: "Request Received" as TransferLogStatus,
    rider_contact: "",
  });

  async function refresh() {
    try {
      setError(null);
      const data = await getTransferLogs();
      setLogs(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load transfer logs.");
    }
  }

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 15000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const list = logs || [];
    const q = query.trim().toLowerCase();
    return list
      .filter((l) => (bloodGroup === "All" ? true : l.blood_group === bloodGroup))
      .filter((l) => (status === "All" ? true : l.status === status))
      .filter((l) => (!q ? true : `${l.destination_hospital} ${l.blood_group} ${l.status}`.toLowerCase().includes(q)));
  }, [logs, query, bloodGroup, status]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newLog.destination_hospital.trim() || newLog.units_transferred <= 0) return;
    setCreating(true);
    setError(null);
    setNotice(null);
    try {
      await createTransferLog({
        destination_hospital: newLog.destination_hospital.trim(),
        blood_group: newLog.blood_group,
        units_transferred: newLog.units_transferred,
        status: newLog.status,
        rider_contact: newLog.rider_contact.trim() || undefined,
      });
      publishBloodBankEvent({ type: "transfer_created" });
      setNewLog((p) => ({ ...p, destination_hospital: "", units_transferred: 1, rider_contact: "" }));
      setNotice("Transfer log created. Inventory deducted automatically.");
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to create transfer log.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-medium tracking-tight text-slate-900">Transfer Logs</h1>
          <p className="mt-1 text-sm text-slate-500">Create and audit blood transfers. Status updates drive live tracking.</p>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          {notice ? <p className="mt-2 text-sm text-emerald-700">{notice}</p> : null}
        </div>
        <div className="w-full lg:w-[760px] space-y-3">
          <BloodBankTabs />
          <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-end">
            <div className="w-full md:w-[200px]">
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as any)}
                className={PREMIUM_INPUT}
              >
                <option value="All">All groups</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-[220px]">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className={PREMIUM_INPUT}
              >
                {STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All statuses" : s}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search destination or status..."
                className={`py-2 pl-9 pr-3 ${PREMIUM_INPUT}`}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="xl:col-span-8">
          <div className={`${PREMIUM_CARD} overflow-hidden`}>
            <div className="border-b border-slate-100 p-5 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <History size={18} strokeWidth={1.5} className="text-slate-700" /> Logs
              </p>
              <p className="text-xs text-slate-500">
                Showing <span className="font-medium text-slate-700">{filtered.length}</span>
                {logs ? (
                  <>
                    {" "}
                    of <span className="font-medium text-slate-700">{logs.length}</span>
                  </>
                ) : null}
              </p>
            </div>

            <div className="p-5">
              {logs ? (
                filtered.length ? (
                  <div className="space-y-3">
                    {filtered.map((l) => (
                      <motion.div
                        key={l.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                              <Building2 size={16} strokeWidth={1.5} className="text-slate-700" />
                              <span className="truncate">{l.destination_hospital}</span>
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {l.blood_group} • {l.units_transferred} units • {formatDateTime(l.timestamp)}
                            </p>
                          </div>
                          <span className={`${PREMIUM_PILL} border-slate-200 bg-white text-slate-700`}>#{l.id}</span>
                        </div>
                        <div className="mt-4">
                          <TransferStepper status={l.status} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : logs.length === 0 ? (
                  <div className="py-10">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="rounded-full bg-white p-3 text-slate-700 shadow-sm ring-1 ring-slate-100">
                        <History size={22} strokeWidth={1.5} />
                      </div>
                      <p className="mt-3 text-sm font-medium text-slate-900">No transfer logs yet</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Create a transfer from the panel on the right to start live movements.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-sm text-slate-500">No logs match your filters.</div>
                )
              ) : (
                <div className="p-2">
                  <Skeleton className="h-24 w-full" />
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="xl:col-span-4">
          <div className={`${PREMIUM_CARD} p-5`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-medium text-slate-900">Create transfer</h2>
                <p className="mt-1 text-sm text-slate-500">Creates a log and deducts inventory automatically.</p>
              </div>
              <div className={PREMIUM_ICON_CHIP}>
                <Plus size={18} strokeWidth={1.5} />
              </div>
            </div>

            <form onSubmit={onCreate} className="mt-4 space-y-3">
              <input
                value={newLog.destination_hospital}
                onChange={(e) => setNewLog((p) => ({ ...p, destination_hospital: e.target.value }))}
                placeholder="Destination hospital"
                className={PREMIUM_INPUT}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newLog.blood_group}
                  onChange={(e) => setNewLog((p) => ({ ...p, blood_group: e.target.value as BloodGroup }))}
                  className={PREMIUM_INPUT}
                >
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <input
                  value={newLog.units_transferred}
                  onChange={(e) => setNewLog((p) => ({ ...p, units_transferred: Number(e.target.value) || 0 }))}
                  type="number"
                  min={1}
                  placeholder="Units"
                  className={PREMIUM_INPUT}
                />
              </div>

              <select
                value={newLog.status}
                onChange={(e) => setNewLog((p) => ({ ...p, status: e.target.value as TransferLogStatus }))}
                className={PREMIUM_INPUT}
              >
                <option value="Request Received">Request Received</option>
                <option value="Dispatched">Dispatched</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
              </select>

              <input
                value={newLog.rider_contact}
                onChange={(e) => setNewLog((p) => ({ ...p, rider_contact: e.target.value }))}
                placeholder="Rider contact (optional)"
                className={PREMIUM_INPUT}
              />

              <button
                disabled={creating}
                className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-slate-900 hover:shadow-md disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create log"}
              </button>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <Droplet size={14} strokeWidth={1.5} className="text-slate-500" /> Insufficient stock returns a validation error.
              </p>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
