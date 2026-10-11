---
name: ui-fused
description: All-in-one UI design system merging five skills (ui-craft, ui-tidy, ui-motion, ui-fluid-layout, ui-streaming) into one - use for ANY request to write, design, build, restyle or polish a user interface - web pages, landing pages, dashboards, chat/AI interfaces, components, HTML/React demos - and whenever the user mentions 写UI, 界面, 前端, 页面, 组件, 动效, 流式, 好看, 整洁, 丝滑, 响应式, or wants something smooth, polished, animated, modern or tidy. One skill instead of five; no routing between skills needed.
metadata:
  short-description: 融合版 UI 设计系统（tidy + motion + fluid + streaming）
---

# UI Fused

整合五个 skill（ui-craft / ui-tidy / ui-motion / ui-fluid-layout / ui-streaming）的单一 UI 设计系统。
四大支柱，按优先级排序，冲突时上面的赢：

1. **Tidy（整洁）是地板。** 少数决定，一致执行。动效与流式永远不破坏对齐与可读性。
2. **Motion（动效）是签名。** 事先设计（storyboard、tokens、编排），只花在解释变化或引导注意力的时刻。Motion-first ≠ 更多动画。
3. **Flow（流式）是结构。** 内容渐进到达（每个中间态都是设计过的，无跳动）+ 布局随宽度流动（clamp + 内在网格 + 容器查询）。
4. **Decoration（装饰）最后。** 一个 flourish 若不解释变化、不引导注意力，删掉。

## 文件地图

| 文件 | 用途 | 何时读 |
|---|---|---|
| `assets/ui-fused.css` | 全部 tokens（tidy 纪律 + motion 时长/缓动 + fluid 字号/留白）+ 就绪类 | 始终内联进页面 `<style>`，改强调色/中性色/字体，保留刻度 |
| `assets/ui-fused.css` 内建类 | `.fade-in` 显式 from/to 安全淡入；`.tint-accent` 有色面板底/字成对；`.scroller` audit 豁免横向滚动容器 | 优先用内建类，不要手写同名物——手写缺 to、手搓 tint 都是真实事故 |
| `assets/motion.js` | `reveal()` / `flip()` / `countUp()` / `transition()` / `prefersReducedMotion()` | 需要滚动 reveal、FLIP、计数、View Transitions 时 |
| `assets/stream-text.js` | `createStreamView` / `drain` / `splitBlocks` / `miniMarkdown` / `stickToBottom` / `readSSE` / `readAnthropicStream` / `mockStream` / `pipe` | 内容随时间到达（聊天/回答/列表）时 |
| `references/recipes.md` | 动效 + 布局配方（hero 编排、FLIP 指示条、bento、全出血、表格转卡、fixed composer…） | 需要某个具体配方时 |
| `references/streaming-patterns.md` | React 集成、结构化流、步骤流、重试/恢复、长线程、无障碍 | 构建聊天/流式界面时 |
| `references/checklist.md` | 交付前清单（合并了 tidy / motion / fluid / streaming 四份检查表，去重） | 交付任何 UI 前走一遍 |
| `assets/ui-components/` | 自研组件库「动态 UI 组件集」：236 个手写组件（按钮悬停、加载、开关、表单、导航、图表、抽屉弹层、命令面板、数据表格、完整界面等）+ 576 个参数变体，单文件浏览版带代码面板（每个组件 `</>` 看原始 CSS/HTML） | 需要某个现成组件效果时，打开 `gallery.html` 找到组件、复制代码再按本 skill 规范改造；不要凭想象重写库里已有的效果 |

> audit 需要 Playwright。本机没有 npm 版时，把任意已有的 playwright 包目录复制/链接到 `audit.mjs` 同级的 `node_modules/playwright`（Python 版 playwright 自带的 `driver/package` 就是完整 npm 包），即可运行。

## 工作流

**1. Brief（一句话，不要追问）。** 主题、受众、屏幕的首要任务、一个感觉词。用户没给就在答复里提一句并继续。

**2. 设计计划（写下来再写码，保持紧凑）：**
- *Tokens*：4–6 个命名颜色（中性刻度 + 一个从主题选的强调色，不是习惯性蓝紫）、1–2 字体、radius 集、elevation 集。
- *布局草图*：ASCII 线框、对齐决定（左/中）、什么是流式的。
- *Motion storyboard*：唯一的 signature moment 一句话 + 入场顺序 + 状态变化 + 反馈 + ambient（0–2，有理由才算数）。
- *Stream map*：什么内容渐进到达，每个中间态（pending/streaming/done/error/aborted）长什么样；内容是静态的就写明"即时呈现"。
- *库组件清单*：先开 `assets/ui-components/gallery.html` 找效果，把确定复用的组件列进来——组件名、出处（类名/分类）、以及改造点（底色/变量映射/配色收敛）。清单为空 = 决定全手写，也必须写一句为什么库里没有可用的。
对照 brief 自查：如果这份计划放到任何同类页面上也成立，说明还不够主题化，改掉。

