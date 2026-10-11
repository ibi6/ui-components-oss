# Streaming 进阶模式

Contents: 1 React 集成 · 2 结构化 / JSON 流 · 3 工具调用与步骤流 · 4 逐字 fade（可选） · 5 重试与恢复 · 6 长线程 · 7 无障碍

## 1. React 集成

逐 token 数据**不要进 React state**：每秒 60 次更新会整树重渲。视图放 ref，让核心直接写 DOM；React 只管生命周期。

```jsx
function Answer({ source, onDone }) {
  const rootRef = useRef(null);
  useEffect(() => {
    const view = createStreamView(rootRef.current);
    const ctrl = new AbortController();
    (async () => {
      view.start();
      try { for await (const c of source(ctrl.signal)) view.push(c); view.end(); }
      catch (e) { e.name === "AbortError" ? view.abort() : view.fail(e); }
      await view.done; onDone?.(view.text);
    })();
    return () => { ctrl.abort(); };
  }, [source]);
  return <div ref={rootRef} className="answer" aria-busy="true" />;
}
```
done 之后可以一次性同步替换成你自己的 markdown 渲染器（表格、数学公式），布局不能有视觉变化。必须进 state 时（如持久化），节流到 ~100ms 或 done 时，绝不逐 token。

## 2. 结构化 / JSON 流

只渲染已完整的。增量解析（宽容的部分 JSON 解析器，或行分隔协议如 NDJSON），然后：

- 每个完整项一解析就 append，用 `.enter` 进场。
- 数量已知时预留槽位（最终几何的骨架）；未知时给进度提示（`3 / 8`）。
- 列表项绝不重 key——keyed append-only 让前面的 DOM（和它们的动画）不被碰。
- 表格：`table-layout: fixed` 预留列宽，晚到的长值不会重排早前行。

## 3. 工具调用与步骤流

步骤建模为 `{ id, label, state: "running" | "done" | "error", detail? }`：

- running 步显示 spinner；完成时 spinner → check 形变（透明度/缩放切换）。
- 答案开始时把整个 feed 收成一行摘要（"完成 3 步"），保持可展开。
- `detail` 文本用同一个核心流入步骤（`createStreamView` 可作用于任意容器）。
- 显示耗时只在 ~2s 之后；亚秒计时器是噪声。

## 4. 逐字 fade（可选，纯文本）

短纯文本输出想要更软的手感时，把每个*新显示*的 chunk 包进短 fade 的 span，动画结束后解包合并：

```css
.chunk { animation: chunk-in 240ms var(--ease-out) both; }
@keyframes chunk-in { from { opacity: 0; } }
```
代价：与内联 markdown 冲突（要重渲尾部）、DOM 节点翻倍、长答案上很吵。默认（块级进场 + 光标 + 平滑）更稳更省；逐字 fade 只留给 hero 演示。

## 5. 重试与恢复

- `error` 时保留 `view.text`。提供 **重试**（重启）；服务端支持时提供 **继续**（把部分文本作为 assistant 前缀发回）。
- 区分用户中止（安静提示）与失败（原因 + 动作）。
- 首字节前的网络抖动可带退避自动重试；已开始流式后先问用户。
- 用给 source 的同一个 `AbortController` 取消底层 `fetch`，否则 UI 显示已停止后连接还在跑。

## 6. 长线程

- 已落定消息是静态 DOM；离屏消息 `content-visibility: auto; contain-intrinsic-size: auto 400px;`。
- 只在几百条以上才虚拟化——虚拟化会破坏页内查找与文本选择。
- 保持 `overflow-anchor: auto`（默认）让加载历史不跳视口；live 端由 `stickToBottom` 处理。

## 7. 无障碍

- 流式期间 answer 上 `aria-busy="true"`，done 时置 false。完成时在 polite live region 放一句摘要（"回答已就绪"）。
- 不逐 token、不逐步骤播报。
- Stop 是真 `<button>`，`aria-label` 随状态切换（"发送" ↔ "停止"），Tab 可达、Enter/Space 可操作。
- `prefers-reduced-motion`：去掉升起/行程，保留淡入；停掉闪烁光标与脉冲点。
- 光标与 spinner 颜色对表面 ≥ 3:1 对比度。
