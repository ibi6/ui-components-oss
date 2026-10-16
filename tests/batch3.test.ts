import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Dropdown, Popover, Input, Textarea, OtpInput, Checkbox, RadioGroup, Slider, TagInput, Rating, Avatar, Badge, Breadcrumb, Alert, Empty, initials } from '../src';

beforeEach(() => { document.body.innerHTML = ''; });
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
const type = (i: HTMLInputElement | HTMLTextAreaElement, v: string) => { i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); };

describe('Dropdown', () => {
  it('opens, selects, closes with aria state', () => {
    const fn = vi.fn();
    const d = new Dropdown(document.body, { label: 'Menu', items: [{ label: 'A' }, { label: 'B' }], onSelect: fn });
    d.button.click();
    expect(d.button.getAttribute('aria-expanded')).toBe('true');
    key(d.menu, 'ArrowDown');
    (d.menu.querySelectorAll('.uic-dd-item')[1] as HTMLElement).click();
    expect(fn).toHaveBeenCalledWith({ label: 'B' }, 1); expect(d.opened).toBe(false);
  });
  it('Esc closes', () => { const d = new Dropdown(document.body, { label: 'M', items: [{ label: 'A' }] }); d.open(); key(d.menu, 'Escape'); expect(d.opened).toBe(false); });
});
describe('Popover', () => {
  it('toggles on trigger and closes on outside click', () => {
    const b = document.createElement('button'); document.body.append(b);
    const p = new Popover(b, { content: 'hi' });
    b.click(); expect(p.opened).toBe(true); expect(b.getAttribute('aria-expanded')).toBe('true');
    document.body.click(); expect(p.opened).toBe(false);
  });
});
describe('Input', () => {
  it('clear button empties value', () => {
    const i = new Input(document.body, { clearable: true, value: 'x' });
    const c = document.querySelector<HTMLButtonElement>('.uic-input-clear')!; expect(c.hidden).toBe(false);
    c.click(); expect(i.value).toBe(''); expect(c.hidden).toBe(true);
  });
  it('password toggle', () => {
    const i = new Input(document.body, { type: 'password' });
    document.querySelector<HTMLButtonElement>('.uic-input-eye')!.click();
    expect(i.input.type).toBe('text');
  });
});
describe('Textarea', () => {
  it('counts and flags over limit', () => {
    const t = new Textarea(document.body, { maxLength: 5 });
    type(t.textarea, 'abcdefg');
    expect(t.counter.textContent).toBe('7 / 5'); expect(t.textarea.getAttribute('aria-invalid')).toBe('true');
  });
});
describe('OtpInput', () => {
  it('paste fills and completes', () => {
    const fn = vi.fn(); const o = new OtpInput(document.body, { length: 4, onComplete: fn });
    o.fill('12-34'); expect(o.value).toBe('1234'); expect(fn).toHaveBeenCalledWith('1234');
  });
  it('typing advances focus', () => {
    const o = new OtpInput(document.body, { length: 3 });
    type(o.cells[0], '7'); expect(document.activeElement).toBe(o.cells[1]);
  });
});
describe('Checkbox / RadioGroup', () => {
  it('checkbox emits and clears indeterminate', () => {
    const fn = vi.fn(); const c = new Checkbox(document.body, { label: 'x', indeterminate: true, onChange: fn });
    c.input.click(); expect(fn).toHaveBeenCalledWith(true); expect(c.input.indeterminate).toBe(false);
  });
  it('radio group selects one', () => {
    const fn = vi.fn(); const r = new RadioGroup(document.body, { options: [{ label: 'a', value: 'a' }, { label: 'b', value: 'b' }], value: 'a', onChange: fn });
    expect(r.value).toBe('a');
    document.querySelectorAll<HTMLInputElement>('.uic-radio-input')[1].click();
    expect(fn).toHaveBeenCalledWith('b'); expect(r.value).toBe('b');
  });
});
describe('Slider', () => {
  it('reflects value in readout', () => {
    const fn = vi.fn(); const s = new Slider(document.body, { value: 10, format: v => v + '%', onChange: fn });
    expect(document.querySelector('.uic-slider-out')!.textContent).toBe('10%');
    type(s.input, '40'); expect(fn).toHaveBeenCalledWith(40);
  });
});
describe('TagInput', () => {
  it('adds on Enter, dedups, removes on Backspace', () => {
    const t = new TagInput(document.body, {});
    t.input.value = 'a'; key(t.input, 'Enter'); t.input.value = 'a'; key(t.input, 'Enter'); t.input.value = 'b'; key(t.input, 'Enter');
    expect(t.tags).toEqual(['a', 'b']);
    key(t.input, 'Backspace'); expect(t.tags).toEqual(['a']);
  });
});
describe('Rating', () => {
  it('click sets, arrows adjust, re-click clears', () => {
    const fn = vi.fn(); const r = new Rating(document.body, { onChange: fn });
    const s = document.querySelectorAll<HTMLButtonElement>('.uic-star');
    s[2].click(); expect(r.value).toBe(3); expect(s[2].getAttribute('aria-checked')).toBe('true');
    key(s[2], 'ArrowRight'); expect(r.value).toBe(4);
    s[3].click(); expect(r.value).toBe(0);
  });
});
describe('Avatar / Badge', () => {
  it('initials fallback', () => { expect(initials('Ada Lovelace')).toBe('AL'); new Avatar(document.body, { name: 'Bob' }); expect(document.querySelector('.uic-avatar')!.textContent).toBe('BO'); });
  it('badge caps numbers', () => { const b = new Badge(document.body, { text: 120, max: 99 }); expect(b.el.textContent).toBe('99+'); });
});
describe('Breadcrumb', () => {
  it('marks last as current', () => {
    new Breadcrumb(document.body, { items: [{ label: 'Home', href: '/' }, { label: 'Now' }] });
    expect(document.querySelector('[aria-current=page]')!.textContent).toBe('Now');
    expect(document.querySelectorAll('a').length).toBe(1);
  });
});
describe('Alert / Empty', () => {
  it('alert role and close', () => {
    const fn = vi.fn(); const a = new Alert(document.body, { type: 'error', message: 'bad', closable: true, onClose: fn });
    expect(a.el.getAttribute('role')).toBe('alert');
    (a.el.querySelector('.uic-alert-x') as HTMLElement).click(); expect(fn).toHaveBeenCalled(); expect(document.querySelector('.uic-alert')).toBeNull();
  });
  it('empty action fires', () => {
    const fn = vi.fn(); new Empty(document.body, { actionText: 'Add', onAction: fn });
    (document.querySelector('.uic-empty-btn') as HTMLElement).click(); expect(fn).toHaveBeenCalled();
  });
});
