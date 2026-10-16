import './styles.css';
import { h } from '../../utils';
export interface MarqueeOptions { items: (string | HTMLElement)[]; speed?: number; pauseOnHover?: boolean; reverse?: boolean }
/** Looping ticker. Duplicate track is aria-hidden; pauses on hover/focus and when prefers-reduced-motion. */
export class Marquee {
  readonly el: HTMLElement; private tracks: HTMLElement[] = [];
  constructor(host: HTMLElement, opts: MarqueeOptions) {
    this.el = h('div', 'uic-marq', { role: 'marquee', tabindex: '0' });
    if (opts.pauseOnHover !== false) this.el.classList.add('uic-marq-pause');
    if (opts.reverse) this.el.classList.add('uic-marq-rev');
    this.el.style.setProperty('--uic-marq-dur', `${opts.speed ?? 20}s`);
    for (let k = 0; k < 2; k++) {
      const t = h('div', 'uic-marq-track'); if (k) t.setAttribute('aria-hidden', 'true');
      for (const it of opts.items) { const s = h('span', 'uic-marq-item'); s.append(typeof it === 'string' ? document.createTextNode(it) : it.cloneNode(true)); t.append(s); }
      this.tracks.push(t); this.el.append(t);
    }
    this.el.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this.toggle(); } });
    host.append(this.el);
  }
  get paused() { return this.el.classList.contains('uic-marq-paused'); }
  pause() { this.el.classList.add('uic-marq-paused'); } play() { this.el.classList.remove('uic-marq-paused'); } toggle() { this.paused ? this.play() : this.pause(); }
  destroy() { this.el.remove(); }
}
