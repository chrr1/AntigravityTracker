import { memo, useEffect, useLayoutEffect, useState, type RefObject } from "react";
import type { Account } from "./types";

function WiresComponent({ inner, z }: { inner: RefObject<HTMLDivElement>; z: number; accounts?: Account[] }) {
  const [d, setD] = useState(""), [box, setBox] = useState("0 0 1000 800"), [, rs] = useState(0);
  useEffect(() => { const f = () => rs(n => n + 1); addEventListener("resize", f); return () => removeEventListener("resize", f); }, []);
  useLayoutEffect(() => {
    const I = inner.current; if (!I) return; const r0 = I.getBoundingClientRect();
    const p = (el: Element, side: "l" | "r", f = .5): [number, number] => { const r = el.getBoundingClientRect(); return [((side === "r" ? r.right : r.left) - r0.left) / z, (r.top + r.height * f - r0.top) / z]; };
    const cv = (a: number[], b: number[]) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)} C ${(a[0] + 60).toFixed(1)} ${a[1].toFixed(1)},${(b[0] - 60).toFixed(1)} ${b[1].toFixed(1)},${b[0].toFixed(1)} ${b[1].toFixed(1)} `;
    const sm = I.querySelector("#sm"),
      pv = I.querySelector("#pv"),
      hi = I.querySelector("#hi"),
      gm = I.querySelector("#gemini-node"),
      cl = I.querySelector("#claude-node"),
      ns = [...I.querySelectorAll("[data-n=a]")];
    let s = "";

    // 1. Akun -> Ringkasan
    if (sm) ns.forEach((n, i) => { s += cv(p(n, "r"), p(sm, "l", (i + 1) / (ns.length + 1))); });

    // 2. Ringkasan -> Linimasa
    if (sm && pv) s += cv(p(sm, "r"), p(pv, "l", .3));

    // 3. Ringkasan -> Riwayat (vertikal ke bawah)
    if (sm && hi) {
      const rSm = sm.getBoundingClientRect(), rHi = hi.getBoundingClientRect();
      const ax = ((rSm.left + rSm.right) / 2 - r0.left) / z;
      const ay = (rSm.bottom - r0.top) / z;
      const bx = ((rHi.left + rHi.right) / 2 - r0.left) / z;
      const by = (rHi.top - r0.top) / z;
      s += `M${ax.toFixed(1)} ${ay.toFixed(1)} C ${ax.toFixed(1)} ${(ay + 10).toFixed(1)},${bx.toFixed(1)} ${(by - 10).toFixed(1)},${bx.toFixed(1)} ${by.toFixed(1)} `;
    }

    // 4. Linimasa -> Gemini & Claude
    if (pv && gm) s += cv(p(pv, "r", .35), p(gm, "l", .5));
    if (pv && cl) s += cv(p(pv, "r", .65), p(cl, "l", .5));
    const newBox = `0 0 ${I.offsetWidth} ${I.offsetHeight}`;
    setD(prev => prev !== s ? s : prev);
    setBox(prev => prev !== newBox ? newBox : prev);
  });
  return <svg className="w" viewBox={box}><path d={d} /></svg>;
}

export default memo(WiresComponent, (prev, next) => {
  return prev.z === next.z && prev.accounts === next.accounts;
});
