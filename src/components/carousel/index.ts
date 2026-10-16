import './styles.css';
export interface CarouselOptions { slides: string[]; autoplay?: number; loop?: boolean; onChange?: (index: number) => void }
/** Carousel: role=region + aria-roledescription, prev/next/dots, arrow keys, autoplay pauses on hover/focus. */
export class Carousel {
  readonly el: HTMLElement;
  private slides: HTMLElement[] = [];
  private dots: HTMLButtonElement[] = [];
  private cur = 0;
  private timer?: ReturnType<typeof setInterval>;
  constructor(host: HTMLElement, private opts: CarouselOptions) {
    const el = this.el = document.createElement('div'); el.className = 'uic-car';
    el.setAttribute('role', 'region'); el.setAttribute('aria-roledescription', 'carousel'); el.setAttribute('aria-label', 'Carousel'); el.tabIndex = 0;
    const track = document.createElement('div'); track.className = 'uic-car-track'; el.append(track);
    opts.slides.forEach((html, i) => {
      const s = document.createElement('div'); s.className = 'uic-car-slide'; s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide'); s.setAttribute('aria-label', `${i + 1} / ${opts.slides.length}`); s.innerHTML = html;
      track.append(s); this.slides.push(s);
    });
    const mk = (cls: string, label: string, text: string, fn: () => void) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.setAttribute('aria-label', label); b.textContent = text;
      b.addEventListener('click', fn); return b;
    };
    el.append(mk('uic-car-prev', 'Previous slide', '‹', () => this.prev()), mk('uic-car-next', 'Next slide', '›', () => this.next()));
    const dots = document.createElement('div'); dots.className = 'uic-car-dots';
    opts.slides.forEach((_, i) => { const d = mk('uic-car-dot', `Go to slide ${i + 1}`, '', () => this.go(i)); dots.append(d); this.dots.push(d); });
    el.append(dots);
    el.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') this.next(); else if (e.key === 'ArrowLeft') this.prev(); });
    ['mouseenter', 'focusin'].forEach((ev) => el.addEventListener(ev, () => this.stop()));
    ['mouseleave', 'focusout'].forEach((ev) => el.addEventListener(ev, () => this.play()));
    host.append(el);
    this.go(0, false); this.play();
  }
  get index() { return this.cur; }
  go(i: number, emit = true) {
    const n = this.slides.length;
    if (this.opts.loop !== false) i = (i + n) % n; else i = Math.max(0, Math.min(n - 1, i));
    this.cur = i;
    this.slides.forEach((s, j) => s.setAttribute('aria-hidden', String(j !== i)));
    this.dots.forEach((d, j) => d.setAttribute('aria-current', String(j === i)));
    (this.el.firstElementChild as HTMLElement).style.transform = `translateX(-${i * 100}%)`;
    if (emit) this.opts.onChange?.(i);
  }
  next() { this.go(this.cur + 1); }
  prev() { this.go(this.cur - 1); }
  play() { if (this.opts.autoplay && !this.timer) this.timer = setInterval(() => this.next(), this.opts.autoplay); }
  stop() { clearInterval(this.timer); this.timer = undefined; }
  destroy() { this.stop(); this.el.remove(); }
}
