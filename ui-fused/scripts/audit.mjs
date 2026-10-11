#!/usr/bin/env node
// Tidy audit: counts the design decisions a page actually makes and flags overflow / tiny targets.
// Usage: node audit.mjs <file-or-url> [--widths 360,768,1280] [--wait 1500]
// Needs Playwright (npm i -D playwright && npx playwright install chromium).
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
let chromium;
for (const id of ["playwright", "playwright-core", "/home/claude/.npm-global/lib/node_modules/playwright"]) {
  try { ({ chromium } = require(id)); break; } catch {}
}
if (!chromium) { console.error("Playwright not found. Install it or run the checklist in references/checklist.md by hand."); process.exit(2); }

const args = process.argv.slice(2);
const target = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
const opt = (name, d) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : d; };
if (!target) { console.error("usage: audit.mjs <file-or-url> [--widths 360,768,1280] [--wait 1500]"); process.exit(2); }
const url = /^https?:|^file:/.test(target) ? target : pathToFileURL(path.resolve(target)).href;
const widths = opt("widths", "360,768,1280").split(",").map(Number);
const wait = Number(opt("wait", 1500));

// Budgets: beyond these, a page starts to feel noisy.
const BUDGET = { fontSizes: 7, fontFamilies: 2, radii: 5, shadows: 4, textColors: 5 };

const browser = await chromium.launch();
let problems = 0;
const flag = (msg) => { problems++; console.log("  ✗", msg); };

for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(url);
  await page.waitForTimeout(wait);
  const r = await page.evaluate(() => {
    const vis = [...document.querySelectorAll("body *")].filter((el) => {
      const s = getComputedStyle(el), b = el.getBoundingClientRect();
      return s.display !== "none" && s.visibility !== "hidden" && b.width > 0 && b.height > 0;
    });
    const hasText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    const sizes = new Set(), fams = new Set(), radii = new Set(), shadows = new Set(), colors = new Set();
    const tiny = [], overflowers = [];
    for (const el of vis) {
      const s = getComputedStyle(el);
      if (hasText(el)) {
        sizes.add(Math.round(parseFloat(s.fontSize)));
        fams.add(s.fontFamily.split(",")[0].replace(/["']/g, "").trim());
        colors.add(s.color);
      }
      // Percent radii (50% = a circle) and pill values are shapes, not radius decisions.
      const rawRad = s.borderTopLeftRadius, rad = parseFloat(rawRad);
      if (!rawRad.includes("%") && rad > 0 && rad < 500) radii.add(Math.round(rad));
      if (s.boxShadow !== "none") shadows.add(s.boxShadow);
      const b = el.getBoundingClientRect();
      if (el.matches("button, a[href], input, select, textarea, [role=button]") && Math.min(b.width, b.height) < 32)
        tiny.push((el.id || el.className || el.tagName).toString().slice(0, 40) + ` ${Math.round(b.width)}x${Math.round(b.height)}`);
      if (b.right > innerWidth + 1 && !el.closest("pre, [style*=overflow], .scroller")) overflowers.push((el.className || el.tagName).toString().slice(0, 40));
    }
    return {
      sizes: [...sizes].sort((a, b) => a - b), fams: [...fams], radii: [...radii].sort((a, b) => a - b),
      shadows: shadows.size, colors: colors.size, tiny, overflowers: [...new Set(overflowers)].slice(0, 6),
      hScroll: document.documentElement.scrollWidth > innerWidth,
      imgNoAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
    };
  });
  console.log(`\n@${w}px  font-sizes ${r.sizes.join("/")}  families ${r.fams.join(", ")}  radii ${r.radii.join("/")}  shadows ${r.shadows}  text-colors ${r.colors}`);
  if (r.hScroll) flag(`horizontal scroll at ${w}px`);
  if (r.overflowers.length) flag(`elements past the right edge: ${r.overflowers.join(", ")}`);
  if (r.tiny.length) flag(`targets under 32px: ${r.tiny.join("; ")}`);
  if (r.imgNoAlt) flag(`${r.imgNoAlt} <img> without alt`);
  if (w === widths[widths.length - 1]) {
    if (r.sizes.length > BUDGET.fontSizes) flag(`${r.sizes.length} font sizes (budget ${BUDGET.fontSizes})`);
    if (r.fams.length > BUDGET.fontFamilies) flag(`${r.fams.length} font families (budget ${BUDGET.fontFamilies})`);
    if (r.radii.length > BUDGET.radii) flag(`${r.radii.length} distinct radii (budget ${BUDGET.radii})`);
    if (r.shadows > BUDGET.shadows) flag(`${r.shadows} distinct shadows (budget ${BUDGET.shadows})`);
    if (r.colors > BUDGET.textColors) flag(`${r.colors} distinct text colors (budget ${BUDGET.textColors})`);
  }
  await page.close();
}
await browser.close();
console.log(problems ? `\n${problems} issue(s) to fix.` : "\nTidy: no budget violations.");
process.exit(problems ? 1 : 0);
