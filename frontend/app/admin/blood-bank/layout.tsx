"use client";
import React from "react";
import { 
  LayoutDashboard, Database, Truck, Users, History, ArrowLeft, Droplet 
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
    <div className="flex h-screen bg-[#f8fafc]">
      
      {/* Sidebar - Matching MedBridge Theme */}
      <aside className="w-[280px] bg-white border-r border-slate-100 flex flex-col">
        
        {/* Branding Area */}
        <div className="p-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-50 rounded-lg">
                <Droplet className="text-blue-600" size={20} />
             </div>
             <div>
                <h2 className="text-sm font-bold text-slate-800 tracking-tight">BLOOD HUB</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Operations</p>
             </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                  ? 'bg-blue-50 text-blue-600 shadow-sm border-l-4 border-blue-600' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <link.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Back to Main Admin */}
        <div className="p-4 border-t border-slate-50">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Admin</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          {children}
        </div>
      </main>

    </div>
  );
}