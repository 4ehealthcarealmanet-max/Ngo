"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Clipboard,
  HeartHandshake,
  Mail,
  MapPin,
  Megaphone,
  Share2,
  Users,
} from "lucide-react";

type NGO = {
  id: number;
  name: string;
  city: string;
  service_type: string;
  is_verified: boolean;
  contact_email?: string;
  logo?: string | null;
};

type Workshop = {
  id: number;
  ngo: number;
  title: string;
  expert_name: string;
  date: string;
  is_open: boolean;
  description: string;
  full_description?: string;
  image_url?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

const NgoMiniMap = dynamic(() => import("./NgoMiniMap"), { ssr: false });

function initials(name: string) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "NGO";
  return (parts[0][0] ?? "").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function getBrandAssets(ngo: NGO) {
  const name = (ngo.name ?? "").trim().toLowerCase();
  if (name.includes("dewas")) {
    return { banner: "/AdolescentMentalHealth.png", logo: "/mentalhealth.png", accent: "from-fuchsia-600 to-blue-600" };
  }
  if (name.includes("indore")) {
    return { banner: "/maternalhealthworkshop.png", logo: "/maternalhealth.png", accent: "from-blue-600 to-emerald-600" };
  }
  if (name.includes("ujjain") || name.includes("seva")) {
    return { banner: "/education.jpg", logo: "/eye.png", accent: "from-emerald-600 to-blue-600" };
  }
  return { banner: "/support.jpg", logo: "/handshaking.png", accent: "from-slate-800 to-blue-600" };
}

function Toast({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(onClose, 3500);
    return () => window.clearTimeout(id);
  }, [open, onClose]);

  return (
    <div
      className={classNames(
        "fixed left-1/2 top-6 z-[250] w-[min(520px,calc(100%-2rem))] -translate-x-1/2 transition-all duration-300",
        open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      )}
    >
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50 px-5 py-4 shadow-xl">
        <p className="text-sm font-black text-emerald-800">{message}</p>
        <p className="mt-1 text-sm font-semibold text-emerald-800/80">
          We’ll get back to you soon. Thanks for reaching out.
        </p>
      </div>
    </div>
  );
}

function FocusAreas({ ngo }: { ngo: NGO }) {
  const key = (ngo.name ?? "").trim().toLowerCase();

  const items = (() => {
    if (key.includes("dewas")) {
      return {
        title: "Women Empowerment",
        points: [
          { icon: Users, title: "Community Support Circles", detail: "Safe, local groups for mentorship and peer support." },
          { icon: BadgeCheck, title: "Skills & Financial Literacy", detail: "Practical sessions to build confidence and independence." },
          { icon: Building2, title: "Partner Network", detail: "Connecting women to verified NGOs, hospitals, and workshops." },
        ],
      };
    }
    if (key.includes("indore")) {
      return {
        title: "Primary Healthcare Access",
        points: [
          { icon: BadgeCheck, title: "Verified Care Pathways", detail: "Structured referrals and follow-ups with partner hospitals." },
          { icon: Users, title: "Patient Profiling", detail: "Better outcomes with organized profiles and case tracking." },
          { icon: CalendarDays, title: "Workshops & Camps", detail: "Awareness programs that bring care closer to people." },
        ],
      };
    }
    if (key.includes("ujjain") || key.includes("seva")) {
      return {
        title: "Health & Education Outreach",
        points: [
          { icon: CalendarDays, title: "Preventive Health Camps", detail: "Regular camps for early detection and guidance." },
          { icon: Users, title: "Family Counselling", detail: "Support for parents and youth to improve well-being." },
          { icon: BadgeCheck, title: "Long-term Follow-ups", detail: "Continuity of care through community coordination." },
        ],
      };
    }
    return {
      title: "Impact Focus",
      points: [
        { icon: BadgeCheck, title: "Verified Partner", detail: "Trusted NGO profile with transparent activity tracking." },
        { icon: CalendarDays, title: "Workshops", detail: "Public workshops and community sessions listed openly." },
        { icon: Users, title: "Patient Support", detail: "Organized patient profiles for better coordination." },
      ],
    };
  })();

  const pastelCards = [
    {
      shell: "bg-sky-50/70 border-sky-100 hover:bg-sky-100/70",
      icon: "text-sky-700",
      title: "text-sky-950",
    },
    {
      shell: "bg-emerald-50/70 border-emerald-100 hover:bg-emerald-100/70",
      icon: "text-emerald-700",
      title: "text-emerald-950",
    },
    {
      shell: "bg-indigo-50/70 border-indigo-100 hover:bg-indigo-100/70",
      icon: "text-indigo-700",
      title: "text-indigo-950",
    },
  ] as const;

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Focus Area</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-black text-slate-950">{items.title}</h2>
          <p className="mt-3 text-sm font-semibold text-slate-600 max-w-2xl">
            {ngo.name} runs targeted initiatives to improve on-ground impact in {ngo.city}.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.points.map((p, idx) => {
          const palette = pastelCards[idx % pastelCards.length];
          return (
          <div
            key={p.title}
            className={classNames(
              "rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
              palette.shell
            )}
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                <p.icon className={classNames("h-6 w-6", palette.icon)} />
              </div>
              <p className={classNames("text-sm font-black", palette.title)}>{p.title}</p>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-600 leading-relaxed">{p.detail}</p>
          </div>
        )})}
      </div>
    </section>
  );
}

