"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from "next/dynamic";
import { useRouter } from 'next/navigation';
import DashboardHeader, { type HeaderNotification } from '../components/DashboardHeader';
import SmartPatientProfilingModal from "../components/SmartPatientProfilingModal";
import SystemLogs from "./components/SystemLogs";
import { apiUrl } from "../lib/api";
import { 
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  Activity,
  CheckCircle2,
  Download,
  Users,
  Heart,
  Map as MapIcon,
  Settings,
  LogOut,
  Bell,
  X,
  Eye,
  ChevronRight,
} from 'lucide-react';

interface NGO {
  id: number;
  name: string;
  city: string;
  contact_email?: string;
  contact_person?: string;
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

interface Hospital {
  id: number;
  name: string;
  location: string;
  specialty: string;
  contact: string;
  beds_available?: number | null;
}

interface Workshop {
  id: number;
  ngo: number;
  title: string;
  expert_name: string;
  date: string;
  description: string;
  is_open: boolean;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

interface Referral {
  id: number;
  referral_id: string;
  patient: number;
  from_ngo: number;
  to_hospital: number;
  reason: string;
  status: "Pending" | "Accepted" | "Treatment Started" | "Completed";
  urgency: "Normal" | "Emergency";
  created_at: string;
  updated_at: string;
  to_hospital_details?: {
    id: number;
    name: string;
    location: string;
    specialty: string;
    contact: string;
  };
}

interface WorkshopRegistration {
  id: number;
  workshop: number;
  workshop_details?: {
    id: number;
    title: string;
    date: string;
    ngo: number;
  };
  full_name: string;
  email_or_phone: string;
  role: "patient" | "volunteer";
  status?: "confirmed" | "verified";
  id_proof?: string | null;
  id_proof_url?: string | null;
  id_proof_name?: string | null;
  id_proof_size?: number | null;
  registered_at: string;
}

interface Donor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  donor_type: "individual" | "corporate";
  created_at: string;
  total_donated?: number | string | null;
  last_donation_date?: string | null;
}

interface Donation {
  id: number;
  donor: number;
  donor_details?: Donor;
  amount: number | string;
  date: string;
  transaction_id?: string;
  donation_type: "one_time" | "monthly";
  purpose: "workshop" | "ngo_support";
  ngo?: number | null;
  ngo_details?: NGO | null;
  workshop?: number | null;
  workshop_details?: { id: number; title: string; date: string; ngo: number } | null;
  notes?: string;
}

const formatRole = (role?: WorkshopRegistration["role"]) => {
  if (!role) return "";
  return role === "volunteer" ? "Volunteer" : "Attendee";
};

const referralStages = ["Pending", "Accepted", "Treatment Started", "Completed"] as const;

const HOVER_LIFT_CARD = "hover:shadow-xl hover:-translate-y-2 transition-all duration-300";

const GlobalEventMap = dynamic(() => import("./components/GlobalEventMap"), { ssr: false });

async function fetchJsonOrNull<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) return null;

    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const getReferralStageIndex = (status?: string) => {
  const normalized = (status ?? "").trim().toLowerCase();
  if (normalized === "completed") return 3;
  if (normalized === "treatment started") return 2;
  if (normalized === "accepted") return 1;
  if (normalized === "pending") return 0;
  return 0;
};

const timeAgoLabel = (iso?: string | null) => {
  if (!iso) return "Just now";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Just now";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hrs ago`;
  const days = Math.round(hrs / 24);
  return `${days} days ago`;
};

const sidebarItems = [
  { tab: "dashboard", name: "Dashboard Overview", icon: LayoutDashboard },
  { tab: "ngo", name: "NGO Management", icon: Building2 },
  { tab: "hospitals", name: "Hospital Management", icon: Activity },
  { tab: "verification_queue", name: "Verification Queue", icon: ClipboardCheck },
  { tab: "donor", name: "Donor Database", icon: Heart },
  { tab: "map", name: "Global Event Map", icon: MapIcon },
  { tab: "logs", name: "System Logs", icon: Settings },
] as const;

type AdminTab = (typeof sidebarItems)[number]["tab"];
type WorkshopRoleFilter = "all" | "patient" | "volunteer";

type Toast = {
  id: string;
  message: string;
  variant?: "success" | "error" | "info";
};

type AdminLogTone = "success" | "info" | "pending";

type AdminSystemLogEntry = {
  id: string;
  tone: AdminLogTone;
  title: string;
  detail?: string;
  created_at: string;
};

const ADMIN_SYSTEM_LOGS_STORAGE_KEY = "admin_system_logs_v1";

