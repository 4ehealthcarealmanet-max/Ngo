import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">

          {/* COLUMN 1: LOGO & SOCIALS */}
          <div className="md:col-span-4 flex flex-col items-start gap-6">
            <a href="/" className="flex items-center gap-2">
              <img src="/pathyatech-logo.png" alt="Pathyatech Logo" className="h-10 w-auto" />
            </a>
            <p className="text-slate-500 text-base leading-relaxed max-w-sm font-medium">
              Connecting underprivileged communities with verified NGO-supported doctors and medical camps. Secure, transparent, and accessible healthcare for all.
            </p>
            <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-100">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] font-bold uppercase tracking-[0.15em]">Systems Operational</span>
            </div>
          </div>

          {/* COLUMN 2: NAVIGATION */}
          <div className="md:col-span-2 flex flex-col gap-6 pt-2">
            <h4 className="font-black text-slate-950 uppercase tracking-[0.2em] text-[11px]">Navigate</h4>
            <ul className="space-y-4">
              {[
                { label: "Home", href: "/" },
                { label: "Events", href: "/#events" },
                { label: "Programs", href: "/#programs" },
                { label: "NGO", href: "/#ngo" },
                { label: "About Us", href: "/#about" },
              ].map((item) => (
                <li key={item.label} className="group flex items-center gap-2 cursor-pointer">
                  <span className="opacity-0 -ml-4 text-blue-600 font-bold transition-all duration-300 group-hover:opacity-100 group-hover:ml-0">–</span>
                  <a href={item.href} className="text-slate-500 font-medium text-[15px] hover:text-blue-600 transition-colors group-hover:translate-x-1 duration-300">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: PROGRAMMES */}
          <div className="md:col-span-3 flex flex-col gap-6 pt-2">
            <h4 className="font-black text-slate-950 uppercase tracking-[0.2em] text-[11px]">Programmes</h4>
            <ul className="space-y-4">
              {[
                { label: "Education", href: "/programmes/education" },
                { label: "Women Empowerment", href: "/programmes/women-empowerment" },
                { label: "Maternal Health", href: "/programmes/maternal-health" },
                { label: "Eye Care", href: "/programmes/eye-care-(opthalmology)" },
                { label: "Vaccination Drives", href: "/programmes/vaccination-drives" },
              ].map((item) => (
                <li key={item.label} className="group flex items-center gap-2 cursor-pointer">
                  <span className="opacity-0 -ml-4 text-blue-600 font-bold transition-all duration-300 group-hover:opacity-100 group-hover:ml-0">–</span>
                  <a href={item.href} className="text-slate-500 font-medium text-[15px] hover:text-blue-600 transition-colors group-hover:translate-x-1 duration-300">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: NEWSLETTER */}
          <div className="md:col-span-3 flex flex-col gap-6 pt-2">
            <h4 className="font-black text-slate-950 uppercase tracking-[0.2em] text-[11px]">Newsletter</h4>
            <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
              Get health tips and medical insights delivered to your inbox.
            </p>
            <div className="flex gap-2.5 items-center p-2.5 bg-slate-50 rounded-full border border-slate-200 focus-within:border-blue-400 transition-all">
              <input
                type="email"
                placeholder="email@example.com"
                className="bg-transparent pl-3 py-1 text-[15px] w-full outline-none text-slate-900 font-medium placeholder:text-slate-400"
              />
              <button className="bg-blue-600 p-3 rounded-full text-white hover:bg-blue-700 transition active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                <div className="h-8 w-8 bg-blue-50 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                contact@pathyatech.com
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                <div className="h-8 w-8 bg-blue-50 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0.0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                </div>
                +91 98765 43210
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[13px] font-semibold text-slate-400">
            © 2026 Pathyatech Healthcare. | <span className="text-slate-300">Built for better living.</span>
          </p>
          <div className="flex gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Cookie Settings</a>
          </div>
        </div>

      </div>
    </footer>
  );
}