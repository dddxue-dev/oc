import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { UserRound } from 'lucide-react'
import { db, now, uid } from '@/lib/db'
import { useWorldId } from '@/lib/world'
import { avatarUrl } from '@/lib/placeholder'
import type { ForumPost } from '@/lib/types'
import { Avatar, Field, Modal } from './ui'

export default function PostEditor({
  open,
  onClose,
  initial,
  defaultBoardId,
}: {
  open: boolean
  onClose: () => void
  initial?: ForumPost | null
  defaultBoardId?: string
}) {
  const [boardId, setBoardId] = useState('')
  const [authorId, setAuthorId] = useState<string>('')
  const [guestName, setGuestName] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const worldId = useWorldId()
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

  useEffect(() => {
    if (!open) return
    if (initial) {
      setBoardId(initial.boardId)
      setAuthorId(initial.authorCharacterId ?? '')
      setGuestName(initial.authorCharacterId ? '' : initial.authorName)
      setTitle(initial.title)
      setContent(initial.content)
    } else {
      setBoardId(defaultBoardId || boards[0]?.id || '')
      setAuthorId('')
      setGuestName('')
      setTitle('')
      setContent('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial, defaultBoardId])

  const author = characters.find((c) => c.id === authorId)
  const finalName = author ? author.name : guestName.trim() || '访客'

  const save = async () => {
    if (!title.trim() || !boardId) return
    await db.posts.put({
      id: initial?.id ?? uid(),
      worldId,
      boardId,
      title: title.trim(),
      content,
      authorCharacterId: author?.id,
      authorName: finalName,
      authorAvatar: author ? author.avatar || avatarUrl(author.name, author.color) : undefined,
      pinned: initial?.pinned,
      createdAt: initial?.createdAt ?? now(),
      updatedAt: now(),
      replies: initial?.replies ?? [],
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? '编辑帖子' : '发表新帖'}
      width={720}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            取消
          </button>
          <button
            className="btn btn-primary"
            onClick={save}
            disabled={!title.trim() || !boardId}
          >
            发布
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <Field label="发帖身份" hint="选择一位 OC，帖子里会显示他/她的头像和名字">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setAuthorId('')}
              className={`flex items-center gap-1.5 rounded-full border py-1 pl-1.5 pr-3 text-[12.5px] transition-colors ${
                authorId === ''
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-line text-muted hover:border-line-strong'
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sunken">
                <UserRound size={13} />
              </span>
              访客身份
            </button>
            {characters.map((c) => {
              const on = authorId === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setAuthorId(c.id)}
                  className={`flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-[12.5px] transition-colors ${
                    on ? 'border-accent bg-accent-soft text-accent' : 'border-line text-muted'
                  }`}
                >
                  <Avatar name={c.name} src={c.avatar} color={c.color} size={24} />
                  {c.name}
                </button>
              )
            })}
          </div>
        </Field>

        {!author ? (
          <Field label="访客名">
            <input
              className="input"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="访客"
            />
          </Field>
        ) : (
          <div className="flex items-center gap-2.5 rounded-[10px] border border-line bg-sunken px-3 py-2 text-[12.5px] text-muted">
            <Avatar name={author.name} src={author.avatar} color={author.color} size={26} />
            将以 <b className="text-fg">{author.name}</b> 的身份发帖
            {author.alias ? <span className="text-subtle">「{author.alias}」</span> : null}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-[1fr_1.6fr]">
          <Field label="板块">
            <select
              className="select"
              value={boardId}
              onChange={(e) => setBoardId(e.target.value)}
            >
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="标题 *">
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="帖子标题"
            />
          </Field>
        </div>

        <Field label="正文" hint="支持 Markdown；用 *斜体* 表示动作描写很常见">
          <textarea
            className="textarea"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={'写点什么……'}
          />
        </Field>
      </div>
    </Modal>
  )
}
