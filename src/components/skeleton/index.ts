import './styles.css';
export interface SkeletonOptions { variant?: 'text' | 'circle' | 'rect'; lines?: number; width?: string; height?: string }
/** Loading placeholder. aria-busy + aria-hidden shapes. */
export class Skeleton {
  readonly el: HTMLElement;
  constructor(host: HTMLElement, opts: SkeletonOptions = {}) {
    const el = this.el = document.createElement('div');
    el.className = 'uic-skel'; el.setAttribute('aria-busy', 'true'); el.setAttribute('aria-live', 'polite');
    const v = opts.variant ?? 'text';
    const n = v === 'text' ? Math.max(1, opts.lines ?? 3) : 1;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span'); s.className = `uic-skel-${v}`; s.setAttribute('aria-hidden', 'true');
      if (opts.width) s.style.width = opts.width; else if (v === 'text' && i === n - 1 && n > 1) s.style.width = '60%';
      if (opts.height) s.style.height = opts.height;
      el.append(s);
    }
    host.append(el);
  }
  /** Replace placeholder with real content. */
  resolve(html: string) { this.el.removeAttribute('aria-busy'); this.el.className = ''; this.el.innerHTML = html; }
  destroy() { this.el.remove(); }
}
