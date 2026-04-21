"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import HealthcareAccessSection from "../components/HealthcareAccessSection";
import Footer from "../components/Footer";
import { apiUrl } from "../lib/api";
import WorkshopRegistrationModal from "../components/WorkshopRegistrationModal";


interface NGO {
  id: number;
  name: string;
  city: string;
  is_verified: boolean;
  service_type: string;
}

interface PatientProfile {
  id: number;
  ngo: number;
  patient_id: string;
  full_name: string;
  blood_group: string;
  contact_number?: string;
  created_at: string;
}

interface Workshop {
  id: number;
  ngo: number;
  title: string;
  expert_name: string;
  date: string;
  is_open: boolean;
  description: string;
  full_description?: string;
  image_url?: string;
}

interface ReferralNetwork {
  id: number;
  source_ngo: number;
  target_hospital: string;
  specialty_required: string;
  status: string;
  created_at: string;
}

function LandingPageContent() {
  const router = useRouter(); 
  const searchParams = useSearchParams();
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ecosystemData, setEcosystemData] = useState<{
    ngos: NGO[];
    patients: PatientProfile[];
    referrals: ReferralNetwork[];
    workshops: Workshop[];
  }>({
    ngos: [],
    patients: [],
    referrals: [],
    workshops: [],
  });
  
  // Search and Filtering States
  const [cityInput, setCityInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const autoRegisterOpenedRef = useRef(false);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);

  const fetchJsonOrNull = async <T,>(url: string): Promise<T | null> => {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return null;

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.toLowerCase().includes("application/json")) return null;

      return (await res.json()) as T;
    } catch {
      return null;
    }
  };

  // API Integration Logic (Remains Intact)
  const fetchNgos = (city = "", query = "", shouldScroll = false) => {
    setIsLoading(true);
    const url = apiUrl(`/api/ngos/?city=${encodeURIComponent(city)}&q=${encodeURIComponent(query)}`);
    
    fetchJsonOrNull<NGO[]>(url)
      .then((data) => {
        if (Array.isArray(data)) setNgos(data);
        setIsLoading(false);
        if (shouldScroll && resultsSectionRef.current) {
          resultsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setIsLoading(false);
      });
  };

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [allNgos, patients, referrals, workshops] = await Promise.all([
        fetchJsonOrNull<NGO[]>(apiUrl("/api/ngos/")),
        fetchJsonOrNull<PatientProfile[]>(apiUrl("/api/patients/")),
        fetchJsonOrNull<ReferralNetwork[]>(apiUrl("/api/referral-networks/")),
        fetchJsonOrNull<Workshop[]>(apiUrl("/api/workshops/")),
      ]);

      setEcosystemData((prev) => ({
        ngos: Array.isArray(allNgos) ? allNgos : prev.ngos,
        patients: Array.isArray(patients) ? patients : prev.patients,
        referrals: Array.isArray(referrals) ? referrals : prev.referrals,
        workshops: Array.isArray(workshops) ? workshops : prev.workshops,
      }));

      if (Array.isArray(allNgos)) setNgos(allNgos);
      console.log("Full Ecosystem Data Loaded!");
      setIsLoading(false);
    } catch (err) {
      console.error("Backend se connect nahi ho paya:", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (autoRegisterOpenedRef.current) return;
    const registerIdRaw = searchParams.get("register");
    if (!registerIdRaw) return;

    const registerId = Number.parseInt(registerIdRaw, 10);
    if (!Number.isFinite(registerId)) return;

    const workshop = ecosystemData.workshops.find((w) => w.id === registerId);
    if (!workshop) return;

    autoRegisterOpenedRef.current = true;
    openRegisterModal(workshop);
  }, [searchParams, ecosystemData.workshops]);

  useEffect(() => {
    if (!isRegisterModalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsRegisterModalOpen(false);
        setSelectedWorkshop(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isRegisterModalOpen]);

  const openRegisterModal = (workshop: Workshop) => {
    if (!workshop.is_open) return;
    setSelectedWorkshop(workshop);
    setIsRegisterModalOpen(true);
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
    setSelectedWorkshop(null);
  };

  const handleRegistrationSuccess = (message: string) => {
    setRegistrationSuccess(message);
    window.setTimeout(() => setRegistrationSuccess(null), 2500);
  };

  const handleSearch = () => {
    fetchNgos(cityInput, searchInput, true);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-brand-slate pt-20">
      {registrationSuccess && (
        <div className="fixed top-24 right-6 z-[60]">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 shadow-xl">
            <p className="text-sm font-black text-emerald-700">Success</p>
            <p className="text-sm font-semibold text-emerald-700/80">{registrationSuccess}</p>
          </div>
        </div>
      )}

      <WorkshopRegistrationModal
        open={isRegisterModalOpen}
        workshop={selectedWorkshop}
        onClose={closeRegisterModal}
        onSuccess={handleRegistrationSuccess}
      />

      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-white pt-8 pb-20 px-6 overflow-hidden min-h-[calc(100vh-80px)] flex items-start lg:items-center">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT CONTENT COLUMN */}
          <div className="lg:col-span-7 text-left space-y-8 pt-4">
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[1.0] text-slate-950">
              Bridging the Gap <br />
              <span className="text-brand-blue">to Better Health.</span>
            </h1>
            
            <p className="max-w-2xl text-[17px] text-slate-600 font-medium leading-relaxed">
              Connecting underprivileged communities with verified NGO-supported doctors and medical camps. Secure, transparent, and accessible healthcare for all.
            </p>

            {/* SEARCH CONTAINER (Double Input for Full API Support) */}
            <div className="max-w-2xl rounded-[20px] border border-slate-200 bg-white p-2 shadow-xl shadow-slate-100 flex flex-col md:flex-row items-center gap-2">
              {/* City Input */}
              <div className="flex flex-1 items-center px-4 py-2 w-full border-r border-slate-100">
                <svg className="w-5 h-5 text-[#ADB5BD] mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <input 
                  type="text" 
                  placeholder="Your City" 
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="bg-transparent outline-none w-full text-base font-semibold text-slate-900 placeholder:text-[#ADB5BD]" 
                />
              </div>
              {/* Service/Query Input */}
              <div className="flex flex-1 items-center px-4 py-2 w-full">
                <svg className="w-5 h-5 text-[#ADB5BD] mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                <input 
                  type="text" 
                  placeholder="Search Service..." 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="bg-transparent outline-none w-full text-base font-semibold text-slate-900 placeholder:text-[#ADB5BD]" 
                />
              </div>
              <button 
                onClick={handleSearch}
                className="rounded-xl bg-brand-blue px-10 py-3 text-base font-bold text-white hover:bg-blue-700 transition shadow-lg w-full md:w-auto"
              >
                Search
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
                <h3 className="text-3xl font-black text-slate-950 tracking-tight">{ecosystemData.ngos.length}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Active NGOs</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
                <h3 className="text-3xl font-black text-slate-950 tracking-tight">{ecosystemData.patients.length}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Verified Patients</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
                <h3 className="text-3xl font-black text-slate-950 tracking-tight">{ecosystemData.workshops.length}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Live Workshops</p>
              </div>
            </div>

            {/* VERTICAL 3-POINT LIST (Icons + Text Bottom) */}
            <div className="pt-4 flex items-start justify-start gap-12">
              {[
                { title: "Browse Health Camps", icon: "map-marker", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                { title: "Verified NGO Doctors", icon: "clinic-medical", color: "bg-blue-50 text-brand-blue border-blue-100" },
                { title: "Health Articles", icon: "heart-beat", color: "bg-purple-50 text-purple-600 border-purple-100" }
              ].map((point) => (
                <div key={point.title} className="group flex flex-col items-center text-center gap-2 w-28 cursor-pointer">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${point.color} border transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md`}>
                    {point.icon === "map-marker" && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" /><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" /></svg>}
                    {point.icon === "heart-beat" && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>}
                    {point.icon === "clinic-medical" && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>}
                  </div>
                  <span className="text-[12px] font-bold text-slate-700 leading-tight group-hover:text-brand-blue transition-colors">
                    {point.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT IMAGE COLUMN (Smooth Zoom Effect Added) */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center pt-4 group">
            <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-[16px] border-slate-50 max-w-[460px] animate-float transition-all duration-700 ease-in-out hover:scale-110 cursor-pointer">
              <img
                src="/ngocamp.png"
                alt="NGO Camp"
                className="w-full h-[480px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none"></div>
            </div>

            <div
              className="absolute -top-6 -left-8 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex items-center gap-4 animate-float z-20"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="relative h-12 w-12 rounded-full bg-[#E8FBF4] text-[#12B886] flex items-center justify-center border border-[#D3F9EB]">
                <div className="absolute inset-0 rounded-full bg-[#12B886] animate-ping opacity-20"></div>
                <svg className="relative w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#12B886] uppercase tracking-[0.2em] flex items-center gap-1.5 mb-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#12B886] animate-pulse"></span>
                  Live Now
                </p>
                <p className="text-sm font-black text-slate-900 tracking-tight">Health Camp in Indore</p>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* ================= FINAL ATTEMPT: NGO MODULES SECTION ================= */}
<section className="relative py-20 bg-white overflow-hidden border-y border-slate-100">
  
  {/* BACKGROUND IMAGE - Absolute Layer */}
  <div className="absolute inset-0 z-0 pointer-events-none">
    <img 
      src="/bgimage.png" 
      alt="Background" 
      className="w-full h-full object-cover opacity-0.1" 
      style={{ mixBlendMode: 'multiply' }} 
    />
  </div>

  {/* GRADIENT OVERLAY - To ensure readability */}
  <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white/80 z-[1]"></div>

  <div className="mx-auto max-w-7xl px-6 relative z-10">
    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
      
      {/* LEFT: TEXT CONTENT */}
      <div className="lg:w-1/3 text-left">
        <span className="text-brand-blue font-bold tracking-[0.15em] uppercase text-[10px] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
          NGO Ecosystem
        </span>
        <h2 className="text-4xl font-black mt-5 text-slate-950 tracking-tighter leading-tight">
          Core <span className="text-brand-blue">Pillars</span>
        </h2>
        <p className="text-slate-500 mt-4 text-[16px] font-medium leading-relaxed">
          Our three core modules designed to make healthcare accessible and digital.
        </p>
      </div>

      {/* RIGHT: SYMMETRICAL PODS */}
      <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
        
        {/* POD 1: DONATION DRIVE */}
        <div className="group relative bg-white/95 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-emerald-200/40 hover:border-emerald-200 transition-all duration-500 animate-float">
          <div className="flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <h4 className="text-sm font-black text-slate-900">Donation Drive</h4>
          </div>
        </div>

        {/* POD 2: CSR PARTNERS */}
        <div className="group relative bg-white/95 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-blue-200/40 hover:border-blue-200 transition-all duration-500 animate-float" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center mb-4 group-hover:bg-brand-blue group-hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
            <h4 className="text-sm font-black text-slate-900">CSR Partners</h4>
          </div>
        </div>

        {/* POD 3: PATIENT VAULT */}
        <div className="group relative bg-white/95 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-purple-200/40 hover:border-purple-200 transition-all duration-500 animate-float" style={{ animationDelay: '0.4s' }}>
          <div className="flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <h4 className="text-sm font-black text-slate-900">Patient Vault</h4>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>

      <HealthcareAccessSection
        patients={ecosystemData.patients}
        ngos={ecosystemData.ngos}
        referrals={ecosystemData.referrals}
        workshops={ecosystemData.workshops}
      />

      {/* ================= WORKSHOPS (Live from Backend) ================= */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div className="space-y-3">
              <span className="text-brand-blue font-bold tracking-[0.2em] uppercase text-[10px] shadow-sm bg-blue-50/50 px-4 py-2 rounded-full border border-blue-100/50 w-fit block">
                Community Outreach
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight">Upcoming Workshops</h2>
              <p className="text-slate-500 text-sm font-medium max-w-2xl">
                Live sessions fetched from the backend API for real-time updates.
              </p>
            </div>
          </div>

          {ecosystemData.workshops.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 text-slate-600 font-medium">
              No workshops found yet. Add some from Django Admin and refresh.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ecosystemData.workshops.map((workshop) => (
                <div
                  key={workshop.id}
                  className="group bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-lg font-black text-slate-950 group-hover:text-brand-blue transition-colors">
                      {workshop.title}
                    </h4>
                    <span
                      className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border shrink-0 ${
                        workshop.is_open
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-slate-100 text-slate-400 border-slate-200"
                      }`}
                    >
                      {workshop.is_open ? "Open" : "Full"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500 font-medium line-clamp-2 overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
                    {workshop.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => router.push(`/workshops/${workshop.id}`)}
                    className="mt-2 text-xs font-black text-brand-blue hover:underline underline-offset-4 w-fit"
                  >
                    Read More...
                  </button>

                  <div className="mt-4 space-y-2 text-sm text-slate-600 font-medium">
                    <p>
                      <span className="text-slate-400 font-bold">Expert:</span> {workshop.expert_name}
                    </p>
                    <p>
                      <span className="text-slate-400 font-bold">Date:</span> {workshop.date}
                    </p>
                  </div>

                  <button
                    disabled={!workshop.is_open}
                    onClick={() => openRegisterModal(workshop)}
                    className="mt-6 w-full py-4 rounded-2xl font-black text-sm transition-colors shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600"
                  >
                    {workshop.is_open ? "Register Now" : "Registration Closed"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= NEW UNIQUE 'OUR IMPACT' SECTION (8 points) ================= */}
<section className="py-32 bg-brand-light/40 relative overflow-hidden">
  
  {/* BACKGROUND IMAGE - Absolute Layer */}
  <div className="absolute inset-0 z-0 pointer-events-none">
    <img 
      src="/bgimage.png" 
      alt="Background" 
      className="w-full h-full object-cover opacity-1.5" 
      style={{ mixBlendMode: 'multiply' }} 
    />
  </div>

  {/* GRADIENT OVERLAY - To ensure readability */}
  <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white/80 z-[1]"></div>

  {/* Absolute background element for unique shape */}
  <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-50/70 border border-blue-100/50"></div>

  <div className="mx-auto max-w-7xl px-6 relative z-10">
    <div className="text-center mb-20 max-w-3xl mx-auto">
  {/* Professional Pill Badge (Synced) */}
  <span className="text-brand-blue font-bold tracking-[0.2em] uppercase text-[10px] shadow-sm bg-blue-50/50 px-4 py-2 rounded-full border border-blue-100/50">
    Strategic Initiatives
  </span>
  
  {/* Main Heading (Synced) */}
  <h2 className="text-4xl md:text-5xl font-black mt-6 text-slate-950 leading-tight camelcase tracking-tight">
    Our <span className="text-brand-blue">Programmes</span>
  </h2>
  
  {/* Subtext (Synced) */}
  <p className="text-slate-500 mt-6 text-[18px] leading-relaxed font-medium">
    Driving sustainable change through targeted healthcare interventions and community-led development initiatives.
  </p>
</div>

    {/* Impact Points Grid (8 Columns) */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
      {[
        { title: "Education", text: "Providing primary health literacy and child education", icon: "book-open" },
        { title: "Women Empowerment", text: "Skill training for health workers and caregivers", icon: "user-group" },
        { title: "Grassroots Support", text: "Strengthening local healthcare networks", icon: "home" },
        { title: "Disaster Response", text: "Swift deployment of medical aid during crises", icon: "alert-triangle" },
        { title: "Maternal Health", text: "Pre-natal and post-natal care support", icon: "heart" },
        { title: "Eye Care (Opthalmology)", text: "Subsidized checkups and vision restorative surgeries", icon: "eye" },
        { title: "Mental Health Support", text: "Accessible counseling and psychological services", icon: "chat-bubble" },
        { title: "Vaccination Drives", text: "Immunization camps for preventable diseases", icon: "syringe" }
      ].map((impact, index) => (
        <Link
          key={impact.title}
          href={`/programmes/${impact.title.toLowerCase().replace(/\s+/g, "-")}`}
          className="block"
        >
          <div
            className="group cursor-pointer bg-white p-9 rounded-[28px] border border-slate-100 shadow-lg hover:shadow-2xl hover:bg-blue-600 hover:border-blue-600 hover:-translate-y-2.5 transition-all duration-500 animate-in fade-in-up ease-out h-full flex flex-col min-h-[340px]"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-white group-hover:text-blue-600 transition-all duration-300 shadow-inner group-hover:shadow-none group-hover:scale-110">
              {/* Using basic Tailwind icons structure for professional look */}
              {impact.icon === "book-open" && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" /></svg>}
              {impact.icon === "user-group" && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>}
              {impact.icon === "home" && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12 11.204 3.045c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>}
              {impact.icon === "alert-triangle" && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.052 3.378c.866-1.5 3.03-1.5 3.896 0l7.355 12.748Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.008v.008H12V15.75Z" /></svg>}
              {impact.icon === "heart" && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>}
              {impact.icon === "eye" && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>}
              {impact.icon === "chat-bubble" && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H15.75M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337c-.57-.152-1.2-.04-1.713.32l-1.006.703a1.125 1.125 0 0 1-1.757-.93V18.5c0-.58-.224-1.151-.636-1.589A8.25 8.25 0 0 1 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>}
              {impact.icon === "syringe" && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 10.5v3m0-1.5h3m0 0h10.5m0 0h4.5" /><rect x="6.75" y="10.5" width="10.5" height="3" rx="1.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 11.25v1.5m2.25-1.5v1.5m2.25-1.5v1.5" /></svg>}
            </div>
            <h3 className="text-2xl font-black mb-4 text-slate-950 group-hover:text-white transition-all duration-300 min-h-[64px] leading-tight">
              {impact.title}
            </h3>
            <p className="text-slate-600 leading-relaxed font-medium group-hover:text-white/80 transition-all duration-300 flex-1">
              {impact.text}
            </p>
          </div>
        </Link>
      ))}
    </div>
  </div>
</section>

      {/* 4. NGO LIST SECTION */}
      <section ref={resultsSectionRef} className="bg-brand-light py-24 px-6 scroll-mt-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex items-center gap-4">
            <span className="h-10 w-2 rounded-full bg-brand-blue"></span>
            <h2 className="text-3xl font-black text-slate-900">Verified NGO Partners Near You</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-3xl bg-slate-200"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {ngos.length > 0 ? (
                ngos.map((ngo) => (
                  <div key={ngo.id} className="group rounded-3xl bg-white p-10 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="mb-8 flex justify-between items-start">
                      <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                        </svg>
                      </div>
                      {ngo.is_verified && (
                        <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2 text-slate-900">{ngo.name}</h3>
                    <p className="text-sm font-semibold text-slate-400 mb-8 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-brand-blue">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      {ngo.city}
                    </p>

                    <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                      <span className="text-xs font-bold text-brand-blue bg-blue-50 px-4 py-2 rounded-xl">
                        {ngo.service_type}
                      </span>
                      <button
                        type="button"
                        onClick={() => router.push(`/ngos/${ngo.id}`)}
                        className="text-sm font-bold text-slate-900 hover:text-brand-blue transition-colors group-hover:underline decoration-2 underline-offset-4"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-slate-800">No NGOs found</h3>
                  <p className="text-slate-500">Try searching for a different city or medical service.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}


import { Suspense } from "react";

export default function LandingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
      </div>
    }>
      <LandingPageContent />
    </Suspense>
  );
}
