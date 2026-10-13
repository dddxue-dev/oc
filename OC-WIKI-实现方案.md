# OC 记录站（OC Wiki）实现方案

> 版本：v1 草案 · 2026-10-13  
> 状态：**待确认**（确认后再动手写代码）  
> 目标：一个类 Wiki 的原创角色（OC）记录网站，含总览、世界观、人物档案、论坛、画廊、故事收录六个板块，UI 走低饱和、整洁干练的多主题风格（蓝白 / 黑红等）。

---

## 0. 一句话结论

**推荐「Astro 静态优先 + 内容集合（Content Collections）+ 自研设计令牌主题系统」的组合，论坛单独解耦为可插拔模块。**

理由很直接：六个页面里有五个（总览 / 世界观 / 人物档案 / 画廊 / 故事收录）都是**内容型页面**——读多写少、结构固定、需要 SEO 和快速首屏。这类页面用静态生成能做到：近乎零 JS、秒开、零服务器成本、内容进 Git 可版本回溯。只有**论坛**需要动态能力（发帖、回帖、账号），把它单独拆出来，既不影响主站性能，也保留了后续升级空间。

如果最终确认「论坛是核心、且需要多用户社区」，则整体升级为全栈应用（Next.js / SvelteKit + 数据库），方案里给了对应分支。

---

## 1. 需求拆解

### 1.1 明确要求

| 板块   | 内容                              |
| ---- | ------------------------------- |
| 总览   | 站点首页 / 世界观概览，入口导航、精选内容、统计       |
| 世界观  | 世界设定百科：地理、历史、体系（魔法/科技）、种族、组织、术语 |
| 人物档案 | OC 角色卡：立绘、基本信息、性格、能力、背景、关系      |
| 论坛   | 讨论 / 发帖 / 回帖（形态待确认，见 §11）       |
| 画廊   | 作品/立绘/插画展示，图片墙 + 详情             |
| 故事收录 | 小说 / 剧情 / 片段收录与阅读               |

### 1.2 从描述中推断出的隐含需求

- **主题换肤**：至少两套（蓝白、黑红），低饱和度、整洁干练 → 需要一套**设计令牌（design token）体系**，而不是写死颜色。
- **交叉引用**：人物 ↔ 世界观 ↔ 事件 ↔ 故事 ↔ 画廊，条目之间要能互相跳转 → 需要**内链 + 关系模型**。
- **图库管理**：画廊与立绘涉及大量图片 → 需要图片处理（压缩/缩略图/灯箱）。
- **阅读体验**：故事收录要能舒服地读长文（字号/行距/进度）。
- **移动端适配**：OC 站受众移动端占比高。
- **内容更新频率低、体量中等**：适合文件即内容（Markdown/YAML）。

---

## 2. 同类开源项目调研

按「与需求的接近程度」分四类。每项给出：定位 / 技术栈 / 数据存储 / 许可 / 优点 / 缺点。


### A 类：OC 与世界观专用工具（最贴近需求）

#### A1. LoreFolio（SQHYxhr/LoreFolio）★ 功能最贴合

- **定位**：本地优先的世界观与 OC 设定管理工具。
- **技术栈**：Next.js 15 + React 19 + TypeScript + Tailwind CSS v4 + TipTap（富文本）+ Radix UI + @xyflow/react（关系图谱）。
- **数据存储**：**浏览器 localStorage**，纯前端，无后端。
- **许可**：⚠️ **暂未指定开源协议**（等于「保留所有权利」，不能合法二次分发/商用）。
- **功能**：八类档案（角色 / 地点 / 组织 / 物品 / 事件 / 种族 / 世界观 / 笔记）；全局搜索；世界概览；时间线；世界地图（上传底图 + 拖拽标注）；角色关系图谱；JSON 导入导出备份；PWA。
- **优点**：**功能覆盖面与我们的需求几乎一一对应**，尤其是「多类档案 + 关系图谱 + 时间线 + 概览」这套组合拳，是现成的最佳抄作业对象；UI 克制。
- **缺点**：数据只在 localStorage（清缓存即丢）、无账号、无云同步、无多人协作、无论坛、无开源协议。**不能直接拿来当产品**，但可以当**功能蓝本**。

