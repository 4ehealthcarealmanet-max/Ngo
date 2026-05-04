"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Search, Navigation, Droplets, ShieldAlert, X, CheckCircle2, AlertTriangle, Building2, Droplet } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// --- SSR FIX FOR MAP ---
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });

// --- NEW COMPONENT: MAP CONTROLLER ---
// Yeh component map ko zoom aur pan karne mein help karega
function MapController({ center }: { center: [number, number] | null }) {
  const map = (require('react-leaflet')).useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 12, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

function BroadcastRipple({ active }: { active: boolean }) {
  const { useMapEvents } = require('react-leaflet');
  const [center, setCenter] = useState<[number, number] | null>(null);

  const map = useMapEvents({
    moveend: () => {
      const c = map.getCenter();
      setCenter([c.lat, c.lng]);
    },
    zoomend: () => {
      const c = map.getCenter();
      setCenter([c.lat, c.lng]);
    },
  });

  useEffect(() => {
    const c = map.getCenter();
    setCenter([c.lat, c.lng]);
  }, [map]);

  if (!active || !center) return null;

  return (
    <>
      <CircleMarker
        center={center}
        radius={10}
        pathOptions={{ color: '#f43f5e', fillColor: '#f43f5e', fillOpacity: 0.55, weight: 0 }}
        className="sos-ripple-core"
      />
      <CircleMarker
        center={center}
        radius={26}
        pathOptions={{ color: '#fb7185', fillColor: '#fb7185', fillOpacity: 0.08, weight: 2 }}
        className="sos-ripple-wave"
      />
      <CircleMarker
        center={center}
        radius={46}
        pathOptions={{ color: '#fb7185', fillColor: '#fb7185', fillOpacity: 0.04, weight: 2 }}
        className="sos-ripple-wave sos-ripple-wave--delay"
      />
    </>
  );
}

export default function DonorMap() {
  const [donors, setDonors] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  // --- SOS Broadcast (Red Button) ---
  const API_BASE = "http://127.0.0.1:8000/api";
  const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [hospitalQuery, setHospitalQuery] = useState("");
  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState(BLOOD_GROUPS[0]);
  const [urgency, setUrgency] = useState<"Normal" | "Critical">("Normal");
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [broadcastRequestId, setBroadcastRequestId] = useState<number | null>(null);
  const [broadcastBloodGroup, setBroadcastBloodGroup] = useState<string | null>(null);
  const [broadcastBusy, setBroadcastBusy] = useState(false);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);

  // Tip: SOSRequest create hone ke baad donors re-fetch (map + sidebar instant update)
  const fetchData = () => {
    fetch(`${API_BASE}/volunteer-donors/`)
      .then(res => res.json())
      .then(data => setDonors(data))
      .catch(err => console.error("API Error:", err));
  };

  useEffect(() => {
    setMounted(true);
    import('leaflet').then((leaf) => {
      setL(leaf);
    });

    fetch(`${API_BASE}/volunteer-donors/`)
      .then(res => res.json())
      .then(data => setDonors(data))
      .catch(err => console.error("API Error:", err));
  }, []);

  useEffect(() => {
    if (!sosModalOpen) return;
    if (hospitals.length > 0) return;

    setHospitalsLoading(true);
    fetch(`${API_BASE}/hospitals/`)
      .then(res => res.json())
      .then(data => setHospitals(Array.isArray(data) ? data : []))
      .catch(err => console.error("Hospitals API Error:", err))
      .finally(() => setHospitalsLoading(false));
  }, [sosModalOpen, hospitals.length]);

  if (!mounted || !L) return <div className="h-screen w-full bg-slate-100 flex items-center justify-center font-bold italic">INITIALIZING RADAR...</div>;

  const customIcon = new L.Icon({
    iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
  });

  const visibleDonors = broadcastActive && broadcastBloodGroup
    ? donors.filter((d: any) => String(d?.blood_group || '').toUpperCase() === String(broadcastBloodGroup).toUpperCase())
    : donors;

  const filteredHospitals = hospitals.filter((h) => {
    const q = hospitalQuery.trim().toLowerCase();
    if (!q) return true;
    return String(h?.name || "").toLowerCase().includes(q) || String(h?.location || "").toLowerCase().includes(q);
  });

  const startBroadcast = async () => {
    setBroadcastError(null);
    if (!selectedHospital) {
      setBroadcastError("Please select a target hospital.");
      return;
    }

    setBroadcastBusy(true);
    try {
      // 1) Create SOS request
      const createRes = await fetch(`${API_BASE}/sos-requests/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospital_name: selectedHospital.name,
          patient_name: "Unknown",
          blood_group: selectedBloodGroup,
          units_required: 1,
          urgency,
          status: "Pending",
        }),
      });

      if (!createRes.ok) {
        const txt = await createRes.text();
        throw new Error(txt || "Failed to create SOS request.");
      }

      const created = await createRes.json();

      // 2) Broadcast globally (creates notifications + sets Broadcasting)
      const bRes = await fetch(`${API_BASE}/sos-requests/${created.id}/broadcast/`, { method: "POST" });
      const bJson = await bRes.json().catch(() => ({}));
      if (!bRes.ok || bJson?.status === "error") {
        throw new Error(bJson?.message || "Failed to start broadcast.");
      }

      setBroadcastActive(true);
      setBroadcastRequestId(created.id);
      setBroadcastBloodGroup(selectedBloodGroup);
      setSosModalOpen(false);

      // Refresh donors immediately (user tip)
      fetchData();
    } catch (e: any) {
      setBroadcastError(e?.message || "Broadcast failed.");
    } finally {
      setBroadcastBusy(false);
    }
  };

  const stopBroadcast = async () => {
    if (!broadcastRequestId) {
      setBroadcastActive(false);
      setBroadcastBloodGroup(null);
      return;
    }

    setBroadcastBusy(true);
    try {
      await fetch(`${API_BASE}/sos-requests/${broadcastRequestId}/cancel_broadcast/`, { method: "POST" });
    } catch {}
    setBroadcastActive(false);
    setBroadcastRequestId(null);
    setBroadcastBloodGroup(null);
    setBroadcastBusy(false);

    fetchData();
  };

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden">
      <style jsx global>{`
        .sos-ripple-core {
          filter: drop-shadow(0 10px 30px rgba(244, 63, 94, 0.35));
        }
        .sos-ripple-wave {
          transform-origin: center;
          animation: sosWave 1.6s ease-out infinite;
        }
        .sos-ripple-wave--delay {
          animation-delay: 0.6s;
        }
        @keyframes sosWave {
          0% { transform: scale(0.85); opacity: 0.95; }
          70% { transform: scale(1.25); opacity: 0.25; }
          100% { transform: scale(1.35); opacity: 0; }
        }
      `}</style>
      {/* SIDEBAR */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-xl z-10">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-100">
                <Droplets className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-black text-slate-900 uppercase italic">Donor Radar</h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live Proximity Feed</p>
          
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input type="text" placeholder="Search blood group..." className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-6 custom-scrollbar">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Nearby Units</p>
          {visibleDonors.map((donor: any) => (
            <div 
              key={donor.id} 
              onClick={() => {
              if (donor.lat && donor.lng) {
                // String ko float number mein convert karna zaroori hai
                const newLat = parseFloat(donor.lat);
                const newLng = parseFloat(donor.lng);
                setMapCenter([newLat, newLng]);
              } else {
                setMapCenter([22.7196, 75.8577]); // Indore Fallback
              }
            }}
              className="p-4 bg-slate-50 border border-transparent rounded-2xl hover:border-blue-200 hover:bg-white hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-black text-slate-800">{donor.name}</h3>
                  <p className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">{donor.blood_group} • {donor.city}</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-green-50" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAP AREA */}
      <div className="flex-1 relative">
        <div className="absolute top-6 left-6 z-[1000]">
            <div className="bg-white p-2 rounded-2xl shadow-2xl border border-white flex items-center gap-4 px-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-slate-700 uppercase">Live Signal</span>
                </div>
                <div className="h-4 w-[1px] bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">{visibleDonors.length} Donors Online</span>
            </div>
        </div>

<MapContainer 
  center={[22.7196, 75.8577]} // Ab yeh Indore se start hoga
  zoom={13}                   // Zoom thoda badha dete hain taaki city dikhe
  className="h-full w-full" 
  zoomControl={false}
>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          
          {/* MapController adds the fly-to animation */}
          <MapController center={mapCenter} />

          <BroadcastRipple active={broadcastActive} />

          {visibleDonors.map((donor: any) => (
            <Marker 
              key={donor.id} 
              position={[donor.lat || 22.7196, donor.lng || 75.8577]} // Default Indore
              icon={customIcon}
            >
              <Popup>
                <div className="p-2 text-center">
                    <p className="font-black text-slate-900 text-sm">{donor.name}</p>
                    <p className="text-blue-600 font-bold text-xs uppercase">{donor.blood_group}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <button
          onClick={() => {
            if (broadcastActive) return;
            setBroadcastError(null);
            setSosModalOpen(true);
          }}
          disabled={broadcastBusy}
          className={`absolute bottom-10 right-10 z-[1000] px-8 py-4 rounded-[20px] font-black shadow-2xl flex items-center gap-3 transition-all active:scale-95 uppercase tracking-tighter ${
            broadcastActive
              ? 'bg-rose-700 text-white cursor-default'
              : 'bg-rose-600 text-white hover:scale-105'
          } ${broadcastBusy ? 'opacity-70' : ''}`}
        >
          {broadcastActive ? <ShieldAlert size={20} /> : <Navigation size={20} />}
          {broadcastActive ? 'Broadcasting...' : 'Broadcast Emergency'}
        </button>

        {broadcastActive && (
          <button
            onClick={stopBroadcast}
            disabled={broadcastBusy}
            className="absolute bottom-10 right-64 z-[1000] bg-white text-slate-900 px-6 py-4 rounded-[20px] font-black shadow-2xl border border-slate-200 flex items-center gap-3 hover:bg-slate-50 transition-all active:scale-95 uppercase tracking-tighter"
          >
            <X size={18} className="text-rose-600" />
            Stop
          </button>
        )}
      </div>

      {/* SOS Modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => (broadcastBusy ? null : setSosModalOpen(false))}
          />
          <div className="relative w-full max-w-2xl rounded-[32px] bg-white shadow-[0_30px_90px_rgba(2,6,23,0.35)] border border-white/70 overflow-hidden">
            <div className="p-6 sm:p-8 bg-gradient-to-b from-rose-50 to-white border-b border-slate-200/70">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-2xl bg-rose-600 shadow-lg shadow-rose-200">
                      <ShieldAlert className="text-white" size={22} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Broadcast Emergency</h2>
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Global SOS • Donor Filter • Map Beacon
                  </p>
                </div>
                <button
                  onClick={() => (broadcastBusy ? null : setSosModalOpen(false))}
                  className="p-2 rounded-2xl hover:bg-white/70 transition border border-slate-200/60"
                  aria-label="Close"
                >
                  <X size={18} className="text-slate-600" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {broadcastError && (
                <div className="flex items-start gap-3 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4">
                  <AlertTriangle className="text-rose-600 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-black text-rose-700">Action Required</p>
                    <p className="text-xs font-bold text-rose-700/80">{broadcastError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Blood Group */}
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplet size={16} className="text-rose-600" />
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Blood Group</p>
                  </div>
                  <select
                    value={selectedBloodGroup}
                    onChange={(e) => setSelectedBloodGroup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                  <p className="mt-2 text-[11px] font-bold text-slate-400">Markers will filter to this group while broadcasting.</p>
                </div>

                {/* Urgency */}
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} className="text-rose-600" />
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Urgency</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setUrgency("Normal")}
                      className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                        urgency === "Normal"
                          ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                          : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-white"
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrgency("Critical")}
                      className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                        urgency === "Critical"
                          ? "border-rose-600 bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                          : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-white"
                      }`}
                    >
                      Critical
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] font-bold text-slate-400">Critical broadcasts highlight the beacon and priority label.</p>
                </div>
              </div>

              {/* Target Hospital (searchable) */}
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-rose-600" />
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Target Hospital</p>
                  </div>
                  {hospitalsLoading && (
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading…</p>
                  )}
                </div>

                <div className="relative">
                  <input
                    value={hospitalQuery}
                    onChange={(e) => setHospitalQuery(e.target.value)}
                    placeholder="Search hospital…"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <div className="mt-3 max-h-44 overflow-auto rounded-2xl border border-slate-200 bg-white">
                    {filteredHospitals.length === 0 ? (
                      <div className="px-4 py-4 text-sm font-bold text-slate-500">No hospitals found.</div>
                    ) : (
                      filteredHospitals.slice(0, 20).map((h) => {
                        const selected = selectedHospital?.id === h.id;
                        return (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => setSelectedHospital(h)}
                            className={`w-full text-left px-4 py-3 flex items-center justify-between gap-4 hover:bg-slate-50 transition ${
                              selected ? "bg-rose-50" : ""
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-900 truncate">{h.name}</p>
                              <p className="text-[11px] font-bold text-slate-500 truncate">{h.location}</p>
                            </div>
                            {selected ? (
                              <CheckCircle2 size={18} className="text-rose-600 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {selectedHospital && (
                    <div className="mt-3 rounded-2xl bg-slate-900 px-4 py-3 text-white flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-widest text-white/70">Selected</p>
                        <p className="text-sm font-black truncate">{selectedHospital.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedHospital(null)}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition text-xs font-black uppercase"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
                <button
                  onClick={() => (broadcastBusy ? null : setSosModalOpen(false))}
                  className="px-6 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition text-sm font-black text-slate-800 uppercase tracking-tight"
                  disabled={broadcastBusy}
                >
                  Cancel
                </button>
                <button
                  onClick={startBroadcast}
                  disabled={broadcastBusy}
                  className="px-7 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 transition text-sm font-black text-white uppercase tracking-tight shadow-lg shadow-rose-600/25 disabled:opacity-70"
                >
                  {broadcastBusy ? "Broadcasting…" : "Confirm Broadcast"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
