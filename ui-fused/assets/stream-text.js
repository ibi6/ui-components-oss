// ui-streaming core. Zero dependencies, ESM. Inline it into single-file pages if needed.
//
// Mental model:  source (AsyncIterable<string>)  ->  buffer  ->  smoother  ->  block painter
//   - The network delivers lumpy chunks. The smoother turns them into an even, readable cadence.
//   - Settled blocks are painted once and never touched again; only the last block is live.
//   - New blocks enter with the .enter class (see ui-motion/assets/motion-tokens.css).

/* ------------------------------------------------------------------ sources */

/** Fake a model stream for demos/tests. Swap for readAnthropicStream(response) in production. */
export async function* mockStream(text, { chunk = [2, 9], delay = [16, 70], signal } = {}) {
  const rnd = ([a, b]) => a + Math.floor(Math.random() * (b - a + 1));
  for (let i = 0; i < text.length; ) {
    if (signal?.aborted) return;
    const n = rnd(chunk);
    yield text.slice(i, i + n);
    i += n;
    await new Promise((r) => setTimeout(r, rnd(delay)));
  }
}

/** Parse a Server-Sent-Events Response body into parsed JSON payloads. */
export async function* readSSE(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder(); // stream:true below keeps multi-byte chars intact across chunks
  let buf = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n\n")) >= 0) {
        const raw = buf.slice(0, i);
        buf = buf.slice(i + 2);
        const data = raw
          .split("\n")
          .filter((l) => l.startsWith("data:"))
          .map((l) => l.slice(5).trimStart())
          .join("\n");
        if (!data || data === "[DONE]") continue;
        try { yield JSON.parse(data); } catch { /* ignore keep-alives / partial junk */ }
      }
    }
  } finally {
    reader.releaseLock?.();
  }
}

/** Anthropic Messages API stream -> plain text deltas. */
export async function* readAnthropicStream(response) {
  for await (const ev of readSSE(response)) {
    if (ev.type === "content_block_delta" && ev.delta?.text) yield ev.delta.text;
    if (ev.type === "error") throw new Error(ev.error?.message || "stream error");
  }
}

/* ----------------------------------------------------------------- smoothing */

/**
 * How many characters to reveal this frame. Slow and readable when the backlog is small,
 * accelerating when we fall behind so the UI never lags the network by more than ~a second.
 * Pure function -> unit-testable. Returns { n, carry } (carry keeps sub-character remainders).
 */
export function drain(backlog, dtMs, carry = 0, { minCps = 45, gain = 5, maxCps = 2400, ended = false } = {}) {
  if (backlog <= 0) return { n: 0, carry: 0 };
  const floor = ended ? Math.max(minCps, 500) : minCps; // once the stream ended, don't drag the tail
  const cps = Math.min(maxCps, floor + backlog * gain);
  const exact = (cps * dtMs) / 1000 + carry;
  const n = Math.min(backlog, Math.floor(exact));
  return { n, carry: n === backlog ? 0 : exact - n };
}

/* ------------------------------------------------------------ block handling */

/** Split text into blocks on blank lines, but never inside an open ``` fence. */
export function splitBlocks(text) {
  const out = [];
  let cur = [];
  let fenced = false;
  for (const line of text.split("\n")) {
    if (/^```/.test(line)) fenced = !fenced;
    if (!fenced && line.trim() === "" && !/^```/.test(line)) {
      if (cur.length) out.push(cur.join("\n"));
      cur = [];
    } else {
      cur.push(line);
    }
  }
  if (cur.length) out.push(cur.join("\n"));
  return out;
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Remove a dangling opener so half-typed `**bold` / `code doesn't flash raw punctuation. */
function hideOpenMarkers(s) {
  if ((s.match(/\*\*/g) || []).length % 2) s = s.replace(/\*\*(?![\s\S]*\*\*)/, "");
  if ((s.match(/`/g) || []).length % 2) s = s.replace(/`(?![\s\S]*`)/, "");
  return s;
}

function inline(s) {
  return esc(hideOpenMarkers(s))
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

/** Tiny, safe markdown for one block. Replace with marked / markdown-it (+ DOMPurify) if you need more. */
export function miniMarkdown(block) {
  const fence = block.match(/^```(\w*)\n?([\s\S]*?)(?:\n```)?$/);
  if (fence && block.startsWith("```")) return `<pre><code>${esc(fence[2])}</code></pre>`;
  const h = block.match(/^(#{1,3})\s+(.*)$/);
  if (h) return `<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`;
  const lines = block.split("\n");
  if (lines.every((l) => /^\s*[-*]\s+/.test(l)))
    return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*]\s+/, ""))}</li>`).join("")}</ul>`;
  if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l)))
    return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ""))}</li>`).join("")}</ol>`;
  return `<p>${lines.map(inline).join("<br>")}</p>`;
}

