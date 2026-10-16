import './styles.css';
import { h } from '../../utils';
export interface TreeNode { id: string; label: string; children?: TreeNode[] }
export interface TreeOptions { nodes: TreeNode[]; expanded?: string[]; selected?: string; onSelect?: (n: TreeNode) => void; onToggle?: (n: TreeNode, open: boolean) => void }
/** WAI-ARIA tree: roving tabindex, ↑/↓/→/←/Home/End/Enter. */
export class Tree {
  readonly el: HTMLElement; private open: Set<string>; private _sel: string | null; private cur: string;
  constructor(host: HTMLElement, private opts: TreeOptions) {
    this.open = new Set(opts.expanded ?? []); this._sel = opts.selected ?? null; this.cur = this._sel ?? opts.nodes[0]?.id ?? '';
    this.el = h('ul', 'uic-tree', { role: 'tree' });
    this.el.addEventListener('keydown', e => this.onKey(e)); host.append(this.el); this.render();
  }
  get selected() { return this._sel; }
  isOpen(id: string) { return this.open.has(id); }
  private find(id: string, ns = this.opts.nodes): TreeNode | null { for (const n of ns) { if (n.id === id) return n; const c = n.children && this.find(id, n.children); if (c) return c; } return null; }
  toggle(id: string, v?: boolean) { const n = this.find(id); if (!n?.children?.length) return; const o = v ?? !this.open.has(id); o ? this.open.add(id) : this.open.delete(id); this.render(); this.opts.onToggle?.(n, o); }
  select(id: string) { const n = this.find(id); if (!n) return; this._sel = id; this.cur = id; this.render(); this.opts.onSelect?.(n); }
  private visible(ns = this.opts.nodes, parent: string | null = null, out: { n: TreeNode; parent: string | null }[] = []) { for (const n of ns) { out.push({ n, parent }); if (n.children?.length && this.open.has(n.id)) this.visible(n.children, n.id, out); } return out; }
  private build(ns: TreeNode[], level: number, root: HTMLElement) {
    for (const n of ns) {
      const has = !!n.children?.length;
      const li = h('li', 'uic-tree-item', { role: 'treeitem', 'aria-level': String(level), 'aria-selected': String(this._sel === n.id), tabindex: this.cur === n.id ? '0' : '-1', 'data-id': n.id });
      if (has) li.setAttribute('aria-expanded', String(this.open.has(n.id)));
      const row = h('div', 'uic-tree-row'); row.style.paddingLeft = `${(level - 1) * 16 + 4}px`;
      row.append(h('span', 'uic-tree-caret', { 'aria-hidden': 'true' }, has ? (this.open.has(n.id) ? '▾' : '▸') : ''), h('span', 'uic-tree-label', {}, n.label));
      row.addEventListener('click', e => { e.stopPropagation(); this.cur = n.id; if (has) this.toggle(n.id); this.select(n.id); this.focusCur(); });
      li.append(row);
      if (has && this.open.has(n.id)) { const g = h('ul', 'uic-tree-group', { role: 'group' }); this.build(n.children!, level + 1, g); li.append(g); }
      root.append(li);
    }
  }
  private render() { this.el.textContent = ''; this.build(this.opts.nodes, 1, this.el); }
  private focusCur() { this.el.querySelector<HTMLElement>(`[data-id="${CSS.escape(this.cur)}"]`)?.focus(); }
  private onKey(e: KeyboardEvent) {
    const vis = this.visible(); const i = vis.findIndex(v => v.n.id === this.cur); if (i < 0) return; const { n, parent } = vis[i];
    const go = (id: string) => { this.cur = id; this.render(); this.focusCur(); };
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); if (vis[i + 1]) go(vis[i + 1].n.id); break;
      case 'ArrowUp': e.preventDefault(); if (vis[i - 1]) go(vis[i - 1].n.id); break;
      case 'Home': e.preventDefault(); go(vis[0].n.id); break;
      case 'End': e.preventDefault(); go(vis[vis.length - 1].n.id); break;
      case 'ArrowRight': e.preventDefault(); if (n.children?.length) { if (!this.open.has(n.id)) { this.toggle(n.id, true); this.focusCur(); } else go(n.children[0].id); } break;
      case 'ArrowLeft': e.preventDefault(); if (n.children?.length && this.open.has(n.id)) { this.toggle(n.id, false); this.focusCur(); } else if (parent) go(parent); break;
      case 'Enter': case ' ': e.preventDefault(); this.select(n.id); this.focusCur(); break;
    }
  }
  destroy() { this.el.remove(); }
}
