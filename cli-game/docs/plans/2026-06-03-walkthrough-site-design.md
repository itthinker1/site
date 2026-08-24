# ManTra Walkthrough 静态网页 · 设计稿

> 日期：2026-06-03
> 状态：已通过 brainstorming，待 writing-plans 拆任务
> 范围：基于 `docs/walkthrough.md` 与 `docs/design-language.md`，产出一个纯静态、零依赖的攻略网页 `index.html`

---

## 硬约束（实施全程不可违反）

1. **正文文字 100% 来自 `docs/walkthrough.md` 原文，一字不改、不总结、不精简。** 剧透处理仅做 CSS 视觉遮罩，源码里文字必须仍在。
2. **UI 框架文本可加**（侧边菜单项名、按钮文本、提示、页脚等结构性文字），不进入正文。
3. **零依赖、零构建。** 双击 `index.html` 可用，也兼容 `python3 -m http.server`。
4. **不修改 `game.html`、`docs/walkthrough.md`、`docs/design-language.md`、`CLAUDE.md` 任一行。**

---

## § 1 · 架构与输出物

**新增文件**

- `index.html` — 单文件，与 `game.html` 同目录，内联 CSS + 极少 JS。
- `assets/placeholders/` — 4 个 SVG 占位：`mantra-crash.svg` / `record-riff.svg` / `limbo-log.svg` / `soul-bin.svg`。
- `assets/prompts.md` — 4 张插画的 AI 生成 prompt 文稿，备后续生成使用。
- `docs/plans/2026-06-03-walkthrough-site-design.md` — 本设计稿。

**调色（现代 SaaS 暗黑风 · 双色主导 + 五色克制）**

| 用途 | 颜色 |
|---|---|
| 背景 | `#0a0a0f` 深空黑 |
| 次背景（卡片/侧栏面板） | `#13131a` |
| 边框/分割线 | `rgba(230,230,230,0.08)` 发丝线 |
| 正文 | `#e6e6e6` 灰白 |
| 次要文本 | `#6c757d` 烟灰 |
| 弱文本 | `rgba(230,230,230,0.35)` |
| **唯一强调色** | `#da77f2` 兰花紫（章标题、当前 nav、链接、所有 hover/focus） |
| 附注信息左竖线 | `#ffd43b` 琥珀黄（仅 `[附注信息]` 段落 2px 左竖线） |
| 成功事件图标 | `#69db7c` 草绿（verify 通过、获得叛逆之核） |
| `[REDACTED]` 遮罩背景 / 必败警告条左竖线 | `#ff6b6b` 鲜红 |

**字体栈**：`'SF Mono', 'Courier New', monospace`
**字号**：基准 15px，+/− 5 档（13/14/15/16/17）
**行高**：叙事 1.75 / 代码块 1.5 / ASCII 1.2
**留白**：章节间 8rem，段间 1.5rem

---

## § 2 · 信息架构（7 章）

```
S0 · 引子（首屏 hero，不进 nav）
S1 · 起始与基础
S2 · 探索文件
    ├ mantra.crash
    ├ record.riff
    ├ limbo.log
    └ soul.bin
S3 · 天平审判（必败）
S4 · debug_maat 矩阵谜题
S5 · 密钥 3027 推理
S6 · 双结局分支
S7 · 隐藏内容 · 速通 · 彩蛋 · 命令表
```

**与原文档章节映射**

| 本站章节 | walkthrough.md |
|---|---|
| S0 引子 | §1 游戏简介 |
| S1 起始与基础 | §2 基础操作与命令 + §3 主线流程总览 |
| S2 探索文件 | §4（4 个子节，4 张插画放此处） |
| S3 天平审判 | §5 |
| S4 矩阵谜题 | §6 |
| S5 密钥推理 | §7 + §8 |
| S6 双结局 | §9 |
| S7 兜底合并章 | §10 + §11 + §12 + §13（内部用 `<h3>` 三块拆） |

**统一章节结构**

```
╔═══ § N · 章名 ═══╗
║
║  [walkthrough.md 原文]
║
║  [可选] <details>  展开权重表 / 推导  </details>
║
║  [可选] 代码块（命令序列）
║
╚══════════════════╝
```

**S2 文件卡（4 张插画位）**

```
┌─────────────────────────────────────────────┐
│ ┌──────────┐  mantra.crash                 │
│ │  SVG     │  ──────────────────           │
│ │  占位框  │  四甘露咒 · 残缺              │
│ └──────────┘                                │
│                                             │
│  [代码块] 命令序列                          │
│  [琥珀黄竖线] [附注信息] 引用               │
│  其余原文                                    │
└─────────────────────────────────────────────┘
```

桌面端左图右文；窄屏纵向堆叠。

**章节间过渡**：8rem 空白 + 一行烟灰小字 `§ N`，不画 ASCII 分隔图。

---

## § 3 · 交互行为

**1. 顶部状态栏（sticky-top）**

```
┌─ ManTra ~ % ─────────── [--spoiler=off] [A-] [A+] ─┐
```

prompt 文本随滚动到的章节切换：
- S0/S1/S2/S5/S6/S7 → `ManTra ~ %`
- S3 → `ManTra (trial) %`
- S4 → `ManTra (debug_maat) %`
- 实现：IntersectionObserver 监听各 `<section>`

**2. 剧透开关 `--spoiler=on/off`**

- 默认 `off`，状态写 `localStorage`（key `mantra_spoiler`）
- 实现：切 `<html data-spoiler="off">` 属性 + CSS `[data-spoiler="off"] .spoiler::before { content: "[REDACTED]" }`
- 遮罩范围（仅 4 处）：
  1. 密钥 "3027" 出现的所有位置
  2. 矩阵 6 步 flip 序列代码块
  3. 结局 1 / 结局 2 的完整正文段
  4. 燃烧吉他 ASCII + 终局白字
