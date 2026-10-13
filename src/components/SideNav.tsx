import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  BookOpen,
  Clock,
  Globe2,
  Images,
  MessagesSquare,
  Network,
  Users,
} from 'lucide-react'
import { db } from '@/lib/db'
import { GALLERY_CATEGORIES, STORY_STATUS, WORLD_CATEGORIES } from '@/lib/types'
import { avatarUrl } from '@/lib/placeholder'

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-1.5 px-2 text-[11px] font-medium tracking-wide text-subtle">
        {title}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

const itemCls = (active: boolean) =>
  `flex items-center gap-2 rounded-[8px] px-2 py-1.5 text-[12.5px] transition-colors ${
    active
      ? 'bg-accent-soft font-medium text-accent'
      : 'text-muted hover:bg-sunken hover:text-fg'
  }`

function SideLink({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string
  label: string
  icon?: React.ComponentType<{ size?: number }>
  end?: boolean
}) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => itemCls(isActive)}>
      {Icon ? <Icon size={13} /> : null}
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

function SideFilter({
  label,
  count,
  active,
  to,
}: {
  label: string
  count?: number
  active: boolean
  to: string
}) {
  return (
    <Link to={to} className={`${itemCls(active)} justify-between`}>
      <span className="truncate">{label}</span>
      {count !== undefined ? (
        <span className="shrink-0 text-[11px] text-subtle">{count}</span>
      ) : null}
    </Link>
  )
}

function SideEntity({
  to,
  name,
  avatar,
  color,
  sub,
  end,
}: {
  to: string
  name: string
  avatar?: string
  color?: string
  sub?: string
  end?: boolean
}) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => itemCls(isActive)}>
      <img
        src={avatar || avatarUrl(name, color)}
        alt=""
        className="h-5 w-5 shrink-0 rounded-full border border-line object-cover"
      />
      <span className="min-w-0 flex-1 truncate">{name}</span>
      {sub ? <span className="shrink-0 text-[10.5px] text-subtle">{sub}</span> : null}
    </NavLink>
  )
}

/* ---------------- 各板块的侧边导航 ---------------- */

function OverviewSide() {
  const counts = {
    characters: useLiveQuery(() => db.characters.count(), []) ?? 0,
    world: useLiveQuery(() => db.worldEntries.count(), []) ?? 0,
    events: useLiveQuery(() => db.events.count(), []) ?? 0,
    gallery: useLiveQuery(() => db.gallery.count(), []) ?? 0,
    stories: useLiveQuery(() => db.stories.count(), []) ?? 0,
    posts: useLiveQuery(() => db.posts.count(), []) ?? 0,
  }
  const characters = useLiveQuery(() => db.characters.toArray(), []) ?? []

  return (
    <>
      <Group title="内容速览">
        <SideFilter label="人物档案" count={counts.characters} active={false} to="/characters" />
        <SideFilter label="世界观词条" count={counts.world} active={false} to="/world" />
        <SideFilter label="事件" count={counts.events} active={false} to="/world/timeline" />
        <SideFilter label="画廊" count={counts.gallery} active={false} to="/gallery" />
        <SideFilter label="故事收录" count={counts.stories} active={false} to="/stories" />
        <SideFilter label="论坛帖子" count={counts.posts} active={false} to="/forum" />
      </Group>

      {characters.length ? (
        <Group title="人物速览">
          {characters.slice(0, 12).map((c) => (
            <SideEntity
              key={c.id}
              to={`/characters/${c.id}`}
              name={c.name}
              avatar={c.avatar}
              color={c.color}
            />
          ))}
        </Group>
      ) : null}
    </>
  )
}

