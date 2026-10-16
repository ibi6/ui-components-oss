# 动态 UI 组件集

> 🌐 **在线预览**：https://ibi6.github.io/ui-components-oss/  
> 📖 **文档入口**：[`docs/index.html`](docs/index.html)

一个纯前端的动态 UI 组件合集：按钮、加载动画、开关、表单、导航、图表、3D、小游戏，以及命令面板、数据表格、**侧边抽屉、搜索选择器、完整分页、双滑块、多类型 Toast** 这类完整组件。演示站没有构建步骤、没有第三方依赖，打开 `index.html` 就能看、能点、能拖；其中 5 个实用组件另有可 npm 安装的 TypeScript 库版本（见下）。

![预览](docs/preview.png)

## 两部分：库 vs 演示图鉴（说清楚）

| | 📦 组件库（`src/`） | 🎨 演示图鉴（`index.html` / `css/` / `js/`） |
| --- | --- | --- |
| 内容 | **5 个**组件：Drawer、SearchSelect、Pagination、DualRange、Toast | 241 个手写组件 + 576 个变体 |
| 形态 | TypeScript、npm 包 `@ibi6/ui-components`、ESM/CJS/IIFE + CSS + `.d.ts` | 单页静态站，无模块化 |
| 质量 | 独立源码、`uic-` 前缀样式、Vitest 行为测试、基础 a11y | 展示/抄作业用，大量假数据 demo |
| 状态 | 0.1.0，**尚未发布到 npm registry**（见下方本地使用） | 在线运行：GitHub Pages |

诚实说明：图鉴里其余组件**没有**迁移进库；库的 5 个组件逻辑抽取自演示站的实用套件，并改成了可实例化的 API。测试跑在 happy-dom 里，**没有真实浏览器 / Safari / 触屏的自动化测试**。

### 安装与使用

发布到 npm 后：

```bash
npm i @ibi6/ui-components
```

在发布之前，用本地 link / 打包：

```bash
git clone https://github.com/ibi6/ui-components-oss.git
cd ui-components-oss && npm install && npm run build
npm link                                  # 本仓库
cd /path/to/your-app && npm link @ibi6/ui-components
# 或：npm pack 生成 tgz，然后 npm i ../ui-components-oss/ibi6-ui-components-0.1.0.tgz
```

```ts
import { Drawer, SearchSelect, Pagination, DualRange, toast } from '@ibi6/ui-components';
import '@ibi6/ui-components/style.css';

toast.success('已保存', '成功');

const drawer = new Drawer({ title: '设置', content: '<p>内容</p>', side: 'right' });
drawer.open();

new SearchSelect(document.querySelector('#city')!, {
  options: [{ value: 'bj', label: '北京', group: '华北' }, { value: 'sh', label: '上海', group: '华东' }],
  onChange: (o) => console.log(o.value),
});
new Pagination(document.querySelector('#pg')!, { pages: 12, onChange: (p) => console.log(p) });
new DualRange(document.querySelector('#price')!, { min: 0, max: 1000, step: 10, value: [200, 780], format: (n) => '¥' + n });
```

无构建工具的页面可用 IIFE：`<link rel="stylesheet" href="ui-components.css"><script src="ui-components.iife.js"></script>`，全局变量 `UIComponents`。
主题可用 CSS 变量覆盖：`--uic-primary`、`--uic-accent`、`--uic-ink`、`--uic-bg`、`--uic-panel`、`--uic-line`、`--uic-mute`。

### 开发命令

```bash
npm run dev        # Vite 开发服务器
npm run typecheck  # tsc --noEmit
npm test           # Vitest（happy-dom）
npm run build      # 产出 dist/lib：ESM、CJS、IIFE、CSS、.d.ts
```

### 无障碍最低线

- Drawer：`role="dialog"` + `aria-modal` + `aria-labelledby`，Esc 关闭，Tab 焦点陷阱，关闭后焦点归还
- SearchSelect：`aria-haspopup/expanded/controls`，`role="listbox/option"`，键盘 ↑↓ / Enter / Esc
- Pagination：`<nav aria-label>` + 真 `<button>`，当前页 `aria-current="page"`
- DualRange：两个原生 `input[type=range]`，带 `aria-label`
- Toast：错误/警告 `role="alert"`，其余 `role="status"`

