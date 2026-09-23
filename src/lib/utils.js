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

// Status de consumo da mídia, por tipo:
// - Assistir (filme, série e anime): Não Assisti / Assistindo / Assistido
// - Jogar (jogo): Não joguei / Jogando / Zerei / Platinado
export const WATCH_STATUS_OPTIONS = [
  { value: "nao_assisti", label: "Não Assisti" },
  { value: "assistindo", label: "Assistindo" },
  { value: "assistido", label: "Assistido" },
];

export const GAME_STATUS_OPTIONS = [
  { value: "nao_joguei", label: "Não joguei" },
  { value: "jogando", label: "Jogando" },
  { value: "zerei", label: "Zerei" },
  { value: "platinado", label: "Platinado" },
];

// Opções de status disponíveis para cada tipo de mídia
export const STATUS_OPTIONS = {
  filme: WATCH_STATUS_OPTIONS,
  serie: WATCH_STATUS_OPTIONS,
  anime: WATCH_STATUS_OPTIONS,
  jogo: GAME_STATUS_OPTIONS,
};

// Status padrão aplicado ao selecionar um tipo no formulário
export const DEFAULT_STATUS_BY_TYPE = {
  filme: "nao_assisti",
  serie: "nao_assisti",
  anime: "nao_assisti",
  jogo: "nao_joguei",
};

export const STATUS_META = {
  nao_assisti: { label: "Não Assisti", badge: "neutral" },
  assistindo: { label: "Assistindo", badge: "amber" },
  assistido: { label: "Assistido", badge: "emerald" },
  nao_joguei: { label: "Não joguei", badge: "neutral" },
  jogando: { label: "Jogando", badge: "amber" },
  zerei: { label: "Zerei", badge: "emerald" },
  platinado: { label: "Platinado", badge: "rose" },
};

export function statusMeta(status) {
  return STATUS_META[status] ?? STATUS_META.nao_assisti;
}

/** Opções de status do tipo de mídia informado. */
export function statusOptionsFor(type) {
  return STATUS_OPTIONS[type] ?? WATCH_STATUS_OPTIONS;
}

/** Status padrão do tipo de mídia informado. */
export function defaultStatusFor(type) {
  return DEFAULT_STATUS_BY_TYPE[type] ?? "nao_assisti";
}

