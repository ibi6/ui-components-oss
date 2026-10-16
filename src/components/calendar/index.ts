import './styles.css';
import { h, uid } from '../../utils';
export interface CalendarOptions { value?: Date | null; min?: Date; max?: Date; weekStart?: 0 | 1; onChange?: (d: Date) => void }
const pad = (n: number) => String(n).padStart(2, '0');
export const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const same = (a: Date, b: Date) => fmtDate(a) === fmtDate(b);
const day0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
/** Simplified date picker grid: role=grid, arrows/PageUp/PageDown/Home/End/Enter. */
export class Calendar {
  readonly el: HTMLElement; private grid: HTMLElement; private title: HTMLElement;
  private view: Date; private focus: Date; private _value: Date | null;
  constructor(host: HTMLElement, private opts: CalendarOptions = {}) {
    this._value = opts.value ? day0(opts.value) : null;
    this.focus = this._value ?? day0(new Date()); this.view = new Date(this.focus.getFullYear(), this.focus.getMonth(), 1);
    this.el = h('div', 'uic-cal');
    const head = h('div', 'uic-cal-head'); const tid = uid('uic-cal');
    const prev = h('button', 'uic-cal-nav', { type: 'button', 'aria-label': 'Previous month' }, '‹');
    const next = h('button', 'uic-cal-nav', { type: 'button', 'aria-label': 'Next month' }, '›');
    this.title = h('div', 'uic-cal-title', { id: tid, 'aria-live': 'polite' });
    prev.addEventListener('click', () => this.shiftMonth(-1)); next.addEventListener('click', () => this.shiftMonth(1));
    head.append(prev, this.title, next);
    this.grid = h('div', 'uic-cal-grid', { role: 'grid', 'aria-labelledby': tid });
    this.grid.addEventListener('keydown', e => this.onKey(e));
    this.el.append(head, this.grid); host.append(this.el); this.render();
  }
  get value() { return this._value; }
  private disabled(d: Date) { return !!((this.opts.min && d < day0(this.opts.min)) || (this.opts.max && d > day0(this.opts.max))); }
  private shiftMonth(n: number) { this.view = new Date(this.view.getFullYear(), this.view.getMonth() + n, 1); this.focus = new Date(this.view.getFullYear(), this.view.getMonth(), Math.min(this.focus.getDate(), 28)); this.render(); }
  select(d: Date) { if (this.disabled(day0(d))) return; this._value = day0(d); this.focus = this._value; this.view = new Date(d.getFullYear(), d.getMonth(), 1); this.render(); this.opts.onChange?.(this._value); }
  private moveFocus(d: Date) { this.focus = d; if (d.getMonth() !== this.view.getMonth() || d.getFullYear() !== this.view.getFullYear()) this.view = new Date(d.getFullYear(), d.getMonth(), 1); this.render(true); }
  private onKey(e: KeyboardEvent) {
    const f = this.focus; const mk = (dy: number) => new Date(f.getFullYear(), f.getMonth(), f.getDate() + dy);
    let t: Date | null = null;
    switch (e.key) {
      case 'ArrowLeft': t = mk(-1); break; case 'ArrowRight': t = mk(1); break;
      case 'ArrowUp': t = mk(-7); break; case 'ArrowDown': t = mk(7); break;
      case 'Home': t = mk(-((f.getDay() - (this.opts.weekStart ?? 0) + 7) % 7)); break;
      case 'End': t = mk(6 - ((f.getDay() - (this.opts.weekStart ?? 0) + 7) % 7)); break;
      case 'PageUp': t = new Date(f.getFullYear(), f.getMonth() - 1, f.getDate()); break;
      case 'PageDown': t = new Date(f.getFullYear(), f.getMonth() + 1, f.getDate()); break;
      case 'Enter': case ' ': e.preventDefault(); this.select(f); this.grid.querySelector<HTMLElement>('[tabindex="0"]')?.focus(); return;
    }
    if (t) { e.preventDefault(); this.moveFocus(t); }
  }
  private render(refocus = false) {
    const ws = this.opts.weekStart ?? 0; const y = this.view.getFullYear(), m = this.view.getMonth();
    this.title.textContent = `${y}-${pad(m + 1)}`; this.grid.textContent = '';
    const names = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const hd = h('div', 'uic-cal-row', { role: 'row' });
    for (let i = 0; i < 7; i++) hd.append(h('div', 'uic-cal-dow', { role: 'columnheader' }, names[(i + ws) % 7]));
    this.grid.append(hd);
    const lead = (new Date(y, m, 1).getDay() - ws + 7) % 7; const start = new Date(y, m, 1 - lead); const today = new Date();
    for (let r = 0; r < 6; r++) {
      const row = h('div', 'uic-cal-row', { role: 'row' });
      for (let c = 0; c < 7; c++) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + r * 7 + c);
        const b = h('button', 'uic-cal-day', { type: 'button', role: 'gridcell', tabindex: same(d, this.focus) ? '0' : '-1', 'data-date': fmtDate(d), 'aria-selected': String(!!this._value && same(d, this._value)) }, String(d.getDate()));
        if (d.getMonth() !== m) b.classList.add('uic-cal-out'); if (same(d, today)) { b.classList.add('uic-cal-today'); b.setAttribute('aria-current', 'date'); }
        if (this.disabled(d)) b.disabled = true;
        b.addEventListener('click', () => this.select(d)); row.append(b);
      }
      this.grid.append(row);
    }
    if (refocus) this.grid.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  }
  destroy() { this.el.remove(); }
}
