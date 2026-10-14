import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Network, Plus, Search, Users } from 'lucide-react'
import { db } from '@/lib/db'
import { useWorldId } from '@/lib/world'
import type { Character } from '@/lib/types'
import CharacterEditor from '@/components/CharacterEditor'
import { Avatar, Chips, Empty, PageHeader } from '@/components/ui'

export default function Characters() {
  const worldId = useWorldId()
  const [q, setQ] = useState('')
  const [tag, setTag] = useState<string | null>(null)
  const [editing, setEditing] = useState<Character | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)

  const characters =
    useLiveQuery(
      () => db.characters.where('worldId').equals(worldId).toArray(),
      [worldId]
    ) ?? []

  const allTags = useMemo(
    () => Array.from(new Set(characters.flatMap((c) => c.tags))).slice(0, 20),
    [characters]
  )

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return characters
      .filter((c) => {
        if (tag && !c.tags.includes(tag)) return false
        if (!kw) return true
        return [c.name, c.alias, c.species, c.affiliation, c.personality, c.tags.join(' ')]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(kw)
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
  }, [characters, q, tag])

  return (
    <div>
      <PageHeader
        title="人物档案"
        subtitle={`共 ${characters.length} 位角色`}
        actions={
          <>
            <Link to="/characters/graph" className="btn">
              <Network size={14} />
              关系图
            </Link>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditing(null)
                setEditorOpen(true)
              }}
            >
              <Plus size={14} />
              新建角色
            </button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-[300px]">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
          />
          <input
            className="input pl-9"
            placeholder="搜索姓名、称号、种族…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {allTags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              className={tag === null ? 'chip chip-accent' : 'chip'}
              onClick={() => setTag(null)}
            >
              全部
            </button>
            {allTags.map((t) => (
              <button
                key={t}
                className={tag === t ? 'chip chip-accent' : 'chip'}
                onClick={() => setTag(tag === t ? null : t)}
              >
                {t}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {list.length === 0 ? (
        <Empty
          title={characters.length === 0 ? '还没有角色档案' : '没有匹配的角色'}
          hint={
            characters.length === 0
              ? '新建第一位角色，之后就能在论坛里以他/她的身份发帖。'
              : '换个关键词或清除标签筛选试试。'
          }
          action={
            characters.length === 0 ? (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditing(null)
                  setEditorOpen(true)
                }}
              >
                <Plus size={14} />
                新建角色
              </button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <Link
              key={c.id}
              to={`/characters/${c.id}`}
              className="card card-hover flex gap-3.5 p-4"
            >
              <Avatar name={c.name} src={c.avatar} color={c.color} size={52} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[14.5px] font-medium">{c.name}</span>
                  {c.alias ? (
                    <span className="shrink-0 text-[11.5px] text-subtle">
                      {c.alias}
                    </span>
                  ) : null}
                </div>
                <div className="mt-0.5 truncate text-[12px] text-muted">
                  {[c.species, c.affiliation, c.status].filter(Boolean).join(' · ') ||
                    '尚未填写基本资料'}
                </div>
                <div className="mt-2 line-clamp-2 text-[12.5px] leading-[1.7] text-muted">
                  {c.personality || c.appearance || '—'}
                </div>
                {c.tags.length ? (
                  <div className="mt-2.5">
                    <Chips items={c.tags.slice(0, 3)} />
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}

      <CharacterEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        initial={editing}
      />
    </div>
  )
}
