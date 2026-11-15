import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
export default function Wires({ inner, z }: { inner: RefObject<HTMLDivElement>; z: number }) {
  const [d, setD] = useState(""), [box, setBox] = useState("0 0 1000 800"), [, rs] = useState(0);
  useEffect(() => { const f = () => rs(n => n + 1); addEventListener("resize", f); return () => removeEventListener("resize", f); }, []);
  useLayoutEffect(() => {
    const I = inner.current; if (!I) return; const r0 = I.getBoundingClientRect();
    const p = (el: Element, side: "l" | "r", f = .5): [number, number] => { const r = el.getBoundingClientRect(); return [((side === "r" ? r.right : r.left) - r0.left) / z, (r.top + r.height * f - r0.top) / z]; };
    const cv = (a: number[], b: number[]) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)} C ${(a[0] + 60).toFixed(1)} ${a[1].toFixed(1)},${(b[0] - 60).toFixed(1)} ${b[1].toFixed(1)},${b[0].toFixed(1)} ${b[1].toFixed(1)} `;
    const sm = I.querySelector("#sm"), pv = I.querySelector("#pv"), ns = [...I.querySelectorAll("[data-n=a]")]; let s = "";
    if (sm) ns.forEach((n, i) => { s += cv(p(n, "r"), p(sm, "l", (i + 1) / (ns.length + 1))); });
    if (sm && pv) s += cv(p(sm, "r"), p(pv, "l", .3));
    const newBox = `0 0 ${I.offsetWidth} ${I.offsetHeight}`;
    setD(prev => prev !== s ? s : prev);
    setBox(prev => prev !== newBox ? newBox : prev);
  });
  return <svg className="w" viewBox={box}><path d={d} /></svg>;
}
