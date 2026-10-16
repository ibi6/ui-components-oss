import './styles.css';
import { h } from '../../utils';
export interface EmptyOptions { title?: string; description?: string; icon?: string; actionText?: string; onAction?: () => void }
/** Empty-state placeholder with optional action button. */
export class Empty {
  readonly el: HTMLElement;
  constructor(host: HTMLElement, opts: EmptyOptions = {}) {
    this.el = h('div', 'uic-empty');
    this.el.append(h('div', 'uic-empty-ico', { 'aria-hidden': 'true' }, opts.icon ?? '∅'), h('b', 'uic-empty-title', {}, opts.title ?? 'No data'));
    if (opts.description) this.el.append(h('p', 'uic-empty-desc', {}, opts.description));
    if (opts.actionText) {
      const b = h('button', 'uic-empty-btn', { type: 'button' }, opts.actionText);
      b.addEventListener('click', () => opts.onAction?.()); this.el.append(b);
    }
    host.append(this.el);
  }
  destroy() { this.el.remove(); }
}
