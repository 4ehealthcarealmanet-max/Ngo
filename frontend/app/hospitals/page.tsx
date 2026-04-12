"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, PhoneCall, Mail, ShieldCheck } from "lucide-react";
import { apiUrl } from "../lib/api";

type Hospital = {
  id: number;
  name: string;
  location: string;
  specialty: string;
  contact?: string;
  beds_available?: number | null;
};

const parseContactLink = (contact?: string) => {
  const value = (contact ?? "").trim();
  if (!value) return null;
  if (value.includes("@")) return { href: `mailto:${value}`, label: "Email" as const };
  const cleaned = value.replace(/\s+/g, "");
  return { href: `tel:${cleaned}`, label: "Call" as const };
};

export default function HospitalsDirectoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(apiUrl("/api/hospitals/"), { headers: { Accept: "application/json" } });
        const data = (await res.json()) as unknown;
        setHospitals(Array.isArray(data) ? (data as Hospital[]) : []);
      } catch {
        setHospitals([]);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const sorted = useMemo(() => {
    return [...hospitals].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [hospitals]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <h1 className="mt-3 text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Hospital Directory</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500 max-w-2xl">
              Trusted partner hospitals for referrals. Availability status is a planned pro feature.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xs font-black text-slate-700 shadow-sm">
              <ShieldCheck size={16} className="text-emerald-600" /> Verified Partners
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
                <div className="h-10 w-10 rounded-2xl bg-slate-100" />
                <div className="mt-4 h-4 w-2/3 bg-slate-100 rounded" />
                <div className="mt-2 h-3 w-1/2 bg-slate-100 rounded" />
                <div className="mt-6 h-10 w-full bg-slate-100 rounded-2xl" />
              </div>
            ))
          ) : sorted.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 rounded-3xl border border-slate-100 bg-white p-10 shadow-sm text-center">
              <p className="text-lg font-black text-slate-900">No partner hospitals found.</p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Ask the admin to add hospitals from the Admin Dashboard → Hospital Management.
              </p>
            </div>
          ) : (
            sorted.map((h) => {
              const contactLink = parseContactLink(h.contact);
              const isEmail = contactLink?.label === "Email";
              const beds =
                typeof h.beds_available === "number" && Number.isFinite(h.beds_available) ? Math.max(0, Math.floor(h.beds_available)) : null;
              const availabilityBadge =
                beds === null
                  ? "bg-slate-50 text-slate-500 border-slate-100"
                  : beds > 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-rose-50 text-rose-700 border-rose-100";
              return (
                <div
                  key={h.id}
                  className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
                      <Building2 size={18} />
                    </div>
                    <span className={`text-[10px] font-black border px-2.5 py-1 rounded-xl ${availabilityBadge}`}>
                      {beds === null ? "Availability: Coming soon" : `${beds} Beds Available`}
                    </span>
                  </div>

                  <h2 className="mt-4 text-lg font-black text-slate-900">{h.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{h.location}</p>

                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization</p>
                    <p className="mt-1 text-sm font-black text-slate-900">{h.specialty || "General"}</p>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <a
                      href={contactLink?.href ?? "#"}
                      onClick={(e) => {
                        if (!contactLink) e.preventDefault();
                      }}
                      className={`flex-1 rounded-2xl px-4 py-3 text-xs font-black inline-flex items-center justify-center gap-2 transition-colors duration-200 ${
                        contactLink
                          ? "bg-blue-600 text-white hover:bg-slate-800"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                      aria-disabled={!contactLink}
                      title={contactLink ? "Contact for referral" : "No contact available"}
                    >
                      {isEmail ? <Mail size={16} /> : <PhoneCall size={16} />}
                      Contact for Referral
                    </a>
                  </div>
                  {h.contact && (
                    <p className="mt-3 text-[11px] font-bold text-slate-400 break-words">
                      Contact: <span className="font-black text-slate-500">{h.contact}</span>
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
