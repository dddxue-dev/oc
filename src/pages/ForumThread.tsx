import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, Pencil, Pin, Send, Trash2, UserRound } from 'lucide-react'
import { db, now, uid } from '@/lib/db'
import { useWorldId } from '@/lib/world'
import { avatarUrl } from '@/lib/placeholder'
import type { ForumPost } from '@/lib/types'
import { useWikiResolver } from '@/lib/wiki'
import PostEditor from '@/components/PostEditor'
import { Avatar, Empty, MarkdownView, Modal } from '@/components/ui'

function relTime(ts: number) {
  const d = Date.now() - ts
  const min = Math.floor(d / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} 小时前`
  return new Date(ts).toLocaleString('zh-CN')
}

export default function ForumThread() {
  const worldId = useWorldId()
  const { id = '' } = useParams()
  const nav = useNavigate()
  const resolve = useWikiResolver()

  const [editOpen, setEditOpen] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyAs, setReplyAs] = useState<string>('')
  const [guestName, setGuestName] = useState('')

  const post = useLiveQuery(() => db.posts.get(id), [id])
  const boards =
    useLiveQuery(
      () => db.boards.where('worldId').equals(worldId).sortBy('order'),
      [worldId]
    ) ?? []
  const characters =
    useLiveQuery(
      () => db.characters.where('worldId').equals(worldId).toArray(),
      [worldId]
    ) ?? []

  if (post === undefined) {
    return <div className="py-20 text-center text-[13px] text-subtle">载入中…</div>
  }
  if (post === null) {
    return (
      <Empty
        title="找不到该帖子"
        action={
          <Link to="/forum" className="btn">
            返回论坛
          </Link>
        }
      />
    )
  }

  const p: ForumPost = post
  const board = boards.find((b) => b.id === p.boardId)
  const author = characters.find((c) => c.id === p.authorCharacterId)

  const sendReply = async () => {
    const text = replyText.trim()
    if (!text) return
    const as = characters.find((c) => c.id === replyAs)
    const reply = {
      id: uid(),
      content: text,
      authorCharacterId: as?.id,
      authorName: as ? as.name : guestName.trim() || '访客',
      authorAvatar: as ? as.avatar || avatarUrl(as.name, as.color) : undefined,
      createdAt: now(),
    }
    await db.posts.update(p.id, {
      replies: [...p.replies, reply],
      updatedAt: now(),
    })
    setReplyText('')
  }

  const deleteReply = async (rid: string) => {
    await db.posts.update(p.id, {
      replies: p.replies.filter((r) => r.id !== rid),
      updatedAt: now(),
    })
  }

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-4 -ml-2" onClick={() => nav('/forum')}>
        <ArrowLeft size={14} />
        返回论坛
      </button>

      <article className="card card-pad mb-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={p.authorName} src={p.authorAvatar} size={42} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium">{p.authorName}</span>
                {author ? (
                  <Link
                    to={`/characters/${author.id}`}
                    className="link text-[11.5px]"
                  >
                    查看档案
                  </Link>
                ) : null}
                {p.pinned ? (
                  <span className="chip chip-accent">
                    <Pin size={10} />
                    置顶
                  </span>
                ) : null}
              </div>
              <div className="text-[11.5px] text-muted">
                {board ? `${board.name} · ` : ''}
                {relTime(p.createdAt)}
                {p.updatedAt > p.createdAt ? ` · 编辑于 ${relTime(p.updatedAt)}` : ''}
              </div>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              className="btn btn-sm"
              onClick={async () => {
                await db.posts.update(p.id, { pinned: !p.pinned, updatedAt: now() })
              }}
            >
              <Pin size={13} />
              {p.pinned ? '取消置顶' : '置顶'}
            </button>
            <button className="btn btn-sm" onClick={() => setEditOpen(true)}>
              <Pencil size={13} />
              编辑
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => setConfirmDel(true)}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <h1 className="mb-3 text-[21px] font-semibold leading-snug tracking-tight">
          {p.title}
        </h1>
        <MarkdownView text={p.content} resolve={resolve} />
      </article>

      <section className="mb-4">
        <h2 className="mb-2.5 text-[13.5px] font-medium">
          回复
          <span className="ml-1.5 text-[11.5px] font-normal text-subtle">
            {p.replies.length}
          </span>
        </h2>
        {p.replies.length === 0 ? (
          <div className="card px-4 py-6 text-center text-[12.5px] text-muted">
            还没有回复，来说点什么吧。
          </div>
        ) : (
          <div className="card divide-y divide-line overflow-hidden">
            {p.replies.map((r) => {
              const ra = characters.find((c) => c.id === r.authorCharacterId)
              return (
                <div key={r.id} className="flex items-start gap-3 px-4 py-3">
                  <Avatar name={r.authorName} src={r.authorAvatar} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium">{r.authorName}</span>
                      {ra ? (
                        <Link to={`/characters/${ra.id}`} className="link text-[11px]">
                          档案
                        </Link>
                      ) : null}
                      <span className="text-[11px] text-subtle">
                        {relTime(r.createdAt)}
                      </span>
                    </div>
                    <div className="mt-1">
                      <MarkdownView text={r.content} resolve={resolve} />
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm shrink-0"
                    onClick={() => deleteReply(r.id)}
                    title="删除回复"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="card card-pad">
        <h2 className="mb-3 text-[13.5px] font-medium">发表回复</h2>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => setReplyAs('')}
            className={`flex items-center gap-1.5 rounded-full border py-1 pl-1.5 pr-3 text-[12px] transition-colors ${
              replyAs === ''
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-line text-muted hover:border-line-strong'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sunken">
              <UserRound size={11} />
            </span>
            访客
          </button>
          {characters.map((c) => {
            const on = replyAs === c.id
            return (
              <button
                key={c.id}
                onClick={() => setReplyAs(c.id)}
                className={`flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-[12px] transition-colors ${
                  on ? 'border-accent bg-accent-soft text-accent' : 'border-line text-muted'
                }`}
              >
                <Avatar name={c.name} src={c.avatar} color={c.color} size={20} />
                {c.name}
              </button>
            )
          })}
        </div>

        {replyAs === '' ? (
          <input
            className="input mb-2.5"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="访客名（可留空）"
          />
        ) : null}

        <textarea
          className="textarea"
          rows={4}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="支持 Markdown，用 *斜体* 写动作描写"
        />
        <div className="mt-3 flex justify-end">
          <button className="btn btn-primary" onClick={sendReply} disabled={!replyText.trim()}>
            <Send size={13} />
            发送
          </button>
        </div>
      </section>

      <PostEditor open={editOpen} onClose={() => setEditOpen(false)} initial={p} />

      <Modal
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        title="删除帖子"
        width={400}
        footer={
          <>
            <button className="btn" onClick={() => setConfirmDel(false)}>
              取消
            </button>
            <button
              className="btn btn-danger"
              onClick={async () => {
                await db.posts.delete(p.id)
                nav('/forum')
              }}
            >
              确认删除
            </button>
          </>
        }
      >
        <p className="text-[13.5px]">
          确定删除帖子 <b>{p.title}</b> 及其 {p.replies.length} 条回复吗？
        </p>
      </Modal>
    </div>
  )
}
