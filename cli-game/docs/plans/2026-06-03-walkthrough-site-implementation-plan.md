# ManTra Walkthrough 静态网页 · 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 基于 `docs/walkthrough.md` 与 `docs/design-language.md`，产出 `index.html` 攻略页（含 4 张 SVG 占位 + AI 插画 prompt 文稿），原文一字不改，零依赖零构建。

**Architecture:** 单文件 `index.html`（内联 CSS + 最小 JS），按 7 章拆分；正文逐段从 `docs/walkthrough.md` 人工转译为语义 HTML；4 张 SVG 占位放 `assets/placeholders/`；剧透/字号/导航状态用 IntersectionObserver + localStorage 实现。

**Tech Stack:** 原生 HTML5 + CSS3 (变量、grid、sticky) + Vanilla JS (≤ 80 行)。无构建工具、无框架、无外链 CDN。

**硬约束（每个任务都必须遵守）:**

1. 正文 100% 来自 `docs/walkthrough.md` 原文，一字不改
2. UI 框架文本可加（菜单项、按钮、提示、页脚）
3. 零依赖零构建
4. 不修改 `game.html` / `docs/walkthrough.md` / `docs/design-language.md` / `CLAUDE.md`

**上下文偏离说明：** 项目非 git 仓库、无测试框架。原 writing-plans 模板的"写测试→跑测试→commit"循环被替换为"实现→手测清单→浏览器/diff 验证"。

**设计稿参考：** `docs/plans/2026-06-03-walkthrough-site-design.md`

---

### Task 1: 创建 4 张 SVG 占位

**Files:**
- Create: `assets/placeholders/mantra-crash.svg`
- Create: `assets/placeholders/record-riff.svg`
- Create: `assets/placeholders/limbo-log.svg`
- Create: `assets/placeholders/soul-bin.svg`

**Step 1: 创建目录**

```bash
mkdir -p assets/placeholders
```

**Step 2: 用统一模板写 4 个 SVG**

模板（替换 `{FILENAME}` 与 `{GLYPH}`）：

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320" width="480" height="320" role="img">
  <rect width="480" height="320" fill="#13131a"/>
  <rect x="0.5" y="0.5" width="479" height="319" fill="none"
        stroke="rgba(230,230,230,0.08)" stroke-width="1"/>
  <text x="240" y="200" text-anchor="middle"
        font-family="'SF Mono','Courier New',monospace" font-size="180"
        fill="#6c757d" opacity="0.15">{GLYPH}</text>
  <text x="240" y="60" text-anchor="middle"
        font-family="'SF Mono','Courier New',monospace" font-size="14"
        fill="#e6e6e6" opacity="0.85">{FILENAME}</text>
  <text x="240" y="80" text-anchor="middle"
        font-family="'SF Mono','Courier New',monospace" font-size="11"
        fill="#6c757d">────────────────</text>
  <text x="240" y="270" text-anchor="middle"
        font-family="'SF Mono','Courier New',monospace" font-size="11"
        fill="#6c757d">[ awaiting AI illustration ]</text>
  <text x="14" y="308"
        font-family="'SF Mono','Courier New',monospace" font-size="9"
        fill="#6c757d" opacity="0.5">480 × 320 · placeholder.svg</text>
</svg>
```

替换矩阵：

| 文件 | FILENAME | GLYPH |
|---|---|---|
| `mantra-crash.svg` | `mantra.crash` | `卍` |
| `record-riff.svg` | `record.riff` | `♫` |
| `limbo-log.svg` | `limbo.log` | `∞` |
| `soul-bin.svg` | `soul.bin` | `★` |

**Step 3: 手测**

在浏览器里直接打开 `assets/placeholders/mantra-crash.svg`，应看到深色卡片、中央半透明卍字、文件名 `mantra.crash`。其余三张同理。

---

### Task 2: 写 AI 插画 prompt 文稿

**Files:**
- Create: `assets/prompts.md`

**Step 1: 写完整 prompt 文稿**

内容结构：

```markdown
# ManTra Walkthrough — Illustration Prompts

