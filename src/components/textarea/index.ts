import './styles.css';
import { h, uid } from '../../utils';
export interface TextareaOptions { value?: string; maxLength?: number; placeholder?: string; label?: string; rows?: number; onInput?: (v: string) => void }
/** Textarea with live character counter (aria-live polite, turns "over" past the limit). */
export class Textarea {
  readonly el: HTMLElement; readonly textarea: HTMLTextAreaElement; readonly counter: HTMLElement;
  constructor(host: HTMLElement, private opts: TextareaOptions = {}) {
    this.el = h('div', 'uic-ta');
    const t = this.textarea = h('textarea', 'uic-ta-el', { rows: String(opts.rows ?? 4) });
    t.value = opts.value ?? '';
    if (opts.placeholder) t.placeholder = opts.placeholder;
    if (opts.label) t.setAttribute('aria-label', opts.label);
    const id = uid('uic-ta'); this.counter = h('div', 'uic-ta-count', { id, 'aria-live': 'polite' });
    t.setAttribute('aria-describedby', id);
    t.addEventListener('input', () => { this.update(); opts.onInput?.(t.value); });
    this.el.append(t, this.counter); this.update(); host.append(this.el);
  }
  get length() { return this.textarea.value.length; }
  get value() { return this.textarea.value; }
  set value(v: string) { this.textarea.value = v; this.update(); }
  private update() {
    const m = this.opts.maxLength, n = this.length;
    this.counter.textContent = m ? `${n} / ${m}` : String(n);
    const over = !!m && n > m;
    this.counter.classList.toggle('uic-over', over);
    this.textarea.setAttribute('aria-invalid', String(over));
  }
  destroy() { this.el.remove(); }
}
