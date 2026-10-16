import './styles.css';

export interface SelectOption { value: string; label: string; group?: string }
export interface SearchSelectOptions {
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  value?: string;
  onChange?: (opt: SelectOption) => void;
}

let uid = 0;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

export class SearchSelect {
  readonly el: HTMLElement;
  private o: SearchSelectOptions;
  private trig: HTMLButtonElement;
  private panel: HTMLElement;
  private input: HTMLInputElement;
  private list: HTMLElement;
  private empty: HTMLElement;
  private valEl: HTMLElement;
  private filtered: SelectOption[] = [];
  private idx = 0;
  private _open = false;
  private _value: string | null = null;
  private docClick = (e: MouseEvent) => { if (this._open && !this.el.contains(e.target as Node)) this.toggle(false); };

  constructor(target: HTMLElement, opts: SearchSelectOptions) {
    this.o = opts;
    const id = `uic-sel-${++uid}`;
    this.el = document.createElement('div');
    this.el.className = 'uic-sel';
    this.el.innerHTML = `<button type="button" class="uic-sel-trig" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}-l"><span class="uic-sel-val ph"></span><span class="uic-sel-chev" aria-hidden="true">▾</span></button>
      <div class="uic-sel-panel" hidden><input class="uic-sel-q" type="text" role="combobox" aria-autocomplete="list" aria-controls="${id}-l" aria-expanded="true" autocomplete="off">
      <ul class="uic-sel-list" id="${id}-l" role="listbox"></ul><div class="uic-sel-empty" hidden></div></div>`;
    const q = (s: string) => this.el.querySelector(s) as HTMLElement;
    this.trig = q('.uic-sel-trig') as HTMLButtonElement;
    this.panel = q('.uic-sel-panel');
    this.input = q('.uic-sel-q') as HTMLInputElement;
    this.list = q('.uic-sel-list');
    this.empty = q('.uic-sel-empty');
    this.valEl = q('.uic-sel-val');
    this.valEl.textContent = opts.placeholder ?? 'Select…';
    this.input.placeholder = opts.searchPlaceholder ?? 'Search…';
    this.empty.textContent = opts.emptyText ?? 'No results';
    this.trig.addEventListener('click', (e) => { e.stopPropagation(); this.toggle(!this._open); });
    this.input.addEventListener('input', () => { this.idx = 0; this.paint(); });
    this.input.addEventListener('keydown', (e) => this.onKey(e));
    this.list.addEventListener('click', (e) => {
      const li = (e.target as HTMLElement).closest('li[data-i]') as HTMLElement | null;
      if (li) this.choose(this.filtered[+li.dataset.i!]);
    });
    this.list.addEventListener('mouseover', (e) => {
      const li = (e.target as HTMLElement).closest('li[data-i]') as HTMLElement | null;
      if (li && +li.dataset.i! !== this.idx) { this.idx = +li.dataset.i!; this.paint(); }
    });
    document.addEventListener('click', this.docClick);
    target.appendChild(this.el);
    this.paint();
    if (opts.value != null) this.setValue(opts.value);
  }

  get value() { return this._value; }
  get isOpen() { return this._open; }

  setValue(v: string) {
    const opt = this.o.options.find((x) => x.value === v);
    if (!opt) return;
    this._value = v;
    this.valEl.textContent = opt.label;
    this.valEl.classList.remove('ph');
  }

  toggle(open: boolean) {
    this._open = open;
    this.el.classList.toggle('open', open);
    this.trig.setAttribute('aria-expanded', String(open));
    this.panel.hidden = !open;
    if (open) { this.input.value = ''; this.paint(); this.idx = Math.max(0, this.filtered.findIndex((x) => x.value === this._value)); this.paint(); this.input.focus(); }
    else this.trig.focus();
  }

  destroy() { document.removeEventListener('click', this.docClick); this.el.remove(); }

  private choose(opt?: SelectOption) {
    if (!opt) return;
    this.setValue(opt.value);
    this.toggle(false);
    this.o.onChange?.(opt);
  }

  private onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); this.idx = Math.min(this.filtered.length - 1, this.idx + 1); this.paint(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.idx = Math.max(0, this.idx - 1); this.paint(); }
    else if (e.key === 'Enter') { e.preventDefault(); this.choose(this.filtered[this.idx]); }
    else if (e.key === 'Escape') { e.stopPropagation(); this.toggle(false); }
  }

  private paint() {
    const q = this.input.value.trim().toLowerCase();
    this.filtered = this.o.options.filter((x) => !q || x.label.toLowerCase().includes(q) || (x.group ?? '').toLowerCase().includes(q));
    this.empty.hidden = this.filtered.length > 0;
    this.list.innerHTML = this.filtered.map((x, i) => {
      let label = esc(x.label);
      if (q) { const p = x.label.toLowerCase().indexOf(q); if (p >= 0) label = esc(x.label.slice(0, p)) + '<mark>' + esc(x.label.slice(p, p + q.length)) + '</mark>' + esc(x.label.slice(p + q.length)); }
      return `<li role="option" data-i="${i}" aria-selected="${x.value === this._value}" class="${i === this.idx ? 'on' : ''}"><span>${label}</span>${x.group ? `<em>${esc(x.group)}</em>` : ''}</li>`;
    }).join('');
  }
}
