import './styles.css';
const NS = 'http://www.w3.org/2000/svg';
export interface DonutSlice { label: string; value: number; color?: string }
export interface DonutOptions { data: DonutSlice[]; size?: number; thickness?: number; title?: string; center?: string }
const PALETTE = ['#6c4dff', '#1a8f4c', '#e5a000', '#e5484d', '#0091ff', '#8e4ec6'];
/** Pure: arc lengths per slice for circumference c. */
export function donutArcs(data: DonutSlice[], c: number) {
  const total = data.reduce((s, d) => s + Math.max(0, d.value), 0) || 1; let off = 0;
  return data.map(d => { const len = (Math.max(0, d.value) / total) * c; const r = { len, offset: off, pct: Math.round((Math.max(0, d.value) / total) * 100) }; off += len; return r; });
}
/** SVG donut chart using stroke-dasharray segments. */
export class Donut {
  readonly el: HTMLElement; readonly svg: SVGSVGElement;
  constructor(host: HTMLElement, private opts: DonutOptions) {
    this.el = document.createElement('figure'); this.el.className = 'uic-donut';
    this.svg = document.createElementNS(NS, 'svg') as SVGSVGElement; this.svg.setAttribute('role', 'img'); this.svg.setAttribute('class', 'uic-donut-svg');
    this.el.append(this.svg); host.append(this.el); this.set(opts.data);
  }
  set(data: DonutSlice[]) {
    const size = this.opts.size ?? 160, th = this.opts.thickness ?? 22, r = (size - th) / 2, c = 2 * Math.PI * r, arcs = donutArcs(data, c);
    this.svg.setAttribute('viewBox', `0 0 ${size} ${size}`); this.svg.setAttribute('width', String(size)); this.svg.setAttribute('height', String(size)); this.svg.textContent = '';
    this.svg.setAttribute('aria-label', `${this.opts.title ?? 'Donut chart'}: ` + data.map((d, i) => `${d.label} ${arcs[i].pct}%`).join(', '));
    data.forEach((d, i) => {
      const k = document.createElementNS(NS, 'circle'); k.setAttribute('class', 'uic-donut-seg');
      const at: Record<string, string> = { cx: String(size / 2), cy: String(size / 2), r: String(r), fill: 'none', stroke: d.color ?? PALETTE[i % PALETTE.length], 'stroke-width': String(th), 'stroke-dasharray': `${arcs[i].len} ${c - arcs[i].len}`, 'stroke-dashoffset': String(-arcs[i].offset), transform: `rotate(-90 ${size / 2} ${size / 2})` };
      for (const key in at) k.setAttribute(key, at[key]);
      const t = document.createElementNS(NS, 'title'); t.textContent = `${d.label}: ${d.value} (${arcs[i].pct}%)`; k.append(t); this.svg.append(k);
    });
    if (this.opts.center) { const tx = document.createElementNS(NS, 'text'); tx.setAttribute('class', 'uic-donut-center'); tx.setAttribute('x', String(size / 2)); tx.setAttribute('y', String(size / 2)); tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('dominant-baseline', 'central'); tx.textContent = this.opts.center; this.svg.append(tx); }
  }
  destroy() { this.el.remove(); }
}
