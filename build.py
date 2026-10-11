import sys
if hasattr(sys.stdout, 'reconfigure'): sys.stdout.reconfigure(encoding='utf-8')
"""把 index.html + css/style.css + js/main.js 合并成单文件 dist/ui-components.single.html。
用法：python3 build.py
"""
import re, pathlib
root = pathlib.Path(__file__).parent
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "css/style.css").read_text(encoding="utf-8")
js = (root / "js/main.js").read_text(encoding="utf-8")
link = '<link rel="stylesheet" href="css/style.css">'
script = '<script src="js/main.js"></script>'
if link not in html or script not in html:
    sys.exit("index.html 里没有找到待替换的 link/script 标签，请检查标签写法")
html = html.replace(link, "<style>\n" + css + "</style>")
html = html.replace(script, "<script>\n" + js + "</script>")
out = root / "dist" / "ui-components.single.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print("已生成", out, round(out.stat().st_size / 1024), "KB")
