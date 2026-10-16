import './styles.css';
import { h } from '../../utils';
export interface RatingOptions { value?: number; max?: number; readOnly?: boolean; label?: string; onChange?: (v: number) => void }
/** Star rating as role=radiogroup; ←/→ change value, click again on current value clears. */
export class Rating {
  readonly el: HTMLElement; private stars: HTMLButtonElement[] = []; private _v: number; private max: number;
  constructor(host: HTMLElement, private opts: RatingOptions = {}) {
    this.max = opts.max ?? 5; this._v = opts.value ?? 0;
    this.el = h('div', 'uic-rating', { role: opts.readOnly ? 'img' : 'radiogroup', 'aria-label': opts.label ?? 'Rating' });
    if (opts.readOnly) this.el.setAttribute('aria-label', `${opts.label ?? 'Rating'}: ${this._v} / ${this.max}`);
    for (let i = 1; i <= this.max; i++) {
      const s = h('button', 'uic-star', { type: 'button', role: 'radio', 'aria-label': `${i} star${i > 1 ? 's' : ''}` }, '★');
      s.disabled = !!opts.readOnly;
      s.addEventListener('click', () => this.set(this._v === i ? 0 : i, true));
      s.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); this.set(Math.min(this.max, this._v + 1), true); this.stars[Math.max(0, this._v - 1)].focus(); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); this.set(Math.max(1, this._v - 1), true); this.stars[Math.max(0, this._v - 1)].focus(); }
      });
      this.stars.push(s); this.el.append(s);
    }
    this.paint(); host.append(this.el);
  }
  get value() { return this._v; }
  set(v: number, emit = false) { this._v = v; this.paint(); if (emit) this.opts.onChange?.(v); }
  private paint() {
    this.stars.forEach((s, i) => {
      s.classList.toggle('on', i < this._v);
      s.setAttribute('aria-checked', String(i + 1 === this._v));
      s.tabIndex = (this._v ? i + 1 === this._v : i === 0) ? 0 : -1;
    });
  }
  destroy() { this.el.remove(); }
}
