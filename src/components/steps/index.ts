import './styles.css';
export interface StepsOptions { steps: string[]; current?: number; onChange?: (index: number) => void }
/** Step indicator. Completed steps are clickable buttons; current has aria-current="step". */
export class Steps {
  readonly el: HTMLOListElement;
  private cur = 0;
  constructor(host: HTMLElement, private opts: StepsOptions) {
    this.el = document.createElement('ol'); this.el.className = 'uic-steps';
    host.append(this.el);
    this.set(opts.current ?? 0, false);
  }
  get current() { return this.cur; }
  set(i: number, emit = true) {
    this.cur = Math.max(0, Math.min(this.opts.steps.length - 1, i));
    this.el.textContent = '';
    this.opts.steps.forEach((label, j) => {
      const li = document.createElement('li');
      const state = j < this.cur ? 'done' : j === this.cur ? 'current' : 'todo';
      li.className = 'uic-step ' + state;
      const dot = document.createElement('span'); dot.className = 'uic-step-dot'; dot.textContent = state === 'done' ? '✓' : String(j + 1);
      const txt = document.createElement(state === 'done' ? 'button' : 'span');
      txt.className = 'uic-step-label'; txt.textContent = label;
      if (txt instanceof HTMLButtonElement) { txt.type = 'button'; txt.addEventListener('click', () => this.set(j)); }
      if (state === 'current') li.setAttribute('aria-current', 'step');
      li.append(dot, txt); this.el.append(li);
    });
    if (emit) this.opts.onChange?.(this.cur);
  }
  next() { this.set(this.cur + 1); }
  prev() { this.set(this.cur - 1); }
  destroy() { this.el.remove(); }
}
