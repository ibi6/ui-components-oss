import './styles.css';
import { h, uid } from '../../utils';
export interface CollapseOptions { trigger: string; content: string | HTMLElement; open?: boolean; onToggle?: (open: boolean) => void }
/** Single disclosure: button[aria-expanded] controls a region. */
export class Collapse {
  readonly el: HTMLElement; readonly button: HTMLButtonElement; readonly panel: HTMLElement;
  constructor(host: HTMLElement, private opts: CollapseOptions) {
    const id = uid('uic-col');
    this.el = h('div', 'uic-col');
    this.button = h('button', 'uic-col-btn', { type: 'button', 'aria-controls': id }, opts.trigger);
    this.panel = h('div', 'uic-col-panel', { id, role: 'region' });
    this.panel.append(typeof opts.content === 'string' ? document.createTextNode(opts.content) : opts.content);
    this.button.addEventListener('click', () => this.toggle());
    this.el.append(this.button, this.panel); host.append(this.el); this.set(!!opts.open, false);
  }
  get opened() { return this.button.getAttribute('aria-expanded') === 'true'; }
  private set(v: boolean, emit = true) { this.button.setAttribute('aria-expanded', String(v)); this.panel.hidden = !v; this.el.classList.toggle('uic-col-open', v); if (emit) this.opts.onToggle?.(v); }
  open() { if (!this.opened) this.set(true); } close() { if (this.opened) this.set(false); } toggle() { this.set(!this.opened); }
  destroy() { this.el.remove(); }
}
