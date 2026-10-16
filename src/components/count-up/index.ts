import './styles.css';
import { h } from '../../utils';
export interface CountUpOptions { to: number; from?: number; duration?: number; decimals?: number; format?: (n: number) => string; autoStart?: boolean }
/** Animated number. Respects prefers-reduced-motion (jumps to final). aria-live off during animation; final value announced. */
export class CountUp {
  readonly el: HTMLElement; private raf = 0; private cur: number;
  constructor(host: HTMLElement, private opts: CountUpOptions) {
    this.cur = opts.from ?? 0; this.el = h('span', 'uic-count', { role: 'text' }); this.paint(this.cur); host.append(this.el);
    if (opts.autoStart !== false) this.start();
  }
  get value() { return this.cur; }
  private paint(n: number) { this.cur = n; this.el.textContent = this.opts.format ? this.opts.format(n) : n.toFixed(this.opts.decimals ?? 0); }
  start(to = this.opts.to) {
    cancelAnimationFrame(this.raf);
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches; const dur = this.opts.duration ?? 1000;
    if (reduce || dur <= 0) { this.paint(to); return; }
    const from = this.cur; const t0 = performance.now();
    const step = (t: number) => { const p = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - p, 3); this.paint(from + (to - from) * e); if (p < 1) this.raf = requestAnimationFrame(step); else this.paint(to); };
    this.raf = requestAnimationFrame(step);
  }
  finish() { cancelAnimationFrame(this.raf); this.paint(this.opts.to); }
  destroy() { cancelAnimationFrame(this.raf); this.el.remove(); }
}
