import './styles.css';
import { h, uid } from '../../utils';
export type Rule = ((value: string) => string | null) & { required?: boolean };
export const rules = {
  required: (msg = 'Required'): Rule => Object.assign((v: string) => (v.trim() ? null : msg), { required: true }),
  minLength: (n: number, msg?: string): Rule => v => (v.length >= n ? null : msg ?? `At least ${n} characters`),
  maxLength: (n: number, msg?: string): Rule => v => (v.length <= n ? null : msg ?? `At most ${n} characters`),
  pattern: (re: RegExp, msg = 'Invalid format'): Rule => v => (re.test(v) ? null : msg),
  email: (msg = 'Invalid email'): Rule => v => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : msg),
};
/** Run rules in order; returns first error or null. Empty optional values skip non-required rules. */
export function validate(value: string, rs: Rule[]): string | null {
  for (const r of rs) { const e = r(value); if (e && (value !== '' || r.required)) return e; }
  return null;
}
export interface FormField { name: string; label: string; type?: string; rules?: Rule[]; value?: string }
export interface FormOptions { fields: FormField[]; submitText?: string; onSubmit?: (values: Record<string, string>) => void; onInvalid?: (errors: Record<string, string>) => void }
/** Declarative form with accessible inline validation (aria-invalid + aria-describedby + role=alert). */
export class Form {
  readonly el: HTMLFormElement; private inputs = new Map<string, HTMLInputElement>(); private errs = new Map<string, HTMLElement>();
  constructor(host: HTMLElement, private opts: FormOptions) {
    this.el = h('form', 'uic-form', { novalidate: '' });
    for (const f of opts.fields) {
      const id = uid('uic-f'); const wrap = h('div', 'uic-form-field');
      const lab = h('label', 'uic-form-label', { for: id }, f.label);
      const inp = h('input', 'uic-form-input', { id, name: f.name, type: f.type ?? 'text', 'aria-describedby': `${id}-e` }); inp.value = f.value ?? '';
      const err = h('div', 'uic-form-error', { id: `${id}-e`, role: 'alert' });
      inp.addEventListener('blur', () => this.check(f.name)); inp.addEventListener('input', () => { if (inp.getAttribute('aria-invalid') === 'true') this.check(f.name); });
      this.inputs.set(f.name, inp); this.errs.set(f.name, err); wrap.append(lab, inp, err); this.el.append(wrap);
    }
    this.el.append(h('button', 'uic-form-submit', { type: 'submit' }, opts.submitText ?? 'Submit'));
    this.el.addEventListener('submit', e => { e.preventDefault(); this.submit(); });
    host.append(this.el);
  }
  get values(): Record<string, string> { const o: Record<string, string> = {}; this.inputs.forEach((i, k) => { o[k] = i.value; }); return o; }
  check(name: string): string | null {
    const f = this.opts.fields.find(x => x.name === name)!; const inp = this.inputs.get(name)!; const err = validate(inp.value, f.rules ?? []);
    inp.setAttribute('aria-invalid', String(!!err)); this.errs.get(name)!.textContent = err ?? ''; return err;
  }
  submit(): boolean {
    const errors: Record<string, string> = {};
    for (const f of this.opts.fields) { const e = this.check(f.name); if (e) errors[f.name] = e; }
    const keys = Object.keys(errors);
    if (keys.length) { this.inputs.get(keys[0])!.focus(); this.opts.onInvalid?.(errors); return false; }
    this.opts.onSubmit?.(this.values); return true;
  }
  destroy() { this.el.remove(); }
}
