import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_BASE = import.meta.env.VITE_APP_URL ?? "http://localhost:8000";

export function resolveCoverUrl(item) {
  const raw = item?.image_url ?? item?.image ?? null;
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return `${API_BASE}${raw}`;
  return `${API_BASE}/storage/${raw}`;
}

