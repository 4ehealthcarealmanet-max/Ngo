"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 text-xl font-black text-slate-800 flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">H</div>
          <span>
            MedBridge<span className="text-blue-600">NGO</span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {["Overview", "Appointments", "Medical Records", "Saved NGOs", "Settings"].map((item) => (
            <a
              key={item}
              href="#"
              className={`flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                item === "Overview" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              }`}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <DashboardHeader title="User Dashboard" adminName="Ram Sharma" adminRole="Patient" initials="RS" onLogout={handleLogout} />
        {children}
      </main>
    </div>
  );
}

