# 动效与布局配方

Contents: 1 Hero 编排 · 2 滚动 reveal · 3 滑动 tab 指示条 · 4 共享元素过渡 · 5 逐词 reveal（CJK 安全） · 6 带出场的 toast · 7 MPA 页面过渡 · 8 App shell · 9 换行侧栏 · 10 Auto-fit 卡片 · 11 容器查询卡片 · 12 Bento · 13 全出血 · 14 表格转卡 · 15 Fixed composer · 16 常见溢出原因

所有动效配方假设 `assets/ui-fused.css` 已内联（tokens + `.reveal` / `[data-stagger]` / `.collapse` / `.enter` / `.skeleton`）。

## 1. Hero 编排（唯一的 signature moment）

按重要性排序，不按 DOM 顺序。总时长 ≈ 80ms 前导 + 4 × 90ms 步进 + 760ms 最后一项。

```css
.hero > * {
  animation: rise var(--dur-hero) var(--ease-out) both;
  animation-delay: calc(80ms + var(--i, 0) * 90ms);
}
@keyframes rise {
  from { opacity: 0; transform: translateY(calc(var(--reveal-distance) * 1.6)); filter: blur(6px); }
}
@media (prefers-reduced-motion: reduce) {
  .hero > * { animation-name: fade; filter: none; }
  @keyframes fade { from { opacity: 0; } }
}
```
`--i` 逐子元素内联设置，或用 tokens 里的 `[data-stagger]`。blur 只用在少数大元素上，卡顿就去掉。

## 2. 滚动 reveal（渐进增强）

```css
@keyframes fade-up { from { opacity: 0; transform: translateY(24px); } }
@supports (animation-timeline: view()) {
  .sd { animation: fade-up linear both; animation-timeline: view(); animation-range: entry 0% entry 55%; }
}
```
不要把 `.sd` 和 `.reveal` 用在同一元素上。不支持时元素直接可见；效果重要就用 `motion.js` 的 `reveal()` 做 JS 回退。

## 3. 滑动 tab 指示条（只动 transform）

```html
<div class="tabs" role="tablist"><button role="tab" aria-selected="true">概览</button>…<i class="ind"></i></div>
```
```css
.tabs { position: relative; display: flex; gap: var(--space-1); }
.ind { position: absolute; inset-block-end: 0; inset-inline-start: 0; inline-size: 100px; block-size: 2px;
       background: var(--accent); transform-origin: 0 0;
       transition: transform var(--dur-base) var(--ease-out); }
```
```js
function moveInd(tabs, active) {
  const ind = tabs.querySelector(".ind"), t = active.getBoundingClientRect(), p = tabs.getBoundingClientRect();
  ind.style.transform = `translateX(${t.left - p.left}px) scaleX(${t.width / 100})`;
}
```
点击时调用，加载时调用一次，resize 时再调用。

## 4. 共享元素过渡（卡片 → 详情）

```js
import { transition } from "./motion.js";
async function openDetail(card) {
  card.style.viewTransitionName = "hero";          // 快照前命名旧元素
  await transition(() => {
    card.style.viewTransitionName = "";            // 同一名字同时只能一个元素持有
    showDetail();                                  // 渲染详情视图……
    detailEl.style.viewTransitionName = "hero";    // ……并命名新元素
  });
  detailEl.style.viewTransitionName = "";
}
```
```css
::view-transition-group(*) { animation-duration: var(--dur-slow); animation-timing-function: var(--ease-out); }
::view-transition-old(root), ::view-transition-new(root) { animation-duration: var(--dur-base); }
```
不支持或 reduced motion 时 `transition()` 直接执行更新。

## 5. 逐词 text reveal（CJK 安全）

朴素 `split(" ")` 会破坏中日文。用 `Intl.Segmenter`：

```js
function splitWords(el) {
  const text = el.textContent;
  const seg = new Intl.Segmenter(document.documentElement.lang || undefined, { granularity: "word" });
  el.setAttribute("aria-label", text);
  el.textContent = "";
  let i = 0;
  for (const { segment, isWordLike } of seg.segment(text)) {
    if (!isWordLike) { el.append(segment); continue; }
    const s = document.createElement("span");
    s.className = "w"; s.setAttribute("aria-hidden", "true");
    s.style.setProperty("--i", i++); s.textContent = segment; el.append(s);
  }
}
```
```css
.w { display: inline-block; opacity: 0; transform: translateY(0.4em);
     animation: w-in var(--dur-slow) var(--ease-out) forwards;
     animation-delay: calc(var(--i) * 35ms); }
@keyframes w-in { to { opacity: 1; transform: none; } }
```
只用于一个标题，不用于正文。长句封顶总延迟（`min(var(--i) * 35ms, 700ms)`）。

