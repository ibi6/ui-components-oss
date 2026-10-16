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
- `new Accordion(host, {items:[{title,content,open}], multiple, onToggle})` → `.toggle(i)` `.isOpen(i)`
- `new Modal({title, content, confirmText, cancelText, alert, danger, onConfirm, onCancel, onClose})` → `.open()` `.close()`；`await Modal.confirm({...})` 返回 boolean
- `new Tabs(host, {items:[{label,content,disabled}], active, onChange})` → `.select(i)` `.active`（←/→/Home/End）
- `new Switch(host, {checked, disabled, label, onChange})` → `.checked` `.set(v)`
- `new Progress(host, {value, max, variant:'bar'|'ring', indeterminate})` → `.set(v)` `.percent`
- `new Steps(host, {steps, current, onChange})` → `.next()` `.prev()` `.set(i)`
- `new Carousel(host, {slides, autoplay, loop, onChange})` → `.go(i)` `.next()` `.prev()` `.play()` `.stop()`
- `new DataTable(host, {columns:[{key,title,sortable,render}], rows, caption, onSort})` → `.sort(key,dir?)` `.setRows(rows)`
- `new Skeleton(host, {variant:'text'|'circle'|'rect', lines, width, height})` → `.resolve(html)`
- `new Tooltip(triggerEl, {text, placement})` → `.setText()` `.destroy()`
- `new CommandPalette({commands:[{id,label,hint,run}], hotkey})` → `.open()` `.close()`（Ctrl/Cmd+K）
- `new Dropdown(host, {label, items:[{label,value,disabled}], onSelect})` → `.open()` `.close()` `.toggle()`（menu/menuitem，↑↓/Home/End/Esc）
- `new Popover(triggerEl, {content, title, onToggle})` → `.open()` `.close()` `.toggle()`（role=dialog，Esc/点外部关闭）
- `new Input(host, {value, type:'text'|'password'|..., clearable, onInput})` → `.value` `.reveal(bool)`
- `new Textarea(host, {maxLength, value, onInput})` → `.value` `.length`（实时字数，超限 aria-invalid）
- `new OtpInput(host, {length, onChange, onComplete})` → `.value` `.fill(text)` `.clear()`（自动跳格、粘贴填充）
- `new Checkbox(host, {label, checked, indeterminate, onChange})` → `.checked` `.set(v)`
- `new RadioGroup(host, {options:[{label,value}], value, onChange})` → `.value` `.set(v)`
- `new Slider(host, {min,max,step,value,format,onChange})` → `.value` `.set(v)`
- `new TagInput(host, {tags, max, allowDuplicates, onChange})` → `.tags` `.add(t)` `.remove(i)`（Enter/逗号添加，Backspace 删除）
- `new Rating(host, {value, max, readOnly, onChange})` → `.value` `.set(v)`（←/→，再点当前值清零）
- `new Avatar(host, {name, src, size, status})`（图片失败回退首字母）；`initials(name)`
- `new Badge(host, {text, variant, dot, max})` → `.set(text)`
- `new Breadcrumb(host, {items:[{label,href}], separator})`（末项 aria-current=page）
- `new Alert(host, {type, title, message, closable, onClose})` → `.close()`
- `new Empty(host, {title, description, icon, actionText, onAction})`

演示站（`index.html`）仍使用 `js/main.js` / `css/style.css`，与库独立。
