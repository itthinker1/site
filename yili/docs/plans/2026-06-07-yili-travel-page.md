# 伊犁环线攻略网页 - 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 输出单文件 `index.html`，呈现伊犁 8 天环线攻略，含 9 张水彩风格插画。

**Architecture:**
- 单文件 HTML，内联 CSS / JS，无构建工具
- 静态布局 + IntersectionObserver fade-in 动画 + `<details>` 折叠
- 9 张插画由 Doubao Seedream 批量生成，存 `asset/illustrations/`，HTML 用相对路径引用

**Tech Stack:**
- HTML5 / CSS3（含 CSS Grid、CSS 变量、@media）/ 原生 JS（仅 IntersectionObserver）
- Google Fonts CDN：Noto Serif SC + Noto Sans SC + Caveat
- 图片生成：`~/.claude/skills/doubao-creat-image/generate_image.py batch`

**设计文档参考：** `docs/plans/2026-06-07-yili-travel-page-design.md`

---

## Task 1：创建插画生成 manifest

**Files:**
- Create: `asset/illustrations/manifest.json`

**Step 1: 创建 manifest 文件**

JSON 数组，9 项，每项 `name` / `prompt` / `size`。统一风格前缀放在每条 prompt 开头。

写入 `asset/illustrations/manifest.json`：

```json
[
  {
    "name": "hero",
    "size": "2848x1600",
    "prompt": "水彩风格插画，柔和清新色调，主色为草原绿 #7BA05B 和雪山白，横构图 16:9，层次分明，天空大面积留白，无文字无水印。画面：北疆河谷草原全景，前景野花点缀的绿色草原，中景天山云杉针叶林，远景连绵雪山轮廓，蓝白渐变天空，治愈明亮氛围"
  },
  {
    "name": "day1",
    "size": "2848x1600",
    "prompt": "水彩风格插画，柔和清新色调，主色为草原绿与湖泊蓝 #A8C8D8，横构图 16:9，无文字无水印。画面：前景蜿蜒公路两旁草原野花，中景湛蓝高山湖泊（赛里木湖），雪山倒映在湖水中，远景连绵雪山，几朵白云"
  },
  {
    "name": "day2",
    "size": "2848x1600",
    "prompt": "水彩风格插画，柔和清新色调，主色草原绿，横构图 16:9，无文字无水印。画面：特克斯河中数匹骏马奔跑溅起水花（天马浴河），河谷两岸绿草原野花，远处天山雪峰轮廓，蓝天白云"
  },
  {
    "name": "day3",
    "size": "2848x1600",
    "prompt": "水彩风格插画，柔和清新色调，主色草原绿与森林深绿，横构图 16:9，无文字无水印。画面：山间古道蜿蜒延伸向远方雪山，两侧针叶林（云杉），路边野花，一条溪流穿过，夏塔古道氛围"
  },
  {
    "name": "day4",
    "size": "2848x1600",
    "prompt": "水彩风格插画，柔和清新色调，主色草原绿，横构图 16:9，无文字无水印。画面：哈萨克木屋和毡房散落在层层起伏的立体草原上，近景五彩野花，中景针叶森林，远景连绵雪山，几匹马在草原吃草（琼库什台）"
  },
  {
    "name": "day5",
    "size": "2848x1600",
    "prompt": "水彩风格插画，柔和清新色调，主色草原绿，横构图 16:9，无文字无水印。画面：一条曲线公路从松林山谷穿过，驶向开阔的草原，山谷渐变为草原，远处雪山，恰塔环线氛围"
  },
  {
    "name": "day6",
    "size": "2848x1600",
    "prompt": "水彩风格插画，柔和清新色调，主色草原绿，横构图 16:9，无文字无水印。画面：层层叠叠的立体草原（喀拉峻），起伏如绿色丝绸，几群牛羊点缀，近处野花，远景雪山轮廓，光影柔和"
  },
  {
    "name": "day7",
    "size": "2848x1600",
    "prompt": "水彩风格插画，柔和清新色调，主色草原绿，横构图 16:9，无文字无水印。画面：开阔广角的草原河谷（唐布拉百里画廊），弯曲河流穿过草原，两侧雪山延伸到远方，几顶毡房点缀，云朵投影"
  },
  {
    "name": "day8",
    "size": "2848x1600",
    "prompt": "水彩风格插画，柔和暖色调点缀，主色绿与暖橙 #E8A87C，横构图 16:9，无文字无水印。画面：维吾尔少女侧影走在六星街小巷，两侧彩色俄式房屋（黄色、蓝色、粉色木门），馕坑、手风琴、葡萄藤蔓装饰元素，温暖文艺氛围"
  }
]
```