function WorldSide() {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const cat = params.get('cat')

  const entries = useLiveQuery(() => db.worldEntries.toArray(), []) ?? []
  const counts: Record<string, number> = {}
  entries.forEach((e) => (counts[e.category] = (counts[e.category] || 0) + 1))
  const present = Array.from(new Set(entries.map((e) => e.category)))
  const ordered = [
    ...(WORLD_CATEGORIES.filter((c) => present.includes(c)) as string[]),
    ...present.filter((c) => !(WORLD_CATEGORIES as readonly string[]).includes(c)),
  ]

  const onTimeline = pathname.startsWith('/world/timeline')

  return (
    <>
      <Group title="世界观">
        <SideLink to="/world" label="词条百科" icon={Globe2} end />
        <SideLink to="/world/timeline" label="时间线" icon={Clock} />
      </Group>

      {!onTimeline ? (
        <Group title="词条分类">
          <SideFilter
            label="全部分类"
            count={entries.length}
            active={!cat}
            to="/world"
          />
          {ordered.map((c) => (
            <SideFilter
              key={c}
              label={c}
              count={counts[c]}
              active={cat === c}
              to={`/world?cat=${encodeURIComponent(c)}`}
            />
          ))}
        </Group>
      ) : (
        <Group title="时间线">
          <div className="px-2 text-[11.5px] leading-[1.7] text-subtle">
            按纪年排序。点击事件卡片可展开详情。
          </div>
        </Group>
      )}
    </>
  )
}

function CharacterSide() {
  const characters = useLiveQuery(() => db.characters.toArray(), []) ?? []
  const sorted = [...characters].sort((a, b) =>
    a.name.localeCompare(b.name, 'zh-Hans-CN')
  )

  return (
    <>
      <Group title="人物档案">
        <SideLink to="/characters" label="档案列表" icon={Users} end />
        <SideLink to="/characters/graph" label="关系图" icon={Network} />
      </Group>

      {sorted.length ? (
        <Group title={`角色 · ${sorted.length}`}>
          {sorted.map((c) => (
            <SideEntity
              key={c.id}
              to={`/characters/${c.id}`}
              name={c.name}
              avatar={c.avatar}
              color={c.color}
              sub={c.alias}
            />
          ))}
        </Group>
      ) : null}
    </>
  )
}

function GallerySide() {
  const [params] = useSearchParams()
  const cat = params.get('cat')
  const char = params.get('char')

  const items = useLiveQuery(() => db.gallery.toArray(), []) ?? []
  const characters = useLiveQuery(() => db.characters.toArray(), []) ?? []

  const counts: Record<string, number> = {}
  items.forEach((i) => {
    if (i.category) counts[i.category] = (counts[i.category] || 0) + 1
  })

  const withChar = characters.filter((c) =>
    items.some((i) => i.characterIds.includes(c.id))
  )

  const q = (next: { cat?: string | null; char?: string | null }) => {
    const p = new URLSearchParams()
    const nc = next.cat !== undefined ? next.cat : cat
    const nch = next.char !== undefined ? next.char : char
    if (nc) p.set('cat', nc)
    if (nch) p.set('char', nch)
    const s = p.toString()
    return `/gallery${s ? '?' + s : ''}`
  }

  return (
    <>
      <Group title="作品分类">
        <SideFilter
          label="全部"
          count={items.length}
          active={!cat}
          to={q({ cat: null })}
        />
        {GALLERY_CATEGORIES.map((c) => (
          <SideFilter
            key={c}
            label={c}
            count={counts[c] || 0}
            active={cat === c}
            to={q({ cat: cat === c ? null : c })}
          />
        ))}
      </Group>

      {withChar.length ? (
        <Group title="按角色">
          <SideFilter
            label="全部角色"
            active={!char}
            to={q({ char: null })}
          />
          {withChar.map((c) => (
            <SideFilter
              key={c.id}
              label={c.name}
              count={items.filter((i) => i.characterIds.includes(c.id)).length}
              active={char === c.id}
              to={q({ char: char === c.id ? null : c.id })}
            />
          ))}
        </Group>
      ) : null}
    </>
  )
}