#### A2. OC Studio（Pokanshuu/OC-Studio）★ 工程化最好

- **定位**：本地优先的原创角色与世界观创作工作台。
- **技术栈**：Next.js 16 + TypeScript + Tailwind v4 + TipTap + **Dexie.js（IndexedDB）** + @xyflow/react + **Tauri v2（桌面）** + **Capacitor v8（安卓）**。
- **数据存储**：IndexedDB 本地。
- **许可**：✅ **MIT**。
- **功能**：角色/事件/国家信息卡（含立绘）；树状世界观百科（`[[` 内链、`@` 引用）；时间线（年/十年/五十年/百年聚合 + 拖拽调整）；关系图谱（6 种关系类型）；块编辑器（斜杠命令、表格、待办）；全局相册（按角色/事件/国家自动聚合）；明暗主题；全局搜索；回收站；`.ocbak` 导入导出（4 种合并策略）。
- **优点**：MIT 可放心参考/复用代码；**多端（Web/桌面/安卓）同构**的打包方式值得学；数据模型（角色/事件/国家 + 关系类型 + 内链）可直接借鉴；明暗主题令牌化做得干净。
- **缺点**：仍是本地单机应用，无服务端、无论坛、无画廊页（相册是自动聚合，不是作品墙）；alpha 阶段。

#### A3. Chronicle Keeper（aronjanosch/chronicle-keeper）

- **定位**：AI 驱动的本地优先跑团世界观工作区（「跑团笔记 → 世界」）。
- **技术栈**：**Rust + Tauri**（桌面应用），前端独立目录，核心 API `ck-serve`（本地 8000 端口）。
- **数据存储**：**纯 Markdown 文件夹**，完全兼容 Obsidian，无厂商锁定。
- **许可**：✅ MIT。
- **功能**：Markdown wiki 页（NPC/地点/阵营/物品/PC/传说）；AI 助手（读世界并代改页面，带权限与撤销）；Atlas 地图钉；Timeline（自定义历法）；关系图（力导向）；Wikilinks + 反向链接 + dataview-lite 查询；多世界（自包含可移植文件夹）。
- **优点**：**「文件即真相 + Markdown + 反向链接 + 双链」**&#x8FD9;套模型对 OC Wiki 极其合适，也是我们推荐架构的底层思路来源；关系图与时间线的实现可参考。
- **缺点**：桌面应用（Tauri），不是网站；AI 部分对我们冗余。


### B 类：角色画廊 / 展示站

#### B1. Sona（sona-fast/sona）★ 画廊与主题系统标杆

- **定位**：可自托管、可 fork 的「fursona 画廊 + 单管理员 CMS」。
- **技术栈**：**SvelteKit（Svelte 5）** + Cloudflare **D1**（SQLite）+ **R2**（对象存储）+ **Drizzle ORM**；Vite / Vitest / Playwright。
- **许可**：✅ **Apache-2.0**。
- **功能**：作品画廊（合集 / 标签 / 画师署名 / NSFW 标记 / 原帖链接）；图片反向搜索找画师；**多套主题（Petal / Pewter / Ember / aurora / terracotta），每套声明完整 dark/light token 集**；无障碍（对比度扫描、焦点环、forced-colors）；i18n（inlang，en/ja）；单管理员后台；RSS。
- **优点**：**主题令牌系统是本方案的直接参考对象**——「主题写成数据文件 → 构建时生成 CSS → 每个 token 组合做对比度校验」这套流程，正好满足「蓝白/黑红 + 低饱和 + 无障碍」的要求；画廊数据模型（作品/标签/画师/合集）可直接抄。
- **缺点**：深度绑定 Cloudflare（Workers/D1/R2/Turnstile），迁移成本高；单管理员，无论坛；内容是兽圈语境，需要改造。

#### B2. AnimaDex（darkalfx/AnimaDex）

- **定位**：自托管的角色/画师参考图库。
- **技术栈**：**Flask + 原生 JS + SQLite**，核心功能零外部依赖。
- **功能**：分面筛选（版权/发色/瞳色/性别）、文本搜索、2×2 拼图缩略图。
- **优点**：极简、易读，**「分面筛选 + SQLite」**&#x8FD9;套对小体量图库够用且好维护。
- **缺点**：图库专用，无 wiki / 故事 / 论坛。

