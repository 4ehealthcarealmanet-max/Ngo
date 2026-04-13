const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  if (!apiBaseUrl) {
    throw new Error("Missing required env var: NEXT_PUBLIC_API_URL");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

