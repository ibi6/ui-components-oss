import './styles.css';

export interface PaginationOptions {
  pages: number;
  page?: number;
  label?: string;
  onChange?: (page: number) => void;
}

/** Compact page window: always first/last/current±1, with gaps. */
export function pageWindow(cur: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, cur, cur - 1, cur + 1]);
  if (cur <= 3) [2, 3, 4].forEach((n) => set.add(n));
  if (cur >= total - 2) [total - 1, total - 2, total - 3].forEach((n) => set.add(n));
  return [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
}

export class Pagination {
  readonly el: HTMLElement;
  private o: PaginationOptions;
  private _page: number;

  constructor(target: HTMLElement, opts: PaginationOptions) {
    this.o = opts;
    this._page = Math.min(Math.max(1, opts.page ?? 1), opts.pages);
    this.el = document.createElement('nav');
    this.el.className = 'uic-pager';
    this.el.setAttribute('aria-label', opts.label ?? 'Pagination');
    this.el.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('button[data-p]') as HTMLButtonElement | null;
      if (b && !b.disabled) this.setPage(+b.dataset.p!);
    });
    target.appendChild(this.el);
    this.render();
  }

  get page() { return this._page; }
  get pages() { return this.o.pages; }

  setPage(p: number, silent = false) {
    if (p < 1 || p > this.o.pages || p === this._page) return;
    this._page = p;
    this.render();
    if (!silent) this.o.onChange?.(p);
  }

  setPages(n: number) { this.o.pages = Math.max(1, n); this._page = Math.min(this._page, this.o.pages); this.render(); }
  destroy() { this.el.remove(); }

  private render() {
    const { pages } = this.o, page = this._page, nums = pageWindow(page, pages);
    let h = `<button type="button" data-p="${page - 1}" ${page <= 1 ? 'disabled' : ''} aria-label="Previous page">‹</button>`;
    nums.forEach((n, i) => {
      if (i && n - nums[i - 1] > 1) h += '<span class="uic-pg-gap" aria-hidden="true">…</span>';
      h += `<button type="button" data-p="${n}" class="${n === page ? 'on' : ''}" ${n === page ? 'aria-current="page"' : ''} aria-label="Page ${n}">${n}</button>`;
    });
    h += `<button type="button" data-p="${page + 1}" ${page >= pages ? 'disabled' : ''} aria-label="Next page">›</button>`;
    this.el.innerHTML = h;
  }
}
