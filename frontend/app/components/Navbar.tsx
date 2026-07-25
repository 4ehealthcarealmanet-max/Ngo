"use client";
import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";
export default function Navbar() {
  const router = useRouter();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [email, setEmail] = useState("");
const [registerStep, setRegisterStep] = useState('role')
  const [password, setPassword] = useState("");
const [loginError, setLoginError] = useState("");

const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoginError("");

  // Admin hardcoded
  if (email === "admin@gmail.com" && password === "admin123") {
    router.push("/admin");
    setIsSignInOpen(false);
    return;
  }

  // Doctor hardcoded
  if (email === "doctor@gmail.com" && password === "doctor123") {
    router.push("/doctor-dashboard");
    setIsSignInOpen(false);
    return;
  }

  // Hospital login API
  try {
const res = await fetch(apiUrl("/api/hospitals/login/"), {      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (res.ok) {
      localStorage.setItem('hospital_token', data.token)
      localStorage.setItem('hospital_id', String(data.hospital_id))
      localStorage.setItem('hospital_name', data.hospital_name)
      setIsSignInOpen(false)
      router.push('/hospital-dashboard')
      return;
    } else {
      setLoginError(data.error || 'Invalid email or password.')
    }
  } catch (err) {
    setLoginError('Server se connect nahi ho pa raha!')
  }
};
// Component ke top mein ye state add karo
const [hospitalForm, setHospitalForm] = useState({
  name: '',
  license_no: '',
  location: '',
  contact: '',
  hospital_type: '',
  specialty: '',
  email: '',
  password: '',
  latitude: '',
  longitude: '',
})
const [hospitalLoading, setHospitalLoading] = useState(false)
const [hospitalError, setHospitalError] = useState('')
const [hospitalSuccess, setHospitalSuccess] = useState(false)
const [locationCaptured, setLocationCaptured] = useState(false)

const captureLocation = () => {
    if (!navigator.geolocation) {
      setHospitalError('Geolocation not supported by your browser')
      return
    }
    setHospitalError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setHospitalForm(prev => ({
          ...prev,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6)
        }))
        setLocationCaptured(true)
      },
      (err) => setHospitalError('Location access denied: ' + err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }
const handleHospitalRegister = async (e) => {
  e.preventDefault()
  setHospitalLoading(true)
  setHospitalError('')

  if (!hospitalForm.lat || !hospitalForm.lng) {
    setHospitalError('Please click "Use my current location" to share your hospital\'s location before registering.')
    setHospitalLoading(false)
    return
  }

  try {
const res = await fetch(apiUrl("/api/hospitals/register/"), {      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hospitalForm)
    })
    
    const data = await res.json()
    
    if (res.ok) {
      setHospitalSuccess(true)
    } else {
      setHospitalError(data.email?.[0] || data.license_no?.[0] || data.lat?.[0] || data.lng?.[0] || 'Something went wrong!')
    }
  } catch (err) {
    setHospitalError('Server se connect nahi ho pa raha!')
  } finally {
    setHospitalLoading(false)
  }
}
const [ngoForm, setNgoForm] = useState({
  name: '',
  registration_number: '',
  contact_email: '',
  city: '',
  service_type: '',
  email: '',
  password: '',
})
const [ngoLoading, setNgoLoading] = useState(false)
const [ngoError, setNgoError] = useState('')
const [ngoSuccess, setNgoSuccess] = useState(false)

const handleNgoRegister = async (e: React.FormEvent) => {
  e.preventDefault()
  setNgoLoading(true)
  setNgoError('')

  try {
const res = await fetch(apiUrl("/api/ngos/register/"), {      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ngoForm)
    })

    const data = await res.json()

    if (res.ok) {
      setNgoSuccess(true)
    } else {
      setNgoError(data.email?.[0] || data.registration_number?.[0] || 'Something went wrong!')
    }
  } catch (err) {
    setNgoError('Server se connect nahi ho pa raha!')
  } finally {
    setNgoLoading(false)
  }
}
  return (
    <>
      {/* ================= NAVBAR START ================= */}
      <nav className="glass-header fixed top-0 left-0 right-0 z-[90] bg-white/80 backdrop-blur-md border-b border-slate-100">

     <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* LOGO */}
          <a href="/" className="flex items-center group transition-transform active:scale-95">
            <img
              src="/pathyatech-logo.png"
              alt="pathyatech Logo"
              className="h-[46px] md:h-[50px] w-auto object-contain"
              draggable={false}
            />
          </a>

          {/* CENTER LINKS (Exactly as you sent) */}
         {/* CENTER LINKS - UPDATED */}
         <div className="hidden items-center gap-1 md:flex">
  <a href="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors px-4 py-2 rounded-lg">
    Home
  </a>
  <a href="/#events" className="text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors px-4 py-2 rounded-lg">
    Events
  </a>
 <a href="/#programs" className="text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors px-4 py-2 rounded-lg">
  Programs
