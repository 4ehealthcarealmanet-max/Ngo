"use client";
import React, { useState } from 'react';
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [email, setEmail] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@gmail.com") router.push("/admin");
    else if (email === "doctor@gmail.com") router.push("/doctor-dashboard");
    else router.push("/dashboard");
    setIsSignInOpen(false);
  };

  return (
    <>
      {/* ================= NAVBAR START ================= */}
<nav className="glass-header fixed top-0 left-0 right-0 z-[90] bg-white/80 backdrop-blur-md border-b border-slate-100">        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
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

      {/* ================= REGISTER MODAL ================= */}
{isRegisterOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
    {/* Backdrop with stronger blur */}
    <div 
      className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
      onClick={() => setIsRegisterOpen(false)}
    ></div>

    {/* Modal Content - Wider & More Spaced */}
    <div className="relative w-full max-w-2xl transform overflow-hidden rounded-[45px] bg-white p-12 shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15)] transition-all border border-slate-100 animate-in zoom-in duration-300 max-h-[95vh] overflow-y-auto custom-scrollbar">
      
      {/* Close Button - Clean & Larger */}
      <button 
        onClick={() => setIsRegisterOpen(false)} 
        className="absolute right-10 top-10 text-slate-400 hover:text-slate-900 transition-all hover:rotate-90 duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* ================= UPDATED TOP BRAND HEADER WITH LOGO ================= */}
      <div className="text-center mb-12">
        {/* Yahan humne text ko replace karke Logo lagaya hai */}
        <div className="mx-auto flex h-20 w-auto items-center justify-center mb-10 transition-transform active:scale-95">
          {/* Exact same logo path as Navbar */}
          <img
            src="/pathyatech-Logo.png"
            alt="MedBridge Logo"
            //className="h-14 w-auto object-contain shadow-lg p-2 bg-white"
            draggable={false}
          />
        </div>

        <h2 className="text-4xl font-black text-slate-950 tracking-tight leading-tight">
          Partner with <span className="text-blue-600">PathyaTech</span>
        </h2>
        <p className="text-slate-500 text-lg mt-4 font-medium max-w-md mx-auto leading-relaxed">
          Empower rural communities by connecting your healthcare resources.
        </p>
      </div>

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        
        {/* ROW 1: GRID INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Organization Name</label>
            <input 
              type="text" 
              placeholder="e.g. Health First Foundation" 
              className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm placeholder:text-slate-400" 
            />
          </div>
          <div className="space-y-3">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Registration ID</label>
            <input 
              type="text" 
              placeholder="e.g. NGO-998877" 
              className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm placeholder:text-slate-400" 
            />
          </div>
        </div>

        {/* EMAIL INPUT WITH ICON */}
        <div className="space-y-3">
          <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Official Email Address</label>
          <div className="relative group">
            <input 
              type="email" 
              placeholder="contact@organization.org" 
              className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all pr-14 shadow-sm placeholder:text-slate-400" 
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
        </div>

        {/* SERVICE CATEGORY DROPDOWN */}
        <div className="space-y-3">
          <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Primary Medical Service</label>
          <div className="relative">
            <select className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all appearance-none cursor-pointer shadow-sm">
              <option className="text-slate-400">Select Service Category</option>
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

        {/* SUBMIT BUTTON */}
        <button className="w-full bg-blue-600 text-white py-5 rounded-[22px] font-black text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1.5 transition-all active:scale-95 mt-6">
          Create NGO Account
        </button>
      </form>

      {/* FOOTER TEXT */}
      <div className="mt-12 text-center pt-8 border-t border-slate-50">
        <p className="text-base font-bold text-slate-400">
          Already part of our network? <button onClick={() => {setIsRegisterOpen(false); setIsSignInOpen(true);}} className="text-blue-600 hover:underline underline-offset-8">Sign In</button>
        </p>
      </div>
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
                    className="w-full rounded-2xl bg-slate-50 border-2 border-transparent px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all pr-12" 
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                </div>
                </div>

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
