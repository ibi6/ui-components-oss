import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Drawer, SearchSelect, Pagination, DualRange, toast, pageWindow } from '../src';

beforeEach(() => { document.body.innerHTML = ''; });

describe('Toast', () => {
  it('mounts with role=alert for errors and role=status otherwise', () => {
    toast.error('boom', 'Fail');
    toast.success('ok');
    const els = document.querySelectorAll('.uic-toast');
    expect(els.length).toBe(2);
    expect(els[0].getAttribute('role')).toBe('alert');
    expect(els[1].getAttribute('role')).toBe('status');
  });
  it('auto-dismisses', () => {
    vi.useFakeTimers();
    toast({ message: 'x', duration: 100 });
    vi.advanceTimersByTime(600);
    expect(document.querySelectorAll('.uic-toast').length).toBe(0);
    vi.useRealTimers();
  });
});

describe('Pagination', () => {
  it('switches pages, sets aria-current, fires onChange', () => {
    const host = document.body, fn = vi.fn();
    const p = new Pagination(host, { pages: 12, onChange: fn });
    expect(host.querySelector('[aria-current="page"]')!.textContent).toBe('1');
    (host.querySelector('button[data-p="2"]') as HTMLButtonElement).click();
    expect(p.page).toBe(2);
    expect(fn).toHaveBeenCalledWith(2);
    expect(host.querySelector('[aria-current="page"]')!.textContent).toBe('2');
    expect(host.querySelectorAll('button').length).toBeGreaterThan(3);
  });
  it('windows with gaps', () => { expect(pageWindow(6, 12)).toEqual([1, 5, 6, 7, 12]); });
});

describe('DualRange', () => {
  it('syncs labels and swaps crossed thumbs', () => {
    const fn = vi.fn();
    const d = new DualRange(document.body, { min: 0, max: 1000, value: [100, 800], format: (n) => '¥' + n, onChange: fn });
    expect(d.el.querySelector('.lo')!.textContent).toBe('¥100');
    const [a, b] = Array.from(d.el.querySelectorAll('input'));
    a.value = '900';
    a.dispatchEvent(new Event('input'));
    expect(d.value).toEqual([800, 900]);
    expect(d.el.querySelector('.hi')!.textContent).toBe('¥900');
    expect(b.value).toBe('900');
    expect(fn).toHaveBeenCalled();
  });
});

describe('SearchSelect', () => {
  it('filters by query and selects with keyboard', () => {
    const fn = vi.fn();
    const s = new SearchSelect(document.body, { options: [{ value: 'bj', label: '北京', group: '华北' }, { value: 'sh', label: '上海', group: '华东' }, { value: 'hz', label: '杭州', group: '华东' }], onChange: fn });
    (s.el.querySelector('.uic-sel-trig') as HTMLElement).click();
    expect(s.isOpen).toBe(true);
    const q = s.el.querySelector('.uic-sel-q') as HTMLInputElement;
    q.value = '华东'; q.dispatchEvent(new Event('input'));
    expect(s.el.querySelectorAll('li').length).toBe(2);
    q.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    q.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(s.value).toBe('hz');
    expect(s.isOpen).toBe(false);
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ value: 'hz' }));
  });
});

describe('Drawer', () => {
  it('opens with aria-modal dialog, closes on Escape, traps focus', () => {
    vi.useFakeTimers();
    const d = new Drawer({ title: 'T', content: '<button id="in">in</button>' });
    const panel = d.el.querySelector('[role=dialog]')!;
    expect(panel.getAttribute('aria-modal')).toBe('true');
    d.open();
    expect(d.isOpen).toBe(true);
    const x = d.el.querySelector('.uic-drawer-x') as HTMLElement;
    const inner = d.el.querySelector('#in') as HTMLElement;
    inner.focus();
    const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    inner.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(x);
    d.el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(d.isOpen).toBe(false);
    vi.advanceTimersByTime(400);
    expect(d.el.hidden).toBe(true);
    vi.useRealTimers();
  });
});
