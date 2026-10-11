// ui-motion helpers. Zero dependencies. Paste inline into a single-file page or import as a module.
// Pairs with motion-tokens.css (.reveal / .is-in / [data-stagger]).

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Reveal elements when they enter the viewport. Siblings inside a [data-stagger]
 * parent get --i set from DOM order so they cascade instead of popping together.
 * Elements already in view on load reveal immediately (one orchestrated entrance).
 */
export function reveal(root = document, { selector = ".reveal", threshold = 0.15, margin = "0px 0px -8% 0px" } = {}) {
  const items = [...root.querySelectorAll(selector)];
  items.forEach((el) => {
    const parent = el.parentElement;
    if (parent && parent.hasAttribute("data-stagger") && !el.style.getPropertyValue("--i")) {
      el.style.setProperty("--i", [...parent.children].indexOf(el));
    }
  });
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    },
    { threshold, rootMargin: margin }
  );
  items.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

/**
 * FLIP: animate any layout change (reorder, filter, resize) smoothly.
 *   await flip(listEl.children, () => listEl.append(listEl.firstElementChild));
 * Measures first, runs your DOM mutation, measures last, plays the inverse transform.
 */
export function flip(elements, mutate, { duration = 360, easing = "cubic-bezier(0.16, 1, 0.3, 1)" } = {}) {
  const els = [...elements];
  const first = new Map(els.map((el) => [el, el.getBoundingClientRect()]));
  mutate();
  if (prefersReducedMotion()) return Promise.resolve();
  const anims = [];
  for (const el of els) {
    const a = first.get(el);
    const b = el.getBoundingClientRect();
    const dx = a.left - b.left;
    const dy = a.top - b.top;
    if (!dx && !dy) continue;
    anims.push(
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
        { duration, easing, fill: "backwards" }
      ).finished.catch(() => {})
    );
  }
  return Promise.all(anims);
}

/** Count a number up. Honors reduced motion by jumping to the end. */
export function countUp(el, to, { from = 0, duration = 900, format = (n) => Math.round(n).toLocaleString() } = {}) {
  if (prefersReducedMotion()) {
    el.textContent = format(to);
    return;
  }
  const t0 = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 4); // out-quart
  const tick = (now) => {
    const t = Math.min(1, (now - t0) / duration);
    el.textContent = format(from + (to - from) * ease(t));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * Wrap a DOM update in a View Transition when supported (cross-fades + morphs elements
 * that share a view-transition-name). Falls back to just running the update.
 */
export function transition(update) {
  if (!document.startViewTransition || prefersReducedMotion()) return Promise.resolve(update());
  return document.startViewTransition(update).finished.catch(() => {});
}
