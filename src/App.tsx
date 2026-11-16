import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import Login from "./Login";
import { useStore } from "./useStore";
import { usePanZoom } from "./usePanZoom";
import { AccountNode, ClaudeReadyNode, GeminiReadyNode, HistoryNode, SummaryNode, TimelineNode, type Pair } from "./Nodes";
import Wires from "./Wires";
import { MAX, avail, fmt, left, when } from "./lib";
import type { Account, Model } from "./types";

function Tracker({ uid, onSignOut }: { uid: string; onSignOut?: () => void }) {
  const { S, actions } = useStore(uid), { ref, v, zoomAt, fit } = usePanZoom(), inner = useRef<HTMLDivElement>(null), input = useRef<HTMLInputElement>(null), dlg = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(""), [target, setTarget] = useState<Pair | null>(null), [dd, setDd] = useState(""), [dh, setDh] = useState(""), [dm, setDm] = useState("");
  useEffect(() => { target ? dlg.current?.showModal() : dlg.current?.close(); }, [target]);
  const A = S.accounts;
  const all: Pair[] = useMemo(() => S.accounts.flatMap(a => a.models.map(m => ({ a, m }))), [S.accounts]);
  const lim = useMemo(() => all.filter(x => left(x.m) > 0).sort((x, y) => left(x.m) - left(y.m)), [all]);
  const av = useMemo(() => all.length - lim.length, [all.length, lim.length]);
  const canAdd = S.accounts.length < MAX;
  const add = () => { const n = name.trim(); if (n) { actions.addAccount(n); setName(""); } };
  const resetForm = () => { setTarget(null); setDd(""); setDh(""); setDm(""); };
  const save = () => {
    const d = parseInt(dd, 10) || 0, h = parseInt(dh, 10) || 0, m = parseInt(dm, 10) || 0;
    const ms = (d * 24 + h) * 36e5 + m * 6e4;
    if (target && ms > 0) actions.setReset(target.a.id, target.m.id, Date.now() + ms, ms);
    resetForm();
  };
  const applyPreset = (d: number, h: number, m: number) => { const ms = (d * 24 + h) * 36e5 + m * 6e4; if (target && ms > 0) actions.setReset(target.a.id, target.m.id, Date.now() + ms, ms); resetForm(); };
  const onFree = useCallback((a: Account, m: Model) => actions.setReset(a.id, m.id, null), [actions]);
  const onLimit = useCallback((a: Account, m: Model) => setTarget({ a, m }), []);
  const onAddModel = useCallback((a: Account) => { const n = prompt("Nama model (mis. Gemini Pro)"); if (n) actions.addModel(a.id, n.trim().slice(0, 40)); }, [actions]);
  const onRemove = useCallback((a: Account) => { if (confirm("Hapus akun " + a.name + "?")) actions.removeAccount(a.id); }, [actions]);
  const imp = () => { const t = prompt("Tempel teks cadangan:"); if (!t) return; try { const j = JSON.parse(t); if (Array.isArray(j.accounts)) actions.replace(j); } catch { alert("Format cadangan tidak valid"); } };
  return <>
    <div className="top"><div className="pl"><button className="pb" onClick={() => prompt("Salin teks ini sebagai cadangan:", JSON.stringify(S))}>Ekspor</button><button className="pb" onClick={imp}>Impor</button>{onSignOut && <button className="pb" onClick={onSignOut}>Keluar</button>}</div>
      <div className="pl">{canAdd && <button className="pb w" onClick={() => input.current?.focus()}>Tambah akun</button>}</div></div>
    <div className="cv" ref={ref}><div className="in" ref={inner} style={{ transform: `translate(${v.x}px,${v.y}px) scale(${v.z})` }}>
      <Wires inner={inner} z={v.z} accounts={S.accounts} />
      <div className="cols">
        <div className="c">{A.length ? A.map(a => <AccountNode key={a.id} a={a} onFree={onFree} onLimit={onLimit} onAddModel={onAddModel} onRemove={onRemove} />) : <div className="nd">Belum ada akun. Tambahkan lewat kolom di bawah.</div>}</div>
        <div className="c"><SummaryNode S={S} lim={lim} av={av} total={all.length} /><HistoryNode S={S} /></div>
        <div className="c"><TimelineNode lim={lim} /></div>
        <div className="c"><GeminiReadyNode accounts={S.accounts} /><ClaudeReadyNode accounts={S.accounts} /></div>
      </div></div></div>
    <div className="zm" style={{ touchAction: "manipulation" }}><button title="Perbesar" onClick={() => zoomAt(innerWidth / 2, innerHeight / 2, 1.2)}>+</button><button title="Perkecil" onClick={() => zoomAt(innerWidth / 2, innerHeight / 2, 1 / 1.2)}>−</button><button title="Atur ulang" onClick={fit}>⤢</button></div>
    <div className="cn" style={{ left: 16 }}>A: {S.accounts.length}/{MAX}<br />M: {all.length}</div><div className="cn" style={{ right: 60, textAlign: "right" }}>L: {lim.length}<br />T: {av}</div>
    <div className="dock"><div className="lg">{S.log[0] ? `${S.log[0].t} · ${when(S.log[0].at)}` : "Belum ada aktivitas. Catat limit pertama dengan mengklik status sebuah model."}</div>
      <div className="rw"><input ref={input} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Nama atau email akun baru" maxLength={60} />{canAdd && <button className="pb w" onClick={add}>Tambah</button>}</div></div>
    <dialog ref={dlg} onClose={resetForm}>
      <b>{target && `${target.a.name} · ${target.m.name}`}</b>
      <p style={{ margin: "4px 0 0", color: "var(--mute)" }}>Reset dalam berapa lama?</p>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", margin: "10px 0" }}>
        <button type="button" className="sm" onClick={() => applyPreset(0, 0, 15)}>15 mnt</button>
        <button type="button" className="sm" onClick={() => applyPreset(0, 0, 30)}>30 mnt</button>
        <button type="button" className="sm" onClick={() => applyPreset(0, 1, 0)}>1 jam</button>
        <button type="button" className="sm" onClick={() => applyPreset(0, 2, 0)}>2 jam</button>
        <button type="button" className="sm" onClick={() => applyPreset(0, 5, 0)}>5 jam</button>
        <button type="button" className="sm" onClick={() => applyPreset(1, 0, 0)}>24 jam</button>
      </div>
      <div className="f">
        <label>Hari<input type="text" inputMode="numeric" placeholder="0" value={dd} onChange={e => setDd(e.target.value.replace(/\D/g, ""))} onKeyDown={e => e.key === "Enter" && save()} /></label>
        <label>Jam<input type="text" inputMode="numeric" placeholder="0" value={dh} onChange={e => setDh(e.target.value.replace(/\D/g, ""))} onKeyDown={e => e.key === "Enter" && save()} /></label>
        <label>Menit<input type="text" inputMode="numeric" placeholder="0" value={dm} onChange={e => setDm(e.target.value.replace(/\D/g, ""))} onKeyDown={e => e.key === "Enter" && save()} /></label>
      </div>
      <div className="row">
        <button type="button" className="pb" onClick={resetForm}>Batal</button>
        <button type="button" className="pb w" onClick={save}>Simpan limit</button>
      </div>
    </dialog>
  </>;
}

export default function App() {
  const [s, setS] = useState<Session | null | undefined>(supabase ? undefined : null);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setS(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, x) => setS(x));
    return () => data.subscription.unsubscribe();
  }, []);
  if (!supabase) return <Tracker uid="local" />;
  if (s === undefined) return null;
  return s ? <Tracker key={s.user.id} uid={s.user.id} onSignOut={() => supabase!.auth.signOut()} /> : <Login />;
}
