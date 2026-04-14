"use client";

import React, { useMemo } from "react";

export type SmartPatientProfilingData = {
  full_name: string;
  patient_id: string;
  blood_group: string;
  ngo_name?: string | null;
  last_checkup?: string | null;
  created_at?: string | null;
};

type SmartPatientProfilingModalProps = {
  open: boolean;
  patientData: SmartPatientProfilingData | null;
  onClose: () => void;
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" });
};

export default function SmartPatientProfilingModal({ open, patientData, onClose }: SmartPatientProfilingModalProps) {
  const lastCheckup = useMemo(() => {
    if (!patientData) return "—";
    return formatDate(patientData.last_checkup ?? patientData.created_at ?? null);
  }, [patientData]);

  if (!open || !patientData) return null;

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    patientData.patient_id
  )}`;

  return (
    <div
      className="fixed inset-0 z-[240] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Smart Patient Profiling"
    >
      <div className="w-full max-w-3xl rounded-[2.8rem] bg-white shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Smart Patient Profiling</p>
            <h3 className="text-xl font-black text-slate-900 mt-1">Health ID Preview</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-11 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Close modal"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 overflow-hidden">
          <div className="lg:col-span-7">
            <div className="rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-[0_36px_90px_-40px_rgba(37,99,235,0.75)] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-sm"></div>
              <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-white/10 rounded-full blur-2xl"></div>

              <div className="relative z-10 flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-85">
                    MedBridge Digital Health ID
                  </p>
                  <h4 className="mt-2 text-2xl font-black tracking-tight truncate">{patientData.full_name}</h4>
                  <p className="mt-1 text-xs font-bold text-white/80 truncate">
                    {patientData.ngo_name ? `Verified by ${patientData.ngo_name}` : "Verified Partner NGO"}
                  </p>
                </div>

                <div className="shrink-0 rounded-2xl bg-white p-3 shadow-lg">
                  <img
                    src={qrSrc}
                    alt={`QR for ${patientData.patient_id}`}
                    className="h-[120px] w-[120px] rounded-xl bg-white"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="relative z-10 mt-7 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] opacity-75 uppercase font-bold">Patient ID</p>
                  <p className="font-mono text-sm font-black">{patientData.patient_id}</p>
                </div>
                <div>
                  <p className="text-[9px] opacity-75 uppercase font-bold">Blood Group</p>
                  <p className="text-sm font-black">{patientData.blood_group}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] opacity-75 uppercase font-bold">Last Checkup</p>
                  <p className="text-sm font-black">{lastCheckup}</p>
                </div>
              </div>

              <div className="relative z-10 mt-8 pt-4 border-t border-white/20 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <p className="text-[10px] font-bold tracking-tight">Active Encrypted Record</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4 overflow-hidden">
            <div className="rounded-[2.2rem] border border-slate-100 bg-slate-50 p-6">
              <h5 className="text-sm font-black text-slate-900">Patient Details</h5>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 font-bold">Name</span>
                  <span className="text-slate-900 font-black truncate">{patientData.full_name}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 font-bold">Health ID</span>
                  <span className="text-slate-900 font-black font-mono">{patientData.patient_id}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 font-bold">Blood Group</span>
                  <span className="text-slate-900 font-black">{patientData.blood_group}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 font-bold">Last Checkup</span>
                  <span className="text-slate-900 font-black">{lastCheckup}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                console.log("Download Health ID", patientData.patient_id);
              }}
              className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-200 hover:bg-slate-800 transition-colors duration-200"
            >
              Download Health ID
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

