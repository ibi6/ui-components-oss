import './styles.css';
export interface ModalOptions {
  title: string; content?: string; confirmText?: string; cancelText?: string;
  /** hide cancel button (alert style) */ alert?: boolean; danger?: boolean;
  onConfirm?: () => void; onCancel?: () => void; onClose?: () => void;
}
const FOCUSABLE = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
let uid = 0;
/** Modal / confirm dialog: role=dialog, aria-modal, focus trap, Esc, focus restore. */
export class Modal {
  readonly el: HTMLElement;
  private dlg: HTMLElement;
  private prev: Element | null = null;
  private isOpen = false;
  constructor(private opts: ModalOptions) {
    const id = `uic-modal-${++uid}`;
    this.el = document.createElement('div'); this.el.className = 'uic-modal-mask'; this.el.hidden = true;
    const d = this.dlg = document.createElement('div'); d.className = 'uic-modal';
    d.setAttribute('role', opts.alert ? 'alertdialog' : 'dialog'); d.setAttribute('aria-modal', 'true');
    d.setAttribute('aria-labelledby', id + '-t'); d.tabIndex = -1;
    const h = document.createElement('h3'); h.id = id + '-t'; h.textContent = opts.title;
    const bd = document.createElement('div'); bd.className = 'uic-modal-bd'; bd.innerHTML = opts.content ?? '';
    const ft = document.createElement('div'); ft.className = 'uic-modal-ft';
    if (!opts.alert) {
      const c = document.createElement('button'); c.type = 'button'; c.className = 'uic-modal-btn'; c.dataset.act = 'cancel';
      c.textContent = opts.cancelText ?? 'Cancel'; ft.append(c);
    }
    const ok = document.createElement('button'); ok.type = 'button';
    ok.className = 'uic-modal-btn primary' + (opts.danger ? ' danger' : ''); ok.dataset.act = 'confirm';
    ok.textContent = opts.confirmText ?? 'OK'; ft.append(ok);
    d.append(h, bd, ft); this.el.append(d);
    ft.addEventListener('click', (e) => {
      const act = (e.target as HTMLElement).closest<HTMLElement>('[data-act]')?.dataset.act;
      if (act === 'confirm') { opts.onConfirm?.(); this.close(); }
      else if (act === 'cancel') { opts.onCancel?.(); this.close(); }
    });
    this.el.addEventListener('mousedown', (e) => { if (e.target === this.el && !opts.alert) { opts.onCancel?.(); this.close(); } });
    this.el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !opts.alert) { opts.onCancel?.(); this.close(); }
      if (e.key === 'Tab') {
        const f = [...d.querySelectorAll<HTMLElement>(FOCUSABLE)];
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  get opened() { return this.isOpen; }
  open() {
    if (this.isOpen) return;
    this.isOpen = true; this.prev = document.activeElement;
    if (!this.el.isConnected) document.body.append(this.el);
    this.el.hidden = false; this.el.classList.add('on');
    (this.dlg.querySelector<HTMLElement>('.primary') ?? this.dlg).focus();
  }
  close() {
    if (!this.isOpen) return;
    this.isOpen = false; this.el.classList.remove('on'); this.el.hidden = true;
    (this.prev as HTMLElement | null)?.focus?.();
    this.opts.onClose?.();
  }
  destroy() { this.close(); this.el.remove(); }
  /** Promise-based confirm helper. Resolves true on confirm, false otherwise. */
  static confirm(opts: Omit<ModalOptions, 'onConfirm' | 'onCancel'>): Promise<boolean> {
    return new Promise((res) => {
      let result = false;
      const m = new Modal({ ...opts, onConfirm: () => { result = true; }, onClose: () => { opts.onClose?.(); res(result); m.destroy(); } });
      m.open();
    });
  }
}
