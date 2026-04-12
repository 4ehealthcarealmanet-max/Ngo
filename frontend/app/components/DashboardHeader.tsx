"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCircle2, ChevronRight, Info, LogOut, Search, ShieldAlert, TriangleAlert, User } from "lucide-react";

export type HeaderNotification = {
  id: string;
  tone?: "urgent" | "update" | "alert";
  title: string;
  description?: string;
  timeLabel?: string;
};

export default function DashboardHeader({
  title = "System Overview",
  adminName = "Admin",
  adminRole = "Super Admin",
  initials = "AD",
  searchTerm,
  onSearchTermChange,
  sticky = true,
  className,
  onLogout,
  notifications = [],
  onNotificationAction,
  onProfileSettings,
}: {
  title?: string;
  adminName?: string;
  adminRole?: string;
  initials?: string;
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
  sticky?: boolean;
  className?: string;
  onLogout?: () => void;
  notifications?: HeaderNotification[];
  onNotificationAction?: (notification: HeaderNotification) => void;
  onProfileSettings?: () => void;
}) {
  const dateLabel = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }, []);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const visibleNotifications = useMemo(() => notifications.slice(0, 3), [notifications]);
  const notifCount = visibleNotifications.length;

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (notifRef.current && notifRef.current.contains(target)) return;
      if (profileRef.current && profileRef.current.contains(target)) return;
      setIsNotifOpen(false);
      setIsProfileOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsNotifOpen(false);
      setIsProfileOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const notifIcon = (tone?: HeaderNotification["tone"]) => {
    if (tone === "urgent") return <TriangleAlert size={16} className="text-amber-700" />;
    if (tone === "alert") return <ShieldAlert size={16} className="text-rose-700" />;
    if (tone === "update") return <Info size={16} className="text-blue-700" />;
    return <CheckCircle2 size={16} className="text-emerald-700" />;
  };

  return (
    <header
      className={[
        "h-20 flex items-center justify-between px-8",
        sticky ? "bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50" : "",
        className ?? "",
      ].join(" ")}
    >
      <div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">{title}</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dateLabel}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm ?? ""}
            onChange={(e) => onSearchTermChange?.(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none w-64 transition-all"
          />
        </div>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen((v) => !v);
              setIsProfileOpen(false);
            }}
            className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors hover:scale-110 hover:-rotate-6 transition-transform"
            aria-label="Notifications"
            aria-expanded={isNotifOpen}
            title="Notifications"
          >
            <Bell size={20} />
            {notifCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            )}
          </button>

          {isNotifOpen && (
            <div
              className="absolute right-0 mt-3 w-[360px] rounded-3xl border border-slate-100 bg-white shadow-2xl overflow-hidden z-[120]"
              role="menu"
              aria-label="Notifications menu"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <p className="text-sm font-black text-slate-900">Notifications</p>
                <span className="text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl">
                  {notifCount}
                </span>
              </div>

              <div className="p-3">
                {visibleNotifications.length === 0 ? (
                  <div className="px-3 py-8 text-center">
                    <p className="text-sm font-semibold text-slate-500">No new notifications.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {visibleNotifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          onNotificationAction?.(n);
                          setIsNotifOpen(false);
                        }}
                        className="w-full text-left rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all px-4 py-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 h-9 w-9 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                            {notifIcon(n.tone)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-slate-900 break-words">{n.title}</p>
                            {n.description && (
                              <p className="mt-1 text-xs font-semibold text-slate-600 break-words">{n.description}</p>
                            )}
                            {n.timeLabel && <p className="mt-2 text-[11px] font-bold text-slate-400">{n.timeLabel}</p>}
                          </div>
                          <ChevronRight size={16} className="text-slate-300 mt-2 shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen((v) => !v);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-3 pl-6 border-l border-slate-100 group"
            aria-label="Open profile menu"
            aria-expanded={isProfileOpen}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-800 leading-none">{adminName}</p>
              <p className="text-[9px] font-bold text-blue-600 uppercase mt-1">{adminRole}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100 group-hover:shadow-blue-200 transition-shadow">
              {initials}
            </div>
          </button>

          {isProfileOpen && (
            <div
              className="absolute right-0 mt-3 w-64 rounded-3xl border border-slate-100 bg-white shadow-2xl overflow-hidden z-[120]"
              role="menu"
              aria-label="Profile menu"
            >
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-sm font-black text-slate-900">{adminName}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{adminRole}</p>
              </div>

              <div className="p-3 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    onProfileSettings?.();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all px-4 py-3"
                >
                  <span className="inline-flex items-center gap-2 text-sm font-black text-slate-800">
                    <User size={16} className="text-blue-700" /> Profile Settings
                  </span>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-between gap-3 rounded-2xl border border-transparent hover:border-rose-100 hover:bg-rose-50 transition-all px-4 py-3"
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-black text-rose-700">
                      <LogOut size={16} /> Logout
                    </span>
                    <ChevronRight size={16} className="text-rose-300" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
