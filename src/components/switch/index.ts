import './styles.css';
export interface SwitchOptions { checked?: boolean; disabled?: boolean; label?: string; onChange?: (checked: boolean) => void }
/** Toggle switch: <button role="switch" aria-checked>. Space/Enter via native button. */
export class Switch {
  readonly el: HTMLButtonElement;
  constructor(host: HTMLElement, private opts: SwitchOptions = {}) {
    const b = this.el = document.createElement('button');
    b.type = 'button'; b.className = 'uic-switch'; b.setAttribute('role', 'switch');
    b.disabled = !!opts.disabled;
    const knob = document.createElement('span'); knob.className = 'uic-switch-knob'; b.append(knob);
    if (opts.label) { b.setAttribute('aria-label', opts.label); }
    b.addEventListener('click', () => this.set(!this.checked, true));
    this.set(!!opts.checked, false);
    host.append(b);
  }
  get checked() { return this.el.getAttribute('aria-checked') === 'true'; }
  set(v: boolean, emit = false) {
    this.el.setAttribute('aria-checked', String(v));
    if (emit) this.opts.onChange?.(v);
  }
  destroy() { this.el.remove(); }
}
