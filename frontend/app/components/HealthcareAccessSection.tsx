"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiUrl } from "../lib/api";

type Toast = {
  id: string;
  message: string;
  variant: "success" | "info" | "error";
};

function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[240] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`w-[320px] rounded-2xl border bg-white px-5 py-4 shadow-2xl ${
            t.variant === "success"
              ? "border-emerald-100"
              : t.variant === "error"
              ? "border-rose-100"
              : "border-slate-100"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                className={`text-sm font-black ${
                  t.variant === "success"
                    ? "text-emerald-700"
                    : t.variant === "error"
                    ? "text-rose-700"
                    : "text-slate-900"
                }`}
              >
                {t.variant === "success" ? "Success" : t.variant === "error" ? "Error" : "Info"}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-600 break-words">{t.message}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="h-9 w-9 shrink-0 rounded-2xl border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
              aria-label="Dismiss toast"
              title="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

type HealthcareFeature = {
  id: string;
  title: string;
  desc: string;
  icon: string;
};

type PatientProfile = {
  id?: number;
  patient_id: string;
  full_name: string;
  blood_group: string;
  ngo: number;
};

type NGOProfile = {
  id: number;
  name: string;
  is_verified?: boolean;
};

type ReferralNetwork = {
  target_hospital: string;
  specialty_required: string;
};

type Workshop = {
  id: number;
  title: string;
  expert_name: string;
  date: string;
  is_open: boolean;
};

type HealthcareAccessSectionProps = {
  patients?: PatientProfile[];
  ngos?: NGOProfile[];
  referrals?: ReferralNetwork[];
  workshops?: Workshop[];
};

export default function HealthcareAccessSection({
  patients = [],
  ngos = [],
  referrals = [],
  workshops = [],
}: HealthcareAccessSectionProps) {
  const [activeFeature, setActiveFeature] = useState<HealthcareFeature | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [isHealthIdFetching, setIsHealthIdFetching] = useState(false);
  const [healthIdPickerOpen, setHealthIdPickerOpen] = useState(false);
  const [selectedHealthIdPatientId, setSelectedHealthIdPatientId] = useState<string>("");
  const [healthIdData, setHealthIdData] = useState<{
    full_name: string;
    patient_id: string;
    blood_group: string;
    verified_by: string;
    age: number;
    last_checkup_date: string;
    qr_value: string;
  } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (message: string, variant: Toast["variant"] = "info") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const safeJson = async <T,>(url: string): Promise<T | null> => {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return null;
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.toLowerCase().includes("application/json")) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  };

  const hashString = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  };

  const computeAge = (seed: string) => 18 + (hashString(seed) % 45);

  const computeLastCheckupIso = (seed: string) => {
    const daysAgo = 1 + (hashString(seed + "|checkup") % 90);
    const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    return d.toISOString();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" });
  };

  const pickVerifiedPatient = (nextPatients: PatientProfile[], nextNgos: NGOProfile[]) => {
    const verifiedNgoIds = new Set(nextNgos.filter((n) => n.is_verified).map((n) => n.id));
    const verifiedPatients = nextPatients.filter((p) => verifiedNgoIds.has(p.ngo));

    const byName = (p: PatientProfile) => (p.full_name ?? "").toLowerCase();
    const kiara = verifiedPatients.find((p) => byName(p).includes("kiara")) ?? verifiedPatients.find((p) => byName(p).includes("sharma"));
    if (kiara) return kiara;
    if (verifiedPatients.length > 0) return verifiedPatients[0];
    return nextPatients[0] ?? null;
  };

  const generateHealthIdFromDb = async (targetPatientId?: string) => {
    try {
      setIsHealthIdFetching(true);
      const [dbPatients, dbNgos] = await Promise.all([
        safeJson<PatientProfile[]>(
          targetPatientId ? apiUrl(`/api/patients/?patient_id=${encodeURIComponent(targetPatientId)}`) : apiUrl("/api/patients/")
        ),
        safeJson<NGOProfile[]>(apiUrl("/api/ngos/")),
      ]);

      const effectivePatients = Array.isArray(dbPatients) ? dbPatients : patients;
      const effectiveNgos = Array.isArray(dbNgos) ? dbNgos : ngos;

      const chosen =
        targetPatientId
          ? effectivePatients.find((p) => p.patient_id === targetPatientId) ?? effectivePatients[0] ?? null
          : pickVerifiedPatient(effectivePatients, effectiveNgos);
      if (!chosen) {
        pushToast("No patient records found.", "error");
        setHealthIdData(null);
        return;
      }

      const full_name = chosen.full_name;
      const patient_id = chosen.patient_id;
      const blood_group = chosen.blood_group;
      const ngoName = effectiveNgos.find((n) => n.id === chosen.ngo)?.name ?? "Verified Partner NGO";
      const verified_by = ngoName;

      const age = computeAge(patient_id);
      const last_checkup_date = computeLastCheckupIso(patient_id);
      const qr_value = `medbridge|${patient_id}||${blood_group}`;

      setHealthIdData({
        full_name,
        patient_id,
        blood_group,
        verified_by,
        age,
        last_checkup_date,
        qr_value,
      });

      pushToast("Health ID details fetched successfully!", "success");
    } finally {
      setIsHealthIdFetching(false);
    }
  };

  const downloadHealthIdPdf = () => {
    const d = healthIdData;
    if (!d) return;
    const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>MedBridge Health ID - ${d.patient_id}</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 24px; }
            .card { border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px; }
            .meta { color: #334155; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; }
            h1 { margin: 10px 0 0; font-size: 22px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
            .box { border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px; background: #f8fafc; }
            .label { font-size: 10px; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; }
            .value { font-size: 14px; font-weight: 900; margin-top: 4px; color: #0f172a; }
            .hint { margin-top: 12px; font-size: 11px; color: #64748b; font-weight: 700; }
            @media print { button { display: none; } body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="meta">MedBridge Digital Health ID</div>
            <h1>${d.full_name}</h1>
            <div class="grid">
              <div class="box"><div class="label">Patient ID</div><div class="value">${d.patient_id}</div></div>
              <div class="box"><div class="label">Blood Group</div><div class="value">${d.blood_group}</div></div>
              <div class="box"><div class="label">Age</div><div class="value">${d.age}</div></div>
              <div class="box"><div class="label">Last Checkup</div><div class="value">${formatDate(d.last_checkup_date)}</div></div>
              <div class="box" style="grid-column: 1 / -1"><div class="label">Verified By</div><div class="value">${d.verified_by}</div></div>
              <div class="box" style="grid-column: 1 / -1"><div class="label">QR Payload</div><div class="value" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace">${d.qr_value}</div></div>
            </div>
            <div class="hint">Tip: Use your browser’s Print dialog and choose “Save as PDF”.</div>
          </div>
          <script>window.focus(); window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleExplore = () => {
    if (isSimulating || isHealthIdFetching) return;

    if (!selectedHealthIdPatientId) {
      setHealthIdPickerOpen(true);
      return;
    }

    setHealthIdPickerOpen(false);
    setShowCard(true);
    setIsSimulating(true);
    setHealthIdData(null);

    void (async () => {
      await generateHealthIdFromDb(selectedHealthIdPatientId);
      setIsSimulating(false);
    })();
  };

  useEffect(() => {
    setIsSimulating(false);
    setShowCard(false);
    setHealthIdPickerOpen(false);
    setSelectedHealthIdPatientId("");
  }, [activeFeature?.id]);

  const features: HealthcareFeature[] = [
    {
      id: "profiling",
      title: "Smart Patient Profiling",
      desc: "Digital records for paperless healthcare history.",
      icon: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
    },
    {
      id: "referral",
      title: "Referral Networks",
      desc: "Connecting local clinics to major city hospitals.",
      icon: "M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z",
    },
    {
      id: "awareness",
      title: "Awareness Workshops",
      desc: "Expert talks on preventive health and hygiene.",
      icon: "M12 18v-3m0 0h.008v.008H12V15Zm0-6a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm9 3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    },
  ];

  const patient = patients.length > 0 ? patients[0] : null;
  const verifiedNgoName =
    patient && ngos.length > 0 ? ngos.find((ngo) => ngo.id === patient.ngo)?.name ?? null : null;
  const referral = referrals.length > 0 ? referrals[0] : null;

  return (
    <section className="py-12 bg-white overflow-hidden min-h-fit lg:h-[80vh] flex items-center relative">
      {toasts.length > 0 && <Toasts toasts={toasts} onDismiss={dismissToast} />}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-50/50 -mr-20 -mt-20 blur-3xl opacity-60"></div>

      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        <div className="lg:col-span-6 relative flex justify-center order-2 lg:order-1 animate-float">
          <div className="relative rounded-[4rem] overflow-hidden border-[16px] border-slate-50 shadow-2xl transition-transform duration-700 hover:scale-[1.02] cursor-pointer">
            <img
              src="/handshaking.png"
              alt="Healthcare Access"
              className="w-full h-[520px] lg:h-[480px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent"></div>
          </div>

          <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-[280px]">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-4 w-4 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-black text-slate-950 uppercase tracking-widest">Live Data</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-bold">
              Encrypted patient monitoring for 50+ remote villages.
            </p>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-10 order-1 lg:order-2">
          <div className="space-y-3 opacity-0 animate-fade-in-up">
            <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] bg-blue-50 px-3 py-1 rounded-full w-fit block">
              Our Ecosystem
            </span>
            <h2 className="text-4xl lg:text-[45px] font-black text-slate-950 leading-[1.05] tracking-tighter">
              Empowering Lives Through <br className="hidden lg:block" />
              <span className="text-brand-blue">Direct Healthcare Access.</span>
            </h2>
            <p className="text-slate-500 text-sm font-medium max-w-lg">
              Our mission goes beyond delivering care&mdash;we bring trusted, digital healthcare access to every patient.
            </p>
          </div>

          <div className="space-y-5 pt-4">
            {features.map((item, index) => (
              <div
                key={item.id}
                onClick={() => setActiveFeature(item)}
                style={{ animationDelay: `${(index + 1) * 200}ms` }}
                className={`group relative flex gap-6 p-7 rounded-[2.8rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden shadow-sm opacity-0 animate-fade-in-up
                  ${
                    activeFeature?.id === item.id
                      ? "bg-blue-600 border-blue-600 shadow-xl shadow-blue-200 scale-[1.02] translate-x-2"
                      : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50 hover:-translate-y-1.5"
                  }`}
              >
                {activeFeature?.id === item.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 animate-ripple z-0 rounded-[2.8rem] opacity-30"></div>
                )}

                <div
                  className={`absolute left-0 top-1/4 bottom-1/4 w-1.5 bg-blue-600 rounded-r-full transition-all duration-500 transform 
                    ${
                      activeFeature?.id === item.id
                        ? "opacity-100"
                        : "opacity-0 -translate-x-full group-hover:opacity-100 group-hover:translate-x-0"
                    }`}
                ></div>

                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.2rem] transition-all duration-500 z-10
                  ${
                    activeFeature?.id === item.id
                      ? "bg-white text-blue-600 shadow-inner"
                      : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:scale-110 group-hover:rotate-3"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>

                <div
                  className={`flex flex-col justify-center z-10 transition-transform duration-500 ${
                    activeFeature?.id === item.id ? "" : "group-hover:translate-x-1"
                  }`}
                >
                  <h4
                    className={`text-xl font-black tracking-tight transition-colors duration-500 
                    ${activeFeature?.id === item.id ? "text-white" : "text-slate-950 group-hover:text-blue-600"}`}
                  >
                    {item.title}
                  </h4>
                  <p
                    className={`text-sm font-medium leading-relaxed transition-colors duration-500 
                    ${activeFeature?.id === item.id ? "text-blue-100" : "text-slate-500"}`}
                  >
                    {item.desc}
                  </p>
                </div>

                <div
                  className={`ml-auto flex items-center pr-2 transition-all duration-500 z-10
                    ${
                      activeFeature?.id === item.id
                        ? "opacity-100 text-white"
                        : "opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 text-blue-600"
                    }`}
                >
                  <div
                    className={`h-10 w-10 rounded-full border flex items-center justify-center
                        ${activeFeature?.id === item.id ? "border-white/30 bg-white/10" : "border-blue-200"}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeFeature && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 md:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setActiveFeature(null)}></div>
          <div className="relative w-full max-w-lg bg-white h-full rounded-[3.5rem] p-12 shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto">
            <button
              onClick={() => setActiveFeature(null)}
              className="absolute top-10 right-10 p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mt-20 space-y-10">
              <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10">
                  <path d={activeFeature.icon} />
                </svg>
              </div>
              <h3 className="text-4xl font-black text-slate-950 leading-tight camelcase tracking-tighter">{activeFeature.title}</h3>
              {activeFeature.id === "profiling" ? (
                <div className="space-y-6">
                  {!showCard ? (
                    <>
                      <p className="text-lg text-slate-600 font-medium leading-relaxed">
                        MedBridge creates a centralized digital vault. Click below to see how a Patient ID is generated.
                      </p>

                      {healthIdPickerOpen && (
                        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 space-y-3">
                          <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                            Kiske liye ID generate karni hai?
                          </p>
                          <select
                            value={selectedHealthIdPatientId}
                            onChange={(e) => setSelectedHealthIdPatientId(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-900"
                          >
                            <option value="" disabled>
                              Choose patient
                            </option>
                            {patients.map((p) => (
                              <option key={p.patient_id} value={p.patient_id}>
                                {p.full_name} ({p.patient_id})
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setHealthIdPickerOpen(false)}
                              className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={!selectedHealthIdPatientId}
                              onClick={handleExplore}
                              className="flex-1 rounded-2xl bg-blue-600 text-white py-3 text-sm font-black hover:bg-slate-800 transition-colors duration-200 disabled:opacity-60 disabled:hover:bg-blue-600"
                            >
                              Generate ID
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleExplore}
                        disabled={isSimulating || isHealthIdFetching}
                        className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors duration-200 disabled:bg-blue-400"
                      >
                        {isSimulating ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Generating Secure ID...
                          </span>
                        ) : (
                          selectedHealthIdPatientId ? "Generate ID" : "Generate ID (Choose Patient)"
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="animate-fade-in-up">
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
                        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-white/10 rounded-full blur-2xl"></div>

                        <div className="flex justify-between items-start relative z-10">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                              MedBridge Digital Health ID
                            </p>
                            <h4 className="text-2xl font-black mt-1">
                              {healthIdData?.full_name ?? (isHealthIdFetching ? "Loading..." : patient ? patient.full_name : "—")}
                            </h4>
                          </div>
                          <div className="bg-white p-2 rounded-xl text-slate-900 shadow-lg">
                            {isHealthIdFetching ? (
                              <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                                <svg className="animate-spin h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                  ></path>
                                </svg>
                              </div>
                            ) : healthIdData?.qr_value ? (
                              <img
                                alt="Health ID QR code"
                                className="w-14 h-14 rounded-lg bg-white"
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                                  healthIdData.qr_value
                                )}`}
                              />
                            ) : (
                              <div className="w-14 h-14 bg-slate-100 flex items-center justify-center border-2 border-slate-200 rounded-lg">
                                <svg className="w-8 h-8 opacity-50" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M3 3h4v4H3V3zm14 0h4v4h-4V3zM3 17h4v4H3v-4zm14 0h4v4h-4v-4zM8 3h8v2H8V3zM8 19h8v2H8v-2zM3 8h2v8H3V8zm19 0h-2v8h2V8z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
                          <div>
                            <p className="text-[9px] opacity-70 uppercase font-bold">Patient ID</p>
                            <p className="font-mono text-sm">{healthIdData?.patient_id ?? (isHealthIdFetching ? "Loading..." : patient ? patient.patient_id : "—")}</p>
                          </div>
                          <div>
                            <p className="text-[9px] opacity-70 uppercase font-bold">Blood Group</p>
                            <p className="font-bold text-sm">{healthIdData?.blood_group ?? (isHealthIdFetching ? "Loading..." : patient ? patient.blood_group : "—")}</p>
                          </div>
                          <div>
                            <p className="text-[9px] opacity-70 uppercase font-bold">Age</p>
                            <p className="font-bold text-sm">{healthIdData?.age ?? (isHealthIdFetching ? "Loading..." : computeAge(patient?.patient_id ?? "MB"))}</p>
                          </div>
                          <div>
                            <p className="text-[9px] opacity-70 uppercase font-bold">Last Checkup</p>
                            <p className="font-bold text-sm">
                              {isHealthIdFetching
                                ? "Loading..."
                                : formatDate(healthIdData?.last_checkup_date ?? computeLastCheckupIso(patient?.patient_id ?? "MB"))}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[9px] opacity-70 uppercase font-bold">Verified By</p>
                            <p className="font-bold text-sm">
                              {healthIdData?.verified_by ?? (isHealthIdFetching ? "Loading..." : verifiedNgoName ? verifiedNgoName : "—")}
                            </p>
                          </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-white/20 flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                          <p className="text-[10px] font-bold tracking-tight">Active Encrypted Record</p>
                        </div>
                      </div>

                      <button
                        onClick={downloadHealthIdPdf}
                        disabled={!healthIdData}
                        className="w-full mt-6 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-colors duration-200 disabled:opacity-60 disabled:hover:bg-blue-600"
                      >
                        Download Health ID (PDF)
                      </button>

                      <button
                        onClick={() => {
                          setShowCard(false);
                          setHealthIdPickerOpen(false);
                          setSelectedHealthIdPatientId("");
                          setHealthIdData(null);
                          setIsSimulating(false);
                        }}
                        className="w-full mt-3 py-4 text-slate-400 font-bold text-sm hover:text-slate-600"
                      >
                        Reset Simulation
                      </button>
                    </div>
                  )}
                </div>
              ) : activeFeature.id === "referral" ? (
                <div className="space-y-8 animate-fade-in-up">
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">
                    Connecting rural healthcare centers with top-tier city hospitals for advanced treatments.
                  </p>

                  <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 relative overflow-hidden">
                    <div className="flex flex-col gap-12 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M3 21h18M3 10l9-7 9 7v11H3V10z" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-black text-slate-900 text-sm">Village Health Center</h5>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider italic">
                            Primary Care &amp; Diagnosis
                          </p>
                        </div>
                      </div>

                      <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-slate-200">
                        <div className="absolute top-0 w-full h-1/2 bg-blue-600 animate-bounce transition-all"></div>
                      </div>

                      <div className="flex items-center gap-4 ml-8">
                        <div className="h-10 w-10 rounded-xl bg-white border-2 border-blue-100 text-blue-600 flex items-center justify-center shadow-md animate-pulse">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                            <path d="M12 8v4l3 3" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-black text-blue-600 text-sm">MedBridge Hub</h5>
                          <p className="text-[10px] text-slate-400 font-bold">Secure Data Transfer...</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-bold text-sm">
                            {referral ? referral.target_hospital : "City General Hospital"}
                          </h5>
                          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">
                            {referral && referral.specialty_required
                              ? `${referral.specialty_required} READY`
                              : "ADVANCED TREATMENT READY"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/hospitals"
                    className="block w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-colors duration-200 shadow-xl text-center"
                  >
                    View Connected Hospitals
                  </Link>
                </div>
              ) : activeFeature.id === "awareness" ? (
                <div className="space-y-8 animate-fade-in-up">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-lg text-slate-600 font-medium leading-relaxed">
                        Educating communities through expert-led health camps and sanitation drives.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Upcoming Sessions
                    </h5>
                    {workshops.length > 0 ? (
                      workshops.map((workshop) => {
                        const workshopDate = new Date(`${workshop.date}T00:00:00`);
                        const monthLabel = workshopDate.toLocaleString("default", { month: "short" });
                        return (
                          <div
                            key={workshop.id}
                            className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4"
                          >
                            <div className="bg-white p-2 rounded-lg shadow-sm text-center min-w-[60px]">
                              <p className="text-[10px] font-bold text-blue-600 uppercase">{monthLabel}</p>
                              <p className="text-xl font-black text-slate-800">{workshopDate.getDate()}</p>
                            </div>
                            <div className="flex-1">
                              <h5 className="font-bold text-slate-900 leading-tight">{workshop.title}</h5>
                              <p className="text-xs text-slate-500">By {workshop.expert_name}</p>
                            </div>
                            <span
                              className={`text-[9px] font-bold px-2 py-1 rounded-full ${
                                workshop.is_open
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {workshop.is_open ? "OPEN" : "FULL"}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-slate-400 py-4 italic">No upcoming workshops scheduled.</p>
                    )}
                  </div>

                  <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                      <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.657-5.657l1.414-1.414m-14.142 0l1.414 1.414m0 11.314l-1.414 1.414m11.314 0l-1.414-1.414" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-black relative z-10">NGO Admin?</h4>
                    <p className="text-blue-100 text-sm font-medium mt-2 relative z-10 leading-relaxed">
                      Publish your next health awareness workshop directly to our community network.
                    </p>
                    <Link
                      href={apiUrl("/admin/core/workshop/add/")}
                      target="_blank"
                      className="mt-6 w-full py-3 bg-white text-blue-600 font-bold rounded-xl text-center hover:shadow-lg transition-all block"
                    >
                      Create New Workshop Entry
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">
                    Detailed data collection methods for {activeFeature.title} ensuring privacy and speed.
                  </p>
                  <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-xl active:scale-95">
                    Explore This Service
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
