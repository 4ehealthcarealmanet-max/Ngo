"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, PhoneCall, User, Users, X } from "lucide-react";
import { apiUrl } from "../lib/api";

type RegistrationRole = "patient" | "volunteer";

type WorkshopLite = {
  id: number;
  title: string;
  is_open?: boolean;
};

export default function WorkshopRegistrationModal({
  open,
  workshop,
  onClose,
  onSuccess,
}: {
  open: boolean;
  workshop: WorkshopLite | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    fullName: string;
    emailOrPhone: string;
    role: RegistrationRole;
    idProof: File | null;
  }>({
    fullName: "",
    emailOrPhone: "",
    role: "patient",
    idProof: null,
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    setIsSubmitting(false);
    setForm({ fullName: "", emailOrPhone: "", role: "patient", idProof: null });
    const id = window.setTimeout(() => nameInputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !workshop) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (workshop.is_open === false) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("workshop", String(workshop.id));
      formData.append("full_name", form.fullName.trim());
      formData.append("email_or_phone", form.emailOrPhone.trim());
      formData.append("role", form.role);
      if (form.idProof) formData.append("id_proof", form.idProof);

      const response = await fetch(apiUrl("/api/registrations/"), { method: "POST", body: formData });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        let message = "Registration failed. Please try again.";

        if (typeof errorBody === "object" && errorBody) {
          const maybeDetail = (errorBody as { detail?: unknown }).detail;
          if (typeof maybeDetail === "string" && maybeDetail.trim()) {
            message = maybeDetail;
          } else {
            const entries = Object.entries(errorBody as Record<string, unknown>);
            const first = entries.find(([, v]) => v != null);
            const firstValue = first?.[1];
            if (typeof firstValue === "string" && firstValue.trim()) {
              message = firstValue;
            } else if (Array.isArray(firstValue) && typeof firstValue[0] === "string") {
              message = firstValue[0];
            }
          }
        }

        setError(message);
        setIsSubmitting(false);
        return;
      }

      const successMessage = "Your registration is Successfully Completed.";
      onSuccess?.(successMessage);
      alert(successMessage);
      onClose();
    } catch (submitError) {
      console.error("Registration error:", submitError);
      setError("Network error. Please check backend and try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Workshop registration">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border-2 border-emerald-200/60 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Workshop Registration
              </span>
              <h3 className="text-2xl font-black text-slate-800 mt-2 line-clamp-1">{workshop.title}</h3>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors" aria-label="Close">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
              <div className="relative mt-1">
                <User size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={nameInputRef}
                  value={form.fullName}
                  onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
                  type="text"
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email or Phone</label>
              <div className="relative mt-1">
                <PhoneCall size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={form.emailOrPhone}
                  onChange={(e) => setForm((s) => ({ ...s, emailOrPhone: e.target.value }))}
                  type="text"
                  placeholder="How can we reach you?"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Register as</label>
              <div className="relative mt-1">
                <Users size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.role}
                  onChange={(e) => setForm((s) => ({ ...s, role: e.target.value as RegistrationRole }))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-900"
                >
                  <option value="patient">Patient / Attendee</option>
                  <option value="volunteer">Volunteer / Helper</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">ID Proof (Photo/PDF)</label>
              <div className="mt-1">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setForm((s) => ({ ...s, idProof: e.target.files?.[0] ?? null }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-black file:text-slate-700 hover:bg-slate-100 transition-colors"
                />
                <p className="mt-2 text-[11px] font-semibold text-slate-500">
                  Upload your Aadhar/NGO ID for verification (optional).
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                <p className="text-sm font-bold text-rose-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || workshop.is_open === false}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98] mt-4 disabled:opacity-60 disabled:hover:bg-blue-600"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {isSubmitting ? "Submitting..." : workshop.is_open === false ? "Registration Closed" : "Confirm Registration"}
                <ArrowRight size={18} />
              </span>
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-400 mt-6 uppercase font-bold tracking-widest">
            Secure Registration via MedBridge Hub
          </p>
        </div>
      </div>
    </div>
  );
}