**Step 2：commit**

```bash
cd /Users/home/code/yili
mkdir -p asset/illustrations
# 然后写入 manifest.json（用 Write 工具）
git init -q 2>/dev/null || true
git add asset/illustrations/manifest.json
git commit -m "feat: add Doubao illustration manifest for Yili travel page" 2>/dev/null || echo "git not initialized, skip commit"
```

---

## Task 2：批量生成 9 张插画

**Files:**
- Create: `asset/illustrations/hero.png` 等 9 个文件

**Step 1：确认 DOUBAO_API_KEY 已配置**

```bash
test -n "$DOUBAO_API_KEY" && echo "API key set" || (test -f ~/.doubao/config.json && echo "config file exists" || echo "ERROR: configure DOUBAO_API_KEY")
```

Expected：`API key set` 或 `config file exists`

如果 ERROR，停下来让用户配置。

**Step 2：批量生成**

```bash
uv run ~/.claude/skills/doubao-creat-image/generate_image.py batch \
  --manifest /Users/home/code/yili/asset/illustrations/manifest.json \
  --output-dir /Users/home/code/yili/asset/illustrations \
  --skip-existing
```

Expected：9 张 png 生成到 `asset/illustrations/`

**Step 3：验证文件存在**

```bash
ls -la /Users/home/code/yili/asset/illustrations/*.png | wc -l
```

Expected：`9`

如果少于 9 张，找出缺失项 (`ls /Users/home/code/yili/asset/illustrations/`)，单独重跑。

**Step 4：检查图片尺寸合理（任选 1 张）**

```bash
file /Users/home/code/yili/asset/illustrations/hero.png
```

Expected：宽 ≥ 2000px 的 PNG

---

## Task 3：搭建 HTML 骨架与设计令牌

**Files:**
- Create: `index.html`

**Step 1：写 HTML 骨架**

写入 `/Users/home/code/yili/index.html`，包含：

- `<!DOCTYPE html>` + lang="zh-CN"
- viewport meta、title="伊犁 8 天环线 · 2026"
- description meta（一句话攻略简介）
- Google Fonts link（Noto Serif SC、Noto Sans SC、Caveat）
- `<style>` 标签，内含 CSS 变量定义（设计文档 §1 配色 + 字体）
- `<body>` 内 5 个空 section：`#hero`、`#intro`、`#timeline`、`#tips`、`footer`
- 结尾 `<script>` 占位

**CSS 变量块（必含）：**

```css
:root {
  --grass: #7BA05B;
  --forest: #3E5641;
  --snow: #F4F1EC;
  --lake: #A8C8D8;
  --orange: #E8A87C;
  --paper: #FAF7F0;
  --ink: #2C3A2E;
  --gray: #6B7268;
  --font-serif: 'Noto Serif SC', serif;
  --font-sans: 'Noto Sans SC', sans-serif;
  --font-hand: 'Caveat', cursive;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-sans);
  background: var(--paper);
  color: var(--ink);
  line-height: 1.7;
  /* 米白纸纹：双层径向渐变 */
  background-image:
    radial-gradient(circle at 20% 30%, rgba(123,160,91,0.04) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(168,200,216,0.04) 0%, transparent 50%);
}
img { max-width: 100%; display: block; }
```

**Step 2：浏览器打开验证**

```bash
open /Users/home/code/yili/index.html
```

Expected：白底空白页，无控制台报错。字体已加载（页面 F12 → Network 显示 Google Fonts 200）。

**Step 3：commit**

```bash
cd /Users/home/code/yili
git add index.html
git commit -m "feat: scaffold HTML with design tokens and font loading"
```

---

## Task 4：实现 Hero 封面区

**Files:**
- Modify: `index.html`（填充 `#hero`，追加对应 CSS）

**Step 1：填充 Hero HTML**

`#hero` 内容：

```html
<section id="hero">
  <div class="hero-bg">
    <img src="asset/illustrations/hero.png" alt="伊犁河谷草原全景" />
  </div>
  <div class="hero-content">
    <p class="hero-eyebrow">Yili Loop · 2026</p>
    <h1 class="hero-title">伊犁 8 天环线</h1>
    <p class="hero-sub">天山以北，河谷草原与雪山的旅行手帐</p>
    <div class="hero-scroll">↓ 滚动查看</div>
  </div>
</section>
```