function StorySide() {
  const [params] = useSearchParams()
  const status = params.get('status')
  const world = params.get('world')

  const stories = useLiveQuery(() => db.stories.toArray(), []) ?? []
  const worldEntries = useLiveQuery(() => db.worldEntries.toArray(), []) ?? []
  const sorted = [...stories].sort((a, b) => b.updatedAt - a.updatedAt)

  /** 生成「只改一个筛选维度、其余保持」的链接 */
  const link = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null) p.delete(k)
      else p.set(k, v)
    })
    const qs = p.toString()
    return `/stories${qs ? `?${qs}` : ''}`
  }

  const statusCounts: Record<string, number> = {}
  stories.forEach((s) => {
    const k = s.status || '未标注'
    statusCounts[k] = (statusCounts[k] || 0) + 1
  })

  const worldCounts: Record<string, number> = {}
  stories.forEach((s) => {
    if (s.worldId) worldCounts[s.worldId] = (worldCounts[s.worldId] || 0) + 1
  })
  const usedWorlds = worldEntries
    .filter((w) => worldCounts[w.id])
    .sort((a, b) => (worldCounts[b.id] || 0) - (worldCounts[a.id] || 0))

  return (
    <>
      <Group title="状态">
        <SideFilter
          label="全部"
          count={stories.length}
          active={!status}
          to={link({ status: null })}
        />
        {STORY_STATUS.map((s) => (
          <SideFilter
            key={s}
            label={s}
            count={statusCounts[s] || 0}
            active={status === s}
            to={link({ status: s })}
          />
        ))}
      </Group>

      <Group title="世界观">
        <SideFilter label="全部" active={!world} to={link({ world: null })} />
        {usedWorlds.length ? (
          usedWorlds.map((w) => (
            <SideFilter
              key={w.id}
              label={w.title}
              count={worldCounts[w.id]}
              active={world === w.id}
              to={link({ world: w.id })}
            />
          ))
        ) : (
          <div className="px-2 py-1 text-[11.5px] text-subtle">尚未关联</div>
        )}
      </Group>

      {sorted.length ? (
        <Group title={`故事 · ${sorted.length}`}>
          {sorted.map((s) => (
            <SideLink key={s.id} to={`/stories/${s.id}`} label={s.title} icon={BookOpen} />
          ))}
        </Group>
      ) : null}
    </>
  )
}

function ForumSide() {
  const [params] = useSearchParams()
  const boardId = params.get('board')

  const boards = useLiveQuery(() => db.boards.orderBy('order').toArray(), []) ?? []
  const posts = useLiveQuery(() => db.posts.toArray(), []) ?? []

  const counts: Record<string, number> = {}
  posts.forEach((p) => (counts[p.boardId] = (counts[p.boardId] || 0) + 1))

  return (
    <Group title="板块">
      <SideFilter label="全部帖子" count={posts.length} active={!boardId} to="/forum" />
      {boards.map((b) => (
        <SideFilter
          key={b.id}
          label={b.name}
          count={counts[b.id] || 0}
          active={boardId === b.id}
          to={`/forum?board=${b.id}`}
        />
      ))}
    </Group>
  )
}

function SettingsSide() {
  const anchors = [
    ['site', '站点信息'],
    ['theme', '外观主题'],
    ['data', '数据与备份'],
    ['about', '关于'],
  ]
  return (
    <Group title="设置">
      {anchors.map(([id, label]) => (
        <button
          key={id}
          onClick={() =>
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
          className={`${itemCls(false)} text-left`}
        >
          {label}
        </button>
      ))}
      <div className="px-2 pt-2 text-[11px] leading-[1.7] text-subtle">
        数据保存在本机浏览器，请定期导出备份。
      </div>
    </Group>
  )
}

export default function SideNav() {
  const { pathname } = useLocation()

  if (pathname.startsWith('/world')) return <WorldSide />
  if (pathname.startsWith('/characters')) return <CharacterSide />
  if (pathname.startsWith('/gallery')) return <GallerySide />
  if (pathname.startsWith('/stories')) return <StorySide />
  if (pathname.startsWith('/forum')) return <ForumSide />
  if (pathname.startsWith('/settings')) return <SettingsSide />
  return <OverviewSide />
}
