import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { MapPin, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { db } from '@/lib/db'
import { useWorldId } from '@/lib/world'
import type { EventItem } from '@/lib/types'
import { useWikiResolver } from '@/lib/wiki'
import EventEditor from '@/components/EventEditor'
import { Avatar, Chips, Empty, MarkdownView, Modal, PageHeader } from '@/components/ui'

export function formatYear(era: string | undefined, year: number) {
  const prefix = era ? `${era} ` : ''
  return year < 0 ? `${prefix}前 ${Math.abs(year)} 年` : `${prefix}${year} 年`
}

export default function Timeline() {
  const worldId = useWorldId()
  const [params] = useSearchParams()
  const focus = params.get('focus')
  const resolve = useWikiResolver()

  const [q, setQ] = useState('')
  const [era, setEra] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(focus)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<EventItem | null>(null)
  const [confirmDel, setConfirmDel] = useState<EventItem | null>(null)
  const focusRef = useRef<HTMLDivElement>(null)

  const events =
    useLiveQuery(() => db.events.where('worldId').equals(worldId).toArray(), [
      worldId,
    ]) ?? []
  const characters =
    useLiveQuery(
      () => db.characters.where('worldId').equals(worldId).toArray(),
      [worldId]
    ) ?? []
  const charMap = useMemo(() => new Map(characters.map((c) => [c.id, c])), [characters])

  const eras = useMemo(
    () => Array.from(new Set(events.map((e) => e.era || '未纪年'))),
    [events]
  )

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return events
      .filter((e) => {
        if (era && (e.era || '未纪年') !== era) return false
        if (!kw) return true
        return [e.title, e.summary, e.content, e.location, e.tags.join(' ')]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(kw)
      })
      .sort((a, b) => a.year - b.year)
  }, [events, era, q])

  const groups = useMemo(() => {
    const m = new Map<string, EventItem[]>()
    filtered.forEach((e) => {
      const k = e.era || '未纪年'
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push(e)
    })
    return Array.from(m.entries())
  }, [filtered])

  useEffect(() => {
    if (focus && focusRef.current) {
      const t = setTimeout(
        () => focusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
        120
      )
      return () => clearTimeout(t)
    }
  }, [focus, filtered.length])

  const openNew = () => {
    setEditing(null)
    setEditorOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="世界观 · 时间线"
        subtitle={`共 ${events.length} 个事件 · ${eras.length} 个纪元`}
        actions={
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={14} />
            新建事件
          </button>
        }
      />

      {events.length === 0 ? (
        <Empty
          title="时间线还是空的"
          hint="新建事件，标注年份（支持负数表示纪元之前），它们会自动按时间排布。"
          action={
            <button className="btn btn-primary" onClick={openNew}>
              <Plus size={14} />
              新建事件
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1 sm:max-w-[300px]">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
              />
              <input
                className="input pl-9"
                placeholder="搜索事件…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                className={era === null ? 'chip chip-accent' : 'chip'}
                onClick={() => setEra(null)}
              >
                全部纪元
              </button>
              {eras.map((e) => (
                <button
                  key={e}
                  className={era === e ? 'chip chip-accent' : 'chip'}
                  onClick={() => setEra(era === e ? null : e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <Empty title="没有匹配的事件" hint="换个关键词或清除纪元筛选。" />
          ) : (
            <div className="flex flex-col gap-8">
              {groups.map(([eraName, items]) => (
                <section key={eraName}>
                  <div className="mb-3 flex items-center gap-2.5">
                    <span className="chip chip-accent">{eraName}</span>
                    <span className="text-[11.5px] text-subtle">
                      {items.length} 个事件
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute bottom-2 left-[70px] top-2 w-px bg-line" />
                    <div className="flex flex-col gap-3">
                      {items.map((e) => {
                        const isFocus = focus === e.id
                        const isOpen = expanded === e.id
                        const chars = e.characterIds
                          .map((id) => charMap.get(id))
                          .filter(Boolean)
                        return (
                          <div
                            key={e.id}
                            ref={isFocus ? focusRef : undefined}
                            className="relative pl-[112px]"
                          >
                            <div className="absolute left-0 top-[17px] w-[56px] text-right">
                              <div className="text-[15px] font-semibold leading-none tracking-tight">
                                {e.year < 0 ? `-${Math.abs(e.year)}` : e.year}
                              </div>
                              <div className="mt-1 text-[10.5px] text-subtle">
                                {e.endYear !== undefined ? `→ ${e.endYear}` : '年'}
                              </div>
                            </div>
                            <span
                              className={`absolute left-[65px] top-[21px] h-2.5 w-2.5 rounded-full border-2 border-app ${
                                isFocus ? 'bg-accent' : 'bg-line-strong'
                              }`}
                            />
                            <div
                              className={`card card-hover overflow-hidden ${
                                isFocus ? 'border-accent' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3 p-4">
                                <div className="min-w-0 flex-1">
                                  <button
                                    className="block w-full text-left"
                                    onClick={() => setExpanded(isOpen ? null : e.id)}
                                  >
                                    <div className="text-[14.5px] font-medium">
                                      {e.title}
                                    </div>
                                    {e.summary ? (
                                      <p className="mt-1 text-[12.5px] leading-[1.75] text-muted">
                                        {e.summary}
                                      </p>
                                    ) : null}
                                  </button>

                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    {e.location ? (
                                      <span className="chip">
                                        <MapPin size={10} />
                                        {e.location}
                                      </span>
                                    ) : null}
                                    {chars.slice(0, 4).map((c) => (
                                      <Link
                                        key={c!.id}
                                        to={`/characters/${c!.id}`}
                                        className="chip"
                                        title={c!.name}
                                      >
                                        <Avatar
                                          name={c!.name}
                                          src={c!.avatar}
                                          color={c!.color}
                                          size={14}
                                        />
                                        {c!.name}
                                      </Link>
                                    ))}
                                    {e.tags.length ? <Chips items={e.tags} /> : null}
                                  </div>

                                  {isOpen && e.content ? (
                                    <div className="mt-3 border-t border-line pt-3">
                                      <MarkdownView text={e.content} resolve={resolve} />
                                    </div>
                                  ) : null}
                                </div>

                                <div className="flex shrink-0 gap-1">
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => {
                                      setEditing(e)
                                      setEditorOpen(true)
                                    }}
                                    title="编辑"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setConfirmDel(e)}
                                    title="删除"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}

      <EventEditor open={editorOpen} onClose={() => setEditorOpen(false)} initial={editing} />

      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="删除事件"
        width={420}
        footer={
          <>
            <button className="btn" onClick={() => setConfirmDel(null)}>
              取消
            </button>
            <button
              className="btn btn-danger"
              onClick={async () => {
                if (confirmDel) await db.events.delete(confirmDel.id)
                setConfirmDel(null)
              }}
            >
              确认删除
            </button>
          </>
        }
      >
        <p className="text-[13.5px]">
          确定删除事件 <b>{confirmDel?.title}</b> 吗？此操作不可撤销。
        </p>
      </Modal>
    </div>
  )
}
