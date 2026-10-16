import './styles.css';
import { h } from '../../utils';
export interface AvatarOptions { name?: string; src?: string; size?: number; status?: 'online' | 'offline' | 'busy' }
export function initials(name = ''): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return '?';
  return (p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[p.length - 1][0]).toUpperCase();
}
/** Image avatar that falls back to initials on load error. */
export class Avatar {
  readonly el: HTMLElement;
  constructor(host: HTMLElement, opts: AvatarOptions = {}) {
    this.el = h('span', 'uic-avatar', { role: 'img', 'aria-label': opts.name ?? 'Avatar' });
    if (opts.size) this.el.style.setProperty('--uic-size', opts.size + 'px');
    const fallback = () => { this.el.textContent = initials(opts.name); };
    if (opts.src) {
      const img = h('img', '', { src: opts.src, alt: '' });
      img.addEventListener('error', () => { img.remove(); fallback(); });
      this.el.append(img);
    } else fallback();
    if (opts.status) this.el.append(h('i', `uic-avatar-dot uic-${opts.status}`, { 'aria-hidden': 'true' }));
    host.append(this.el);
  }
  destroy() { this.el.remove(); }
}
