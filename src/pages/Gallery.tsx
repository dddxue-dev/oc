import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Images, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { db } from '@/lib/db'
import { useWorldId } from '@/lib/world'
import type { GalleryItem } from '@/lib/types'
import GalleryEditor from '@/components/GalleryEditor'
import { Chips, Empty, Modal, PageHeader } from '@/components/ui'

export default function Gallery() {
  const worldId = useWorldId()
  const [params, setParams] = useSearchParams()
  const focus = params.get('focus')
  const cat = params.get('cat')
  const charId = params.get('char')

  const [q, setQ] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<GalleryItem | null>(null)
  const [viewing, setViewing] = useState<GalleryItem | null>(null)

  const items =
    useLiveQuery(() => db.gallery.where('worldId').equals(worldId).toArray(), [
      worldId,
    ]) ?? []
  const characters =
    useLiveQuery(
      () => db.characters.where('worldId').equals(worldId).toArray(),
      [worldId]
    ) ?? []
  const charMap = useMemo(() => new Map(characters.map((c) => [c.id, c])), [characters])

  useEffect(() => {
    if (!focus) return
    const hit = items.find((i) => i.id === focus)
    if (hit) setViewing(hit)
  }, [focus, items])

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return items
      .filter((i) => {
        if (cat && i.category !== cat) return false
        if (charId && !i.characterIds.includes(charId)) return false
        if (!kw) return true
        return [i.title, i.artist, i.description, i.tags.join(' ')]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(kw)
      })
      .sort(
        (a, b) => (b.date || '').localeCompare(a.date || '') || b.createdAt - a.createdAt
      )
  }, [items, cat, charId, q])

  const closeView = () => {
    setViewing(null)
    if (focus) {
      const next = new URLSearchParams(params)
      next.delete('focus')
      setParams(next, { replace: true })
    }
  }

  const remove = async (id: string) => {
    await db.gallery.delete(id)
    closeView()
  }

  const activeFilters = [
    cat ? { label: `分类：${cat}`, clear: () => setParams(withOut('cat')) } : null,
    charId
      ? {
          label: `角色：${charMap.get(charId)?.name ?? '未知'}`,
          clear: () => setParams(withOut('char')),
        }
      : null,
  ].filter(Boolean) as { label: string; clear: () => void }[]

  function withOut(key: string) {
    const next = new URLSearchParams(params)
    next.delete(key)
    next.delete('focus')
    return next
  }

  return (
    <div>
      <PageHeader
        title="画廊"
        subtitle={`共 ${items.length} 幅作品`}
        actions={
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing(null)
              setEditorOpen(true)
            }}
          >
            <Plus size={14} />
            新建作品
          </button>
        }
      />

      {items.length === 0 ? (
        <Empty
          title="画廊还是空的"
          hint="上传委托稿、立绘、场景图。没有图也可以先点「生成占位图」占个位。"
          action={
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditing(null)
                setEditorOpen(true)
              }}
            >
              <Plus size={14} />
              新建作品
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px] flex-1 sm:max-w-[280px]">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
              />
              <input
                className="input pl-9"
                placeholder="搜索作品…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            {activeFilters.map((f) => (
              <button key={f.label} className="chip chip-accent" onClick={f.clear}>
                {f.label}
                <X size={11} />
              </button>
            ))}
            <span className="ml-auto text-[11.5px] text-subtle">
              {list.length} 幅
            </span>
          </div>

          {list.length === 0 ? (
            <Empty title="没有匹配的作品" hint="换个关键词，或在左侧清除筛选。" />
          ) : (
            <div className="columns-2 gap-3 sm:columns-3 xl:columns-4">
              {list.map((it) => (
                <button
                  key={it.id}
                  onClick={() => setViewing(it)}
                  className="card card-hover mb-3 block w-full break-inside-avoid overflow-hidden text-left"
                >
                  <img src={it.image} alt={it.title} className="w-full object-cover" />
                  <div className="p-2.5">
                    <div className="truncate text-[13px] font-medium">{it.title}</div>
                    <div className="mt-0.5 truncate text-[11px] text-subtle">
                      {[it.artist, it.category, it.date].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <Modal
        open={!!viewing}
        onClose={closeView}
        title={viewing?.title ?? ''}
        width={880}
        footer={
          viewing ? (
            <>
              <button className="btn btn-danger" onClick={() => remove(viewing.id)}>
                <Trash2 size={13} />
                删除
              </button>
              <div className="flex-1" />
              <button
                className="btn"
                onClick={() => {
                  setEditing(viewing)
                  closeView()
                  setEditorOpen(true)
                }}
              >
                <Pencil size={13} />
                编辑
              </button>
              <button className="btn btn-primary" onClick={closeView}>
                <X size={13} />
                关闭
              </button>
            </>
          ) : null
        }
      >
        {viewing ? (
          <div className="grid gap-5 sm:grid-cols-[1.3fr_1fr]">
            <div className="overflow-hidden rounded-[10px] border border-line bg-sunken">
              <img
                src={viewing.image}
                alt={viewing.title}
                className="max-h-[62vh] w-full object-contain"
              />
            </div>
            <div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {viewing.category ? (
                  <span className="chip chip-accent">{viewing.category}</span>
                ) : null}
                {viewing.date ? <span className="chip">{viewing.date}</span> : null}
              </div>

              <div className="divide-y divide-line">
                {[
                  ['画师', viewing.artist],
                  ['日期', viewing.date],
                ].map(([k, v]) =>
                  v ? (
                    <div key={k} className="flex gap-3 py-2 text-[13px]">
                      <div className="w-14 shrink-0 text-muted">{k}</div>
                      <div className="flex-1">{v}</div>
                    </div>
                  ) : null
                )}
              </div>

              {viewing.description ? (
                <p className="mt-3 text-[13px] leading-[1.85]">{viewing.description}</p>
              ) : null}

              {viewing.characterIds.length ? (
                <div className="mt-4">
                  <div className="mb-1.5 text-[11.5px] font-medium text-muted">
                    关联角色
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {viewing.characterIds.map((id) => {
                      const c = charMap.get(id)
                      if (!c) return null
                      return (
                        <a key={id} href={`#/characters/${id}`} className="chip">
                          {c.name}
                        </a>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {viewing.tags.length ? (
                <div className="mt-4">
                  <Chips items={viewing.tags} />
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[13px] text-muted">
            <Images size={14} />
            无内容
          </div>
        )}
      </Modal>

      <GalleryEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        initial={editing}
      />
    </div>
  )
}
