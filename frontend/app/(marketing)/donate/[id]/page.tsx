"use client";
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, Lock, Heart, ChevronLeft, CreditCard, 
  Smartphone, Building2, CheckCircle2, Info, ArrowRight, Zap 
} from 'lucide-react';

// Sabhi 8 Programmes ka Detailed & Dynamic Data
const donateData = {
  "education": { 
    title: "Healthcare Education", 
    basePrice: 200, // 200 per student
    impactText: (count: number) => `Providing health literacy to ${count} students.`,
    desc: "Your contribution helps print workbooks and provide hygiene kits for school children."
  },
  "women-empowerment": { 
    title: "Women Empowerment", 
    basePrice: 500, // 500 per day of training
    impactText: (count: number) => `Funding ${count} days of vocational training for a woman.`,
    desc: "Helps in certified nursing assistant courses and health leadership workshops."
  },
  "grassroots-support": { 
    title: "Grassroots Support", 
    basePrice: 1000, // 1000 per family
    impactText: (count: number) => `Supplying essential meds to ${count} families for a month.`,
    desc: "Covers logistics and procurement of life-saving drugs for rural centers."
  },
  "disaster-response": { 
    title: "Disaster Response", 
    basePrice: 2500, // 2500 per kit
    impactText: (count: number) => `Providing ${count} emergency medical relief kits.`,
    desc: "Ensures immediate aid like clean water, bandages, and basic meds during crises."
  },
  "maternal-health": { 
    title: "Maternal Health Care", 
    basePrice: 5000, // 5000 per delivery support
    impactText: (count: number) => `Supporting ${count} safe institutional deliveries.`,
    desc: "Ensures professional doctors and sterile environments for expecting mothers."
  },
  "eye-care-(opthalmology)": { 
    title: "Eye Care (Ophthalmology)", 
    basePrice: 3500, // 3500 per surgery
    impactText: (count: number) => `Restoring vision for ${count} people via Cataract Surgery.`,
    desc: "Covers pre-op tests, surgery, Intraocular Lens, and post-op care."
  },
  "mental-health-support": { 
    title: "Mental Health Support", 
    basePrice: 800, // 800 per session
    impactText: (count: number) => `Facilitating ${count} professional counseling sessions.`,
    desc: "Supports hiring certified psychologists and maintaining helplines."
  },
  "vaccination-drives": { 
    title: "Vaccination Drives", 
    basePrice: 300, // 300 per child
    impactText: (count: number) => `Immunizing ${count} children against life-threatening diseases.`,
    desc: "Funds cold-chain logistics and trained nursing staff for remote camps."
  },
};

export default function DonationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const program = donateData[id as keyof typeof donateData] || donateData["education"];
  const [amount, setAmount] = useState("2000");
  const [method, setMethod] = useState("upi");

  // Dynamic Calculation Logic
  // Amount ko basePrice se divide karke count nikalna (Kam se kam 1 hamesha dikhega)
  const calculatedImpact = Math.max(1, Math.floor(Number(amount) / program.basePrice));

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-10 font-sans">
      <div className="max-w-6xl mx-auto px-6">
        
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-all mb-8 group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Program
        </button>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Section: Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                  <Heart size={24} fill="currentColor" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Secure Donation</h1>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-10">
                <p className="text-blue-900 font-medium">
                  Supporting: <span className="font-black underline decoration-blue-300 underline-offset-4">{program.title}</span>
                </p>
              </div>

              <div className="space-y-6">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Amount</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["500", "1000", "2000", "5000"].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`py-5 rounded-2xl font-black transition-all border-2 ${
                        amount === amt 
                        ? "border-blue-600 bg-blue-600 text-white shadow-lg" 
                        : "border-slate-100 text-slate-400 hover:border-slate-200 bg-slate-50/50"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <input 
                  type="number"
                  className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 outline-none font-bold text-slate-900"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Other Amount"
                />
              </div>

              <div className="mt-12 space-y-6">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Payment Method</label>
                <div className="grid grid-cols-3 gap-4">
                  {['upi', 'card', 'net'].map((m) => (
                    <button 
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                        method === m ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'
                      }`}
                    >
                      {m === 'upi' ? <Smartphone size={20} /> : m === 'card' ? <CreditCard size={20} /> : <Building2 size={20} />}
                      <span className="font-bold text-xs uppercase">{m}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full mt-12 bg-slate-950 text-white py-6 rounded-3xl font-black text-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3">
                Donate Now <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Right Section: Dynamic Impact Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
              <div className="relative z-10">
                <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <Zap size={20} fill="white" />
                </div>
                <h3 className="text-blue-100 font-black uppercase tracking-widest text-[10px] mb-2">Immediate Result</h3>
                <p className="text-2xl font-bold leading-tight mb-4 italic">
                  {/* Yahan logic apply ho raha hai */}
                  "With ₹{amount || '0'}, you are {program.impactText(calculatedImpact)}"
                </p>
                <p className="text-blue-100/80 text-sm leading-relaxed">
                  {program.desc}
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h4 className="text-slate-900 font-black flex items-center gap-2 mb-6">
                <ShieldCheck className="text-emerald-500" size={20} />
                Transparency Matters
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle2 size={18} className="text-blue-600 mt-1" />
                  <p className="text-slate-500 text-xs"><strong>80G Tax Benefit:</strong> Claim tax deductions on every donation.</p>
                </div>
                <div className="flex items-start gap-4">
                  <Lock size={18} className="text-blue-600 mt-1" />
                  <p className="text-slate-500 text-xs"><strong>Secure:</strong> SSL encrypted and PCI compliant transactions.</p>
                </div>
              </div>
              {/* Certification Footer - Isse Right Column ke end mein paste karein */}
            {/* Certification Footer - Isse Right Column ke end mein paste karein */}
            <div className="p-8 bg-white/50 rounded-[2.5rem] border border-dashed border-slate-200 text-center mt-6">
            <div className="flex justify-center gap-4 mb-4 opacity-40 grayscale">
                {/* Aap yahan apne real logo images daal sakte hain */}
                <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center">
                    <ShieldCheck size={20} className="text-white" />
                </div>
                <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center">
                    <Lock size={20} className="text-white" />
                </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                REGISTERED NGO: MEDBRIDGE GLOBAL FOUNDATION <br/>
                REG NO: MB-2026-IND-882
            </p>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
