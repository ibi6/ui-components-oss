import './styles.css';
import { h } from '../../utils';
export interface SliderOptions { min?: number; max?: number; step?: number; value?: number; label?: string; format?: (v: number) => string; onChange?: (v: number) => void }
/** Single-thumb slider on a native range input with a value readout. */
export class Slider {
  readonly el: HTMLElement; readonly input: HTMLInputElement; private out: HTMLOutputElement;
  constructor(host: HTMLElement, private opts: SliderOptions = {}) {
    this.el = h('div', 'uic-slider');
    const i = this.input = h('input', 'uic-slider-input', { type: 'range', min: String(opts.min ?? 0), max: String(opts.max ?? 100), step: String(opts.step ?? 1) });
    i.value = String(opts.value ?? opts.min ?? 0);
    if (opts.label) i.setAttribute('aria-label', opts.label);
    this.out = h('output', 'uic-slider-out');
    i.addEventListener('input', () => { this.paint(); opts.onChange?.(this.value); });
    this.el.append(i, this.out); this.paint(); host.append(this.el);
  }
  get value() { return Number(this.input.value); }
  set(v: number) { this.input.value = String(v); this.paint(); }
  private paint() {
    const { min, max } = this.input, pct = ((this.value - Number(min)) / (Number(max) - Number(min))) * 100;
    this.input.style.setProperty('--uic-pct', pct + '%');
    this.out.textContent = this.opts.format ? this.opts.format(this.value) : String(this.value);
  }
  destroy() { this.el.remove(); }
}
