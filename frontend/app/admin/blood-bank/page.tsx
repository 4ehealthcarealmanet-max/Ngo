"use client";
import React, { useState } from 'react';
import { 
  Droplet, Search, Plus, Filter, ArrowUpRight, Activity, Users, 
  Clock, MapPin, Phone, AlertCircle, Heart, Truck, TrendingUp,
  PackageCheck, Info
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdvancedBloodCommandCenter() {
  const router = useRouter();

  // NGO Overall Impact Stats
  const impactStats = [
    { label: "Lives Saved", value: "1,284", icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
    { label: "Active Donors", value: "850+", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Hospitals Served", value: "42", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Success Rate", value: "99.2%", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  // Stock Management (Minimum vs Current)
  const stockMetrics = [
    { group: "O+", current: 12, minRequired: 15, status: "Low" },
    { group: "A-", current: 2, minRequired: 5, status: "Critical" },
    { group: "B+", current: 25, minRequired: 10, status: "Healthy" },
    { group: "AB+", current: 8, minRequired: 5, status: "Healthy" },
  ];

  // Ongoing Deliveries for Tracking
  const liveDeliveries = [
    { id: "TRK-882", target: "City Hospital", eta: "8 mins", status: "On Way", progress: 65 },
    { id: "TRK-901", target: "Apollo Clinic", eta: "14 mins", status: "Dispatching", progress: 20 },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-rose-600 p-2.5 rounded-2xl shadow-xl shadow-rose-200">
                <Droplet className="text-white" size={32} fill="currentColor" />
              </div>
              <h1 className="text-4xl font-[1000] tracking-tight text-slate-900">Blood Command Center</h1>
            </div>
            <p className="text-slate-500 font-bold ml-1">Real-time Emergency & Inventory Management System</p>
          </div>
          
          <div className="flex gap-3 w-full lg:w-auto bg-white p-2 rounded-[24px] shadow-sm border border-slate-100">
             <button className="flex-1 lg:flex-none px-6 py-3 rounded-xl font-black text-slate-600 hover:bg-slate-50 transition-all border border-transparent">Analytics</button>
             <button className="flex-1 lg:flex-none bg-rose-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-rose-200 hover:scale-105 transition-all flex items-center gap-2">
               <Plus size={20} strokeWidth={3} /> New Donation
             </button>
          </div>
        </div>

        {/* Impact & Lives Saved (New Detail) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {impactStats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-[1000] tracking-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Column (8 units): Inventory & Registry */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* Smart Inventory Section (New Detail) */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <PackageCheck className="text-rose-600" /> Inventory Health Check
                </h3>
                <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full text-slate-500 uppercase">Auto-updated</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stockMetrics.map((stock) => (
                  <div key={stock.group} className="relative p-5 rounded-3xl border border-slate-50 bg-slate-50/50">
                    <p className="text-3xl font-[1000] mb-1">{stock.group}</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Current Stock</p>
                        <p className={`text-xl font-black ${stock.status === 'Critical' ? 'text-rose-600' : 'text-slate-700'}`}>{stock.current} Units</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Threshold</p>
                        <p className="text-sm font-bold text-slate-500 italic">min {stock.minRequired}</p>
                      </div>
                    </div>
                    {stock.current < stock.minRequired && (
                      <div className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full animate-pulse">
                        <AlertCircle size={14} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Registry Table (Original logic, improved UI) */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-4">
                <h3 className="text-xl font-black italic">Recent Donor Logs</h3>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="Search registry..." className="bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-6 text-sm font-bold w-full md:w-80" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-left">Donor</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Blood Group</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center font-black text-indigo-600">S{i}</div>
                            <div>
                              <p className="font-black text-sm text-slate-900 tracking-tight">Donor Name {i}</p>
                              <p className="text-[11px] font-bold text-slate-400">Regular Donor</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="bg-rose-50 text-rose-600 font-black px-4 py-1.5 rounded-xl border border-rose-100">O+</span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                             <span className="text-xs font-black text-slate-600">Verified</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-rose-600 transition-all">VIEW FULL HISTORY</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (4 units): Live Tracking & Alerts */}
          <div className="xl:col-span-4 space-y-8">
            
            {/* Live Delivery Tracking (New Detail) */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden relative">
              <div className="flex items-center gap-2 mb-6">
                <Truck className="text-blue-600 animate-bounce" size={24} />
                <h3 className="text-xl font-[1000]">Live Tracking</h3>
              </div>
              <div className="space-y-8">
                {liveDeliveries.map((delivery) => (
                  <div key={delivery.id} className="relative">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-black text-slate-900">{delivery.target}</p>
                        <p className="text-[10px] font-bold text-slate-400">Unit ID: {delivery.id}</p>
                      </div>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg italic">ETA: {delivery.eta}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all" style={{width: `${delivery.progress}%`}}></div>
                    </div>
                    <p className="text-[10px] mt-2 font-black text-slate-500 uppercase flex items-center gap-1">
                      <Info size={12} /> {delivery.status}
                    </p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => router.push('/admin/track-blood')}
                className="w-full mt-8 border-2 border-dashed border-slate-200 py-4 rounded-3xl text-slate-400 font-black text-xs hover:border-blue-400 hover:text-blue-500 transition-all"
              >
                OPEN GLOBAL TRACKING MAP
              </button>
            </div>

            {/* Emergency Alerts */}
            <div className="bg-rose-600 rounded-[40px] p-8 text-white shadow-2xl shadow-rose-300">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="animate-pulse" />
                <h3 className="text-xl font-black italic">SOS Requests</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white/10 p-5 rounded-3xl border border-white/20">
                  <p className="font-black text-lg">A- Negative Needed</p>
                  <p className="text-xs font-bold text-rose-100 mb-4 tracking-wide">Patient: Shivam | Apollo Hospital</p>
                  <button className="w-full bg-white text-rose-600 py-3 rounded-2xl font-black text-xs">DISPATCH IMMEDIATELY</button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}