**Step 2：追加 Hero CSS**

```css
#hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}
.hero-bg { position: absolute; inset: 0; z-index: 0; }
.hero-bg img { width: 100%; height: 100%; object-fit: cover; opacity: 0.5; }
.hero-bg::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(250,247,240,0.3) 0%, var(--paper) 100%);
}
.hero-content { position: relative; z-index: 1; padding: 0 1.5rem; }
.hero-eyebrow {
  font-family: var(--font-hand);
  font-size: 1.5rem;
  color: var(--grass);
  letter-spacing: 0.1em;
}
.hero-title {
  font-family: var(--font-serif);
  font-size: clamp(2.5rem, 8vw, 5rem);
  color: var(--forest);
  font-weight: 700;
  margin: 0.5rem 0 1rem;
  letter-spacing: 0.05em;
}
.hero-sub {
  font-size: 1.1rem;
  color: var(--gray);
  max-width: 30rem;
  margin: 0 auto;
}
.hero-scroll {
  position: absolute;
  bottom: 2rem; left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-hand);
  color: var(--forest);
  animation: bounce 2s infinite;
}
@keyframes bounce {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, -10px); }
}
```

**Step 3：浏览器验证**

刷新页面。Expected：
- 首屏满屏，hero.png 半透明做背景
- 标题"伊犁 8 天环线"居中，宋体大字
- 底部"↓ 滚动查看"轻轻上下动

**Step 4：commit**

```bash
git add index.html
git commit -m "feat: hero section with background illustration"
```

---

## Task 5：实现序章 + 关键信息卡

**Files:**
- Modify: `index.html`

**Step 1：填充 `#intro` HTML**

```html
<section id="intro">
  <div class="intro-text">
    <h2 class="section-title">关于这趟旅程</h2>
    <p>新疆很大，相当于 9 个湖北。以天山为界，北疆是河谷草原，南疆多沙漠戈壁。初次入疆，首推北疆伊犁——那拉提、赛里木湖、伊昭公路、夏塔、琼库什台、特克斯八卦城、唐布拉百里画廊都在这条小环线上。</p>
    <p>下面是一份 8 天的路线，最美的风景就在路上。</p>
  </div>
  <div class="info-card">
    <div class="info-item"><span class="info-num">8</span><span class="info-label">天</span></div>
    <div class="info-item"><span class="info-num">~3000</span><span class="info-label">公里</span></div>
    <div class="info-item"><span class="info-num">北疆</span><span class="info-label">伊犁州</span></div>
    <div class="info-item"><span class="info-num">9×</span><span class="info-label">湖北面积</span></div>
  </div>
</section>
```

**Step 2：追加 CSS**

```css
#intro {
  max-width: 800px;
  margin: 0 auto;
  padding: 6rem 1.5rem 4rem;
}
.section-title {
  font-family: var(--font-serif);
  font-size: 2rem;
  color: var(--forest);
  margin-bottom: 1.5rem;
  position: relative;
  display: inline-block;
}
.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px; left: 0; right: 0;
  height: 6px;
  background: var(--grass);
  opacity: 0.3;
  border-radius: 3px;
}
.intro-text p {
  font-size: 1.05rem;
  color: var(--ink);
  margin-bottom: 1rem;
}
.info-card {
  margin-top: 2.5rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1.5rem;
  background: var(--snow);
  border: 1px dashed var(--grass);
  border-radius: 12px;
}
.info-item { text-align: center; }
.info-num {
  display: block;
  font-family: var(--font-serif);
  font-size: 1.8rem;
  color: var(--forest);
  font-weight: 700;
}
.info-label {
  display: block;
  font-size: 0.85rem;
  color: var(--gray);
  margin-top: 0.2rem;
}
@media (max-width: 600px) {
  .info-card { grid-template-columns: repeat(2, 1fr); }
}
```

**Step 3：浏览器验证**

刷新。Expected：
- 序章标题下有绿色高亮条
- 4 格信息卡，移动端 2×2，桌面端 1×4

**Step 4：commit**

```bash
git add index.html
git commit -m "feat: intro section with key stats card"
```

---

## Task 6：实现时间轴卡片样式

**Files:**
- Modify: `index.html`

**Step 1：填充 1 张示例卡 (D1) 测试样式**

`#timeline` 区域填入：

