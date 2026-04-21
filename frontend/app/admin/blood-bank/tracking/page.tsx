"use client";
import React, { useMemo, useState } from "react";
import { MapPinned, Navigation, Phone, Search, ShieldCheck, Truck } from "lucide-react";

type DeliveryStatus = "Dispatching" | "On Way" | "Delivered";

type Delivery = {
  id: string;
  patient: string;
  target: string;
  eta: string;
  status: DeliveryStatus;
  progress: number;
  driverPhone: string;
};

const DELIVERIES: Delivery[] = [
  { id: "BR-9901", patient: "Shivam", target: "City Hospital", eta: "12m", status: "On Way", progress: 65, driverPhone: "+91 98765 10001" },
  { id: "BR-9905", patient: "Rahul", target: "Metro Care", eta: "28m", status: "Dispatching", progress: 30, driverPhone: "+91 98765 10002" },
  { id: "BR-9888", patient: "Neha", target: "Careline ER", eta: "—", status: "Delivered", progress: 100, driverPhone: "+91 98765 10003" },
];

const HOVER_LIFT_CARD = "hover:shadow-xl hover:-translate-y-2 transition-all duration-300";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const statusPill = (status: DeliveryStatus) => {
  if (status === "Delivered") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (status === "On Way") return "border-blue-200 bg-blue-50 text-blue-900";
  return "border-slate-200 bg-white text-slate-700";
};

export default function LiveTracking() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DELIVERIES;
    return DELIVERIES.filter((d) => `${d.id} ${d.patient} ${d.target} ${d.status}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-medium tracking-tight text-slate-900">Tracking</h1>
          <p className="mt-1 text-sm text-slate-500">Map view placeholder + active deliveries for operators.</p>
        </div>

        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={1.5} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search deliveries…"
            className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <section className="xl:col-span-8 space-y-4">
          <div className={`rounded-lg border border-slate-200 bg-white shadow-sm p-4 ${HOVER_LIFT_CARD}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <MapPinned size={18} strokeWidth={1.5} className="text-slate-700" /> Map view
                </p>
                <p className="mt-1 text-sm text-slate-500">Replace this with your actual map (Leaflet/Mapbox) later.</p>
              </div>
              <button className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Open full map
              </button>
            </div>

            <div className="mt-4">
              <div className="aspect-[16/9] w-full rounded-lg border border-slate-200 bg-slate-50 grid place-items-center">
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-900">Map Placeholder</p>
                  <p className="mt-1 text-sm text-slate-500">Pins, routes, and ETA overlays go here.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="xl:col-span-4 space-y-4">
          <div className={`rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden ${HOVER_LIFT_CARD}`}>
            <div className="border-b border-slate-200 p-4 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <Truck size={18} strokeWidth={1.5} className="text-slate-700" /> Active deliveries
              </p>
              <span className="text-xs text-slate-500">{filtered.length} shown</span>
            </div>

            <div className="p-4 space-y-3">
              {filtered.map((d) => (
                <div key={d.id} className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${HOVER_LIFT_CARD}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{d.id}</span>
                        <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${statusPill(d.status)}`}>
                          {d.status}
                        </span>
                        <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600">
                          ETA {d.eta}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700">
                        {d.patient} • {d.target}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-2 text-xs text-slate-500">
                        <ShieldCheck size={14} strokeWidth={1.5} className="text-emerald-600" /> Cold-chain optimal
                      </p>
                    </div>

                    <button className="shrink-0 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <Navigation size={16} strokeWidth={1.5} className="mr-2" />
                      Details
                    </button>
                  </div>

                  <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${clamp(d.progress, 0, 100)}%` }} />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 tabular-nums">{d.driverPhone}</span>
                    <button className="inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800">
                      <Phone size={14} strokeWidth={1.5} className="mr-2" />
                      Call driver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
