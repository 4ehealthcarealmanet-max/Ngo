"use client";

import React, { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

const CARTO_POSITRON_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const CARTO_POSITRON_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

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
  });
};

const BLUE_MARKER_ICON = createSvgMarker("#2563EB");

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 12, { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function NgoMiniMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  return (
    <div className="h-64 w-full overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <MapContainer center={[lat, lng]} zoom={12} scrollWheelZoom={false} className="h-full w-full" style={{ zIndex: 0 }}>
        <TileLayer url={CARTO_POSITRON_URL} attribution={CARTO_POSITRON_ATTRIBUTION} subdomains="abcd" />
        <FlyTo lat={lat} lng={lng} />
        <Marker position={[lat, lng]} icon={BLUE_MARKER_ICON} title={label} />
      </MapContainer>
    </div>
  );
}