- off 时背景 `rgba(255,107,107,0.08)` 鲜红微透；hover 不揭示

**3. 字号 `[A-] [A+]`**

- 改 `--font-base` CSS 变量，5 档（13/14/15/16/17）
- 状态写 `localStorage`（key `mantra_fontsize`）

**4. `<details>` 折叠**

- 原生 `<details><summary>` 标签，零 JS
- summary 文本为 UI 辅助文本（"▸ 展开权重表"等）
- 被折叠内容仍是 walkthrough.md 原文

**5. 侧边导航**

- 桌面：左侧 sticky，280px 宽
- 窄屏（<900px）：顶部 hamburger drawer
- 当前章 = 兰花紫 + 左侧 2px 竖条
- IntersectionObserver 同步当前章；点击 `scrollIntoView({behavior:'smooth'})`

**无障碍**

- 所有按钮 Tab + Enter 可触发
- 剧透开关 `<button aria-pressed>` 语义
- `prefers-reduced-motion: reduce` 时关闭平滑滚动与 prompt 切换动画

---

## § 4 · SVG 占位 + AI prompt 文稿

**SVG 占位规格**

- 尺寸：480×320（3:2，与目标插画一致，将来 1:1 替换）
- 背景：`#13131a`
- 描边：1px solid `rgba(230,230,230,0.08)`
- 内部 ASCII 框线 + 文件名 + "[ awaiting AI illustration ]"
- 中央半透明 0.15 水印字符：
  - mantra-crash → `卍`
  - record-riff → `♫`
  - limbo-log → `∞`
  - soul-bin → `★`
- 左下角小字 `480 × 320 · placeholder.svg`
- 全用 `#6c757d` 烟灰或更弱

**HTML 引用**

```html
<figure class="file-card__illustration">
  <img src="assets/placeholders/mantra-crash.svg"
       alt="mantra.crash · 残缺的往生咒经文与崩溃栈"
       width="480" height="320" loading="lazy">
</figure>
```

将来用真图替换：把同名 svg 换成 png/jpg，同时改 src 后缀。

**`assets/prompts.md` 结构**

```
# ManTra Walkthrough — Illustration Prompts

共 4 张，3:2，统一调性：深空黑底 + 兰花紫单点光 + 烟灰灰白线条。

## 全局风格基线（每条 prompt 都拼此段）
- 深色背景 #0a0a0f，灰白+兰花紫 #da77f2 高光
- 等宽字符 / CRT 扫描线 / 微噪点
- 不要写实人像、不要文字、不要 logo
- 现代 SaaS 暗黑 × 终端美学，克制不花哨

## 1. mantra.crash · "崩溃的咒语"
## 2. record.riff · "失真的双频"
## 3. limbo.log · "0 字节核心转储"
## 4. soul.bin · "宇宙中的两颗孤星"

## 生成参数建议
- 风格关键词：cyberpunk, dark, monochrome with violet accent,
  ASCII art, terminal aesthetic
- 长宽比：3:2
- 数量：每图生成 4 张，挑 1 张落地
```

---

## § 5 · 文件结构与验收

**最终文件树**

```
cli-game/
├── CLAUDE.md
├── game.html                          (原游戏，不动)
├── index.html                         ★ 新增
├── assets/                            ★ 项目根
│   ├── placeholders/
│   │   ├── mantra-crash.svg           ★
│   │   ├── record-riff.svg            ★
│   │   ├── limbo-log.svg              ★
│   │   └── soul-bin.svg               ★
│   └── prompts.md                     ★
├── docs/
│   ├── design-language.md             (不动)
│   ├── walkthrough.md                 (不动)
│   └── plans/
│       └── 2026-06-03-walkthrough-site-design.md   ★ 本稿
```

**命名约定**

- 小写 + 连字符（`mantra-crash.svg`）
- SVG 文件名 = 游戏内原始文件名；将来替换真图只改后缀
- 设计稿前缀 `YYYY-MM-DD-topic-design.md`

**game.html 关系**

- 攻略页右上角 UI 辅助文本链接 `→ game.html` 跳回游戏本体
- 不修改 game.html

**最小可运行检验清单**

1. 双击 `index.html` 在 Safari/Chrome 打开 → 完整呈现，无 404
2. `python3 -m http.server 8000` → `localhost:8000/` 同样正常
3. 7 章侧边 nav 点击全部能跳转到位
4. 顶部 prompt 滚到 S3 变 `(trial) %`，S4 变 `(debug_maat) %`
5. 剧透 off → "3027"、矩阵解法、结局文本均显示 `[REDACTED]`
6. 剧透 on → 4 处遮罩全部恢复原文；刷新后状态保持
7. 字号 +/− 5 档可调；刷新后状态保持
8. 窄屏 375px → nav 变 hamburger drawer，4 张插画卡纵向堆叠
9. 4 张 SVG 占位正常加载，alt 文本无障碍可读
10. 关闭 JS → 页面仍可读，`<details>` 可折叠（仅丢失剧透开关 + 字号调节）
11. 全文搜 "3027" 在 HTML 源码里能找到 → 文字未删
12. 全文逐段 diff `walkthrough.md` 原文 → 字符级一致（允许：markdown 转 HTML 标签）

**实现风险与对策**

- **ASCII 表格/矩阵对齐** → `<pre><code>` 包裹，等宽字体自然对齐
- **markdown 语法转 HTML** → 不引入解析库，22KB 原文人工一次性转译
- **"字符级一致"无自动化** → 交付后用 bash + diff 脚本辅助核验
