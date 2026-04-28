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
    <div className="flex h-screen bg-[#F8FAFC]">
      <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-rose-600 p-2 rounded-xl shadow-lg shadow-rose-200"><Droplet className="text-white" fill="currentColor" size={24} /></div>
          <div><h2 className="text-xl font-[1000] text-slate-900 tracking-tighter uppercase">Blood Hub</h2><p className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic">Emergency Connect</p></div>
        </div>
        <nav className="flex-1 space-y-1.5">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-black text-sm transition-all ${pathname === link.href ? 'bg-rose-600 text-white shadow-xl shadow-rose-200' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'}`}>
              <link.icon size={20} />{link.name}
            </Link>
          ))}
        </nav>
        <div className="pt-6 border-t border-slate-100">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-slate-500 font-bold hover:text-slate-900 text-xs italic"><ArrowLeft size={18} /> Exit to Main Admin</Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}