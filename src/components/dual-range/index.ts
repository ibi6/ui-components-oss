import './styles.css';

export interface DualRangeOptions {
  min?: number;
  max?: number;
  step?: number;
  value?: [number, number];
  format?: (n: number) => string;
  labelLow?: string;
  labelHigh?: string;
  onChange?: (value: [number, number]) => void;
}

export class DualRange {
  readonly el: HTMLElement;
  private a: HTMLInputElement;
  private b: HTMLInputElement;
  private fill: HTMLElement;
  private lo: HTMLElement;
  private hi: HTMLElement;
  private o: DualRangeOptions;

  constructor(target: HTMLElement, opts: DualRangeOptions = {}) {
    const min = opts.min ?? 0, max = opts.max ?? 100, step = opts.step ?? 1;
    this.o = { format: (n) => String(n), ...opts };
    const [v1, v2] = opts.value ?? [min, max];
    this.el = document.createElement('div');
    this.el.className = 'uic-dual';
    this.el.innerHTML = `<div class="uic-dual-vals"><b class="lo"></b><span>–</span><b class="hi"></b></div>
      <div class="uic-dual-track"><div class="uic-dual-range"></div>
      <input type="range" min="${min}" max="${max}" step="${step}" aria-label="${opts.labelLow ?? 'Minimum'}">
      <input type="range" min="${min}" max="${max}" step="${step}" aria-label="${opts.labelHigh ?? 'Maximum'}"></div>`;
    const ins = this.el.querySelectorAll('input');
    this.a = ins[0]; this.b = ins[1];
    this.a.value = String(v1); this.b.value = String(v2);
    this.fill = this.el.querySelector('.uic-dual-range') as HTMLElement;
    this.lo = this.el.querySelector('.lo') as HTMLElement;
    this.hi = this.el.querySelector('.hi') as HTMLElement;
    const h = () => { this.sync(); this.o.onChange?.(this.value); };
    this.a.addEventListener('input', h);
    this.b.addEventListener('input', h);
    target.appendChild(this.el);
    this.sync();
  }

  get value(): [number, number] { return [+this.a.value, +this.b.value]; }

  setValue(lo: number, hi: number) {
    this.a.value = String(lo); this.b.value = String(hi);
    this.sync();
  }

  destroy() { this.el.remove(); }

  /** Keeps a<=b (swaps if thumbs cross), updates fill + labels. */
  private sync() {
    let x = +this.a.value, y = +this.b.value;
    if (x > y) { [x, y] = [y, x]; this.a.value = String(x); this.b.value = String(y); }
    const min = +this.a.min, span = +this.a.max - min || 1;
    const l = ((x - min) / span) * 100, r = ((y - min) / span) * 100;
    this.fill.style.left = l + '%';
    this.fill.style.width = r - l + '%';
    const f = this.o.format!;
    this.lo.textContent = f(x); this.hi.textContent = f(y);
  }
}