function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[220] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`w-[320px] rounded-2xl border bg-white px-5 py-4 shadow-2xl ${
            t.variant === "success"
              ? "border-emerald-100"
              : t.variant === "error"
              ? "border-rose-100"
              : "border-slate-100"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                className={`text-sm font-black ${
                  t.variant === "success"
                    ? "text-emerald-700"
                    : t.variant === "error"
                    ? "text-rose-700"
                    : "text-slate-900"
                }`}
              >
                {t.variant === "success" ? "Success" : t.variant === "error" ? "Error" : "Info"}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-600 break-words">{t.message}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="h-9 w-9 shrink-0 rounded-2xl border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
              aria-label="Dismiss toast"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

type ProfileSettingsModalProps = {
  isOpen: boolean;
  name: string;
  email: string;
  onClose: () => void;
  onSave: (next: { name: string; email: string; newPassword?: string }) => void;
};

type NgoGrowthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  indoreLabel: string;
  ujjainLabel: string;
};

function NgoGrowthModal({ isOpen, onClose, indoreLabel, ujjainLabel }: NgoGrowthModalProps) {
  if (!isOpen) return null;

  const indore = [2, 3, 5, 6, 8, 9, 11];
  const ujjain = [1, 2, 2, 3, 4, 6, 7];
  const maxY = Math.max(...indore, ...ujjain, 1);
  const pad = 18;
  const w = 520;
  const h = 220;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;

  const toPath = (series: number[]) => {
    if (series.length === 0) return "";
    return series
      .map((y, i) => {
        const x = pad + (innerW * i) / Math.max(1, series.length - 1);
        const yy = pad + innerH - (innerH * y) / maxY;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${yy.toFixed(1)}`;
      })
      .join(" ");
  };

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="NGO Growth report">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full w-fit">
              Quick Report
            </p>
            <h3 className="text-xl font-black text-slate-900 mt-2">NGO Growth</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Interactive demo chart (Indore vs Ujjain)</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-2xl border border-slate-100 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center"
            aria-label="Close"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 overflow-hidden">
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
              <defs>
                <linearGradient id="indoreLine" x1="0" x2="1">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="ujjainLine" x1="0" x2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              <rect x="0" y="0" width={w} height={h} rx="18" fill="white" opacity="0.6" />

              {[0.25, 0.5, 0.75].map((p) => (
                <line
                  key={p}
                  x1={pad}
                  x2={w - pad}
                  y1={pad + innerH * p}
                  y2={pad + innerH * p}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              ))}

              <path d={toPath(indore)} fill="none" stroke="url(#indoreLine)" strokeWidth="3.5" strokeLinecap="round" />
              <path d={toPath(ujjain)} fill="none" stroke="url(#ujjainLine)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="6 6" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs font-black text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" aria-hidden />
              {indoreLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs font-black text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden />
              {ujjainLabel}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettingsModal({ isOpen, name, email, onClose, onSave }: ProfileSettingsModalProps) {
  const [form, setForm] = useState({
    name,
    email,
    newPassword: "",
    confirmPassword: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm({ name, email, newPassword: "", confirmPassword: "" });
    setLocalError(null);
  }, [isOpen, name, email]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Profile settings"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full w-fit">
              Profile
            </p>
            <h3 className="text-xl font-black text-slate-900 mt-2">Profile Settings</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Update your account details securely.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-2xl border border-slate-100 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center"
            aria-label="Close"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form
          className="p-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            setLocalError(null);

            const nextName = form.name.trim();
            const nextEmail = form.email.trim();
            if (!nextName) {
              setLocalError("Name is required.");
              return;
            }
            if (!nextEmail) {
              setLocalError("Email is required.");
              return;
            }

            const newPassword = form.newPassword.trim();
            const confirmPassword = form.confirmPassword.trim();
            if (newPassword.length > 0) {
              if (newPassword.length < 6) {
                setLocalError("Password must be at least 6 characters.");
                return;
              }
              if (newPassword !== confirmPassword) {
                setLocalError("Passwords do not match.");
                return;
              }
            }

            onSave({ name: nextName, email: nextEmail, newPassword: newPassword.length > 0 ? newPassword : undefined });
          }}
        >
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Admin Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="Admin"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="admin@medbridge.org"
              required
            />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-xs font-black text-slate-900">Update Password</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">Leave blank to keep your current password.</p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={form.newPassword}
                onChange={(e) => setForm((s) => ({ ...s, newPassword: e.target.value }))}
                type="password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="New password"
              />
              <input
                value={form.confirmPassword}
                onChange={(e) => setForm((s) => ({ ...s, confirmPassword: e.target.value }))}
                type="password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Confirm password"
              />
            </div>
          </div>

          {localError && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
              <p className="text-sm font-bold text-rose-700">{localError}</p>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type LogoutConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function LogoutConfirmModal({ isOpen, onClose, onConfirm }: LogoutConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm logout"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-700 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full w-fit">
              Security
            </p>
            <h3 className="text-xl font-black text-slate-900 mt-2">Confirm Logout</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Are you sure you want to exit?</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-2xl border border-slate-100 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center"
            aria-label="Close"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-700">
              You'll be redirected back to the landing page and your session data will be cleared.
            </p>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white hover:bg-rose-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type RegistrationDetailsModalProps = {
  registration: WorkshopRegistration;
  onClose: () => void;
  onVerify: (registration: WorkshopRegistration) => Promise<boolean>;
  isVerifying: boolean;
  onSendReminders: (workshopId: number, workshopTitle: string) => void;
  isSendingReminders: boolean;
};

function RegistrationDetailsModal({
  registration,
  onClose,
  onVerify,
  isVerifying,
  onSendReminders,
  isSendingReminders,
}: RegistrationDetailsModalProps) {
  const statusNormalized = (registration.status ?? "").toLowerCase();
  const isVerified = statusNormalized === "verified";

  const openDocumentPreview = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const anyRegistration = registration as WorkshopRegistration & {
    phone?: string;
    address?: string;
  };

  const formatBytes = (bytes?: number | null) => {
    if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) return "—";
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-100">
          <div className="min-w-0">
            <h2 className="text-xl font-black text-slate-900 truncate">{registration.full_name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl">
                {formatRole(registration.role)}
              </span>
              <span
                className={`text-xs font-black uppercase tracking-tighter px-2.5 py-1 rounded-xl ${
                  isVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                }`}
              >
                {isVerified ? "Verified" : "Confirmed"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Close details"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Contact</p>
              <p className="mt-2 text-sm font-semibold text-slate-700 break-words">{registration.email_or_phone}</p>
              <p className="mt-2 text-xs font-semibold text-slate-500 break-words">
                Phone: {anyRegistration.phone ?? "Not available"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Workshop</p>
              <p className="mt-2 text-sm font-semibold text-slate-700 break-words">
                {registration.workshop_details?.title ?? `#${registration.workshop}`}
              </p>
              <p className="mt-2 text-xs font-semibold text-slate-500">
                Date: {registration.workshop_details?.date ?? "Not available"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Address</p>
            <p className="mt-2 text-sm font-semibold text-slate-700 break-words">{anyRegistration.address ?? "Not available"}</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Documents</p>
            {registration.id_proof_url ? (
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  className="group w-full flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => openDocumentPreview(registration.id_proof_url!)}
                  title="View document"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 font-black">
                      ID
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {registration.id_proof_name ?? "ID Proof"}
                      </p>
                      <p className="text-xs font-semibold text-slate-500 truncate">
                        Size: {formatBytes(registration.id_proof_size)}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-500 bg-white border border-slate-100 px-2 py-1 rounded-xl">
                      Uploaded
                    </span>
                    <span className="inline-flex items-center justify-center h-9 w-9 rounded-2xl bg-white border border-slate-100 text-slate-600 group-hover:text-slate-900 transition-colors">
                      <Eye size={16} />
                    </span>
                  </span>
                </button>
                <p className="text-xs font-semibold text-slate-500">Click to preview document in a new tab.</p>
              </div>
            ) : (
              <p className="mt-3 text-sm font-black text-rose-600">No document uploaded.</p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              const title = registration.workshop_details?.title ?? `Workshop #${registration.workshop}`;
              onSendReminders(registration.workshop, title);
            }}
            disabled={isSendingReminders}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-60 disabled:hover:bg-emerald-50 inline-flex items-center justify-center gap-2"
            title="Send reminders to all participants of this workshop"
          >
            <Bell size={16} />
            {isSendingReminders ? "Sending..." : "Send Reminders"}
          </button>
          <button
            type="button"
            onClick={async () => {
              if (isVerified || !registration.id_proof_url) return;
              const ok = await onVerify(registration);
              if (ok) onClose();
            }}
            disabled={isVerified || isVerifying || !registration.id_proof_url}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 transition-colors duration-200 disabled:opacity-60 disabled:hover:bg-blue-600"
          >
            {isVerified ? "Verified" : !registration.id_proof_url ? "Upload Required" : isVerifying ? "Verifying..." : "Approve & Verify"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

type RegistrationsTableProps = {
  title: string;
  isLoading: boolean;
  roleFilter: WorkshopRoleFilter;
  setRoleFilter: React.Dispatch<React.SetStateAction<WorkshopRoleFilter>>;
  registrations: WorkshopRegistration[];
  onVerify: (registration: WorkshopRegistration) => void;
  onRefer: (registration: WorkshopRegistration) => void;
  onRowClick?: (registration: WorkshopRegistration) => void;
};

function RegistrationsTable({
  title,
  isLoading,
  roleFilter,
  setRoleFilter,
  registrations,
  onVerify,
  onRefer,
  onRowClick,
}: RegistrationsTableProps) {
  return (
    <section className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <ClipboardCheck className="text-blue-600" size={20} /> {title}
        </h2>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1">
            {[
              { key: "all" as const, label: "All" },
              { key: "patient" as const, label: "Attendees" },
              { key: "volunteer" as const, label: "Volunteers" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setRoleFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-colors ${
                  roleFilter === f.key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
            View All
          </button>
        </div>
      </div>
      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {registrations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-sm font-semibold text-slate-500 text-center">
                  {isLoading ? "Loading registrations..." : "No matching registrations."}
                </td>
              </tr>
            ) : (
              registrations.map((reg) => {
                const statusNormalized = (reg.status ?? "").toLowerCase();
                const isVerified = statusNormalized === "verified";
                const canVerify = Boolean(reg.id_proof_url);

                return (
                  <tr
                    key={reg.id}
                    className={`group hover:bg-slate-50/50 transition-all rounded-xl ${
                      onRowClick ? "cursor-pointer" : ""
                    } active:bg-slate-100/70`}
                    onClick={() => onRowClick?.(reg)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-base font-semibold text-slate-800 transition-transform duration-200 group-hover:translate-x-0.5">
                        {reg.full_name}
                      </p>
                      <p className="text-sm text-slate-500 font-mono transition-transform duration-200 group-hover:translate-x-0.5">
                        Workshop: {reg.workshop_details?.title ?? `#${reg.workshop}`}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-base text-slate-600 font-semibold">{formatRole(reg.role)}</td>
                    <td className="px-6 py-4">
                      {isVerified ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter bg-emerald-50 text-emerald-600">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter bg-amber-50 text-amber-700">
                          Confirmed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isVerified ? (
                        <div className="inline-flex items-center justify-end gap-2">
                          <span
                            className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600"
                            aria-label="Verified"
                            title="Verified"
                          >
                            <CheckCircle2 size={18} />
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRefer(reg);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black bg-slate-800 text-white hover:bg-blue-600 transition-colors duration-200 active:scale-[0.98] hover:-translate-y-[1px] hover:shadow-lg"
                          >
                            Refer
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onVerify(reg);
                          }}
                          disabled={!canVerify}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-slate-800 transition-colors duration-200 active:scale-[0.98] hover:-translate-y-[1px] hover:shadow-lg disabled:opacity-60 disabled:bg-slate-300 disabled:hover:bg-slate-300 disabled:shadow-none disabled:translate-y-0 disabled:scale-100"
                          title={!canVerify ? "Document missing. Open details to review." : undefined}
                        >
                          Verify
                          <ChevronRight size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type PatientsTableProps = {
  isLoading: boolean;
  patients: PatientProfile[];
  ngos: NGO[];
  onViewId: (patient: PatientProfile) => void;
};

function PatientsTable({ isLoading, patients, ngos, onViewId }: PatientsTableProps) {
  const ngoById = useMemo(() => new Map(ngos.map((n) => [n.id, n.name])), [ngos]);

  return (
    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <Users className="text-blue-600" size={20} /> Verified Patients
        </h2>
        <span className="text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
          {patients.length}
        </span>
      </div>

      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Health ID</th>
              <th className="px-6 py-4">Blood Group</th>
              <th className="px-6 py-4">NGO</th>
              <th className="px-6 py-4 text-right">Created</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {patients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-sm font-semibold text-slate-500 text-center">
                  {isLoading ? "Loading patients..." : "No patients found yet."}
                </td>
              </tr>
            ) : (
              patients.map((p) => (
                <tr
                  key={p.id}
                  className="group hover:bg-slate-50/50 transition-all rounded-xl"
                >
                  <td className="px-6 py-4">
                    <p className="text-base font-semibold text-slate-800 transition-transform duration-200 group-hover:translate-x-0.5">
                      {p.full_name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest transition-transform duration-200 group-hover:translate-x-0.5">
                      #{p.id}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm font-black font-mono text-slate-700">{p.patient_id}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-xl bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                      {p.blood_group}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                    {ngoById.get(p.ngo) ?? `NGO #${p.ngo}`}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-500">{timeAgoLabel(p.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onViewId(p)}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-blue-600 transition-colors active:scale-[0.98]"
                      title="View Health ID"
                      aria-label={`View ID for ${p.full_name}`}
                    >
                      View ID
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type DashboardOverviewProps = {
  isLoading: boolean;
  adminCards: Array<{
    title: string;
    value: string;
    icon: React.ComponentType<{ size?: number | string }>;
    color: string;
    bg: string;
  }>;
  ecosystemData: {
    ngos: NGO[];
    patients: PatientProfile[];
    referrals: Referral[];
    registrations: WorkshopRegistration[];
  };
  visibleRegistrations: WorkshopRegistration[];
  roleFilter: WorkshopRoleFilter;
  setRoleFilter: React.Dispatch<React.SetStateAction<WorkshopRoleFilter>>;
  roleSplit: {
    volunteers: number;
    attendees: number;
    total: number;
    volunteerPct: number;
    attendeePct: number;
  };
  onVerifyRegistration: (registration: WorkshopRegistration) => void;
  onOpenReferralModal: (registration: WorkshopRegistration) => void;
  onAdvanceReferral: (referralId: number, status: Referral["status"]) => void;
  onRowClick: (registration: WorkshopRegistration) => void;
  onReviewPendingNgo: () => void;
  onReviewPendingVerification: () => void;
  onAllClear: () => void;
  onOpenNgoGrowthReport: () => void;
  onOpenSystemLogs: () => void;
  onDownloadReportPdf: (reportName: string) => void;
  onOpenPatientProfile: (patient: PatientProfile) => void;
};

function DashboardOverview({
  isLoading,
  adminCards,
  ecosystemData,
  visibleRegistrations,
  roleFilter,
  setRoleFilter,
  roleSplit,
  onVerifyRegistration,
  onOpenReferralModal,
  onAdvanceReferral,
  onRowClick,
  onReviewPendingNgo,
  onReviewPendingVerification,
  onAllClear,
  onOpenNgoGrowthReport,
  onOpenSystemLogs,
  onDownloadReportPdf,
  onOpenPatientProfile,
}: DashboardOverviewProps) {
  const pendingNgo = useMemo(() => {
    const list = ecosystemData.ngos ?? [];
    return list.find((n) => !n.is_verified) ?? null;
  }, [ecosystemData.ngos]);

  const pendingVerification = useMemo(() => {
    const list = ecosystemData.registrations ?? [];
    return list.find((r) => (r.status ?? "").toLowerCase() !== "verified") ?? null;
  }, [ecosystemData.registrations]);

  const systemAlert = useMemo(() => {
    if (pendingNgo) {
      return {
        kind: "ngo_pending" as const,
        message: `Action Required: ${pendingNgo.name} is awaiting verification.`,
        button: "Review Details",
        onClick: onReviewPendingNgo,
      };
    }

    if (pendingVerification) {
      return {
        kind: "verification_pending" as const,
        message: "Pending Verification: New registrations are awaiting review.",
        button: "Open Verification Queue",
        onClick: onReviewPendingVerification,
      };
    }

    return {
      kind: "all_clear" as const,
      message: "All clear: No NGOs or registrations are awaiting verification right now.",
      button: "Review Details",
      onClick: onAllClear,
    };
  }, [pendingNgo, pendingVerification, onAllClear, onReviewPendingNgo, onReviewPendingVerification]);

  return (
    <div className="p-8 space-y-8">
      {/* Stats Cards with Hover Effect */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminCards.map((card, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
          >
            <div className={`p-4 w-fit rounded-2xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
              <card.icon size={24} />
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">{card.title}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-3xl font-black text-slate-900">{card.value}</p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12.5%</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        <RegistrationsTable
          title="Recent Workshop Registrations"
          isLoading={isLoading}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          registrations={visibleRegistrations}
          onVerify={onVerifyRegistration}
          onRefer={onOpenReferralModal}
          onRowClick={onRowClick}
        />

        {/* Sidebar Widgets */}
        <section className="space-y-6">
          <div className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm ${HOVER_LIFT_CARD}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Referral Status Tracker</h3>
              <span className="text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                {ecosystemData.referrals.length}
              </span>
            </div>

            {ecosystemData.referrals.length === 0 ? (
              <p className="text-sm font-semibold text-slate-500">{isLoading ? "Loading referrals..." : "No referrals yet."}</p>
            ) : (
              <div className="space-y-4">
                {ecosystemData.referrals.slice(0, 4).map((ref) => {
                  const activeIndex = getReferralStageIndex(ref.status);
                  const isCompleted = ref.status === "Completed";
                  return (
                    <div
                      key={ref.id}
                      className="rounded-2xl border border-slate-100 bg-white p-4 hover:bg-slate-50/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-800 truncate">
                            {ref.to_hospital_details?.name ?? `Hospital #${ref.to_hospital}`}
                          </p>
                          <p className="text-xs font-semibold text-slate-500 truncate">
                            Referral: {ref.referral_id ?? `#${ref.id}`}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${
                              ref.status === "Completed"
                                ? "bg-emerald-50 text-emerald-700"
                                : ref.status === "Pending"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {ref.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between gap-2">
                          {referralStages.map((stage, idx) => {
                            const isDone = idx <= activeIndex;
                            return (
                              <div key={stage} className="flex-1 min-w-0">
                                <div className="flex items-center">
                                  <div
                                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black border ${
                                      isDone
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                        : "bg-white border-slate-200 text-slate-400"
                                    }`}
                                  >
                                    {idx + 1}
                                  </div>
                                  {idx < referralStages.length - 1 && (
                                    <div
                                      className={`h-0.5 flex-1 mx-2 ${idx < activeIndex ? "bg-emerald-300" : "bg-slate-200"}`}
                                    ></div>
                                  )}
                                </div>
                                <p className="mt-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider truncate">
                                  {stage}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {!isCompleted && activeIndex < referralStages.length - 1 && (
                          <button
                            onClick={() => onAdvanceReferral(ref.id, referralStages[activeIndex + 1])}
                            className="mt-3 w-full rounded-xl bg-blue-600 text-white py-2 text-xs font-black hover:bg-slate-800 transition-colors duration-200"
                          >
                            Mark as {referralStages[activeIndex + 1]}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm ${HOVER_LIFT_CARD}`}>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Volunteer vs Attendee</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-slate-800">Volunteers</p>
                <p className="text-sm font-black text-blue-600">
                  {roleSplit.volunteers} <span className="text-xs text-slate-400">({roleSplit.volunteerPct}%)</span>
                </p>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${roleSplit.volunteerPct}%` }}></div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-sm font-black text-slate-800">Attendees</p>
                <p className="text-sm font-black text-emerald-600">
                  {roleSplit.attendees} <span className="text-xs text-slate-400">({roleSplit.attendeePct}%)</span>
                </p>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${roleSplit.attendeePct}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-200 relative overflow-hidden hover:scale-[1.02] transition-transform duration-300">
            <Bell size={60} className="absolute -right-4 -top-4 text-white/10 rotate-12" />
            <h3 className="font-bold text-lg mb-2 relative z-10">System Alert</h3>
            <p className="text-xs text-blue-100 mb-4 leading-relaxed relative z-10">{systemAlert.message}</p>
            <button
              type="button"
              onClick={() => {
                systemAlert.onClick();
              }}
              className="w-full bg-white text-blue-600 py-3 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all shadow-md active:scale-95 disabled:opacity-60 disabled:hover:bg-white disabled:active:scale-100"
            >
              {systemAlert.button}
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Reports</h3>
            <div className="space-y-2">
              {["Weekly Stats", "Doctor Logs", "NGO Growth"].map((r) => (
                <div
                  key={r}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (r === "Doctor Logs") {
                      onOpenSystemLogs();
                      return;
                    }
                    if (r === "NGO Growth") {
                      onOpenNgoGrowthReport();
                      return;
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    if (r === "Doctor Logs") {
                      onOpenSystemLogs();
                      return;
                    }
                    if (r === "NGO Growth") {
                      onOpenNgoGrowthReport();
                      return;
                    }
                  }}
                  className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 cursor-pointer transition-all group"
                >
                  <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600 transition-colors">{r}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadReportPdf(r);
                      }}
                      className="h-8 w-8 rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-colors flex items-center justify-center"
                      aria-label={`Download ${r} as PDF`}
                      title="Download PDF (UI only)"
                    >
                      <Download size={14} />
                    </button>
                    <ChevronRight
                      size={14}
                      className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <PatientsTable
        isLoading={isLoading}
        patients={ecosystemData.patients}
        ngos={ecosystemData.ngos}
        onViewId={onOpenPatientProfile}
      />
    </div>
  );
}

type VerificationQueueProps = {
  isLoading: boolean;
  roleFilter: WorkshopRoleFilter;
  setRoleFilter: React.Dispatch<React.SetStateAction<WorkshopRoleFilter>>;
  totalPendingCount: number;
  registrations: WorkshopRegistration[];
  onVerifyRegistration: (registration: WorkshopRegistration) => void;
  onVerifyAll: () => void;
  isBulkVerifying: boolean;
  onRowClick: (registration: WorkshopRegistration) => void;
};

function VerificationQueue({
  isLoading,
  roleFilter,
  setRoleFilter,
  totalPendingCount,
  registrations,
  onVerifyRegistration,
  onVerifyAll,
  isBulkVerifying,
  onRowClick,
}: VerificationQueueProps) {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Pending Verifications</h1>
          <p className="text-sm font-semibold text-slate-500">Registrations that are confirmed but not yet verified.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onVerifyAll}
            disabled={isBulkVerifying || totalPendingCount === 0}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-black text-white hover:bg-slate-800 transition-colors duration-200 disabled:opacity-60 disabled:hover:bg-blue-600"
          >
            {isBulkVerifying ? "Verifying..." : "Verify All"}
            <span className="rounded-xl bg-white/10 px-2 py-1 text-[10px] font-black">{totalPendingCount}</span>
          </button>
          <span className="text-xs font-black text-slate-500 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
            {totalPendingCount}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        <RegistrationsTable
          title="Pending Verifications"
          isLoading={isLoading}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          registrations={registrations}
          onVerify={onVerifyRegistration}
          onRefer={() => {}}
          onRowClick={onRowClick}
        />

        <section className="space-y-6">
          <div className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm ${HOVER_LIFT_CARD}`}>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Notes</h3>
            <p className="text-sm font-semibold text-slate-600">
              Verify confirmed registrations to unlock referrals and downstream workflows.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

type NGOManagementProps = {
  ngos: NGO[];
  onOnboard: () => void;
  isEmpty: boolean;
};

function NGOManagement({ ngos, onOnboard, isEmpty }: NGOManagementProps) {
  const tableRows = useMemo(() => {
    const normalized = ngos.map((ngo) => ({ ...ngo, name: ngo.name ?? "" }));
    normalized.sort((a, b) => a.name.localeCompare(b.name));
    return normalized;
  }, [ngos]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Partner NGOs</h1>
          <p className="text-sm font-semibold text-slate-500">Health and onboarding status of partner organizations.</p>
        </div>
        <button
          type="button"
          onClick={onOnboard}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-black text-white hover:bg-slate-800 transition-colors duration-200"
        >
          + Onboard New NGO
        </button>
      </div>

      {isEmpty ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-10 shadow-sm text-center">
          <p className="text-sm font-black text-slate-900">No partner NGOs found.</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">Start by onboarding one!</p>
          <button
            type="button"
            onClick={onOnboard}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-black text-white hover:bg-slate-800 transition-colors duration-200"
          >
            + Onboard New NGO
          </button>
        </div>
      ) : (
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">NGO Name</th>
                  <th className="px-6 py-4">Region</th>
                  <th className="px-6 py-4">Focus Area</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tableRows.map((ngo) => (
                  <tr key={ngo.id} className="group hover:bg-slate-50/60 transition-all duration-200 active:bg-slate-100/70">
                    <td className="px-6 py-4">
                      <p className="text-base font-semibold text-slate-900 transition-transform duration-200 group-hover:translate-x-0.5">
                        {ngo.name}
                      </p>
                      <p className="text-xs font-semibold text-slate-500 truncate transition-transform duration-200 group-hover:translate-x-0.5">
                        {ngo.contact_email || ngo.contact_person || "Contact not provided"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{ngo.city}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{ngo.service_type}</td>
                    <td className="px-6 py-4">
                      {ngo.is_verified ? (
                        <span className="inline-flex items-center rounded-xl bg-emerald-50 text-emerald-700 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-xl bg-amber-50 text-amber-800 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

type HospitalManagementProps = {
  hospitals: Hospital[];
  isLoading: boolean;
  onRefresh: () => void;
  onAdd: () => void;
  onDelete: (hospitalId: number) => void;
  onUpdateBeds: (hospitalId: number, bedsAvailable: number) => void;
};

function HospitalManagement({ hospitals, isLoading, onRefresh, onAdd, onDelete, onUpdateBeds }: HospitalManagementProps) {
  const [bedsDraft, setBedsDraft] = useState<Record<number, string>>({});
  const saveTimersRef = useRef<Map<number, number>>(new Map());

  const rows = useMemo(() => {
    const normalized = hospitals.map((h) => ({ ...h, name: h.name ?? "" }));
    normalized.sort((a, b) => a.name.localeCompare(b.name));
    return normalized;
  }, [hospitals]);

  useEffect(() => {
    const next: Record<number, string> = {};
    for (const h of hospitals) {
      const beds = typeof h.beds_available === "number" && Number.isFinite(h.beds_available) ? Math.max(0, Math.floor(h.beds_available)) : 0;
      next[h.id] = String(beds);
    }
    setBedsDraft(next);
  }, [hospitals]);

  const scheduleBedsSave = (hospitalId: number, nextValue: string) => {
    setBedsDraft((prev) => ({ ...prev, [hospitalId]: nextValue }));

    const existing = saveTimersRef.current.get(hospitalId);
    if (existing) window.clearTimeout(existing);

    const timeoutId = window.setTimeout(() => {
      const parsed = Number(nextValue);
      const bedsAvailable = Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
      onUpdateBeds(hospitalId, bedsAvailable);
    }, 650);

    saveTimersRef.current.set(hospitalId, timeoutId);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Hospital Directory</h1>
          <p className="text-sm font-semibold text-slate-500">Manage partner hospitals shown to patients for transparent referrals.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-black text-white hover:bg-slate-800 transition-colors duration-200"
          >
            + Add Hospital
          </button>
        </div>
      </div>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-black text-slate-900 flex items-center gap-2">
            <Activity className="text-blue-600" size={18} /> Partner Hospitals
          </h2>
          <span className="text-xs font-black text-slate-500 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
            {isLoading ? "Loading..." : `${rows.length} hospitals`}
          </span>
        </div>

        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Hospital</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Specialty</th>
                <th className="px-6 py-4">Beds</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="h-3 w-40 bg-slate-100 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3 w-14 bg-slate-100 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4" />
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <p className="text-sm font-black text-slate-900">No hospitals found.</p>
                    <p className="mt-2 text-sm font-semibold text-slate-500">Add one to populate the public directory.</p>
                  </td>
                </tr>
              ) : (
                rows.map((h) => (
                  <tr key={h.id} className="group hover:bg-slate-50/60 transition-all duration-200">
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-slate-900">{h.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{h.location}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{h.specialty}</td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min={0}
                        value={bedsDraft[h.id] ?? "0"}
                        onChange={(e) => {
                          scheduleBedsSave(h.id, e.target.value);
                        }}
                        className="w-24 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                        aria-label={`Beds available for ${h.name}`}
                        title="Beds Available (auto-saves)"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{h.contact || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDelete(h.id)}
                        className="inline-flex items-center rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[11px] font-black text-rose-700 hover:bg-rose-100 transition-colors"
                        title="Remove hospital"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

type DonorDatabaseProps = {
  donors: Donor[];
  donations: Donation[];
  onAddManualDonation: () => void;
};

function DonorDatabase({ donors, donations, onAddManualDonation }: DonorDatabaseProps) {
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

  const parseTotalDonated = (value: Donor["total_donated"]) => {
    if (typeof value === "number") return value;
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const donationRollups = useMemo(() => {
    const totals = new Map<number, number>();
    const latest = new Map<number, Donation>();

    for (const d of donations) {
      const amount = parseAmount(d.amount);
      totals.set(d.donor, (totals.get(d.donor) ?? 0) + amount);

      const existing = latest.get(d.donor);
      if (!existing) {
        latest.set(d.donor, d);
        continue;
      }
      const existingTime = new Date(existing.date).getTime();
      const nextTime = new Date(d.date).getTime();
      if (nextTime > existingTime) latest.set(d.donor, d);
    }

    return { totals, latest };
  }, [donations]);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;

  const thisMonthTotal = useMemo(() => {
    return donations.reduce((sum, d) => {
      const dt = new Date(d.date);
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      if (key !== monthKey) return sum;
      return sum + parseAmount(d.amount);
    }, 0);
  }, [donations, monthKey]);

  const totalFunding = useMemo(() => {
    return donations.reduce((sum, d) => sum + parseAmount(d.amount), 0);
  }, [donations]);

  const activeDonors = useMemo(() => {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).getTime();
    return donors.filter((donor) => {
      const latest = donationRollups.latest.get(donor.id);
      if (!latest) return false;
      return new Date(latest.date).getTime() >= ninetyDaysAgo;
    }).length;
  }, [donors, donationRollups.latest]);

  const monthlyGoal = 500000;
  const progressPct = Math.min(100, Math.round((thisMonthTotal / monthlyGoal) * 100));

  const tableRows = useMemo(() => {
    const normalized = donors.map((d) => ({ ...d, name: d.name ?? "" }));
    normalized.sort((a, b) => a.name.localeCompare(b.name));
    return normalized;
  }, [donors]);

  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Donor Insights</h1>
          <p className="text-sm font-semibold text-slate-500">Track donations, donor type, and allocations.</p>
        </div>
        <button
          type="button"
          onClick={onAddManualDonation}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-black text-white hover:bg-slate-800 transition-colors duration-200 active:scale-[0.98] hover:-translate-y-[1px] hover:shadow-lg"
        >
          + Add Manual Donation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Funding", value: formatINR(totalFunding), tone: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Donors", value: String(activeDonors), tone: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "This Month's Goal", value: `${formatINR(thisMonthTotal)} / ${formatINR(monthlyGoal)}`, tone: "text-amber-700", bg: "bg-amber-50" },
        ].map((card) => (
          <div key={card.label} className={`bg-white rounded-3xl border border-slate-100 shadow-sm p-6 ${HOVER_LIFT_CARD}`}>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
            <p className={`mt-2 text-xl font-black ${card.tone}`}>{card.value}</p>
            {card.label === "This Month's Goal" && (
              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${progressPct}%` }}></div>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500">{progressPct}% of target achieved</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Donor</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Total Donated</th>
                <th className="px-6 py-4">Last Donation</th>
                <th className="px-6 py-4">Donation Type</th>
                <th className="px-6 py-4">Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-sm font-semibold text-slate-500 text-center">
                    No donors found. Start by adding a manual donation.
                  </td>
                </tr>
              ) : (
                tableRows.map((donor) => {
                  const latest = donationRollups.latest.get(donor.id);
                  const total = donationRollups.totals.get(donor.id) ?? parseTotalDonated(donor.total_donated);
                  const donorTypeLabel = donor.donor_type === "corporate" ? "Corporate" : "Individual";
                  const donationTypeLabel =
                    latest?.donation_type === "monthly" ? "Monthly" : latest?.donation_type === "one_time" ? "One-time" : "—";
                  const allocationLabel = latest
                    ? latest.purpose === "ngo_support"
                      ? latest.ngo_details?.name ?? "NGO Support"
                      : latest.workshop_details?.title ?? "Workshop"
                    : "—";

                  return (
                    <tr key={donor.id} className="group hover:bg-slate-50/60 transition-all duration-200 active:bg-slate-100/70">
                      <td className="px-6 py-4">
                        <p className="text-base font-semibold text-slate-900 transition-transform duration-200 group-hover:translate-x-0.5">
                          {donor.name}
                        </p>
                        <p className="text-xs font-semibold text-slate-500 truncate transition-transform duration-200 group-hover:translate-x-0.5">
                          {donor.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                            donor.donor_type === "corporate"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {donorTypeLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-slate-900">{formatINR(total)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">{formatDate(latest?.date ?? donor.last_donation_date)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">{donationTypeLabel}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">{allocationLabel}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

type NGOOnboardingModalProps = {
  initialFocus?: string;
  isSubmitting: boolean;
  error: string | null;
  fieldErrors?: Partial<Record<string, string>>;
  onClose: () => void;
  onSubmit: (payload: { name: string; city: string; service_type: string; contact_email: string }) => void;
};

function NGOOnboardingModal({ isSubmitting, error, fieldErrors, onClose, onSubmit }: NGOOnboardingModalProps) {
  const regionOptions = ["Indore", "Bhopal", "Ujjain", "Jabalpur", "Gwalior"] as const;
  const focusAreaOptions = [
    "Maternal Health",
    "Child Nutrition",
    "Blood Donation",
    "Cancer Care",
    "Rural Outreach",
  ] as const;

  const [form, setForm] = useState({
    name: "",
    city: "",
    city_other: "",
    service_type: "",
    service_type_other: "",
    contact_email: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Onboard new NGO"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full w-fit">
              NGO Onboarding
            </p>
            <h3 className="text-xl font-black text-slate-900 mt-2">Onboard New NGO</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Add a partner organization to the system.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-2xl border border-slate-100 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form
          className="p-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setLocalError(null);

            const resolvedCity = form.city === "__other__" ? form.city_other.trim() : form.city.trim();
            const resolvedServiceType =
              form.service_type === "__other__" ? form.service_type_other.trim() : form.service_type.trim();

            if (!resolvedCity) {
              setLocalError("Please select a region (or enter a custom region).");
              return;
            }
            if (!resolvedServiceType) {
              setLocalError("Please select a focus area (or enter a custom focus area).");
              return;
            }

            onSubmit({
              name: form.name.trim(),
              city: resolvedCity,
              service_type: resolvedServiceType,
              contact_email: form.contact_email.trim(),
            });
          }}
        >
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">NGO Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="Indore Care Foundation"
              required
            />
            {fieldErrors?.name && <p className="mt-2 text-xs font-bold text-rose-700">{fieldErrors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Region</label>
              <select
                value={form.city}
                onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                required
              >
                <option value="" disabled>
                  Select region
                </option>
                {regionOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
                <option value="__other__">Other (type manually)</option>
              </select>
              {fieldErrors?.city && <p className="mt-2 text-xs font-bold text-rose-700">{fieldErrors.city}</p>}
              {form.city === "__other__" && (
                <input
                  value={form.city_other}
                  onChange={(e) => setForm((s) => ({ ...s, city_other: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Type region"
                  required
                />
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Focus Area</label>
              <select
                value={form.service_type}
                onChange={(e) => setForm((s) => ({ ...s, service_type: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                required
              >
                <option value="" disabled>
                  Select focus area
                </option>
                {focusAreaOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
                <option value="__other__">Other (type manually)</option>
              </select>
              {fieldErrors?.service_type && (
                <p className="mt-2 text-xs font-bold text-rose-700">{fieldErrors.service_type}</p>
              )}
              {form.service_type === "__other__" && (
                <input
                  value={form.service_type_other}
                  onChange={(e) => setForm((s) => ({ ...s, service_type_other: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Type focus area"
                  required
                />
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Contact Email</label>
            <input
              value={form.contact_email}
              onChange={(e) => setForm((s) => ({ ...s, contact_email: e.target.value }))}
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="contact@ngo.org"
              required
            />
            {fieldErrors?.contact_email && (
              <p className="mt-2 text-xs font-bold text-rose-700">{fieldErrors.contact_email}</p>
            )}
          </div>

          {(fieldErrors?.registration_number || fieldErrors?.non_field_errors) && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
              <p className="text-sm font-bold text-rose-700">
                {fieldErrors?.registration_number ?? fieldErrors?.non_field_errors}
              </p>
            </div>
          )}

          {localError && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="text-sm font-bold text-amber-800">{localError}</p>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
              <p className="text-sm font-bold text-rose-700">{error}</p>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 transition-colors duration-200 disabled:opacity-60 disabled:hover:bg-blue-600"
            >
              {isSubmitting ? "Saving..." : "Onboard NGO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type ManualDonationModalProps = {
  ngos: NGO[];
  workshops: Array<{ id: number; title: string; date: string; ngo: number }>;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: {
    donor_name: string;
    donor_email: string;
    donor_type: Donor["donor_type"];
    amount: number;
    donation_type: Donation["donation_type"];
    allocation_kind: "workshop" | "ngo_support";
    allocation_id: number | null;
  }) => void;
};

function ManualDonationModal({ ngos, workshops, isSubmitting, error, onClose, onSubmit }: ManualDonationModalProps) {
  const [form, setForm] = useState({
    donor_name: "",
    donor_email: "",
    donor_type: "individual" as Donor["donor_type"],
    amount: "",
    donation_type: "one_time" as Donation["donation_type"],
    allocation_kind: "workshop" as "workshop" | "ngo_support",
    allocation_id: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const workshopOptions = useMemo(() => {
    const normalized = [...workshops];
    normalized.sort((a, b) => a.title.localeCompare(b.title));
    return normalized;
  }, [workshops]);

  const ngoOptions = useMemo(() => {
    const normalized = [...ngos];
    normalized.sort((a, b) => a.name.localeCompare(b.name));
    return normalized;
  }, [ngos]);

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add manual donation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full w-fit">
              Donor Database
            </p>
            <h3 className="text-xl font-black text-slate-900 mt-2">Add Manual Donation</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Quickly record funding for tracking and allocation.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-2xl border border-slate-100 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form
          className="p-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setLocalError(null);

            const amount = Number(form.amount);
            if (!Number.isFinite(amount) || amount <= 0) {
              setLocalError("Please enter a valid donation amount.");
              return;
            }

            const allocationId = form.allocation_id ? Number(form.allocation_id) : null;
            if (form.allocation_kind === "workshop" && !allocationId) {
              setLocalError("Please select a workshop allocation.");
              return;
            }
            if (form.allocation_kind === "ngo_support" && !allocationId) {
              setLocalError("Please select an NGO allocation.");
              return;
            }

            onSubmit({
              donor_name: form.donor_name.trim(),
              donor_email: form.donor_email.trim(),
              donor_type: form.donor_type,
              amount,
              donation_type: form.donation_type,
              allocation_kind: form.allocation_kind,
              allocation_id: allocationId,
            });
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Donor Name</label>
              <input
                value={form.donor_name}
                onChange={(e) => setForm((s) => ({ ...s, donor_name: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Aarav Sharma"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
              <input
                value={form.donor_email}
                onChange={(e) => setForm((s) => ({ ...s, donor_email: e.target.value }))}
                type="email"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="donor@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Type</label>
              <select
                value={form.donor_type}
                onChange={(e) => setForm((s) => ({ ...s, donor_type: e.target.value as Donor["donor_type"] }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              >
                <option value="individual">Individual</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Amount</label>
              <input
                value={form.amount}
                onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
                type="number"
                min="1"
                step="1"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="10000"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Donation Type</label>
              <select
                value={form.donation_type}
                onChange={(e) => setForm((s) => ({ ...s, donation_type: e.target.value as Donation["donation_type"] }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              >
                <option value="one_time">One-time</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Allocation</label>
              <select
                value={form.allocation_kind}
                onChange={(e) =>
                  setForm((s) => ({ ...s, allocation_kind: e.target.value as "workshop" | "ngo_support", allocation_id: "" }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              >
                <option value="workshop">Workshop</option>
                <option value="ngo_support">NGO Support</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                {form.allocation_kind === "workshop" ? "Workshop" : "NGO"}
              </label>
              <select
                value={form.allocation_id}
                onChange={(e) => setForm((s) => ({ ...s, allocation_id: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                required
              >
                <option value="" disabled>
                  Select {form.allocation_kind === "workshop" ? "workshop" : "NGO"}
                </option>
                {form.allocation_kind === "workshop"
                  ? workshopOptions.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.title}
                      </option>
                    ))
                  : ngoOptions.map((ngo) => (
                      <option key={ngo.id} value={ngo.id}>
                        {ngo.name}
                      </option>
                    ))}
              </select>
            </div>
          </div>

          {localError && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="text-sm font-bold text-amber-800">{localError}</p>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
              <p className="text-sm font-bold text-rose-700">{error}</p>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 transition-colors duration-200 disabled:opacity-60 disabled:hover:bg-blue-600"
            >
              {isSubmitting ? "Saving..." : "Add Donation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type AddHospitalModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  form: { name: string; location: string; specialty: string; contact: string; beds_available: string };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; location: string; specialty: string; contact: string; beds_available: string }>>;
  onClose: () => void;
  onSubmit: () => void;
};

function AddHospitalModal({ isOpen, isSubmitting, error, form, setForm, onClose, onSubmit }: AddHospitalModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Add hospital"
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full w-fit">
              Directory
            </p>
            <h3 className="text-xl font-black text-slate-900 mt-2">Add Partner Hospital</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">This will appear on `/hospitals`.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-2xl border border-slate-100 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center"
            aria-label="Close"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600">Hospital Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                placeholder="Bombay Hospital"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                placeholder="Indore"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600">Specialty</label>
              <input
                value={form.specialty}
                onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                placeholder="Cardiology"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600">Contact</label>
              <input
                value={form.contact}
                onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                placeholder="help@hospital.org or +91 9xxxx xxxxx"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600">Beds Available</label>
              <input
                type="number"
                min={0}
                value={form.beds_available}
                onChange={(e) => setForm((p) => ({ ...p, beds_available: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                placeholder="12"
              />
              <p className="text-[11px] font-bold text-slate-400">Shown live on the public hospital directory.</p>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
              <p className="text-sm font-bold text-rose-700">{error}</p>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting || !form.name.trim() || !form.location.trim() || !form.specialty.trim()}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 transition-colors duration-200 disabled:opacity-60 disabled:hover:bg-blue-600"
            >
              {isSubmitting ? "Adding..." : "Add Hospital"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [roleFilter, setRoleFilter] = useState<WorkshopRoleFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsRegistration, setDetailsRegistration] = useState<WorkshopRegistration | null>(null);
  const [isVerifyingDetails, setIsVerifyingDetails] = useState(false);
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  const [isBulkVerifying, setIsBulkVerifying] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [customSystemLogs, setCustomSystemLogs] = useState<AdminSystemLogEntry[]>([]);
  const [isNgoGrowthOpen, setIsNgoGrowthOpen] = useState(false);
  const [isNgoOnboardingOpen, setIsNgoOnboardingOpen] = useState(false);
  const [isSubmittingNgo, setIsSubmittingNgo] = useState(false);
  const [ngoOnboardingError, setNgoOnboardingError] = useState<string | null>(null);
  const [ngoOnboardingFieldErrors, setNgoOnboardingFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [isManualDonationOpen, setIsManualDonationOpen] = useState(false);
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);
  const [manualDonationError, setManualDonationError] = useState<string | null>(null);
  const [workshops, setWorkshops] = useState<Array<{ id: number; title: string; date: string; ngo: number }>>([]);
  const [adminProfile, setAdminProfile] = useState({ name: "Admin", email: "admin@medbridge.org" });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [referralSourceRegistration, setReferralSourceRegistration] = useState<WorkshopRegistration | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const hospitalsRef = useRef<Hospital[]>([]);
  const [isHospitalsLoading, setIsHospitalsLoading] = useState(false);
  const [isAddHospitalOpen, setIsAddHospitalOpen] = useState(false);
  const [addHospitalForm, setAddHospitalForm] = useState({ name: "", location: "", specialty: "", contact: "", beds_available: "0" });
  const [addHospitalError, setAddHospitalError] = useState<string | null>(null);
  const [isSubmittingHospital, setIsSubmittingHospital] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [isPatientProfilingOpen, setIsPatientProfilingOpen] = useState(false);
  const [referralUrgency, setReferralUrgency] = useState<Referral["urgency"]>("Normal");
  const [referralReason, setReferralReason] = useState("");
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [ecosystemData, setEcosystemData] = useState<{
    ngos: NGO[];
    patients: PatientProfile[];
    referrals: Referral[];
    registrations: WorkshopRegistration[];
    workshops: Workshop[];
    donors: Donor[];
    donations: Donation[];
  }>({
    ngos: [],
    patients: [],
    referrals: [],
    registrations: [],
    workshops: [],
    donors: [],
    donations: [],
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ADMIN_SYSTEM_LOGS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      setCustomSystemLogs(
        parsed
          .filter((e) => e && typeof e === "object")
          .map((e) => e as Partial<AdminSystemLogEntry>)
          .filter((e) => typeof e.id === "string" && typeof e.title === "string" && typeof e.created_at === "string")
          .slice(0, 60) as AdminSystemLogEntry[]
      );
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    hospitalsRef.current = hospitals;
  }, [hospitals]);

  const refreshHospitals = async () => {
    try {
      setIsHospitalsLoading(true);
      const res = await fetch(apiUrl("/api/hospitals/"), { headers: { Accept: "application/json" } });
      if (!res.ok) {
        setHospitals([]);
        return;
      }
      const data = (await res.json()) as unknown;
      setHospitals(Array.isArray(data) ? (data as Hospital[]) : []);
    } catch (error) {
      console.error("Hospitals fetch error:", error);
      setHospitals([]);
    } finally {
      setIsHospitalsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "hospitals") return;
    void refreshHospitals();
  }, [activeTab]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [ngos, patients, referrals, registrations, workshops, donors, donations] = await Promise.all([
          fetchJsonOrNull<NGO[]>(apiUrl("/api/ngos/")),
          fetchJsonOrNull<PatientProfile[]>(apiUrl("/api/patients/")),
          fetchJsonOrNull<Referral[]>(apiUrl("/api/referrals/")),
          fetchJsonOrNull<WorkshopRegistration[]>(apiUrl("/api/registrations/")),
          fetchJsonOrNull<Workshop[]>(apiUrl("/api/workshops/")),
          fetchJsonOrNull<Donor[]>(apiUrl("/api/donors/")),
          fetchJsonOrNull<Donation[]>(apiUrl("/api/donations/")),
        ]);

        setEcosystemData((prev) => ({
          ngos: Array.isArray(ngos) ? ngos : prev.ngos,
          patients: Array.isArray(patients) ? patients : prev.patients,
          referrals: Array.isArray(referrals) ? referrals : prev.referrals,
          registrations: Array.isArray(registrations) ? registrations : prev.registrations,
          workshops: Array.isArray(workshops) ? workshops : prev.workshops,
          donors: Array.isArray(donors) ? donors : prev.donors,
          donations: Array.isArray(donations) ? donations : prev.donations,
        }));
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
    const intervalId = window.setInterval(loadDashboardData, 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!isManualDonationOpen) return;
    let cancelled = false;
    fetchJsonOrNull<Workshop[]>(apiUrl("/api/workshops/"))
      .then((data) => {
        if (cancelled) return;
        if (!data) return;
        setWorkshops(Array.isArray(data) ? data : []);
      });
    return () => {
      cancelled = true;
    };
  }, [isManualDonationOpen]);

  useEffect(() => {
    if (!isReferralModalOpen && !isDetailsModalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsReferralModalOpen(false);
        setReferralSourceRegistration(null);
        setReferralError(null);
        setIsSubmittingReferral(false);
        setIsDetailsModalOpen(false);
        setDetailsRegistration(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isReferralModalOpen, isDetailsModalOpen]);

  useEffect(() => {
    if (!isProfileModalOpen && !isLogoutConfirmOpen && !isNgoOnboardingOpen && !isManualDonationOpen && !isPatientProfilingOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsProfileModalOpen(false);
      setIsLogoutConfirmOpen(false);
      setIsNgoOnboardingOpen(false);
      setNgoOnboardingError(null);
      setNgoOnboardingFieldErrors({});
      setIsManualDonationOpen(false);
      setManualDonationError(null);
      setIsPatientProfilingOpen(false);
      setSelectedPatient(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isProfileModalOpen, isLogoutConfirmOpen, isNgoOnboardingOpen, isManualDonationOpen, isPatientProfilingOpen]);

  const adminCards = useMemo(
    () => [
      {
        title: "Active NGOs",
        value: isLoading ? "—" : String(ecosystemData.ngos.length),
        icon: Building2,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        title: "Pending Verifications",
        value: isLoading ? "—" : String(ecosystemData.referrals.length),
        icon: ClipboardCheck,
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
      {
        title: "Total Patients",
        value: isLoading ? "—" : String(ecosystemData.patients.length),
        icon: Users,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        title: "Workshop Registrations",
        value: isLoading ? "—" : String(ecosystemData.registrations.length),
        icon: CheckCircle2,
        color: "text-rose-600",
        bg: "bg-rose-50",
      },
    ],
    [ecosystemData.ngos.length, ecosystemData.patients.length, ecosystemData.referrals.length, ecosystemData.registrations.length, isLoading]
  );

  const visibleRegistrations = useMemo(() => {
    const sorted = [...ecosystemData.registrations].sort((a, b) => {
      const aTime = new Date(a.registered_at).getTime();
      const bTime = new Date(b.registered_at).getTime();
      return bTime - aTime;
    });

    const filtered =
      roleFilter === "all" ? sorted : sorted.filter((r) => r.role === roleFilter);

    const term = searchTerm.trim().toLowerCase();
    const searched =
      term.length === 0
        ? filtered
        : filtered.filter((r) => {
            const name = r.full_name?.toLowerCase() ?? "";
            const roleLabel = formatRole(r.role)?.toLowerCase() ?? "";
            const roleRaw = r.role?.toLowerCase() ?? "";
            return name.includes(term) || roleLabel.includes(term) || roleRaw.includes(term);
          });

    return searched.slice(0, 6);
  }, [ecosystemData.registrations, roleFilter, searchTerm]);

  const pendingVerifications = useMemo(() => {
    return ecosystemData.registrations.filter((r) => {
      const statusNormalized = (r.status ?? "").toLowerCase();
      return statusNormalized !== "verified";
    });
  }, [ecosystemData.registrations]);

  const filteredPendingVerifications = useMemo(() => {
    const sorted = [...pendingVerifications].sort((a, b) => {
      const aTime = new Date(a.registered_at).getTime();
      const bTime = new Date(b.registered_at).getTime();
      return bTime - aTime;
    });

    const filtered =
      roleFilter === "all" ? sorted : sorted.filter((r) => r.role === roleFilter);

    const term = searchTerm.trim().toLowerCase();
    const searched =
      term.length === 0
        ? filtered
        : filtered.filter((r) => {
            const name = r.full_name?.toLowerCase() ?? "";
            const roleLabel = formatRole(r.role)?.toLowerCase() ?? "";
            const roleRaw = r.role?.toLowerCase() ?? "";
            return name.includes(term) || roleLabel.includes(term) || roleRaw.includes(term);
          });

    return searched;
  }, [pendingVerifications, roleFilter, searchTerm]);

  const roleSplit = useMemo(() => {
    const volunteers = ecosystemData.registrations.filter((r) => r.role === "volunteer").length;
    const attendees = ecosystemData.registrations.filter((r) => r.role === "patient").length;
    const total = volunteers + attendees;
    const volunteerPct = total === 0 ? 0 : Math.round((volunteers / total) * 100);
    const attendeePct = total === 0 ? 0 : 100 - volunteerPct;
    return { volunteers, attendees, total, volunteerPct, attendeePct };
  }, [ecosystemData.registrations]);

  const selectedHospital = useMemo(() => {
    if (!selectedHospitalId) return null;
    return hospitals.find((h) => h.id === selectedHospitalId) ?? null;
  }, [hospitals, selectedHospitalId]);

  const indoreNgoLabel = useMemo(() => {
    return (
      ecosystemData.ngos.find((n) => (n.name ?? "").toLowerCase().includes("indore"))?.name ??
      "Indore"
    );
  }, [ecosystemData.ngos]);

  const ujjainNgoLabel = useMemo(() => {
    return (
      ecosystemData.ngos.find((n) => (n.name ?? "").toLowerCase().includes("ujjain"))?.name ??
      "Ujjain"
    );
  }, [ecosystemData.ngos]);

  const handleVerifyRegistration = async (registrationId: number): Promise<boolean> => {
    try {
      const response = await fetch(apiUrl(`/api/registrations/${registrationId}/`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "verified" }),
      });

      if (!response.ok) return false;

      setEcosystemData((prev) => ({
        ...prev,
        registrations: prev.registrations.map((r) => (r.id === registrationId ? { ...r, status: "verified" } : r)),
      }));

      return true;
    } catch (error) {
      console.error("Verify registration error:", error);
      return false;
    }
  };

  const pushToast = (message: string, variant: Toast["variant"] = "info") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const appendSystemLog = (entry: Omit<AdminSystemLogEntry, "id" | "created_at"> & { id?: string; created_at?: string }) => {
    const next: AdminSystemLogEntry = {
      id: entry.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      tone: entry.tone,
      title: entry.title,
      detail: entry.detail,
      created_at: entry.created_at ?? new Date().toISOString(),
    };

    setCustomSystemLogs((prev) => {
      const merged = [next, ...prev].slice(0, 60);
      try {
        window.localStorage.setItem(ADMIN_SYSTEM_LOGS_STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // ignore
      }
      return merged;
    });
  };

  const sendWorkshopReminders = async (workshopId: number, workshopTitle: string) => {
    if (isSendingReminders) return;
    try {
      setIsSendingReminders(true);
      const res = await fetch(apiUrl(`/api/workshops/${workshopId}/send-reminders/`), {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        pushToast("Failed to send reminders.", "error");
        return;
      }

      const payload = (await res.json()) as { participants?: number; workshop_title?: string };
      const count = typeof payload.participants === "number" ? payload.participants : 0;
      pushToast(`Reminders sent to ${count} participants via SMS/Email!`, "success");
      appendSystemLog({
        tone: "info",
        title: `Admin sent workshop reminders for ${payload.workshop_title ?? workshopTitle}`,
        detail: `Reminders dispatched to ${count} participants (SMS/Email simulation).`,
      });
    } catch (error) {
      console.error("Send reminders error:", error);
      pushToast("Failed to send reminders.", "error");
    } finally {
      setIsSendingReminders(false);
    }
  };

  const openNgoManagementFromAlert = () => {
    setActiveTab("ngo");
    pushToast("Opened NGO Management for verification review.", "info");
  };

  const openVerificationQueueFromAlert = () => {
    setActiveTab("verification_queue");
    pushToast("Opened Verification Queue.", "info");
  };

  const showAllClearToast = () => {
    pushToast("Everything is up to date! No pending actions.", "info");
  };

  const openSystemLogsFromReport = () => {
    setActiveTab("logs");
    pushToast("Opened System Logs.", "info");
  };

  const downloadReportPdfUiOnly = (reportName: string) => {
    pushToast(`${reportName}: PDF export UI coming soon.`, "info");
  };

  const openAddHospital = () => {
    setAddHospitalError(null);
    setAddHospitalForm({ name: "", location: "", specialty: "", contact: "", beds_available: "0" });
    setIsAddHospitalOpen(true);
  };

  const closeAddHospital = () => {
    setIsAddHospitalOpen(false);
    setAddHospitalError(null);
  };

  const submitAddHospital = async () => {
    if (isSubmittingHospital) return;
    const bedsParsed = Number(addHospitalForm.beds_available);
    const bedsAvailable = Number.isFinite(bedsParsed) && bedsParsed >= 0 ? Math.floor(bedsParsed) : 0;
    const payload = {
      name: addHospitalForm.name.trim(),
      location: addHospitalForm.location.trim(),
      specialty: addHospitalForm.specialty.trim(),
      contact: addHospitalForm.contact.trim(),
      beds_available: bedsAvailable,
    };

    if (!payload.name || !payload.location || !payload.specialty) {
      setAddHospitalError("Please fill in name, location, and specialty.");
      return;
    }

    try {
      setIsSubmittingHospital(true);
      setAddHospitalError(null);
      const res = await fetch(apiUrl("/api/hospitals/"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = (typeof body === "object" && body && (body.detail as string)) || "Failed to add hospital.";
        setAddHospitalError(message);
        return;
      }

      pushToast(`Hospital "${payload.name}" added.`, "success");
      appendSystemLog({
        tone: "info",
        title: `Admin added partner hospital: ${payload.name}`,
        detail: `Location: ${payload.location} • Specialty: ${payload.specialty} • Beds: ${payload.beds_available}`,
      });
      closeAddHospital();
      await refreshHospitals();
    } catch (error) {
      console.error("Add hospital error:", error);
      setAddHospitalError("Failed to add hospital.");
    } finally {
      setIsSubmittingHospital(false);
    }
  };

  const deleteHospital = async (hospitalId: number) => {
    const target = hospitals.find((h) => h.id === hospitalId);
    const label = target?.name ?? `#${hospitalId}`;
    if (!window.confirm(`Remove hospital ${label}?`)) return;

    try {
      const res = await fetch(apiUrl(`/api/hospitals/${hospitalId}/`), { method: "DELETE" });
      if (!res.ok) {
        pushToast("Failed to remove hospital.", "error");
        return;
      }
      pushToast("Hospital removed.", "success");
      appendSystemLog({ tone: "info", title: `Admin removed partner hospital: ${label}` });
      await refreshHospitals();
    } catch (error) {
      console.error("Delete hospital error:", error);
      pushToast("Failed to remove hospital.", "error");
    }
  };

  const updateHospitalBeds = async (hospitalId: number, bedsAvailable: number) => {
    const existing = hospitalsRef.current.find((h) => h.id === hospitalId);
    const existingBeds =
      typeof existing?.beds_available === "number" && Number.isFinite(existing.beds_available) ? Math.max(0, Math.floor(existing.beds_available)) : 0;
    const hospitalName = existing?.name ?? `Hospital #${hospitalId}`;

    if (existingBeds === bedsAvailable) return;

    setHospitals((prev) => prev.map((h) => (h.id === hospitalId ? { ...h, beds_available: bedsAvailable } : h)));

    try {
      const res = await fetch(apiUrl(`/api/hospitals/${hospitalId}/`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ beds_available: bedsAvailable }),
      });
      if (!res.ok) {
        pushToast("Failed to update beds availability.", "error");
        await refreshHospitals();
        return;
      }

      appendSystemLog({
        tone: "info",
        title: `Admin updated bed availability for ${hospitalName} to ${bedsAvailable}`,
      });
    } catch (error) {
      console.error("Update beds error:", error);
      pushToast("Failed to update beds availability.", "error");
      await refreshHospitals();
    }
  };

  const verifyRegistrationWithToast = async (registration: WorkshopRegistration) => {
    if (!registration.id_proof_url) {
      pushToast(`${registration.full_name} has no document uploaded.`, "error");
      return false;
    }

    const ok = await handleVerifyRegistration(registration.id);
    if (ok) {
      pushToast(`${registration.full_name} verified successfully!`, "success");
    } else {
      pushToast(`Failed to verify ${registration.full_name}.`, "error");
    }
    return ok;
  };

  const openRegistrationDetails = (registration: WorkshopRegistration) => {
    setDetailsRegistration(registration);
    setIsDetailsModalOpen(true);
  };

  const closeRegistrationDetails = () => {
    setIsDetailsModalOpen(false);
    setDetailsRegistration(null);
  };

  const headerNotifications = useMemo<HeaderNotification[]>(() => {
    const formatINR = (value: number) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value);

    const pendingKiara =
      ecosystemData.registrations.find((r) => (r.full_name ?? "").toLowerCase().includes("kiara")) ?? null;
    const isKiaraPending = pendingKiara ? (pendingKiara.status ?? "").toLowerCase() !== "verified" : true;
    const hasKiaraDoc = Boolean(pendingKiara?.id_proof_url);

    const latestDonation = [...ecosystemData.donations].sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();
      return bTime - aTime;
    })[0];
    const donationAmount = latestDonation ? Number(latestDonation.amount) : 5000;
    const donorName =
      latestDonation?.donor_details?.name ??
      ecosystemData.donors.find((d) => d.id === latestDonation?.donor)?.name ??
      "David Roy";

    const ngoName = ecosystemData.ngos.find((n) => (n.name ?? "").toLowerCase().includes("indore care foundation"))?.name ??
      "Indore Care Foundation";

    return [
      {
        id: "verify-now",
        tone: "urgent",
        title: hasKiaraDoc && isKiaraPending ? "Kiara Sharma uploaded a document. Verify now!" : "Urgent verifications pending. Review now!",
        description: "Go to Verification Queue and approve pending registrations.",
        timeLabel: timeAgoLabel(pendingKiara?.registered_at),
      },
      {
        id: "donation-received",
        tone: "update",
        title: `New Donation of ${formatINR(Number.isFinite(donationAmount) ? donationAmount : 5000)} received from ${donorName}.`,
        description: "Check Donor Database for transaction details.",
        timeLabel: timeAgoLabel(latestDonation?.date),
      },
      {
        id: "license-expiring",
        tone: "alert",
        title: `NGO ${ngoName}'s license is expiring soon.`,
        description: "Follow up with the NGO and request renewal documents.",
        timeLabel: "Today",
      },
    ];
  }, [ecosystemData.registrations, ecosystemData.donations, ecosystemData.donors, ecosystemData.ngos]);

  const handleVerifyAllPending = async (registrations: WorkshopRegistration[]) => {
    if (isBulkVerifying) return;
    const targets = registrations.filter((r) => (r.status ?? "").toLowerCase() !== "verified");
    const withoutDocs = targets.filter((r) => !r.id_proof_url);
    const withDocs = targets.filter((r) => Boolean(r.id_proof_url));
    if (targets.length === 0) return;

    try {
      setIsBulkVerifying(true);
      let verifiedCount = 0;
      let failedCount = 0;

      for (const reg of withDocs) {
        const ok = await handleVerifyRegistration(reg.id);
        if (ok) verifiedCount += 1;
        else failedCount += 1;
      }

      if (verifiedCount > 0) pushToast(`${verifiedCount} registrations verified successfully.`, "success");
      if (withoutDocs.length > 0) pushToast(`${withoutDocs.length} skipped (document missing).`, "info");
      if (failedCount > 0) pushToast(`${failedCount} failed to verify.`, "error");
    } finally {
      setIsBulkVerifying(false);
    }
  };

  const openReferralModal = async (registration: WorkshopRegistration) => {
    setReferralSourceRegistration(registration);
    setReferralError(null);
    setReferralReason("");
    setReferralUrgency("Normal");
    setSelectedHospitalId(null);
    setSelectedPatientId(null);
    setIsSubmittingReferral(false);
    setIsReferralModalOpen(true);

    try {
      const data = await fetch(apiUrl("/api/hospitals/")).then((res) => res.json() as Promise<Hospital[]>);
      setHospitals(Array.isArray(data) ? data : []);

      const ngoId = registration.workshop_details?.ngo;
      const matchingPatients = ecosystemData.patients.filter((p) => {
        const matchesNgo = typeof ngoId === "number" ? p.ngo === ngoId : true;
        return matchesNgo && p.full_name.trim().toLowerCase() === registration.full_name.trim().toLowerCase();
      });

      if (matchingPatients.length === 1) {
        setSelectedPatientId(matchingPatients[0].id);
      }
    } catch (error) {
      console.error("Hospitals fetch error:", error);
      setHospitals([]);
    }
  };

  const closeReferralModal = () => {
    setIsReferralModalOpen(false);
    setReferralSourceRegistration(null);
    setReferralError(null);
    setIsSubmittingReferral(false);
  };

  const openPatientProfiling = (patient: PatientProfile) => {
    setSelectedPatient(patient);
    setIsPatientProfilingOpen(true);
  };

  const closePatientProfiling = () => {
    setIsPatientProfilingOpen(false);
    setSelectedPatient(null);
  };

  const submitReferral = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!referralSourceRegistration) return;

    const ngoId = referralSourceRegistration.workshop_details?.ngo;
    if (!ngoId) {
      setReferralError("Missing NGO for this registration. Please refresh and try again.");
      return;
    }

    if (!selectedPatientId) {
      setReferralError("Please select a patient for this referral.");
      return;
    }

    if (!selectedHospitalId) {
      setReferralError("Please select a hospital.");
      return;
    }

    if (!referralReason.trim()) {
      setReferralError("Please add a reason for referral.");
      return;
    }

    setIsSubmittingReferral(true);
    setReferralError(null);

    try {
      const response = await fetch(apiUrl("/api/referrals/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient: selectedPatientId,
          from_ngo: ngoId,
          to_hospital: selectedHospitalId,
          reason: referralReason.trim(),
          urgency: referralUrgency,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          (typeof body === "object" && body && (body.detail as string)) || "Referral creation failed. Please try again.";
        setReferralError(message);
        setIsSubmittingReferral(false);
        return;
      }

      const created = (await response.json().catch(() => null)) as Referral | null;
      if (created && typeof created === "object" && typeof created.id === "number") {
        setEcosystemData((prev) => ({ ...prev, referrals: [created, ...prev.referrals] }));
      }

      closeReferralModal();
    } catch (error) {
      console.error("Referral submit error:", error);
      setReferralError("Network error. Please check backend and try again.");
      setIsSubmittingReferral(false);
    }
  };

  const handleAdvanceReferral = async (referralId: number, nextStatus: (typeof referralStages)[number]) => {
    try {
      const response = await fetch(apiUrl(`/api/referrals/${referralId}/`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) return;

      setEcosystemData((prev) => ({
        ...prev,
        referrals: prev.referrals.map((r) => (r.id === referralId ? { ...r, status: nextStatus } : r)),
      }));
    } catch (error) {
      console.error("Referral status update error:", error);
    }
  };
  
  const requestLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } finally {
      setIsLogoutConfirmOpen(false);
      router.push("/");
    }
  };

  const openNgoOnboarding = () => {
    setNgoOnboardingError(null);
    setNgoOnboardingFieldErrors({});
    setIsNgoOnboardingOpen(true);
  };

  const closeNgoOnboarding = () => {
    if (isSubmittingNgo) return;
    setIsNgoOnboardingOpen(false);
    setNgoOnboardingError(null);
    setNgoOnboardingFieldErrors({});
  };

  const openManualDonation = () => {
    setManualDonationError(null);
    setIsManualDonationOpen(true);
  };

  const closeManualDonation = () => {
    if (isSubmittingDonation) return;
    setIsManualDonationOpen(false);
    setManualDonationError(null);
  };

  const submitManualDonation = async (payload: {
    donor_name: string;
    donor_email: string;
    donor_type: Donor["donor_type"];
    amount: number;
    donation_type: Donation["donation_type"];
    allocation_kind: "workshop" | "ngo_support";
    allocation_id: number | null;
  }) => {
    if (isSubmittingDonation) return;

    setIsSubmittingDonation(true);
    setManualDonationError(null);

    try {
      const normalizedEmail = payload.donor_email.trim().toLowerCase();
      let donorId: number | null = null;
      let donorRecord: Donor | null = null;

      const donorCreateRes = await fetch(apiUrl("/api/donors/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.donor_name,
          email: normalizedEmail,
          donor_type: payload.donor_type,
        }),
      });

      if (donorCreateRes.ok) {
        donorRecord = (await donorCreateRes.json()) as Donor;
        donorId = donorRecord.id;
        setEcosystemData((prev) => ({ ...prev, donors: [donorRecord!, ...prev.donors] }));
      } else {
        // Donor likely exists (email unique). Try finding it from current state, else refetch donors.
        const existingInState = ecosystemData.donors.find((d) => d.email.toLowerCase() === normalizedEmail);
        if (existingInState) {
          donorId = existingInState.id;
          donorRecord = existingInState;
        } else {
          const donorsRes = await fetch(apiUrl("/api/donors/"));
          const donorsData = (await donorsRes.json()) as Donor[];
          const match = Array.isArray(donorsData)
            ? donorsData.find((d) => d.email.toLowerCase() === normalizedEmail)
            : undefined;
          if (match) {
            donorId = match.id;
            donorRecord = match;
            setEcosystemData((prev) => ({ ...prev, donors: donorsData }));
          }
        }
      }

      if (!donorId) {
        setManualDonationError("Could not resolve donor. Please try again.");
        return;
      }

      const donationRes = await fetch(apiUrl("/api/donations/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donor: donorId,
          amount: payload.amount,
          donation_type: payload.donation_type,
          purpose: payload.allocation_kind,
          ngo: payload.allocation_kind === "ngo_support" ? payload.allocation_id : null,
          workshop: payload.allocation_kind === "workshop" ? payload.allocation_id : null,
        }),
      });

      if (!donationRes.ok) {
        const errorBody = await donationRes.json().catch(() => null);
        let message = "Failed to add donation. Please try again.";
        if (typeof errorBody === "object" && errorBody) {
          const entries = Object.entries(errorBody as Record<string, unknown>);
          const first = entries.find(([, v]) => v != null);
          const firstValue = first?.[1];
          if (typeof firstValue === "string" && firstValue.trim()) {
            message = firstValue;
          } else if (Array.isArray(firstValue) && typeof firstValue[0] === "string") {
            message = firstValue[0];
          }
        }
        setManualDonationError(message);
        return;
      }

      const createdDonation = (await donationRes.json()) as Donation;
      // Ensure allocation name shows up instantly even if backend returns minimal details.
      const enrichedDonation: Donation = {
        ...createdDonation,
        donor_details: createdDonation.donor_details ?? (donorRecord ?? undefined),
        ngo_details:
          createdDonation.ngo_details ??
          (payload.allocation_kind === "ngo_support"
            ? ecosystemData.ngos.find((n) => n.id === payload.allocation_id) ?? null
            : null),
        workshop_details:
          createdDonation.workshop_details ??
          (payload.allocation_kind === "workshop"
            ? workshops.find((w) => w.id === payload.allocation_id) ?? null
            : null),
      };

      setEcosystemData((prev) => ({ ...prev, donations: [enrichedDonation, ...prev.donations] }));
      pushToast("Donation added successfully!", "success");
      setIsManualDonationOpen(false);
    } catch (error) {
      console.error("Manual donation error:", error);
      setManualDonationError("Network error. Please check backend and try again.");
    } finally {
      setIsSubmittingDonation(false);
    }
  };

  const submitNgoOnboarding = async (payload: {
    name: string;
    city: string;
    service_type: string;
    contact_email: string;
  }) => {
    if (isSubmittingNgo) return;

    setIsSubmittingNgo(true);
    setNgoOnboardingError(null);
    setNgoOnboardingFieldErrors({});

    try {
      const response = await fetch(apiUrl("/api/ngos/"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: payload.name,
          city: payload.city,
          service_type: payload.service_type,
          contact_email: payload.contact_email,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        let message = "Failed to onboard NGO. Please try again.";
        const fieldErrors: Partial<Record<string, string>> = {};
        if (typeof errorBody === "object" && errorBody) {
          for (const [key, value] of Object.entries(errorBody as Record<string, unknown>)) {
            if (typeof value === "string" && value.trim()) fieldErrors[key] = value;
            else if (Array.isArray(value) && typeof value[0] === "string") fieldErrors[key] = value[0];
          }
          const firstField = Object.keys(fieldErrors)[0];
          if (firstField) message = fieldErrors[firstField] ?? message;
        }
        setNgoOnboardingFieldErrors(fieldErrors);
        setNgoOnboardingError(message);
        return;
      }

      const created = (await response.json()) as NGO;
      setEcosystemData((prev) => ({ ...prev, ngos: [created, ...prev.ngos] }));
      pushToast(`${created.name} onboarded successfully!`, "success");
      setIsNgoOnboardingOpen(false);
    } catch (error) {
      console.error("NGO onboarding error:", error);
      setNgoOnboardingError("Network error. Please check backend and try again.");
    } finally {
      setIsSubmittingNgo(false);
    }
  };

  return (
    <div className="flex bg-[#F8FAFC] antialiased text-slate-900 font-sans h-screen overflow-hidden relative">
      {toasts.length > 0 && <Toasts toasts={toasts} onDismiss={dismissToast} />}
      <SmartPatientProfilingModal
        open={isPatientProfilingOpen}
        patientData={
          selectedPatient
            ? {
                full_name: selectedPatient.full_name,
                patient_id: selectedPatient.patient_id,
                blood_group: selectedPatient.blood_group,
                created_at: selectedPatient.created_at,
                last_checkup: selectedPatient.created_at,
                ngo_name: ecosystemData.ngos.find((n) => n.id === selectedPatient.ngo)?.name ?? null,
              }
            : null
        }
        onClose={closePatientProfiling}
      />
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        name={adminProfile.name}
        email={adminProfile.email}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={(next) => {
          setAdminProfile({ name: next.name, email: next.email });
          setIsProfileModalOpen(false);
          pushToast("Profile updated successfully!", "success");
        }}
      />
      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={confirmLogout}
      />
      {isNgoOnboardingOpen && (
        <NGOOnboardingModal
          isSubmitting={isSubmittingNgo}
          error={ngoOnboardingError}
          fieldErrors={ngoOnboardingFieldErrors}
          onClose={closeNgoOnboarding}
          onSubmit={submitNgoOnboarding}
        />
      )}
      {isManualDonationOpen && (
        <ManualDonationModal
          ngos={ecosystemData.ngos}
          workshops={workshops}
          isSubmitting={isSubmittingDonation}
          error={manualDonationError}
          onClose={closeManualDonation}
          onSubmit={submitManualDonation}
        />
      )}
      {isReferralModalOpen && referralSourceRegistration && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Create referral"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeReferralModal();
          }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-start justify-between gap-6">
              <div className="space-y-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full w-fit">
                  Create Referral
                </p>
                <h3 className="text-xl font-black text-slate-900 truncate">{referralSourceRegistration.full_name}</h3>
                <p className="text-xs font-semibold text-slate-500 truncate">
                  Workshop: {referralSourceRegistration.workshop_details?.title ?? `#${referralSourceRegistration.workshop}`}
                </p>
              </div>
              <button
                type="button"
                onClick={closeReferralModal}
                className="h-10 w-10 rounded-2xl border border-slate-100 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center"
                aria-label="Close"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            <form onSubmit={submitReferral} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">Hospital</label>
                  <select
                    value={selectedHospitalId ?? ""}
                    onChange={(e) => setSelectedHospitalId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-900"
                    required
                  >
                    <option value="" disabled>
                      {hospitals.length === 0 ? "No hospitals found" : "Select hospital"}
                    </option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} — {h.location}
                      </option>
                    ))}
                  </select>

                  {selectedHospital && (
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                      <p className="text-xs font-bold text-slate-700">
                        Specialty: <span className="text-slate-500 font-semibold">{selectedHospital.specialty}</span>
                      </p>
                      <p className="text-xs font-bold text-slate-700 mt-1">
                        Contact: <span className="text-slate-500 font-semibold">{selectedHospital.contact || "—"}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">Urgency</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Normal", "Emergency"] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setReferralUrgency(u)}
                        className={`px-4 py-3 rounded-xl border text-sm font-black transition-colors ${
                          referralUrgency === u
                            ? u === "Emergency"
                              ? "bg-rose-50 border-rose-200 text-rose-700"
                              : "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-black text-slate-500 uppercase ml-1">Patient</label>
                    <select
                      value={selectedPatientId ?? ""}
                      onChange={(e) => setSelectedPatientId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-900"
                      required
                    >
                      <option value="" disabled>
                        Select patient
                      </option>
                      {ecosystemData.patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.full_name} ({p.patient_id})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] font-semibold text-slate-400">
                      We auto-select patient if name matches; otherwise choose manually.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">Reason for Referral</label>
                <textarea
                  value={referralReason}
                  onChange={(e) => setReferralReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                  placeholder="Describe the condition and why referral is needed..."
                  required
                />
              </div>

              {referralError && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                  <p className="text-sm font-bold text-rose-700">{referralError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeReferralModal}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReferral || hospitals.length === 0}
                  className="flex-1 rounded-2xl bg-blue-600 text-white py-4 text-sm font-black shadow-lg shadow-blue-200 hover:bg-slate-800 transition-colors duration-200 disabled:opacity-60 disabled:hover:bg-blue-600"
                >
                  {isSubmittingReferral ? "Submitting..." : "Confirm Referral"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailsModalOpen && detailsRegistration && (
        <RegistrationDetailsModal
          registration={detailsRegistration}
          onClose={closeRegistrationDetails}
          onVerify={async (registration) => {
            try {
              setIsVerifyingDetails(true);
              return await verifyRegistrationWithToast(registration);
            } finally {
              setIsVerifyingDetails(false);
            }
          }}
          isVerifying={isVerifyingDetails}
          onSendReminders={(workshopId, title) => {
            void sendWorkshopReminders(workshopId, title);
          }}
          isSendingReminders={isSendingReminders}
        />
      )}

      <NgoGrowthModal
        isOpen={isNgoGrowthOpen}
        onClose={() => setIsNgoGrowthOpen(false)}
        indoreLabel={indoreNgoLabel}
        ujjainLabel={ujjainNgoLabel}
      />

      <AddHospitalModal
        isOpen={isAddHospitalOpen}
        isSubmitting={isSubmittingHospital}
        error={addHospitalError}
        form={addHospitalForm}
        setForm={setAddHospitalForm}
        onClose={closeAddHospital}
        onSubmit={() => {
          void submitAddHospital();
        }}
      />

      {/* Top Bar: Logo + Header (single strip) */}
      <div className="fixed left-0 top-0 right-0 h-20 bg-white/90 backdrop-blur-md border-b border-slate-100 z-[120] flex">
        <div className="w-20 md:w-56 flex items-center justify-center md:justify-start p-4 md:px-6">
          <a href="/" className="flex items-center active:scale-95 transition-transform">
            <img
              src="/MedBridgeLogo.png"
              alt="MedBridge Logo"
              className="w-44 h-auto max-h-12 object-contain"
              draggable={false}
            />
          </a>
        </div>
        <div className="flex-1 min-w-0">
          <DashboardHeader
            sticky={false}
            className="bg-transparent border-b-0 backdrop-blur-none w-full"
            title="System Overview"
            adminName={adminProfile.name}
            adminRole="Super Admin"
            initials="AD"
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            notifications={headerNotifications}
            onNotificationAction={(n) => {
              if (n.id === "verify-now") {
                setActiveTab("verification_queue");
                pushToast("Opened Verification Queue.", "info");
                return;
              }
              if (n.id === "donation-received") {
                setActiveTab("donor");
                pushToast("Opened Donor Database.", "info");
                return;
              }
              if (n.id === "license-expiring") {
                setActiveTab("ngo");
                pushToast("Opened NGO Management.", "info");
              }
            }}
            onProfileSettings={() => {
              setIsProfileModalOpen(true);
            }}
            onLogout={requestLogout}
          />
        </div>
      </div>
      
      {/* 1. Sidebar - Fixed Positioning taaki scroll na ho */}
      <aside className="fixed left-0 top-0 h-screen w-20 md:w-56 bg-white border-r border-slate-200 flex flex-col z-[100] shadow-xl pt-20">
        
        <nav className="flex-1 px-3 space-y-2 pt-10">
          {sidebarItems.map((item, index) => {
            const isActive = activeTab === item.tab;

            return (
              <a
                key={index}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(item.tab);
                }}
                className={`group relative flex items-center gap-3 rounded-lg border-l-2 px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? "border-l-4 border-blue-600 bg-blue-50 text-blue-600"
                    : "border-transparent bg-transparent text-slate-500 hover:border-blue-400/30 hover:bg-slate-100 hover:text-blue-600 hover:translate-x-1"
                }`}
              >
                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`flex-shrink-0 transition-transform duration-200 ${
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600 group-hover:scale-110"
                  }`}
                />
                <span
                  className={`font-medium hidden md:inline text-sm ${
                    isActive ? "text-blue-600" : "text-slate-500 group-hover:text-blue-600"
                  }`}
                >
                  {item.name}
                </span>
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 mb-4">
          <button 
            onClick={requestLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:translate-x-1 transition-all group"
          >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="font-medium hidden md:inline text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area - Padding Left add kiya hai sidebar ki jagah chhodne ke liye */}
      <div className="flex-1 pl-20 md:pl-56 flex flex-col min-w-0 h-screen">
        {/* Scroll Area (sirf yahi scroll hoga) */}
        <main className="h-screen overflow-y-auto pt-20">
          {activeTab === "dashboard" ? (
            <DashboardOverview
              isLoading={isLoading}
              adminCards={adminCards}
              ecosystemData={ecosystemData}
              visibleRegistrations={visibleRegistrations}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              roleSplit={roleSplit}
              onVerifyRegistration={(registration) => {
                void verifyRegistrationWithToast(registration);
              }}
              onOpenReferralModal={openReferralModal}
              onAdvanceReferral={handleAdvanceReferral}
              onRowClick={openRegistrationDetails}
              onReviewPendingNgo={openNgoManagementFromAlert}
              onReviewPendingVerification={openVerificationQueueFromAlert}
              onAllClear={showAllClearToast}
              onOpenNgoGrowthReport={() => setIsNgoGrowthOpen(true)}
              onOpenSystemLogs={openSystemLogsFromReport}
              onDownloadReportPdf={downloadReportPdfUiOnly}
              onOpenPatientProfile={openPatientProfiling}
            />
          ) : activeTab === "verification_queue" ? (
            <VerificationQueue
              isLoading={isLoading}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              totalPendingCount={filteredPendingVerifications.length}
              registrations={filteredPendingVerifications}
              onVerifyRegistration={(registration) => {
                void verifyRegistrationWithToast(registration);
              }}
              onVerifyAll={() => handleVerifyAllPending(filteredPendingVerifications)}
              isBulkVerifying={isBulkVerifying}
              onRowClick={openRegistrationDetails}
            />
          ) : activeTab === "ngo" ? (
            <NGOManagement
              ngos={ecosystemData.ngos}
              onOnboard={openNgoOnboarding}
              isEmpty={ecosystemData.ngos.length === 0 && !isLoading}
            />
          ) : activeTab === "hospitals" ? (
            <HospitalManagement
              hospitals={hospitals}
              isLoading={isHospitalsLoading}
              onRefresh={() => {
                void refreshHospitals();
              }}
              onAdd={openAddHospital}
              onDelete={(hospitalId) => {
                void deleteHospital(hospitalId);
              }}
              onUpdateBeds={(hospitalId, bedsAvailable) => {
                void updateHospitalBeds(hospitalId, bedsAvailable);
              }}
            />
          ) : activeTab === "donor" ? (
            <DonorDatabase
              donors={ecosystemData.donors}
              donations={ecosystemData.donations}
              onAddManualDonation={openManualDonation}
            />
          ) : activeTab === "map" ? (
            <GlobalEventMap
              isLoading={isLoading}
              workshops={ecosystemData.workshops}
              ngos={ecosystemData.ngos}
              registrations={ecosystemData.registrations}
            />
          ) : activeTab === "logs" ? (
            <SystemLogs
              isLoading={isLoading}
              ngos={ecosystemData.ngos}
              registrations={ecosystemData.registrations}
              donors={ecosystemData.donors}
              donations={ecosystemData.donations}
              customEntries={customSystemLogs}
            />
          ) : (
            <div className="p-8 space-y-3">
              <h1 className="text-2xl font-black text-slate-900">
                {sidebarItems.find((i) => i.tab === activeTab)?.name}
              </h1>
              <p className="text-sm font-semibold text-slate-500">This section is coming soon.</p>
            </div>
          )}

          {false && (
          <div className="p-8 space-y-8">
          
          {/* Stats Cards with Hover Effect */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminCards.map((card, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
              >
                <div className={`p-4 w-fit rounded-2xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                  <card.icon size={24} />
                </div>
                <div className="mt-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">{card.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-3xl font-black text-slate-900">{card.value}</p>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12.5%</span>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
            {/* Recent Registrations Table */}
            <section className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardCheck className="text-blue-600" size={20} /> Recent Workshop Registrations
                </h2>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1">
                    {[
                      { key: "all" as const, label: "All" },
                      { key: "patient" as const, label: "Attendees" },
                      { key: "volunteer" as const, label: "Volunteers" },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setRoleFilter(f.key)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-colors ${
                          roleFilter === f.key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">View All</button>
                </div>
              </div>
              <div className="overflow-x-auto px-4 pb-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {visibleRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-sm font-semibold text-slate-500 text-center">
                          {isLoading ? "Loading registrations..." : "No matching registrations."}
                        </td>
                      </tr>
                    ) : (
                      visibleRegistrations.map((reg) => (
                        <tr key={reg.id} className="group hover:bg-slate-50/50 transition-all rounded-xl">
                          <td className="px-6 py-4">
                            <p className="text-base font-semibold text-slate-800">{reg.full_name}</p>
                            <p className="text-sm text-slate-500 font-mono">
                              Workshop: {reg.workshop_details?.title ?? `#${reg.workshop}`}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-base text-slate-600 font-semibold">{formatRole(reg.role)}</td>
                          <td className="px-6 py-4">
                            {reg.status === "verified" ? (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter bg-emerald-50 text-emerald-600">
                                Verified
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter bg-amber-50 text-amber-700">
                                Confirmed
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {reg.status === "verified" ? (
                              <div className="inline-flex items-center justify-end gap-2">
                                <span
                                  className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600"
                                  aria-label="Verified"
                                  title="Verified"
                                >
                                  <CheckCircle2 size={18} />
                                </span>
                                <button
                                  type="button"
                                  onClick={() => openReferralModal(reg)}
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black bg-slate-800 text-white hover:bg-blue-600 transition-colors duration-200"
                                >
                                  Refer
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleVerifyRegistration(reg.id)}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-slate-800 transition-colors duration-200"
                              >
                                Verify
                                <ChevronRight size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Sidebar Widgets */}
            <section className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Referral Status Tracker</h3>
                  <span className="text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                    {ecosystemData.referrals.length}
                  </span>
                </div>

                {ecosystemData.referrals.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-500">{isLoading ? "Loading referrals..." : "No referrals yet."}</p>
                ) : (
                  <div className="space-y-4">
                    {ecosystemData.referrals.slice(0, 4).map((ref) => {
                      const activeIndex = getReferralStageIndex(ref.status);
                      const isCompleted = ref.status === "Completed";
                      return (
                        <div key={ref.id} className="rounded-2xl border border-slate-100 bg-white p-4 hover:bg-slate-50/40 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-800 truncate">
                                {ref.to_hospital_details?.name ?? `Hospital #${ref.to_hospital}`}
                              </p>
                              <p className="text-xs font-semibold text-slate-500 truncate">
                                {(ref.to_hospital_details?.specialty ?? "General") + " • " + ref.urgency}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter ${
                                isCompleted ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                              }`}
                            >
                              {ref.status}
                            </span>
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center justify-between gap-2">
                              {referralStages.map((stage, idx) => {
                                const isDone = idx <= activeIndex;
                                return (
                                  <div key={stage} className="flex-1 min-w-0">
                                    <div className="flex items-center">
                                      <div
                                        className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black border ${
                                          isDone
                                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                            : "bg-white border-slate-200 text-slate-400"
                                        }`}
                                      >
                                        {idx + 1}
                                      </div>
                                      {idx < referralStages.length - 1 && (
                                        <div
                                          className={`h-0.5 flex-1 mx-2 ${
                                            idx < activeIndex ? "bg-emerald-300" : "bg-slate-200"
                                          }`}
                                        ></div>
                                      )}
                                    </div>
                                    <p className="mt-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider truncate">{stage}</p>
                                  </div>
                                );
                              })}
                            </div>

                            {!isCompleted && activeIndex < referralStages.length - 1 && (
                              <button
                                onClick={() => handleAdvanceReferral(ref.id, referralStages[activeIndex + 1])}
                                className="mt-3 w-full rounded-xl bg-blue-600 text-white py-2 text-xs font-black hover:bg-slate-800 transition-colors duration-200"
                              >
                                Mark as {referralStages[activeIndex + 1]}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Volunteer vs Attendee</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-slate-800">Volunteers</p>
                    <p className="text-sm font-black text-blue-600">
                      {roleSplit.volunteers} <span className="text-xs text-slate-400">({roleSplit.volunteerPct}%)</span>
                    </p>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${roleSplit.volunteerPct}%` }}></div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-sm font-black text-slate-800">Attendees</p>
                    <p className="text-sm font-black text-emerald-600">
                      {roleSplit.attendees} <span className="text-xs text-slate-400">({roleSplit.attendeePct}%)</span>
                    </p>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${roleSplit.attendeePct}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-200 relative overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                <Bell size={60} className="absolute -right-4 -top-4 text-white/10 rotate-12" />
                <h3 className="font-bold text-lg mb-2 relative z-10">System Alert</h3>
                <p className="text-xs text-blue-100 mb-4 leading-relaxed relative z-10">Action Required: A partner NGO is awaiting verification.</p>
                <button className="w-full bg-white text-blue-600 py-3 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all shadow-md active:scale-95">
                  Review Details
                </button>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Reports</h3>
                <div className="space-y-2">
                   {['Weekly Stats', 'Doctor Logs', 'NGO Growth'].map(r => (
                     <div key={r} className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 cursor-pointer transition-all group">
                        <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600 transition-colors">{r}</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                     </div>
                   ))}
                </div>
              </div>
            </section>
          </div>
          </div>
          )}
        </main>
      </div>
    </div>
  );
}
