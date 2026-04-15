"use client";

import React, { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

type Workshop = {
  id: number;
  ngo: number;
  title: string;
  date: string;
  is_open: boolean;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

type NGO = {
  id: number;
  name: string;
};

type WorkshopRegistration = {
  id: number;
  workshop: number;
};

type GlobalEventMapProps = {
  isLoading: boolean;
  workshops: Workshop[];
  ngos: NGO[];
  registrations: WorkshopRegistration[];
};

const INDORE_CENTER: [number, number] = [22.7196, 75.8577];

const CARTO_POSITRON_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const CARTO_POSITRON_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
};

const createSvgMarker = (color: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
      <path d="M18 45c8-11 14-19 14-28A14 14 0 1 0 4 17c0 9 6 17 14 28z" fill="${color}"/>
      <circle cx="18" cy="17" r="6.5" fill="white" fill-opacity="0.95"/>
      <circle cx="18" cy="17" r="4.2" fill="${color}" fill-opacity="0.85"/>
    </svg>
  `.trim();
  const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

  return new L.Icon({
    iconUrl: url,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -36],
  });
};

const BLUE_MARKER_ICON = createSvgMarker("#2563EB");

function FitToWorkshops({
  points,
}: {
  points: Array<{ lat: number; lng: number }>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 12, { animate: true });
      return;
    }

    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13, animate: true });
  }, [map, points]);

  return null;
}

export default function GlobalEventMap({ isLoading, workshops, ngos, registrations }: GlobalEventMapProps) {
  const ngoNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const ngo of ngos) map.set(ngo.id, ngo.name);
    return map;
  }, [ngos]);

  const registrationsByWorkshopId = useMemo(() => {
    const counts = new Map<number, number>();
    for (const r of registrations) counts.set(r.workshop, (counts.get(r.workshop) ?? 0) + 1);
    return counts;
  }, [registrations]);

  const activeWorkshopsWithCoords = useMemo(() => {
    return workshops
      .filter((w) => w.is_open)
      .map((w) => {
        const lat = toNumber(w.latitude);
        const lng = toNumber(w.longitude);
        return { w, lat, lng };
      })
      .filter((x) => x.lat !== null && x.lng !== null) as Array<{ w: Workshop; lat: number; lng: number }>;
  }, [workshops]);

  const emptyStateLabel = isLoading
    ? "Loading workshops..."
    : workshops.length === 0
    ? "No workshops found."
    : "Add latitude/longitude to workshops to show markers.";

  return (
    <section className="h-[calc(100vh-80px)] w-full p-6">
      <div className="h-full rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden relative">
        <div className="absolute left-5 top-5 z-[60] flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 backdrop-blur-md shadow-lg">
          <div className="h-3 w-3 rounded-full bg-blue-600 shadow-[0_0_0_6px_rgba(37,99,235,0.10)]" />
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-900 leading-none">Global Event Map</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-500 leading-none">
              {activeWorkshopsWithCoords.length} active workshop{activeWorkshopsWithCoords.length === 1 ? "" : "s"} mapped
            </p>
          </div>
        </div>

        <MapContainer
          center={INDORE_CENTER}
          zoom={12}
          scrollWheelZoom
          className="h-full w-full"
          style={{ zIndex: 0 }}
        >
          <TileLayer url={CARTO_POSITRON_URL} attribution={CARTO_POSITRON_ATTRIBUTION} subdomains="abcd" />
          <FitToWorkshops points={activeWorkshopsWithCoords.map(({ lat, lng }) => ({ lat, lng }))} />

          {activeWorkshopsWithCoords.map(({ w, lat, lng }) => {
            const ngoName = ngoNameById.get(w.ngo) ?? `NGO #${w.ngo}`;
            const regCount = registrationsByWorkshopId.get(w.id) ?? 0;
            const shortTitle = (() => {
              const raw = (w.title ?? "").trim();
              if (!raw) return "Workshop";
              const beforeAmp = raw.split("&")[0]?.trim() ?? raw;
              return beforeAmp.replace(/\s+Workshop$/i, "").trim() || raw;
            })();
            return (
              <Marker key={w.id} position={[lat, lng]} icon={BLUE_MARKER_ICON}>
                <Popup>
                  <div className="min-w-[220px]">
                    <p className="text-sm font-black text-slate-900">
                      {shortTitle} Workshop - Hosted by {ngoName}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-[11px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl">
                        {new Date(w.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      <span className="text-[11px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-xl">
                        {regCount} registration{regCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {activeWorkshopsWithCoords.length === 0 && (
          <div className="absolute inset-0 z-[50] flex items-center justify-center p-6 pointer-events-none">
            <div className="pointer-events-none rounded-3xl border border-slate-100 bg-white/85 backdrop-blur-md px-6 py-5 shadow-xl text-center max-w-md">
              <p className="text-sm font-black text-slate-900">No markers to show</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">{emptyStateLabel}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
