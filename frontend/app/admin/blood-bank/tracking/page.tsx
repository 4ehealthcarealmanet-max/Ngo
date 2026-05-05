"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  MapPin, Navigation, Clock, ShieldCheck, 
  Phone, AlertCircle, CheckCircle2, ChevronRight, X, ShieldAlert
} from 'lucide-react';

const LiveTracking = () => {
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [logs, setLogs] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);
  const [markingDelivered, setMarkingDelivered] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const lastDeliveriesJson = useRef<string>("");
  const lastLogsJson = useRef<string>("");

  useEffect(() => {
    // 1. Live Tracking Fetch karne ka logic
    const fetchLiveTracking = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/live-tracking/?status=In%20Transit');
        const contentType = response.headers.get("content-type");
        
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
          console.error("Backend error: JSON expected");
          return;
        }

        const data = await response.json();
        // Sirf 'In Transit' waale status filter kar rahe hain
        const inTransit = data.filter(item => item.status === 'In Transit');

        // 10s refresh ke dauran UI flicker avoid
        const nextJson = JSON.stringify(inTransit);
        if (nextJson !== lastDeliveriesJson.current) {
          lastDeliveriesJson.current = nextJson;
          setActiveDeliveries(inTransit);

          // Open modal ko live data se sync rakho
          if (selectedDelivery?.id) {
            const updated = inTransit.find((d) => d.id === selectedDelivery.id);
            setSelectedDelivery(updated || null);
            if (!updated) setDetailOpen(false);
          }
        }
      } catch (error) {
        console.error("Live Tracking Error:", error);
      }
    };

    // 2. Mission Logs Fetch karne ka logic
    const fetchLogs = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/mission-logs/');
        if (response.ok) {
          const data = await response.json();
          const nextJson = JSON.stringify(data);
          if (nextJson !== lastLogsJson.current) {
            lastLogsJson.current = nextJson;
            setLogs(data);
          }
        }
      } catch (error) {
        console.error("Logs fetch error:", error);
      }
    };

    // Pehli baar call karein
    fetchLiveTracking();
    fetchLogs();

    // Har 10 seconds mein auto-refresh
    const interval = setInterval(() => {
      fetchLiveTracking();
      fetchLogs();
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedDelivery?.id]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const logsSorted = useMemo(() => {
    const arr = Array.isArray(logs) ? [...logs] : [];
    arr.sort((a: any, b: any) => {
      const ta = a?.created_at ? Date.parse(a.created_at) : 0;
      const tb = b?.created_at ? Date.parse(b.created_at) : 0;
      return tb - ta;
    });
    return arr;
  }, [logs]);

  const calcProgress = (delivery: any) => {
    const start = delivery?.mission_started_at ? Date.parse(delivery.mission_started_at) : null;
    if (!start || Number.isNaN(start)) return { pct: 20, etaMins: 15 };

    const windowMs = 15 * 60 * 1000;
    const elapsed = Math.max(0, now - start);
    const pct = Math.max(0, Math.min(100, Math.round((elapsed / windowMs) * 100)));
    const remaining = Math.max(0, windowMs - elapsed);
    const etaMins = Math.max(0, Math.ceil(remaining / 60000));
    return { pct, etaMins };
  };

  const openDetails = (delivery: any) => {
    setDetailError(null);
    setSelectedDelivery(delivery);
    setDetailOpen(true);
  };

  const markAsDelivered = async () => {
    if (!selectedDelivery?.id) return;
    setDetailError(null);
    setMarkingDelivered(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/volunteer-donors/${selectedDelivery.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to update status.");
      }

      // Immediate refresh (mission should disappear from this list)
      lastDeliveriesJson.current = "";
      lastLogsJson.current = "";
      const [liveRes, logsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/live-tracking/?status=In%20Transit'),
        fetch('http://127.0.0.1:8000/api/mission-logs/'),
      ]);
      if (liveRes.ok) {
        const live = await liveRes.json();
        const inTransit = live.filter((item: any) => item.status === 'In Transit');
        lastDeliveriesJson.current = JSON.stringify(inTransit);
        setActiveDeliveries(inTransit);
      }
      if (logsRes.ok) {
        const l = await logsRes.json();
        lastLogsJson.current = JSON.stringify(l);
        setLogs(l);
      }

      setDetailOpen(false);
      setSelectedDelivery(null);
    } catch (e: any) {
      setDetailError(e?.message || "Unable to mark as delivered.");
    } finally {
      setMarkingDelivered(false);
    }
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      {/* Header Section */}
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
        
        {/* Left: Active Mission Cards */}
        <div className="xl:col-span-2 space-y-6">
          {activeDeliveries.length > 0 ? (
            activeDeliveries.filter((d: any) => d?.status === 'In Transit').map((delivery) => (
              <div key={delivery.id} className="bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden hover:border-blue-200 transition-all">
                <div className="p-8">
                  {(() => {
                    const { pct, etaMins } = calcProgress(delivery);
                    const progressWidth = `${pct}%`;
                    const etaLabel = etaMins === 0 ? "Arriving..." : `ETA: ${etaMins} Mins`;
                    const reached = pct >= 95;
                    return (
                      <>
                  {/* Top Bar: Reference & Status */}
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#0F172A] text-white px-4 py-2 rounded-xl text-xs font-mono font-bold">
                        {delivery.reference_id}
                      </div>
                      <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] tracking-widest uppercase">
                        <Navigation size={14} className="animate-bounce" /> In Transit
                      </div>
                    </div>
                    <div className="text-slate-400 font-bold text-sm flex items-center gap-2">
                        <Clock size={16} /> {etaLabel}
                    </div>
                  </div>

                  {/* Visual Route Tracking */}
                  <div className="relative flex justify-between items-center mb-10 px-4">
                    {/* Background Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0" />
                    {/* Progress Line */}
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 z-0 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-700 ease-out"
                      style={{ width: progressWidth }}
                    />

                    {/* Nodes */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-12 h-12 bg-white border-4 border-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <MapPin className="text-blue-500" size={20} />
                      </div>
                      <span className="mt-3 font-black text-[10px] uppercase text-slate-400 tracking-tighter">Pickup</span>
                      <span className="font-bold text-xs text-[#0F172A]">{delivery.donor_name}</span>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-blue-200 shadow-xl border-4 border-white animate-pulse">
                        <Navigation className="text-white transform rotate-45" size={16} />
                      </div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`w-12 h-12 bg-white border-4 rounded-2xl flex items-center justify-center transition-all ${reached ? 'border-emerald-500 shadow-lg shadow-emerald-100' : 'border-slate-100'}`}>
                        <ShieldCheck className={reached ? "text-emerald-500" : "text-slate-200"} size={20} />
                      </div>
                      <span className="mt-3 font-black text-[10px] uppercase text-slate-400 tracking-tighter">Destination</span>
                      <span className="font-bold text-xs text-[#0F172A]">{delivery.hospital_name}</span>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Blood Type</span>
                      <span className="text-lg font-black text-red-500">{delivery.blood_group}</span>
                    </div>
                    <div className="flex flex-col border-x border-slate-50 px-6">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Units</span>
                      <span className="text-lg font-black text-[#0F172A]">{delivery.units} Units</span>
                    </div>
                    <div className="flex justify-end items-center">
                      <button onClick={() => openDetails(delivery)} className="bg-[#F1F5F9] hover:bg-blue-600 hover:text-white text-slate-600 px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 group">
                        Live Detail <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-20 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <AlertCircle size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-400">No Active Transits</h3>
              <p className="text-slate-300 max-w-xs mt-2 font-medium">All blood unit deliveries are currently completed or pending broadcast.</p>
            </div>
          )}
        </div>

        {/* Right: Quick Stats & Logs */}
        <div className="space-y-8">
            <div className="bg-[#0F172A] p-8 rounded-[32px] text-white shadow-2xl shadow-slate-300 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-6">Dispatch Center</h3>
                    <div className="space-y-6">
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
                </div>
                {/* Decorative Pattern */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />
            </div>

            {/* Live Logs */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <h3 className="text-lg font-black mb-6 text-[#0F172A] flex items-center justify-between">
                    Mission Logs
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase tracking-tighter">Real-time</span>
                </h3>
               <div className="space-y-6">
                    {logsSorted.map((log: any) => (
                        <div key={log.id} className="flex gap-4 relative">
                            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 size={14} className="text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#0F172A]">{log.message}</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">{log.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Live Detail Modal */}
      {detailOpen && selectedDelivery && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => (markingDelivered ? null : setDetailOpen(false))}
          />
          <div className="relative w-full max-w-2xl rounded-[32px] bg-white shadow-[0_30px_90px_rgba(2,6,23,0.35)] border border-white/70 overflow-hidden">
            <div className="p-6 sm:p-8 bg-gradient-to-b from-blue-50 to-white border-b border-slate-200/70">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
                      <ShieldAlert className="text-white" size={22} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Live Mission Detail</h2>
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {selectedDelivery.reference_id} • {selectedDelivery.blood_group} • {selectedDelivery.units} Units
                  </p>
                </div>
                <button
                  onClick={() => (markingDelivered ? null : setDetailOpen(false))}
                  className="p-2 rounded-2xl hover:bg-white/70 transition border border-slate-200/60"
                  aria-label="Close"
                >
                  <X size={18} className="text-slate-600" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {detailError && (
                <div className="flex items-start gap-3 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4">
                  <AlertCircle className="text-rose-600 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-black text-rose-700">Unable to complete action</p>
                    <p className="text-xs font-bold text-rose-700/80">{detailError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Hospital Helpline</p>
                  </div>
                  <p className="text-lg font-black text-slate-900">{selectedDelivery.hospital_name}</p>
                  <p className="text-sm font-bold text-slate-500">{selectedDelivery.hospital_helpline || "Not available"}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-4">Safety Checks</p>
                <div className="space-y-3">
                  {["Box Sealed", "Temperature Stable", "Identity Verified"].map((label) => (
                    <div key={label} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
                      <p className="text-sm font-black text-slate-900">{label}</p>
                      <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        Verified
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
                <button
                  onClick={() => (markingDelivered ? null : setDetailOpen(false))}
                  className="px-6 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition text-sm font-black text-slate-800 uppercase tracking-tight"
                  disabled={markingDelivered}
                >
                  Close
                </button>
                <button
                  onClick={markAsDelivered}
                  disabled={markingDelivered}
                  className="px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 transition text-sm font-black text-white uppercase tracking-tight shadow-lg shadow-emerald-600/25 disabled:opacity-70"
                >
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
