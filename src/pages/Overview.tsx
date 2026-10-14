import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  ArrowRight,
  BookOpen,
  Globe2,
  Images,
  MessagesSquare,
  Users,
} from 'lucide-react'
import { db } from '@/lib/db'
import { useWorld } from '@/lib/world'
import { avatarUrl } from '@/lib/placeholder'
import { plainText } from '@/lib/markdown'
import { Avatar, Chips, PageHeader, StatCard } from '@/components/ui'

function relTime(ts: number) {
  const d = Date.now() - ts
  const day = Math.floor(d / 86400000)
  if (day <= 0) return '今天'
  if (day === 1) return '昨天'
  if (day < 30) return `${day} 天前`
  if (day < 365) return `${Math.floor(day / 30)} 个月前`
  return `${Math.floor(day / 365)} 年前`
}

export default function Overview() {
  const nav = useNavigate()
  const { worldId, world: meta } = useWorld()

  const characters =
    useLiveQuery(
      () => db.characters.where('worldId').equals(worldId).toArray(),
      [worldId]
    ) ?? []
  const world =
    useLiveQuery(
      () => db.worldEntries.where('worldId').equals(worldId).toArray(),
      [worldId]
    ) ?? []
  const events =
    useLiveQuery(() => db.events.where('worldId').equals(worldId).toArray(), [
      worldId,
    ]) ?? []
  const gallery =
    useLiveQuery(() => db.gallery.where('worldId').equals(worldId).toArray(), [
      worldId,
    ]) ?? []
  const stories =
    useLiveQuery(() => db.stories.where('worldId').equals(worldId).toArray(), [
      worldId,
    ]) ?? []
  const posts =
    useLiveQuery(() => db.posts.where('worldId').equals(worldId).toArray(), [
      worldId,
    ]) ?? []

  const recent = useMemo(() => {
    const rows: { ts: number; title: string; kind: string; sub: string; href: string }[] = []
    characters.forEach((c) =>
      rows.push({
        ts: c.updatedAt,
        title: c.name,
        kind: '人物',
        sub: [c.alias, c.species].filter(Boolean).join(' · '),
        href: `/characters/${c.id}`,
      })
    )
    world.forEach((w) =>
      rows.push({
        ts: w.updatedAt,
        title: w.title,
        kind: '词条',
        sub: `${w.category} · ${plainText(w.summary || w.content || '', 40)}`,
        href: `/world/${w.id}`,
      })
    )
    events.forEach((e) =>
      rows.push({
        ts: e.updatedAt,
        title: e.title,
        kind: '事件',
        sub: `${e.era || ''} ${e.year} 年`,
        href: `/world/timeline?focus=${e.id}`,
      })
    )
    stories.forEach((s) =>
      rows.push({
        ts: s.updatedAt,
        title: s.title,
        kind: '故事',
        sub: s.summary || '',
        href: `/stories/${s.id}`,
      })
    )
    gallery.forEach((g) =>
      rows.push({
        ts: g.createdAt,
        title: g.title,
        kind: '画廊',
        sub: [g.artist, g.category].filter(Boolean).join(' · '),
        href: `/gallery?focus=${g.id}`,
      })
    )
    posts.forEach((p) =>
      rows.push({
        ts: p.updatedAt,
        title: p.title,
        kind: '帖子',
        sub: `${p.authorName} · ${p.replies.length} 条回复`,
        href: `/forum/post/${p.id}`,
      })
    )
    return rows.sort((a, b) => b.ts - a.ts).slice(0, 8)
  }, [characters, world, events, stories, gallery, posts])

  const latestPosts = useMemo(
    () => [...posts].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3),
    [posts]
  )

  const quick = [
    { to: '/world', label: '世界观', icon: Globe2, hint: `${world.length} 条词条` },
    {
      to: '/characters',
      label: '人物档案',
      icon: Users,
      hint: `${characters.length} 位角色`,
    },
    { to: '/gallery', label: '画廊', icon: Images, hint: `${gallery.length} 幅作品` },
    { to: '/stories', label: '故事收录', icon: BookOpen, hint: `${stories.length} 篇` },
  ]

  return (
    <div>
      <PageHeader
        title={meta?.name ?? '未命名世界观'}
        subtitle={
          [meta?.era, meta?.tagline].filter(Boolean).join(' · ') ||
          '本地优先的原创角色档案 · 所有数据仅保存在本机'
        }
      />

      {meta?.intro || meta?.tagline ? (
        <div className="card card-pad mb-5">
          <div className="mb-1.5 text-[12px] font-medium text-muted">世界简介</div>
          <p className="max-w-[760px] text-[14px] leading-[1.85]">
            {meta?.intro || meta?.tagline}
          </p>
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="人物档案"
          value={characters.length}
          onClick={() => nav('/characters')}
        />
        <StatCard label="世界观词条" value={world.length} onClick={() => nav('/world')} />
        <StatCard
          label="事件"
          value={events.length}
          onClick={() => nav('/world/timeline')}
        />
        <StatCard label="画廊" value={gallery.length} onClick={() => nav('/gallery')} />
        <StatCard label="故事" value={stories.length} onClick={() => nav('/stories')} />
        <StatCard label="帖子" value={posts.length} onClick={() => nav('/forum')} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <section>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-[14px] font-medium">最近更新</h2>
            <span className="text-[11.5px] text-subtle">按修改时间</span>
          </div>
          <div className="card divide-y divide-line overflow-hidden">
            {recent.length === 0 ? (
              <div className="px-4 py-8 text-center text-[13px] text-muted">
                还没有任何记录
              </div>
            ) : (
              recent.map((r, i) => (
                <Link
                  key={i}
                  to={r.href}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-sunken"
                >
                  <span className="chip shrink-0">{r.kind}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px]">{r.title}</span>
                    {r.sub ? (
                      <span className="block truncate text-[12px] text-muted">
                        {r.sub}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-[11.5px] text-subtle">
                    {relTime(r.ts)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        <div className="flex flex-col gap-5">
          <section>
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-[14px] font-medium">人物速览</h2>
              <Link to="/characters" className="link text-[12px]">
                全部
              </Link>
            </div>
            <div className="card card-pad">
              {characters.length === 0 ? (
                <div className="py-4 text-center text-[13px] text-muted">暂无角色</div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {characters.slice(0, 10).map((c) => (
                    <Link
                      key={c.id}
                      to={`/characters/${c.id}`}
                      className="group flex w-[62px] flex-col items-center gap-1.5"
                      title={c.name}
                    >
                      <Avatar
                        name={c.name}
                        src={c.avatar || avatarUrl(c.name, c.color)}
                        size={44}
                      />
                      <span className="w-full truncate text-center text-[11.5px] text-muted group-hover:text-fg">
                        {c.name}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-[14px] font-medium">最新帖子</h2>
              <Link to="/forum" className="link text-[12px]">
                进入论坛
              </Link>
            </div>
            <div className="card divide-y divide-line overflow-hidden">
              {latestPosts.length === 0 ? (
                <div className="px-4 py-6 text-center text-[13px] text-muted">
                  论坛还没有帖子
                </div>
              ) : (
                latestPosts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/forum/post/${p.id}`}
                    className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-sunken"
                  >
                    <Avatar
                      name={p.authorName}
                      src={p.authorAvatar}
                      size={28}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px]">{p.title}</span>
                      <span className="block truncate text-[11.5px] text-muted">
                        {p.authorName} · {p.replies.length} 条回复
                      </span>
                    </span>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-2.5 text-[14px] font-medium">快速入口</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {quick.map((q) => (
                <Link key={q.to} to={q.to} className="card card-hover p-3">
                  <q.icon size={16} className="mb-2 text-accent" />
                  <div className="text-[13px] font-medium">{q.label}</div>
                  <div className="text-[11.5px] text-subtle">{q.hint}</div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="mb-2.5 text-[14px] font-medium">标签云</h2>
        <div className="card card-pad">
          <Chips
            items={Array.from(
              new Set([
                ...characters.flatMap((c) => c.tags),
                ...world.flatMap((w) => w.tags),
                ...stories.flatMap((s) => s.tags),
              ])
            ).slice(0, 24)}
            accent
          />
          {characters.length + world.length + stories.length === 0 ? (
            <div className="text-[13px] text-muted">暂无标签</div>
          ) : null}
        </div>
      </section>

      <div className="mt-6 flex items-center gap-2 text-[12px] text-subtle">
        <ArrowRight size={13} />
        <span>
          提示：按 <kbd className="chip">Ctrl</kbd> + <kbd className="chip">K</kbd>{' '}
          可以全局搜索
        </span>
      </div>
    </div>
  )
}