更多见 [`docs/library.md`](docs/library.md)。

## 数量（说清楚）

| 类别 | 数量 |
| --- | --- |
| 页面顶部的主要组件 | 24 |
| 「组件图鉴」里手写的组件 | 217 |
| **手写组件合计** | **241** |
| 参数组合生成的变体（按钮组合、动效组合） | 576 |

后面那 576 个是同一套代码换颜色、圆角、大小、时长和缓动生成的，不是 576 种不同的设计。很多手写组件之间也是同一思路的变体，真正彼此不同的设计比 241 要少。

## 快速开始

```bash
git clone https://github.com/ibi6/ui-components-oss.git
cd ui-components-oss
python3 -m http.server 8000     # 然后打开 http://localhost:8000
# 也可以直接双击 index.html 看页面，但 </> 面板读不到样式表（原因见下文「代码面板」）
```

只想要一个文件：运行 `python3 build.py`，会生成 `dist/ui-components.single.html`（CSS 和 JS 都内联）。

文档速览：打开 `docs/index.html`，或直接跳到主页锚点 `#new-kit` 看新增实用组件。

## 实用组件套件（新增）

主页顶部新增 5 个可直接搬进项目的完整交互（点卡片右上角 `</>` 可复制 HTML/CSS）：

| 组件 | 说明 | 交互要点 |
| --- | --- | --- |
| **侧边抽屉** | 左 / 右侧滑出面板 | 遮罩点击、Esc、保存/取消关闭；打开时锁定滚动 |
| **搜索选择器** | 可过滤的下拉选择 | 输入过滤、↑↓ 高亮、回车确认、点击外部关闭 |
| **完整分页** | 列表底部分页条 | 省略号折叠、上一页/下一页、当前页高亮 |
| **双滑块** | 价格 / 区间选择 | 两端拖动、中间轨道高亮、数值实时同步 |
| **多类型 Toast** | 成功 / 错误 / 警告 / 信息 | 可堆叠、进度条、点击或超时关闭 |

用法示例（Toast）：

```html
<button data-toast="success">成功</button>
<!-- 页面需包含 <div class="toasts" id="toasts"></div>，并引入本仓库 js/main.js 中对应逻辑 -->
```

用法示例（双滑块结构）：

```html
<div class="dual">
  <div class="dual-vals"><b id="dualLo">¥200</b><span>—</span><b id="dualHi">¥780</b></div>
  <div class="dual-track">
    <div class="dual-range" id="dualRange"></div>
    <input type="range" id="dualA" min="0" max="1000" step="10" value="200">
    <input type="range" id="dualB" min="0" max="1000" step="10" value="780">
  </div>
</div>
```

## 功能

- 每个组件（顶部主要组件和图鉴里的全部组件）右上角都有 `</>` 按钮，点开看代码，点“复制”一键复制。
- 页面支持浅色和深色（跟随系统，也可以用页面里的“深色模式”开关切换）。
- 命令面板可以用 `Ctrl/⌘ + K` 唤起。
- 顶部卡片按阅读顺序瀑布流排列；图鉴有分类跳转。
- 「按钮组合」「动效组合」两组共 576 个变体默认折叠，点开才显示。
- 系统开启“减少动态效果”时，动画会自动停用。

## 组件清单（图鉴）

- 按钮悬停效果（20）
- 加载动画（16）
- 卡片悬停效果（9）
- 文字特效（10）
- 表单控件（8）
- 导航与菜单（6）
- 动态背景（8）
- 鼠标特效（8）
- 数据可视化（6）
- 列表与表格（8）
- 时间轴与评论（6）
- 图表（8）
- 分页与选择器（6）
- 提示与反馈（6）
- 卡片（5）
- 抽屉与弹层（4）
- 图片（3）
- 滚动特效（3）
- 图标动画（4）
- 表单校验（4）
- 页头与回顶（2）
- 开关与滑块（6）
- 按钮点击反馈（5）
- 3D 效果（5）
- 小工具与小游戏（5）
- 更多文字特效（4）
- 光标与指针（3）
- 视差与倾斜（2）
- 徽章与标签（4）
- 进度与骨架（3）
- 完整小组件（6）
- 实用小组件（8）
- 完整界面（5）
- 更多界面（4）
- 常用完整组件（7）

