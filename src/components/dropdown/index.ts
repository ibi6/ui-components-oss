import './styles.css';
import { h, uid } from '../../utils';
export interface DropdownItem { label: string; value?: string; disabled?: boolean }
export interface DropdownOptions { label: string; items: DropdownItem[]; onSelect?: (item: DropdownItem, index: number) => void }
/** Menu button: aria-haspopup=menu, role=menu/menuitem, arrows/Home/End/Esc. */
export class Dropdown {
  readonly el: HTMLElement; readonly button: HTMLButtonElement; readonly menu: HTMLElement;
  private onDoc = (e: Event) => { if (!this.el.contains(e.target as Node)) this.close(); };
  constructor(host: HTMLElement, private opts: DropdownOptions) {
    this.el = h('div', 'uic-dd');
    const id = uid('uic-dd');
    this.button = h('button', 'uic-dd-btn', { type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-controls': id }, opts.label);
    this.menu = h('div', 'uic-dd-menu', { role: 'menu', id }); this.menu.hidden = true;
    opts.items.forEach((it, i) => {
      const b = h('button', 'uic-dd-item', { type: 'button', role: 'menuitem', tabindex: '-1' }, it.label);
      b.disabled = !!it.disabled;
      b.addEventListener('click', () => { this.close(); opts.onSelect?.(it, i); this.button.focus(); });
      this.menu.append(b);
    });
    this.button.addEventListener('click', () => this.toggle());
    this.button.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); this.open(); } });
    this.menu.addEventListener('keydown', e => this.onKey(e));
    this.el.append(this.button, this.menu); host.append(this.el);
  }
  private items() { return [...this.menu.querySelectorAll<HTMLButtonElement>('.uic-dd-item:not(:disabled)')]; }
  private onKey(e: KeyboardEvent) {
    const its = this.items(); const i = its.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'Escape') { this.close(); this.button.focus(); return; }
    let t = -1;
    if (e.key === 'ArrowDown') t = (i + 1) % its.length;
    else if (e.key === 'ArrowUp') t = (i - 1 + its.length) % its.length;
    else if (e.key === 'Home') t = 0; else if (e.key === 'End') t = its.length - 1;
    if (t >= 0) { e.preventDefault(); its[t]?.focus(); }
  }
  get opened() { return !this.menu.hidden; }
  open() { this.menu.hidden = false; this.button.setAttribute('aria-expanded', 'true'); document.addEventListener('click', this.onDoc); this.items()[0]?.focus(); }
  close() { this.menu.hidden = true; this.button.setAttribute('aria-expanded', 'false'); document.removeEventListener('click', this.onDoc); }
  toggle() { this.opened ? this.close() : this.open(); }
  destroy() { this.close(); this.el.remove(); }
}
