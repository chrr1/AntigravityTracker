import { useState } from "react";
import type { Account, Model, State } from "./types";
import { DAY, MAX, avail, col, fmt, left, when } from "./lib";
const Label = ({ t }: { t: string }) => <div className="lb"><i />{t}</div>;
export type Pair = { a: Account; m: Model };

export function AccountNode(p: { a: Account; onFree: (a: Account, m: Model) => void; onLimit: (a: Account, m: Model) => void; onAddModel: (a: Account) => void; onRemove: (a: Account) => void }) {
  const { a } = p;
  return <div><Label t="Akun" /><div className="nd" data-n="a"><div className="nm">{a.name}</div>
    {a.models.map(m => { const l = left(m); return <button key={m.id} className="r" title={l > 0 ? "Tandai tersedia" : "Catat kena limit"} onClick={() => (l > 0 ? p.onFree(a, m) : p.onLimit(a, m))}>
      <span>{m.name}</span><span className="st">{l > 0 ? fmt(l) : "Tersedia"}<span className="pt" style={{ background: col(l) }} /></span></button>; })}
    <div className="ft"><button className="sm" onClick={() => p.onAddModel(a)}>+ model</button><button className="sm" onClick={() => p.onRemove(a)}>Hapus</button></div></div></div>;
}

export function SummaryNode({ S, lim, av, total }: { S: State; lim: Pair[]; av: number; total: number }) {
  const full = S.accounts.filter(a => a.models.length && !a.models.some(m => left(m) > 0)).length;
  const rows: [string, string | number][] = [["Akun", `${S.accounts.length} / ${MAX}`], ["Akun siap penuh", full], ["Model tersedia", `${av} / ${total}`], ["Terkena limit", lim.length]];
  return <div><Label t="Ringkasan" /><div className="nd" id="sm"><div className="nm">Status keseluruhan</div>
    {rows.map(r => <div key={r[0]} className="r k"><span style={{ color: "var(--mute)" }}>{r[0]}</span><b>{r[1]}</b></div>)}</div></div>;
}

export function HistoryNode({ S }: { S: State }) {
  const [H, setH] = useState<"d" | "w">("d"), n = H === "d" ? 7 : 6, sp = H === "d" ? DAY : 7 * DAY, e = new Date(); e.setHours(24, 0, 0, 0);
  const end = +e, b = Array(n).fill(0) as number[], mc: Record<string, number> = {};
  S.ev.forEach(v => { const i = Math.floor((end - v.at) / sp); if (i >= 0 && i < n) { b[n - 1 - i]++; mc[v.model] = (mc[v.model] || 0) + 1; } });
  const mx = Math.max(1, ...b), w = 250 / n, tot = b.reduce((x, y) => x + y, 0), top = Object.entries(mc).sort((x, y) => y[1] - x[1])[0];
  return <div><Label t="Riwayat limit" /><div className="nd" style={{ width: 250 }}>
    <div className="hb">{(["d", "w"] as const).map(k => <button key={k} className={"sm " + (H === k ? "on" : "")} onClick={() => setH(k)}>{k === "d" ? "7 hari" : "6 minggu"}</button>)}</div>
    <svg className="ch" viewBox="0 0 250 100" style={{ width: "100%", height: "auto", display: "block", position: "static", minWidth: 0 }}>
      {b.map((c, i) => { const h = c / mx * 60, x = i * w + w * .18, t = new Date(end - (n - i) * sp), lb = H === "d" ? t.toLocaleDateString("id-ID", { weekday: "short" }) : `${t.getDate()}/${t.getMonth() + 1}`;
        return <g key={i}><rect x={x} y={78 - h} width={w * .64} height={Math.max(h, 2)} rx={3} fill={c ? "#fff" : "#333"} />{c > 0 && <text className="v" x={x + w * .32} y={74 - h} textAnchor="middle">{c}</text>}<text x={x + w * .32} y={94} textAnchor="middle">{lb}</text></g>; })}
    </svg>
    <div style={{ color: "var(--mute)", marginTop: 6 }}>{tot ? `${tot} kejadian limit. Terbanyak: ${top[0]} (${top[1]}).` : "Belum ada limit tercatat pada periode ini."}</div></div></div>;
}

export function TimelineNode({ lim }: { lim: Pair[] }) {
  const nx = lim[0];
  return <div><Label t="Linimasa reset" /><div className="pv" id="pv"><small>Reset terdekat</small><div className="big">{nx ? fmt(left(nx.m)) : "Semua siap"}</div>
    <small>{nx ? `${nx.a.name} · ${nx.m.name}` : "Tidak ada limit aktif"}</small>
    <div className="tl">{lim.slice(0, 6).map(x => { const l = left(x.m), w = Math.max(2, Math.min(l / (7 * DAY), 1) * 100);
      return <div key={x.a.id + x.m.id} style={{ display: "block" }}><div><span>{x.a.name.split("@")[0]} · {x.m.name}</span><span>{fmt(l)}</span></div>
        <div className={"bar " + (l < 36e5 ? "s" : "")} style={{ width: w + "%", height: 6, marginTop: 4 }} /></div>; })}</div></div></div>;
}
