import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Calendar, Select, Autocomplete, Upload, Form, rules, validate, Tree, Timeline, Collapse, Stat, Card, Sparkline, sparkPoints, BarChart, barRects, Donut, donutArcs, CountUp, Marquee, computePosition, Tooltip, Dropdown } from '../src';

beforeEach(() => { document.body.innerHTML = ''; });
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

describe('computePosition', () => {
  const vp = { width: 400, height: 300 };
  it('keeps requested side when it fits', () => { const r = computePosition({ left: 100, top: 100, width: 50, height: 20 }, { left: 0, top: 0, width: 80, height: 40 }, vp, 'bottom'); expect(r.side).toBe('bottom'); expect(r.flipped).toBe(false); expect(r.y).toBe(126); });
  it('flips to top on bottom collision', () => { const r = computePosition({ left: 100, top: 270, width: 50, height: 20 }, { left: 0, top: 0, width: 80, height: 40 }, vp, 'bottom'); expect(r.side).toBe('top'); expect(r.flipped).toBe(true); });
  it('clamps horizontally', () => { const r = computePosition({ left: 390, top: 100, width: 10, height: 10 }, { left: 0, top: 0, width: 100, height: 20 }, vp, 'bottom'); expect(r.x).toBe(300); });
});
describe('shared positioning wiring', () => {
  it('Dropdown menu and Tooltip become fixed-positioned when shown', () => {
    const d = new Dropdown(document.body, { label: 'M', items: [{ label: 'A' }] }); d.open(); expect(d.menu.style.position).toBe('fixed'); d.close();
    const b = document.createElement('button'); document.body.append(b); const t = new Tooltip(b, { text: 'hi' }); b.dispatchEvent(new Event('mouseenter')); expect(t.el.style.position).toBe('fixed');
  });
});
describe('Calendar', () => {
  it('keyboard moves focus and Enter selects', () => {
    const fn = vi.fn(); const c = new Calendar(document.body, { value: new Date(2026, 9, 15), onChange: fn });
    const g = c.el.querySelector('[role=grid]')!; key(g, 'ArrowRight'); key(g, 'ArrowDown'); key(g, 'Enter');
    expect(c.value!.getDate()).toBe(23); expect(fn).toHaveBeenCalled();
  });
  it('PageDown changes month; disabled dates not selectable', () => {
    const c = new Calendar(document.body, { value: new Date(2026, 9, 15), min: new Date(2026, 9, 10) });
    c.select(new Date(2026, 9, 5)); expect(c.value!.getDate()).toBe(15);
    key(c.el.querySelector('[role=grid]')!, 'PageDown'); expect(c.el.querySelector('.uic-cal-title')!.textContent).toBe('2026-11');
  });
});
describe('Select', () => {
  const opts = [{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }, { value: 'c', label: 'Cherry', disabled: true }];
  it('single: open, arrow, enter selects and closes', () => {
    const fn = vi.fn(); const s = new Select(document.body, { options: opts, onChange: fn });
    key(s.button, 'ArrowDown'); expect(s.button.getAttribute('aria-expanded')).toBe('true'); key(s.button, 'ArrowDown'); key(s.button, 'Enter');
    expect(s.value).toEqual(['b']); expect(s.opened).toBe(false); expect(fn).toHaveBeenCalledWith(['b']);
  });
  it('multiple keeps open; typeahead; skips disabled', () => {
    const s = new Select(document.body, { options: opts, multiple: true }); s.open(); key(s.button, 'b'); key(s.button, 'Enter'); key(s.button, 'ArrowDown'); key(s.button, 'Enter');
    expect(s.value).toEqual(['a', 'b']); expect(s.opened).toBe(true); // ArrowDown skipped disabled Cherry and wrapped to Apple
  });
});
describe('Autocomplete', () => {
  it('filters, navigates and picks', async () => {
    const fn = vi.fn(); const a = new Autocomplete(document.body, { source: ['apple', 'apricot', 'banana'], onSelect: fn });
    a.input.value = 'ap'; await a.query(); expect(a.list.children.length).toBe(2); expect(a.input.getAttribute('aria-expanded')).toBe('true');
    key(a.input, 'ArrowDown'); key(a.input, 'ArrowDown'); key(a.input, 'Enter'); expect(a.value).toBe('apricot'); expect(fn).toHaveBeenCalledWith('apricot');
  });
  it('async source ignores stale results', async () => {
    let n = 0; const a = new Autocomplete(document.body, { source: async () => { const k = ++n; await new Promise(r => setTimeout(r, k === 1 ? 20 : 1)); return [`r${k}`]; } });
    a.input.value = 'x'; const p1 = a.query(); const p2 = a.query(); await Promise.all([p1, p2]); expect(a.list.textContent).toBe('r2');
  });
});
describe('Upload', () => {
  it('accepts matching, rejects by type/size', () => {
    const rej = vi.fn(); const ch = vi.fn(); const u = new Upload(document.body, { accept: 'image/*,.pdf', maxSize: 10, multiple: true, onReject: rej, onChange: ch });
    u.add([new File(['x'], 'a.png', { type: 'image/png' }), new File(['x'], 'b.txt', { type: 'text/plain' }), new File(['x'.repeat(20)], 'c.pdf', { type: 'application/pdf' })]);
    expect(u.files.map(f => f.name)).toEqual(['a.png']); expect(rej).toHaveBeenCalledTimes(2); expect(rej.mock.calls.map(c => c[1])).toEqual(['type', 'size']);
    (document.querySelector('.uic-up-rm') as HTMLElement).click(); expect(u.files.length).toBe(0);
  });
});
describe('Form validation', () => {
  it('validate helper', () => { expect(validate('', [rules.required()])).toBe('Required'); expect(validate('', [rules.email()])).toBeNull(); expect(validate('x', [rules.email()])).toBe('Invalid email'); expect(validate('ab', [rules.minLength(3)])).toMatch(/3/); });
  it('blocks invalid submit, flags aria-invalid, focuses first error, then submits', () => {
    const ok = vi.fn(); const bad = vi.fn();
    const f = new Form(document.body, { fields: [{ name: 'email', label: 'Email', rules: [rules.required(), rules.email()] }], onSubmit: ok, onInvalid: bad });
    expect(f.submit()).toBe(false); const i = f.el.querySelector('input')!; expect(i.getAttribute('aria-invalid')).toBe('true'); expect(document.activeElement).toBe(i); expect(bad).toHaveBeenCalled();
    i.value = 'a@b.co'; i.dispatchEvent(new Event('input')); expect(i.getAttribute('aria-invalid')).toBe('false'); expect(f.submit()).toBe(true); expect(ok).toHaveBeenCalledWith({ email: 'a@b.co' });
  });
});
describe('Tree', () => {
  it('arrow keys expand/collapse/navigate and select', () => {
    const fn = vi.fn(); const t = new Tree(document.body, { nodes: [{ id: 'a', label: 'A', children: [{ id: 'a1', label: 'A1' }] }, { id: 'b', label: 'B' }], onSelect: fn });
    const k = (x: string) => key(t.el.querySelector('[tabindex="0"]')!, x);
    k('ArrowRight'); expect(t.isOpen('a')).toBe(true); k('ArrowRight'); k('Enter'); expect(fn).toHaveBeenCalledWith({ id: 'a1', label: 'A1' });
    k('ArrowLeft'); k('ArrowLeft'); expect(t.isOpen('a')).toBe(false); expect(t.el.querySelector('[aria-level="1"][aria-expanded="false"]')).not.toBeNull();
  });
});
describe('Timeline', () => { it('renders ordered items and aria-current', () => { const t = new Timeline(document.body, { items: [{ title: 'A' }, { title: 'B', status: 'active', time: '10:00' }] }); expect(t.el.tagName).toBe('OL'); expect(t.el.querySelector('[aria-current=step]')!.textContent).toContain('B'); }); });
describe('Collapse', () => { it('toggles aria-expanded and hidden', () => { const fn = vi.fn(); const c = new Collapse(document.body, { trigger: 'T', content: 'C', onToggle: fn }); expect(c.panel.hidden).toBe(true); c.button.click(); expect(c.button.getAttribute('aria-expanded')).toBe('true'); expect(c.panel.hidden).toBe(false); expect(fn).toHaveBeenCalledWith(true); }); });
describe('Stat', () => { it('shows delta with arrow and text label', () => { const s = new Stat(document.body, { label: 'Rev', value: '1.2k', delta: -3 }); expect(s.el.textContent).toContain('▼ 3%'); s.set('2k', 5); expect(s.el.querySelector('.uic-stat-up')).not.toBeNull(); }); });
describe('Card', () => { it('clickable card works with keyboard', () => { const fn = vi.fn(); const c = new Card(document.body, { title: 'T', body: 'B', onClick: fn }); key(c.el, 'Enter'); expect(fn).toHaveBeenCalled(); expect(c.el.getAttribute('role')).toBe('button'); }); });
describe('charts', () => {
  it('sparkPoints maps min to bottom and max to top', () => { const p = sparkPoints([0, 10], 100, 20, 0).split(' '); expect(p[0]).toBe('0.0,20.0'); expect(p[1]).toBe('100.0,0.0'); });
  it('Sparkline has accessible summary', () => { const s = new Sparkline(document.body, { data: [1, 5, 3] }); expect(s.el.getAttribute('aria-label')).toContain('max 5'); expect(s.el.querySelector('polyline')!.getAttribute('points')).toBeTruthy(); });
  it('barRects scales to max', () => { const r = barRects([{ label: 'a', value: 5 }, { label: 'b', value: 10 }], 100, 100); expect(r[1].height).toBeGreaterThan(r[0].height); expect(r[0].height / r[1].height).toBeCloseTo(0.5); });
  it('BarChart renders one rect per datum', () => { const b = new BarChart(document.body, { data: [{ label: 'a', value: 1 }, { label: 'b', value: 2 }] }); expect(b.svg.querySelectorAll('rect').length).toBe(2); expect(b.svg.getAttribute('aria-label')).toContain('b 2'); });
  it('donutArcs sums to circumference; Donut labels percentages', () => { const a = donutArcs([{ label: 'x', value: 1 }, { label: 'y', value: 3 }], 100); expect(a[0].len + a[1].len).toBeCloseTo(100); expect(a[1].pct).toBe(75); const d = new Donut(document.body, { data: [{ label: 'x', value: 1 }, { label: 'y', value: 3 }], center: '4' }); expect(d.svg.querySelectorAll('circle').length).toBe(2); expect(d.svg.getAttribute('aria-label')).toContain('y 75%'); });
});
describe('CountUp', () => {
  it('finish jumps to target with decimals/format', () => { const c = new CountUp(document.body, { to: 12.345, decimals: 1, autoStart: false }); expect(c.el.textContent).toBe('0.0'); c.finish(); expect(c.el.textContent).toBe('12.3'); });
  it('duration 0 sets immediately', () => { const c = new CountUp(document.body, { to: 7, duration: 0, format: n => `$${n}` }); expect(c.el.textContent).toBe('$7'); });
});
describe('Marquee', () => { it('duplicates track as aria-hidden and toggles pause', () => { const m = new Marquee(document.body, { items: ['a', 'b'] }); expect(m.el.querySelectorAll('.uic-marq-track').length).toBe(2); expect(m.el.querySelector('[aria-hidden=true]')).not.toBeNull(); key(m.el, ' '); expect(m.paused).toBe(true); }); });
