"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function DoctorDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ================= FIXED SIDEBAR ================= */}
      <aside className="w-64 bg-white hidden lg:flex flex-col fixed top-0 left-0 h-screen shadow-xl border-r border-slate-100 z-50">
        
        {/* 1. Header: Logo */}
        <div className="p-8 border-b border-slate-50 shrink-0">
          <a href="/" className="flex items-center">
            <img
              src="/medbridge-logo.svg"
              alt="MedBridge"
              className="h-10 w-auto select-none"
              draggable={false}
            />
          </a>
        </div>

        {/* 2. Scrollable Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">
          {[
            { name: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" /></svg>, active: true },
            { name: 'Appointments', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg> },
            { name: 'Patients', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg> },
            { name: 'Medical Records', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg> },
            { name: 'Settings', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.24-2.03-.55-.644-.31-1.223-.74-1.69-1.28l-.001-.002-1.004-.827c-.293-.24-.438-.613-.431-.992a6.759 6.759 0 0 1 0-.255c-.007-.378.138-.75.43-.99l1.005-.828c.424-.35.534-.954.26-1.43l-1.298-2.247a1.125 1.125 0 0 1 1.369-.491l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281c.09-.543.56-.94 1.11-.94h2.594c.55 0 1.02.397 1.11.94l.213 1.281c.062.374.312.686.644.87.073.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c.007.378-.138.75-.43.99l-1.005.828c-.424.35-.534.954-.26 1.43l1.298 2.247a1.125 1.125 0 0 1 1.369.491l1.217.456c.355.133.75.072 1.076-.124.072.044.146.087.22.128.332.183.582.495.644.869l.214 1.281c.09.543.56.94 1.11.94h2.594c.55 0 1.02-.397 1.11-.94l.213-1.281c.062-.374.312-.686.644-.87.073-.04.147-.083.22-.127.324-.196.72-.257 1.075-.124l1.217.456a1.125 1.125 0 0 1 1.37-.49l1.296-2.247a1.125 1.125 0 0 1-.26-1.431l-1.003-.827c-.293-.24-.438-.613-.431-.992a6.759 6.759 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l1.005-.828c.424-.35.534-.954.26-1.43l-1.298-2.247a1.125 1.125 0 0 1-1.369-.491l-1.217.456c-.355.133-.75.072-1.076-.124-.072-.044-.146-.087-.22-.128-.332-.183-.582-.495-.644-.869l-.214-1.281c-.09-.543-.56-.94-1.11-.94h-2.594c-.55 0-1.02.397-1.11.94l-.213 1.281c-.062.374-.312.686-.644.87a6.52 6.52 0 0 1-.22.127c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.397-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.331-.183-.581-.495-.644-.869l-.213-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg> },
          ].map((item) => (
            <button key={item.name} className={`w-full flex items-center gap-4 px-5 py-4 text-sm font-bold rounded-2xl transition-all duration-200 ${item.active ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}`}>
              <div className={item.active ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</div>
              {item.name}
            </button>
          ))}
        </nav>

        {/* 3. Logout Section: FIXED BOTTOM */}
        <div className="p-6 bg-white border-t border-slate-100 shrink-0">
          <button 
            onClick={handleLogout} 
            className="group w-full flex items-center gap-3 px-6 py-4 text-sm font-black bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all duration-300 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 transition-transform group-hover:-translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 lg:ml-64 bg-[#f8fafc] min-h-screen">
        
        {/* Header */}
        <header className="bg-white/80 border-b border-slate-100 px-10 py-5 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black text-slate-900">Dr. Sameer Khan</h1>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">Surgeon</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
            </div>
            <div className="h-12 w-12 rounded-full overflow-hidden border-4 border-white shadow-sm ring-1 ring-slate-100">
              <img src="https://ui-avatars.com/api/?name=Sameer+Khan&background=0D8ABC&color=fff" alt="Avatar" />
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1400px] mx-auto space-y-10">
          
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2rem] p-12 text-white shadow-lg shadow-blue-200 flex justify-between items-center overflow-hidden relative transition-all transform hover:scale-[1.01] duration-300">
            <div className="relative z-10 space-y-3">
              <h2 className="text-3xl font-black mb-1 leading-tight">Good Morning, Doctor!</h2>
              <p className="text-blue-100 font-medium">You have 8 medical sessions scheduled for today.</p>
              <button className="mt-4 bg-white text-blue-600 px-8 py-3 rounded-xl font-black text-sm shadow-md hover:bg-slate-50 transition-all active:scale-95">
                View Schedule
              </button>
            </div>
            <div className="hidden xl:block opacity-20 absolute -right-10 -bottom-10 rotate-12">
               <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg>
            </div>
          </div>

          {/* Statistics Grid with Blue Border Hover */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {[
              { label: 'Total Patients', val: '1,452', sub: '+12% vs last month', color: 'text-blue-600', bg: 'bg-blue-50', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg> },
              { label: 'Appointments', val: '08', sub: 'Today scheduled', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg> },
              { label: 'Reviews', val: '4.9/5', sub: 'Highly trusted', color: 'text-amber-500', bg: 'bg-amber-50', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.562.562 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg> },
              { label: 'Revenue', val: '₹62,400', sub: 'Weekly Earnings', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.546 1.16 3.74.324 3.74-1.39 0-1.254-1.273-1.454-2.472-1.933L9.58 12.6c-1.246-.48-2.437-1.223-2.437-2.61 0-1.636 1.543-2.586 3.097-2.128l.83.245M12 6V4m0 2v2m0 10v2m0-2v-2" /></svg> },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-transparent shadow-sm transition-all duration-300 hover:shadow-xl hover:border-blue-400 hover:-translate-y-2 group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-opacity-80 shadow-inner`}>
                    {stat.icon}
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">Live</span>
                </div>
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</h3>
                <div className="text-2xl font-black text-slate-900">{stat.val}</div>
                <p className="text-slate-400 text-[10px] font-medium mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Queue Management Table */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-xl font-black text-slate-900">Queue Management</h3>
              <div className="flex p-1 bg-slate-100 rounded-xl">
                 <button className="px-6 py-2 bg-white rounded-lg text-xs font-black text-slate-900 shadow-sm">Today</button>
                 <button className="px-6 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors ml-2">History</button>
              </div>
            </div>
            
            <div className="overflow-x-auto p-6">
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead className="text-slate-400 text-[11px] font-black uppercase tracking-widest px-10">
                  <tr>
                    <th className="px-10 py-2">Patient Profile</th>
                    <th className="px-10 py-2">Session Time</th>
                    <th className="px-10 py-2 text-center">Status</th>
                    <th className="px-10 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { name: 'Amit Verma', id: '#P-202', time: '10:30 AM', status: 'In Waiting' },
                    { name: 'Priya Das', id: '#P-205', time: '11:15 AM', status: 'Emergency' },
                    { name: 'Rahul Joshi', id: '#P-210', time: '12:00 PM', status: 'Upcoming' },
                  ].map((p, i) => (
                    <tr 
                      key={i} 
                      className="group bg-white transition-all duration-300 transform hover:scale-[1.01] cursor-pointer"
                    >
                      {/* Left Side: Patient Info with Hover Border */}
                      <td className="px-10 py-6 rounded-l-2xl border-y border-l border-slate-100 group-hover:border-blue-400 group-hover:shadow-[0_4px_20px_-10px_rgba(59,130,246,0.3)]">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center font-black text-blue-600 text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300"> 
                             {p.name[0]} 
                           </div>
                           <div>
                             <p className="font-black text-slate-900 group-hover:text-blue-700 transition-colors">{p.name}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">{p.id}</p>
                           </div>
                        </div>
                      </td>

                      {/* Middle: Time */}
                      <td className="px-10 py-6 border-y border-slate-100 group-hover:border-blue-400 group-hover:shadow-[0_4px_20px_-10px_rgba(59,130,246,0.3)]">
                        <span className="font-black text-blue-600">{p.time}</span>
                      </td>

                      {/* Middle: Status */}
                      <td className="px-10 py-6 border-y border-slate-100 group-hover:border-blue-400 group-hover:shadow-[0_4px_20px_-10px_rgba(59,130,246,0.3)] text-center">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                          p.status === 'Emergency' 
                          ? 'bg-red-100 text-red-600 border border-red-200 group-hover:bg-red-600 group-hover:text-white' 
                          : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>

                      {/* Right Side: Action Button */}
                      <td className="px-10 py-6 rounded-r-2xl border-y border-r border-slate-100 group-hover:border-blue-400 group-hover:shadow-[0_4px_20px_-10px_rgba(59,130,246,0.3)] text-right">
                        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all">
                          Attend Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
