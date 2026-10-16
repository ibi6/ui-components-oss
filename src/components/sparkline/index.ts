import './styles.css';
const NS = 'http://www.w3.org/2000/svg';
export interface SparklineOptions { data: number[]; width?: number; height?: number; label?: string; area?: boolean }
/** Pure: map data to SVG polyline points. */
export function sparkPoints(data: number[], w: number, h: number, pad = 2): string {
  if (!data.length) return '';
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  return data.map((v, i) => `${(data.length === 1 ? w / 2 : pad + (i * (w - pad * 2)) / (data.length - 1)).toFixed(1)},${(h - pad - ((v - min) / span) * (h - pad * 2)).toFixed(1)}`).join(' ');
}
/** Inline SVG trend line. role=img with a text summary. */
export class Sparkline {
  readonly el: SVGSVGElement; private line: SVGPolylineElement; private fill: SVGPolygonElement;
  constructor(host: HTMLElement, private opts: SparklineOptions) {
    const w = opts.width ?? 120, hh = opts.height ?? 32;
    this.el = document.createElementNS(NS, 'svg'); this.el.setAttribute('class', 'uic-spark'); this.el.setAttribute('viewBox', `0 0 ${w} ${hh}`); this.el.setAttribute('width', String(w)); this.el.setAttribute('height', String(hh)); this.el.setAttribute('role', 'img');
    this.fill = document.createElementNS(NS, 'polygon'); this.fill.setAttribute('class', 'uic-spark-area'); this.line = document.createElementNS(NS, 'polyline'); this.line.setAttribute('class', 'uic-spark-line'); this.line.setAttribute('fill', 'none');
    this.el.append(this.fill, this.line); host.append(this.el); this.set(opts.data);
  }
  set(data: number[]) {
    const w = this.opts.width ?? 120, hh = this.opts.height ?? 32; const pts = sparkPoints(data, w, hh);
    this.line.setAttribute('points', pts); this.fill.setAttribute('points', pts && this.opts.area !== false ? `${pts} ${w - 2},${hh} 2,${hh}` : '');
    this.el.setAttribute('aria-label', `${this.opts.label ?? 'Trend'}: ${data.length} points, min ${Math.min(...data)}, max ${Math.max(...data)}, last ${data[data.length - 1]}`);
  }
  destroy() { this.el.remove(); }
}
