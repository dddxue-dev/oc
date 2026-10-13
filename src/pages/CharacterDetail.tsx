import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, Network, Pencil, Trash2 } from 'lucide-react'
import { db } from '@/lib/db'
import { useWikiResolver } from '@/lib/wiki'
import CharacterEditor from '@/components/CharacterEditor'
import { Avatar, Chips, Empty, MarkdownView, Modal } from '@/components/ui'

export default function CharacterDetail() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const resolve = useWikiResolver()
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  const character = useLiveQuery(() => db.characters.get(id), [id])
  const relations = useLiveQuery(() => db.relations.toArray(), []) ?? []
  const allChars = useLiveQuery(() => db.characters.toArray(), []) ?? []
  const gallery = useLiveQuery(() => db.gallery.toArray(), []) ?? []
  const stories = useLiveQuery(() => db.stories.toArray(), []) ?? []
  const events = useLiveQuery(() => db.events.toArray(), []) ?? []
  const posts = useLiveQuery(() => db.posts.toArray(), []) ?? []

  const nameOf = useMemo(() => {
    const m = new Map(allChars.map((c) => [c.id, c]))
    return (cid: string) => m.get(cid)
  }, [allChars])

  const related = useMemo(
    () => relations.filter((r) => r.source === id || r.target === id),
    [relations, id]
  )

  if (character === undefined) {
    return <div className="py-20 text-center text-[13px] text-subtle">载入中…</div>
  }
  if (character === null) {
    return (
      <Empty
        title="找不到该角色"
        hint="可能已被删除。"
        action={
          <Link to="/characters" className="btn">
            返回列表
          </Link>
        }
      />
    )
  }

  const c = character
  const inGallery = gallery.filter((g) => g.characterIds.includes(c.id))
  const inStories = stories.filter((s) => s.characterIds.includes(c.id))
  const inEvents = events.filter((e) => e.characterIds.includes(c.id))
  const inPosts = posts.filter(
    (p) =>
      p.authorCharacterId === c.id ||
      p.replies.some((r) => r.authorCharacterId === c.id)
  )

  const remove = async () => {
    await db.characters.delete(c.id)
    await db.relations.where('source').equals(c.id).delete()
    await db.relations.where('target').equals(c.id).delete()
    await db.nodePositions.delete(c.id)
    setConfirmDel(false)
    nav('/characters')
  }

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-4 -ml-2" onClick={() => nav(-1)}>
        <ArrowLeft size={14} />
        返回
      </button>

      <div className="card card-pad mb-5">
        <div className="flex flex-wrap items-start gap-5">
          <Avatar name={c.name} src={c.avatar} color={c.color} size={92} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h1 className="text-[22px] font-semibold leading-tight tracking-tight">
                {c.name}
              </h1>
              {c.alias ? (
                <span className="text-[13px] text-muted">「{c.alias}」</span>
              ) : null}
              {c.status ? <span className="chip chip-accent">{c.status}</span> : null}
            </div>
            <div className="mt-1.5 text-[13px] text-muted">
              {[c.species, c.affiliation].filter(Boolean).join(' · ') || '—'}
            </div>
            {c.tags.length ? (
              <div className="mt-3">
                <Chips items={c.tags} accent />
              </div>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Link to="/characters/graph" className="btn btn-sm">
              <Network size={13} />
              关系图
            </Link>
            <button className="btn btn-sm" onClick={() => setEditOpen(true)}>
              <Pencil size={13} />
              编辑
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => setConfirmDel(true)}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-5">
          <section className="card card-pad">
            <h2 className="mb-3 text-[14px] font-medium">基本资料</h2>
            <div className="divide-y divide-line">
              {[
                ['性别', c.gender],
                ['年龄', c.age],
                ['种族', c.species],
                ['所属', c.affiliation],
                ['状态', c.status],
              ].map(([k, v]) =>
                v ? (
                  <div key={k} className="flex gap-3 py-2 text-[13px]">
                    <div className="w-16 shrink-0 text-muted">{k}</div>
                    <div className="flex-1">{v}</div>
                  </div>
                ) : null
              )}
            </div>
          </section>

          {c.quote ? (
            <section className="card card-pad">
              <h2 className="mb-2.5 text-[14px] font-medium">代表台词</h2>
              <p className="border-l-2 border-accent pl-3.5 text-[14px] italic leading-[1.9] text-fg">
                {c.quote}
              </p>
            </section>
          ) : null}

          {c.appearance ? (
            <section className="card card-pad">
              <h2 className="mb-2.5 text-[14px] font-medium">外貌</h2>
              <p className="text-[13.5px] leading-[1.85]">{c.appearance}</p>
            </section>
          ) : null}

          <section className="card card-pad">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[14px] font-medium">人物关系</h2>
              <span className="text-[11.5px] text-subtle">{related.length} 条</span>
            </div>
            {related.length === 0 ? (
              <div className="text-[12.5px] text-muted">
                还没有关系记录。去{' '}
                <Link to="/characters/graph" className="link">
                  关系图
                </Link>{' '}
                里连线。
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {related.map((r) => {
                  const otherId = r.source === c.id ? r.target : r.source
                  const other = nameOf(otherId)
                  if (!other) return null
                  return (
                    <Link
                      key={r.id}
                      to={`/characters/${other.id}`}
                      className="flex items-center gap-2.5 rounded-[9px] border border-line px-2.5 py-2 transition-colors hover:border-line-strong"
                    >
                      <Avatar
                        name={other.name}
                        src={other.avatar}
                        color={other.color}
                        size={28}
                      />
                      <span className="flex-1 truncate text-[13px]">{other.name}</span>
                      <span className="chip">{r.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <section className="card card-pad">
            <h2 className="mb-3 text-[14px] font-medium">性格</h2>
            <p className="text-[13.5px] leading-[1.85]">{c.personality || '—'}</p>
          </section>

          <section className="card card-pad">
            <h2 className="mb-3 text-[14px] font-medium">能力 / 技能</h2>
            <p className="text-[13.5px] leading-[1.85]">{c.abilities || '—'}</p>
          </section>

          {c.goals ? (
            <section className="card card-pad">
              <h2 className="mb-3 text-[14px] font-medium">目标 / 执念</h2>
              <p className="text-[13.5px] leading-[1.85]">{c.goals}</p>
            </section>
          ) : null}

          <section className="card card-pad">
            <h2 className="mb-3 text-[14px] font-medium">背景故事</h2>
            {c.backstory ? (
              <MarkdownView text={c.backstory} resolve={resolve} />
            ) : (
              <p className="text-[13px] text-muted">—</p>
            )}
          </section>

          {(inEvents.length || inStories.length || inGallery.length || inPosts.length) ? (
            <section className="card card-pad">
              <h2 className="mb-3 text-[14px] font-medium">关联内容</h2>
              <div className="flex flex-col gap-4">
                {inEvents.length ? (
                  <div>
                    <div className="mb-1.5 text-[11.5px] font-medium text-muted">
                      参与事件
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {inEvents.map((e) => (
                        <Link
                          key={e.id}
                          to={`/world/timeline?focus=${e.id}`}
                          className="chip"
                        >
                          {e.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
                {inStories.length ? (
                  <div>
                    <div className="mb-1.5 text-[11.5px] font-medium text-muted">
                      出场故事
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {inStories.map((s) => (
                        <Link key={s.id} to={`/stories/${s.id}`} className="chip">
                          {s.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
                {inGallery.length ? (
                  <div>
                    <div className="mb-1.5 text-[11.5px] font-medium text-muted">
                      相关画作
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {inGallery.map((g) => (
                        <Link
                          key={g.id}
                          to={`/gallery?focus=${g.id}`}
                          className="overflow-hidden rounded-[8px] border border-line"
                        >
                          <img
                            src={g.image}
                            alt={g.title}
                            className="h-16 w-16 object-cover"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
                {inPosts.length ? (
                  <div>
                    <div className="mb-1.5 text-[11.5px] font-medium text-muted">
                      论坛发言
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {inPosts.map((p) => (
                        <Link
                          key={p.id}
                          to={`/forum/post/${p.id}`}
                          className="truncate text-[12.5px] link"
                        >
                          {p.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <CharacterEditor
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={c}
      />

      <Modal
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        title="删除角色"
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
          确定删除角色 <b>{c.name}</b> 吗？
          <br />
          该角色参与的关系连线会一并移除，论坛中以他/她身份发的帖子会保留（显示为原名字）。
        </p>
      </Modal>
    </div>
  )
}
