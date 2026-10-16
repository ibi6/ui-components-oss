import './styles.css';
import { h } from '../../utils';
export interface TagInputOptions { tags?: string[]; placeholder?: string; max?: number; allowDuplicates?: boolean; onChange?: (tags: string[]) => void }
/** Enter/comma adds a tag, Backspace on empty removes the last, × removes a tag. */
export class TagInput {
  readonly el: HTMLElement; readonly input: HTMLInputElement; private _tags: string[] = [];
  constructor(host: HTMLElement, private opts: TagInputOptions = {}) {
    this.el = h('div', 'uic-tags', { role: 'group', 'aria-label': 'Tags' });
    this.input = h('input', 'uic-tags-input', { type: 'text', 'aria-label': 'Add tag' });
    if (opts.placeholder) this.input.placeholder = opts.placeholder;
    this.input.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); this.add(this.input.value); }
      else if (e.key === 'Backspace' && !this.input.value && this._tags.length) this.remove(this._tags.length - 1);
    });
    this.el.addEventListener('click', () => this.input.focus());
    host.append(this.el);
    (opts.tags ?? []).forEach(t => this.add(t, false)); this.render();
  }
  get tags() { return [...this._tags]; }
  add(raw: string, emit = true): boolean {
    const t = raw.trim().replace(/,$/, '').trim();
    if (!t || (this.opts.max && this._tags.length >= this.opts.max) || (!this.opts.allowDuplicates && this._tags.includes(t))) { this.input.value = ''; return false; }
    this._tags.push(t); this.input.value = ''; this.render(); if (emit) this.opts.onChange?.(this.tags); return true;
  }
  remove(i: number) { this._tags.splice(i, 1); this.render(); this.opts.onChange?.(this.tags); }
  private render() {
    this.el.querySelectorAll('.uic-tag').forEach(n => n.remove());
    this._tags.forEach((t, i) => {
      const chip = h('span', 'uic-tag'); chip.append(h('span', '', {}, t));
      const x = h('button', 'uic-tag-x', { type: 'button', 'aria-label': `Remove ${t}` }, '×');
      x.addEventListener('click', e => { e.stopPropagation(); this.remove(i); this.input.focus(); });
      chip.append(x); this.el.insertBefore(chip, this.input);
    });
    if (!this.input.parentNode) this.el.append(this.input);
  }
  destroy() { this.el.remove(); }
}
