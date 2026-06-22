"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapPin, Navigation, Clock, ShieldCheck,
  Phone, AlertCircle, CheckCircle2, ChevronRight, X, ShieldAlert, Droplets
} from 'lucide-react';
import { apiUrl } from "@/lib/api";
/* ─── Animated dashed route line ─── */
const AnimatedRoute = ({ pct }: { pct: number }) => (
  <svg className="absolute inset-0 w-full h-full" style={{ top: 0, left: 0 }} preserveAspectRatio="none">
    <defs>
      <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
        <stop offset={`${pct}%`} stopColor="#60a5fa" stopOpacity="1" />
        <stop offset={`${pct}%`} stopColor="#e2e8f0" stopOpacity="1" />
        <stop offset="100%" stopColor="#e2e8f0" stopOpacity="1" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    {/* Dashed background track */}
    <line x1="0" y1="50%" x2="100%" y2="50%"
      stroke="#e2e8f0" strokeWidth="3" strokeDasharray="6 6" />
    {/* Filled progress */}
    <line x1="0" y1="50%" x2={`${pct}%`} y2="50%"
      stroke="url(#routeGrad)" strokeWidth="3"
      filter="url(#glow)"
      strokeLinecap="round" />
  </svg>
);

/* ─── Moving blood drop indicator ─── */
const MovingDrop = ({ pct }: { pct: number }) => (
  <div
    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 transition-all duration-700 ease-out"
    style={{ left: `${Math.max(5, Math.min(95, pct))}%` }}
  >
    <div className="relative">
      {/* Outer pulse ring */}
      <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30 scale-150" />
      {/* Drop */}
      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg shadow-blue-300 border-2 border-white">
        <Droplets size={14} className="text-white" />
      </div>
    </div>
  </div>
);

