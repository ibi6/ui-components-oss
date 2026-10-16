import './styles.css';
import { h } from '../../utils';
export interface TimelineItem { title: string; time?: string; description?: string; status?: 'done' | 'active' | 'pending' | 'error' }
export interface TimelineOptions { items: TimelineItem[] }
/** Vertical timeline rendered as an ordered list; active item gets aria-current=step. */
export class Timeline {
  readonly el: HTMLElement;
  constructor(host: HTMLElement, opts: TimelineOptions) {
    this.el = h('ol', 'uic-tl');
    for (const it of opts.items) {
      const st = it.status ?? 'done'; const li = h('li', `uic-tl-item uic-tl-${st}`);
      if (st === 'active') li.setAttribute('aria-current', 'step');
      li.append(h('span', 'uic-tl-dot', { 'aria-hidden': 'true' }));
      const body = h('div', 'uic-tl-body'); body.append(h('div', 'uic-tl-title', {}, it.title));
      if (it.time) { const t = h('time', 'uic-tl-time', {}, it.time); body.append(t); }
      if (it.description) body.append(h('div', 'uic-tl-desc', {}, it.description));
      li.append(body); this.el.append(li);
    }
    host.append(this.el);
  }
  destroy() { this.el.remove(); }
}