**3. 先静态。** 用 `assets/ui-fused.css` 的 tokens 把完整布局搭出来，动效关掉时就必须在 360 / 768 / 1280 已经整洁且正确。

**4. 叠加动效**（顺序）：signature moment → 状态变化（开合、tab、路由）→ 反馈（press、成功/错误）→ hover 润色。

**5. 接好中间态**（loading / streaming / empty / error / aborted）：骨架与最终几何一致，失败保留已读内容。静态内容即时呈现，见 Streaming 规则第 8 条。

**6. 审查与验证。** 运行 `scripts/audit.mjs`（浏览器可用时），截图核对静置态与动画中帧、明暗两套、移动宽度，然后删掉一个装饰元素看是否无损，有问题修完重跑。

## 现成组件库（assets/ui-components/）

组件库 `gallery.html` 是浏览版：236 个手写组件按类目分组，每个组件右上角 `</>` 打开代码面板，展示 HTML 结构 + 原始 CSS 规则 + 用到的 :root 变量/@keyframes/@property，带"复制"按钮。MIT 许可，作者为本 skill 用户本人。

使用原则（先库后手写）：

1. **先查库再手写**。需要按钮悬停、加载动画、开关、表单控件、导航菜单、动态背景、数据可视化、时间轴、分页、提示反馈、抽屉弹层、进度骨架、命令面板、数据表格这类常见效果时，先在 `gallery.html` 里找——库里已有 236 个，不要凭记忆重写一个更差的。
2. **复制后按规范改造，而不是照搬**。库里的组件自带独立的变量与样式（紫色系 --v、独立圆角体系），粘进页面后必须做三件事：变量接到本页 tokens（颜色换 --accent / --text-* / --surface-*，时长换 --dur-* / --ease-*，圆角换 --radius-*）；类名按当前页面命名习惯调整；对照 Tidy 预算删除多余的边框/阴影/渐变。
3. **冲突时本 skill 的规则赢**。库里部分组件（渐变光斑、发光边框、3D 倾斜）是纯展示性动效，用作 hero 或装饰场景前先过 Motion 规则第 1 条：它回答了什么问题？答不出就只取它的结构不取它的动效。
4. **库的已知限制**（README「已知问题」）：代码面板只提取浅色变量；JS 交互组件复制的代码不含 JS（面板会注明）；触屏不支持的拖拽排序、假数据界面（天气/播放器/购物车等）用作界面骨架可以，别当成品交付。改造后按正常流程走 audit 与截图验证。改完的组件跑 audit 时注意：横向滑动容器加 `scroller` class（见 recipes §16）；有色底卡片按混合后底色验对比度。
5. **给库加组件时**：遵循库内约定（避免与 :root 变量重名，注意 CSS 有重复规则、类名风格不统一——见 README「已知问题」），新组件加进 gallery 后再被 skill 引用。

## Tidy 预算（audit 会数）

| 项 | 预算 |
|---|---|
| 字体族 | ≤ 2 |
| 字号 | ≤ 7，全部来自 `--step-*` |
| 文字色 | 3 档（`--text` / `--text-2` / `--text-3`） |
| 强调色 | 1（语义 success/danger 仅用于状态） |
| 圆角 | ≤ 4 档，按元素尺寸分配 |
| 阴影 | ≤ 3 档 |
| 间距 | 组件内 `--space-*`（固定 4px 网格），区块间 `--flow-*`（fluid） |
| 图标 | 1 种风格（同笔画粗细、同圆角） |

细节规则见 `references/checklist.md`。几条硬规则：
- 组内间距 ≤ 组间间距的一半；父级用 `gap` 拥有间距。
- 组件内用固定 4px 网格，布局级用 fluid 令牌——反了整页手感发飘。
- 深色模式是重新推导，不是反色（`light-dark()`；暗色靠 hairline 多过阴影）。
- 有色表面（`color-mix` 强调色 tint、深色墨底）上的文字，按**混合后的实际底色**校验对比度——墨绿底配深灰字、深底配同色相暗字都是真实发生过的事故；浅底配深字、深底配亮字，拿不准就降低底色饱和度。
- 每个交互元素有 rest / hover（`@media (hover: hover)`）/ `:focus-visible` / active / disabled；每个数据区有 loading / empty / error。
- 文案是 UI：按钮写将发生什么（"保存更改"不是"提交"），全流程一个概念一个名字。

## Motion 规则

