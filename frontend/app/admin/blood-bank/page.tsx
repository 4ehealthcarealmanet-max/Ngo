"use client";
import React, { useState, useEffect } from 'react';
import { Bell, MapPin, Send, UserCheck, Activity, Search, AlertCircle, Radio, Phone, User } from 'lucide-react';
import axios from 'axios';

const API_URL = "http://127.0.0.1:8000/api/sos-requests/";

export default function SOSControlRoom() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [donors, setDonors] = useState([]);
  
  // --- NEW STATES ---
  const [notifications, setNotifications] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);

  // --- FETCH FUNCTIONS ---
  const fetchData = async () => {
    try {
      const res = await axios.get(API_URL);
      setRequests(res.data);
      
      const donorRes = await axios.get('http://127.0.0.1:8000/api/volunteer-donors/');
      setDonors(donorRes.data);

      const notifRes = await axios.get('http://127.0.0.1:8000/api/notifications/');
      setNotifications(notifRes.data);
      
      setLoading(false);
    } catch (error) {
      console.error("Data fetch error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrackerData = async () => {
    try {
        const res = await axios.get('http://127.0.0.1:8000/api/notifications/');
        setNotifications(res.data);
    } catch (err) {
        console.error("Tracker fetch error:", err);
    }
  };

  const handleBroadcast = async (id) => {
    try {
        const res = await axios.post(`http://127.0.0.1:8000/api/sos-requests/${id}/broadcast/`);
        if (res.data.status === "success") {
            alert("Broadcast Successful!");
            fetchTrackerData(); 
        } else {
            alert(res.data.message); 
        }
    } catch (err) {
        console.error("Error details:", err.response?.data);
        alert("Failed to reach donors.");
    }
  };
  const handleCancelBroadcast = async (id) => {
  try {
      // Backend API endpoint jo status wapas change karega
      const res = await axios.post(`http://127.0.0.1:8000/api/sos-requests/${id}/cancel_broadcast/`);
      
      if (res.data.status === "success") {
          alert("Broadcast Cancelled!");
          fetchData(); // UI refresh karne ke liye
      }
  } catch (err) {
      console.error("Cancel error:", err.response?.data);
      alert("Failed to cancel broadcast.");
  }
};

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-[1000] text-slate-900 tracking-tighter italic">SOS RADAR</h1>
          <p className="text-rose-600 font-black flex items-center gap-2 mt-1">
            <Activity size={16} className="animate-pulse" /> REAL-TIME HOSPITAL DEMAND INTERFACE
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-5 rounded-[30px] shadow-sm border border-slate-100 text-center min-w-[140px]">
            <p className="text-[10px] font-black text-slate-400 uppercase">Active Requests</p>
            <p className="text-2xl font-black text-rose-600">{requests.length}</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-[30px] shadow-lg text-center min-w-[140px]">
            <p className="text-[10px] font-black text-slate-400 uppercase">Nearest Donors</p>
            <p className="text-2xl font-black text-white italic">{donors.length} Active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LEFT COLUMN: SOS FEED & TRACKER */}
        <div className="xl:col-span-2 space-y-6">
          {/* SOS FEED */}
          <div className="space-y-6">
            {loading && requests.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 font-bold bg-white rounded-[45px] border-2 border-dashed border-slate-200">
                <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mb-4" />
                SCANNING EMERGENCY SIGNALS...
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white p-12 rounded-[45px] text-center border border-slate-100">
                <p className="text-slate-400 font-black italic uppercase">No active emergencies found.</p>
              </div>
            ) : (
              requests.map((req) => {
                const isBroadcasting = req.status === "Broadcasting";
                return (
                  <div 
                    key={req.id} 
                    className={`bg-white rounded-[45px] p-8 border-l-[12px] shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative ${
                      isBroadcasting ? 'border-emerald-500' : 'border-rose-600'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-6">
                        <div className={`w-24 h-24 rounded-[35px] flex flex-col items-center justify-center border-2 ${
                          isBroadcasting ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
                        }`}>
                          <span className={`text-[10px] font-black uppercase ${isBroadcasting ? 'text-emerald-400' : 'text-rose-400'}`}>Group</span>
                          <span className={`text-4xl font-[1000] leading-none ${isBroadcasting ? 'text-emerald-600' : 'text-rose-600'}`}>{req.blood_group}</span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-[1000] text-slate-900 tracking-tight">{req.hospital_name}</h3>
                          <p className="text-slate-400 font-bold uppercase text-[10px] mt-1">Patient: {req.patient_name}</p>
                          <div className="flex items-center gap-4 mt-6">
                            <div className="flex items-center gap-1 text-slate-900 font-black text-xs">
                              <AlertCircle size={14} className={isBroadcasting ? 'text-emerald-500' : 'text-rose-600'} /> {req.units_required} Units
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 font-black text-xs">
                              <MapPin size={14} /> {req.distance || '2.5'} KM
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center items-end gap-2">
  {/* Agar Broadcasting hai toh Cancel button dikhao, nahi toh Initiate button */}
  {isBroadcasting ? (
    <button 
      onClick={() => handleCancelBroadcast(req.id)}
      className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black px-6 py-2 rounded-full transition-all tracking-widest border border-slate-200"
    >
      CANCEL BROADCAST
    </button>
  ) : (
    <button 
      onClick={() => {
        setSelectedRequest(req); 
        setShowModal(true);
      }}
      className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black px-6 py-2 rounded-full transition-all tracking-widest active:scale-95"
    >
      INITIATE BROADCAST
    </button>
  )}
  
  <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${
    isBroadcasting ? 'text-emerald-500 font-bold' : 'text-slate-300'
  }`}>
    {isBroadcasting ? '● Signal Live' : `ID: SOS-${req.id}`}
  </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* LIVE RESPONSE TRACKER */}
          <div className="mt-12 bg-white rounded-[45px] p-8 shadow-sm border border-slate-100">
            <h3 className="text-xl font-[1000] text-slate-900 mb-6 uppercase italic flex items-center gap-2">
                <Activity className="text-rose-600" size={20} /> Live Response Tracker
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                            <th className="pb-4">Donor</th>
                            <th className="pb-4">Hospital Target</th>
                            <th className="pb-4">Distance</th>
                            <th className="pb-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
  {notifications
    .filter((notif) => {
      // Sirf wahi notifications dikhao jinki request abhi "Broadcasting" status mein hai
      // Iske liye hum requests array se match karenge
      const relatedRequest = requests.find(r => r.id === notif.sos_request); 
      return relatedRequest?.status === "Broadcasting";
    })
    .map((notif) => (
      <tr key={notif.id} className="border-t border-gray-100">
        <td className="py-4 font-semibold text-gray-800">
          {notif.donor_name || "Unknown Donor"}
        </td>
        <td className="py-4 text-gray-500">
          {notif.hospital_name || "City Hospital"}
        </td>
        <td className="py-4 font-bold text-red-600">
          {notif.distance_km} KM
        </td>
        <td className="py-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            notif.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {notif.status.toUpperCase()}
          </span>
        </td>
      </tr>
    ))}
</tbody>
                </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-white rounded-[45px] p-8 shadow-sm border border-slate-100">
            <h3 className="font-[1000] text-xl text-slate-900 mb-8 flex items-center gap-2 uppercase italic">
              <Search className="text-rose-600" size={20} /> Local Donors
            </h3>
            <div className="space-y-4 mb-8">
              {donors.map((donor, index) => (
                <div key={donor.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[25px]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 text-xs italic">D{index + 1}</div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{donor.name}</p>
                      <p className="text-[10px] font-bold text-rose-500 uppercase">{donor.blood_group} • {donor.city}</p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${donor.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                </div>
              ))}
            </div>
            <div className="h-48 bg-slate-900 rounded-[35px] relative overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-600/20 via-transparent to-transparent animate-pulse" />
               <Radio className="text-rose-600 animate-bounce" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {selectedDonor && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200]">
              <div className="bg-white rounded-[40px] p-10 max-w-sm w-full">
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="text-rose-600" size={30} />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900">{selectedDonor.donor_name}</h2>
                      <p className="text-rose-500 font-bold text-[10px] uppercase tracking-widest">Active Responder</p>
                  </div>
                  <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                          <Phone size={18} className="text-slate-400" />
                          <span className="font-bold text-slate-700">{selectedDonor.donor_phone || "No Contact"}</span>
                      </div>
                  </div>
                  <button onClick={() => setSelectedDonor(null)} className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-tighter">Close</button>
              </div>
          </div>
      )}

      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-6">🚨 Emergency Details</h2>
            <div className="space-y-4 text-gray-700 mb-8">
              <div className="flex justify-between border-b pb-2"><span className="font-semibold">Hospital:</span><span>{selectedRequest.hospital_name}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="font-semibold">Blood:</span><span className="text-red-600 font-bold">{selectedRequest.blood_group}</span></div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  if (selectedRequest?.id) {
                    handleBroadcast(selectedRequest.id);
                    setShowModal(false);
                  }
                }}
                className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black hover:bg-red-700 transition-all active:scale-95"
              >
                CONFIRM BROADCAST
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-bold text-slate-600">CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}