```html
<section id="timeline">
  <h2 class="section-title" style="display:block; text-align:center; margin:0 auto 3rem;">8 日行程</h2>

  <article class="day-card" data-fade>
    <div class="day-badge"><span class="day-num">D1</span></div>
    <img class="day-img" src="asset/illustrations/day1.png" alt="赛里木湖" loading="lazy" />
    <div class="day-body">
      <h3 class="day-title">伊宁 → 赛里木湖</h3>
      <p class="day-desc">一脚油门驶入北疆。果子沟大桥在山间盘旋而过，转过弯口，赛里木湖蓝得不真实——这是天山的眼睛。傍晚环湖，看夕阳把雪山染成金色。</p>
      <ul class="day-meta">
        <li><span class="icon">🏔️</span><strong>亮点：</strong>果子沟大桥俯瞰、环湖公路、湖畔住宿</li>
        <li><span class="icon">🍴</span><strong>必吃：</strong>返回伊宁后去海尔巴格餐厅（市公安局附近）</li>
        <li><span class="icon">💡</span><strong>Tip：</strong>高海拔早晚温差大，备一件冲锋衣</li>
      </ul>
      <div class="day-tags"><span>自驾</span><span>湖泊</span><span>公路风景</span></div>
    </div>
  </article>
</section>
```

**Step 2：追加 CSS（卡片 + timeline 主轴）**

```css
#timeline {
  max-width: 760px;
  margin: 0 auto;
  padding: 2rem 1.5rem 5rem;
  position: relative;
}
/* timeline 主轴：左侧虚线，桌面端居中下移 */
#timeline::before {
  content: '';
  position: absolute;
  left: 24px;
  top: 8rem;
  bottom: 5rem;
  width: 2px;
  background-image: linear-gradient(180deg, var(--grass) 50%, transparent 50%);
  background-size: 2px 12px;
  opacity: 0.5;
}
.day-card {
  position: relative;
  background: #FFFEFA;
  border: 1px dashed var(--grass);
  border-radius: 12px;
  padding: 0;
  margin: 0 0 3rem 60px;
  box-shadow: 0 4px 20px rgba(60, 90, 60, 0.06);
  overflow: hidden;
  transform: rotate(-0.5deg);
  transition: transform 0.3s ease;
}
.day-card:nth-child(odd) { transform: rotate(0.5deg); }
.day-card:hover { transform: rotate(0deg); }
.day-badge {
  position: absolute;
  left: -60px;
  top: 1rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--grass);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-hand);
  font-size: 1.3rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(123,160,91,0.4);
  z-index: 2;
}
.day-img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
}
.day-body { padding: 1.5rem; }
.day-title {
  font-family: var(--font-serif);
  font-size: 1.4rem;
  color: var(--forest);
  margin-bottom: 0.8rem;
}
.day-desc {
  color: var(--ink);
  margin-bottom: 1rem;
  font-size: 1rem;
}
.day-meta {
  list-style: none;
  border-top: 1px dashed rgba(123,160,91,0.3);
  padding-top: 1rem;
  margin-bottom: 1rem;
}
.day-meta li {
  margin-bottom: 0.4rem;
  color: var(--ink);
  font-size: 0.95rem;
}
.day-meta .icon { display: inline-block; width: 1.5rem; }
.day-meta strong { color: var(--forest); margin-right: 0.3rem; }
.day-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.day-tags span {
  background: rgba(168,200,216,0.4);
  color: var(--forest);
  padding: 0.2rem 0.7rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-family: var(--font-hand);
}
@media (max-width: 600px) {
  .day-card { margin-left: 50px; }
  .day-badge { left: -50px; width: 40px; height: 40px; font-size: 1.1rem; }
  #timeline::before { left: 20px; }
}
```

**Step 3：浏览器验证**

Expected：
- D1 卡片显示完整：插画在顶部，左侧有绿色 D1 圆形 badge
- 卡片轻微倾斜（贴纸感），hover 复正
- 左侧有虚线竖轴串联

**Step 4：commit**

```bash
git add index.html
git commit -m "feat: timeline day card layout (D1 example)"
```

---

## Task 7：填入 D2-D8 全部 7 张卡片

**Files:**
- Modify: `index.html`

**Step 1：在 D1 卡片后追加 D2-D8 共 7 张卡片**

每张卡片结构同 D1，仅替换 `data-day` 编号、图片路径、标题、文案、亮点、Tip、标签。

内容**严格按设计文档 §3 各日的描述/亮点/必吃/Tip/标签**。

特殊处理：**D6 有"三选一"列表**，在 `.day-desc` 后插入一个 `<ul class="day-options">`：

