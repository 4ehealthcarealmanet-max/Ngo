import { notFound } from "next/navigation";
import { apiUrl } from "../../lib/api";
import NgoProfileClient from "./NgoProfileClient";

type NGO = {
  id: number;
  name: string;
  city: string;
  service_type: string;
  is_verified: boolean;
  contact_email?: string;
};

type PatientProfile = {
  id: number;
  ngo: number;
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

async function fetchNgo(id: string): Promise<NGO | null> {
  const res = await fetch(apiUrl(`/api/ngos/${id}/`), { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as NGO;
}

async function fetchNgoPatients(id: string): Promise<PatientProfile[]> {
  const res = await fetch(apiUrl(`/api/patients/?ngo_id=${encodeURIComponent(id)}`), { cache: "no-store" });
  if (!res.ok) return [];
  const payload = (await res.json()) as unknown;
  return Array.isArray(payload) ? (payload as PatientProfile[]) : [];
}

async function fetchNgoWorkshops(id: string): Promise<Workshop[]> {
  const res = await fetch(apiUrl(`/api/workshops/?ngo_id=${encodeURIComponent(id)}`), { cache: "no-store" });
  if (!res.ok) return [];
  const payload = (await res.json()) as unknown;
  return Array.isArray(payload) ? (payload as Workshop[]) : [];
}

export default async function NgoProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [ngo, patients, workshops] = await Promise.all([fetchNgo(id), fetchNgoPatients(id), fetchNgoWorkshops(id)]);
  if (!ngo) notFound();

  return (
    <NgoProfileClient
      ngo={ngo}
      patientCount={patients.length}
      workshopCount={workshops.length}
      workshops={workshops}
    />
  );
}

