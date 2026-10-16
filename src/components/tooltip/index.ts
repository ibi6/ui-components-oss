import './styles.css';
export interface TooltipOptions { text: string; placement?: 'top' | 'bottom' }
let uid = 0;
/** Tooltip bound to a trigger. role=tooltip + aria-describedby; shows on hover/focus, Esc hides. */
export class Tooltip {
  readonly el: HTMLElement;
  private show = () => { this.el.hidden = false; };
  private hide = () => { this.el.hidden = true; };
  private key = (e: KeyboardEvent) => { if (e.key === 'Escape') this.hide(); };
  constructor(private trigger: HTMLElement, opts: TooltipOptions) {
    const el = this.el = document.createElement('span');
    el.className = 'uic-tip uic-tip-' + (opts.placement ?? 'top'); el.id = `uic-tip-${++uid}`;
    el.setAttribute('role', 'tooltip'); el.textContent = opts.text; el.hidden = true;
    trigger.classList.add('uic-tip-host'); trigger.setAttribute('aria-describedby', el.id); trigger.append(el);
    trigger.addEventListener('mouseenter', this.show); trigger.addEventListener('focusin', this.show);
    trigger.addEventListener('mouseleave', this.hide); trigger.addEventListener('focusout', this.hide);
    trigger.addEventListener('keydown', this.key);
  }
  setText(t: string) { this.el.textContent = t; }
  destroy() {
    const t = this.trigger;
    t.removeEventListener('mouseenter', this.show); t.removeEventListener('focusin', this.show);
    t.removeEventListener('mouseleave', this.hide); t.removeEventListener('focusout', this.hide);
    t.removeEventListener('keydown', this.key); t.removeAttribute('aria-describedby'); this.el.remove();
  }
}