#### B3. OC_demo（UeCook/OC_demo）★ 纯前端视觉参考

- **定位**：个人设定展示站前端 demo（「圣堂之魂」）。
- **技术栈**：**纯原生 HTML / CSS / JS**，零构建。
- **许可**：✅ BSD-3-Clause。
- **功能**：小说阅读器（字号 12–36px、行距三档、进度存 localStorage、键盘翻章）；瀑布流作品墙 + 详情弹窗（含画师/稿件状态/约稿平台）；Bento Grid 关于页；**可拖拽底部导航（三层结构：指示器/导航项/拖拽手柄）**；CSS 变量驱动的亮暗双主题；毛玻璃 + 鼠标跟随聚光灯。
- **优点**：**视觉与交互质感的最佳参考**——低饱和配色、毛玻璃、聚光灯、可拖拽导航，正好对上「美观整齐简单干练」；代码零依赖，容易移植。
- **缺点**：无数据层、无后端、无论坛；数据写死在 JS 文件里。

### C 类：通用 Wiki 引擎（可直接部署，但不够「OC 专用」）

#### C1. Wiki.js（requarks/wiki）

- **定位**：下一代开源 Wiki 引擎。
- **技术栈**：Node.js（后端正迁移到 TypeScript）+ Vue 前端；Postgres / MySQL / SQLite / MSSQL；**AGPL-3.0**。
- **功能**：页面树、用户与细粒度权限、评论、全文搜索、多主题、i18n、Git 同步、博客页。
- **优点**：开箱即用的权限/搜索/多用户；3.3k fork，生态成熟。
- **缺点**：**AGPL**（商用/闭源有约束）；页面模型是通用文档树，**做不出「角色卡 + 关系图 + 画廊」这种 OC 专属形态**；改造成本可能高于自建。

#### C2. Kanka（owlchester/kanka）★ 功能最全的世界观平台

- **定位**：协作式世界构建 + 跑团战役管理。
- **技术栈**：**PHP Laravel + VueJS/jQuery + MySQL/MariaDB + Redis**，Docker 部署，Apache/Nginx。
- **许可**：⚠️ 自称 **「source available」**（源码可见但**非 OSI 开源**，有商业使用限制，需读 LICENSE 确认）。
- **功能**：实体（角色/地点/组织/物品/事件/种族/家族/日志/任务）、关系、时间线、日历、地图、画廊、战役级权限、多用户协作。14.7k commits，月更。
- **优点**：**「batteries included」的终极形态**——想要的多用户/权限/地图/时间线/画廊全都有，成熟度高。
- **缺点**：PHP 技术栈（与前端生态割裂）；**许可证不是标准开源**；体量大、改 UI 成本高；OC 展示的视觉自由度低。

#### C3. 其他可参考

- **BookStack**（PHP/Laravel，书架式文档，MIT）：文档组织方式可借鉴。
- **Outline**（Node + React + Postgres，BSL）：编辑体验好，许可受限。
- **MinoriWiki**：轻量静态 Wiki 生成器。

### D 类：静态站点生成 / OC 目录模板

#### D1. Eleventy OC Directory Template（portfiend）★ 结构最对口

- **定位**：**专为 OC 目录设计的静态站模板**（灵感来自 Toyhouse / Neocities / Dreamwidth）。
- **技术栈**：**Eleventy (11ty)** + Nunjucks/Markdown + Sass；零后端。
- **许可**：✅ **MIT**。
- **功能**：**命名空间（characters / locations / stories… 可自定义）**，新增命名空间自动进侧边栏/标签页/页脚；页面可用 `id` 互链（不依赖 URL）；**标签页小组件（可嵌套）**；**内容警告系统**（首次访问弹窗选择 + `blurred` 短代码 + 成人确认勾选 + 侧栏随时改偏好）；标签页；响应式。
- **优点**：**信息架构（IA）与本需求几乎同构**——「角色 / 地点 / 故事 + 标签 + 互链」就是我们要的世界观百科雏形；内容警告系统对 OC 站很实用；MIT 可放心抄。
- **缺点**：纯静态，无论坛、无账号、无后台；作者自认文档不完善；2024 年后基本停更。

