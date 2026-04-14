"use client";

import React from "react";

export default function Dashboard() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-900">Good Morning, Ram!</h2>
        <p className="text-slate-500 mt-1 font-medium">Everything looks good with your MedBridge plan.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: "Next Appointment", val: "14 March, 2026", sub: "Jeevan Jyoti Eye Care", color: "text-blue-600" },
          { label: "Medical Reports", val: "12 Active", sub: "4 New Uploads", color: "text-emerald-600" },
          { label: "Saved NGOs", val: "08 Partners", sub: "Across 3 Cities", color: "text-slate-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 mt-2">{stat.val}</h3>
            <p className={`${stat.color} text-sm font-bold mt-1`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Recent Appointments</h3>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All Records</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">NGO Partner</th>
                <th className="px-6 py-4">Service Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              <tr>
                <td className="px-6 py-4 font-bold text-slate-900">HealthyLives Foundation</td>
                <td className="px-6 py-4">Vaccination</td>
                <td className="px-6 py-4">10 Mar 2026</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">Completed</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-bold text-slate-900">Arogya Seva Kendra</td>
                <td className="px-6 py-4">General Checkup</td>
                <td className="px-6 py-4">08 Mar 2026</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">Completed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
