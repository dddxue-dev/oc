import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { db } from '@/lib/db'
import { useWikiResolver } from '@/lib/wiki'
import WorldEntryEditor from '@/components/WorldEntryEditor'
import { Chips, Empty, MarkdownView, Modal } from '@/components/ui'

export default function WorldEntryDetail() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const resolve = useWikiResolver()
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  const entry = useLiveQuery(() => db.worldEntries.get(id), [id])
  const all = useLiveQuery(() => db.worldEntries.toArray(), []) ?? []

  const byId = useMemo(() => new Map(all.map((e) => [e.id, e])), [all])

  const chain = useMemo(() => {
    if (!entry) return []
    const out: { id: string; title: string }[] = []
    let cur = entry.parentId ? byId.get(entry.parentId) : undefined
    let guard = 0
    while (cur && guard++ < 10) {
      out.unshift({ id: cur.id, title: cur.title })
      cur = cur.parentId ? byId.get(cur.parentId) : undefined
    }
    return out
  }, [entry, byId])

  if (entry === undefined) {
    return <div className="py-20 text-center text-[13px] text-subtle">载入中…</div>
  }
  if (entry === null) {
    return (
      <Empty
        title="找不到该词条"
        action={
          <Link to="/world" className="btn">
            返回世界观
          </Link>
        }
      />
    )
  }

  const e = entry
  const children = all.filter((x) => x.parentId === e.id)
  const backlinks = all.filter(
    (x) => x.id !== e.id && (x.content || '').includes(`[[${e.title}]]`)
  )

  const remove = async () => {
    await db.worldEntries.delete(e.id)
    const kids = all.filter((x) => x.parentId === e.id)
    for (const k of kids) {
      await db.worldEntries.update(k.id, { parentId: undefined, updatedAt: Date.now() })
    }
    setConfirmDel(false)
    nav('/world')
  }

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-4 -ml-2" onClick={() => nav(-1)}>
        <ArrowLeft size={14} />
        返回
      </button>

      <div className="mb-4 flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
        <Link to="/world" className="link">
          世界观
        </Link>
        {chain.map((c) => (
          <span key={c.id} className="flex items-center gap-1.5">
            <span className="text-subtle">/</span>
            <Link to={`/world/${c.id}`} className="link">
              {c.title}
            </Link>
          </span>
        ))}
        <span className="text-subtle">/</span>
        <span className="text-fg">{e.title}</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <article className="card card-pad">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="chip chip-accent">{e.category}</span>
              </div>
              <h1 className="text-[22px] font-semibold leading-tight tracking-tight">
                {e.title}
              </h1>
              {e.summary ? (
                <p className="mt-2 max-w-[640px] text-[13.5px] leading-[1.8] text-muted">
                  {e.summary}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm" onClick={() => setEditOpen(true)}>
                <Pencil size={13} />
                编辑
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => setConfirmDel(true)}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {e.tags.length ? (
            <div className="mb-4">
              <Chips items={e.tags} />
            </div>
          ) : null}

          <div className="h-px bg-line" />

          <div className="mt-4">
            {e.content ? (
              <MarkdownView text={e.content} resolve={resolve} />
            ) : (
              <p className="text-[13px] text-muted">（正文为空，点击「编辑」开始撰写）</p>
            )}
          </div>
        </article>

        <aside className="flex flex-col gap-4">
          {children.length ? (
            <section className="card card-pad">
              <h2 className="mb-2.5 text-[13.5px] font-medium">下级词条</h2>
              <div className="flex flex-col gap-1">
                {children.map((c) => (
                  <Link key={c.id} to={`/world/${c.id}`} className="link text-[13px]">
                    {c.title}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="card card-pad">
            <h2 className="mb-2.5 text-[13.5px] font-medium">
              反向链接
              <span className="ml-1.5 text-[11.5px] font-normal text-subtle">
                {backlinks.length}
              </span>
            </h2>
            {backlinks.length === 0 ? (
              <p className="text-[12.5px] text-muted">
                暂无。在别的词条正文里写 <code>[[{e.title}]]</code> 就会出现在这里。
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {backlinks.map((b) => (
                  <Link key={b.id} to={`/world/${b.id}`} className="link text-[13px]">
                    {b.title}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="card card-pad">
            <h2 className="mb-2 text-[13.5px] font-medium">元信息</h2>
            <div className="flex flex-col gap-1.5 text-[12.5px] text-muted">
              <div>
                创建：{new Date(e.createdAt).toLocaleDateString('zh-CN')}
              </div>
              <div>
                更新：{new Date(e.updatedAt).toLocaleDateString('zh-CN')}
              </div>
            </div>
          </section>
        </aside>
      </div>

      <WorldEntryEditor open={editOpen} onClose={() => setEditOpen(false)} initial={e} />

      <Modal
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        title="删除词条"
        width={420}
        footer={
          <>
            <button className="btn" onClick={() => setConfirmDel(false)}>
              取消
            </button>
            <button className="btn btn-danger" onClick={remove}>
              确认删除
            </button>
          </>
        }
      >
        <p className="text-[13.5px] leading-[1.8]">
          确定删除词条 <b>{e.title}</b> 吗？
          {children.length ? (
            <>
              <br />
              它的 {children.length} 个下级词条会被提升为顶级词条，不会被删除。
            </>
          ) : null}
        </p>
      </Modal>
    </div>
  )
}
