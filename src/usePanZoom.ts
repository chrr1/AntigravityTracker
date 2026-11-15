import { useEffect, useRef, useState } from "react";
type V = { x: number; y: number; z: number };
export function usePanZoom() {
  const ref = useRef<HTMLDivElement>(null), [v, setV] = useState<V>({ x: 0, y: 0, z: 1 }), vr = useRef(v), moved = useRef(false);
  const set = (n: V) => { vr.current = n; setV(n); };
  const zoomAt = (cx: number, cy: number, f: number) => { const { x, y, z } = vr.current, nz = Math.min(2.5, Math.max(.3, z * f)); set({ x: cx - (cx - x) * nz / z, y: cy - (cy - y) * nz / z, z: nz }); };
  const fit = () => { const z = Math.min(1, innerWidth / 1440); set({ x: (innerWidth - 1380 * z) / 2, y: 0, z }); };
  useEffect(() => {
    const el = ref.current!, P = new Map<number, [number, number]>(); let pd = 0; fit();
    const dist = () => { const [a, b] = [...P.values()]; return Math.hypot(a[0] - b[0], a[1] - b[1]) || 1; };
    const wheel = (e: WheelEvent) => { e.preventDefault(); zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * (e.ctrlKey ? .01 : .0015))); };
    const down = (e: PointerEvent) => { if ((e.target as HTMLElement).closest("input")) return; if (!P.size) moved.current = false; P.set(e.pointerId, [e.clientX, e.clientY]); if (P.size === 2) pd = dist(); };
    const move = (e: PointerEvent) => { const p = P.get(e.pointerId); if (!p) return; const dx = e.clientX - p[0], dy = e.clientY - p[1];
      if (P.size === 1) { if (!moved.current && Math.hypot(dx, dy) < 6) return; moved.current = true; P.set(e.pointerId, [e.clientX, e.clientY]); const c = vr.current; set({ ...c, x: c.x + dx, y: c.y + dy }); }
      else { moved.current = true; const [a, b] = [...P.values()]; P.set(e.pointerId, [e.clientX, e.clientY]); const nd = dist(); zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, nd / pd); pd = nd; } };
    const up = (e: PointerEvent) => { P.delete(e.pointerId); pd = 0; };
    const click = (e: MouseEvent) => { if (moved.current) { e.stopPropagation(); e.preventDefault(); moved.current = false; } };
    el.addEventListener("wheel", wheel, { passive: false }); el.addEventListener("pointerdown", down); el.addEventListener("click", click, true);
    addEventListener("pointermove", move); addEventListener("pointerup", up); addEventListener("pointercancel", up);
    return () => { el.removeEventListener("wheel", wheel); el.removeEventListener("pointerdown", down); el.removeEventListener("click", click, true); removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up); };
  }, []);
  return { ref, v, zoomAt, fit };
}
