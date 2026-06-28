"use client";
import React, { useState, useEffect } from 'react';
import { Activity, Search, AlertCircle, Radio, MapPin, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { apiUrl } from "@/lib/api";
//const API_URL = "http://127.0.0.1:8000/api/sos-requests/";
const API_URL = apiUrl("/api/sos-requests/");
const statusConfig: Record<string, { label: string; className: string }> = {
  Pending:  { label: "PENDING",  className: "bg-amber-50 text-amber-600 border border-amber-100" },
  Sent:     { label: "SENT",     className: "bg-blue-50 text-blue-600 border border-blue-200" },
  Accepted: { label: "ACCEPTED", className: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  Rejected: { label: "REJECTED", className: "bg-rose-50 text-rose-500 border border-rose-100" },
  Expired:  { label: "EXPIRED",  className: "bg-slate-100 text-slate-400 border border-slate-200" },
};

export default function SOSControlRoom() {
  const [requests, setRequests]       = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showModal, setShowModal]     = useState(false);
  const [donors, setDonors]           = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [reqRes, donorRes, notifRes] = await Promise.all([
        //axios.get(API_URL),
        //axios.get('http://127.0.0.1:8000/api/volunteer-donors/'),
        //axios.get('http://127.0.0.1:8000/api/notifications/'), 
        axios.get(API_URL),
        axios.get(apiUrl("/api/volunteer-donors/")),
        axios.get(apiUrl("/api/notifications/")),
      ]);
      setRequests(reqRes.data);
      setDonors(donorRes.data);
      setNotifications(notifRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Data fetch error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBroadcast = async (id: number) => {
    try {
      const res = await axios.post(`${API_URL}${id}/broadcast/`);
      if (res.data.status === "success") fetchData();
      else alert(res.data.message);
    } catch { alert("Failed to reach donors."); }
  };

  const handleCancelBroadcast = async (id: number) => {
    try {
      const res = await axios.post(`${API_URL}${id}/cancel_broadcast/`);
      if (res.data.status === "success") fetchData();
    } catch { alert("Failed to cancel broadcast."); }
  };

  const activeRequestIds = requests.filter((r: any) => r.status === "Broadcasting").map((r: any) => r.id);
  const activeNotifications = notifications.filter((n: any) => activeRequestIds.includes(n.sos_request));

  return (
    <div className="p-8 bg-[#F1F5F9] min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600 rounded-lg shadow-lg shadow-rose-200">
              <ShieldAlert className="text-white" size={28} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-[-0.05em]">SOS RADAR</h1>
          </div>
          <p className="text-slate-500 font-bold flex items-center gap-2 tracking-wide text-xs uppercase opacity-70">
            <Activity size={14} className="text-rose-600 animate-pulse" /> Emergency Control Interface V2.0
          </p>
        </div>

        <div className="flex gap-3">
          <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-200/60">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Requests</p>
            <p className="text-3xl font-black text-rose-600 leading-none">{requests.length}</p>
          </div>
          <div className="bg-slate-900 px-6 py-4 rounded-3xl shadow-xl border border-slate-800">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Donors</p>
            <p className="text-3xl font-black text-white leading-none">{donors.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="xl:col-span-8 space-y-8">

          {/* SOS Cards */}
          <div className="grid gap-6">
            {loading && requests.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-black text-slate-400 text-sm tracking-widest">SCANNING SATELLITE FEED...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white p-20 rounded-[40px] text-center border border-slate-200 shadow-inner">
                <p className="text-slate-300 font-black italic uppercase tracking-tighter text-2xl">Airspace Clear: No Emergencies</p>
              </div>
            ) : (
              requests.map((req) => {
                const isBroadcasting = req.status === "Broadcasting";
                return (
                  <div key={req.id} className={`group bg-white rounded-[35px] p-1 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 ${isBroadcasting ? 'ring-2 ring-emerald-500/20' : 'hover:border-rose-100'}`}>
                    <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                      <div className={`relative w-24 h-24 rounded-3xl flex flex-col items-center justify-center transition-transform group-hover:scale-105 duration-300 ${isBroadcasting ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {isBroadcasting && <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white animate-ping" />}
                        <span className="text-[10px] font-black uppercase opacity-60">Group</span>
                        <span className="text-4xl font-[1000] tracking-tighter">{req.blood_group}</span>
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-black text-slate-900 mb-1">{req.hospital_name}</h3>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center">
                          <span className="text-[11px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase italic">Patient: {req.patient_name}</span>
                          <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                            <AlertCircle size={14} className={isBroadcasting ? 'text-emerald-500' : 'text-rose-600'} /> {req.units_required} Units Required
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 font-bold text-xs underline decoration-dotted">
                            <MapPin size={14} /> {req.distance || '2.5'} KM Range
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center md:items-end gap-3">
                        {isBroadcasting ? (
                          <button onClick={() => handleCancelBroadcast(req.id)} className="w-48 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 text-[11px] font-black py-4 rounded-2xl transition-all border border-slate-200 uppercase tracking-widest shadow-sm">
                            Terminate Signal
                          </button>
                        ) : (
                          <button onClick={() => { setSelectedRequest(req); setShowModal(true); }} className="w-48 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black py-4 rounded-2xl transition-all uppercase tracking-widest shadow-lg shadow-rose-200 active:scale-95">
                            Initiate Broadcast
                          </button>
                        )}
                        <p className={`text-[10px] font-black tracking-[0.3em] uppercase ${isBroadcasting ? 'text-emerald-500 animate-pulse' : 'text-slate-300'}`}>
                          {isBroadcasting ? '● Transmission Live' : `Ref: SOS-00${req.id}`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Response Telemetry Table */}
          <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-slate-200 to-emerald-500" />

            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 italic">
                <div className="w-2 h-2 bg-rose-600 rounded-full animate-ping" /> Response Telemetry
              </h3>
              {/* Live stats */}
              <div className="flex items-center gap-3">
                {(['Pending','Accepted','Rejected'] as const).map((s) => {
                  const count = activeNotifications.filter((n: any) => n?.status === s).length;
                  const cfg = statusConfig[s];
                  return count > 0 ? (
                    <span key={s} className={`text-[10px] font-black px-3 py-1 rounded-xl ${cfg.className}`}>
                      {count} {cfg.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>

            <div className="overflow-x-auto">
              {activeNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-300 font-black italic uppercase tracking-widest text-sm">No Active Transmissions</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                      <th className="text-left pb-5 pl-4">Volunteer Donor</th>
                      <th className="text-left pb-5">Target Facility</th>
                      <th className="text-left pb-5 text-rose-500">ETA / Distance</th>
                      <th className="text-right pb-5 pr-4">Authorization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {activeNotifications.map((notif: any) => {
                      const cfg = statusConfig[notif.status] ?? statusConfig['Pending'];
                      return (
                        <tr key={notif.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 pl-4">
                            <p className="font-black text-slate-800 text-sm">{notif.donor_name}</p>
                          </td>
                          <td className="py-5 text-slate-500 font-bold text-xs italic">{notif.hospital_name}</td>
                          <td className="py-5 font-black text-rose-600 text-sm">{notif.distance_km} KM</td>
                          <td className="py-5 text-right pr-4">
                            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest ${cfg.className}`}>
                              {/* Status dot */}
                              <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                                notif.status === 'Accepted' ? 'bg-emerald-500 animate-pulse' :
                                notif.status === 'Rejected' ? 'bg-rose-400' :
                                notif.status === 'Sent'     ? 'bg-blue-500 animate-pulse' :
                                'bg-amber-400 animate-pulse'
                              }`} />
                              {cfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm sticky top-8">
            <h3 className="font-black text-lg text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-tighter italic">
              <Search className="text-rose-600" size={18} /> Proximity Volunteers
            </h3>
            <div className="space-y-3 mb-8 max-h-[400px] overflow-y-auto pr-2">
              {donors.map((donor: any, index: number) => (
                <div key={donor.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-rose-100 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-slate-400 text-[10px] italic border border-slate-100">V{index + 1}</div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{donor.name}</p>
                      <p className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter">{donor.blood_group} • {donor.city}</p>
                    </div>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full ring-4 ${donor.is_available ? 'bg-emerald-500 ring-emerald-100 animate-pulse' : 'bg-slate-300 ring-slate-100'}`} />
                </div>
              ))}
            </div>

            <div className="h-44 bg-slate-900 rounded-[30px] relative overflow-hidden group flex items-center justify-center shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-600/30 via-transparent to-transparent opacity-50" />
              <Radio className="text-rose-600 animate-bounce transition-transform group-hover:scale-125" size={40} />
              <div className="absolute bottom-4 text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Frequency: 104.9 MHz</div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-[45px] p-12 max-w-xl w-full shadow-2xl border border-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <ShieldAlert size={150} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2 italic uppercase tracking-tighter">Emergency Dispatch</h2>
            <p className="text-slate-500 font-bold text-sm mb-8">Confirming satellite broadcast to all local volunteers.</p>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Hospital</p>
                <p className="font-black text-slate-800">{selectedRequest.hospital_name}</p>
              </div>
              <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                <p className="text-[10px] font-black text-rose-400 uppercase mb-2">Requirement</p>
                <p className="font-black text-rose-600 text-xl">{selectedRequest.blood_group} • {selectedRequest.units_required} Units</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => { handleBroadcast(selectedRequest.id); setShowModal(false); }}
                className="flex-[2] bg-rose-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all active:scale-95"
              >
                Confirm Broadcast
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 py-5 rounded-[24px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-200 transition-all">
                Abort
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
