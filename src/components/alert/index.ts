import './styles.css';
import { h } from '../../utils';
export interface AlertOptions { type?: 'success' | 'error' | 'warn' | 'info'; title?: string; message: string; closable?: boolean; onClose?: () => void }
/** Inline alert. error/warn → role=alert, others role=status. */
export class Alert {
  readonly el: HTMLElement;
  constructor(host: HTMLElement, private opts: AlertOptions) {
    const t = opts.type ?? 'info';
    this.el = h('div', `uic-alert uic-a-${t}`, { role: t === 'error' || t === 'warn' ? 'alert' : 'status' });
    const body = h('div', 'uic-alert-body');
    if (opts.title) body.append(h('b', '', {}, opts.title));
    body.append(h('span', '', {}, opts.message));
    this.el.append(body);
    if (opts.closable) {
      const x = h('button', 'uic-alert-x', { type: 'button', 'aria-label': 'Dismiss' }, '×');
      x.addEventListener('click', () => this.close()); this.el.append(x);
    }
    host.append(this.el);
  }
  close() { if (!this.el.isConnected) return; this.el.remove(); this.opts.onClose?.(); }
  destroy() { this.el.remove(); }
}
