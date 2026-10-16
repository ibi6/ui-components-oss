import './styles.css';
export interface ProgressOptions { value?: number; max?: number; variant?: 'bar' | 'ring'; label?: string; indeterminate?: boolean }
/** Progress bar or ring with role=progressbar and aria-valuenow. */
export class Progress {
  readonly el: HTMLElement;
  private fill: HTMLElement;
  private max: number;
  private _value = 0;
  constructor(host: HTMLElement, private opts: ProgressOptions = {}) {
    this.max = opts.max ?? 100;
    const el = this.el = document.createElement('div');
    el.className = 'uic-progress uic-progress-' + (opts.variant ?? 'bar');
    el.setAttribute('role', 'progressbar'); el.setAttribute('aria-valuemin', '0'); el.setAttribute('aria-valuemax', String(this.max));
    el.setAttribute('aria-label', opts.label ?? 'Progress');
    this.fill = document.createElement('div'); this.fill.className = 'uic-progress-fill';
    el.append(this.fill);
    if (opts.indeterminate) { el.classList.add('indeterminate'); el.removeAttribute('aria-valuenow'); }
    else this.set(opts.value ?? 0);
    host.append(el);
  }
  get value() { return this._value; }
  get percent() { return Math.round((this._value / this.max) * 100); }
  set(v: number) {
    this._value = Math.min(this.max, Math.max(0, v));
    this.el.classList.remove('indeterminate');
    this.el.setAttribute('aria-valuenow', String(this._value));
    this.el.style.setProperty('--uic-pct', this.percent + '%');
    if (this.opts.variant === 'ring') this.fill.textContent = this.percent + '%';
  }
  destroy() { this.el.remove(); }
}
