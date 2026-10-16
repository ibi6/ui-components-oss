import './styles.css';
import { h } from '../../utils';
export interface CheckboxOptions { label: string; checked?: boolean; indeterminate?: boolean; disabled?: boolean; onChange?: (checked: boolean) => void }
/** Native checkbox wrapped in a styled label; supports indeterminate. */
export class Checkbox {
  readonly el: HTMLLabelElement; readonly input: HTMLInputElement;
  constructor(host: HTMLElement, opts: CheckboxOptions) {
    this.el = h('label', 'uic-check');
    const i = this.input = h('input', 'uic-check-input', { type: 'checkbox' });
    i.checked = !!opts.checked; i.indeterminate = !!opts.indeterminate; i.disabled = !!opts.disabled;
    i.addEventListener('change', () => { i.indeterminate = false; opts.onChange?.(i.checked); });
    this.el.append(i, h('span', 'uic-check-label', {}, opts.label)); host.append(this.el);
  }
  get checked() { return this.input.checked; }
  set(v: boolean) { this.input.indeterminate = false; this.input.checked = v; }
  destroy() { this.el.remove(); }
}