const LiveTracking = () => {
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);
  const [markingDelivered, setMarkingDelivered] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const lastDeliveriesJson = useRef<string>("");
  const lastLogsJson = useRef<string>("");

  useEffect(() => {
    const fetchLiveTracking = async () => {
      try {
        //const response = await fetch('http://127.0.0.1:8000/api/live-tracking/?status=In%20Transit');

        const response = await fetch(apiUrl("/api/live-tracking/?status=In%20Transit"))
        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType?.includes("application/json")) return;
        const data = await response.json();
        const inTransit = data.filter((item: any) => item.status === 'In Transit');
        const nextJson = JSON.stringify(inTransit);
        if (nextJson !== lastDeliveriesJson.current) {
          lastDeliveriesJson.current = nextJson;
          setActiveDeliveries(inTransit);
          if (selectedDelivery?.id) {
            const updated = inTransit.find((d: any) => d.id === selectedDelivery.id);
            setSelectedDelivery(updated || null);
            if (!updated) setDetailOpen(false);
          }
        }
      } catch (e) { console.error("Live Tracking Error:", e); }
    };

    const fetchLogs = async () => {
      try {
        //const response = await fetch('http://127.0.0.1:8000/api/mission-logs/');
        const response = await fetch(apiUrl("/api/mission-logs/"))
        if (response.ok) {
          const data = await response.json();
          const nextJson = JSON.stringify(data);
          if (nextJson !== lastLogsJson.current) {
            lastLogsJson.current = nextJson;
            setLogs(data);
          }
        }
      } catch (e) { console.error("Logs fetch error:", e); }
    };

    fetchLiveTracking();
    fetchLogs();
    const interval = setInterval(() => { fetchLiveTracking(); fetchLogs(); }, 10000);
    return () => clearInterval(interval);
  }, [selectedDelivery?.id]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const logsSorted = useMemo(() => {
    const arr = Array.isArray(logs) ? [...logs] : [];
    arr.sort((a: any, b: any) => (Date.parse(b?.created_at) || 0) - (Date.parse(a?.created_at) || 0));
    return arr;
  }, [logs]);

  const calcProgress = (delivery: any) => {
    const start = delivery?.mission_started_at ? Date.parse(delivery.mission_started_at) : null;
    if (!start || Number.isNaN(start)) return { pct: 20, etaMins: 15, etaSecs: 0 };
    const windowMs = 15 * 60 * 1000;
    const elapsed = Math.max(0, now - start);
    const pct = Math.max(0, Math.min(100, Math.round((elapsed / windowMs) * 100)));
    const remaining = Math.max(0, windowMs - elapsed);
    const etaMins = Math.floor(remaining / 60000);
    const etaSecs = Math.floor((remaining % 60000) / 1000);
    return { pct, etaMins, etaSecs };
  };

  const markAsDelivered = async () => {
    if (!selectedDelivery?.id) return;
    setDetailError(null);
    setMarkingDelivered(true);
    try {
      //const res = await fetch(`http://127.0.0.1:8000/api/volunteer-donors/${selectedDelivery.id}/`, {
        const res = await fetch(apiUrl(`/api/volunteer-donors/${selectedDelivery.id}/`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" }),
      });
      if (!res.ok) throw new Error((await res.text()) || "Failed to update status.");
      lastDeliveriesJson.current = "";
      lastLogsJson.current = "";
      const [liveRes, logsRes] = await Promise.all([
        //fetch('http://127.0.0.1:8000/api/live-tracking/?status=In%20Transit'),
        //fetch('http://127.0.0.1:8000/api/mission-logs/'),
        fetch(apiUrl("/api/live-tracking/?status=In%20Transit")),
        fetch(apiUrl("/api/mission-logs/")),
      ]);
      if (liveRes.ok) {
        const live = await liveRes.json();
        const inTransit = live.filter((i: any) => i.status === 'In Transit');
        lastDeliveriesJson.current = JSON.stringify(inTransit);
        setActiveDeliveries(inTransit);
      }
      if (logsRes.ok) { const l = await logsRes.json(); lastLogsJson.current = JSON.stringify(l); setLogs(l); }
      setDetailOpen(false);
      setSelectedDelivery(null);
    } catch (e: any) {
      setDetailError(e?.message || "Unable to mark as delivered.");
    } finally { setMarkingDelivered(false); }
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <span className="text-blue-600 font-black text-xs tracking-[0.2em] uppercase bg-blue-50 px-3 py-1 rounded-lg">
            Network Operations
          </span>
          <h1 className="text-4xl font-black text-[#0F172A] mt-3">Live Emergency Tracking</h1>
          <p className="text-slate-400 font-medium mt-1">Real-time blood units movement across the city.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-bold text-sm text-slate-600">{activeDeliveries.length} Active Missions</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Mission Cards */}
        <div className="xl:col-span-2 space-y-6">
          {activeDeliveries.length > 0 ? activeDeliveries.map((delivery: any) => {
            const { pct, etaMins, etaSecs } = calcProgress(delivery);
            const reached = pct >= 95;
            const urgent = etaMins < 3 && !reached;

            return (
              <div key={delivery.id}
                className={`bg-white rounded-[32px] border shadow-sm overflow-hidden transition-all duration-300 ${
                  reached ? 'border-emerald-200 shadow-emerald-50' :
                  urgent  ? 'border-rose-200 shadow-rose-50 animate-pulse' :
                  'border-slate-100 hover:border-blue-200 hover:shadow-md'
                }`}
              >
                {/* Top color bar */}
                <div className={`h-1 w-full ${reached ? 'bg-emerald-500' : urgent ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 via-blue-400 to-slate-200'}`}
                  style={!reached && !urgent ? { backgroundSize: `${pct}% 100%`, backgroundRepeat: 'no-repeat' } : {}}
                />

                <div className="p-8">
                  {/* Top row */}
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#0F172A] text-white px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider">
                        {delivery.reference_id}
                      </div>
                      <div className={`flex items-center gap-2 font-black text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full ${
                        reached ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50'
                      }`}>
                        <Navigation size={12} className={reached ? '' : 'animate-bounce'} />
                        {reached ? 'Arriving' : 'In Transit'}
                      </div>
                    </div>

                    {/* Live countdown */}
                    <div className={`flex items-center gap-2 font-black text-sm px-4 py-2 rounded-2xl ${
                      reached ? 'text-emerald-600 bg-emerald-50' :
                      urgent  ? 'text-rose-600 bg-rose-50' :
                      'text-slate-500 bg-slate-50'
                    }`}>
                      <Clock size={14} className={urgent ? 'animate-pulse' : ''} />
                      {reached ? '🏥 Arriving now' : etaMins === 0 ? `${etaSecs}s` : `ETA ${etaMins}m ${etaSecs}s`}
                    </div>
                  </div>

                  {/* Route visualization */}
                  <div className="relative px-6 mb-10" style={{ height: '80px' }}>
                    {/* Route line - sits in vertical center */}
                    <div className="absolute" style={{ top: '24px', left: '48px', right: '48px', height: '32px' }}>
                      <AnimatedRoute pct={pct} />
                      <MovingDrop pct={pct} />
                    </div>

                    {/* Pickup node */}
                    <div className="absolute left-0 flex flex-col items-center" style={{ top: '4px' }}>
                      <div className="w-12 h-12 bg-white border-4 border-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 z-10">
                        <MapPin className="text-blue-500" size={18} />
                      </div>
                      <span className="mt-2 font-black text-[9px] uppercase text-slate-400 tracking-widest">Pickup</span>
                      <span className="font-bold text-[10px] text-slate-700 max-w-[70px] text-center truncate">{delivery.donor_name}</span>
                    </div>

                    {/* Destination node */}
                    <div className="absolute right-0 flex flex-col items-center" style={{ top: '4px' }}>
                      <div className={`w-12 h-12 bg-white border-4 rounded-2xl flex items-center justify-center transition-all z-10 ${
                        reached ? 'border-emerald-500 shadow-lg shadow-emerald-100' : 'border-slate-200'
                      }`}>
                        <ShieldCheck className={reached ? 'text-emerald-500' : 'text-slate-300'} size={18} />
                      </div>
                      <span className="mt-2 font-black text-[9px] uppercase text-slate-400 tracking-widest">Hospital</span>
                      <span className="font-bold text-[10px] text-slate-700 max-w-[70px] text-center truncate">{delivery.hospital_name}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-8">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Route Progress</span>
                      <span className="text-[10px] font-black text-blue-600">{pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${reached ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`}
                        style={{ width: `${pct}%`, boxShadow: reached ? 'none' : '0 0 8px rgba(59,130,246,0.6)' }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-50">
                    <div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Blood Type</span>
                      <span className="text-xl font-black text-rose-500">{delivery.blood_group}</span>
                    </div>
                    <div className="border-x border-slate-50 px-6">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Units</span>
                      <span className="text-xl font-black text-slate-800">{delivery.units}</span>
                    </div>
                    <div className="flex justify-end items-center">
                      <button
                        onClick={() => { setDetailError(null); setSelectedDelivery(delivery); setDetailOpen(true); }}
                        className="bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 group border border-slate-100 hover:border-blue-600"
                      >
                        Details <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="bg-white p-20 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <AlertCircle size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-400">No Active Transits</h3>
              <p className="text-slate-300 max-w-xs mt-2 font-medium">All deliveries are completed or pending broadcast.</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-8">
          <div className="bg-[#0F172A] p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-6">Dispatch Center</h3>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                  <Phone size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Emergency Line</p>
                  <p className="font-bold">+91 98765-43210</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />
          </div>

          {/* Mission Logs */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black mb-6 text-[#0F172A] flex items-center justify-between">
              Mission Logs
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase tracking-tighter">Live</span>
            </h3>
            <div className="space-y-5">
              {logsSorted.map((log: any) => (
                <div key={log.id} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-snug">{log.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {detailOpen && selectedDelivery && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => !markingDelivered && setDetailOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-[32px] bg-white shadow-[0_30px_90px_rgba(2,6,23,0.35)] border border-white/70 overflow-hidden">
            <div className="p-6 sm:p-8 bg-gradient-to-b from-blue-50 to-white border-b border-slate-200/70">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
                      <ShieldAlert className="text-white" size={22} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Live Mission Detail</h2>
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {selectedDelivery.reference_id} • {selectedDelivery.blood_group} • {selectedDelivery.units} Units
                  </p>
                </div>
                <button onClick={() => !markingDelivered && setDetailOpen(false)} className="p-2 rounded-2xl hover:bg-white/70 border border-slate-200/60">
                  <X size={18} className="text-slate-600" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {detailError && (
                <div className="flex gap-3 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4">
                  <AlertCircle className="text-rose-600 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-black text-rose-700">Unable to complete action</p>
                    <p className="text-xs font-bold text-rose-700/80">{detailError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-5">
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone size={16} className="text-blue-600" />
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Donor Contact</p>
                  </div>
                  <p className="text-lg font-black text-slate-900">{selectedDelivery.donor_name}</p>
                  <p className="text-sm font-bold text-slate-500">{selectedDelivery.donor_phone || "Not available"}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck size={16} className="text-blue-600" />
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Hospital</p>
                  </div>
                  <p className="text-lg font-black text-slate-900">{selectedDelivery.hospital_name}</p>
                  <p className="text-sm font-bold text-slate-500">{selectedDelivery.hospital_helpline || "Not available"}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-4">Safety Checks</p>
                <div className="space-y-3">
                  {["Box Sealed", "Temperature Stable", "Identity Verified"].map((label) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
                      <p className="text-sm font-black text-slate-900">{label}</p>
                      <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase">
                        <CheckCircle2 size={16} className="text-emerald-500" /> Verified
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => !markingDelivered && setDetailOpen(false)} disabled={markingDelivered}
                  className="px-6 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-black text-slate-800 uppercase">
                  Close
                </button>
                <button onClick={markAsDelivered} disabled={markingDelivered}
                  className="px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-sm font-black text-white uppercase shadow-lg shadow-emerald-600/25 disabled:opacity-70">
                  {markingDelivered ? "Updating…" : "Mark as Delivered"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTracking;
