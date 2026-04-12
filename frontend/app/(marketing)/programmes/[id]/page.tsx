"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Target, Lightbulb, ArrowRight, Activity, Users, ShieldCheck, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
const programmesData = {
  "education": {
    title: "Healthcare Education & Literacy",
    impact: "5000+ Students",
    image: "/education.jpg",
    intro: "Education is the primary vaccine against preventable diseases. We are building a foundation of health-conscious citizens.",
    detail: "Our Comprehensive Health Education Program (CHEP) goes beyond basic hygiene. We integrate clinical knowledge into school curriculums, focusing on adolescent health, nutritional science, and mental well-being. By empowering students with the 'Why' behind medical practices, we create a ripple effect where children become health ambassadors within their families. This initiative includes interactive digital learning modules and hands-on first-aid training, ensuring that the next generation is equipped to handle medical emergencies and maintain long-term wellness standards in their communities.",
    challenge: "Lack of structured health literacy in early education leads to a lifelong cycle of poor hygiene and late-stage disease diagnosis.",
    solution: "Deploying a specialized health curriculum in rural schools, supported by certified medical educators and interactive learning tools.",
    points: ["Evidence-based health curriculum", "Sanitary & Hygiene kit distribution", "Certified Teacher training (ToT)", "Student health ambassador program"]
  },
  "women-empowerment": {
    title: "Women’s Health & Empowerment",
    impact: "2500+ Women Trained",
    image: "/women.jpg",
    intro: "When you empower a woman with health skills, you secure the health of an entire village.",
    detail: "This program is designed to transform rural women into 'Arogya Sakhi' (Health Friends). We provide intensive vocational training in basic nursing, diagnostic screening, and maternal assistance. By professionalizing their innate caregiving roles, we provide them with financial independence and a position of authority in local healthcare decisions. These trained women act as the first line of defense, identifying early symptoms of chronic illnesses and bridging the gap between remote households and specialized medical facilities. It is a holistic approach to gender equality through healthcare leadership.",
    challenge: "Societal barriers and lack of professional skills prevent women from participating in the healthcare economy and making informed health choices.",
    solution: "A 6-month certified vocational module focusing on paramedical skills, financial literacy, and community health management.",
    points: ["Paramedical vocational training", "Micro-entrepreneurship health kits", "Leadership & Advocacy workshops", "Peer-to-peer counseling networks"]
  },
  "grassroots-support": {
    title: "Grassroots Healthcare Infrastructure",
    impact: "120+ Village Clinics",
    image: "/support.jpg",
    intro: "Strengthening the backbone of rural healthcare through technology and resource mobilization.",
    detail: "Our Grassroots Support initiative is a systemic intervention aimed at upgrading 'Last-Mile' health centers. We focus on transforming under-equipped village clinics into 'Smart Health Posts' by providing essential medical hardware, steady supply chains for life-saving drugs, and high-speed digital connectivity for telemedicine. By establishing a robust Hub-and-Spoke model, we ensure that a patient in a remote village has the same access to a specialist’s opinion as someone in a metropolitan city. This program significantly reduces the cost of travel and lost wages for the rural poor while improving clinical outcomes through early intervention.",
    challenge: "Geographical isolation and infrastructure decay lead to 'Medical Deserts' where basic healthcare is hours away.",
    solution: "Digital transformation of rural clinics and the establishment of a logistics network for consistent medicine and equipment supply.",
    points: ["Telemedicine hardware installation", "Essential medicine supply chain", "Solar-powered clinic upgrades", "Emergency referral protocols"]
  },
  "disaster-response": {
    title: "Emergency & Disaster Response",
    impact: "50+ Emergency Deployments",
    image: "/disaster.jpg",
    intro: "In a crisis, time is the difference between life and death. We ensure medical aid arrives within the golden hour.",
    detail: "The MedBridge Disaster Response Unit (MDRU) is a high-readiness task force specialized in rapid medical deployment. Whether it's natural calamities or public health emergencies, our teams are equipped with portable Level-2 trauma centers and mobile pharmacies. We operate on a 'Zero-Delay' protocol, ensuring that medical relief reached affected areas within 24 hours. Beyond immediate aid, we focus on post-disaster rehabilitation, including disease surveillance to prevent outbreaks and psychological trauma support for survivors. Our data-driven deployment strategy uses predictive modeling to stockpile resources in high-risk zones before a disaster even strikes.",
    challenge: "Traditional disaster relief is often delayed by logistics, leading to high mortality rates in the immediate aftermath of a crisis.",
    solution: "Pre-positioned medical stockpiles and a 24/7 rapid response team trained in wilderness and emergency medicine.",
    points: ["24-Hour rapid deployment teams", "Mobile surgical & ICU units", "Epidemic surveillance systems", "Community first-responder training"]
  },
  "maternal-health": {
    title: "Maternal & Neonatal Excellence",
    impact: "1200+ Mothers Supported",
    image: "/maternalhealth.png",
    intro: "Every mother deserves a safe delivery, and every child deserves a healthy start to life.",
    detail: "Our Maternal Health program is a comprehensive 1000-day care initiative that tracks a mother's journey from conception to the child’s second birthday. We provide high-quality antenatal checkups, specialized nutritional supplementation (to combat anemia), and ensure institutional delivery in safe, sterile environments. Our focus extends to neonatal care, including early screening for congenital issues and strict adherence to immunization schedules. By providing a digital 'Mother & Child Tracking System', we ensure that no follow-up is missed, significantly reducing maternal and infant mortality rates in the regions we serve.",
    challenge: "High rates of home births and poor maternal nutrition lead to preventable complications during childbirth.",
    solution: "Holistic 1000-day support plan including clinical checkups, institutional delivery subsidies, and nutritional kits.",
    points: ["Antenatal & Postnatal clinical care", "Institutional delivery facilitation", "Nutritional 'Poshan' kits", "Neonatal screening & vaccination"]
  },
  "eye-care-(opthalmology)": {
    title: "Vision Restoration (Ophthalmology)",
    impact: "800+ Surgeries Performed",
    image: "/eye.png",
    intro: "Eradicating avoidable blindness to restore dignity, independence, and economic opportunity.",
    detail: "Visual impairment is a profound socio-economic burden. Our Ophthalmology program focuses on the high-volume, high-quality treatment of cataracts and refractive errors—the leading causes of reversible blindness. Utilizing Phacoemulsification technology and premium Intraocular Lenses (IOL), we provide surgical outcomes comparable to top-tier private hospitals. Our approach is 'Camp-to-Clinic,' where we conduct massive community screenings to identify patients, transport them to our base hospitals, and provide comprehensive post-operative care including medicine kits and protective eyewear. Restoring vision isn't just a medical procedure; it’s giving someone back their livelihood.",
    challenge: "Over 60% of blindness in rural India is due to cataracts, which remain untreated due to high costs and lack of specialized surgeons.",
    solution: "Subsidized high-tech surgical interventions combined with grassroots-level diagnostic screening camps.",
    points: ["Phacoemulsification cataract surgery", "Premium IOL implantation", "Refractive error correction", "Post-operative follow-up care"]
  },
  "mental-health-support": {
    title: "Mental Health & Psychological Wellness",
    impact: "3000+ Counseling Sessions",
    image: "/mentalhealth.png",
    intro: "There is no health without mental health. We are breaking the silence and the stigma.",
    detail: "Our Mental Health initiative is designed to integrate psychological support into primary healthcare. We address the silent epidemic of anxiety, depression, and PTSD in marginalized communities where mental illness is often misunderstood or stigmatized. Through a combination of one-on-one professional counseling, community support groups, and tele-psychiatry, we provide a safe and confidential environment for healing. We also conduct 'Mindset Workshops' for local leaders and teachers to help them identify signs of mental distress early, ensuring that psychological first-aid is available at the community level.",
    challenge: "Deep-rooted social stigma and a massive shortage of mental health professionals in rural areas leave millions without support.",
    solution: "A hybrid model of community-based counseling and digital access to certified psychiatrists.",
    points: ["Professional one-on-one counseling", "Tele-psychiatry consultations", "Stigma-reduction campaigns", "Youth & Student wellness programs"]
  },
  "vaccination-drives": {
    title: "Preventive Immunization Initiatives",
    impact: "10k+ Immunizations",
    image: "/vaccination.png",
    intro: "Building a shield of immunity for every child, regardless of their PIN code.",
    detail: "Our Vaccination Drives are focused on achieving 100% immunization coverage in 'Hard-to-Reach' areas. We tackle diseases like Polio, Hepatitis B, Meningitis, and HPV through a meticulously managed cold-chain logistics network. Beyond just administering vaccines, we conduct extensive community mobilization campaigns to dispel myths and overcome vaccine hesitancy. Each child is registered on our digital 'Health-Shield' platform, which sends automated reminders to parents for booster doses. By ensuring that the last child in the most remote village is protected, we are working toward the total eradication of preventable childhood diseases.",
    challenge: "Logistical gaps in cold-chain maintenance and widespread misinformation lead to incomplete immunization cycles.",
    solution: "Localized immunization booths supported by advanced cold-storage technology and door-to-door awareness drives.",
    points: ["Full-spectrum pediatric vaccination", "Advanced cold-chain logistics", "Digital dose tracking & reminders", "Community awareness street plays"]
  }
};

