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
