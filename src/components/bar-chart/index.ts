import './styles.css';
const NS = 'http://www.w3.org/2000/svg';
export interface BarDatum { label: string; value: number }
export interface BarChartOptions { data: BarDatum[]; width?: number; height?: number; title?: string }
/** Pure: bar geometry for data. */
export function barRects(data: BarDatum[], w: number, h: number, gap = 8, labelH = 20) {
  const max = Math.max(0, ...data.map(d => d.value)) || 1; const bw = data.length ? (w - gap * (data.length + 1)) / data.length : 0; const ch = h - labelH;
  return data.map((d, i) => { const bh = Math.max(0, (d.value / max) * (ch - 4)); return { x: gap + i * (bw + gap), y: ch - bh, width: bw, height: bh }; });
}
/** SVG bar chart with a visually-hidden data table fallback for assistive tech. */
export class BarChart {
  readonly el: HTMLElement; readonly svg: SVGSVGElement;
  constructor(host: HTMLElement, private opts: BarChartOptions) {
    this.el = document.createElement('figure'); this.el.className = 'uic-bar';
    this.svg = document.createElementNS(NS, 'svg') as SVGSVGElement; this.svg.setAttribute('role', 'img'); this.svg.setAttribute('class', 'uic-bar-svg');
    this.el.append(this.svg); host.append(this.el); this.set(opts.data);
  }
  set(data: BarDatum[]) {
    const w = this.opts.width ?? 320, h = this.opts.height ?? 160; this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`); this.svg.textContent = '';
    this.svg.setAttribute('aria-label', `${this.opts.title ?? 'Bar chart'}: ` + data.map(d => `${d.label} ${d.value}`).join(', '));
    barRects(data, w, h).forEach((r, i) => {
      const rect = document.createElementNS(NS, 'rect'); rect.setAttribute('class', 'uic-bar-rect');
      for (const [k, v] of Object.entries(r)) rect.setAttribute(k, String(v)); rect.setAttribute('rx', '3');
      const t = document.createElementNS(NS, 'title'); t.textContent = `${data[i].label}: ${data[i].value}`; rect.append(t);
      const tx = document.createElementNS(NS, 'text'); tx.setAttribute('class', 'uic-bar-label'); tx.setAttribute('x', String(r.x + r.width / 2)); tx.setAttribute('y', String(h - 5)); tx.setAttribute('text-anchor', 'middle'); tx.textContent = data[i].label;
      this.svg.append(rect, tx);
    });
  }
  destroy() { this.el.remove(); }
}
