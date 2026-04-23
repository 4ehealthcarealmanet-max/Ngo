import { apiUrl } from "../../../lib/api";

export const BLOOD_GROUPS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export type BloodStock = {
  id: number;
  blood_group: BloodGroup;
  units_available: number;
  total_donated: number;
  last_updated: string;
};

export type DonorRegistry = {
  id: number;
  name: string;
  blood_group: BloodGroup;
  contact: string | null;
  last_donation_date: string | null;
  status: "Available" | "Pending";
  created_at: string;
};

export type TransferLogStatus = "Request Received" | "Dispatched" | "In Transit" | "Delivered";

export type TransferLog = {
  id: number;
  units_transferred: number;
  destination_hospital: string;
  blood_group: BloodGroup;
  timestamp: string;
  status: TransferLogStatus;
  current_lat: number | null;
  current_lng: number | null;
  rider_contact: string;
};

export type BloodDonation = {
  id: number;
  donor: number;
  blood_group: BloodGroup;
  units_donated: number;
  donated_at: string;
};

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.headers || {}),
      },
      credentials: init?.credentials ?? "omit",
    });
  } catch {
    throw new Error("Network error: cannot reach API");
  }

  if (!res.ok) {
    let detail = "";
    try {
      const data = (await res.json()) as any;
      detail = typeof data?.detail === "string" ? data.detail : JSON.stringify(data);
    } catch {
      try {
        detail = await res.text();
      } catch {
        detail = "";
      }
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }

  return (await res.json()) as T;
}

function isBackendNotReadyMessage(message: string) {
  const m = (message || "").toLowerCase();
  return (
    m.includes("no such table") ||
    m.includes("does not exist") ||
    m.includes("relation") ||
    m.includes("operationalerror") ||
    m.includes("programmingerror")
  );
}

export async function getStocks() {
  try {
    return await fetchJson<BloodStock[]>("/api/blood-stocks/");
  } catch (e: any) {
    if (isBackendNotReadyMessage(e?.message || "")) return [];
    throw e;
  }
}

export async function getDonors() {
  try {
    return await fetchJson<DonorRegistry[]>("/api/blood-donors/");
  } catch (e: any) {
    if (isBackendNotReadyMessage(e?.message || "")) return [];
    throw e;
  }
}

export async function getTransferLogs(params?: { status?: TransferLogStatus; blood_group?: BloodGroup; q?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.blood_group) qs.set("blood_group", params.blood_group);
  if (params?.q) qs.set("q", params.q);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";

  try {
    return await fetchJson<TransferLog[]>(`/api/transfer-logs/${suffix}`);
  } catch (e: any) {
    if (isBackendNotReadyMessage(e?.message || "")) return [];
    throw e;
  }
}

export function createDonor(input: Pick<DonorRegistry, "name" | "blood_group" | "status"> & { contact?: string }) {
  return fetchJson<DonorRegistry>("/api/blood-donors/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function createBloodDonation(input: { donor: number; units_donated: number; blood_group?: BloodGroup }) {
  return fetchJson<BloodDonation>("/api/blood-donations/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function createTransferLog(input: {
  destination_hospital: string;
  blood_group: BloodGroup;
  units_transferred: number;
  status?: TransferLogStatus;
  rider_contact?: string;
  current_lat?: number | null;
  current_lng?: number | null;
}) {
  return fetchJson<TransferLog>("/api/transfer-logs/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function patchTransferLog(
  id: number,
  input: Partial<Pick<TransferLog, "status" | "current_lat" | "current_lng" | "rider_contact">>,
) {
  return fetchJson<TransferLog>(`/api/transfer-logs/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
