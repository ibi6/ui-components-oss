import './styles.css';
import { h, uid } from '../../utils';
import { autoPosition } from '../../position';
export interface SelectItem { value: string; label: string; disabled?: boolean }
export interface SelectOptions { options: SelectItem[]; value?: string | string[]; multiple?: boolean; placeholder?: string; clearable?: boolean; onChange?: (value: string[]) => void }
/** Enhanced select: listbox popup, single/multiple, typeahead, arrows/Home/End/Enter/Esc. */
export class Select {
  readonly el: HTMLElement; readonly button: HTMLButtonElement; readonly list: HTMLElement;
  private sel = new Set<string>(); private active = -1; private buf = ''; private bufT?: ReturnType<typeof setTimeout>; private pos?: { dispose: () => void };
  private onDoc = (e: Event) => { if (!this.el.contains(e.target as Node)) this.close(); };
  constructor(host: HTMLElement, private opts: SelectOptions) {
    const v = opts.value; if (v !== undefined) (Array.isArray(v) ? v : [v]).forEach(x => this.sel.add(x));
    const id = uid('uic-select');
    this.el = h('div', 'uic-select');
    this.button = h('button', 'uic-select-btn', { type: 'button', role: 'combobox', 'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-controls': id });
    this.list = h('ul', 'uic-select-list', { role: 'listbox', id, tabindex: '-1' }); this.list.hidden = true;
    if (opts.multiple) this.list.setAttribute('aria-multiselectable', 'true');
    opts.options.forEach((o, i) => {
      const li = h('li', 'uic-select-opt', { role: 'option', id: `${id}-${i}`, 'data-value': o.value }, o.label);
      if (o.disabled) li.setAttribute('aria-disabled', 'true');
      li.addEventListener('click', () => { if (!o.disabled) this.choose(i); });
      this.list.append(li);
    });
    this.button.addEventListener('click', () => this.toggle());
    this.button.addEventListener('keydown', e => this.onKey(e));
    this.el.append(this.button, this.list); host.append(this.el); this.sync();
  }
  get value(): string[] { return this.opts.options.filter(o => this.sel.has(o.value)).map(o => o.value); }
  get opened() { return !this.list.hidden; }
  private enabled(i: number) { return !this.opts.options[i]?.disabled; }
  private move(from: number, dir: 1 | -1) { const n = this.opts.options.length; for (let k = 1; k <= n; k++) { const i = (from + dir * k + n * 2) % n; if (this.enabled(i)) return i; } return from; }
  private setActive(i: number) {
    this.active = i; [...this.list.children].forEach((c, k) => c.classList.toggle('uic-select-active', k === i));
    if (i >= 0) this.button.setAttribute('aria-activedescendant', this.list.children[i].id); else this.button.removeAttribute('aria-activedescendant');
  }
  private choose(i: number) {
    const v = this.opts.options[i].value;
    if (this.opts.multiple) { this.sel.has(v) ? this.sel.delete(v) : this.sel.add(v); } else { this.sel.clear(); this.sel.add(v); this.close(); }
    this.sync(); this.opts.onChange?.(this.value);
  }
  set(v: string[]) { this.sel = new Set(v); this.sync(); this.opts.onChange?.(this.value); }
  clear() { this.set([]); }
  private sync() {
    [...this.list.children].forEach(c => c.setAttribute('aria-selected', String(this.sel.has((c as HTMLElement).dataset.value!))));
    const labels = this.opts.options.filter(o => this.sel.has(o.value)).map(o => o.label);
    this.button.textContent = labels.length ? labels.join(', ') : (this.opts.placeholder ?? 'Select…');
    this.button.classList.toggle('uic-select-ph', !labels.length);
  }
  private onKey(e: KeyboardEvent) {
    const n = this.opts.options.length; if (!n) return;
    if (!this.opened) { if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); this.open(); } return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); this.setActive(this.move(this.active, 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.setActive(this.move(this.active < 0 ? 0 : this.active, -1)); }
    else if (e.key === 'Home') { e.preventDefault(); this.setActive(this.move(-1, 1)); }
    else if (e.key === 'End') { e.preventDefault(); this.setActive(this.move(0, -1)); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (this.active >= 0) this.choose(this.active); }
    else if (e.key === 'Escape') { e.preventDefault(); this.close(); }
    else if (e.key === 'Tab') this.close();
    else if (e.key.length === 1) {
      this.buf += e.key.toLowerCase(); clearTimeout(this.bufT); this.bufT = setTimeout(() => { this.buf = ''; }, 600);
      const i = this.opts.options.findIndex((o, k) => !o.disabled && o.label.toLowerCase().startsWith(this.buf) && k >= 0); if (i >= 0) this.setActive(i);
    }
  }
  open() { if (this.opened) return; this.list.hidden = false; this.button.setAttribute('aria-expanded', 'true'); document.addEventListener('click', this.onDoc); this.pos = autoPosition(this.button, this.list, 'bottom', 4);
    const first = this.opts.options.findIndex(o => this.sel.has(o.value)); this.setActive(first >= 0 ? first : this.move(-1, 1)); }
  close() { if (!this.opened) return; this.pos?.dispose(); this.list.hidden = true; this.button.setAttribute('aria-expanded', 'false'); document.removeEventListener('click', this.onDoc); this.setActive(-1); }
  toggle() { this.opened ? this.close() : this.open(); }
  destroy() { this.close(); this.el.remove(); }
}
