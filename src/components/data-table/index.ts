import './styles.css';
export interface Column<T> { key: keyof T & string; title: string; sortable?: boolean; render?: (row: T) => string }
export interface DataTableOptions<T> { columns: Column<T>[]; rows: T[]; caption?: string; onSort?: (key: string, dir: 'asc' | 'desc') => void }
/** Simple data table with sortable headers (aria-sort). Cell text is escaped unless a render() is given. */
export class DataTable<T extends Record<string, unknown>> {
  readonly el: HTMLTableElement;
  private rows: T[];
  private sortKey: string | null = null;
  private dir: 'asc' | 'desc' = 'asc';
  constructor(host: HTMLElement, private opts: DataTableOptions<T>) {
    this.rows = [...opts.rows];
    this.el = document.createElement('table'); this.el.className = 'uic-table';
    host.append(this.el);
    this.render();
  }
  get sorted() { return this.sortKey ? { key: this.sortKey, dir: this.dir } : null; }
  sort(key: string, dir?: 'asc' | 'desc') {
    this.dir = dir ?? (this.sortKey === key && this.dir === 'asc' ? 'desc' : 'asc');
    this.sortKey = key;
    const m = this.dir === 'asc' ? 1 : -1;
    this.rows = [...this.opts.rows].sort((a, b) => {
      const x = a[key], y = b[key];
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * m;
      return String(x ?? '').localeCompare(String(y ?? ''), undefined, { numeric: true }) * m;
    });
    this.render(); this.opts.onSort?.(key, this.dir);
  }
  setRows(rows: T[]) { this.opts.rows = rows; this.rows = [...rows]; if (this.sortKey) this.sort(this.sortKey, this.dir); else this.render(); }
  private render() {
    const t = this.el; t.textContent = '';
    if (this.opts.caption) { const c = document.createElement('caption'); c.textContent = this.opts.caption; t.append(c); }
    const tr = document.createElement('tr');
    this.opts.columns.forEach((c) => {
      const th = document.createElement('th'); th.scope = 'col';
      if (c.sortable) {
        const active = this.sortKey === c.key;
        th.setAttribute('aria-sort', active ? (this.dir === 'asc' ? 'ascending' : 'descending') : 'none');
        const b = document.createElement('button'); b.type = 'button'; b.className = 'uic-th-btn'; b.textContent = c.title;
        b.addEventListener('click', () => this.sort(c.key)); th.append(b);
      } else th.textContent = c.title;
      tr.append(th);
    });
    const head = document.createElement('thead'); head.append(tr);
    const body = document.createElement('tbody');
    this.rows.forEach((r) => {
      const row = document.createElement('tr');
      this.opts.columns.forEach((c) => {
        const td = document.createElement('td');
        if (c.render) td.innerHTML = c.render(r); else td.textContent = String(r[c.key] ?? '');
        row.append(td);
      });
      body.append(row);
    });
    t.append(head, body);
  }
  destroy() { this.el.remove(); }
}
