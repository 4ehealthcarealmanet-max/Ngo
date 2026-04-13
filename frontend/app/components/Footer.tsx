import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#FAFBFD] text-slate-800 pt-20 pb-10 border-t border-slate-100 mt-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          
          {/* COLUMN 1: LOGO & SOCIALS */}
          <div className="md:col-span-4 flex flex-col items-start gap-6">
            <a href="/" className="flex items-center gap-2">
              <img src="/MedBridgeLogo.png" alt="MedBridge Logo" className="h-10 w-auto" />
            </a>
            <p className="text-[#6C757D] text-base leading-relaxed max-w-sm">
              Connect with verified doctors, book appointments instantly, and manage your prescriptions and medical records securely — all in one platform.
            </p>
            
            <div className="flex items-center gap-2.5 bg-[#E8FBF4] text-[#12B886] px-4 py-1.5 rounded-full border border-[#D3F9EB]">
              <div className="h-2 w-2 rounded-full bg-[#12B886]"></div>
              <span className="text-[11px] font-bold uppercase tracking-[0.15em]">SYSTEMS OPERATIONAL</span>
            </div>
            
            <div className="flex gap-4 mt-4">
              {/* Social Icons Mapping */}
              {[
                { name: 'Twitter', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { name: 'Facebook', path: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z' },
                // ... (Aapke baaki social paths yahan rahenge)
              ].map((social) => (
                <a key={social.name} href="#" className="group h-11 w-11 flex items-center justify-center rounded-2xl bg-[#F8F9FA] border border-[#F1F3F5] transition-all duration-300 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-1">
                  <svg className="h-5 w-5 text-[#ADB5BD] transition-colors duration-300 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.path}/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* COLUMN 2 & 3: LINKS */}
          <div className="md:col-span-3 flex flex-col gap-6 md:pl-10 pt-2">
            <h4 className="font-bold text-slate-950 uppercase tracking-[0.2em] text-[11px]">MEDICAL CARE</h4>
            <ul className="space-y-4 text-[#5A636D] text-[15px] font-medium">
              {["Find Doctors", "Book Appointments", "Video Consultation", "Digital Prescriptions", "Medical Records"].map((item) => (
                <li key={item} className="group flex items-center gap-2 cursor-pointer transition-all duration-300">
                  <span className="opacity-0 -ml-4 text-blue-600 font-bold transition-all duration-300 group-hover:opacity-100 group-hover:ml-0">–</span>
                  <a href="#" className="hover:text-blue-600 transition-colors group-hover:translate-x-1 duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 flex flex-col gap-6 pt-2">
            <h4 className="font-bold text-slate-950 uppercase tracking-[0.2em] text-[11px]">PLATFORM</h4>
            <ul className="space-y-4 text-[#5A636D] text-[15px] font-medium">
              {["About MedBridge", "For Doctors", "Health Articles", "Contact Support", "Help Center"].map((item) => (
                <li key={item} className="group flex items-center gap-2 cursor-pointer transition-all duration-300">
                  <span className="opacity-0 -ml-4 text-blue-600 font-bold transition-all duration-300 group-hover:opacity-100 group-hover:ml-0">–</span>
                  <a href="#" className="hover:text-blue-600 transition-colors group-hover:translate-x-1 duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: NEWSLETTER */}
          <div className="md:col-span-3 flex flex-col gap-6 pt-2">
            <h4 className="font-bold text-slate-950 uppercase tracking-[0.2em] text-[11px]">NEWSLETTER</h4>
            <p className="text-[#6C757D] text-[15px] font-medium leading-relaxed">Get health tips and medical insights delivered to your inbox.</p>
            <div className="flex gap-2.5 items-center p-2.5 bg-white rounded-full border border-[#E9ECEF] focus-within:border-blue-400 transition-all shadow-inner">
              <input type="email" placeholder="email@example.com" className="bg-transparent pl-3 py-1 text-[15px] w-full outline-none text-slate-900 font-medium" />
              <button className="bg-slate-900 p-3 rounded-full text-white hover:bg-slate-700 transition active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-[13px] font-semibold text-[#6C757D]">
            © 2026 MedBridge Healthcare Group. | <span className="text-[#ADB5BD]">Built for better living.</span>
          </p>
          <div className="flex gap-6 text-[11px] font-bold text-slate-700 uppercase tracking-[0.15em]">
            <a href="#" className="hover:text-blue-600 transition-colors">TERMS OF SERVICE</a>
            <a href="#" className="hover:text-blue-600 transition-colors">PRIVACY POLICY</a>
            <a href="#" className="hover:text-blue-600 transition-colors">COOKIE SETTINGS</a>
          </div>
        </div>
      </div>
    </footer>
  );
}