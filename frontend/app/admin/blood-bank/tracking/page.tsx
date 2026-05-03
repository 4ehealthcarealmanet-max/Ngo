"use client";

import React, { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Clock, ShieldCheck, 
  Phone, AlertCircle, CheckCircle2, ChevronRight 
} from 'lucide-react';

const LiveTracking = () => {
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // 1. Live Tracking Fetch karne ka logic
    const fetchLiveTracking = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/live-tracking/');
        const contentType = response.headers.get("content-type");
        
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
          console.error("Backend error: JSON expected");
          return;
        }

        const data = await response.json();
        // Sirf 'In Transit' waale status filter kar rahe hain
        const inTransit = data.filter(item => item.status === 'In Transit');
        setActiveDeliveries(inTransit);
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
          setLogs(data);
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
  }, []);

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
            activeDeliveries.map((delivery) => (
              <div key={delivery.id} className="bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden hover:border-blue-200 transition-all">
                <div className="p-8">
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
                        <Clock size={16} /> ETA: 12 Mins
                    </div>
                  </div>

                  {/* Visual Route Tracking */}
                  <div className="relative flex justify-between items-center mb-10 px-4">
                    {/* Background Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0" />
                    {/* Progress Line */}
                    <div className="absolute top-1/2 left-0 w-[65%] h-1 bg-blue-500 -translate-y-1/2 z-0 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />

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
                      <div className="w-12 h-12 bg-white border-4 border-slate-100 rounded-2xl flex items-center justify-center">
                        <ShieldCheck className="text-slate-200" size={20} />
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
                      <button className="bg-[#F1F5F9] hover:bg-blue-600 hover:text-white text-slate-600 px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 group">
                        Live Detail <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
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
                    {logs.map((log) => (
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
    </div>
  );
};

export default LiveTracking;