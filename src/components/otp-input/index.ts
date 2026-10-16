import './styles.css';
import { h } from '../../utils';
export interface OtpInputOptions { length?: number; onChange?: (value: string) => void; onComplete?: (value: string) => void; label?: string }
/** N single-digit boxes: auto-advance, Backspace goes back, arrows move, paste fills. */
export class OtpInput {
  readonly el: HTMLElement; readonly cells: HTMLInputElement[] = [];
  constructor(host: HTMLElement, private opts: OtpInputOptions = {}) {
    const n = opts.length ?? 6;
    this.el = h('div', 'uic-otp', { role: 'group', 'aria-label': opts.label ?? 'Verification code' });
    for (let i = 0; i < n; i++) {
      const c = h('input', 'uic-otp-cell', { type: 'text', inputmode: 'numeric', maxlength: '1', autocomplete: i ? 'off' : 'one-time-code', 'aria-label': `Digit ${i + 1} of ${n}` });
      c.addEventListener('input', () => {
        c.value = c.value.replace(/\D/g, '').slice(-1);
        if (c.value && i < n - 1) this.cells[i + 1].focus();
        this.emit();
      });
      c.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !c.value && i > 0) { this.cells[i - 1].value = ''; this.cells[i - 1].focus(); this.emit(); }
        else if (e.key === 'ArrowLeft' && i > 0) this.cells[i - 1].focus();
        else if (e.key === 'ArrowRight' && i < n - 1) this.cells[i + 1].focus();
      });
      c.addEventListener('paste', e => { e.preventDefault(); this.fill(e.clipboardData?.getData('text') ?? ''); });
      this.cells.push(c); this.el.append(c);
    }
    host.append(this.el);
  }
  get value() { return this.cells.map(c => c.value).join(''); }
  /** Fill from the first cell with digits from `text`. */
  fill(text: string) {
    const d = text.replace(/\D/g, '').slice(0, this.cells.length);
    this.cells.forEach((c, i) => { c.value = d[i] ?? ''; });
    this.cells[Math.min(d.length, this.cells.length - 1)].focus();
    this.emit();
  }
  clear() { this.fill(''); }
  private emit() {
    const v = this.value; this.opts.onChange?.(v);
    if (v.length === this.cells.length) this.opts.onComplete?.(v);
  }
  destroy() { this.el.remove(); }
}
