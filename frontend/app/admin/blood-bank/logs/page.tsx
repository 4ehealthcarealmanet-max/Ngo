"use client";
import React from 'react';
import { History, FileText, Download, Building2, ExternalLink } from 'lucide-react';

export default function TransferLogs() {
  const logs = [
    { id: "TXN-8820", hospital: "City Hospital", group: "O+", units: 2, date: "20 April, 2026", reason: "Emergency Surgery" },
    { id: "TXN-8815", hospital: "Apollo Clinic", group: "B+", units: 5, date: "19 April, 2026", reason: "Routine Restock" },
  ];

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-[1000] text-slate-900 uppercase italic underline">Transfer Logs</h1>
          <p className="text-slate-500 font-bold">Audit trail for all blood movements</p>
        </div>
        <button className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
          <Download className="text-slate-600" size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-white rounded-[32px] p-8 border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6 hover:border-blue-200 transition-all group">
            <div className="flex items-center gap-6 w-full lg:w-auto">
              <div className="bg-slate-50 p-5 rounded-3xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Transaction ID: {log.id}</p>
                <div className="flex items-center gap-2">
                   <Building2 size={16} className="text-slate-400" />
                   <h4 className="font-[1000] text-slate-900">{log.hospital}</h4>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-12 w-full lg:w-auto justify-between lg:justify-end">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Stock Transferred</p>
                <p className="font-bold text-slate-700">{log.units} Units • {log.group}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Reason</p>
                <p className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg italic underline">{log.reason}</p>
              </div>
              <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                <ExternalLink size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}