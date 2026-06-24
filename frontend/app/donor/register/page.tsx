"use client";
import React, { useState } from "react";
import {
  ShieldAlert, User, Phone, MapPin, Droplets,
  CheckCircle, AlertCircle, ChevronRight, Activity,
  Mail, Shield, Navigation, Loader
} from "lucide-react";
import axios from "axios";
import { apiUrl } from "@/lib/api";


const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CITIES = ["Indore", "Bhopal", "Ujjain", "Gwalior", "Jabalpur", "Other"];
//const API_URL = "http://127.0.0.1:8000/api/volunteer-donors/";
const API_URL = apiUrl("/api/volunteer-donors/");
export default function DonorRegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    blood_group: "", city: "", age: "",
    whatsapp_consent: false,
    lat: "", lng: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // 📍 Location detect karo
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Location not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        }));
        setLocationDetected(true);
        setLocationLoading(false);
      },
      (err) => {
        setError("Could not detect location. Please allow location access.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validate = () => {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!form.phone.trim() || form.phone.length < 10) return "Please enter a valid 10-digit phone number.";
    if (!form.email.trim() || !form.email.includes("@")) return "Please enter a valid email address.";
    if (!form.blood_group) return "Please select your blood group.";
    if (!form.city) return "Please select your city.";
    if (!form.age || Number(form.age) < 18 || Number(form.age) > 65) return "Age must be between 18 and 65 years.";
    if (!form.whatsapp_consent) return "Please agree to receive emergency alerts to proceed.";
    return null;
  };

  const handleSubmit = async () => {
    setError("");
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      await axios.post(API_URL, {
        name: form.name,
        phone: form.phone,
        email: form.email,
        blood_group: form.blood_group,
        city: form.city,
        is_available: true,
        whatsapp_consent: form.whatsapp_consent,
        lat: form.lat || null,
        lng: form.lng || null,
      });
      setStep(2);
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-[45px] p-14 max-w-md w-full shadow-xl border border-slate-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-slate-200 to-emerald-500" />
          <div className="w-20 h-20 bg-emerald-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle className="text-emerald-500" size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic mb-2">Registered!</h2>
          <p className="text-slate-500 font-bold text-sm mb-8 leading-relaxed">
            Your request has been sent to the NGO team.<br />
            You will start receiving emergency alerts once approved.
          </p>
          <div className="bg-slate-50 rounded-[24px] p-6 border border-slate-100 text-left space-y-3 mb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Registration Summary</p>
            {[
              { label: "Name", value: form.name },
              { label: "Blood Group", value: form.blood_group },
              { label: "City", value: form.city },
              { label: "Phone", value: `+91 ${form.phone}` },
              { label: "Email", value: form.email },
              { label: "Location", value: locationDetected ? "📍 Detected ✅" : "Not provided" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-xs font-bold text-slate-400">{item.label}</span>
                <span className="text-xs font-black text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-3 bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] font-bold text-amber-700 text-left leading-relaxed">
              The NGO team will verify your details. Your account will be activated only after approval.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // REGISTRATION FORM
  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center gap-3 shadow-sm">
        <button onClick={() => window.history.back()} className="p-2 hover:bg-slate-100 rounded-xl transition-all mr-2">
          <ChevronRight className="rotate-180 text-slate-500" size={20} />
        </button>
        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
          <ShieldAlert className="text-white" size={22} />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-[-0.05em]">SOS RADAR</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Activity size={10} className="text-blue-600 animate-pulse" /> Donor Registration Portal
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Hero Card */}
        <div className="bg-white rounded-[40px] p-10 mb-8 relative overflow-hidden shadow-sm border border-blue-100">
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-blue-50 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-50 rounded-full" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-blue-300 to-blue-400" />
          <div className="relative z-10">
            <span className="inline-block text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-full">
              Volunteer Donor Program
            </span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-tight mb-3">
              Your Blood,<br /><span className="text-blue-500">Someone's Life.</span>
            </h2>
            <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-sm">
              Register as a donor and we'll alert you instantly when your blood group is needed at a nearby hospital.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-slate-100 to-blue-500" />
          <h3 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter mb-8">Personal Details</h3>

          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name"
                  className="w-full pl-11 pr-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none text-slate-800 font-bold text-sm transition-all placeholder:text-slate-300" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <span className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm pointer-events-none">+91</span>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit number"
                  maxLength={10} type="tel"
                  className="w-full pl-20 pr-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none text-slate-800 font-bold text-sm transition-all placeholder:text-slate-300" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input name="email" value={form.email} onChange={handleChange} placeholder="yourname@email.com" type="email"
                  className="w-full pl-11 pr-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none text-slate-800 font-bold text-sm transition-all placeholder:text-slate-300" />
              </div>
            </div>

            {/* Blood Group + Age */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Blood Group</label>
                <div className="relative">
                  <Droplets size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  <select name="blood_group" value={form.blood_group} onChange={handleChange}
                    className="w-full pl-11 pr-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none text-slate-800 font-bold text-sm transition-all appearance-none cursor-pointer">
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Age</label>
                <input name="age" value={form.age} onChange={handleChange} placeholder="18–65" type="number" min={18} max={65}
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none text-slate-800 font-bold text-sm transition-all placeholder:text-slate-300" />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">City</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                <select name="city" value={form.city} onChange={handleChange}
                  className="w-full pl-11 pr-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none text-slate-800 font-bold text-sm transition-all appearance-none cursor-pointer">
                  <option value="">Select your city</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* 📍 LOCATION DETECT - NEW */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Your Location <span className="text-slate-300">(Optional - helps find nearby donors)</span>
              </label>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locationLoading || locationDetected}
                className={`w-full py-4 rounded-2xl border-2 font-black text-sm transition-all flex items-center justify-center gap-3 ${
                  locationDetected
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700 cursor-default"
                    : locationLoading
                    ? "border-blue-200 bg-blue-50 text-blue-400 cursor-wait"
                    : "border-dashed border-slate-300 bg-slate-50 text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {locationDetected ? (
                  <>
                    <CheckCircle size={18} className="text-emerald-500" />
                    Location Detected! ({form.lat}, {form.lng})
                  </>
                ) : locationLoading ? (
                  <>
                    <Loader size={18} className="animate-spin text-blue-500" />
                    Detecting Location...
                  </>
                ) : (
                  <>
                    <Navigation size={18} />
                    Detect My Location
                  </>
                )}
              </button>
              {!locationDetected && !locationLoading && (
                <p className="text-[10px] font-bold text-slate-400 mt-2 text-center">
                  📍 Allow location access when browser asks
                </p>
              )}
            </div>

            {/* Consent */}
            <div
              onClick={() => setForm((p) => ({ ...p, whatsapp_consent: !p.whatsapp_consent }))}
              className={`cursor-pointer rounded-[24px] p-6 border-2 transition-all ${
                form.whatsapp_consent ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  form.whatsapp_consent ? "bg-emerald-500 border-emerald-500" : "border-slate-300 bg-white"
                }`}>
                  {form.whatsapp_consent && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 mb-1">Emergency Alert Consent</p>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    I agree to receive email & SMS emergency alerts when my blood group is needed at a nearby hospital. My details will only be used for blood emergencies.
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Shield size={11} className="text-emerald-600" />
                    <p className="text-[10px] font-black text-emerald-600">Your data is encrypted and stored securely</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 bg-rose-50 rounded-2xl p-4 border border-rose-100">
                <AlertCircle size={16} className="text-rose-500 shrink-0" />
                <p className="text-sm font-bold text-rose-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>
              ) : (
                <>Register as Donor<ChevronRight size={18} /></>
              )}
            </button>

            <p className="text-center text-[11px] font-bold text-slate-400">
              Your details will be verified by the NGO team after registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
