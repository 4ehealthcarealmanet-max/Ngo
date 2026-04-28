"use client";
import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation } from 'lucide-react';

export default function DonorMap() {
  const [donors, setDonors] = useState([]);

  useEffect(() => {
    // Django API for nearby donors based on current emergency
    fetch('http://127.0.0.1:8000/api/nearby-donors/')
      .then(res => res.json())
      .then(data => setDonors(data));
  }, []);

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div><h1 className="text-3xl font-[1000] text-slate-900">Donor Radar</h1><p className="text-slate-500 font-bold italic">Real-time donor proximity tracking</p></div>
        <div className="flex bg-white p-2 rounded-2xl shadow-sm gap-2">
            <input type="text" placeholder="Search locality..." className="bg-transparent border-none text-sm font-bold px-4 focus:ring-0" />
            <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black">SCAN AREA</button>
        </div>
      </div>
      <div className="flex-1 bg-slate-200 rounded-[40px] border-8 border-white shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/...')] bg-cover opacity-50" />
        {donors.map((donor: any) => (
          <div key={donor.id} className="absolute transition-all animate-bounce" style={{ left: `${donor.x}%`, top: `${donor.y}%` }}>
            <div className="relative group">
              <MapPin className="text-rose-600" size={32} />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white px-3 py-1 rounded-lg shadow-xl border border-slate-100 hidden group-hover:block whitespace-nowrap z-50">
                <p className="text-[10px] font-black">{donor.name} ({donor.blood_group})</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase">{donor.distance} KM AWAY</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}