#### D2. 商业产品（非开源，仅作功能与视觉参照）

- **World Anvil**：大而全的世界观 Wiki + 数据库（模板多、时间线强）。
- **LegendKeeper**：现代化、自动连接、地图标注强。
- **Notebook.ai**：结构化世界构建。
- **Toyhouse**：OC 社区标杆（角色页 + 论坛 + 画廊 + 关注）。
- **CharacterHub**：OC 展示社区。

> 商业产品的价值：**Toyhouse 的「角色页 + 画廊 + 论坛」信息架构**就是本需求的社区版终局，值得作为产品参照（尤其论坛形态）。



---

## 3. 横向对比表

| 项目               | 类型       | 技术栈                               | 数据存储            | 许可                  | 多用户/论坛  | 与需求匹配度      |
| ---------------- | -------- | --------------------------------- | --------------- | ------------------- | ------- | ----------- |
| LoreFolio        | OC/世界观工具 | Next.js + Tailwind + xyflow       | localStorage    | ⚠️ 无协议              | ✗ / ✗   | ★★★★★ 功能蓝本  |
| OC Studio        | OC 创作台   | Next.js + Dexie + Tauri/Capacitor | IndexedDB       | ✅ MIT               | ✗ / ✗   | ★★★★☆ 数据模型  |
| Chronicle Keeper | 跑团世界观    | Rust + Tauri                      | Markdown 文件     | ✅ MIT               | ✗ / ✗   | ★★★☆☆ 双链模型  |
| Sona             | 角色画廊 CMS | SvelteKit + D1 + R2               | Cloudflare D1   | ✅ Apache-2.0        | ✗ / ✗   | ★★★★☆ 主题/画廊 |
| AnimaDex         | 图库       | Flask + SQLite                    | SQLite          | ✅                   | ✗ / ✗   | ★★☆☆☆ 分面筛选  |
| OC_demo          | 纯前端展示    | 原生 HTML/CSS/JS                    | 静态 JS           | ✅ BSD-3             | ✗ / ✗   | ★★★★☆ 视觉交互  |
| Wiki.js          | 通用 Wiki  | Node + Vue                        | PG/MySQL/SQLite | ⚠️ AGPL             | ✓ / △评论 | ★★☆☆☆       |
| Kanka            | 世界观平台    | Laravel + Vue + MySQL             | MySQL           | ⚠️ source-available | ✓ / ✓   | ★★★☆☆ 功能全但重 |
| 11ty OC 模板       | 静态 OC 目录 | Eleventy + Nunjucks               | Markdown        | ✅ MIT               | ✗ / ✗   | ★★★★☆ 信息架构  |

---

## 4. 结论与借鉴清单

**没有一个项目能直接拿来用**：最贴近的 LoreFolio / OC Studio 都是**单机本地工具**（无服务端、无论坛）；Kanka 功能最全但**技术栈重 + 许可受限**；静态模板（11ty）结构对口但**没有动态能力**。

所以策略是：**自建主站 + 分模块借鉴**。

| 借鉴对象             | 借鉴内容                                                     |
| ---------------- | -------------------------------------------------------- |
| LoreFolio        | 档案分类体系（角色/地点/组织/物品/事件/种族/世界观）、世界概览页、全局搜索、时间线、关系图谱、导入导出备份 |
| OC Studio        | 数据模型与关系类型、树状百科 + `[[` 内链、`.ocbak` 式备份、多端打包思路             |
| Chronicle Keeper | 「文件即 Markdown + 双链 + 反向链接」的内容模型                          |
| Sona             | **主题令牌系统**（主题→生成 CSS→对比度校验）、画廊数据模型、无障碍规范                 |
| 11ty OC 模板       | 命名空间式信息架构、id 互链、内容警告系统                                   |
| OC_demo          | 视觉质感（低饱和配色、毛玻璃、聚光灯）、阅读器、可拖拽导航                            |

---

## 5. 推荐架构


### 5.1 主推方案：Astro 静态优先 + 论坛可插拔

