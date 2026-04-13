"use client";

import React, { useMemo } from "react";
import { CheckCircle2, ClipboardCheck, Heart, Info } from "lucide-react";

type NGO = {
  id: number;
  name: string;
  is_verified: boolean;
};

type WorkshopRegistration = {
  id: number;
  full_name: string;
  status?: "confirmed" | "verified";
  id_proof_url?: string | null;
  registered_at: string;
};

type Donor = {
  id: number;
  name: string;
};

type Donation = {
  id: number;
  donor: number;
  donor_details?: Donor;
  amount: number | string;
  date: string;
};

type SystemLogsProps = {
  isLoading: boolean;
  ngos: NGO[];
  registrations: WorkshopRegistration[];
  donors: Donor[];
  donations: Donation[];
  customEntries?: Array<{
    id: string;
    tone: LogTone;
    title: string;
    detail?: string;
    created_at: string;
  }>;
};

type LogTone = "success" | "info" | "pending";

type LogEntry = {
  id: string;
  tone: LogTone;
  title: string;
  detail?: string;
  timeLabel: string;
};

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const parseAmount = (amount: Donation["amount"]) => {
  if (typeof amount === "number") return amount;
  const n = Number(amount);
  return Number.isFinite(n) ? n : 0;
};

const timeAgo = (iso: string) => {
  const d = new Date(iso);
  const t = d.getTime();
  if (Number.isNaN(t)) return "Just now";
  const diffMs = Date.now() - t;
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hrs ago`;
  const days = Math.round(hrs / 24);
  return `${days} days ago`;
};

const toneStyles: Record<LogTone, { ring: string; iconBg: string; icon: React.ReactNode; badge: string }> = {
  success: {
    ring: "border-emerald-100",
    iconBg: "bg-emerald-50 text-emerald-700",
    icon: <CheckCircle2 size={18} />,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  info: {
    ring: "border-blue-100",
    iconBg: "bg-blue-50 text-blue-700",
    icon: <Info size={18} />,
    badge: "bg-blue-50 text-blue-700 border-blue-100",
  },
  pending: {
    ring: "border-amber-100",
    iconBg: "bg-amber-50 text-amber-800",
    icon: <ClipboardCheck size={18} />,
    badge: "bg-amber-50 text-amber-800 border-amber-100",
  },
};

export default function SystemLogs({ isLoading, ngos, registrations, donors, donations, customEntries }: SystemLogsProps) {
  const entries = useMemo<LogEntry[]>(() => {
    const built: LogEntry[] = [
      {
        id: "donation-recorded-dummy",
        tone: "success",
        title: "Donation of ₹10,000 recorded from David Roy",
        detail: "Funds added to Donor Insights rollups.",
        timeLabel: "10 mins ago",
      },
      {
        id: "verification-pending-dummy",
        tone: "pending",
        title: "Kiara Sharma verification pending - Document uploaded",
        detail: "Verify to unlock referrals and downstream workflows.",
        timeLabel: "25 mins ago",
      },
      {
        id: "ngo-onboarded-dummy",
        tone: "info",
        title: "Indore Care Foundation onboarded to the system",
        detail: "Status: Verified partner.",
        timeLabel: "2 days ago",
      },
    ];

    const custom = (customEntries ?? [])
      .filter((e) => Boolean(e?.id && e?.title && e?.created_at))
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map<LogEntry>((e) => ({
        id: `custom-${e.id}`,
        tone: e.tone,
        title: e.title,
        detail: e.detail,
        timeLabel: timeAgo(e.created_at),
      }));

    if (custom.length > 0) built.unshift(...custom);

    const donation = [...donations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const donationAmount = donation ? parseAmount(donation.amount) : 10000;
    const donationDonorName =
      donation?.donor_details?.name ??
      donors.find((d) => d.id === donation?.donor)?.name ??
      "David Roy";
    const donationTimeLabel = donation?.date ? timeAgo(donation.date) : "10 mins ago";

    const pendingKiara =
      registrations.find((r) => (r.full_name ?? "").toLowerCase().includes("kiara")) ??
      registrations.find((r) => (r.status ?? "").toLowerCase() !== "verified");
    const pendingTimeLabel = pendingKiara?.registered_at ? timeAgo(pendingKiara.registered_at) : "25 mins ago";
    const pendingName = pendingKiara?.full_name ?? "Kiara Sharma";
    const hasDoc = Boolean(pendingKiara?.id_proof_url);

    const ngoIndore =
      ngos.find((n) => (n.name ?? "").toLowerCase().includes("indore care foundation")) ?? ngos[0] ?? null;

    if (donation) {
      built.unshift({
        id: `donation-live-${donation.id}`,
        tone: "success",
        title: `Donation of ${formatINR(donationAmount)} recorded from ${donationDonorName}`,
        detail: "Live update from Donations feed.",
        timeLabel: donationTimeLabel,
      });
    }

    if (pendingKiara) {
      built.splice(1, 0, {
        id: `verification-live-${pendingKiara.id}`,
        tone: "pending",
        title: `${pendingName} verification pending${hasDoc ? " - Document uploaded" : ""}`,
        detail: hasDoc ? "Live update from Verification Queue." : "Live update from Verification Queue (no doc).",
        timeLabel: pendingTimeLabel,
      });
    }

    if (ngoIndore) {
      built.push({
        id: `ngo-live-${ngoIndore.id}`,
        tone: "info",
        title: `${ngoIndore.name} onboarded to the system`,
        detail: ngoIndore.is_verified ? "Live status: Verified partner." : "Live status: Pending verification.",
        timeLabel: "Recently",
      });
    }

    return built;
  }, [donations, donors, registrations, ngos, customEntries]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">System Logs</h1>
          <p className="text-sm font-semibold text-slate-500">
            Recent activities across donations, verifications, and onboarding.
          </p>
        </div>
        <span className="text-xs font-black text-slate-500 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
          {isLoading ? "Loading..." : `${entries.length} updates`}
        </span>
      </div>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-black text-slate-900 flex items-center gap-2">
            <Heart className="text-blue-600" size={18} /> Activity Timeline
          </h2>
          <span className="text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
            Live + Dummy
          </span>
        </div>

        <div className="p-6">
          <div className="relative pl-6">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-100" />
            <div className="space-y-5">
              {entries.map((e) => {
                const styles = toneStyles[e.tone];
                return (
                  <div
                    key={e.id}
                    className={`relative rounded-2xl border ${styles.ring} bg-white p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
                  >
                    <div
                      className={`absolute -left-[13px] top-6 h-9 w-9 rounded-2xl border border-white shadow-md flex items-center justify-center ${styles.iconBg}`}
                      aria-hidden
                    >
                      {styles.icon}
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 break-words">{e.title}</p>
                        {e.detail && <p className="mt-1 text-sm font-semibold text-slate-600">{e.detail}</p>}
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className={`inline-flex items-center rounded-xl border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${styles.badge}`}
                        >
                          {e.tone}
                        </span>
                        <p className="mt-2 text-[11px] font-bold text-slate-400">{e.timeLabel}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
