"use client";
import React, { useMemo, useState } from "react";
import { Award, CheckCircle2, Search, Users, XCircle } from "lucide-react";

export default function DonorRegistry() {
  const HOVER_LIFT_CARD = "hover:shadow-xl hover:-translate-y-2 transition-all duration-300";

  const BLOOD_GROUPS = ["All", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"] as const;

  const DONORS = [
    { id: "DNR-201", name: "John Doe", group: "O+", lastDonated: "Apr 18, 2026", status: "Eligible", badge: "Gold" },
    { id: "DNR-188", name: "Kiara Sharma", group: "A-", lastDonated: "Feb 02, 2026", status: "Wait Period", badge: "Bronze" },
    { id: "DNR-241", name: "Neha Singh", group: "B+", lastDonated: "Apr 19, 2026", status: "Eligible", badge: "Silver" },
    { id: "DNR-176", name: "Aman Verma", group: "AB+", lastDonated: "Feb 03, 2026", status: "Wait Period", badge: "Bronze" },
  ] as const;

  const [query, setQuery] = useState("");
  const [bloodGroup, setBloodGroup] = useState<(typeof BLOOD_GROUPS)[number]>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DONORS.filter((d) => {
      const matchesQuery = !q || `${d.id} ${d.name} ${d.group} ${d.status}`.toLowerCase().includes(q);
      const matchesGroup = bloodGroup === "All" || d.group === bloodGroup;
      return matchesQuery && matchesGroup;
    });
  }, [query, bloodGroup]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-medium tracking-tight text-slate-900">Donors</h1>
          <p className="mt-1 text-sm text-slate-500">Search and filter donors for quick outreach and eligibility checks.</p>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:justify-end">
          <div className="w-full md:w-[200px]">
            <label className="sr-only" htmlFor="blood-group-filter">Blood group</label>
            <select
              id="blood-group-filter"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value as (typeof BLOOD_GROUPS)[number])}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={1.5} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search by name, ID, status…"
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </header>

      <section className={`bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden ${HOVER_LIFT_CARD}`}>
        <div className="border-b border-slate-200 p-4 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
            <Users size={18} strokeWidth={1.5} className="text-slate-700" /> Donor registry
          </p>
          <p className="text-xs text-slate-500">
            Showing <span className="font-medium text-slate-700">{filtered.length}</span> of{" "}
            <span className="font-medium text-slate-700">{DONORS.length}</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Donor</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Blood group</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Last donated</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Eligibility</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((donor) => {
                const isEligible = donor.status === "Eligible";
                const badgeColor =
                  donor.badge === "Gold"
                    ? "text-amber-600"
                    : donor.badge === "Silver"
                    ? "text-slate-500"
                    : "text-slate-400";

                return (
                  <tr key={donor.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-md border border-slate-200 bg-white flex items-center justify-center text-sm font-medium text-slate-700">
                          {donor.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate flex items-center gap-2">
                            {donor.name}
                            <Award size={14} strokeWidth={1.5} className={badgeColor} />
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">Donor ID: {donor.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700">
                        {donor.group}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 tabular-nums">{donor.lastDonated}</td>
                    <td className="px-4 py-3">
                      {isEligible ? (
                        <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle2 size={16} strokeWidth={1.5} className="text-emerald-600" />
                          Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <XCircle size={16} strokeWidth={1.5} className="text-amber-600" />
                          Wait period
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