```
┌─────────────────────────────────────────────────────────┐
│                    访问者 / 作者                          │
└───────────────┬─────────────────────┬───────────────────┘
                │                     │
        ┌───────▼────────┐   ┌────────▼─────────┐
        │  静态内容站     │   │   论坛模块        │
        │  (Astro SSG)   │   │  (独立服务)       │
        │                │   │                  │
        │ 总览 / 世界观   │   │ 板块 / 帖子 / 回帖 │
        │ 人物 / 画廊     │   │ 账号 / 权限       │
        │ 故事收录        │   │                  │
        └───────┬────────┘   └────────┬─────────┘
                │                     │
     ┌──────────▼──────────┐  ┌───────▼─────────┐
     │  内容源（Git 仓库）   │  │  数据库 / BaaS   │
     │  Markdown + YAML    │  │  SQLite / D1    │
     │  图片资源            │  │  / Supabase     │
     └──────────┬──────────┘  └───────┬─────────┘
                │                     │
        ┌───────▼─────────────────────▼─────────┐
        │  部署：Cloudflare Pages / Vercel       │
        │        / Netlify / GitHub Pages        │
        └───────────────────────────────────────┘
```

**为什么是 Astro 而不是 Next.js（作为主站）**

- 内容型站点为主 → Astro 的 **Islands 架构**默认输出零 JS，首屏最快、SEO 最好。
- **Content Collections** 内置 Zod 类型校验，人物/世界观/故事/画廊的结构化数据可以做到「写错字段直接构建失败」，非常契合固定结构的档案。
- 需要交互的地方（关系图谱、灯箱、筛选、搜索）按需挂 React/Vue/Svelte 岛屿即可，**不牺牲生态**。
- 主题令牌系统用 CSS 变量实现，天然与 Astro 的静态输出契合。
- 部署面广，静态产物可托管在任意平台（含国内静态托管）。

**备选：Next.js（App Router）** —— 若最终确认「论坛是核心 + 需要统一登录 + 需要网页后台」，则改用 Next.js 全栈（Server Actions + Drizzle + Postgres/SQLite + Auth.js），主站与论坛共用一个应用。

**备选：SvelteKit** —— 若偏好更轻的运行时与 Sona 式实现，可选 SvelteKit。

### 5.2 论坛的三种形态（对应 §11 的决策点）

| 形态             | 实现                                                        | 成本 | 适用                    |
| -------------- | --------------------------------------------------------- | -- | --------------------- |
| **轻量讨论**（推荐起步） | Waline / Twikoo / Artalk 自托管，或 Giscus（GitHub Discussions） | 极低 | 只需「文章下能评论/留言」，不需要账号体系 |
| **半自建论坛**      | 独立后端（Cloudflare Workers + D1，或 Supabase）+ 自研板块/帖子 UI      | 中  | 需要板块、发帖、回帖，但用户量小      |
| **成熟论坛系统**     | 部署 Flarum / Discourse，与主站做导航互通（单点登录可选）                    | 中高 | 要真正的社区（账号、权限、版主、通知）   |

---

## 6. 技术选型（主推方案）

| 层    | 选型                                                                    | 说明                          |
| ---- | --------------------------------------------------------------------- | --------------------------- |
| 框架   | **Astro 5**                                                           | 静态优先，支持 React/Vue/Svelte 岛屿 |
| 语言   | **TypeScript**                                                        | 全站类型安全                      |
| 内容   | **Astro Content Collections**（Markdown + YAML frontmatter，Zod schema） | 人物/世界观/故事/画廊均为内容集合          |
| 样式   | **Tailwind CSS v4** + **CSS 变量设计令牌**                                  | 令牌驱动主题，Tailwind 负责布局与原子样式   |
| 交互岛屿 | **React**（或 Svelte）                                                   | 关系图谱、灯箱、筛选、搜索               |
| 关系图谱 | **@xyflow/react**（React Flow）                                         | 与 LoreFolio / OC Studio 同款  |
| 富文本  | **TipTap**（若需网页端编辑）                                                   | 第一阶段可先用 Markdown            |
| 搜索   | **Pagefind**（静态全文搜索，零后端）                                              | 构建时索引，纯前端搜索                 |
| 图片   | Astro 内置 `astro:assets`（Sharp）                                        | 自动压缩 / 响应式 / 缩略图            |
| 主题   | 自研令牌系统（见 §9）                                                          | 蓝白 / 黑红 / 明暗                |
| 论坛   | Waline / Twikoo（起步）→ 独立后端（升级）                                         | 见 §5.2                      |
| 部署   | Cloudflare Pages（或 Vercel / Netlify）                                  | 免费额度足够                      |

