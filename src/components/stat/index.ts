import './styles.css';
import { h } from '../../utils';
export interface StatOptions { label: string; value: string | number; delta?: number; hint?: string }
/** KPI figure with optional signed delta (▲/▼ + text, not color only). */
export class Stat {
  readonly el: HTMLElement; private v: HTMLElement; private d: HTMLElement;
  constructor(host: HTMLElement, private opts: StatOptions) {
    this.el = h('div', 'uic-stat', { role: 'group' });
    const l = h('div', 'uic-stat-label', {}, opts.label); this.v = h('div', 'uic-stat-value'); this.d = h('div', 'uic-stat-delta');
    this.el.append(l, this.v, this.d); if (opts.hint) this.el.append(h('div', 'uic-stat-hint', {}, opts.hint));
    this.el.setAttribute('aria-label', opts.label); host.append(this.el); this.set(opts.value, opts.delta);
  }
  set(value: string | number, delta?: number) {
    this.v.textContent = String(value); this.d.hidden = delta === undefined; this.d.classList.remove('uic-stat-up', 'uic-stat-down');
    if (delta !== undefined) { this.d.textContent = `${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)}%`; this.d.setAttribute('aria-label', `${delta >= 0 ? 'up' : 'down'} ${Math.abs(delta)} percent`); this.d.classList.add(delta >= 0 ? 'uic-stat-up' : 'uic-stat-down'); }
  }
  destroy() { this.el.remove(); }
}
