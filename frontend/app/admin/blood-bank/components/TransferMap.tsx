"use client";

import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";

function FlyTo({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  React.useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [center, zoom, map]);

  return null;
}

export default function TransferMap({
  lat,
  lng,
  label,
  zoom = 13,
}: {
  lat: number | null;
  lng: number | null;
  label?: string;
  zoom?: number;
}) {
  const center: [number, number] = [
    typeof lat === "number" ? lat : 22.7196, // fallback: Indore (MP)
    typeof lng === "number" ? lng : 75.8577,
  ];

  return (
    <div className="h-56 w-full overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
      <MapContainer center={center} zoom={zoom} className="h-full w-full grayscale-[0.2]">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo center={center} zoom={zoom} />
        {typeof lat === "number" && typeof lng === "number" ? (
          <CircleMarker center={[lat, lng]} radius={10} pathOptions={{ color: "#2563eb", fillColor: "#2563eb" }}>
            <Popup>{label || "Current location"}</Popup>
          </CircleMarker>
        ) : null}
      </MapContainer>
    </div>
  );
}