---

## 7. 信息架构（IA）与页面设计

### 7.1 站点结构

```
/                       总览（首页）      —— 世界观一句话简介、板块入口、精选角色、最新作品、统计
/world                  世界观           —— 词条树 / 分类导航 + 词条详情
/world/[slug]           世界观词条详情
/characters             人物档案列表     —— 卡片网格 + 标签/组织/种族筛选
/characters/[slug]      人物详情         —— 立绘 + 信息卡 + 关系图 + 关联画廊/故事
/gallery                画廊             —— 瀑布流 / 网格 + 分类筛选 + 灯箱
/stories                故事收录列表     —— 封面卡 + 标签 + 状态
/stories/[slug]         故事阅读         —— 沉浸式阅读器（字号/行距/进度）
/forum                  论坛             —— 板块列表（或嵌入）
/forum/[board]          板块
/forum/topic/[id]       帖子
/about                  关于（可选）
```

### 7.2 各页面要点

- **总览**：参考 LoreFolio 的「世界概览」——条目数量统计、最近更新、精选/置顶、热门标签、时间线摘要。视觉上做一个有辨识度的 Hero（世界观一句话 + 主视觉）。
- **世界观**：左侧树状/分类导航，右侧词条正文；正文支持 `[[角色名]]`、`[[地点名]]` 内链与反向链接（「哪些条目提到了它」）。
- **人物档案**：卡片列表（立绘 + 名字 + 一句话 + 标签）→ 详情页（信息卡 + 分段正文 + 关系图谱 + 关联画廊/故事）。
- **画廊**：瀑布流或等高网格，分类/标签/画师筛选，点击开灯箱（支持左右切换、键盘、缩略图条）。参考 OC_demo 的详情弹窗与 AnimaDex 的分面筛选。
- **故事收录**：列表卡片（封面/标题/摘要/标签/状态/字数）→ 阅读页（固定顶部工具栏 + 目录抽屉 + 悬浮设置面板：字号 12–36px、行距三档、明暗切换；进度存 localStorage）。
- **论坛**：按 §5.2 选型落地。

### 7.3 全局组件

顶部导航（板块切换 + 主题切换 + 搜索）· 底部页脚 · 全局搜索（`Ctrl/Cmd + K`，Pagefind 驱动）· 面包屑 · 标签页组件（可嵌套，参考 11ty 模板）· 内容警告（对敏感 OC 内容可 blur + 确认）· 回到顶部。

---

## 8. 数据模型（草案）


### 8.1 核心实体

```ts
// 人物档案
Character {
  id, slug, name, aliases[], avatar, portrait[],       // 立绘
  gender, age, birthday, species, height,
  affiliation: OrganizationId[],                       // 所属组织
  residence: LocationId[],                             // 常驻地点
  status,                                              // 状态：在世/已故/未知
  tagline,                                             // 一句话/代表台词
  appearance, personality, abilities, goals,           // 正文段落
  backstory,                                           // 背景故事
  tags[], relations: Relation[],                       // 关系
  galleryIds[], storyIds[], eventIds[],
  createdAt, updatedAt, featured
}

// 世界观词条（树状）
LoreEntry {
  id, slug, title,
  category,          // 地理/历史/体系/种族/组织/术语
  parentId,          // 树状层级
  content,           // Markdown 富文本
  refs: (CharacterId | LoreEntryId)[],   // 交叉引用
  tags[], cover
}

// 地点 / 组织 / 物品 / 事件 / 种族（结构类似，按需扩展）
Location { id, slug, name, category, status, atmosphere, landmarks, history, parentId, orgId, coords }
Organization { id, slug, name, type, status, ideology, structure, influence, history, parentId, hqLocationId }
Item { id, slug, name, type, status, appearance, function, material, origin, holderId, locationId, orgId }
Event { id, slug, name, type, status, era, dateRange, locationId, orgIds[], characterIds[], itemIds[], cause, process, result, impact, order }
Species { id, slug, name, category, habitat, orgIds[], characterIds[], appearance, physiology, abilities, culture, history }

// 画廊作品
Artwork {
  id, title, image, thumbnails[], artist, category,
  status,            // 常稿/买断/商用/私人
  platform,          // 约稿平台
  description, date, tags[],
  characterIds[], pinned
}

// 故事
Story {
  id, slug, title, cover, summary, tags[], status,
  characterIds[], chapters: Chapter[], wordCount, updatedAt
}
Chapter { id, title, content, order }

// 关系（驱动关系图谱）
Relation { fromId, toId, type, note }   // type: 亲缘/敌对/同盟/师承/恋人/上下级…

// 论坛（形态确定后细化）
Board { id, name, description, order }
Topic { id, boardId, title, authorId, createdAt, pinned, locked }
Post  { id, topicId, authorId, content, createdAt }
```

