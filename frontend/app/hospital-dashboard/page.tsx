"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";
import {
  LayoutDashboard,
  Building2,
  Droplet,
  Settings,
  LogOut,
  MapPin,
  Pencil,
  ClipboardList,
  Stethoscope,
  BedDouble,
  FileText,
  Phone,
  Landmark,
  CheckCircle2,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface HospitalData {
  id: number;
  name: string;
  location: string;
  specialty: string;
  hospital_type: string;
  beds_available: number;
  license_no: string;
  contact: string;
}

interface BloodRequest {
  id: number;
  blood_group: string;
  units_required: number;
  urgency: string;
  status: string;
  created_at: string;
  patient_name: string;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function HospitalDashboard() {
  const router = useRouter();
  const [hospital, setHospital] = useState<HospitalData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<HospitalData>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestForm, setRequestForm] = useState({ blood_group: "", units_required: 1, urgency: "Normal", patient_name: "" });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const fetchRequests = (token: string) => {
    setRequestsLoading(true);
    fetch(apiUrl(`/api/hospitals/my-requests/`), { headers: { Authorization: `Token ${token}` } })
      .then(r => r.json()).then(d => { setBloodRequests(Array.isArray(d) ? d : []); setRequestsLoading(false); })
      .catch(() => setRequestsLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem("hospital_token");
    const hospitalId = localStorage.getItem("hospital_id");
    const hospitalName = localStorage.getItem("hospital_name");
    if (!token || !hospitalId) { router.push("/"); return; }

    fetch(apiUrl(`/api/hospitals/${hospitalId}/`), { headers: { Authorization: `Token ${token}` } })
      .then(r => r.json()).then(d => { setHospital(d); setEditForm(d); })
      .catch(() => setHospital({ id: Number(hospitalId), name: hospitalName || "Hospital", location: "", specialty: "", hospital_type: "", beds_available: 0, license_no: "", contact: "" }));

    fetchRequests(token);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("hospital_token");
    localStorage.removeItem("hospital_id");
    localStorage.removeItem("hospital_name");
    router.push("/");
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    const token = localStorage.getItem("hospital_token");
    const hospitalId = localStorage.getItem("hospital_id");
    try {
const res = await fetch(apiUrl(`/api/hospitals/${hospitalId}/`), {      
    method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) { setHospital(data); setIsEditing(false); setEditSuccess(true); setTimeout(() => setEditSuccess(false), 3000); }
    } catch (err) { console.error(err); } finally { setEditLoading(false); }
  };

  const handleBloodRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestLoading(true);
    const token = localStorage.getItem("hospital_token");
    try {
const res = await fetch(apiUrl("/api/sos-requests/"), {      
    method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
        body: JSON.stringify({ hospital_name: hospital?.name, ...requestForm }),
      });
      if (res.ok) {
        setRequestSuccess(true);
        setShowRequestForm(false);
        setRequestForm({ blood_group: "", units_required: 1, urgency: "Normal", patient_name: "" });
        setTimeout(() => setRequestSuccess(false), 3000);
        if (token) fetchRequests(token);
      }
    } catch (err) { console.error(err); } finally { setRequestLoading(false); }
  };

  if (!hospital) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "profile", label: "Hospital Profile", icon: Building2 },
    { id: "blood", label: "Blood Requests", icon: Droplet },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const activeNavItem = navItems.find(n => n.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-slate-200 flex flex-col fixed h-full z-40 shadow-[2px_0_12px_0_rgba(15,23,42,0.06)] transition-all duration-300`}>
        
        {/* Logo */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between h-16">
          {sidebarOpen && <img src="/pathyatech-Logo.png" alt="PathyaTech" className="h-8 w-auto" />}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors ml-auto flex-shrink-0">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Hospital Badge */}
        {sidebarOpen && (
          <div className="p-4 mx-3 my-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-md shadow-blue-200/60 border border-blue-700/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                {hospital.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="font-black text-white text-sm truncate">{hospital.name}</p>
                <p className="text-xs text-blue-200 truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" /> {hospital.location || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-200">Active</span>
            </div>
          </div>
        )}

        {!sidebarOpen && (
          <div className="flex justify-center py-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
              {hospital.name.charAt(0)}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200/70"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-bold text-sm">{item.label}</span>}
              {sidebarOpen && item.id === "blood" && bloodRequests.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                  {bloodRequests.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-bold text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300 min-h-screen`}>

        {/* Top Header */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-8 py-0 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_8px_0_rgba(15,23,42,0.06)] h-16">
          <div>
            <div className="flex items-center gap-2.5">
              {activeNavItem && <activeNavItem.icon className="w-4 h-4 text-blue-600" />}
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.18em]">{activeNavItem?.label}</span>
            </div>
            <p className="text-base font-black text-slate-900 leading-tight mt-0.5">{hospital.name}</p>
          </div>
          <button onClick={() => { setShowRequestForm(true); setActiveTab("blood"); }}
            className="flex items-center gap-2 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md shadow-red-200/80 hover:shadow-red-300/80 active:scale-[0.98]">
            <Plus className="w-4 h-4" /> Request Blood
          </button>
        </header>

        <div className="p-8">
          {/* Toasts */}
          {editSuccess && (
            <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Profile updated!
            </div>
          )}
          {requestSuccess && (
            <div className="fixed top-6 right-6 z-50 bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-xl font-bold flex items-center gap-2">
              <Droplet className="w-5 h-5" /> Blood request sent!
            </div>
          )}

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Welcome back, <span className="text-blue-600">{hospital.name}</span>!</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">Here's your hospital dashboard summary</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Available Beds", value: hospital.beds_available, icon: BedDouble, bg: "bg-blue-50", iconColor: "text-blue-600" },
                  { label: "Specialty", value: hospital.specialty || "—", icon: Stethoscope, bg: "bg-sky-50", iconColor: "text-sky-600" },
                  { label: "Hospital Type", value: hospital.hospital_type === "govt" ? "Government" : "Private", icon: Landmark, bg: "bg-teal-50", iconColor: "text-teal-600" },
                  { label: "Total Requests", value: bloodRequests.length, icon: Droplet, bg: "bg-rose-50", iconColor: "text-rose-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl p-5 border border-slate-200/70 shadow-[0_1px_6px_0_rgba(15,23,42,0.07)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
                      <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{s.label}</p>
                    <p className="font-black text-xl text-slate-900">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200/70 shadow-[0_1px_6px_0_rgba(15,23,42,0.07)]">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-5">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: Droplet,       title: "Request Blood", desc: "Send emergency blood request", btnCls: "border-rose-100 hover:border-rose-300 hover:bg-rose-50",  iconBg: "bg-rose-50",  iconCls: "text-rose-600",  action: () => { setShowRequestForm(true); setActiveTab("blood"); } },
                    { icon: Pencil,        title: "Edit Profile",  desc: "Update hospital information", btnCls: "border-blue-100 hover:border-blue-300 hover:bg-blue-50",  iconBg: "bg-blue-50",  iconCls: "text-blue-600", action: () => { setIsEditing(true); setActiveTab("profile"); } },
                    { icon: ClipboardList, title: "View Requests", desc: "Track all blood requests",    btnCls: "border-teal-100 hover:border-teal-300 hover:bg-teal-50",  iconBg: "bg-teal-50",  iconCls: "text-teal-600", action: () => setActiveTab("blood") },
                  ].map((a) => (
                    <button key={a.title} onClick={a.action}
                      className={`flex items-center gap-4 p-5 rounded-xl border border-slate-200 ${a.btnCls} hover:shadow-sm transition-all duration-200 group text-left`}>
                      <div className={`w-11 h-11 ${a.iconBg} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0`}>
                        <a.icon className={`w-5 h-5 ${a.iconCls}`} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{a.title}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{a.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative bg-gradient-to-r from-[#1D4ED8] to-[#1E40AF] rounded-xl p-8 text-white overflow-hidden">
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white/[0.04] pointer-events-none" />
                <div className="relative flex items-start justify-between mb-6">
                  <div>
                    <p className="text-blue-300 text-[10px] font-black uppercase tracking-[0.25em] mb-2 flex items-center gap-2"><span className="inline-block w-4 border-t border-blue-400/60"></span>Hospital Record</p>
                    <h3 className="text-3xl font-black">{hospital.name}</h3>
                    <p className="text-blue-200 mt-2 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> {hospital.location}
                    </p>
                  </div>
                  <span className="bg-white/10 border border-white/20 px-3 py-1 rounded text-[10px] font-black tracking-wider">
                    {hospital.hospital_type === "govt" ? "Government" : "Private"}
                  </span>
                </div>
                <div className="relative grid grid-cols-3 gap-4 pt-5 border-t border-white/10">
                  <div className="bg-white/[0.07] rounded-lg p-3"><p className="text-blue-300/80 text-[9px] font-black uppercase tracking-[0.18em] mb-1">License</p><p className="font-black text-sm">{hospital.license_no || "—"}</p></div>
                  <div className="bg-white/[0.07] rounded-lg p-3"><p className="text-blue-300/80 text-[9px] font-black uppercase tracking-[0.18em] mb-1">Contact</p><p className="font-black text-sm">{hospital.contact || "—"}</p></div>
                  <div className="bg-white/[0.07] rounded-lg p-3"><p className="text-blue-300/80 text-[9px] font-black uppercase tracking-[0.18em] mb-1">Beds</p><p className="font-black text-sm">{hospital.beds_available} Available</p></div>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Hospital Profile</h2>
                  <p className="text-slate-500 text-sm mt-1 font-medium">View and manage your hospital details</p>
                </div>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg font-black text-sm transition-all shadow-md shadow-blue-200/70 active:scale-[0.98]">
                    <Pencil className="w-4 h-4" /> Edit Profile
                  </button>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200/70 shadow-[0_1px_6px_0_rgba(15,23,42,0.07)] overflow-hidden">
                <div className="relative bg-gradient-to-r from-[#1D4ED8] to-[#1E40AF] p-8 overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
                  <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white/[0.04] pointer-events-none" />
                  <div className="relative flex items-center gap-5">
                    <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-300 text-[10px] font-black uppercase tracking-[0.25em] mb-1 flex items-center gap-2"><span className="inline-block w-4 border-t border-blue-400/60"></span>Hospital Profile</p>
                      <h3 className="text-2xl font-black text-white">{hospital.name}</h3>
                      <p className="text-blue-200 text-sm mt-1">{hospital.specialty} • {hospital.hospital_type === "govt" ? "Government" : "Private"}</p>
                      <p className="text-blue-300/80 text-xs mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" /> {hospital.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  {isEditing ? (
                    <div className="space-y-6">
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Edit Hospital Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                          { label: "Hospital Name", key: "name", type: "text" },
                          { label: "License No.", key: "license_no", type: "text" },
                          { label: "Location", key: "location", type: "text" },
                          { label: "Contact", key: "contact", type: "text" },
                          { label: "Specialty", key: "specialty", type: "text" },
                          { label: "Available Beds", key: "beds_available", type: "number" },
                        ].map((f) => (
                          <div key={f.key} className="space-y-2">
                            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{f.label}</label>
                            <input type={f.type} value={editForm[f.key as keyof HospitalData] ?? ""}
                              onChange={(e) => setEditForm({ ...editForm, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                              className="w-full rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" />
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Hospital Type</label>
                        <select value={editForm.hospital_type ?? ""} onChange={(e) => setEditForm({ ...editForm, hospital_type: e.target.value })}
                          className="w-full rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all">
                          <option value="govt">Government</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handleEditSave} disabled={editLoading} className="flex-1 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg font-black shadow-md shadow-blue-200/70 disabled:opacity-50 transition-all active:scale-[0.98]">
                          {editLoading ? "Saving..." : "Save Changes"}
                        </button>
                        <button onClick={() => { setIsEditing(false); setEditForm(hospital); }} className="px-6 py-3 rounded-lg font-black text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: "Hospital Name", value: hospital.name, icon: Building2 },
                        { label: "License No.", value: hospital.license_no, icon: FileText },
                        { label: "Location", value: hospital.location, icon: MapPin },
                        { label: "Contact", value: hospital.contact, icon: Phone },
                        { label: "Specialty", value: hospital.specialty, icon: Stethoscope },
                        { label: "Available Beds", value: String(hospital.beds_available), icon: BedDouble },
                        { label: "Hospital Type", value: hospital.hospital_type === "govt" ? "Government" : "Private", icon: Landmark },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-4 p-4 bg-slate-50/70 rounded-lg border border-slate-100 hover:border-blue-100 hover:bg-blue-50/40 transition-all duration-150">
                          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100 flex-shrink-0">
                            <item.icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{item.label}</p>
                            <p className="font-bold text-slate-900 text-sm mt-0.5">{item.value || "—"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BLOOD REQUESTS */}
          {activeTab === "blood" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Blood Requests</h2>
                  <p className="text-slate-500 text-sm mt-1 font-medium">Track and manage all blood requests</p>
                </div>
                {!showRequestForm && (
                  <button onClick={() => setShowRequestForm(true)} className="flex items-center gap-2 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-lg font-black text-sm transition-all shadow-md shadow-red-200/80 hover:shadow-red-300/80 active:scale-[0.98]">
                    <Plus className="w-4 h-4" /> New Request
                  </button>
                )}
              </div>

              {showRequestForm && (
                <div className="bg-white rounded-xl border border-slate-200/70 shadow-[0_1px_6px_0_rgba(15,23,42,0.07)] p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                      <Droplet className="w-3.5 h-3.5 text-rose-500" /> New Blood Request
                    </h3>
                    <button onClick={() => setShowRequestForm(false)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleBloodRequest} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {[
                        { label: "Patient Name", key: "patient_name", type: "text", placeholder: "Patient full name" },
                        { label: "Units Required", key: "units_required", type: "number", placeholder: "1" },
                      ].map((f) => (
                        <div key={f.key} className="space-y-2">
                          <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{f.label}</label>
                          <input type={f.type} required placeholder={f.placeholder}
                            value={requestForm[f.key as keyof typeof requestForm]}
                            onChange={(e) => setRequestForm({ ...requestForm, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                            className="w-full rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all" />
                        </div>
                      ))}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Blood Group</label>
                        <select required value={requestForm.blood_group} onChange={(e) => setRequestForm({ ...requestForm, blood_group: e.target.value })}
                          className="w-full rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all">
                          <option value="">Select Blood Group</option>
                          {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Urgency</label>
                        <select value={requestForm.urgency} onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                          className="w-full rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all">
                          <option value="Normal">Normal</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" disabled={requestLoading} className="w-full bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-lg font-black shadow-md shadow-red-200/70 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2">
                      <Droplet className="w-5 h-5" /> {requestLoading ? "Sending..." : "Send Blood Request"}
                    </button>
                  </form>
                </div>
              )}

              {requestsLoading ? (
                <div className="text-center py-12 text-slate-400 font-bold">Loading requests...</div>
              ) : bloodRequests.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200/70 shadow-[0_1px_6px_0_rgba(15,23,42,0.07)] p-12">
                  <div className="max-w-xs mx-auto text-center">
                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
                      <Droplet className="w-6 h-6 text-rose-400" />
                    </div>
                    <h3 className="font-black text-slate-900 text-base mb-1">No requests yet</h3>
                    <p className="text-slate-400 text-sm font-medium mb-5">Blood requests you send will appear here.</p>
                    <button onClick={() => setShowRequestForm(true)} className="bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-lg font-black shadow-md shadow-red-200/70 transition-all active:scale-[0.98]">Send First Request</button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200/70 shadow-[0_1px_6px_0_rgba(15,23,42,0.07)] overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">All Requests</h3>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{bloodRequests.length}</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {bloodRequests.map((req) => (
                      <div key={req.id} className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-rose-50 rounded-lg flex items-center justify-center font-black text-rose-500 text-sm border border-rose-100">{req.blood_group}</div>
                          <div>
                            <p className="font-black text-slate-900 text-sm">{req.patient_name}</p>
                            <p className="text-slate-400 text-xs font-medium">{req.units_required} units • {req.created_at}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black tracking-wide ${req.urgency === "Critical" ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-sky-50 text-sky-600 border border-sky-100"}`}>{req.urgency}</span>
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black tracking-wide ${req.status === "Completed" ? "bg-teal-50 text-teal-700 border border-teal-100" : req.status === "Broadcasting" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>{req.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Settings</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">Manage your account preferences</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/70 shadow-[0_1px_6px_0_rgba(15,23,42,0.07)] p-8 space-y-8">
                <div>
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Hospital Name", value: hospital.name },
                      { label: "License No.", value: hospital.license_no || "—" },
                      { label: "Location", value: hospital.location || "—" },
                      { label: "Contact", value: hospital.contact || "—" },
                    ].map((item) => (
                      <div key={item.label} className="p-4 bg-slate-50/70 rounded-lg border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{item.label}</p>
                        <p className="font-bold text-slate-900 text-sm">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Danger Zone</h3>
                  <button onClick={handleLogout} className="flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 px-5 py-3 rounded-lg font-black text-sm transition-all border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md active:scale-[0.98]">
                    <LogOut className="w-4 h-4" /> Logout from Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
