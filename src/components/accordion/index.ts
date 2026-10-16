import './styles.css';
export interface AccordionItem { title: string; content: string; open?: boolean }
export interface AccordionOptions { items: AccordionItem[]; multiple?: boolean; onToggle?: (index: number, open: boolean) => void }
let uid = 0;
/** Accordion with button headers, aria-expanded/aria-controls and region panels. */
export class Accordion {
  readonly el: HTMLElement;
  private heads: HTMLButtonElement[] = [];
  private panels: HTMLElement[] = [];
  constructor(host: HTMLElement, private opts: AccordionOptions) {
    const id = ++uid;
    this.el = document.createElement('div');
    this.el.className = 'uic-acc';
    opts.items.forEach((it, i) => {
      const item = document.createElement('div'); item.className = 'uic-acc-item';
      const b = document.createElement('button'); b.type = 'button'; b.className = 'uic-acc-hd';
      b.id = `uic-acc-${id}-h${i}`; b.setAttribute('aria-controls', `uic-acc-${id}-p${i}`);
      b.textContent = it.title;
      const p = document.createElement('div'); p.className = 'uic-acc-bd'; p.id = `uic-acc-${id}-p${i}`;
      p.setAttribute('role', 'region'); p.setAttribute('aria-labelledby', b.id);
      p.innerHTML = it.content;
      b.addEventListener('click', () => this.toggle(i));
      item.append(b, p); this.el.append(item);
      this.heads.push(b); this.panels.push(p);
      this.set(i, !!it.open, false);
    });
    host.append(this.el);
  }
  isOpen(i: number): boolean { return this.heads[i]?.getAttribute('aria-expanded') === 'true'; }
  private set(i: number, open: boolean, emit = true) {
    this.heads[i].setAttribute('aria-expanded', String(open));
    this.panels[i].hidden = !open;
    this.heads[i].parentElement!.classList.toggle('open', open);
    if (emit) this.opts.onToggle?.(i, open);
  }
  toggle(i: number) {
    const open = !this.isOpen(i);
    if (open && !this.opts.multiple) this.heads.forEach((_, j) => { if (j !== i && this.isOpen(j)) this.set(j, false); });
    this.set(i, open);
  }
  destroy() { this.el.remove(); }
}