### 8.2 内容组织方式（文件即内容）

```
src/content/
  characters/     alice.md, bob.md ...
  world/          geography/xxx.md, history/xxx.md ...
  locations/      ...
  organizations/  ...
  items/          ...
  events/         ...
  species/        ...
  gallery/        artwork-001.md ...
  stories/        story-a/  (封面 + 章节 md)
public/images/    characters/ gallery/ stories/ ...
```

每个 md 的 frontmatter 即上表字段，Zod schema 校验；正文即富文本段落。

---

## 9. 主题系统设计（重点）

需求是「蓝白 / 黑红等，低饱和、美观整齐简单干练」。做法参考 Sona：**主题写成数据 → 构建时生成 CSS → 每套主题声明完整 token 集 → 对比度校验**。

### 9.1 令牌分层

```
原始色板 (palette)  →  语义令牌 (semantic)  →  组件令牌 (component)
--blue-500              --color-bg               --nav-bg
--red-600               --color-surface          --card-bg
                        --color-text             --button-primary-bg
                        --color-text-muted
                        --color-border
                        --color-accent
```

主题切换只改语义层映射，组件层不感知主题。

### 9.2 低饱和配色示例

**蓝白（低饱和冷调）**

| 令牌                    | 亮色            | 暗色        |
| --------------------- | ------------- | --------- |
| `--color-bg`          | `#F7F8FA`     | `#12151A` |
| `--color-surface`     | `#FFFFFF`     | `#1A1E25` |
| `--color-text`        | `#1F2430`     | `#E8EAEE` |
| `--color-text-muted`  | `#6B7280`     | `#98A0AE` |
| `--color-border`      | `#E5E7EB`     | `#2A3039` |
| `--color-accent`      | `#5B7FA6`（雾蓝） | `#7C9DBE` |
| `--color-accent-soft` | `#EAF0F6`     | `#1E2833` |

**黑红（低饱和暖调）**

| 令牌                    | 亮色            | 暗色        |
| --------------------- | ------------- | --------- |
| `--color-bg`          | `#F6F3F1`     | `#141110` |
| `--color-surface`     | `#FFFFFF`     | `#1F1A18` |
| `--color-text`        | `#221C19`     | `#EDE8E4` |
| `--color-text-muted`  | `#7A6E67`     | `#A2958C` |
| `--color-border`      | `#E8E1DC`     | `#302824` |
| `--color-accent`      | `#A6474A`（暗绛） | `#C25F62` |
| `--color-accent-soft` | `#F3E7E7`     | `#2A1E1E` |

> 说明：强调色刻意压低饱和度（雾蓝 / 暗绛），避免大面积高饱和造成的廉价感；正文用近黑而非纯黑（`#1F2430` 而非 `#000`），暗色背景用带色相偏移的深色而非纯黑，整体更「柔和耐看」。

### 9.3 实现