export default function ProgrammeDetail() {
  const params = useParams();
  const id = params?.id as string;
  const data = programmesData[id as keyof typeof programmesData] || programmesData["education"];
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white pb-20 pt-16 font-sans selection:bg-blue-100">
      {/* 1. Header Section */}
      <div className="max-w-4xl mx-auto pt-10 px-6 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px] bg-blue-50 px-4 py-2 rounded-full border border-blue-100 mb-8">
          <ShieldCheck size={14} />
          Strategic Healthcare Initiative
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-950 leading-tight tracking-tight">
          {data.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 mt-10 border-y border-slate-100 py-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center font-black shadow-lg shadow-blue-200">MB</div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lead Organization</p>
              <p className="text-sm font-bold text-slate-900 tracking-tight">MedBridge Global Admin</p>
            </div>
          </div>
          <div className="hidden md:block h-10 w-px bg-slate-200"></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Impact Reach</p>
            <p className="text-sm font-bold text-blue-600 flex items-center gap-2">
              <Activity size={16} />
              {data.impact}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Hero Image Section */}
      <div className="max-w-6xl mx-auto mt-12 px-6 relative z-10">
        <div className="rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-[12px] border-white bg-slate-100">
          <img
            src={data.image}
            alt={data.title}
            className="w-full h-[550px] object-cover block hover:scale-105 transition-transform duration-1000"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200";
            }}
          />
        </div>
      </div>

      {/* 3. Professional Article Content */}
      <div className="max-w-4xl mx-auto py-20 px-6">
        
        {/* Intro Section */}
        <div className="flex gap-8 flex-col md:flex-row items-start mb-24">
          <span className="text-9xl font-black text-blue-600/10 leading-[0.5] select-none italic -mt-4">"</span>
          <div className="-mt-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug mb-6">
              {data.intro}
            </h2>
            <div className="prose prose-slate prose-lg">
              <p className="text-lg text-slate-600 leading-relaxed text-justify">
                {data.detail}
              </p>
            </div>
          </div>
        </div>

        {/* Challenge & Strategy Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          <div className="group bg-slate-50 p-10 rounded-[3rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
            <div className="h-14 w-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-8 border border-red-100">
              <Target size={28} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">The Challenge</h3>
            <p className="text-slate-600 leading-relaxed font-medium">{data.challenge}</p>
          </div>

          <div className="group bg-blue-50/30 p-10 rounded-[3rem] border border-blue-100/50 hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
            <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 border border-blue-100">
              <Lightbulb size={28} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Our Strategy</h3>
            <p className="text-slate-600 leading-relaxed font-medium">{data.solution}</p>
          </div>
        </div>

        {/* Program Deliverables List */}
        <div className="mb-24 bg-slate-50/50 p-12 rounded-[4rem] border border-slate-100">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
                <Zap size={20} fill="currentColor" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-950">Key Deliverables</h2>
            <p className="text-slate-500 mt-2 font-medium">Core components of the {data.title} initiative</p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {data.points.map((point, index) => (
              <div key={index} className="flex items-center gap-4 p-6 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:border-blue-400 transition-all group">
                <CheckCircle2 className="text-blue-500 group-hover:scale-110 transition-transform" size={24} />
                <span className="font-bold text-slate-700">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[4rem] p-12 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="text-center lg:text-left max-w-xl">
              <h3 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">Support our Mission.</h3>
              <p className="text-blue-100 mt-6 text-xl leading-relaxed opacity-90 font-medium">
                Your contribution directly funds the medical staff, equipment, and logistics required to sustain the <strong>{data.title}</strong>.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <button 
              onClick={() => router.push(`/donate/${id}`)}
              className="group bg-white text-blue-700 px-10 py-6 rounded-2xl font-black text-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              Donate Now
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            </div>
          </div>
          {/* Decorative SVG Shapes */}
          <div className="absolute top-0 right-0 h-full w-1/2 bg-white/5 -skew-x-12 translate-x-1/4"></div>
          <div className="absolute -bottom-20 -left-20 h-64 w-64 bg-blue-400/20 rounded-full blur-[80px]"></div>
        </div>

      </div>
    </div>
  );
}
