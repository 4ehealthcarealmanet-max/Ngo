"use client";
import React from "react";
import { 
  Droplet, LayoutDashboard, Database, 
  Truck, Users, History, Settings, ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BloodBankLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Command Center', href: '/admin/blood-bank', icon: LayoutDashboard },
    { name: 'Stock Inventory', href: '/admin/blood-bank/inventory', icon: Database },
    { name: 'Live Tracking', href: '/admin/blood-bank/tracking', icon: Truck },
    { name: 'Donor Registry', href: '/admin/blood-bank/donors', icon: Users },
    { name: 'Transfer Logs', href: '/admin/blood-bank/logs', icon: History },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      
      {/* --- NEW LEFT SIDEBAR --- */}
      <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col p-6 shadow-sm">
        
        {/* Branding */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-rose-600 p-2 rounded-xl shadow-lg shadow-rose-200">
            <Droplet className="text-white" fill="currentColor" size={24} />
          </div>
          <div className="leading-tight">
            <h2 className="text-xl font-[1000] text-slate-900 tracking-tighter uppercase">Blood Hub</h2>
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic">Admin Panel</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-black text-sm transition-all ${
                  isActive 
                  ? 'bg-rose-600 text-white shadow-xl shadow-rose-200 translate-x-1' 
                  : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                <link.icon size={20} strokeWidth={isActive ? 3 : 2} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-100 space-y-2">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 px-4 py-3 text-slate-500 font-bold hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={18} /> <span className="text-xs italic">Exit to Main Admin</span>
          </Link>
        </div>
      </aside>

      {/* --- MAIN PAGE CONTENT --- */}
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        <div className="p-0"> {/* Padding content ke andar se handle hogi */}
          {children}
        </div>
      </main>

    </div>
  );
}