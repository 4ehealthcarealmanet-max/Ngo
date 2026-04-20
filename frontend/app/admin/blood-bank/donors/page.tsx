"use client";
import React from 'react';
import { Users, Award, Search, CheckCircle2, XCircle } from 'lucide-react';

export default function DonorRegistry() {
  const donors = [
    { name: "John Doe", group: "O+", lastDonated: "18 April, 2026", status: "Eligible", badge: "Gold" },
    { name: "Kiara Sharma", group: "A-", lastDonated: "02 Feb, 2026", status: "Wait Period", badge: "Bronze" },
  ];

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-[1000] text-slate-900">Donor Database</h1>
          <p className="text-slate-500 font-bold">Manage and reach out to life-savers</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="Search by name, blood group..." className="w-full bg-white border-none py-4 pl-12 pr-6 rounded-[20px] shadow-sm font-bold text-sm" />
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Donor Profile</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Type</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Eligibility</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {donors.map((donor, idx) => (
              <tr key={idx} className="hover:bg-slate-50/30 transition-all">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-600">
                      {donor.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 flex items-center gap-2">
                        {donor.name} 
                        <Award size={14} className={donor.badge === 'Gold' ? 'text-amber-500' : 'text-slate-400'} />
                      </p>
                      <p className="text-[11px] font-bold text-slate-400">Last: {donor.lastDonated}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-xl font-black text-xs border border-rose-100 uppercase">{donor.group}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col items-center">
                    {donor.status === 'Eligible' ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-black"><CheckCircle2 size={14} /> READY</span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400 text-xs font-black uppercase"><XCircle size={14} /> Wait Period</span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black hover:bg-rose-600 transition-all">VIEW MEDICAL HISTORY</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}