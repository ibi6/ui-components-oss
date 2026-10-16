# @ibi6/ui-components 库说明

源码在 `src/components/<name>/{index.ts,styles.css}`，统一从 `src/index.ts` 导出。

## 扩展一个新组件

1. 新建 `src/components/<name>/index.ts` 和 `styles.css`（类名统一加 `uic-` 前缀，颜色用 `var(--uic-*, 默认值)`）。
2. 在 `src/index.ts` 导出。
3. 在 `tests/` 写至少一个行为断言。
4. `npm run typecheck && npm test && npm run build`。

## API 速查

- `new Drawer({title, content, footer, side, closeOnMask, closeOnEsc, onClose})` → `.open(side?)` `.close()` `.setContent()` `.destroy()`
- `new SearchSelect(host, {options, placeholder, value, onChange})` → `.value` `.setValue(v)` `.toggle(open)`
- `new Pagination(host, {pages, page, onChange})` → `.page` `.setPage(n)` `.setPages(n)`
- `new DualRange(host, {min, max, step, value, format, onChange})` → `.value` `.setValue(lo, hi)`
- `toast({type, title, message, duration})` 或 `toast.success/error/warn/info(message, title?)`，返回关闭函数

演示站（`index.html`）仍使用 `js/main.js` / `css/style.css`，与库独立。
