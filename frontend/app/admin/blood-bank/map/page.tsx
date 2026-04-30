"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Search, Navigation, Droplets, Phone } from 'lucide-react';

import 'leaflet/dist/leaflet.css';

// --- DYNAMIC IMPORTS (SSR FIX) ---
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

export default function DonorMap() {
  const [donors, setDonors] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Load Leaflet only on client side to fix "L is not defined" or Icon issues
    import('leaflet').then((leaf) => {
      setL(leaf);
    });

    fetch('http://127.0.0.1:8000/api/nearby-do')
      .then(res => res.json())
      .then(data => setDonors(data))
      .catch(err => console.error("API Error:", err));
  }, []);

  if (!mounted || !L) return <div className="h-screen w-full bg-slate-100 animate-pulse flex items-center justify-center font-bold">Loading Radar...</div>;

  // Custom Icon Fix
  const customIcon = new L.Icon({
    iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-xl z-10">
        <div className="p-6">nors/
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Droplets className="text-rose-600" /> Donor Radar
          </h1>
          <p className="text-[10px] font-bold text-slate-400 italic">Real-time proximity tracking</p>
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input type="text" placeholder="Search blood group..." className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-rose-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Nearby Donors</p>
          {donors.length === 0 ? (
             <p className="text-xs text-center text-slate-400 py-10 font-bold">Searching for donors...</p>
          ) : (
            donors.map((donor: any) => (
              <div key={donor.id} className="p-3 bg-white border border-slate-100 rounded-2xl hover:border-rose-200 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{donor.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{donor.distance} KM AWAY</p>
                  </div>
                  <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-2 py-1 rounded-lg">{donor.blood_group}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MAP */}
      <div className="flex-1 relative">
        <div className="absolute top-6 left-6 z-[1000] flex gap-3">
            <div className="bg-white p-2 rounded-2xl shadow-2xl border border-white flex items-center gap-4 px-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-black text-slate-700 uppercase">Live Tracking</span>
                </div>
                <div className="h-4 w-[1px] bg-slate-200" />
                <span className="text-xs font-bold text-slate-500">{donors.length} Donors found</span>
            </div>
        </div>

        <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full" zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          {donors.map((donor: any) => (
            <Marker key={donor.id} position={[donor.lat || 20, donor.lng || 78]} icon={customIcon}>
              <Popup>
                <div className="p-1 font-bold">
                    <p className="text-sm">{donor.name}</p>
                    <p className="text-rose-600 text-xs">{donor.blood_group}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <button className="absolute bottom-10 right-10 z-[1000] bg-rose-600 text-white px-8 py-4 rounded-[20px] font-black shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 uppercase tracking-tighter">
          <Navigation size={20} />
          Broadcast Emergency
        </button>
      </div>
    </div>
  );
}