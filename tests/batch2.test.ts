import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Accordion, Modal, Tabs, Switch, Progress, Steps, Carousel, DataTable, Skeleton, Tooltip, CommandPalette } from '../src';

beforeEach(() => { document.body.innerHTML = ''; });
const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, ...init }));

describe('Accordion', () => {
  it('toggles aria-expanded and is exclusive by default', () => {
    const a = new Accordion(document.body, { items: [{ title: 'A', content: 'a', open: true }, { title: 'B', content: 'b' }] });
    const hd = document.querySelectorAll<HTMLButtonElement>('.uic-acc-hd');
    expect(hd[0].getAttribute('aria-expanded')).toBe('true');
    hd[1].click();
    expect(a.isOpen(1)).toBe(true); expect(a.isOpen(0)).toBe(false);
    expect(document.querySelectorAll<HTMLElement>('.uic-acc-bd')[0].hidden).toBe(true);
  });
});
describe('Modal', () => {
  it('opens, confirms, closes and restores focus', async () => {
    const btn = document.createElement('button'); document.body.append(btn); btn.focus();
    const fn = vi.fn();
    const m = new Modal({ title: 'Sure?', onConfirm: fn }); m.open();
    expect(document.querySelector('[role=dialog]')!.getAttribute('aria-modal')).toBe('true');
    (document.querySelector('[data-act=confirm]') as HTMLElement).click();
    expect(fn).toHaveBeenCalled(); expect(m.opened).toBe(false); expect(document.activeElement).toBe(btn);
  });
  it('Esc cancels', () => {
    const c = vi.fn(); const m = new Modal({ title: 't', onCancel: c }); m.open();
    key(m.el, 'Escape'); expect(c).toHaveBeenCalled(); expect(m.opened).toBe(false);
  });
  it('Modal.confirm resolves', async () => {
    const p = Modal.confirm({ title: 'x' });
    (document.querySelector('[data-act=confirm]') as HTMLElement).click();
    expect(await p).toBe(true);
  });
});
describe('Tabs', () => {
  it('selects with click and arrow keys, skipping disabled', () => {
    const fn = vi.fn();
    const t = new Tabs(document.body, { items: [{ label: 'a', content: 'A' }, { label: 'b', content: 'B', disabled: true }, { label: 'c', content: 'C' }], onChange: fn });
    expect(t.active).toBe(0);
    key(document.querySelector('.uic-tabs-list')!, 'ArrowRight');
    expect(t.active).toBe(2); expect(fn).toHaveBeenCalledWith(2);
    expect(document.querySelectorAll<HTMLElement>('.uic-tabpanel')[2].hidden).toBe(false);
  });
});
describe('Switch', () => {
  it('toggles aria-checked and fires onChange', () => {
    const fn = vi.fn(); const s = new Switch(document.body, { label: 'x', onChange: fn });
    s.el.click(); expect(s.checked).toBe(true); expect(fn).toHaveBeenCalledWith(true);
    expect(s.el.getAttribute('role')).toBe('switch');
  });
});
describe('Progress', () => {
  it('clamps and exposes aria-valuenow', () => {
    const p = new Progress(document.body, { value: 30 });
    expect(p.el.getAttribute('aria-valuenow')).toBe('30');
    p.set(500); expect(p.percent).toBe(100);
  });
});
describe('Steps', () => {
  it('advances and marks aria-current', () => {
    const s = new Steps(document.body, { steps: ['a', 'b', 'c'] });
    s.next(); expect(s.current).toBe(1);
    expect(document.querySelector('[aria-current="step"] .uic-step-label')!.textContent).toBe('b');
    s.set(99); expect(s.current).toBe(2);
  });
});
describe('Carousel', () => {
  it('navigates with loop and hides inactive slides', () => {
    const c = new Carousel(document.body, { slides: ['1', '2', '3'] });
    c.prev(); expect(c.index).toBe(2);
    c.next(); expect(c.index).toBe(0);
    expect(document.querySelectorAll('.uic-car-slide')[1].getAttribute('aria-hidden')).toBe('true');
  });
  it('autoplays', () => {
    vi.useFakeTimers();
    const c = new Carousel(document.body, { slides: ['1', '2'], autoplay: 100 });
    vi.advanceTimersByTime(110); expect(c.index).toBe(1); c.destroy(); vi.useRealTimers();
  });
});
describe('DataTable', () => {
  it('sorts and sets aria-sort; escapes text', () => {
    const t = new DataTable(document.body, { columns: [{ key: 'n', title: 'N', sortable: true }], rows: [{ n: 'b<i>' }, { n: 'a' }] });
    (document.querySelector('.uic-th-btn') as HTMLElement).click();
    const cells = [...document.querySelectorAll('tbody td')].map((x) => x.textContent);
    expect(cells).toEqual(['a', 'b<i>']);
    expect(document.querySelector('th')!.getAttribute('aria-sort')).toBe('ascending');
    expect(t.sorted).toEqual({ key: 'n', dir: 'asc' });
    expect(document.querySelector('tbody i')).toBeNull();
  });
});
describe('Skeleton', () => {
  it('renders lines and resolves', () => {
    const s = new Skeleton(document.body, { lines: 3 });
    expect(s.el.querySelectorAll('.uic-skel-text').length).toBe(3);
    s.resolve('<p>done</p>'); expect(s.el.getAttribute('aria-busy')).toBeNull(); expect(s.el.textContent).toBe('done');
  });
});
describe('Tooltip', () => {
  it('shows on focus and hides on Esc', () => {
    const b = document.createElement('button'); document.body.append(b);
    const t = new Tooltip(b, { text: 'hi' });
    expect(b.getAttribute('aria-describedby')).toBe(t.el.id);
    b.dispatchEvent(new FocusEvent('focusin', { bubbles: true })); expect(t.el.hidden).toBe(false);
    key(b, 'Escape'); expect(t.el.hidden).toBe(true);
  });
});
describe('CommandPalette', () => {
  it('filters, navigates and runs a command; Ctrl+K opens', () => {
    const a = vi.fn(), b = vi.fn();
    const p = new CommandPalette({ commands: [{ id: 'a', label: 'Open file', run: a }, { id: 'b', label: 'Toggle theme', run: b }] });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    expect(p.opened).toBe(true);
    const input = document.querySelector('.uic-cmd-in') as HTMLInputElement;
    input.value = 'theme'; input.dispatchEvent(new Event('input'));
    expect(document.querySelectorAll('[role=option]').length).toBe(1);
    key(input, 'Enter'); expect(b).toHaveBeenCalled(); expect(a).not.toHaveBeenCalled(); expect(p.opened).toBe(false);
    p.destroy();
  });
});
