"use client";
import React from 'react';
import { Truck, MapPin, Phone, Clock, ShieldCheck, Navigation } from 'lucide-react';

export default function LiveTracking() {
  const activeDeliveries = [
    { id: "BR-9901", patient: "Shivam", target: "City Hospital", eta: "12 mins", status: "Dispatched", progress: 65 },
    { id: "BR-9905", patient: "Rahul", target: "Metro Care", eta: "28 mins", status: "In Transit", progress: 30 },
  ];

  return (
    <div className="p-8 space-y-8 bg-[#F8FAFC] min-h-screen">
      <div>
        <h1 className="text-3xl font-[1000] text-slate-900">Live Logistics</h1>
        <p className="text-slate-500 font-bold italic underline">Monitoring current blood transmissions</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          {activeDeliveries.map((delivery) => (
            <div key={delivery.id} className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 p-3 rounded-2xl text-white">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">Order #{delivery.id}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Patient: {delivery.patient}</p>
                  </div>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2">
                  <ShieldCheck size={16} /> COLD-CHAIN OPTIMAL
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation size={14} className="text-blue-600 animate-pulse" />
                      <span className="text-xs font-black text-blue-600 uppercase">On Route to {delivery.target}</span>
                    </div>
                    <span className="text-xs font-black text-slate-400 italic">ETA: {delivery.eta}</span>
                  </div>
                  <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-100">
                    <div style={{ width: `${delivery.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 rounded-full transition-all duration-500"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button className="flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs">
                    <Phone size={16} /> CONTACT DRIVER
                  </button>
                  <button className="flex items-center justify-center gap-2 border-2 border-slate-100 py-4 rounded-2xl font-black text-xs text-slate-600 hover:bg-slate-50">
                    VIEW MAP DETAILS
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 h-fit">
          <h3 className="font-[1000] text-xl mb-6">Fleet Overview</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <p className="text-sm font-black text-slate-600 uppercase">Available Vans</p>
              </div>
              <p className="text-xl font-black">04</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <p className="text-sm font-black text-slate-600 uppercase">In Transit</p>
              </div>
              <p className="text-xl font-black">02</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}