function ContactNgoModal({
  open,
  ngoName,
  onClose,
  onSent,
}: {
  open: boolean;
  ngoName: string;
  onClose: () => void;
  onSent: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-100 bg-white shadow-2xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50">
          <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Contact NGO</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{ngoName}</p>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Send a quick message to the team. (Next step: wire this to a backend endpoint / email.)
          </p>
        </div>

        <form
          className="p-6 md:p-8 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (isSending) return;
            setIsSending(true);
            await new Promise((r) => window.setTimeout(r, 650));
            setIsSending(false);
            setName("");
            setEmail("");
            setSubject("");
            setMessage("");
            onClose();
            onSent();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-black text-slate-700">Your Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-400"
                placeholder="Enter your name"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-400"
                placeholder="you@example.com"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-black text-slate-700">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-400"
              placeholder="Eg. Volunteering / Partnership / Workshop query"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-700">Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-400"
              placeholder="Write your message..."
              required
            />
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSending}
              className={classNames(
                "flex-1 rounded-2xl py-3 text-sm font-black text-white transition-colors",
                isSending ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {isSending ? "Sending..." : "Send Message"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NgoProfileClient({
  ngo,
  workshopCount,
  patientCount,
  workshops,
}: {
  ngo: NGO;
  workshopCount: number;
  patientCount: number;
  workshops: Workshop[];
}) {
  const assets = getBrandAssets(ngo);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  const [shareOpen, setShareOpen] = useState(false);

  const upcoming = useMemo(() => {
    const today = new Date();
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return workshops
      .filter((w) => w.is_open)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .filter((w) => {
        const d = new Date(`${w.date}T00:00:00`);
        return Number.isFinite(d.getTime()) ? d >= dayStart : true;
      });
  }, [workshops]);

  const coords = useMemo(() => {
    for (const w of workshops) {
      const lat = toNumber(w.latitude);
      const lng = toNumber(w.longitude);
      if (lat !== null && lng !== null) return { lat, lng };
    }
    return null;
  }, [workshops]);

  useEffect(() => {
    if (!shareOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShareOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shareOpen]);

  const shareUrl = typeof window === "undefined" ? "" : window.location.href;
  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setToast({ open: true, message: "Link copied to clipboard!" });
    } catch {
      window.prompt("Copy this link:", shareUrl);
    } finally {
      setShareOpen(false);
    }
  };

  const onWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out this NGO profile: ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    setShareOpen(false);
  };

  return (
    <main className="min-h-screen bg-white">
      <Toast open={toast.open} message={toast.message} onClose={() => setToast((t) => ({ ...t, open: false }))} />
      <section className="relative">
        <div className={`h-72 md:h-80 w-full bg-gradient-to-r ${assets.accent}`} />
        <div className="absolute inset-0">
          <img src={assets.banner} alt={`${ngo.name} banner`} className="h-72 md:h-80 w-full object-cover opacity-25" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="-mt-16 md:-mt-20 rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl overflow-hidden">
            <div className="p-6 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  {ngo.logo ? (
                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden flex items-center justify-center">
                      <img src={ngo.logo} alt={`${ngo.name} logo`} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl border border-blue-100 bg-blue-50 shadow-sm overflow-hidden flex items-center justify-center">
                      <span className="inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-blue-600 text-white text-lg md:text-xl font-black">
                        {initials(ngo.name)}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-3 -right-3 h-10 w-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-900 font-black">
                    {initials(ngo.name)}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tight truncate">{ngo.name}</h1>
                    {ngo.is_verified && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                        <BadgeCheck className="h-4 w-4" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-bold text-slate-600">
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" /> {ngo.city}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" /> {ngo.service_type}
                    </span>
                    {coords && (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Back
                </Link>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShareOpen((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Share2 className="h-4 w-4" /> Share Profile
                  </button>
                  {shareOpen && (
                    <>
                      <div className="fixed inset-0 z-[140]" onClick={() => setShareOpen(false)} />
                      <div className="absolute right-0 top-[calc(100%+10px)] z-[150] w-64 rounded-3xl border border-slate-100 bg-white shadow-2xl overflow-hidden">
                        <button
                          type="button"
                          onClick={onCopyLink}
                          className="w-full px-5 py-4 text-left hover:bg-slate-50 transition-colors flex items-center gap-3"
                        >
                          <span className="h-10 w-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                            <Clipboard className="h-5 w-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-black text-slate-900">Copy Link</span>
                            <span className="block text-xs font-semibold text-slate-500 truncate">Share this profile URL</span>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={onWhatsAppShare}
                          className="w-full px-5 py-4 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 border-t border-slate-100"
                        >
                          <span className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-black">
                            W
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-black text-slate-900">WhatsApp</span>
                            <span className="block text-xs font-semibold text-slate-500 truncate">Share in chat</span>
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsContactOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 transition-colors"
                >
                  <Mail className="h-4 w-4" /> Contact NGO
                </button>
              </div>
            </div>

            <div className="px-6 md:px-10 pb-6 md:pb-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Workshops</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{workshopCount}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-600">Total workshops hosted by this NGO.</p>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Patient Profiles</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{patientCount}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-600">Profiles created/managed in the system.</p>
                </div>
                <div
                  className={classNames(
                    "rounded-3xl border p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl",
                    ngo.is_verified
                      ? "border-emerald-100 bg-gradient-to-br from-emerald-50 to-white"
                      : "border-slate-100 bg-slate-50"
                  )}
                >
                  <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Status</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span
                      className={classNames(
                        "h-3 w-3 rounded-full",
                        ngo.is_verified ? "bg-emerald-600 animate-pulse" : "bg-slate-400"
                      )}
                    />
                    <p className="text-3xl font-black text-slate-950">{ngo.is_verified ? "Verified" : "Pending"}</p>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-600">Partner onboarding and trust level.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 space-y-8">
        <FocusAreas ngo={ngo} />

        <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Vision &amp; Mission</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-black text-slate-950">Building healthier communities, together</h2>
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm font-black text-slate-900">Vision</p>
              <p className="mt-3 text-sm font-semibold text-slate-600 leading-relaxed">
                A future where every family—regardless of location or income—can access trustworthy healthcare guidance,
                timely referrals, and community support.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm font-black text-slate-900">Mission</p>
              <p className="mt-3 text-sm font-semibold text-slate-600 leading-relaxed">
                To strengthen last-mile care through verified NGO partnerships, patient profiling, and workshop-led awareness—so
                help reaches people faster and outcomes improve sustainably.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Our Impact in Photos</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-black text-slate-950">Moments from the field</h2>
              <p className="mt-3 text-sm font-semibold text-slate-600">
                A quick look at the kind of community work our partners are enabling.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {(ngo.id === 1
              ? ["/ICFimg1.png", "/ICFimg2.png", "/ICFimg3.png", "/ICFimg4.png"]
              : ["/women.jpg", "/vaccination.png", "/disaster.jpg", "/education.jpg"]
            ).map((src) => (
              <div
                key={src}
                className="group overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={src}
                    alt="Impact photo"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Location</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Impact Map</h2>
              <p className="mt-3 text-sm font-semibold text-slate-600">
                This map shows the primary location inferred from this NGO’s upcoming workshops.
              </p>
              {!coords && (
                <p className="mt-4 text-sm font-black text-slate-500">
                  Location not available yet — add latitude/longitude to this NGO’s workshops in admin.
                </p>
              )}
            </div>
          </div>
          <div className="lg:col-span-7">
            {coords ? <NgoMiniMap lat={coords.lat} lng={coords.lng} label={ngo.name} /> : null}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">How You Can Help</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-black text-slate-950">Support this mission</h2>
          <p className="mt-3 text-sm font-semibold text-slate-600">
            Small actions create measurable impact. Choose a way to contribute.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: HeartHandshake,
                title: "Volunteer",
                detail: "Join upcoming drives and help the team coordinate on-ground support.",
                shell: "bg-rose-50/80 border-rose-100 hover:bg-rose-100/80",
                iconColor: "text-rose-700",
              },
              {
                icon: Megaphone,
                title: "Spread the Word",
                detail: "Share this NGO profile so more people can find verified help faster.",
                shell: "bg-amber-50/80 border-amber-100 hover:bg-amber-100/80",
                iconColor: "text-amber-700",
              },
              {
                icon: Mail,
                title: "Partner with Us",
                detail: "Hospitals, donors, and communities can collaborate via verified pathways.",
                shell: "bg-sky-50/80 border-sky-100 hover:bg-sky-100/80",
                iconColor: "text-sky-700",
              },
            ].map((c) => (
              <button
                key={c.title}
                type="button"
                onClick={() => setIsContactOpen(true)}
                className={classNames(
                  "text-left rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                  c.shell
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    <c.icon className={classNames("h-6 w-6", c.iconColor)} />
                  </span>
                  <span className="text-sm font-black text-slate-900">{c.title}</span>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-600 leading-relaxed">{c.detail}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Connected Workshops</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-black text-slate-950">Upcoming Sessions</h2>
              <p className="mt-3 text-sm font-semibold text-slate-600">
                Explore and register for workshops hosted by {ngo.name}.
              </p>
            </div>
          </div>

          {upcoming.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-sm font-black text-slate-900">No upcoming workshops</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">Add a new workshop from Django admin to show it here.</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((w) => {
                const img = (w.image_url ?? "").trim() || assets.banner;
                return (
                  <Link
                    key={w.id}
                    href={`/workshops/${w.id}`}
                    className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                      <img src={img} alt={w.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-100 inline-flex px-3 py-1 rounded-full">
                        {new Date(`${w.date}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                      <p className="mt-3 text-lg font-black text-slate-950 leading-tight">{w.title}</p>
                      <p className="mt-2 text-sm font-semibold text-slate-600">By {w.expert_name}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </section>

      <ContactNgoModal
        open={isContactOpen}
        ngoName={ngo.name}
        onClose={() => setIsContactOpen(false)}
        onSent={() => setToast({ open: true, message: `Message sent to ${ngo.name}!` })}
      />
    </main>
  );
}
