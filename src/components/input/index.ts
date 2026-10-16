import './styles.css';
import { h } from '../../utils';
export interface InputOptions { value?: string; placeholder?: string; label?: string; type?: 'text' | 'password' | 'email' | 'search'; clearable?: boolean; disabled?: boolean; onInput?: (v: string) => void }
/** Text input with optional clear button and (for password) show/hide toggle. */
export class Input {
  readonly el: HTMLElement; readonly input: HTMLInputElement; private clearBtn?: HTMLButtonElement; private eye?: HTMLButtonElement;
  constructor(host: HTMLElement, private opts: InputOptions = {}) {
    this.el = h('div', 'uic-input');
    const i = this.input = h('input', 'uic-input-el', { type: opts.type ?? 'text' });
    i.value = opts.value ?? ''; i.disabled = !!opts.disabled;
    if (opts.placeholder) i.placeholder = opts.placeholder;
    if (opts.label) i.setAttribute('aria-label', opts.label);
    this.el.append(i);
    if (opts.clearable) {
      const c = this.clearBtn = h('button', 'uic-input-btn uic-input-clear', { type: 'button', 'aria-label': 'Clear' }, '×');
      c.addEventListener('click', () => { this.value = ''; opts.onInput?.(''); i.focus(); });
      this.el.append(c);
    }
    if (opts.type === 'password') {
      const e = this.eye = h('button', 'uic-input-btn uic-input-eye', { type: 'button', 'aria-label': 'Show password', 'aria-pressed': 'false' }, '👁');
      e.addEventListener('click', () => this.reveal(i.type === 'password'));
      this.el.append(e);
    }
    i.addEventListener('input', () => { this.sync(); opts.onInput?.(i.value); });
    this.sync(); host.append(this.el);
  }
  private sync() { if (this.clearBtn) this.clearBtn.hidden = !this.input.value; }
  get value() { return this.input.value; }
  set value(v: string) { this.input.value = v; this.sync(); }
  reveal(show: boolean) {
    if (!this.eye) return;
    this.input.type = show ? 'text' : 'password';
    this.eye.setAttribute('aria-pressed', String(show)); this.eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  }
  destroy() { this.el.remove(); }
}