```html
<ul class="day-options">
  <li><strong>喀拉峻：</strong>立体草原天花板，光影起伏像绿色丝绸，最适合拍照</li>
  <li><strong>库尔德宁：</strong>原始云杉林+雪山，小众清净，徒步爱好者首选</li>
  <li><strong>那拉提：</strong>草原+空中草原+游客体验最丰富，老少咸宜</li>
</ul>
<p class="day-desc">如果时间宽裕，加一天玩两个。</p>
```

对应 CSS 追加：

```css
.day-options {
  list-style: none;
  background: rgba(123,160,91,0.06);
  border-left: 3px solid var(--grass);
  padding: 0.8rem 1rem;
  margin: 0.8rem 0;
  border-radius: 0 6px 6px 0;
}
.day-options li {
  margin-bottom: 0.4rem;
  font-size: 0.95rem;
}
.day-options strong { color: var(--forest); }
```

**Step 2：浏览器验证**

刷新。Expected：
- 8 张卡片从上到下排列，D1-D8 依次
- 每张插画对应正确
- D6 显示三选项灰底列表
- 移动端无水平滚动

**Step 3：commit**

```bash
git add index.html
git commit -m "feat: complete all 8 day cards on timeline"
```

---

## Task 8：实现实用贴士折叠区

**Files:**
- Modify: `index.html`

**Step 1：填充 `#tips` 内容**

```html
<section id="tips">
  <h2 class="section-title" style="display:block; text-align:center; margin:0 auto 3rem;">实用贴士</h2>
  <div class="tips-grid">
    <details class="tip-card">
      <summary><span class="tip-icon">✈️</span> 怎么去</summary>
      <ul>
        <li>十堰 → 西安（火车 5-6h / 高铁 1h）</li>
        <li>西安站 → 咸阳机场（地铁 4-14 号线，8 元）</li>
        <li>咸阳 → 伊宁（飞机 4h15min）</li>
        <li>总时长：约 1 天抵达</li>
      </ul>
    </details>
    <details class="tip-card">
      <summary><span class="tip-icon">🚗</span> 当地租车</summary>
      <ul>
        <li>✅ 推荐：神州租车 / 一嗨租车（比互联网平台靠谱）</li>
        <li>⚠️ 取车时全方位拍照上传 APP，划痕、内饰都拍</li>
        <li>💡 提前预定有优惠</li>
      </ul>
    </details>
    <details class="tip-card">
      <summary><span class="tip-icon">🎒</span> 游学清单</summary>
      <ul>
        <li>🌿 认识高原动植物</li>
        <li>🏗️ 果子沟大桥超级工程</li>
        <li>🐎 昭苏天马浴河 + 马术表演</li>
        <li>🏛️ 特克斯八卦城</li>
        <li>👘 穿民族服饰</li>
        <li>🧵 打馕 / 剪羊毛 / 挤牛奶 / 做酸奶疙瘩</li>
        <li>🗣️ 学哈萨克族问候语</li>
      </ul>
    </details>
    <details class="tip-card">
      <summary><span class="tip-icon">🍴</span> 美食地图</summary>
      <ul>
        <li>🥟 烤包子 / 馕包肉 / 手抓饭 / 大盘鸡</li>
        <li>🐔 椒麻鸡（椒之约·特克斯，¥80）</li>
        <li>🐎 熏马肠（昭苏特色）</li>
        <li>🍦 手工冰淇淋（伊宁街头）</li>
        <li>🥛 酸奶疙瘩 / 现挤奶茶</li>
        <li>💊 备药：乌梅、藿香酱、滴眼液、芦荟胶</li>
      </ul>
    </details>
  </div>
</section>
```

**Step 2：追加 CSS**

```css
#tips {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem 5rem;
}
.tips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
.tip-card {
  background: var(--snow);
  border: 1px dashed var(--grass);
  border-radius: 12px;
  padding: 1.2rem;
  transition: background 0.3s;
}
.tip-card[open] { background: #FFFEFA; }
.tip-card summary {
  cursor: pointer;
  list-style: none;
  font-family: var(--font-serif);
  font-size: 1.15rem;
  color: var(--forest);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.tip-card summary::-webkit-details-marker { display: none; }
.tip-card summary::after {
  content: '＋';
  margin-left: auto;
  font-size: 1.3rem;
  color: var(--grass);
  transition: transform 0.3s;
}
.tip-card[open] summary::after { content: '−'; }
.tip-card ul {
  list-style: none;
  margin-top: 1rem;
  padding-left: 0;
}
.tip-card li {
  padding: 0.3rem 0;
  font-size: 0.95rem;
  color: var(--ink);
}
.tip-icon { font-size: 1.3rem; }
@media (max-width: 600px) {
  .tips-grid { grid-template-columns: 1fr; }
}
```