## 6. 带入场与出场的 toast

```css
.toast { transition: opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out); }
@starting-style { .toast { opacity: 0; transform: translateY(12px) scale(0.98); } }
.toast[data-leaving] { opacity: 0; transform: translateY(-6px); transition-duration: var(--dur-fast); transition-timing-function: var(--ease-in); }
```
```js
function dismiss(t) { t.setAttribute("data-leaving", ""); t.addEventListener("transitionend", () => t.remove(), { once: true }); }
```
剩余兄弟用 `flip()` 让堆叠滑入位置。

## 7. 多页站点的页面过渡

```css
@view-transition { navigation: auto; }
```
给持久元素（header、logo）`view-transition-name`，让它们在交叉淡入时保持不动。

## 8. App shell（header / 滚动区 / footer）

```css
.app { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; block-size: 100dvh; padding-top: env(safe-area-inset-top, 0px); }
.app > main { overflow-y: auto; overscroll-behavior: contain; }
```
`minmax(0, 1fr)`（不是 `1fr`）让中行可收缩，只有 `main` 滚动。

## 9. 无媒体查询的换行侧栏

```css
.with-sidebar { display: flex; flex-wrap: wrap; gap: var(--flow-s); }
.with-sidebar > .side { flex: 1 1 16rem; }
.with-sidebar > .main { flex: 999 1 min(100%, 36rem); min-inline-size: 0; }
```
宽屏并排，窄屏侧栏自动叠上去。

## 10. Auto-fit 卡片

```css
.cards { display: grid; gap: var(--flow-s); grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); }
```
单张卡要保持卡宽而非拉伸时用 `auto-fill`。

## 11. 容器查询卡片

```css
.card-host { container-type: inline-size; }
.card { display: grid; gap: var(--space-3); }
@container (min-width: 30rem) { .card { grid-template-columns: 10rem 1fr; align-items: start; } }
```
`container-type` 给包装层，不给被改造的元素本身。

## 12. Bento grid

```css
.bento { display: grid; gap: var(--space-4); grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); grid-auto-flow: dense; }
.bento .wide { grid-column: span 2; }
@container (max-width: 30rem) { .bento .wide { grid-column: auto; } }   /* 需要父包装层 container-type */
```
span 数永远不超过可出现的列数；窄容器里重置。

## 13. 受限列内的全出血

```css
.prose { inline-size: min(100% - 2 * var(--gutter), var(--measure)); margin-inline: auto; }
.prose > .bleed { inline-size: 100vw; margin-inline: calc(50% - 50vw); }
```
滚动条导致 `100vw` 过冲时，页面包装层加 `overflow-x: clip`。

## 14. 窄容器里表格转卡片

```css
.tbl-host { container-type: inline-size; }
@container (max-width: 36rem) {
  .tbl thead { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); }
  .tbl, .tbl tbody, .tbl tr, .tbl td { display: block; }
  .tbl tr { padding-block: var(--space-3); border-block-end: 1px solid var(--line); }
  .tbl td::before { content: attr(data-label); display: block; font-size: var(--step-xs); color: var(--text-3); }
}
```
每个 `td` 上放 `data-label="…"`。表头保持可访问（视觉隐藏，不 display:none）。

## 15. Fixed composer / 底栏的安全区

```css
.composer-wrap { position: fixed; inset-inline: 0; inset-block-end: 0;
  padding: var(--space-4) var(--gutter) calc(var(--space-4) + env(safe-area-inset-bottom, 0px)); }
.scroller { padding-block-end: 11rem; }   /* 留位，最后的内容不被遮 */
```

## 16. 有意横向滚动的容器（audit 豁免标记）

横向滑动条带（时间轴、图例带）里的列元素天然会超出视口右侧，audit 会把它们误报为溢出。给容器加 `class="scroller"` 表示"滚动是有意的"，audit 跳过其子元素：

```html
<div class="tl-strip scroller">…列元素…</div>
```

前提：容器自身 `overflow-x: auto`、`overscroll-behavior-x: contain`，且 `document.scrollWidth` 不超视口（滚在容器里，不是滚在页面上）。

## 17. 常见溢出原因（先查这些）

- flex/grid 子元素带长文本但没有 `min-inline-size: 0`。
- 用 `100vw` 定宽（含滚动条）；用 `100%`。
- 图片/视频/iframe 没有 `max-inline-size: 100%`。
- `<pre>` 与表格没有 `overflow-x: auto` 容器。
- `grid-template-columns` 里写死像素宽（`repeat(3, 300px)`）。
- 用户内容里的长 URL/ID：`overflow-wrap: anywhere`。
