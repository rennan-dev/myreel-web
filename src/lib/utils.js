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

// Status de consumo da mídia (filme, série e anime).
// Os demais status (leitura/jogos) serão introduzidos em outra ocasião.
export const STATUS_OPTIONS = [
  { value: "nao_assisti", label: "Não Assisti" },
  { value: "assistindo", label: "Assistindo" },
  { value: "assistido", label: "Assistido" },
];

export const STATUS_META = {
  nao_assisti: { label: "Não Assisti", badge: "neutral" },
  assistindo: { label: "Assistindo", badge: "amber" },
  assistido: { label: "Assistido", badge: "emerald" },
};

export function statusMeta(status) {
  return STATUS_META[status] ?? STATUS_META.nao_assisti;
}