## 代码面板

`</>` 面板里的代码是页面在运行时从 `css/style.css` 的**原始源码**里提取的，每个组件包含：

- 组件的 HTML 结构；
- 匹配到的 CSS 规则（原文）；
- 用到的 `:root` 变量（只含浅色值）、`@keyframes` 和 `@property`；
- 一小段页面基础样式（背景、字体），方便直接粘贴到空白页面里预览。

复制后放进一个带 `<!doctype html>` 的 HTML 文件，**纯 CSS 的组件可以直接运行**。

限制：

- 复制的代码开头自带一段「使用说明」注释：怎么粘贴使用、样式已内联；有 JS 交互的组件会再附一条「交互提示」。
- **不包含 JavaScript**。有 JS 交互的组件会在代码开头注明「外观正常、交互不会生效」，并列出可以到 `js/main.js` 里搜索的关键字。
- 悬停、点击这类状态的 CSS 规则会包含在内，但只验证过静态外观，没有逐个验证悬停和点击效果。
- 只提取了浅色主题的变量值。
- 从本地文件（`file://`）直接双击打开 `index.html` 时，浏览器不允许脚本读取外部样式表，面板里会提示这一点；请用本地服务器（`python3 -m http.server`），或者使用 `dist/ui-components.single.html`。

### 自动验证

`python3 tools/verify_copy.py` 会把每个组件的面板代码放进空白页面，和原页面里的组件对比第一帧外观。

## 浏览器兼容

只在 **Chromium（Chrome/Edge）** 里实际测试过。用到了 `@property`、`:has()`、`conic-gradient`、`clip-path`、`backdrop-filter`，Safari 16.4+ 和较新的 Firefox 理论上能用，**但没有验证过**，欢迎提 issue 反馈。移动端只检查了页面没有横向溢出，没有在真机上测过触摸交互。

## 已知问题

- 代码是分批追加出来的，没有模块化：CSS 里有重复规则，类名风格不统一，`js/main.js` 按“期”分块。欢迎重构。
- 「拖拽排序」用的是浏览器自带的拖拽，**触屏设备不支持**。
- 「前后对比」用渐变色块代替真实图片；「日期范围」只有单月；「命令面板」的最近使用不持久化。
- 天气、播放器、购物车、登录、聊天、文件下载等都是**假数据和模拟交互**，没有连接任何后端。
- CSS 变量名曾经和主题色变量冲突过（`--y`、`--a`，已改名为 `--cy`、`--ka` 等），新增组件时请避免和 `:root` 里的变量重名。

## 项目结构

```
src/                组件库源码（TypeScript，每个组件一个目录：index.ts + styles.css）
tests/              Vitest 测试
vite.config.ts      库模式构建配置
index.html          页面骨架（顶部的主要组件 + 实用套件）
css/style.css       全部样式
js/main.js          全部交互（含图鉴的生成、代码面板、各组件逻辑）
build.py            合并成单文件
dist/               单文件构建产物
docs/               文档入口与预览图
tools/              验证脚本（verify_copy.py）
ui-fused/           可选：融合版 UI skill 与参考资源
```

## 参与贡献

欢迎 issue 和 PR。比较有价值的方向：Safari/Firefox/真机的兼容性修复、把组件拆成独立文件（每个组件自带完整的 HTML、CSS、JS）、触屏支持、补上没做的组件（分享面板、通知中心、抽奖转盘、瀑布流、新手引导）。

## 说明

本项目的代码由 AI 辅助生成，并经过人工审阅和基本的浏览器测试（无控制台报错、主要交互手动点过），但演示图鉴没有自动化测试（`src/` 库部分有 Vitest 单元测试，见上）。

## 许可证

[MIT](LICENSE)