1. **每个动画回答一个问题**：什么变了？去哪了？该看哪？在正常工作吗？答不出来就删。
2. **只动合成器属性**：`transform`、`opacity`（`clip-path` 可以，`filter` 慎用）。绝不动画 `width/height/top/left/margin`；高度到 auto 用 grid `0fr → 1fr`。
3. 进场 ease-out，出场 ease-in（时长 ≈ 进场的 60%），视图内移动 standard，直接操纵用 spring。可中断：hover/press/toggle 用 CSS transition。
4. 编排而非撒粉：兄弟用 `--stagger`（≤ 55ms）级联，≤ 8 个逐个动，其余整组动；用户触发的动效 ≤ 400ms；整段序列（除 hero）≤ 600ms。
5. 每视图一个 signature moment；同时可见的 ambient 循环 ≤ 2（脉冲状态点算）。`transition: all` 禁用，列出属性。
6. 淡入优先用内建 `.fade-in`（显式 from/to）。自己写 keyframes 时定义了 `from` 就必须显式定义 `to`——省略 to 时结束帧取元素当前值，元素自带 `opacity: 0` 之类的内联初始态时，动画跑完内容仍然不可见（真实事故：日期与大数字永不显示）。
7. 隐藏到 reveal 的样式必须包在 `@media (scripting: enabled)` 里——内容不能因为没跑 JS 而不可见。
8. 需要具体配方（hero 编排、FLIP 指示条、逐词 reveal、toast 出场、View Transitions）读 `references/recipes.md`。

## Fluid 布局规则

1. 内在优先，断点例外：`repeat(auto-fit, minmax(min(100%, 16rem), 1fr))`、flex-wrap + flex-basis、`clamp()`。媒体查询只留给页面外壳。
2. 正文 `max-inline-size: var(--measure)`（拉丁 ≈66ch，CJK ≈34em）；标题 `text-wrap: balance`，段落 `pretty`。
3. 内容无固定高度：`min-block-size`、`aspect-ratio`、`100dvh`（不用 `100vh`）；长文本子元素 `min-inline-size: 0`；用户字符串 `overflow-wrap: anywhere`。
4. `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` + 固定条 `env(safe-area-inset-*)`；逻辑属性优先。
5. 组件响应容器而非视口：wrapper 加 `container-type: inline-size`，用 `@container` 变形。
6. 布局变化（reorder/filter/resize）用 `flip()` / View Transitions，而不是让它跳变。
7. 具体配方（app shell、换行侧栏、bento、全出血、表格转卡、fixed composer、常见溢出原因）读 `references/recipes.md`。

## Streaming 规则

1. **每个中间态都是设计过的状态**：`data-state="idle | pending | streaming | done | error | aborted"` 驱动全部样式。截一帧流中间的图，看着破就是没设计完。
2. **只增不改**：已落定内容画一次永不再动（不重动画、不重排、不丢选区）；只有最后一块是 live。
3. **预留空间**：骨架与最终几何一致，交叉淡入，零布局位移。
4. **网络节奏与显示节奏解耦**：缓冲 + `drain()` 平滑（积压小则慢而可读，积压大则加速）。
5. **尊重读者**：仅在用户位于底部时自动跟随；上滑立即松手并提供"跳到最新"。Stop 永远可达。失败保留部分内容 + 内联重试，绝不清空。
6. `TextDecoder` 开 `{ stream: true }`（CJK/emoji 跨块）；未闭合 markdown 不闪原始符号；流式期间 `aria-busy="true"`，完成才播报；done 之前禁用复制/重新生成。
7. 架构与进阶（React、结构化流、步骤流、重试/恢复、长线程）读 `references/streaming-patterns.md`。
8. **静态内容禁止假装流式**：内容是写死的、一次性返回的、或用户一眼能看完的（天气建议、产品参数、表单结果），不要模拟思考步骤或打字机——那只是在拖延用户读信息，属于装饰性动效；直接即时呈现，可配不超过 250ms 的淡入。流式只用于内容真的随时间到达的场景：LLM/模型逐 token 回答、SSE/长请求、渐进加载的列表。

## 默认值

- **技术栈**：单自包含 `.html`（CSS + vanilla JS），除非用户点名框架。CSS transition → WAAPI → View Transitions → 动画库（仅当前三个不够时）。React 里逐帧/流式数据放 ref，不放 state。
- 从 `assets/ui-fused.css` 开始：改强调色、中性色相与字体，保留全部刻度。
- **质量底线**（做进去，不用宣布）：响应 320→1920、可见 `:focus-visible`、`prefers-reduced-motion` 保留淡入去掉行程与循环、AA 对比度、无 JS 时内容可见、触控目标 ≥ 40px、零布局位移。
- **签名时刻**候选：标题逐行组装后主体落定；数据随视图进场自绘（条/线/计数）；流式答案的步骤逐个落定成结果；一个控件随状态形变（send↔stop、play↔pause）；列表到详情的共享元素过渡。
- **禁忌**：每个 section 都 fade-up + 每张卡都 hover-lift；装饰性渐变光晕玻璃；所有卡同圆角同软阴影；动画布局属性；阻塞输入的动效；没有 reduced-motion 出口的动画。
- 真实文案，不写 lorem ipsum；`assets/reference-page.html` 展示的是质量基准线，参考结构与手感，不抄题材。| `assets/ui-fused.css`（内建类） | `.fade-in` 显式 from/to 的安全淡入；`.tint-accent` 有色面板（底/字成对，防深底深字）；`.scroller` audit 豁免的横向滚动容器 | 优先用这三个内建类，不要手写同名物——手写缺 to、手搓 tint 都是真实事故 |

