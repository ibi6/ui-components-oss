import './styles.css';
export interface TabItem { label: string; content: string; disabled?: boolean }
export interface TabsOptions { items: TabItem[]; active?: number; onChange?: (index: number) => void }
let uid = 0;
/** Tabs with roving tabindex, arrow/Home/End keys, role=tablist/tab/tabpanel. */
export class Tabs {
  readonly el: HTMLElement;
  private tabs: HTMLButtonElement[] = [];
  private panels: HTMLElement[] = [];
  private cur = -1;
  constructor(host: HTMLElement, private opts: TabsOptions) {
    const id = ++uid;
    this.el = document.createElement('div'); this.el.className = 'uic-tabs';
    const list = document.createElement('div'); list.className = 'uic-tabs-list'; list.setAttribute('role', 'tablist');
    this.el.append(list);
    opts.items.forEach((it, i) => {
      const t = document.createElement('button'); t.type = 'button'; t.className = 'uic-tab'; t.setAttribute('role', 'tab');
      t.id = `uic-tab-${id}-${i}`; t.setAttribute('aria-controls', `uic-tabp-${id}-${i}`); t.textContent = it.label; t.disabled = !!it.disabled;
      t.addEventListener('click', () => this.select(i));
      const p = document.createElement('div'); p.className = 'uic-tabpanel'; p.setAttribute('role', 'tabpanel');
      p.id = `uic-tabp-${id}-${i}`; p.setAttribute('aria-labelledby', t.id); p.innerHTML = it.content;
      list.append(t); this.el.append(p); this.tabs.push(t); this.panels.push(p);
    });
    list.addEventListener('keydown', (e) => {
      const n = this.tabs.length; let i = this.cur;
      const step = (d: number) => { do { i = (i + d + n) % n; } while (this.tabs[i].disabled); };
      if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Home') { i = -1; step(1); } else if (e.key === 'End') { i = 0; step(-1); } else return;
      e.preventDefault(); this.select(i); this.tabs[i].focus();
    });
    host.append(this.el);
    const first = opts.active ?? opts.items.findIndex((x) => !x.disabled);
    this.select(first < 0 ? 0 : first, false);
  }
  get active() { return this.cur; }
  select(i: number, emit = true) {
    if (i < 0 || i >= this.tabs.length || this.tabs[i].disabled) return;
    this.cur = i;
    this.tabs.forEach((t, j) => {
      const on = j === i;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; this.panels[j].hidden = !on;
    });
    if (emit) this.opts.onChange?.(i);
  }
  destroy() { this.el.remove(); }
}
