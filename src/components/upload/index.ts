import './styles.css';
import { h, uid } from '../../utils';
export interface UploadOptions { accept?: string; multiple?: boolean; maxSize?: number; maxFiles?: number; text?: string; onChange?: (files: File[]) => void; onReject?: (file: File, reason: 'type' | 'size' | 'count') => void }
function acceptOk(f: File, accept?: string) {
  if (!accept) return true;
  return accept.split(',').map(s => s.trim().toLowerCase()).filter(Boolean).some(a => a.startsWith('.') ? f.name.toLowerCase().endsWith(a) : a.endsWith('/*') ? f.type.startsWith(a.slice(0, -1)) : f.type === a);
}
/** Front-end only drag & drop file picker (no network). Keyboard: Enter/Space opens picker. */
export class Upload {
  readonly el: HTMLElement; readonly input: HTMLInputElement; readonly listEl: HTMLElement; private _files: File[] = [];
  constructor(host: HTMLElement, private opts: UploadOptions = {}) {
    const id = uid('uic-up');
    this.el = h('div', 'uic-up', { role: 'button', tabindex: '0', 'aria-describedby': id });
    this.input = h('input', 'uic-up-input', { type: 'file', tabindex: '-1', 'aria-hidden': 'true' });
    if (opts.accept) this.input.accept = opts.accept; this.input.multiple = !!opts.multiple;
    const hint = h('span', 'uic-up-hint', { id }, opts.text ?? 'Drop files here or click to browse');
    this.listEl = h('ul', 'uic-up-list', { 'aria-live': 'polite' });
    this.el.append(this.input, hint);
    this.el.addEventListener('click', e => { if (e.target !== this.input) this.input.click(); });
    this.el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.input.click(); } });
    this.input.addEventListener('change', () => { this.add([...(this.input.files ?? [])]); this.input.value = ''; });
    this.el.addEventListener('dragover', e => { e.preventDefault(); this.el.classList.add('uic-up-over'); });
    this.el.addEventListener('dragleave', () => this.el.classList.remove('uic-up-over'));
    this.el.addEventListener('drop', e => { e.preventDefault(); this.el.classList.remove('uic-up-over'); this.add([...((e as DragEvent).dataTransfer?.files ?? [])]); });
    host.append(this.el, this.listEl);
  }
  get files() { return [...this._files]; }
  add(files: File[]) {
    for (const f of files) {
      if (!acceptOk(f, this.opts.accept)) { this.opts.onReject?.(f, 'type'); continue; }
      if (this.opts.maxSize && f.size > this.opts.maxSize) { this.opts.onReject?.(f, 'size'); continue; }
      if (!this.opts.multiple) this._files = []; else if (this.opts.maxFiles && this._files.length >= this.opts.maxFiles) { this.opts.onReject?.(f, 'count'); continue; }
      this._files.push(f);
    }
    this.render(); this.opts.onChange?.(this.files);
  }
  remove(i: number) { this._files.splice(i, 1); this.render(); this.opts.onChange?.(this.files); }
  private render() {
    this.listEl.textContent = '';
    this._files.forEach((f, i) => {
      const li = h('li', 'uic-up-item'); const b = h('button', 'uic-up-rm', { type: 'button', 'aria-label': `Remove ${f.name}` }, '×');
      b.addEventListener('click', () => this.remove(i)); li.append(h('span', 'uic-up-name', {}, `${f.name} (${f.size} B)`), b); this.listEl.append(li);
    });
  }
  destroy() { this.el.remove(); this.listEl.remove(); }
}