/* ---------------------------------------------------------------- the view */

/**
 * createStreamView(root)
 *   view.start()         -> data-state="pending" (show your thinking indicator)
 *   view.push(text)      -> append received text (any chunk size)
 *   view.end()           -> no more text; resolves view.done once fully painted
 *   view.fail(err)       -> keep partial text, data-state="error" (render your inline retry)
 *   view.abort()         -> stop immediately, data-state="aborted"
 * root[data-state] drives all styling: pending | streaming | done | error | aborted
 */
export function createStreamView(root, { renderBlock = miniMarkdown, onFrame, smoothing = {} } = {}) {
  let target = "";
  let shown = 0;
  let carry = 0;
  let ended = false;
  let raf = 0;
  let last = 0;
  let resolveDone;
  const done = new Promise((r) => (resolveDone = r));
  const views = []; // { el, html }

  const setState = (s) => (root.dataset.state = s);

  function paint() {
    let text = target.slice(0, shown);
    const prev = text.charCodeAt(text.length - 1);
    if (prev >= 0xd800 && prev <= 0xdbff) text = text.slice(0, -1); // don't cut an emoji in half
    const blocks = splitBlocks(text);
    blocks.forEach((b, i) => {
      const html = renderBlock(b);
      let v = views[i];
      if (!v) {
        const el = document.createElement("div");
        el.className = "block enter";
        root.append(el);
        v = views[i] = { el, html: "" };
      }
      if (v.html !== html) {
        v.el.innerHTML = html;
        v.html = html;
      }
      v.el.classList.toggle("is-live", i === blocks.length - 1 && !(ended && shown >= target.length));
    });
    onFrame?.();
  }

  function frame(now) {
    const dt = Math.min(64, now - (last || now));
    last = now;
    const { n, carry: c } = drain(target.length - shown, dt, carry, { ended, ...smoothing });
    shown += n;
    carry = c;
    paint();
    if (ended && shown >= target.length) return finish();
    raf = requestAnimationFrame(frame);
  }

  function finish() {
    views.forEach((v) => v.el.classList.remove("is-live"));
    if (root.dataset.state === "streaming") setState("done");
    resolveDone();
  }

  const kick = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };

  return {
    done,
    get text() { return target; },
    start() { setState("pending"); },
    push(t) {
      if (!t) return;
      if (root.dataset.state === "pending") setState("streaming");
      target += t;
      kick();
    },
    end() { ended = true; kick(); },
    fail(err) {
      cancelAnimationFrame(raf); raf = 0;
      shown = target.length; paint();
      views.forEach((v) => v.el.classList.remove("is-live"));
      setState("error");
      root.dataset.error = err?.message || String(err ?? "");
      resolveDone();
    },
    abort() {
      cancelAnimationFrame(raf); raf = 0;
      views.forEach((v) => v.el.classList.remove("is-live"));
      setState("aborted");
      resolveDone();
    },
  };
}

/* -------------------------------------------------------------- auto-scroll */

/**
 * Keep a scroller pinned to the bottom while content grows, but let go the moment the user
 * scrolls up. onChange(stuck) lets you show/hide a "Jump to latest" pill.
 */
export function stickToBottom(scroller, content, { threshold = 72, onChange } = {}) {
  let stuck = true;
  const gap = () => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
  const set = (v) => { if (v !== stuck) { stuck = v; onChange?.(v); } };
  scroller.addEventListener("scroll", () => set(gap() <= threshold), { passive: true });
  const ro = new ResizeObserver(() => { if (stuck) scroller.scrollTop = scroller.scrollHeight; });
  ro.observe(content);
  return {
    get stuck() { return stuck; },
    jump(smooth = true) {
      set(true);
      scroller.scrollTo({ top: scroller.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    },
    destroy() { ro.disconnect(); },
  };
}

/** Convenience: pipe any AsyncIterable<string> into a view, with error + abort handling. */
export async function pipe(source, view) {
  view.start();
  try {
    for await (const chunk of source) view.push(chunk);
    view.end();
  } catch (err) {
    if (err?.name === "AbortError") view.abort();
    else view.fail(err);
  }
  return view.done;
}
