"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Search, Navigation, Droplets, Phone, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// --- SSR FIX FOR MAP ---
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

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

export default function DonorMap() {
  const [donors, setDonors] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  useEffect(() => {
    setMounted(true);
    import('leaflet').then((leaf) => {
      setL(leaf);
    });

    fetch('http://127.0.0.1:8000/api/volunteer-donors/')
      .then(res => res.json())
      .then(data => setDonors(data))
      .catch(err => console.error("API Error:", err));
  }, []);

  if (!mounted || !L) return <div className="h-screen w-full bg-slate-100 flex items-center justify-center font-bold italic">INITIALIZING RADAR...</div>;

  const customIcon = new L.Icon({
    iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
  });

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden">
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
          {donors.map((donor: any) => (
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
                <span className="text-[10px] font-bold text-slate-500 uppercase">{donors.length} Donors Online</span>
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

          {donors.map((donor: any) => (
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

        <button className="absolute bottom-10 right-10 z-[1000] bg-rose-600 text-white px-8 py-4 rounded-[20px] font-black shadow-2xl flex items-center gap-3 hover:scale-105 transition-all active:scale-95 uppercase tracking-tighter">
          <Navigation size={20} />
          Broadcast Emergency
        </button>
      </div>
    </div>
  );
}