- `src/themes/blue-white.ts`、`src/themes/black-red.ts` → 构建脚本生成 `generated.css`（`:root[data-theme="blue-white"] { ... }`）。
- `<html data-theme="...">` 切换；`prefers-color-scheme` 决定默认明暗。
- 用户选择存 `localStorage`，并在 `<head>` 内联脚本提前应用，避免闪烁（FOUC）。
- 构建时对每套主题做**对比度校验**（正文 ≥ 4.5:1，控件边界 ≥ 3:1），不达标直接报错。
- 视觉细节（借鉴 OC_demo）：`border-radius` 统一令牌（如 12/16/24px）、克制的毛玻璃（`backdrop-filter: blur()` 仅用于导航与弹窗）、统一缓动曲线。

---

## 10. 实施路线图

> 每个里程碑结束都有可运行的产物，可随时叫停或调整。

**M1 · 骨架与主题（打地基）**

- Astro 项目初始化 + TypeScript + Tailwind v4
- 内容集合 schema（先做 Character + LoreEntry）
- 全站布局：顶部导航、页脚、面包屑、响应式断点
- **主题令牌系统落地**：蓝白 / 黑红 × 明暗，主题切换 + 记忆 + 防闪烁
- **总览页** + **人物档案列表/详情页**（打通「内容 → 页面」全链路）

**M2 · 内容页补全**

- 世界观百科（树状导航 + 内链 + 反向链接）
- 画廊（瀑布流 + 筛选 + 灯箱 + 图片优化）
- 故事收录（列表 + 沉浸式阅读器 + 进度）
- 关系图谱（React Flow）
- 全局搜索（Pagefind）+ `Ctrl/Cmd+K`
- 补充档案类型（地点/组织/物品/事件/种族）

**M3 · 论坛与发布**

- 论坛模块（按 §11 选定形态落地）
- 内容管理方式（Markdown 工作流 或 网页后台）
- SEO / 站点地图 / RSS
- 部署上线（自定义域名）

---

## 11. 需要拍板的决策点

以下四点会**实质影响架构**，确认后即可开工：

1. **论坛形态**：轻量讨论（评论/留言，Waline/Twikoo/Giscus）｜半自建（板块+发帖+回帖）｜成熟系统（Flarum/Discourse）？
2. **作者是谁**：只有你一人写（可接受改 Markdown 文件）｜多人协作（需要网页后台 + 账号）？
3. **是否多用户**：纯展示（访客只读）｜需要注册登录/收藏/评论？
4. **部署目标**：公网（有域名，需考虑国内备案）｜仅本地/内网自用？

> 我的默认建议：**M1–M2 先做「单人作者 + 纯展示 + 静态部署」，论坛在 M3 用轻量讨论方案起步**，把复杂度留到确认真的需要时再加。这样能最快看到成品，也最省事。

---

## 12. 风险与取舍

| 风险       | 说明                  | 应对                              |
| -------- | ------------------- | ------------------------------- |
| 论坛拉高复杂度  | 一旦要账号/权限/版主，静态方案就不够 | 论坛解耦、分期实施，先轻后重                  |
| 主题越多维护越贵 | 每套主题都要过对比度校验        | 令牌分层，组件只认语义令牌                   |
| 内容结构频繁变  | 档案字段可能反复调整          | Zod schema 集中定义，改一处全站生效         |
| 图片体积     | 画廊/立绘易拖慢站点          | `astro:assets` 自动压缩 + 响应式 + 懒加载 |
| 中文全文搜索   | Pagefind 对中文分词一般    | 中文场景可换 FlexSearch / 自建简易索引      |
| 国内访问     | 部分托管平台访问不稳          | 优先选可国内直连的静态托管                   |



---

## 附录：调研来源

- LoreFolio — <https://github.com/SQHYxhr/LoreFolio>
- OC Studio — <https://github.com/Pokanshuu/OC-Studio>
- Chronicle Keeper — <https://github.com/aronjanosch/chronicle-keeper>
- Sona — <https://github.com/sona-fast/sona>
- AnimaDex — <https://github.com/darkalfx/AnimaDex>
- OC_demo — <https://github.com/UeCook/OC_demo>
- Wiki.js — <https://github.com/requarks/wiki>
- Kanka — <https://github.com/owlchester/kanka>
- Eleventy OC Directory Template — <https://github.com/portfiend/eleventy-oc-directory-template>
