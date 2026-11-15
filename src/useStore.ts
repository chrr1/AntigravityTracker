import { useCallback, useEffect, useRef, useState } from "react";
import type { State } from "./types";
import { fmt, uid, MAX, DEFAULT_MODELS } from "./lib";
import { supabase } from "./supabase";

const EMPTY: State = { accounts: [], log: [], ev: [] };
const read = (key: string): State => {
  try {
    const j = JSON.parse(localStorage.getItem(key) || "");
    if (j?.accounts) return { ...EMPTY, ...j };
  } catch {}
  return EMPTY;
};

export function useStore(user: string) {
  const KEY = "ag-tracker-v1" + (user === "local" ? "" : ":" + user);
  const [S, setS] = useState<State>(() => {
    const cur = read(KEY);
    // Jika login dengan akun baru tapi belum ada data, warisi data mode lokal jika ada
    if (user !== "local" && !cur.accounts.length) {
      const local = read("ag-tracker-v1");
      if (local.accounts.length) return local;
    }
    return cur;
  }), [, tick] = useState(0);

  const ref = useRef(S), dirty = useRef(false), seen = useRef<string | null>(null), timer = useRef<number>();

  const push = async () => {
    if (!supabase || user === "local") return;
    try {
      const { data, error } = await supabase
        .from("tracker_state")
        .upsert(
          { user_id: user, data: ref.current, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        )
        .select("updated_at")
        .single();

      if (error) {
        console.error("[AntigravityTracker] Gagal menyimpan ke Supabase:", error);
        dirty.current = false;
        return;
      }
      if (data) {
        seen.current = data.updated_at;
        dirty.current = false;
      }
    } catch (e) {
      console.error("[AntigravityTracker] Error koneksi push:", e);
      dirty.current = false;
    }
  };

  const apply = (n: State) => {
    ref.current = n;
    setS(n);
    try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {}
  };

  const pull = useCallback(async () => {
    if (dirty.current || !supabase || user === "local") return;
    try {
      const { data, error } = await supabase
        .from("tracker_state")
        .select("data,updated_at")
        .eq("user_id", user)
        .maybeSingle();

      if (error) {
        console.error("[AntigravityTracker] Gagal mengambil data dari Supabase:", error);
        return;
      }
      if (!data) {
        if (ref.current.accounts.length) push();
        return;
      }
      if (data.updated_at !== seen.current) {
        seen.current = data.updated_at;
        apply({ ...EMPTY, ...(data.data as object) });
      }
    } catch (e) {
      console.error("[AntigravityTracker] Error pull:", e);
    }
  }, [user]);

  const commit = (fn: (s: State) => State) => {
    apply(fn(ref.current));
    dirty.current = true;
    clearTimeout(timer.current);
    timer.current = window.setTimeout(push, 800);
  };

  const logit = (s: State, t: string): State => ({ ...s, log: [{ t, at: Date.now() }, ...s.log].slice(0, 30) });

  useEffect(() => {
    pull();
    const a = setInterval(pull, 45000), b = setInterval(() => tick(n => n + 1), 30000), v = () => { if (!document.hidden) pull(); };
    document.addEventListener("visibilitychange", v);
    return () => { clearInterval(a); clearInterval(b); document.removeEventListener("visibilitychange", v); };
  }, [pull]);

  const actions = {
    addAccount: (name: string) => commit(s => s.accounts.length >= MAX ? s : logit({
      ...s,
      accounts: [...s.accounts, {
        id: uid(),
        name,
        models: DEFAULT_MODELS.map(n => ({ id: uid(), name: n, resetAt: null }))
      }]
    }, `Akun ${name} ditambahkan`)),
    removeAccount: (id: string) => commit(s => {
      const a = s.accounts.find(x => x.id === id);
      return a ? logit({ ...s, accounts: s.accounts.filter(x => x.id !== id) }, `Akun ${a.name} dihapus`) : s;
    }),
    addModel: (id: string, name: string) => commit(s => ({
      ...s,
      accounts: s.accounts.map(a => a.id === id ? { ...a, models: [...a.models, { id: uid(), name, resetAt: null }] } : a)
    })),
    setReset: (aid: string, mid: string, resetAt: number | null, ms = 0) => commit(s => {
      const a = s.accounts.find(x => x.id === aid), m = a?.models.find(x => x.id === mid);
      if (!a || !m) return s;
      const n = { ...s, accounts: s.accounts.map(x => x.id === aid ? { ...x, models: x.models.map(y => y.id === mid ? { ...y, resetAt } : y) } : x) };
      return resetAt
        ? logit({ ...n, ev: [{ at: Date.now(), acc: a.name, model: m.name, ms }, ...n.ev].slice(0, 500) }, `${a.name}: ${m.name} kena limit, reset ${fmt(ms)} lagi`)
        : logit(n, `${a.name}: ${m.name} ditandai tersedia`);
    }),
    replace: (n: State) => commit(() => ({ ...EMPTY, ...n })),
  };

  return { S, actions };
}
