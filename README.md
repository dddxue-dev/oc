# OC Archive · 原创角色档案馆

本地优先的原创角色（OC）记录站。**所有数据保存在你自己的浏览器里（IndexedDB），不上传任何服务器。**

## 板块

| 板块 | 路由 | 说明 |
| --- | --- | --- |
| 总览 | `/` | 统计、最近更新、人物速览、最新帖子 |
| 世界观 | `/world` | 树状词条百科，支持 `[[词条名]]` 内链与反向链接 |
| 世界观 · 时间线 | `/world/timeline` | 基于事件，支持自定义纪年与负数年份 |
| 人物档案 | `/characters` | 角色卡：外貌 / 性格 / 能力 / 目标 / 台词 / 背景故事 |
| 人物档案 · 关系图 | `/characters/graph` | 拖拽节点、手动连线、位置持久化 |
| 论坛 | `/forum` | 板块 + 帖子 + 回复，**发帖时可选择以某个 OC 的身份发言** |
| 画廊 | `/gallery` | 瀑布流 + 灯箱，可关联角色、标注画师 |
| 故事收录 | `/stories` | 列表 + 阅读页，Markdown 排版；每篇可关联**所属世界观**，并可按**状态 / 世界观**筛选 |
| 设置 | `/settings` | 站点信息、主题、数据导入导出 |

### 筛选状态与 URL 同步

侧边栏的每个筛选项都会写进 URL，刷新、回退、分享都保持一致：

- 世界观词条 → `/world?cat=地理`
- 画廊 → `/gallery?cat=插画`、`/gallery?char=<角色id>`
- 故事收录 → `/stories?status=草稿`、`/stories?world=<词条id>`
- 论坛 → `/forum?board=<板块id>`

多个维度可以叠加（如「连载中 + 灰烬海」），点击某个维度的「全部」只清该维度，其余保留。

## 快速开始

```bash
npm install
npm run dev        # http://localhost:5273
```

首次打开会自动写入一份内置示例世界（「灰烬纪」），可直接修改或清空。

```bash
npm run build      # 类型检查 + 打包到 dist/
npm run preview    # 预览打包结果
```

打包产物是纯静态文件，直接双击 `dist/index.html` 也能用（路由用的是 HashRouter）。

## 外观主题

侧边栏底部或「设置 → 外观主题」可切换，共 **8 套低饱和配色**：

蓝白 · 黑红 · 墨绿 · 藤紫 · 琥珀 · 青瓷 · 藕荷 · 石墨

每套都自动派生浅色 / 深色两版令牌，选择会保存在 `localStorage`。

新增一套配色只需在 `src/styles/theme.css` 里加两条规则（浅色 + 深色），各写 5 个种子色：

```css
[data-theme='yourname'] {
  --seed-accent: #5b7fa6;
  --seed-bg: #f6f7f9;
  --seed-surface: #ffffff;
  --seed-ink: #1f2430;
  --seed-line: #e4e7ec;
}
[data-theme='yourname'].dark { /* 同上 5 个，换成深色值 */ }
```

其余令牌（`--c-muted`、`--c-accent-soft` 等）全部由 `color-mix()` 推导，不用手写。
别忘了在 `src/lib/theme.tsx` 的 `PRESETS` 里登记，才会出现在选择器中。

## 技术栈

- **Vite 7 + React 19 + TypeScript**
- **Tailwind CSS v4**（CSS-first，令牌走 CSS 变量）
- **React Router 7**（HashRouter，静态部署免配置）
- **Dexie 4**（IndexedDB）+ `dexie-react-hooks`
- **@xyflow/react**（关系图）
- **lucide-react**（图标）

没有后端、没有账号体系、没有网络请求（占位图也是本地生成的 SVG）。

## 数据安全

数据在浏览器里，以下操作会丢数据：

- 清除浏览器数据 / 缓存 / 站点数据
- 换浏览器、换设备、无痕模式

**请定期在「设置」里导出 JSON 备份。** 备份包含全部角色、词条、事件、画廊、故事、板块、帖子与关系连线。

## 正文支持的语法

Markdown 子集：`## 标题`、`**加粗**`、`*斜体*`、`- 列表`、`1. 有序列表`、`> 引用`、`` `行内代码` ``、`---` 分隔线、`[文字](链接)`。

额外支持 `[[词条名]]` 内链——会优先匹配世界观词条，其次匹配角色名，命中即生成跳转链接。

## 目录结构

```
src/
├── components/       通用组件（布局、编辑器、搜索面板、UI 原子）
├── lib/              数据层与工具
│   ├── db.ts         Dexie 表结构
│   ├── types.ts      实体类型定义
│   ├── seed.ts       内置示例数据
│   ├── backup.ts     JSON 导入导出
│   ├── theme.tsx     主题上下文（8 套配色）
│   ├── markdown.ts   极简 Markdown 渲染
│   └── placeholder.ts 本地 SVG 占位图生成
├── pages/            九个页面
└── styles/theme.css  设计令牌 + 组件类
```
