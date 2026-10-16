import './styles.css';
import { h, uid } from '../../utils';
export interface RadioOption { label: string; value: string; disabled?: boolean }
export interface RadioGroupOptions { options: RadioOption[]; value?: string; label?: string; onChange?: (value: string) => void }
/** Native radios in a role=radiogroup; arrow keys are native. */
export class RadioGroup {
  readonly el: HTMLElement; private inputs: HTMLInputElement[] = [];
  constructor(host: HTMLElement, private opts: RadioGroupOptions) {
    const name = uid('uic-radio');
    this.el = h('div', 'uic-radios', { role: 'radiogroup' });
    if (opts.label) this.el.setAttribute('aria-label', opts.label);
    for (const o of opts.options) {
      const l = h('label', 'uic-radio');
      const i = h('input', 'uic-radio-input', { type: 'radio', name, value: o.value });
      i.checked = o.value === opts.value; i.disabled = !!o.disabled;
      i.addEventListener('change', () => { if (i.checked) opts.onChange?.(o.value); });
      this.inputs.push(i); l.append(i, h('span', '', {}, o.label)); this.el.append(l);
    }
    host.append(this.el);
  }
  get value(): string | undefined { return this.inputs.find(i => i.checked)?.value; }
  set(v: string) { this.inputs.forEach(i => { i.checked = i.value === v; }); }
  destroy() { this.el.remove(); }
}
