"use client";
import React, { useState, useEffect } from 'react';
import { Award, Calendar } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/match-history/')
      .then(res => res.json())
      .then(data => setHistory(data));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-[1000] text-slate-900 mb-8 italic">Life-Saving Records</h1>
      <div className="space-y-4">
        {history.map((h: any) => (
          <div key={h.id} className="bg-white p-6 rounded-[30px] border border-slate-100 flex justify-between items-center group hover:bg-slate-900 hover:text-white transition-all">
            <div className="flex items-center gap-6">
              <Award className="text-amber-500" />
              <div><p className="font-black uppercase tracking-tighter">{h.donor_name} donated {h.group} blood</p><p className="text-[10px] font-bold text-slate-400 uppercase">At {h.hospital}</p></div>
            </div>
            <div className="text-right text-[10px] font-black italic opacity-50 group-hover:opacity-100"><Calendar size={12} className="inline mr-1" /> {h.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}