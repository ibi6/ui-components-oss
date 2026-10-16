import './styles.css';
import { h } from '../../utils';
export interface BreadcrumbItem { label: string; href?: string }
export interface BreadcrumbOptions { items: BreadcrumbItem[]; separator?: string }
/** nav[aria-label=Breadcrumb] > ol; last item gets aria-current=page. */
export class Breadcrumb {
  readonly el: HTMLElement;
  constructor(host: HTMLElement, opts: BreadcrumbOptions) {
    this.el = h('nav', 'uic-bc', { 'aria-label': 'Breadcrumb' });
    const ol = h('ol', 'uic-bc-list');
    opts.items.forEach((it, i) => {
      const li = h('li', 'uic-bc-item'); const last = i === opts.items.length - 1;
      if (it.href && !last) li.append(h('a', 'uic-bc-link', { href: it.href }, it.label));
      else { const s = h('span', 'uic-bc-cur', {}, it.label); if (last) s.setAttribute('aria-current', 'page'); li.append(s); }
      if (!last) li.append(h('span', 'uic-bc-sep', { 'aria-hidden': 'true' }, opts.separator ?? '/'));
      ol.append(li);
    });
    this.el.append(ol); host.append(this.el);
  }
  destroy() { this.el.remove(); }
}
