import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Search } from 'lucide-react'
import { db } from '@/lib/db'
import { useWorldId } from '@/lib/world'
import type { WorldEntry } from '@/lib/types'
import { useParamState } from '@/lib/useParam'
import WorldEntryEditor from '@/components/WorldEntryEditor'
import { Chips, Empty, PageHeader } from '@/components/ui'

export default function Worldview() {
  const worldId = useWorldId()
  const [cat, setCat] = useParamState('cat')
  const [q, setQ] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<WorldEntry | null>(null)

  const entries =
    useLiveQuery(
      () => db.worldEntries.where('worldId').equals(worldId).toArray(),
      [worldId]
    ) ?? []
  const byId = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries])

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return entries
      .filter((e) => {
        if (cat && e.category !== cat) return false
        if (!kw) return true
        return [e.title, e.summary, e.content, e.tags.join(' ')]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(kw)
      })
      .sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'))
  }, [entries, cat, q])

  const openNew = () => {
    setEditing(null)
    setEditorOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="世界观"
        subtitle={
          <>
            共 {entries.length} 条词条
            {cat ? (
              <>
                {' · '}
                <span className="text-accent">{cat}</span>
                <button
                  className="link ml-1.5 text-[12px]"
                  onClick={() => setCat(null)}
                >
                  清除
                </button>
              </>
            ) : null}
          </>
        }
        actions={
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={14} />
            新建词条
          </button>
        }
      />

      {entries.length === 0 ? (
        <Empty
          title="还没有世界观词条"
          hint="从地理、历史、体系开始，逐步搭建你的世界。正文里用 [[词条名]] 可以互相链接。"
          action={
            <button className="btn btn-primary" onClick={openNew}>
              <Plus size={14} />
              新建词条
            </button>
          }
        />
      ) : (
        <>
          <div className="relative mb-4 sm:max-w-[320px]">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
            />
            <input
              className="input pl-9"
              placeholder="搜索词条标题、正文、标签…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {list.length === 0 ? (
            <Empty title="没有匹配的词条" hint="换个关键词，或在左侧清除分类筛选。" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((e) => {
                const parent = e.parentId ? byId.get(e.parentId) : undefined
                const children = entries.filter((x) => x.parentId === e.id)
                return (
                  <Link
                    key={e.id}
                    to={`/world/${e.id}`}
                    className="card card-hover flex flex-col p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate text-[14.5px] font-medium">{e.title}</div>
                      <span className="chip shrink-0">{e.category}</span>
                    </div>
                    {parent ? (
                      <div className="mt-1 text-[11.5px] text-subtle">
                        上级 · {parent.title}
                      </div>
                    ) : null}
                    <p className="mt-2 line-clamp-3 flex-1 text-[12.5px] leading-[1.75] text-muted">
                      {e.summary || '（暂无摘要）'}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <Chips items={e.tags.slice(0, 2)} />
                      {children.length ? (
                        <span className="shrink-0 text-[11px] text-subtle">
                          含 {children.length} 子项
                        </span>
                      ) : null}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}

      <WorldEntryEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        initial={editing}
      />
    </div>
  )
}
