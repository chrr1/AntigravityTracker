import type { Account, Model } from "./types";
export const MAX = 20, DAY = 864e5;
export const DEFAULT_MODELS = [
  "Gemini 2.5 Flash",
  "Gemini 2.5 Pro",
  "Claude 3.7 Sonnet",
  "Claude 3.5 Sonnet",
];
export const uid = () => Math.random().toString(36).slice(2, 9);
export const left = (m: Model) => (m.resetAt ? Math.max(0, m.resetAt - Date.now()) : 0);
export const avail = (a: Account) => a.models.filter(m => left(m) <= 0).length;
export const col = (l: number) => (l <= 0 ? "var(--ok)" : l < 36e5 ? "var(--warn)" : "var(--err)");
export const fmt = (ms: number) => {
  if (ms <= 0) return "0 m";
  const t = Math.ceil(ms / 6e4), d = Math.floor(t / 1440), h = Math.floor((t % 1440) / 60), m = t % 60;
  return d ? `${d} hr ${h} j` : h ? `${h} j ${m} m` : `${m} m`;
};
export const when = (t: number) => new Date(t).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
