import './styles.css';
import { h, uid } from '../../utils';
export interface PopoverOptions { content: string | HTMLElement; title?: string; onToggle?: (open: boolean) => void }
/** Click-triggered popover anchored to a trigger. role=dialog, Esc/outside click closes. */
export class Popover {
  readonly el: HTMLElement;
  private onDoc = (e: Event) => { if (!this.el.contains(e.target as Node) && e.target !== this.trigger && !this.trigger.contains(e.target as Node)) this.close(); };
  constructor(private trigger: HTMLElement, private opts: PopoverOptions) {
    const id = uid('uic-pop');
    this.el = h('div', 'uic-pop', { role: 'dialog', id }); this.el.hidden = true;
    if (opts.title) this.el.setAttribute('aria-label', opts.title);
    this.el.append(typeof opts.content === 'string' ? document.createTextNode(opts.content) : opts.content);
    trigger.setAttribute('aria-haspopup', 'dialog'); trigger.setAttribute('aria-expanded', 'false'); trigger.setAttribute('aria-controls', id);
    trigger.addEventListener('click', this.onClick);
    this.el.addEventListener('keydown', e => { if (e.key === 'Escape') { this.close(); trigger.focus(); } });
    trigger.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); });
    trigger.after(this.el);
  }
  private onClick = () => this.toggle();
  get opened() { return !this.el.hidden; }
  open() { this.el.hidden = false; this.trigger.setAttribute('aria-expanded', 'true'); document.addEventListener('click', this.onDoc); this.opts.onToggle?.(true); }
  close() { if (!this.opened) return; this.el.hidden = true; this.trigger.setAttribute('aria-expanded', 'false'); document.removeEventListener('click', this.onDoc); this.opts.onToggle?.(false); }
  toggle() { this.opened ? this.close() : this.open(); }
  destroy() { this.close(); this.trigger.removeEventListener('click', this.onClick); this.el.remove(); }
}
