import './styles.css';

export type ToastType = 'success' | 'error' | 'warn' | 'info';
export interface ToastOptions {
  type?: ToastType;
  title?: string;
  message?: string;
  duration?: number;
}

const ICON: Record<ToastType, string> = { success: '✓', error: '!', warn: '!', info: 'i' };

function container(): HTMLElement {
  let box = document.querySelector<HTMLElement>('.uic-toasts');
  if (!box) {
    box = document.createElement('div');
    box.className = 'uic-toasts';
    document.body.appendChild(box);
  }
  return box;
}

/** Show a toast. error/warn use role="alert"; others role="status". Returns a dismiss function. */
export function toast(opts: ToastOptions | string): () => void {
  const o: ToastOptions = typeof opts === 'string' ? { message: opts } : opts;
  const type = o.type ?? 'info';
  const dur = o.duration ?? 3200;
  const el = document.createElement('div');
  el.className = `uic-toast uic-t-${type}`;
  const urgent = type === 'error' || type === 'warn';
  el.setAttribute('role', urgent ? 'alert' : 'status');
  el.setAttribute('aria-live', urgent ? 'assertive' : 'polite');
  el.style.setProperty('--uic-dur', dur + 'ms');
  const ico = document.createElement('i');
  ico.className = 'uic-t-ico'; ico.setAttribute('aria-hidden', 'true'); ico.textContent = ICON[type];
  const body = document.createElement('div');
  body.className = 'uic-t-body';
  if (o.title) { const b = document.createElement('b'); b.textContent = o.title; body.append(b); }
  if (o.message) { const s = document.createElement('span'); s.textContent = o.message; body.append(s); }
  el.append(ico, body);
  container().append(el);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const dismiss = () => {
    clearTimeout(timer);
    if (el.classList.contains('out')) return;
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove());
    setTimeout(() => el.remove(), 400);
  };
  el.addEventListener('click', dismiss);
  if (dur > 0) timer = setTimeout(dismiss, dur);
  return dismiss;
}

toast.success = (message: string, title?: string) => toast({ type: 'success', message, title });
toast.error = (message: string, title?: string) => toast({ type: 'error', message, title });
toast.warn = (message: string, title?: string) => toast({ type: 'warn', message, title });
toast.info = (message: string, title?: string) => toast({ type: 'info', message, title });
