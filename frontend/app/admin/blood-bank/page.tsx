"use client";
import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  Droplet,
  HeartPulse,
  Search,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

type InventoryStatus = "Healthy" | "Low" | "Critical";

type InventoryMetric = {
  group: string;
  current: number;
  minRequired: number;
  trend: number[];
};

type Delivery = {
  id: string;
  target: string;
  eta: string;
  status: "Dispatching" | "On Way" | "Delivered";
  progress: number;
};

type DonorLog = {
  id: string;
  name: string;
  bloodGroup: string;
  lastDonation: string;
  status: "Verified" | "Pending" | "Flagged";
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const getInventoryStatus = (current: number, minRequired: number): InventoryStatus => {
  if (current <= Math.max(1, Math.floor(minRequired * 0.5))) return "Critical";
  if (current < minRequired) return "Low";
  return "Healthy";
};

const tone = {
  primary: {
    button: "bg-blue-600 text-white hover:bg-blue-700",
    ring: "ring-blue-200/60",
    dot: "bg-blue-600",
  },
  success: {
    pill: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-600",
    bar: "bg-emerald-600",
    spark: "#16a34a",
  },
  warning: {
    pill: "border-amber-200 bg-amber-50 text-amber-900",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    spark: "#f59e0b",
  },
  danger: {
    pill: "border-red-200 bg-red-50 text-red-900",
    dot: "bg-red-600",
    bar: "bg-red-600",
    spark: "#dc2626",
  },
  neutral: {
    card: "bg-white border border-slate-200 rounded-lg",
    subtext: "text-slate-500",
  },
} as const;

const HOVER_LIFT_CARD = "hover:shadow-xl hover:-translate-y-2 transition-all duration-300";

function Sparkline({ data, stroke }: { data: number[]; stroke: string }) {
  const points = useMemo(() => {
    const safe = Array.isArray(data) && data.length >= 2 ? data : [0, 0];
    const min = Math.min(...safe);
    const max = Math.max(...safe);
    const range = max - min || 1;
    return safe.map((v, i) => {
      const x = (i / (safe.length - 1)) * 100;
      const y = 30 - ((v - min) / range) * 24;
      return { x, y };
    });
  }, [data]);

  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");

  return (
    <svg viewBox="0 0 100 32" className="h-6 w-20" aria-hidden>
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusDot({ className = "" }: { className?: string }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${className}`} aria-hidden />;
}

function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-sm font-medium text-slate-900 tracking-tight">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function InventoryCard({ metric }: { metric: InventoryMetric }) {
  const status = getInventoryStatus(metric.current, metric.minRequired);
  const progress = clamp((metric.current / metric.minRequired) * 100, 0, 130);
  const critical = status === "Critical";

  const styles =
    status === "Healthy" ? tone.success : status === "Low" ? tone.warning : tone.danger;

  return (
    <div
      className={[
        "rounded-lg border p-4 shadow-sm",
        HOVER_LIFT_CARD,
        critical ? "border-red-200 bg-red-50" : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-900">{metric.group}</p>
            <span className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs font-medium ${styles.pill}`}>
              <StatusDot className={styles.dot} />
              {status}
            </span>
          </div>
          <p className="mt-2 text-2xl font-medium text-slate-900 tabular-nums">
            {metric.current}
            <span className="ml-1 text-sm font-medium text-slate-500">units</span>
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Threshold <span className="font-medium text-slate-700 tabular-nums">{metric.minRequired}</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Sparkline data={metric.trend} stroke={styles.spark} />
          <p className="text-xs text-slate-500">7d trend</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Health</span>
          <span className="tabular-nums">{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div className={`h-full ${styles.bar}`} style={{ width: `${clamp(progress, 0, 100)}%` }} />
        </div>
      </div>
    </div>
  );
}

function SosBanner({
  bloodGroup,
  patient,
  facility,
  contact,
  onDispatch,
}: {
  bloodGroup: string;
  patient: string;
  facility: string;
  contact: string;
  onDispatch: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 rounded-md bg-red-600 p-2 text-white">
            <AlertCircle size={18} strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-red-950">SOS request</p>
              <span className="inline-flex items-center rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-900">
                {bloodGroup} needed
              </span>
              <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600">
                Priority: Critical
              </span>
            </div>
            <p className="mt-1 text-sm text-red-900">
              {patient} • {facility} • {contact}
            </p>
            <p className="mt-1 text-sm text-red-800/80">
              Dispatch from nearest store or notify verified donors.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDispatch}
            className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Dispatch now
          </button>
          <button className="inline-flex items-center justify-center rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-100/60">
            Create broadcast
          </button>
        </div>
      </div>
    </div>
  );
}

function DeliveryStepper({ deliveries }: { deliveries: Delivery[] }) {
  return (
    <div className={`${tone.neutral.card} p-4 shadow-sm ${HOVER_LIFT_CARD}`}>
      <SectionHeader
        title="Live tracking"
        subtitle="Condensed delivery timeline"
        right={<span className="text-xs text-slate-500">{deliveries.length} active</span>}
      />

      <div className="mt-4 space-y-4">
        {deliveries.map((d, idx) => {
          const isActive = d.status !== "Delivered";
          const dotClass = d.status === "Delivered" ? "bg-emerald-600" : "bg-blue-600";
          return (
            <div key={d.id} className="relative pl-6">
              {idx !== deliveries.length - 1 ? (
                <div className="absolute left-[7px] top-3 bottom-0 w-px bg-slate-200" aria-hidden />
              ) : null}
              <div className="absolute left-0 top-1.5" aria-hidden>
                <span className={`relative flex h-4 w-4 items-center justify-center rounded-full ${dotClass} ${isActive ? "ring-4 ring-blue-100 motion-safe:animate-pulse" : "ring-4 ring-emerald-100"}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{d.target}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {d.id} • {d.status}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-slate-700 tabular-nums">ETA {d.eta}</span>
              </div>

              <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${clamp(d.progress, 0, 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentDonorTable({ logs, onViewHistory }: { logs: DonorLog[]; onViewHistory: () => void }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) => `${l.name} ${l.bloodGroup} ${l.status}`.toLowerCase().includes(q));
  }, [logs, query]);

  return (
    <div className={`${tone.neutral.card} overflow-hidden shadow-sm ${HOVER_LIFT_CARD}`}>
      <div className="p-4 border-b border-slate-200">
        <SectionHeader
          title="Recent donor logs"
          subtitle="Headless table layout (clean + minimal)"
          right={
            <div className="relative w-full max-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search donors…"
                className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          }
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Donor</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Blood group</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Last donation</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const statusStyles =
                row.status === "Verified"
                  ? { dot: "bg-emerald-600", text: "text-slate-700" }
                  : row.status === "Pending"
                  ? { dot: "bg-amber-500", text: "text-slate-700" }
                  : { dot: "bg-red-600", text: "text-slate-700" };

              return (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{row.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">Donor ID: {row.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700">
                      {row.bloodGroup}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 tabular-nums">{row.lastDonation}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-2 text-sm ${statusStyles.text}`}>
                      <StatusDot className={statusStyles.dot} />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={onViewHistory}
                      className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 text-xs text-slate-500">
        Showing <span className="font-medium text-slate-700">{filtered.length}</span> of{" "}
        <span className="font-medium text-slate-700">{logs.length}</span>
      </div>
    </div>
  );
}

export default function BloodHubAdminPanel() {
  const router = useRouter();

  const kpis = [
    { label: "Lives saved", value: "1,284", icon: HeartPulse, sub: "Rolling 12 months" },
    { label: "Active donors", value: "850+", icon: Users, sub: "Verified + reachable" },
    { label: "Hospitals served", value: "42", icon: Building2, sub: "Across 6 cities" },
    { label: "SLA compliance", value: "99.2%", icon: ShieldCheck, sub: "Emergency dispatch" },
  ] as const;

  const inventory: InventoryMetric[] = [
    { group: "O+", current: 12, minRequired: 15, trend: [16, 15, 14, 13, 12, 12, 12] },
    { group: "A-", current: 2, minRequired: 5, trend: [6, 5, 5, 4, 3, 3, 2] },
    { group: "B+", current: 25, minRequired: 10, trend: [18, 20, 22, 24, 26, 25, 25] },
    { group: "AB+", current: 8, minRequired: 5, trend: [5, 5, 6, 7, 7, 8, 8] },
  ];

  const deliveries: Delivery[] = [
    { id: "TRK-882", target: "City Hospital", eta: "8m", status: "On Way", progress: 65 },
    { id: "TRK-901", target: "Apollo Clinic", eta: "14m", status: "Dispatching", progress: 20 },
    { id: "TRK-933", target: "Careline ER", eta: "—", status: "Delivered", progress: 100 },
  ];

  const donorLogs: DonorLog[] = [
    { id: "DNR-201", name: "Sakshi Jain", bloodGroup: "O+", lastDonation: "Apr 12, 2026", status: "Verified" },
    { id: "DNR-188", name: "Rahul Mehta", bloodGroup: "A-", lastDonation: "Mar 28, 2026", status: "Verified" },
    { id: "DNR-241", name: "Neha Singh", bloodGroup: "B+", lastDonation: "Apr 19, 2026", status: "Pending" },
    { id: "DNR-176", name: "Aman Verma", bloodGroup: "AB+", lastDonation: "Feb 03, 2026", status: "Flagged" },
  ];

  return (
    <div className="space-y-8 p-4 md:p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-medium tracking-tight text-slate-900">Blood Bank</h1>
          <p className="mt-1 text-sm text-slate-500">Command Center overview for inventory, tracking, and logs.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            onClick={() => router.push("/admin/blood-bank/inventory")}
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View inventory
          </button>
          <button
            onClick={() => router.push("/admin/blood-bank/tracking")}
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ${tone.primary.button}`}
          >
            Open tracking
          </button>
        </div>
      </header>

      <SosBanner
        bloodGroup="A-"
        patient="Shivam"
        facility="Apollo Hospital"
        contact="+91 98765 43210"
        onDispatch={() => router.push("/admin/blood-bank/tracking")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`${tone.neutral.card} p-4 shadow-sm ${HOVER_LIFT_CARD}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{kpi.label}</p>
                <p className="mt-2 text-2xl font-medium text-slate-900 tabular-nums">{kpi.value}</p>
                <p className="mt-1 text-sm text-slate-500">{kpi.sub}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-2 text-slate-700">
                <kpi.icon size={18} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <section className="xl:col-span-8 space-y-8">
          <div className={`${tone.neutral.card} p-4 shadow-sm ${HOVER_LIFT_CARD}`}>
            <SectionHeader
              title="Inventory health"
              subtitle="Progress + sparklines per blood group"
              right={
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                    <StatusDot className="bg-blue-600" /> Auto-refresh
                  </span>
                  <button
                    onClick={() => router.push("/admin/blood-bank/inventory")}
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    View all
                  </button>
                </div>
              }
            />

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {inventory.map((metric) => (
                <InventoryCard key={metric.group} metric={metric} />
              ))}
            </div>
          </div>

          <div className="relative">
            <RecentDonorTable logs={donorLogs} onViewHistory={() => router.push("/admin/blood-bank/logs")} />
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => router.push("/admin/blood-bank/logs")}
                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                View full history
              </button>
            </div>
          </div>
        </section>

        <section className="xl:col-span-4 space-y-8">
          <DeliveryStepper deliveries={deliveries} />

          <div className={`${tone.neutral.card} p-4 shadow-sm ${HOVER_LIFT_CARD}`}>
            <SectionHeader title="Actions" subtitle="Quick links for operators" />
            <div className="mt-4 grid grid-cols-1 gap-2">
              <button
                onClick={() => router.push("/admin/blood-bank/donors")}
                className="inline-flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <span className="inline-flex items-center gap-2">
                  <Users size={18} strokeWidth={1.5} />
                  Donors
                </span>
                <span className="text-xs text-slate-500">Directory</span>
              </button>

              <button
                onClick={() => router.push("/admin/blood-bank/inventory")}
                className="inline-flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <span className="inline-flex items-center gap-2">
                  <Droplet size={18} strokeWidth={1.5} />
                  Inventory
                </span>
                <span className="text-xs text-slate-500">Stock</span>
              </button>

              <button
                onClick={() => router.push("/admin/blood-bank/tracking")}
                className="inline-flex items-center justify-between rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
              >
                <span className="inline-flex items-center gap-2">
                  <Truck size={18} strokeWidth={1.5} />
                  Live tracking
                </span>
                <span className="text-xs text-blue-100">Open</span>
              </button>

              <button
                onClick={() => router.push("/admin/blood-bank/logs")}
                className="inline-flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <span className="inline-flex items-center gap-2">
                  <Building2 size={18} strokeWidth={1.5} />
                  Logs
                </span>
                <span className="text-xs text-slate-500">Audit</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
