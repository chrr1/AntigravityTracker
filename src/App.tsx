import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import Login from "./Login";
import { useStore } from "./useStore";
import { usePanZoom } from "./usePanZoom";
import { AccountNode, HistoryNode, SummaryNode, TimelineNode, type Pair } from "./Nodes";
import Wires from "./Wires";
import { MAX, avail, fmt, left, when } from "./lib";
import type { Account, Model } from "./types";

function Tracker({ uid, onSignOut }: { uid: string; onSignOut?: () => void }) {
  const { S, actions } = useStore(uid), { ref, v, zoomAt, fit } = usePanZoom(), inner = useRef<HTMLDivElement>(null), input = useRef<HTMLInputElement>(null), dlg = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(""), [target, setTarget] = useState<Pair | null>(null), [dd, setDd] = useState(0), [dh, setDh] = useState(0), [dm, setDm] = useState(0);
  useEffect(() => { target ? dlg.current?.showModal() : dlg.current?.close(); }, [target]);
  const A = [...S.accounts].sort((x, y) => avail(y) / (y.models.length || 1) - avail(x) / (x.models.length || 1));
  const all: Pair[] = S.accounts.flatMap(a => a.models.map(m => ({ a, m })));
  const lim = all.filter(x => left(x.m) > 0).sort((x, y) => left(x.m) - left(y.m)), av = all.length - lim.length, canAdd = S.accounts.length < MAX;
  const add = () => { const n = name.trim(); if (n) { actions.addAccount(n); setName(""); } };
  const resetForm = () => { setTarget(null); setDd(0); setDh(0); setDm(0); };
  const save = () => { const ms = (dd * 24 + dh) * 36e5 + dm * 6e4; if (target && ms > 0) actions.setReset(target.a.id, target.m.id, Date.now() + ms, ms); resetForm(); };
  const applyPreset = (d: number, h: number, m: number) => { const ms = (d * 24 + h) * 36e5 + m * 6e4; if (target && ms > 0) actions.setReset(target.a.id, target.m.id, Date.now() + ms, ms); resetForm(); };
  const addModel = (a: Account) => { const n = prompt("Nama model (mis. Gemini Pro)"); if (n) actions.addModel(a.id, n.trim().slice(0, 40)); };
  const remove = (a: Account) => { if (confirm("Hapus akun " + a.name + "?")) actions.removeAccount(a.id); };
  const imp = () => { const t = prompt("Tempel teks cadangan:"); if (!t) return; try { const j = JSON.parse(t); if (Array.isArray(j.accounts)) actions.replace(j); } catch { alert("Format cadangan tidak valid"); } };
  return <>
    <div className="top"><div className="pl"><button className="pb" onClick={() => prompt("Salin teks ini sebagai cadangan:", JSON.stringify(S))}>Ekspor</button><button className="pb" onClick={imp}>Impor</button>{onSignOut && <button className="pb" onClick={onSignOut}>Keluar</button>}</div>
      <div className="pl">{canAdd && <button className="pb w" onClick={() => input.current?.focus()}>Tambah akun</button>}</div></div>
    <div className="cv" ref={ref}><div className="in" ref={inner} style={{ transform: `translate(${v.x}px,${v.y}px) scale(${v.z})` }}>
      <Wires inner={inner} z={v.z} />
      <div className="cols">
        <div className="c">{A.length ? A.map(a => <AccountNode key={a.id} a={a} onFree={(a, m) => actions.setReset(a.id, m.id, null)} onLimit={(a, m) => setTarget({ a, m })} onAddModel={addModel} onRemove={remove} />) : <div className="nd">Belum ada akun. Tambahkan lewat kolom di bawah.</div>}</div>
        <div className="c"><SummaryNode S={S} lim={lim} av={av} total={all.length} /><HistoryNode S={S} /></div>
        <div className="c"><TimelineNode lim={lim} /></div>
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
        <label>Hari<input type="number" min={0} value={dd} onChange={e => setDd(Math.max(0, +e.target.value))} /></label>
        <label>Jam<input type="number" min={0} value={dh} onChange={e => setDh(Math.max(0, +e.target.value))} /></label>
        <label>Menit<input type="number" min={0} value={dm} onChange={e => setDm(Math.max(0, +e.target.value))} /></label>
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
