"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Droplet, Plus, Search, ShieldCheck, Users } from "lucide-react";
import BloodBankTabs from "../components/BloodBankTabs";
import { Skeleton } from "../components/Skeleton";
import type { BloodGroup, DonorRegistry } from "../lib/bloodBankApi";
import { BLOOD_GROUPS, createBloodDonation, createDonor, getDonors } from "../lib/bloodBankApi";
import { publishBloodBankEvent } from "../lib/realtime";
import { PREMIUM_CARD, PREMIUM_ICON_CHIP, PREMIUM_INPUT, PREMIUM_META_BADGE, PREMIUM_PILL } from "../lib/ui";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default function DonorRegistryPage() {
  const [donors, setDonors] = useState<DonorRegistry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [bloodGroup, setBloodGroup] = useState<"All" | BloodGroup>("All");

  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [newDonor, setNewDonor] = useState({ name: "", blood_group: "O+" as BloodGroup, status: "Available" as const, contact: "" });
  const [donation, setDonation] = useState({ donor: 0, units_donated: 1, blood_group: "" as "" | BloodGroup });

  async function refresh() {
    try {
      setError(null);
      const data = await getDonors();
      setDonors(data);
      if (!donation.donor && data.length) {
        setDonation((p) => ({ ...p, donor: data[0].id }));
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load donors.");
    }
  }

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 20000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const list = donors || [];
    const q = query.trim().toLowerCase();
    return list
      .filter((d) => (bloodGroup === "All" ? true : d.blood_group === bloodGroup))
      .filter((d) => (!q ? true : `${d.name} ${d.blood_group}`.toLowerCase().includes(q)));
  }, [donors, query, bloodGroup]);

  const isContactVisible = useMemo(() => (donors || []).some((d) => typeof d.contact === "string" && d.contact), [donors]);

  async function onCreateDonor(e: React.FormEvent) {
    e.preventDefault();
    if (!newDonor.name.trim()) return;
    setCreating(true);
    setNotice(null);
    try {
      await createDonor({
        name: newDonor.name.trim(),
        blood_group: newDonor.blood_group,
        status: newDonor.status,
        contact: newDonor.contact?.trim() || "",
      });
      setNewDonor({ name: "", blood_group: "O+", status: "Available", contact: "" });
      setNotice("Donor added.");
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to create donor.");
    } finally {
      setCreating(false);
    }
  }

  async function onAddDonation(e: React.FormEvent) {
    e.preventDefault();
    if (!donation.donor || donation.units_donated <= 0) return;
    setCreating(true);
    setNotice(null);
    try {
      await createBloodDonation({
        donor: donation.donor,
        units_donated: donation.units_donated,
        blood_group: donation.blood_group || undefined,
      });
      publishBloodBankEvent({ type: "donation_created" });
      setDonation((p) => ({ ...p, units_donated: 1, blood_group: "" }));
      setNotice("Donation recorded. Inventory updated automatically.");
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to record donation.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-medium tracking-tight text-slate-900">Donor Registry</h1>
          <p className="mt-1 text-sm text-slate-500">Search by name and blood group. Contact details show only for NGO admins.</p>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          {notice ? <p className="mt-2 text-sm text-emerald-700">{notice}</p> : null}
        </div>

        <div className="w-full lg:w-[620px] space-y-3">
          <BloodBankTabs />
          <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-end">
            <div className="w-full md:w-[200px]">
              <label className="sr-only" htmlFor="donors-group-filter">
                Blood group
              </label>
              <select
                id="donors-group-filter"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as any)}
                className={PREMIUM_INPUT}
              >
                <option value="All">All</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search by name or blood group..."
                className={`py-2 pl-9 pr-3 ${PREMIUM_INPUT}`}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="xl:col-span-8 space-y-4">
          <div className={`${PREMIUM_CARD} overflow-hidden`}>
            <div className="border-b border-slate-100 p-5 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <Users size={18} strokeWidth={1.5} className="text-slate-700" /> Donors
              </p>
              <p className="text-xs text-slate-500">
                Showing <span className="font-medium text-slate-700">{filtered.length}</span>
                {donors ? (
                  <>
                    {" "}
                    of <span className="font-medium text-slate-700">{donors.length}</span>
                  </>
                ) : null}
              </p>
            </div>

            <div className="p-5">
              {donors ? (
                filtered.length ? (
                  <div className="space-y-3">
                    {filtered.map((d) => (
                      <motion.div
                        key={d.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{d.name}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                                <Droplet size={14} strokeWidth={1.5} className="mr-1 text-slate-600" />
                                {d.blood_group}
                              </span>
                              <span className={PREMIUM_META_BADGE}>Last donation {formatDate(d.last_donation_date)}</span>
                              {isContactVisible ? (
                                d.contact ? (
                                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                                    <ShieldCheck size={14} strokeWidth={1.6} className="text-emerald-600" />
                                    <span className="truncate max-w-[260px]">{d.contact}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                                    Contact hidden
                                  </span>
                                )
                              ) : null}
                            </div>
                          </div>

                          <span
                            className={[
                              PREMIUM_PILL,
                              d.status === "Available"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border-amber-200 bg-amber-50 text-amber-900",
                            ].join(" ")}
                          >
                            {d.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-sm font-semibold text-slate-900">No donors match your filters.</p>
                    <p className="mt-1 text-sm text-slate-500">Try clearing the search or changing blood group.</p>
                  </div>
                )
              ) : (
                <Skeleton className="h-12 w-full" />
              )}
            </div>
          </div>
        </section>

        <aside className="xl:col-span-4 space-y-4">
          <div className={`${PREMIUM_CARD} p-5`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-medium text-slate-900">Add donor</h2>
                <p className="mt-1 text-sm text-slate-500">Register a new donor into the directory.</p>
              </div>
              <div className={PREMIUM_ICON_CHIP}>
                <Plus size={18} strokeWidth={1.5} />
              </div>
            </div>

            <form onSubmit={onCreateDonor} className="mt-4 space-y-3">
              <input
                value={newDonor.name}
                onChange={(e) => setNewDonor((p) => ({ ...p, name: e.target.value }))}
                placeholder="Donor name"
                className={PREMIUM_INPUT}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newDonor.blood_group}
                  onChange={(e) => setNewDonor((p) => ({ ...p, blood_group: e.target.value as BloodGroup }))}
                  className={PREMIUM_INPUT}
                >
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <select
                  value={newDonor.status}
                  onChange={(e) => setNewDonor((p) => ({ ...p, status: e.target.value as any }))}
                  className={PREMIUM_INPUT}
                >
                  <option value="Available">Available</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <input
                value={newDonor.contact}
                onChange={(e) => setNewDonor((p) => ({ ...p, contact: e.target.value }))}
                placeholder="Contact (admin-only)"
                className={PREMIUM_INPUT}
              />
              <button
                disabled={creating}
                className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-slate-900 hover:shadow-md disabled:opacity-60"
              >
                {creating ? "Saving..." : "Add donor"}
              </button>
            </form>
          </div>

          <div className={`${PREMIUM_CARD} p-5`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-medium text-slate-900">Record donation</h2>
                <p className="mt-1 text-sm text-slate-500">Automatically increments stock inventory.</p>
              </div>
              <div className={PREMIUM_ICON_CHIP}>
                <Droplet size={18} strokeWidth={1.5} />
              </div>
            </div>

            <form onSubmit={onAddDonation} className="mt-4 space-y-3">
              <select
                value={donation.donor}
                onChange={(e) => setDonation((p) => ({ ...p, donor: Number(e.target.value) }))}
                className={PREMIUM_INPUT}
                disabled={!donors || !donors.length}
              >
                {(donors || []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.blood_group})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <input
                  value={donation.units_donated}
                  onChange={(e) => setDonation((p) => ({ ...p, units_donated: Number(e.target.value) || 0 }))}
                  type="number"
                  min={1}
                  placeholder="Units"
                  className={PREMIUM_INPUT}
                />
                <select
                  value={donation.blood_group}
                  onChange={(e) => setDonation((p) => ({ ...p, blood_group: e.target.value as any }))}
                  className={PREMIUM_INPUT}
                >
                  <option value="">Auto</option>
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <button
                disabled={creating || !donors || !donors.length}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md disabled:opacity-60"
              >
                {creating ? "Recording..." : "Add donation"}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