> 4 张配图，目标 480×320 (3:2)，统一调性：
> 深空黑底 + 兰花紫 #da77f2 单点光 + 烟灰灰白线条
> 现代 SaaS 暗黑 × 终端美学，克制不花哨

## 全局风格基线（每条 prompt 都拼此段）

- 深色背景 #0a0a0f
- 主色调灰白 (#e6e6e6) + 兰花紫 (#da77f2) 高光
- 等宽字符 / CRT 扫描线 / 微噪点纹理
- 不要写实人像，不要文字，不要 logo，不要 watermark
- 整体气质：cyberpunk × Buddhist iconography × terminal aesthetic
- 构图留呼吸，主体居中或三分构图，背景大量留黑

---

## 1. mantra.crash · "崩溃的咒语"

**正面 prompt:**

A shattered ancient Sanskrit sutra scroll dissolving into floating binary code
fragments and ASCII glyphs. Torn page edges glow faintly violet (#da77f2).
Theravada Buddhist iconography (lotus, dharma wheel) reduced to monochrome
line art, mixed with kernel-panic stack trace text fragments drifting upward
like incense smoke. Deep void background. Cyberpunk gothic mood.

**负面 prompt:**

no readable text, no faces, no bright saturated colors, no anime style,
no realistic photography, no logos, no watermarks

**意象关键词：** sutra, binary, dissolve, violet glow, dust, stack trace

---

## 2. record.riff · "失真的双频"

**正面 prompt:**

Two overlapping waveform spectra — one at 700Hz (lower), one at 1400Hz (higher)
— rendered as glowing violet sine curves over deep void. Background suggests
a burning electric guitar silhouette in ASCII / line art form. Two ghost
figures faintly visible at each waveform peak, almost kissing but never touching.
Metallic punk aesthetic crossed with cyberpunk terminal.

**负面 prompt:**

no readable text, no faces (in detail), no bright saturated colors,
no realistic photography, no logos

**意象关键词：** dual frequency, sine wave, burning guitar ASCII, ghost lips

---

## 3. limbo.log · "0 字节核心转储"

**正面 prompt:**

An empty hollow cube floating in deep cyber-void, the cube's interior glows
with a single violet love letter folded into origami, weightless. Around the
cube, timestamp glyphs and stack trace fragments orbit slowly. The void has
subtle CRT scanlines. Mood: melancholic, romantic, "Segmentation Fault as
love song".

**负面 prompt:**

no readable text, no faces, no bright saturated colors, no realistic
photography, no logos

**意象关键词：** empty cube, void, origami letter, orbit, scanlines

---

## 4. soul.bin · "宇宙中的两颗孤星"

**正面 prompt:**

Two distant stars (Altair and Vega) across a deep purple-black cosmic void,
connected by a faint thread of violet light forming a delicate constellation.
Between them, a tiny silhouette of a paper rocket drifting. ASCII heart shapes
faintly visible in the starfield as constellations. Mood: tender, hopeful,
"the only soft thing in the cold universe".

**负面 prompt:**

no readable text, no faces, no bright saturated colors, no realistic
photography, no logos

**意象关键词：** Altair, Vega, paper rocket, ASCII heart constellation, thread

---

## 生成参数建议

- 风格关键词：cyberpunk, dark, monochrome with violet accent, ASCII art,
  terminal aesthetic, Buddhist mysticism
- 长宽比：3:2 (480×320 起步，可放大到 1920×1280)
- 每图生成 4 张候选，挑 1 张落地
- 落地后命名同 SVG：`assets/placeholders/mantra-crash.png` 等，HTML img src 改后缀即可

---

## 替换流程

1. 用 doubao-creat-image / 其他 AI 生成 PNG
2. 命名为 `mantra-crash.png` 等，放入 `assets/placeholders/`
3. 编辑 `index.html`，把对应 4 处 img 的 `src="assets/placeholders/xxx.svg"` 改为 `.png`
4. 旧 SVG 可保留也可删
```

**Step 2: 手测**

打开文件确认格式渲染正常、4 节齐全、有"替换流程"段。

---

### Task 3: 创建 index.html 骨架（HTML 结构 + 空章节）

**Files:**
- Create: `index.html`

**Step 1: 写骨架**

只写 HTML 结构与 placeholder 注释，正文 / CSS / JS 留给后续任务。

```html
<!DOCTYPE html>
<html lang="zh" data-spoiler="off" style="--font-base: 15px;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ManTra · Project Limbo V2.0 — 完整通关攻略</title>
  <style>/* TASK 4 注入 CSS */</style>
</head>
<body>

  <!-- 顶部状态栏 -->
  <header class="topbar" role="banner">
    <div class="topbar__prompt"><span class="prompt-text">ManTra ~ %</span></div>
    <div class="topbar__controls">
      <button id="spoiler-toggle" aria-pressed="false">--spoiler=off</button>
      <button id="font-dec" aria-label="减小字号">A-</button>
      <button id="font-inc" aria-label="增大字号">A+</button>
      <a class="back-link" href="game.html">→ game.html</a>
    </div>
  </header>

  <div class="layout">

    <!-- 侧边导航 -->
    <nav class="sidenav" aria-label="章节导航">
      <ol>
        <li><a href="#s1" data-target="s1">§ 1 · 起始与基础</a></li>
        <li>
          <a href="#s2" data-target="s2">§ 2 · 探索文件</a>
          <ol>
            <li><a href="#s2-mantra">.mantra.crash</a></li>
            <li><a href="#s2-record">.record.riff</a></li>
            <li><a href="#s2-limbo">.limbo.log</a></li>
            <li><a href="#s2-soul">.soul.bin</a></li>
          </ol>
        </li>
        <li><a href="#s3" data-target="s3">§ 3 · 天平审判（必败）</a></li>
        <li><a href="#s4" data-target="s4">§ 4 · debug_maat 矩阵谜题</a></li>
        <li><a href="#s5" data-target="s5">§ 5 · 密钥推理</a></li>
        <li><a href="#s6" data-target="s6">§ 6 · 双结局分支</a></li>
        <li><a href="#s7" data-target="s7">§ 7 · 隐藏 · 速通 · 彩蛋 · 命令表</a></li>
      </ol>
    </nav>

    <!-- 主区 -->
    <main class="content">

      <section id="s0" class="hero">
        <!-- TASK 5 注入 §1 游戏简介原文 -->
      </section>

      <section id="s1" class="chapter" data-prompt="ManTra ~ %">
        <h2>§ 1 · 起始与基础</h2>
        <!-- TASK 5 注入 §2 基础操作与命令 + §3 主线流程总览 原文 -->
      </section>

      <section id="s2" class="chapter" data-prompt="ManTra ~ %">
        <h2>§ 2 · 探索文件</h2>
        <!-- TASK 5 注入 §4 原文 + 4 张文件卡（含 SVG） -->
      </section>

      <section id="s3" class="chapter" data-prompt="ManTra (trial) %">
        <h2>§ 3 · 天平审判（必败）</h2>
        <!-- TASK 5 注入 §5 原文 -->
      </section>

      <section id="s4" class="chapter" data-prompt="ManTra (debug_maat) %">
        <h2>§ 4 · debug_maat 矩阵谜题</h2>
        <!-- TASK 5 注入 §6 原文 -->
      </section>

      <section id="s5" class="chapter" data-prompt="ManTra ~ %">
        <h2>§ 5 · 密钥推理</h2>
        <!-- TASK 5 注入 §7 + §8 原文 -->
      </section>

      <section id="s6" class="chapter" data-prompt="ManTra ~ %">
        <h2>§ 6 · 双结局分支</h2>
        <!-- TASK 5 注入 §9 原文 -->
      </section>

      <section id="s7" class="chapter" data-prompt="ManTra ~ %">
        <h2>§ 7 · 隐藏 · 速通 · 彩蛋 · 命令表</h2>
        <!-- TASK 5 注入 §10 + §11 + §12 + §13 原文 -->
      </section>

      <footer class="page-footer">
        <p>页面文字一字一句来自 <a href="docs/walkthrough.md">docs/walkthrough.md</a>。
           插画占位将由 AI 生成替换。</p>
      </footer>

    </main>

  </div>

  <script>/* TASK 6 注入 JS */</script>
</body>
</html>
```

**Step 2: 手测**

```bash
open index.html
```

页面应能打开（白色或浏览器默认样式，无 CSS）、看到 7 个章节标题、侧边导航链接能跳转、顶部按钮存在但无样式。

---

### Task 4: 注入 CSS

**Files:**
- Modify: `index.html`（替换 `<style>/* TASK 4 注入 CSS */</style>` 块）

**Step 1: 写完整 CSS**

```css
:root {
  --font-base: 15px;
  --bg: #0a0a0f;
  --bg-elev: #13131a;
  --border: rgba(230,230,230,0.08);
  --text: #e6e6e6;
  --text-dim: #6c757d;
  --text-weak: rgba(230,230,230,0.35);
  --accent: #da77f2;
  --gold: #ffd43b;
  --green: #69db7c;
  --red: #ff6b6b;
  --font-mono: 'SF Mono','Courier New','Menlo',monospace;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
html { font-size: var(--font-base); }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-mono);
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
}

a { color: var(--accent); text-decoration: none; }
a:hover, a:focus { text-decoration: underline; }

/* ---------- TOPBAR ---------- */
.topbar {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: rgba(10,10,15,0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
  font-size: 0.9rem;
}
.prompt-text { color: var(--text); }
.prompt-text::before { content: ''; }
.topbar__controls { display: flex; gap: 0.75rem; align-items: center; }
.topbar__controls button {
  background: transparent; border: 1px solid var(--border);
  color: var(--text-dim); font-family: inherit; font-size: 0.85rem;
  padding: 0.3rem 0.6rem; cursor: pointer; border-radius: 3px;
}
.topbar__controls button:hover { color: var(--accent); border-color: var(--accent); }
.topbar__controls button[aria-pressed="true"] {
  color: var(--accent); border-color: var(--accent);
}
.back-link { font-size: 0.85rem; color: var(--text-dim); }

/* ---------- LAYOUT ---------- */
.layout { display: grid; grid-template-columns: 280px 1fr; max-width: 1400px; margin: 0 auto; }

/* ---------- SIDENAV ---------- */
.sidenav {
  position: sticky; top: 56px; align-self: start;
  height: calc(100vh - 56px); overflow-y: auto;
  padding: 2rem 1.25rem;
  border-right: 1px solid var(--border);
  font-size: 0.88rem;
}
.sidenav ol { list-style: none; padding: 0; margin: 0; }
.sidenav ol ol { padding-left: 1rem; margin-top: 0.4rem; }
.sidenav li { margin: 0.5rem 0; }
.sidenav a {
  display: block; padding: 0.35rem 0.6rem; color: var(--text-dim);
  border-left: 2px solid transparent;
}
.sidenav a:hover { color: var(--text); text-decoration: none; }
.sidenav a.is-active {
  color: var(--accent); border-left-color: var(--accent);
  background: rgba(218,119,242,0.05);
}

/* ---------- CONTENT ---------- */
.content { padding: 3rem 4rem; max-width: 880px; }
.chapter { margin-bottom: 8rem; scroll-margin-top: 4rem; }
.chapter h2 {
  color: var(--accent); font-weight: normal;
  font-size: 1.5rem; margin: 0 0 2rem; padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}
.chapter h3 { color: var(--text); font-weight: normal; font-size: 1.15rem; margin: 2.5rem 0 1rem; }
.chapter h4 { color: var(--text-dim); font-weight: normal; font-size: 1rem; margin: 2rem 0 0.75rem; }
.chapter p { margin: 1.5rem 0; }
.chapter strong { color: var(--text); }
.chapter em { color: var(--text); }
.chapter code {
  background: var(--bg-elev); padding: 0.1rem 0.4rem;
  border-radius: 3px; font-size: 0.9em; color: var(--accent);
}
.chapter pre {
  background: var(--bg-elev); border: 1px solid var(--border);
  padding: 1rem 1.25rem; overflow-x: auto; line-height: 1.5;
  border-radius: 4px; font-size: 0.9rem;
}
.chapter pre code { background: transparent; padding: 0; color: var(--text); }
.chapter ul, .chapter ol { padding-left: 1.5rem; }
.chapter table {
  width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.92rem;
}
.chapter th, .chapter td {
  border-bottom: 1px solid var(--border); padding: 0.5rem 0.75rem; text-align: left;
}
.chapter th { color: var(--text-dim); font-weight: normal; }
.chapter blockquote {
  margin: 1.5rem 0; padding: 0.5rem 1.25rem;
  border-left: 2px solid var(--text-dim); color: var(--text);
}
.chapter blockquote.annotation { border-left-color: var(--gold); }
.chapter blockquote.warning { border-left-color: var(--red); }
.chapter hr { border: none; border-top: 1px solid var(--border); margin: 3rem 0; }

/* ---------- FILE CARD (S2) ---------- */
.file-card {
  display: grid; grid-template-columns: 220px 1fr; gap: 2rem;
  padding: 1.5rem; margin: 2rem 0;
  background: var(--bg-elev); border: 1px solid var(--border); border-radius: 4px;
}
.file-card__illustration img { width: 100%; height: auto; display: block; border-radius: 3px; }
.file-card__body > :first-child { margin-top: 0; }

/* ---------- DETAILS ---------- */
details {
  margin: 1.5rem 0; padding: 0.75rem 1.25rem;
  background: var(--bg-elev); border: 1px solid var(--border); border-radius: 4px;
}
details > summary {
  cursor: pointer; color: var(--accent); list-style: none;
  font-size: 0.95rem;
}
details > summary::-webkit-details-marker { display: none; }
details > summary::before { content: '▸ '; }
details[open] > summary::before { content: '▾ '; }

/* ---------- SPOILER ---------- */
[data-spoiler="off"] .spoiler {
  position: relative; color: transparent !important;
  background: rgba(255,107,107,0.08); border-radius: 2px;
  user-select: none;
}
[data-spoiler="off"] .spoiler::before {
  content: '[REDACTED]'; position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--red); font-size: 0.85em; letter-spacing: 0.05em;
}
[data-spoiler="off"] .spoiler.block { display: block; min-height: 4em; }

/* ---------- FOOTER ---------- */
.page-footer {
  margin-top: 8rem; padding: 2rem 0; border-top: 1px solid var(--border);
  color: var(--text-weak); font-size: 0.85rem;
}

/* ---------- HERO (S0) ---------- */
.hero { padding: 4rem 0 6rem; }
.hero h1 {
  font-size: 1.8rem; color: var(--text); font-weight: normal; margin: 0 0 1.5rem;
}

/* ---------- RESPONSIVE ---------- */
@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .sidenav {
    position: static; height: auto; border-right: none;
    border-bottom: 1px solid var(--border); padding: 1rem;
  }
  .sidenav ol ol { display: none; }
  .content { padding: 2rem 1.25rem; }
  .file-card { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  * { transition: none !important; animation: none !important; }
}
html { scroll-behavior: smooth; }
```

**Step 2: 手测**

```bash
open index.html
```

预期：深色背景，章节标题兰花紫，侧边 nav 280px 宽，顶部按钮带边框。窄屏（DevTools 375px）侧边变顶部。

---

### Task 5: 注入正文（最大任务 · 分小节进行）

**Files:**
- Modify: `index.html`（替换 7 个 section 的 `<!-- TASK 5 注入 -->` 注释）

**总原则:** 逐段对照 `docs/walkthrough.md`，markdown 语法转语义 HTML（`**` → `<strong>`，`*` → `<em>`，``` 围栏 → `<pre><code>`，`>` 引用 → `<blockquote>`，表格 → `<table>`，标题层级映射到 `<h3>` `<h4>`）。**禁止**改字、删字、加字、合并段、拆段。

#### Task 5.1: S0 引子（注入 §1 游戏简介）

**Step 1:** 把 `docs/walkthrough.md` 的 `## 1. 游戏简介` 全部内容（包括 h1 标题 `# ManTra · Project Limbo V2.0 — 完整通关攻略` 与开头剧透 blockquote）转为 HTML 放入 `<section id="s0">`。

- `# ManTra · ...` → `<h1>`
- 第二行 `> 一份完整的解谜手册...` 与 `> **核心剧透警告**...` → `<blockquote class="warning">`（红色左竖线，对应"剧透警告"语义）
- `## 1. 游戏简介` → `<h2>§ 0 · 游戏简介</h2>`（注：本站章节编号与原文档不一一对应，这里 S0 标题统一前缀"§ 0 · " + 原文 `## 1. 游戏简介` 的标题文本）
- 其余 `- **背景**...` 列表 → `<ul>`

**Step 2:** 浏览器手测此节文本与原文 diff 一致。

#### Task 5.2: S1（注入 §2 基础操作与命令 + §3 主线流程总览）

**Step 1:** 转译两节内容。

要点：
- 两个 `## 2. ...` `## 3. ...` 原标题作为 `<h3>` 放入 S1（S1 的 h2 已经是"§ 1 · 起始与基础"）
- `### 初始可用命令` 等表格用 `<table>`
- `### 存档机制` 用 `<h4>`
- 主线流程图（ASCII 框）用 `<pre>`

**Step 2:** 手测。

#### Task 5.3: S2（注入 §4 + 4 张文件卡）

**Step 1:** 4 个子节 `### 4.1 mantra.crash` 等转为 4 张 file-card。

每张卡结构：

```html
<article id="s2-mantra" class="file-card">
  <figure class="file-card__illustration">
    <img src="assets/placeholders/mantra-crash.svg"
         alt="mantra.crash · 残缺的往生咒经文与崩溃栈"
         width="480" height="320" loading="lazy">
  </figure>
  <div class="file-card__body">
    <h3>4.1 mantra.crash</h3>
    <!-- 原文转译，包括代码块、引用、附注信息段 -->
  </div>
</article>
```

注意：
- `[附注信息]` 所在的 blockquote 加 `class="annotation"`（琥珀黄左竖线）
- 4 个 article 的 id 分别是 `s2-mantra` / `s2-record` / `s2-limbo` / `s2-soul`（与侧边 nav 锚点对齐）
- 文件名水印对应：mantra→卍 / record→♫ / limbo→∞ / soul→★

**Step 2:** 手测 4 张占位图加载、4 段文字与原文一致。

#### Task 5.4: S3（注入 §5 天平审判）

**Step 1:** 转译整节。权重表用 `<table>`，"为什么这关必败"那段推理用 `<details><summary>▸ 展开权重推导</summary>...</details>` 包裹（summary 是 UI 辅助文本，正文不变）。

**Step 2:** 手测。

#### Task 5.5: S4（注入 §6 矩阵谜题）

**Step 1:** 转译整节。

要点：
- 矩阵 ASCII 图用 `<pre>`
- "解题原理" 6.4 节用 `<details><summary>▸ 展开矩阵原理推导</summary>` 折叠
- "推荐 flip 序列" 那块的代码块加 `class="spoiler block"`（被剧透开关控制）

**Step 2:** 手测。剧透 off 时 flip 序列变 `[REDACTED]`。

#### Task 5.6: S5（注入 §7 修复后试炼 + §8 密钥推理）

**Step 1:** 转译两节。

要点：
- 所有出现"3027"的位置 用 `<span class="spoiler">3027</span>`（密钥本身）
- "8.2 逐位推导"四个子节用 `<details>` 各自折叠
- "8.3 拼合"的 ASCII 块加 `class="spoiler block"`（直接显示密钥的位置）
- "8.4 诗学骨架"表格保留

**Step 2:** 手测。off 时 3027 与拼合块都遮罩。

#### Task 5.7: S6（注入 §9 双结局）

**Step 1:** 转译整节。

要点：
- 9.1 与 9.2 整段 `<blockquote>` 加 `class="spoiler"` —— 结局正文剧透
- 燃烧吉他 ASCII `<pre>` 加 `class="spoiler block"`
- 终局白字 `"I am the ghost in the machine..."` 加 `class="spoiler"`

**Step 2:** 手测。off 时结局段全部遮罩。

#### Task 5.8: S7（注入 §10 + §11 + §12 + §13）

**Step 1:** 4 节合并到 S7，各自作为 `<h3>` 二级标题。

- §10 隐藏内容 → `<h3>10. 隐藏内容：soul.bin 宇宙漫游</h3>`
- §11 速通路线 → `<h3>11. 速通路线</h3>`
- §12 彩蛋 → `<h3>12. 彩蛋与隐藏细节</h3>`
- §13 命令表 → `<h3>13. 附录：完整命令参考表</h3>`

§10 的宇宙漫游 ASCII `<pre>` 不遮罩（这一段不算主线剧透）。§13 三张命令表用 `<table>`。最后的"结语"也并入 S7 末尾。

**Step 2:** 手测。

---

### Task 6: 注入 JS（5 个交互）

**Files:**
- Modify: `index.html`（替换 `<script>/* TASK 6 注入 JS */</script>` 块）

**Step 1:** 写完整 JS

```javascript
(function () {
  'use strict';
  const root = document.documentElement;
  const LS = window.localStorage;

  // ---------- 1. 剧透开关 ----------
  const spoilerBtn = document.getElementById('spoiler-toggle');
  const savedSpoiler = LS.getItem('mantra_spoiler') || 'off';
  setSpoiler(savedSpoiler);

  spoilerBtn.addEventListener('click', () => {
    const next = root.dataset.spoiler === 'off' ? 'on' : 'off';
    setSpoiler(next);
    LS.setItem('mantra_spoiler', next);
  });

  function setSpoiler(state) {
    root.dataset.spoiler = state;
    spoilerBtn.textContent = `--spoiler=${state}`;
    spoilerBtn.setAttribute('aria-pressed', state === 'on');
  }

  // ---------- 2. 字号 ----------
  const SIZES = [13, 14, 15, 16, 17];
  let sizeIdx = SIZES.indexOf(parseInt(LS.getItem('mantra_fontsize') || '15', 10));
  if (sizeIdx < 0) sizeIdx = 2;
  applyFontSize();

  document.getElementById('font-dec').addEventListener('click', () => {
    if (sizeIdx > 0) { sizeIdx--; applyFontSize(); }
  });
  document.getElementById('font-inc').addEventListener('click', () => {
    if (sizeIdx < SIZES.length - 1) { sizeIdx++; applyFontSize(); }
  });

  function applyFontSize() {
    root.style.setProperty('--font-base', SIZES[sizeIdx] + 'px');
    LS.setItem('mantra_fontsize', SIZES[sizeIdx]);
  }

  // ---------- 3. 顶部 prompt 与 sidenav 高亮 ----------
  const promptEl = document.querySelector('.prompt-text');
  const chapters = document.querySelectorAll('section.chapter');
  const navLinks = document.querySelectorAll('.sidenav a[data-target]');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const prompt = entry.target.dataset.prompt || 'ManTra ~ %';
        promptEl.textContent = prompt;
        navLinks.forEach(a => {
          a.classList.toggle('is-active', a.dataset.target === id);
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  chapters.forEach(c => obs.observe(c));
})();
```

**Step 2:** 手测

打开页面：
1. 顶部按钮显示 `--spoiler=off`，点击变 `--spoiler=on`，密钥 3027 露出
2. 刷新页面，开关状态保留
3. `A+` `A-` 改字号，5 档循环，刷新保留
4. 滚动到 S3，顶部 prompt 变 `ManTra (trial) %`
5. 滚动时侧边 nav 当前章节兰花紫高亮 + 左竖条

---

### Task 7: 验收清单（逐项手测）

**Step 1:** 按以下 12 项逐项验证，每项打勾或记录问题。

1. ☐ 双击 `index.html` macOS Chrome 打开 → 完整呈现，无任何 404
2. ☐ `python3 -m http.server 8000` → `localhost:8000/` 同样能用
3. ☐ 7 个章节都能从侧边 nav 点击跳到位
4. ☐ 顶部 prompt 在 S3 变 `(trial) %`，S4 变 `(debug_maat) %`，其他章变回 `~ %`
5. ☐ 剧透 off 时："3027"、矩阵 flip 序列、结局 1+2 正文、燃烧吉他 ASCII 均显示 `[REDACTED]`
6. ☐ 剧透 on 时：4 处遮罩全部恢复原文；刷新后状态保持
7. ☐ 字号 +/− 5 档可调；刷新后状态保持
8. ☐ 窄屏（DevTools 375px）→ 侧边 nav 变顶部，4 张插画卡纵向堆叠
9. ☐ 4 张 SVG 占位正常加载（mantra→卍 / record→♫ / limbo→∞ / soul→★），alt 文本无障碍可读
10. ☐ 浏览器禁用 JS → 页面仍可读，`<details>` 可折叠（仅丢失剧透开关 + 字号 + prompt 同步）
11. ☐ 在浏览器开发者工具 Elements 面板搜 "3027" → 能找到（证明文字未删，只是 CSS 遮罩）
12. ☐ 文本一致性核验（脚本）：

   ```bash
   # 把 walkthrough.md 与从 index.html 提取的纯文本做差异对比
   # 简易做法：用浏览器复制 main 区全文到 /tmp/site.txt
   diff <(grep -v '^[[:space:]]*$' docs/walkthrough.md) \
        <(grep -v '^[[:space:]]*$' /tmp/site.txt) | head -80
   ```
   预期：只有 markdown 语法残留差异（`#`、`*`、`>` 等），无字符级文字增删改。

**Step 2:** 任一项失败 → 回到对应 Task 修复 → 重测

---

### Task 8: 收尾

**Step 1:** 删除 index.html 里所有 `<!-- TASK X 注入 -->` 提醒注释（已完成的任务标记）

**Step 2:** 检查所有 file path 无拼写错误（4 张 SVG 文件名 = HTML img src）

**Step 3:** 最终在 DevTools Console 看是否有报错；无报错即完工

---

## 实施顺序与依赖

```
Task 1 (SVG)  ──┐
Task 2 (prompts) ─┤
                  ├─→ Task 3 (HTML 骨架) → Task 4 (CSS) → Task 5.1-5.8 (正文 8 步) → Task 6 (JS) → Task 7 (验收) → Task 8 (收尾)
                  ┘
```

Task 1、2、3 互相独立可并行；Task 4 依赖 Task 3；Task 5 的 8 步顺序无关但建议按 S0→S7 顺序写以方便 diff 比对；Task 6 依赖 Task 3 的 DOM 结构；Task 7、8 必须最后。

---

## 风险与对策

| 风险 | 对策 |
|---|---|
| 正文转译时漏字/改字 | 每个 Task 5.x 结束都 diff 原文一次；Task 7 第 12 项最终全文 diff |
| ASCII 表格/矩阵在 `<pre>` 里对不齐 | 必须等宽字体；CSS 已锁 `font-family: var(--font-mono)` |
| 剧透遮罩范围错误（漏遮或多遮） | 设计稿明确仅 4 类位置；Task 5.4/5.5/5.6/5.7 单测此 4 处 |
| IntersectionObserver 在某章过短时多个章节同时 intersecting | rootMargin `-30% 0px -60% 0px` 已收窄判定区；多个 intersecting 时取最后一个生效（forEach 自然行为） |
