import './styles.css';
import { h } from '../../utils';
export interface BadgeOptions { text?: string | number; variant?: 'primary' | 'success' | 'warn' | 'danger' | 'neutral'; dot?: boolean; max?: number; label?: string }
/** Pill or dot badge. Numbers above `max` render as "max+". Can wrap a target element. */
export class Badge {
  readonly el: HTMLElement;
  constructor(host: HTMLElement, private opts: BadgeOptions = {}) {
    this.el = h('span', `uic-badge uic-b-${opts.variant ?? 'primary'}`);
    host.append(this.el); this.set(opts.text ?? '');
  }
  set(text: string | number) {
    const { dot, max, label } = this.opts;
    this.el.classList.toggle('uic-badge-dot', !!dot);
    const shown = typeof text === 'number' && max !== undefined && text > max ? `${max}+` : String(text);
    this.el.textContent = dot ? '' : shown;
    if (label || dot) this.el.setAttribute('aria-label', label ?? shown);
  }
  destroy() { this.el.remove(); }
}
