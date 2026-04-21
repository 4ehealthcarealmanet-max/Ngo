"use client";
import React, { useMemo, useState } from "react";
import { Download, FileText, Search } from "lucide-react";

type LogStatus = "Completed" | "Pending" | "Failed";
type LogType = "Dispatch" | "Replenish" | "Audit";

type TransferLog = {
  id: string;
  type: LogType;
  facility: string;
  bloodGroup: string;
  units: number;
  status: LogStatus;
  createdAt: string;
  reason: string;
};

const LOGS: TransferLog[] = [
  { id: "TXN-8820", type: "Dispatch", facility: "City Hospital", bloodGroup: "O+", units: 2, status: "Completed", createdAt: "Apr 20, 2026", reason: "Emergency surgery" },
  { id: "TXN-8815", type: "Replenish", facility: "Apollo Clinic", bloodGroup: "B+", units: 5, status: "Pending", createdAt: "Apr 19, 2026", reason: "Routine restock" },
  { id: "TXN-8802", type: "Audit", facility: "Central Store", bloodGroup: "A-", units: 0, status: "Completed", createdAt: "Apr 18, 2026", reason: "Weekly audit" },
  { id: "TXN-8791", type: "Dispatch", facility: "Careline ER", bloodGroup: "AB+", units: 1, status: "Failed", createdAt: "Apr 17, 2026", reason: "Route interrupted" },
];

const HOVER_LIFT_CARD = "hover:shadow-xl hover:-translate-y-2 transition-all duration-300";

const statusPill = (status: LogStatus) => {
  if (status === "Completed") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (status === "Pending") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-red-200 bg-red-50 text-red-900";
};

export default function TransferLogs() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<LogType | "All">("All");
  const [status, setStatus] = useState<LogStatus | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LOGS.filter((l) => {
      const matchesQuery = !q || `${l.id} ${l.facility} ${l.bloodGroup} ${l.type} ${l.status} ${l.reason}`.toLowerCase().includes(q);
      const matchesType = type === "All" || l.type === type;
      const matchesStatus = status === "All" || l.status === status;
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [query, type, status]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-medium tracking-tight text-slate-900">Logs</h1>
          <p className="mt-1 text-sm text-slate-500">Detailed transaction history for blood movements and audits.</p>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:justify-end">
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={1.5} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions…"
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <button className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Download size={16} strokeWidth={1.5} className="mr-2" />
            Export
          </button>
        </div>
      </header>

      <section className={`rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden ${HOVER_LIFT_CARD}`}>
        <div className="border-b border-slate-200 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
            <FileText size={18} strokeWidth={1.5} className="text-slate-700" /> Transaction history
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="w-full sm:w-[160px]">
              <label className="sr-only" htmlFor="log-type">Type</label>
              <select
                id="log-type"
                value={type}
                onChange={(e) => setType(e.target.value as LogType | "All")}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="All">All types</option>
                <option value="Dispatch">Dispatch</option>
                <option value="Replenish">Replenish</option>
                <option value="Audit">Audit</option>
              </select>
            </div>

            <div className="w-full sm:w-[160px]">
              <label className="sr-only" htmlFor="log-status">Status</label>
              <select
                id="log-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as LogStatus | "All")}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="All">All status</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Txn</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Type</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Facility</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Blood</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Units</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{row.id}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{row.reason}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{row.type}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{row.facility}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700">
                      {row.bloodGroup}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 tabular-nums">{row.units}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${statusPill(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 tabular-nums">{row.createdAt}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 text-xs text-slate-500">
          Showing <span className="font-medium text-slate-700">{filtered.length}</span> of{" "}
          <span className="font-medium text-slate-700">{LOGS.length}</span>
        </div>
      </section>
    </div>
  );
}
