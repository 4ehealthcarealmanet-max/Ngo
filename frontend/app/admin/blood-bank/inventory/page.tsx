"use client";
import React from 'react';
import { Thermometer, Package, Calendar, AlertTriangle, ChevronRight, Droplet } from 'lucide-react';

export default function StockInventory() {
  const stockData = [
    { group: "O+", units: 12, capacity: 80, temp: "4.2°C", expiry: "2 Days", status: "Normal" },
    { group: "A-", units: 2, capacity: 15, temp: "3.8°C", expiry: "14 Days", status: "Critical" },
    { group: "B+", units: 25, capacity: 90, temp: "4.0°C", expiry: "22 Days", status: "Normal" },
    { group: "AB+", units: 8, capacity: 40, temp: "4.1°C", expiry: "8 Days", status: "Low" },
  ];

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-[1000] text-slate-900">Stock Inventory</h1>
        <p className="text-slate-500 font-bold">Real-time storage & cold-chain monitoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {stockData.map((item) => (
          <div key={item.group} className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${item.status === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {item.status}
                </span>
                <h2 className="text-6xl font-[1000] text-slate-900 mt-2">{item.group}</h2>
              </div>
              <div className="bg-slate-50 p-4 rounded-3xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Package size={32} />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-2">
                  <span>Current Capacity</span>
                  <span>{item.capacity}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${item.status === 'Critical' ? 'bg-rose-500' : 'bg-blue-500'}`}
                    style={{ width: `${item.capacity}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-3xl flex items-center gap-3">
                  <Thermometer className="text-blue-500" size={20} />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Storage Temp</p>
                    <p className="font-bold text-slate-900">{item.temp}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl flex items-center gap-3">
                  <Calendar className="text-rose-500" size={20} />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Nearest Expiry</p>
                    <p className="font-bold text-slate-900">{item.expiry}</p>
                  </div>
                </div>
              </div>
            </div>

            {item.status === 'Critical' && (
              <button className="w-full mt-8 bg-rose-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-200">
                <AlertTriangle size={18} /> REPLENISH STOCK NOW
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}