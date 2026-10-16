/** Shared floating-layer positioning with collision flipping + viewport clamping. */
export type Side = 'top' | 'bottom' | 'left' | 'right';
export interface Box { left: number; top: number; width: number; height: number }
export interface PositionResult { x: number; y: number; side: Side; flipped: boolean }
const opposite: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

function place(a: Box, f: Box, side: Side, gap: number): { x: number; y: number } {
  const cx = a.left + a.width / 2 - f.width / 2, cy = a.top + a.height / 2 - f.height / 2;
  switch (side) {
    case 'top': return { x: cx, y: a.top - f.height - gap };
    case 'bottom': return { x: cx, y: a.top + a.height + gap };
    case 'left': return { x: a.left - f.width - gap, y: cy };
    default: return { x: a.left + a.width + gap, y: cy };
  }
}
function fits(p: { x: number; y: number }, f: Box, side: Side, vw: number, vh: number) {
  if (side === 'top') return p.y >= 0;
  if (side === 'bottom') return p.y + f.height <= vh;
  if (side === 'left') return p.x >= 0;
  return p.x + f.width <= vw;
}
/** Pure computation (testable): anchor/floating boxes in viewport coords. */
export function computePosition(anchor: Box, floating: Box, viewport: { width: number; height: number }, side: Side = 'bottom', gap = 6): PositionResult {
  let used = side; let p = place(anchor, floating, side, gap);
  if (!fits(p, floating, side, viewport.width, viewport.height)) {
    const alt = opposite[side]; const q = place(anchor, floating, alt, gap);
    if (fits(q, floating, alt, viewport.width, viewport.height)) { used = alt; p = q; }
  }
  const x = Math.max(0, Math.min(p.x, Math.max(0, viewport.width - floating.width)));
  const y = Math.max(0, Math.min(p.y, Math.max(0, viewport.height - floating.height)));
  return { x, y, side: used, flipped: used !== side };
}
const box = (el: Element): Box => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; };
/** Apply to an element: position:fixed, kept in sync on scroll/resize. Returns dispose(). */
export function autoPosition(anchor: Element, floating: HTMLElement, side: Side = 'bottom', gap = 6): { update: () => PositionResult; dispose: () => void } {
  const update = () => {
    floating.style.position = 'fixed';
    const r = computePosition(box(anchor), box(floating), { width: window.innerWidth, height: window.innerHeight }, side, gap);
    floating.style.left = `${Math.round(r.x)}px`; floating.style.top = `${Math.round(r.y)}px`;
    floating.style.margin = '0'; floating.style.transform = 'none'; floating.style.right = 'auto'; floating.style.bottom = 'auto';
    floating.dataset.side = r.side;
    return r;
  };
  window.addEventListener('scroll', update, true); window.addEventListener('resize', update);
  update();
  return { update, dispose: () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); } };
}
