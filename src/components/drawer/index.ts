import './styles.css';

export interface DrawerOptions {
  title?: string;
  side?: 'left' | 'right';
  content?: string | Node;
  footer?: string | Node;
  closeOnMask?: boolean;
  closeOnEsc?: boolean;
  onClose?: () => void;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
let uid = 0;

export class Drawer {
  readonly el: HTMLElement;
  readonly panel: HTMLElement;
  private opts: DrawerOptions;
  private prevFocus: Element | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(opts: DrawerOptions = {}) {
    this.opts = { side: 'left', closeOnMask: true, closeOnEsc: true, ...opts };
    const id = `uic-drawer-${++uid}`;
    this.el = document.createElement('div');
    this.el.className = 'uic-drawer-mask';
    this.el.hidden = true;
    this.el.innerHTML = `<aside class="uic-drawer" role="dialog" aria-modal="true" aria-labelledby="${id}-t" tabindex="-1">
      <header class="uic-drawer-hd"><h3 id="${id}-t"></h3><button type="button" class="uic-drawer-x" aria-label="Close">×</button></header>
      <div class="uic-drawer-bd"></div><footer class="uic-drawer-ft" hidden></footer></aside>`;
    this.panel = this.el.querySelector('.uic-drawer') as HTMLElement;
    this.el.querySelector('h3')!.textContent = this.opts.title ?? '';
    this.setContent(this.opts.content ?? '');
    if (this.opts.footer) this.setFooter(this.opts.footer);
    this.el.classList.toggle('right', this.opts.side === 'right');
    this.el.querySelector('.uic-drawer-x')!.addEventListener('click', () => this.close());
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el && this.opts.closeOnMask) this.close();
    });
    this.el.addEventListener('keydown', (e) => this.onKey(e));
    document.body.appendChild(this.el);
  }

  get isOpen() { return this.el.classList.contains('on'); }

  setContent(c: string | Node) {
    const bd = this.el.querySelector('.uic-drawer-bd') as HTMLElement;
    if (typeof c === 'string') bd.innerHTML = c; else { bd.textContent = ''; bd.append(c); }
  }

  setFooter(c: string | Node) {
    const ft = this.el.querySelector('.uic-drawer-ft') as HTMLElement;
    ft.hidden = false;
    if (typeof c === 'string') ft.innerHTML = c; else { ft.textContent = ''; ft.append(c); }
  }

  open(side?: 'left' | 'right') {
    if (this.isOpen) return;
    clearTimeout(this.timer);
    if (side) this.el.classList.toggle('right', side === 'right');
    this.prevFocus = document.activeElement;
    this.el.hidden = false;
    document.body.style.overflow = 'hidden';
    const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (f: FrameRequestCallback) => setTimeout(f, 0);
    raf(() => this.el.classList.add('on'));
    this.el.classList.add('on');
    (this.el.querySelector('.uic-drawer-x') as HTMLElement).focus();
  }

  close() {
    if (!this.isOpen) return;
    this.el.classList.remove('on');
    document.body.style.overflow = '';
    this.timer = setTimeout(() => { this.el.hidden = true; }, 340);
    (this.prevFocus as HTMLElement | null)?.focus?.();
    this.opts.onClose?.();
  }

  destroy() { clearTimeout(this.timer); this.el.remove(); document.body.style.overflow = ''; }

  private onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.opts.closeOnEsc) { e.stopPropagation(); this.close(); return; }
    if (e.key !== 'Tab') return;
    const items = Array.from(this.panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => !n.hidden);
    if (!items.length) { e.preventDefault(); return; }
    const first = items[0], last = items[items.length - 1], act = document.activeElement;
    if (e.shiftKey && (act === first || act === this.panel)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && act === last) { e.preventDefault(); first.focus(); }
  }
}
