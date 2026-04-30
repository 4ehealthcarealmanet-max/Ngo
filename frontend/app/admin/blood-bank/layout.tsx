"use client";
import React from "react";
import { Droplet, Radio, Map, Activity, History, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BloodBankLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const navLinks = [
    { name: 'SOS Radar', href: '/admin/blood-bank', icon: Radio },
    { name: 'Donor Map', href: '/admin/blood-bank/map', icon: Map },
    { name: 'Live Tracking', href: '/admin/blood-bank/tracking', icon: Activity },
    { name: 'Match History', href: '/admin/blood-bank/history', icon: History },
  ];

  return (
    <div className="flex h-screen bg-[#F1F5F9]">
      {/* SIDEBAR - BLUE THEME */}
      <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col p-6 z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
            <Droplet className="text-white" fill="currentColor" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-[1000] text-slate-900 tracking-tighter uppercase leading-none">Blood Hub</h2>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic mt-1">Emergency Connect</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-transparent group-hover:bg-blue-50'}`}>
                  <link.icon size={18} />
                </div>
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-slate-100">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 px-4 py-3 text-slate-500 font-bold hover:text-blue-600 text-xs italic transition-colors"
          >
            <ArrowLeft size={18} /> Exit to Main Admin
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        {children}
      </main>
    </div>
  );
}