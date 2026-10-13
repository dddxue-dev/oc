import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, Globe2, Pencil, Trash2 } from 'lucide-react'
import { db } from '@/lib/db'
import { useWikiResolver } from '@/lib/wiki'
import StoryEditor from '@/components/StoryEditor'
import { Avatar, Chips, Empty, MarkdownView, Modal } from '@/components/ui'

export default function StoryDetail() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const resolve = useWikiResolver()
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  const story = useLiveQuery(() => db.stories.get(id), [id])
  const characters = useLiveQuery(() => db.characters.toArray(), []) ?? []
  const worldEntries = useLiveQuery(() => db.worldEntries.toArray(), []) ?? []
  const charMap = new Map(characters.map((c) => [c.id, c]))

  if (story === undefined) {
    return <div className="py-20 text-center text-[13px] text-subtle">载入中…</div>
  }
  if (story === null) {
    return (
      <Empty
        title="找不到这篇故事"
        action={
          <Link to="/stories" className="btn">
            返回故事收录
          </Link>
        }
      />
    )
  }

  const s = story

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-4 -ml-2" onClick={() => nav(-1)}>
        <ArrowLeft size={14} />
        返回
      </button>

      {s.cover ? (
        <div className="card mb-5 overflow-hidden">
          <img src={s.cover} alt={s.title} className="max-h-[280px] w-full object-cover" />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
        <article className="card card-pad">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                {s.status ? <span className="chip chip-accent">{s.status}</span> : null}
              </div>
              <h1 className="text-[24px] font-semibold leading-tight tracking-tight">
                {s.title}
              </h1>
              {s.summary ? (
                <p className="mt-2.5 max-w-[680px] text-[13.5px] leading-[1.85] text-muted">
                  {s.summary}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm" onClick={() => setEditOpen(true)}>
                <Pencil size={13} />
                编辑
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => setConfirmDel(true)}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <div className="h-px bg-line" />

          <div className="mt-5 max-w-[68ch]">
            {s.content ? (
              <MarkdownView text={s.content} resolve={resolve} />
            ) : (
              <p className="text-[13px] text-muted">（正文为空）</p>
            )}
          </div>
        </article>

        <aside className="flex flex-col gap-4">
          {s.worldId ? (
            <section className="card card-pad">
              <h2 className="mb-2.5 text-[13.5px] font-medium">世界观</h2>
              <Link
                to={`/world/${s.worldId}`}
                className="flex items-center gap-2 rounded-[9px] border border-line px-2.5 py-1.5 text-[12.5px] transition-colors hover:border-line-strong"
              >
                <Globe2 size={13} className="shrink-0 text-subtle" />
                <span className="truncate">
                  {worldEntries.find((w) => w.id === s.worldId)?.title ?? '未知词条'}
                </span>
              </Link>
            </section>
          ) : null}

          {s.characterIds.length ? (
            <section className="card card-pad">
              <h2 className="mb-2.5 text-[13.5px] font-medium">出场角色</h2>
              <div className="flex flex-col gap-2">
                {s.characterIds.map((id) => {
                  const c = charMap.get(id)
                  if (!c) return null
                  return (
                    <Link
                      key={id}
                      to={`/characters/${id}`}
                      className="flex items-center gap-2.5 rounded-[9px] border border-line px-2.5 py-1.5 transition-colors hover:border-line-strong"
                    >
                      <Avatar name={c.name} src={c.avatar} color={c.color} size={26} />
                      <span className="truncate text-[13px]">{c.name}</span>
                    </Link>
                  )
                })}
              </div>
            </section>
          ) : null}

          {s.tags.length ? (
            <section className="card card-pad">
              <h2 className="mb-2.5 text-[13.5px] font-medium">标签</h2>
              <Chips items={s.tags} />
            </section>
          ) : null}

          <section className="card card-pad">
            <h2 className="mb-2 text-[13.5px] font-medium">元信息</h2>
            <div className="flex flex-col gap-1.5 text-[12.5px] text-muted">
              <div>创建：{new Date(s.createdAt).toLocaleDateString('zh-CN')}</div>
              <div>更新：{new Date(s.updatedAt).toLocaleDateString('zh-CN')}</div>
              <div>
                字数：{(s.content || '').replace(/\s/g, '').length.toLocaleString('zh-CN')}
              </div>
            </div>
          </section>
        </aside>
      </div>

      <StoryEditor open={editOpen} onClose={() => setEditOpen(false)} initial={s} />

      <Modal
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        title="删除故事"
        width={400}
        footer={
          <>
            <button className="btn" onClick={() => setConfirmDel(false)}>
              取消
            </button>
            <button
              className="btn btn-danger"
              onClick={async () => {
                await db.stories.delete(s.id)
                nav('/stories')
              }}
            >
              确认删除
            </button>
          </>
        }
      >
        <p className="text-[13.5px]">
          确定删除 <b>{s.title}</b> 吗？此操作不可撤销。
        </p>
      </Modal>
    </div>
  )
}
