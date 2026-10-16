import './styles.css';
import { h, uid } from '../../utils';
export interface AutocompleteOptions { source: string[] | ((q: string) => string[] | Promise<string[]>); placeholder?: string; minChars?: number; maxItems?: number; onSelect?: (v: string) => void }
/** ARIA 1.2 combobox with list autocomplete (sync or async source). */
export class Autocomplete {
  readonly el: HTMLElement; readonly input: HTMLInputElement; readonly list: HTMLElement;
  private items: string[] = []; private active = -1; private seq = 0;
  private onDoc = (e: Event) => { if (!this.el.contains(e.target as Node)) this.hide(); };
  constructor(host: HTMLElement, private opts: AutocompleteOptions) {
    const id = uid('uic-ac');
    this.el = h('div', 'uic-ac');
    this.input = h('input', 'uic-ac-input', { type: 'text', role: 'combobox', 'aria-autocomplete': 'list', 'aria-expanded': 'false', 'aria-controls': id, autocomplete: 'off' });
    if (opts.placeholder) this.input.placeholder = opts.placeholder;
    this.list = h('ul', 'uic-ac-list', { role: 'listbox', id }); this.list.hidden = true;
    this.input.addEventListener('input', () => { void this.query(); });
    this.input.addEventListener('keydown', e => this.onKey(e));
    document.addEventListener('click', this.onDoc);
    this.el.append(this.input, this.list); host.append(this.el);
  }
  get value() { return this.input.value; }
  async query() {
    const q = this.input.value; const my = ++this.seq;
    if (q.length < (this.opts.minChars ?? 1)) { this.hide(); return; }
    const s = this.opts.source;
    const res = typeof s === 'function' ? await s(q) : s.filter(x => x.toLowerCase().includes(q.toLowerCase()));
    if (my !== this.seq) return;
    this.items = res.slice(0, this.opts.maxItems ?? 8); this.render();
  }
  private render() {
    this.list.textContent = '';
    this.items.forEach((t, i) => {
      const li = h('li', 'uic-ac-opt', { role: 'option', id: `${this.list.id}-${i}`, 'aria-selected': 'false' }, t);
      li.addEventListener('mousedown', e => e.preventDefault()); li.addEventListener('click', () => this.pick(i)); this.list.append(li);
    });
    if (!this.items.length) { this.hide(); return; }
    this.list.hidden = false; this.input.setAttribute('aria-expanded', 'true'); this.setActive(-1);
  }
  private setActive(i: number) {
    this.active = i;
    [...this.list.children].forEach((c, k) => { c.setAttribute('aria-selected', String(k === i)); c.classList.toggle('uic-ac-active', k === i); });
    if (i >= 0) this.input.setAttribute('aria-activedescendant', this.list.children[i].id); else this.input.removeAttribute('aria-activedescendant');
  }
  private pick(i: number) { this.input.value = this.items[i]; this.hide(); this.opts.onSelect?.(this.items[i]); }
  private hide() { this.list.hidden = true; this.input.setAttribute('aria-expanded', 'false'); this.input.removeAttribute('aria-activedescendant'); this.active = -1; }
  private onKey(e: KeyboardEvent) {
    const n = this.items.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); if (this.list.hidden) { void this.query(); return; } this.setActive((this.active + 1) % n); }
    else if (e.key === 'ArrowUp' && !this.list.hidden) { e.preventDefault(); this.setActive((this.active - 1 + n) % n); }
    else if (e.key === 'Enter' && !this.list.hidden && this.active >= 0) { e.preventDefault(); this.pick(this.active); }
    else if (e.key === 'Escape') this.hide();
  }
  destroy() { document.removeEventListener('click', this.onDoc); this.el.remove(); }
}
