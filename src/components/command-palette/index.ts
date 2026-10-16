import './styles.css';
export interface Command { id: string; label: string; hint?: string; run: () => void }
export interface CommandPaletteOptions { commands: Command[]; placeholder?: string; hotkey?: boolean }
let uid = 0;
/** Command palette (Ctrl/Cmd+K). Combobox + listbox, arrow navigation, Enter runs, Esc closes. */
export class CommandPalette {
  readonly el: HTMLElement;
  private input: HTMLInputElement;
  private list: HTMLElement;
  private items: Command[] = [];
  private idx = 0;
  private prev: Element | null = null;
  private onDoc = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); this.el.hidden ? this.open() : this.close(); } };
  constructor(private opts: CommandPaletteOptions) {
    const id = `uic-cmd-${++uid}`;
    this.el = document.createElement('div'); this.el.className = 'uic-cmd-mask'; this.el.hidden = true;
    const box = document.createElement('div'); box.className = 'uic-cmd'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Command palette');
    this.input = document.createElement('input'); this.input.className = 'uic-cmd-in'; this.input.type = 'text';
    this.input.setAttribute('role', 'combobox'); this.input.setAttribute('aria-expanded', 'true'); this.input.setAttribute('aria-controls', id);
    this.input.setAttribute('aria-autocomplete', 'list'); this.input.placeholder = opts.placeholder ?? 'Type a command…';
    this.list = document.createElement('ul'); this.list.className = 'uic-cmd-list'; this.list.id = id; this.list.setAttribute('role', 'listbox');
    box.append(this.input, this.list); this.el.append(box);
    this.input.addEventListener('input', () => { this.idx = 0; this.render(); });
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); this.move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); this.move(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); this.run(this.idx); }
      else if (e.key === 'Escape') this.close();
    });
    this.list.addEventListener('click', (e) => {
      const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-i]'); if (li) this.run(+li.dataset.i!);
    });
    this.el.addEventListener('mousedown', (e) => { if (e.target === this.el) this.close(); });
    if (opts.hotkey !== false) document.addEventListener('keydown', this.onDoc);
  }
  get opened() { return !this.el.hidden; }
  open() {
    if (!this.el.isConnected) document.body.append(this.el);
    this.prev = document.activeElement; this.el.hidden = false; this.input.value = ''; this.idx = 0; this.render(); this.input.focus();
  }
  close() { if (this.el.hidden) return; this.el.hidden = true; (this.prev as HTMLElement | null)?.focus?.(); }
  private render() {
    const q = this.input.value.trim().toLowerCase();
    this.items = this.opts.commands.filter((c) => c.label.toLowerCase().includes(q));
    this.list.textContent = '';
    this.items.forEach((c, i) => {
      const li = document.createElement('li'); li.id = `${this.list.id}-${i}`; li.dataset.i = String(i); li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === this.idx)); li.textContent = c.label;
      if (c.hint) { const k = document.createElement('kbd'); k.textContent = c.hint; li.append(k); }
      this.list.append(li);
    });
    if (!this.items.length) { const li = document.createElement('li'); li.className = 'uic-cmd-empty'; li.textContent = 'No results'; this.list.append(li); }
    this.input.setAttribute('aria-activedescendant', this.items.length ? `${this.list.id}-${this.idx}` : '');
  }
  private move(d: number) {
    if (!this.items.length) return;
    this.idx = (this.idx + d + this.items.length) % this.items.length; this.render();
  }
  private run(i: number) { const c = this.items[i]; if (!c) return; this.close(); c.run(); }
  destroy() { document.removeEventListener('keydown', this.onDoc); this.el.remove(); }
}
