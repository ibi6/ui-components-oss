import './styles.css';
import { h } from '../../utils';
export interface CardOptions { title?: string; body: string | HTMLElement; footer?: string | HTMLElement; media?: HTMLElement; onClick?: () => void }
/** Content card. With onClick it becomes a keyboard-operable button-like region. */
export class Card {
  readonly el: HTMLElement; readonly bodyEl: HTMLElement;
  constructor(host: HTMLElement, opts: CardOptions) {
    this.el = h('article', 'uic-card'); const add = (e: HTMLElement, c: string | HTMLElement) => e.append(typeof c === 'string' ? document.createTextNode(c) : c);
    if (opts.media) { const m = h('div', 'uic-card-media'); m.append(opts.media); this.el.append(m); }
    if (opts.title) this.el.append(h('h3', 'uic-card-title', {}, opts.title));
    this.bodyEl = h('div', 'uic-card-body'); add(this.bodyEl, opts.body); this.el.append(this.bodyEl);
    if (opts.footer) { const f = h('div', 'uic-card-footer'); add(f, opts.footer); this.el.append(f); }
    if (opts.onClick) {
      const fn = opts.onClick; this.el.classList.add('uic-card-click'); this.el.tabIndex = 0; this.el.setAttribute('role', 'button');
      this.el.addEventListener('click', fn); this.el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
    }
    host.append(this.el);
  }
  destroy() { this.el.remove(); }
}
