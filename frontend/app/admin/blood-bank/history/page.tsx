"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Download, ExternalLink, X, MapPin, 
  Phone, Droplets, Heart, Activity, Users, TrendingUp, Award
} from 'lucide-react';
import { apiUrl } from "@/lib/api";
const MatchHistory = () => {
  // State for dynamic data
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedMatch, setSelectedMatch] = useState(null);

  const [stats, setStats] = useState({
  lives_saved: 0,
  success_rate: "0%",
  total_donors: 0,
  units_traded: "0"
});

// Stats fetch karne ke liye
useEffect(() => {
  const fetchStats = async () => {
    try {
      //const response = await fetch('http://127.0.0.1:8000/api/dashboard-stats/');
      const response = await fetch(apiUrl("/api/dashboard-stats/"));
      const data = await response.json();
      
      // console mein check karein ki data mil raha hai
      console.log("Fetched Stats:", data); 

      setStats({
        lives_saved: data.lives_saved || 0,
        success_rate: data.success_rate || "0%",
        total_donors: data.total_donors || 0,
        units_traded: data.units_traded || "0"
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };
  fetchStats();
}, []);

  // FETCH DATA FROM DJANGO BACKEND
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        // Replace with your actual Django API URL
        //const response = await fetch('http://127.0.0.1:8000/api/blood-bank/matches/');
        const response = await fetch(apiUrl("/api/blood-bank/matches/"));
        const data = await response.json();
        setHistoryData(data);
      } catch (error) {
        console.error("Error fetching match history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Filter Logic
  const filteredData = useMemo(() => {
    return historyData.filter(item => {
      const matchesSearch = 
        item.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.reference_id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'All' || item.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [searchTerm, activeTab, historyData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-10 bg-[#F8FAFC] min-h-screen text-[#1E293B]">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#0F172A]">Match History</h1>
          <p className="text-slate-400 font-medium text-lg mt-1">Real-time tracking from your PostgreSQL database.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
          <Download size={20} /> Export Records
        </button>
      </div>

      {/* STATS SECTION - Now Dynamic */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
  {[
    { label: 'Lives Saved', value: stats.lives_saved, icon: Heart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Success Rate', value: stats.success_rate, icon: Activity, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Total Donors', value: stats.total_donors, icon: Users, color: 'text-blue-400', bg: 'bg-blue-50' },
    { label: 'Units Traded', value: stats.units_traded, icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
  ].map((stat, i) => (
    <div key={i} className="bg-white p-8 rounded-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-white hover:border-blue-100 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
          <stat.icon size={28} strokeWidth={2.5} />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
          <TrendingUp size={12} /> Live
        </div>
      </div>
      <p className="text-3xl font-black text-[#0F172A] mb-1">{stat.value}</p>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
    </div>
  ))}
</div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-center justify-between">
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
          {['All', 'Completed', 'In Transit', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${
                activeTab === tab ? 'bg-[#0F172A] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-[450px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="Search Reference or Donor..." 
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm outline-none focus:border-blue-200"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* DYNAMIC TABLE */}
      <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F8FAFC] border-b border-slate-100">
            <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
              <th className="px-10 py-6">Reference ID</th>
              <th className="px-10 py-6">Donor Info</th>
              <th className="px-10 py-6">Destination</th>
              <th className="px-10 py-6">Volume</th>
              <th className="px-10 py-6">Status</th>
              <th className="px-10 py-6 text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-10 py-8 text-sm font-black text-[#475569] font-mono group-hover:text-blue-600">
                    {item.reference_id}
                  </td>
                  <td className="px-10 py-8">
                    <div className="font-bold text-[#0F172A] text-lg leading-tight">{item.donor_name}</div>
                    <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit mt-1.5 border border-blue-100">{item.blood_group}</div>
                  </td>
                  <td className="px-10 py-8 text-sm text-slate-500 font-bold">{item.hospital_name}</td>
                  <td className="px-10 py-8 text-sm text-slate-400 font-bold">{item.units} Units</td>
                  <td className="px-10 py-8">
                    <span className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-widest border ${
                      item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      item.status === 'In Transit' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>
                      {item.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button onClick={() => setSelectedMatch(item)} className="p-3 text-slate-300 hover:text-blue-600 transition-all">
                      <ExternalLink size={22} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
              <td colSpan={6} className="text-center py-20 text-slate-400 font-bold">
                No matches found in database.
              </td>  
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL (Populated with selectedMatch data) */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          {/* Modal content similar to previous version, using selectedMatch keys */}
        </div>
      )}
    </div>
  );
};

export default MatchHistory;