**Step 3：浏览器验证**

Expected：
- 桌面端 2×2 网格，移动端 1 列
- 每个卡片标题旁显示 ＋，点击展开变成 −，列表平滑显示
- 全程无 JS（用原生 `<details>`）

**Step 4：commit**

```bash
git add index.html
git commit -m "feat: tips section with collapsible cards"
```

---

## Task 9：Footer + 安全提示

**Files:**
- Modify: `index.html`

**Step 1：填充 Footer**

```html
<footer>
  <p class="footer-tip">非常安全，很友好。注意尊重当地习俗——清真店里不饮酒、不吃猪肉、不指点。哈萨克族是最善良的民族。</p>
  <p class="footer-sign">— 祝你旅途愉快 —</p>
  <p class="footer-date">伊犁环线路书 · 2026</p>
</footer>
```

**Step 2：追加 CSS**

```css
footer {
  text-align: center;
  padding: 4rem 1.5rem 6rem;
  background: linear-gradient(180deg, transparent, rgba(123,160,91,0.08));
}
.footer-tip {
  max-width: 36rem;
  margin: 0 auto 2rem;
  color: var(--gray);
  font-size: 0.95rem;
  font-style: italic;
}
.footer-sign {
  font-family: var(--font-hand);
  font-size: 2rem;
  color: var(--forest);
  margin: 1rem 0;
}
.footer-date {
  font-family: var(--font-hand);
  font-size: 1rem;
  color: var(--gray);
}
```

**Step 3：浏览器验证 + commit**

```bash
git add index.html
git commit -m "feat: footer with safety tip and signature"
```

---

## Task 10：滚动 fade-in 动画

**Files:**
- Modify: `index.html`（追加 CSS + script）

**Step 1：追加 CSS**

```css
[data-fade] {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
[data-fade].visible {
  opacity: 1;
  transform: translateY(0);
}
```

**Step 2：给 day-card 全部加 `data-fade`**

确认 Task 7 中 8 张卡片均有 `data-fade` 属性。也给 `.info-card`、`.tip-card`、`.section-title`（非 hero 的）加上。

**Step 3：在 `</body>` 前追加 JS**

```html
<script>
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('[data-fade]').forEach(el => io.observe(el));
</script>
```

**Step 4：浏览器验证**

刷新页面，滚动到时间轴。Expected：
- 每张卡片进入视口时从下方淡入
- 没有 JS 报错

**Step 5：commit**

```bash
git add index.html
git commit -m "feat: scroll fade-in animation for cards"
```

---

## Task 11：移动端 + 跨浏览器验收

**Files:**
- 无修改（仅验证）

**Step 1：桌面 Chrome 验证**

```bash
open -a "Google Chrome" /Users/home/code/yili/index.html
```

检查清单：
- [ ] Hero 首屏满铺，标题居中无截断
- [ ] 8 张插画全部加载
- [ ] 时间轴左侧虚线竖轴连续
- [ ] 4 个 tip 卡可展开
- [ ] 滚动动画顺滑
- [ ] 控制台无 error
- [ ] Network 中 Google Fonts 200，9 张 PNG 全部 200

**Step 2：模拟移动端（375px 宽）**

Chrome DevTools → Toggle Device Toolbar → iPhone SE

检查清单：
- [ ] 无水平滚动条
- [ ] 标题字号合理（不溢出）
- [ ] 信息卡 2×2 排列
- [ ] Tip 卡单列堆叠
- [ ] day badge 不与卡片重叠
- [ ] 字号在移动端可读（≥ 14px）

**Step 3：如有问题，记录并回到对应 Task 修复，再 commit**

```bash
git add index.html
git commit -m "fix: responsive adjustments"
```

**Step 4：最终 commit**

```bash
git log --oneline
```

应能看到 10+ 个 commit，从 manifest → hero → intro → timeline → tips → footer → animation → responsive。

---

## 完成判据

- `index.html` 用浏览器打开立即可见，无报错
- 移动端 375px 宽下完整可读
- 9 张水彩插画风格一致、画面与文案匹配
- 4 个折叠贴士可点击展开收起
- 滚动入场动画顺滑
- 8 日内容与设计文档 §3 完全一致
- 单文件可直接发送（HTML + asset 文件夹）
