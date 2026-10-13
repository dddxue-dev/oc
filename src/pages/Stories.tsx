import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { BookOpen, Plus, Search, X } from 'lucide-react'
import { db } from '@/lib/db'
import type { Story } from '@/lib/types'
import { plainText } from '@/lib/markdown'
import { useParamState } from '@/lib/useParam'
import StoryEditor from '@/components/StoryEditor'
import { Avatar, Chips, Empty, PageHeader } from '@/components/ui'

export default function Stories() {
  const [status, setStatus] = useParamState('status')
  const [world, setWorld] = useParamState('world')
  const [q, setQ] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Story | null>(null)

  const stories = useLiveQuery(() => db.stories.toArray(), []) ?? []
  const characters = useLiveQuery(() => db.characters.toArray(), []) ?? []
  const worldEntries = useLiveQuery(() => db.worldEntries.toArray(), []) ?? []
  const charMap = useMemo(() => new Map(characters.map((c) => [c.id, c])), [characters])
  const worldMap = useMemo(() => new Map(worldEntries.map((w) => [w.id, w])), [worldEntries])

  const worldTitle = world ? (worldMap.get(world)?.title ?? '未知世界观') : null

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return stories
      .filter((s) => {
        if (status && s.status !== status) return false
        if (world && s.worldId !== world) return false
        if (!kw) return true
        return [s.title, s.summary, s.content, s.tags.join(' ')]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(kw)
      })
      .sort((a, b) => b.updatedAt - a.updatedAt)
  }, [stories, q, status, world])

  return (
    <div>
      <PageHeader
        title="故事收录"
        subtitle={
          <>
            共 {stories.length} 篇
            {status || world ? (
              <>
                {' · '}
                <span className="text-accent">
                  {[status, worldTitle].filter(Boolean).join(' / ')}
                </span>
                <button
                  className="link ml-1.5 text-[12px]"
                  onClick={() => {
                    setStatus(null)
                    setWorld(null)
                  }}
                >
                  清除
                </button>
              </>
            ) : null}
          </>
        }
        actions={
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing(null)
              setEditorOpen(true)
            }}
          >
            <Plus size={14} />
            新建故事
          </button>
        }
      />

      {stories.length === 0 ? (
        <Empty
          title="还没有收录故事"
          hint="正文支持 Markdown，用 ## 分章节即可获得舒服的阅读排版。"
          action={
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditing(null)
                setEditorOpen(true)
              }}
            >
              <Plus size={14} />
              新建故事
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px] flex-1 sm:max-w-[300px]">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
              />
              <input
                className="input pl-9"
                placeholder="搜索标题、正文…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            {status ? (
              <button className="chip chip-accent" onClick={() => setStatus(null)}>
                {status}
                <X size={11} />
              </button>
            ) : null}
            {world ? (
              <button className="chip chip-accent" onClick={() => setWorld(null)}>
                世界观：{worldTitle}
                <X size={11} />
              </button>
            ) : null}
            <span className="ml-auto text-[11.5px] text-subtle">{list.length} 篇</span>
          </div>

          {list.length === 0 ? (
            <Empty title="没有匹配的故事" hint="换个关键词，或在左侧清除状态筛选。" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((s) => (
                <Link
                  key={s.id}
                  to={`/stories/${s.id}`}
                  className="card card-hover flex flex-col overflow-hidden"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-sunken">
                    {s.cover ? (
                      <img src={s.cover} alt={s.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-subtle">
                        <BookOpen size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[14.5px] font-medium">{s.title}</div>
                      {s.status ? <span className="chip shrink-0">{s.status}</span> : null}
                    </div>
                    {s.worldId ? (
                      <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[11.5px] text-subtle">
                        <span>{worldMap.get(s.worldId)?.title ?? '未知世界观'}</span>
                      </div>
                    ) : null}
                    <p className="mt-1.5 line-clamp-3 flex-1 text-[12.5px] leading-[1.75] text-muted">
                      {s.summary || plainText(s.content || '', 90) || '（暂无正文）'}
                    </p>
                    {s.characterIds.length ? (
                      <div className="mt-3 flex items-center gap-1.5">
                        {s.characterIds.slice(0, 5).map((id) => {
                          const c = charMap.get(id)
                          if (!c) return null
                          return (
                            <Avatar
                              key={id}
                              name={c.name}
                              src={c.avatar}
                              color={c.color}
                              size={22}
                            />
                          )
                        })}
                        {s.characterIds.length > 5 ? (
                          <span className="text-[11px] text-subtle">
                            +{s.characterIds.length - 5}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                    {s.tags.length ? (
                      <div className="mt-3">
                        <Chips items={s.tags.slice(0, 3)} />
                      </div>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      <StoryEditor open={editorOpen} onClose={() => setEditorOpen(false)} initial={editing} />
    </div>
  )
}