</a>
  <a href="/#ngo" className="text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors px-4 py-2 rounded-lg">
    NGO
  </a>
  <a href="/#about" className="text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors px-4 py-2 rounded-lg">
    About Us
  </a>
</div>

          {/* ACTION BUTTONS */}
          {/* ================= UPDATED ACTION BUTTONS (EXACT MATCH) ================= */}
            <div className="flex items-center gap-3">
            
            {/* Original Sign In Style */}
            <button 
                onClick={() => setIsSignInOpen(true)}
                className="text-sm font-bold text-slate-800 px-5 py-2.5 rounded-full hover:bg-slate-100 transition-all"
            >
                Sign In
            </button>

            {/* Original Get Started Style with Arrow and Brand Blue */}
            <button 
               id="navbar-register-btn"
                onClick={() => setIsRegisterOpen(true)}
                className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
            >
                Get Started
                {/* Exact Arrow Icon from your reference */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
            </button>

            </div>
        </div>
      </nav>

     {isRegisterOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
    <div 
      className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
      onClick={() => { setIsRegisterOpen(false); setRegisterStep('role'); }}
    ></div>

    <div className="relative w-full max-w-2xl transform overflow-hidden rounded-[45px] bg-white p-12 shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15)] transition-all border border-slate-100 animate-in zoom-in duration-300 max-h-[95vh] overflow-y-auto custom-scrollbar">
      
      {/* Close Button */}
      <button 
        onClick={() => { setIsRegisterOpen(false); setRegisterStep('role'); }} 
        className="absolute right-10 top-10 text-slate-400 hover:text-slate-900 transition-all hover:rotate-90 duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Back Button - Role selection ke alawa sab pe dikhega */}
      {registerStep !== 'role' && (
        <button
          onClick={() => setRegisterStep('role')}
          className="absolute left-10 top-10 text-slate-400 hover:text-slate-900 transition-all duration-300 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
      )}

      {/* Logo */}
      <div className="text-center mb-10">
        <div className="mx-auto flex h-20 w-auto items-center justify-center mb-6">
          <img src="/pathyatech-logo.png" alt="PathyaTech Logo" draggable={false} />
        </div>
      </div>

      {/* ===== STEP 1: ROLE SELECTION ===== */}
      {registerStep === 'role' && (
        <div>
          <h2 className="text-4xl font-black text-slate-950 tracking-tight leading-tight text-center">
            Join <span className="text-blue-600">PathyaTech</span>
          </h2>
          <p className="text-slate-500 text-lg mt-4 font-medium text-center mb-12">
            Select how you want to register
          </p>

          <div className="grid grid-cols-1 gap-4">
            {/* NGO */}
            <button
              onClick={() => setRegisterStep('ngo')}
              className="flex items-center gap-6 p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 transition-all group"
            >
              <span className="text-4xl">🏢</span>
              <div className="text-left">
                <p className="font-black text-slate-900 text-lg group-hover:text-blue-600">NGO / Healthcare Organization</p>
                <p className="text-slate-500 text-sm mt-1">Connect your healthcare resources to rural communities</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 ml-auto text-slate-300 group-hover:text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {/* Hospital */}
            <button
              onClick={() => setRegisterStep('hospital')}
              className="flex items-center gap-6 p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 transition-all group"
            >
              <span className="text-4xl">🏥</span>
              <div className="text-left">
                <p className="font-black text-slate-900 text-lg group-hover:text-blue-600">Hospital / Clinic</p>
                <p className="text-slate-500 text-sm mt-1">Request blood and medical resources from NGOs</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 ml-auto text-slate-300 group-hover:text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

          
          </div>

          <div className="mt-10 text-center pt-8 border-t border-slate-100">
            <p className="text-base font-bold text-slate-400">
              Already part of our network?{' '}
              <button onClick={() => { setIsRegisterOpen(false); setIsSignInOpen(true); }} className="text-blue-600 hover:underline underline-offset-8">
                Sign In
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ===== STEP 2: NGO FORM ===== */}
     {registerStep === 'ngo' && (
  <div>
    <h2 className="text-4xl font-black text-slate-950 tracking-tight leading-tight text-center">
      Partner with <span className="text-blue-600">PathyaTech</span>
    </h2>
    <p className="text-slate-500 text-lg mt-4 font-medium text-center mb-10">
      Empower rural communities by connecting your healthcare resources.
    </p>

    {ngoSuccess ? (
      <div className="text-center py-10">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">Registration Successful!</h3>
        <p className="text-slate-500">Your NGO is pending admin verification. We'll notify you soon.</p>
        <button
          onClick={() => { setIsRegisterOpen(false); setRegisterStep('role'); setNgoSuccess(false); }}
          className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all"
        >
          Close
        </button>
      </div>
    ) : (
      <form className="space-y-8" onSubmit={handleNgoRegister}>

        {ngoError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-6 py-4 text-red-600 font-bold text-sm">
            ⚠️ {ngoError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Organization Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Health First Foundation"
              value={ngoForm.name}
              onChange={(e) => setNgoForm({...ngoForm, name: e.target.value})}
              className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Registration ID <span className="text-slate-400 normal-case font-medium">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. NGO-998877"
              value={ngoForm.registration_number}
              onChange={(e) => setNgoForm({...ngoForm, registration_number: e.target.value})}
              className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Official Email</label>
            <input
              type="email"
              required
              placeholder="contact@organization.org"
              value={ngoForm.email}
              onChange={(e) => setNgoForm({...ngoForm, email: e.target.value, contact_email: e.target.value})}
              className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">City</label>
            <input
              type="text"
              required
              placeholder="e.g. Bhopal"
              value={ngoForm.city}
              onChange={(e) => setNgoForm({...ngoForm, city: e.target.value})}
              className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Primary Medical Service</label>
          <div className="relative">
            <select
              required
              value={ngoForm.service_type}
              onChange={(e) => setNgoForm({...ngoForm, service_type: e.target.value})}
              className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all appearance-none cursor-pointer shadow-sm"
            >
              <option value="">Select Service Category</option>
              <option>Maternal Healthcare</option>
              <option>Vaccination & Immunization</option>
              <option>Mental Health Support</option>
              <option>Eye Care (Ophthalmology)</option>
              <option>Dental Checkups</option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Password</label>
          <input
            type="password"
            required
            placeholder="Create a strong password"
            value={ngoForm.password}
            onChange={(e) => setNgoForm({...ngoForm, password: e.target.value})}
            className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm placeholder:text-slate-400"
          />
        </div>

        <button
          type="submit"
          disabled={ngoLoading}
          className="w-full bg-blue-600 text-white py-5 rounded-[22px] font-black text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1.5 transition-all active:scale-95 mt-6 disabled:opacity-50"
        >
          {ngoLoading ? 'Registering...' : 'Create NGO Account'}
        </button>
      </form>
    )}
  </div>
)}

      {/* ===== STEP 3: HOSPITAL FORM ===== */}
    
{registerStep === 'hospital' && (
  <div>
    <h2 className="text-4xl font-black text-slate-950 tracking-tight leading-tight text-center">
      Register <span className="text-blue-600">Hospital</span>
    </h2>
    <p className="text-slate-500 text-lg mt-4 font-medium text-center mb-10">
      Join our network to request blood and medical resources.
    </p>

    {/* Success Message */}
    {hospitalSuccess ? (
      <div className="text-center py-10">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">Registration Successful!</h3>
        <p className="text-slate-500">Your hospital account is pending admin approval. We'll notify you soon.</p>
        <button 
          onClick={() => { setIsRegisterOpen(false); setRegisterStep('role'); setHospitalSuccess(false); }}
          className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all"
        >
          Close
        </button>
      </div>
    ) : (
      <form className="space-y-8" onSubmit={handleHospitalRegister}>
        
        {/* Error Message */}
        {hospitalError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-6 py-4 text-red-600 font-bold text-sm">
            ⚠️ {hospitalError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Hospital Name</label>
            <input 
              type="text" 
              placeholder="e.g. City Medical Center" 
              value={hospitalForm.name}
              onChange={(e) => setHospitalForm({...hospitalForm, name: e.target.value})}
              className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm placeholder:text-slate-400" 
            />
          </div>
          <div className="space-y-3">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">License No.</label>
            <input 
              type="text" 
              placeholder="e.g. LIC-2024-001" 
              value={hospitalForm.license_no}
              onChange={(e) => setHospitalForm({...hospitalForm, license_no: e.target.value})}
              className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm placeholder:text-slate-400" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Location</label>
            <input 
              type="text" 
              placeholder="e.g. Bhopal, MP" 
              value={hospitalForm.location}
              onChange={(e) => setHospitalForm({...hospitalForm, location: e.target.value})}
              className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm placeholder:text-slate-400" 
            />
            <button
                type="button"
                onClick={captureLocation}
                className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                📍 {locationCaptured ? 'Location captured ✓' : 'Use my current location'}
              </button>
          </div>
          <div className="space-y-3">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Contact</label>
            <input 
              type="text" 
              placeholder="e.g. 9999999999" 
              value={hospitalForm.contact}
              onChange={(e) => setHospitalForm({...hospitalForm, contact: e.target.value})}
              className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm placeholder:text-slate-400" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Hospital Type</label>
            <div className="relative">
              <select 
                value={hospitalForm.hospital_type}
                onChange={(e) => setHospitalForm({...hospitalForm, hospital_type: e.target.value})}
                className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all appearance-none cursor-pointer shadow-sm"
              >
                <option value="">Select Type</option>
                <option value="govt">Government</option>
                <option value="private">Private</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Specialty</label>
            <input 
              type="text" 
              placeholder="e.g. General / Cardiology" 
              value={hospitalForm.specialty}
              onChange={(e) => setHospitalForm({...hospitalForm, specialty: e.target.value})}
              className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm placeholder:text-slate-400" 
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Official Email</label>
          <input 
            type="email" 
            placeholder="hospital@email.com" 
            value={hospitalForm.email}
            onChange={(e) => setHospitalForm({...hospitalForm, email: e.target.value})}
            className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm placeholder:text-slate-400" 
          />
        </div>

        <div className="space-y-3">
          <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Password</label>
          <input 
            type="password" 
            placeholder="Create a strong password" 
            value={hospitalForm.password}
            onChange={(e) => setHospitalForm({...hospitalForm, password: e.target.value})}
            className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm placeholder:text-slate-400" 
          />
        </div>

        <button 
          type="submit"
          disabled={hospitalLoading}
          className="w-full bg-blue-600 text-white py-5 rounded-[22px] font-black text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1.5 transition-all active:scale-95 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {hospitalLoading ? 'Registering...' : 'Register Hospital'}
        </button>
      </form>
    )}
  </div>
)}
   

    </div>
  </div>
)}

      {/* ================= SIGN IN MODAL ================= */}
        {isSignInOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSignInOpen(false)}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md transform overflow-hidden rounded-[40px] bg-white p-10 shadow-2xl transition-all border border-slate-100 animate-in zoom-in duration-300">
            
            {/* Close Button */}
            <button 
                onClick={() => setIsSignInOpen(false)} 
                className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Top Icon Area */}
            <div className="text-center mb-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back</h2>
                <p className="text-slate-500 text-sm mt-3 font-medium">Access your healthcare dashboard</p>
            </div>

            <form className="space-y-6" onSubmit={handleLoginSubmit}>
                {/* Email Input with Icon */}
                <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Email Address</label>
                <div className="relative group">
                    <input 
                    type="email" 
                    required 
                    placeholder="e.g. admin@gmail.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all pr-12" 
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                </div>
                </div>

                {/* Password Input with Icon */}
                <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Password</label>
                <div className="relative group">
                    <input 
                      type="password" 
                      required 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all pr-12" 
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                </div>
                </div>
          {loginError && (
            <p className="text-sm font-bold text-rose-600 bg-rose-50 px-4 py-3 rounded-2xl">
              {loginError}
            </p>
          )}
                {/* Action Button */}
                <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 mt-4">
                Sign In
                </button>
            </form>

            {/* Bottom Text */}
            <div className="mt-10 text-center">
                <p className="text-sm font-bold text-slate-500">
                New to our platform? <button onClick={() => {setIsSignInOpen(false); setIsRegisterOpen(true);}} className="text-blue-600 hover:underline underline-offset-4">Create Account</button>
                </p>
            </div>
            </div>
        </div>
        )}
    </>
  );
}
