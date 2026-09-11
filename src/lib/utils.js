import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_BASE = "http://localhost:8000";

/**
 * Resolve a URL final da capa de um item de mídia.
 * A API retorna `image_url` (accessor do Laravel) para uploads locais:
 * ex.: http://localhost:8000/storage/covers/xxx.jpg
 * Mantém fallback para `image` (registros antigos podem conter URL externa).
 */
export function resolveCoverUrl(item) {
  const raw = item?.image_url ?? item?.image ?? null;
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return `${API_BASE}${raw}`;
  return `${API_BASE}/storage/${raw}`;
}

