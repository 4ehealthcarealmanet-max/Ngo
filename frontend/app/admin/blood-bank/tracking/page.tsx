"use client";
import React, { useState, useEffect } from 'react';
import { User, Phone, CheckCircle, Clock } from 'lucide-react';

export default function ActiveTracking() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/active-matches/')
      .then(res => res.json())
      .then(data => setMatches(data));
  }, []);

  return (
    <div className="p-8 space-y-8 bg-[#F8FAFC]">
      <h1 className="text-3xl font-[1000] text-slate-900">Live Match Tracking</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match: any) => (
          <div key={match.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden">
             <div className="flex justify-between items-start mb-6">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black tracking-tighter"> {match.donor_name[0]} </div>
                 <div><h3 className="font-black">{match.donor_name}</h3><p className="text-[10px] font-bold text-slate-400">EN-ROUTE TO {match.hospital}</p></div>
               </div>
               <span className="text-xs font-black text-rose-600 italic animate-pulse">Live</span>
             </div>
             <div className="flex gap-4 pt-6 border-t border-slate-50">
               <button className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2"><CheckCircle size={14} /> CONFIRM ARRIVAL</button>
               <button className="bg-slate-100 p-3 rounded-xl text-slate-400"><Phone size={14} /></button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}