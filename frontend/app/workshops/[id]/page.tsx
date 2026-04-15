import { notFound } from "next/navigation";
import { apiUrl } from "../../lib/api";
import WorkshopDetailClient from "./WorkshopDetailClient";

type Workshop = {
  id: number;
  ngo?: number;
  title: string;
  expert_name: string;
  date: string;
  description: string;
  full_description?: string;
  image_url?: string;
  is_open: boolean;
};

async function fetchWorkshop(id: string): Promise<Workshop | null> {
  const res = await fetch(apiUrl(`/api/workshops/${id}/`), { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as Workshop;
}

async function fetchNgoCity(ngoId?: number): Promise<string | null> {
  if (!ngoId || !Number.isFinite(ngoId)) return null;
  const res = await fetch(apiUrl(`/api/ngos/${ngoId}/`), { cache: "no-store" });
  if (!res.ok) return null;
  const payload = (await res.json()) as { city?: unknown };
  return typeof payload.city === "string" && payload.city.trim() ? payload.city.trim() : null;
}

export default async function WorkshopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workshop = await fetchWorkshop(id);
  if (!workshop) notFound();

  const normalizedTitle = (workshop.title ?? "").trim().toLowerCase();
  const fallbackImage =
    normalizedTitle === "adolescent mental health & wellness workshop"
      ? "/AdolescentMentalHealth.png"
      : "/maternalhealthworkshop.png";
  const imageSrc = (workshop.image_url ?? "").trim() || fallbackImage;
  const overview = (workshop.full_description ?? "").trim() || (workshop.description ?? "").trim();
  const location = (await fetchNgoCity(workshop.ngo)) ?? "Dewas / Indore";

  return (
    <WorkshopDetailClient
      workshop={workshop}
      location={location}
      imageSrc={imageSrc}
      overview={overview}
    />
  );
}

