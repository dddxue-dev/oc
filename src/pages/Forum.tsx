import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  FolderPlus,
  MessageSquare,
  Pencil,
  Pin,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { db, uid } from '@/lib/db'
import { useWorldId } from '@/lib/world'
import type { ForumBoard, ForumPost } from '@/lib/types'
import { useParamState } from '@/lib/useParam'
import PostEditor from '@/components/PostEditor'
import { Avatar, Empty, Field, Modal, PageHeader } from '@/components/ui'

function relTime(ts: number) {
  const d = Date.now() - ts
  const min = Math.floor(d / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} 小时前`
  const day = Math.floor(h / 24)
  if (day < 30) return `${day} 天前`
  return new Date(ts).toLocaleDateString('zh-CN')
}

export default function Forum() {
  const worldId = useWorldId()
  const [boardId, setBoardId] = useParamState('board')
  const [q, setQ] = useState('')
  const [postOpen, setPostOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null)
  const [boardEditorOpen, setBoardEditorOpen] = useState(false)
  const [editingBoard, setEditingBoard] = useState<ForumBoard | null>(null)
  const [boardName, setBoardName] = useState('')
  const [boardDesc, setBoardDesc] = useState('')

  const boards =
    useLiveQuery(
      () => db.boards.where('worldId').equals(worldId).sortBy('order'),
      [worldId]
    ) ?? []
  const posts =
    useLiveQuery(() => db.posts.where('worldId').equals(worldId).toArray(), [
      worldId,
    ]) ?? []

  const currentBoard = boards.find((b) => b.id === boardId)

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return posts
      .filter((p) => {
        if (boardId && p.boardId !== boardId) return false
        if (!kw) return true
        return [p.title, p.content, p.authorName, ...p.replies.map((r) => r.content)]
          .join(' ')
          .toLowerCase()
          .includes(kw)
      })
      .sort((a, b) => {
        if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1
        return b.updatedAt - a.updatedAt
      })
  }, [posts, boardId, q])

  const openBoardEditor = (b: ForumBoard | null) => {
    setEditingBoard(b)
    setBoardName(b?.name ?? '')
    setBoardDesc(b?.description ?? '')
    setBoardEditorOpen(true)
  }

  const saveBoard = async () => {
    if (!boardName.trim()) return
    await db.boards.put({
      id: editingBoard?.id ?? uid(),
      worldId,
      name: boardName.trim(),
      description: boardDesc,
      order: editingBoard?.order ?? boards.length + 1,
    })
    setBoardEditorOpen(false)
  }

  const removeBoard = async (b: ForumBoard) => {
    const n = posts.filter((p) => p.boardId === b.id).length
    if (n > 0) {
      const ok = window.confirm(
        `板块「${b.name}」下还有 ${n} 个帖子，删除板块会一并删除这些帖子。确定吗？`
      )
      if (!ok) return
      await db.posts.where('boardId').equals(b.id).delete()
    }
    await db.boards.delete(b.id)
    if (boardId === b.id) setBoardId(null)
    setBoardEditorOpen(false)
  }

  return (
    <div>
      <PageHeader
        title={currentBoard ? currentBoard.name : '论坛'}
        subtitle={
          currentBoard
            ? `${currentBoard.description || '板块'} · ${list.length} 个帖子`
            : `${boards.length} 个板块 · ${posts.length} 个帖子`
        }
        actions={
          <>
            <button className="btn" onClick={() => openBoardEditor(null)}>
              <FolderPlus size={14} />
              新建板块
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingPost(null)
                setPostOpen(true)
              }}
            >
              <Plus size={14} />
              发表新帖
            </button>
          </>
        }
      />

      {boards.length === 0 ? (
        <Empty
          title="还没有板块"
          hint="先建一个板块，比如「公告板」「角色扮演」。"
          action={
            <button className="btn btn-primary" onClick={() => openBoardEditor(null)}>
              <Plus size={14} />
              新建板块
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px] flex-1 sm:max-w-[320px]">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
              />
              <input
                className="input pl-9"
                placeholder="搜索帖子标题、正文、作者…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            {currentBoard ? (
              <button className="chip chip-accent" onClick={() => setBoardId(null)}>
                {currentBoard.name}
                <X size={11} />
              </button>
            ) : null}
            {currentBoard ? (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => openBoardEditor(currentBoard)}
              >
                <Pencil size={12} />
                编辑板块
              </button>
            ) : null}
            <span className="ml-auto text-[11.5px] text-subtle">{list.length} 个帖子</span>
          </div>

          {list.length === 0 ? (
            <Empty
              title={posts.length === 0 ? '还没有帖子' : '没有匹配的帖子'}
              hint={posts.length === 0 ? '来发第一帖吧。' : '换个关键词，或在左侧切换板块。'}
              action={
                posts.length === 0 ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setEditingPost(null)
                      setPostOpen(true)
                    }}
                  >
                    <Plus size={14} />
                    发表新帖
                  </button>
                ) : null
              }
            />
          ) : (
            <div className="card divide-y divide-line overflow-hidden">
              {list.map((p) => {
                const board = boards.find((b) => b.id === p.boardId)
                return (
                  <div
                    key={p.id}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-sunken"
                  >
                    <Link to={`/forum/post/${p.id}`} className="shrink-0">
                      <Avatar name={p.authorName} src={p.authorAvatar} size={36} />
                    </Link>
                    <Link to={`/forum/post/${p.id}`} className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {p.pinned ? (
                          <Pin size={12} className="shrink-0 text-accent" />
                        ) : null}
                        <span className="truncate text-[14px] font-medium">{p.title}</span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11.5px] text-muted">
                        <span>{p.authorName}</span>
                        {board && !boardId ? (
                          <>
                            <span className="text-subtle">·</span>
                            <span>{board.name}</span>
                          </>
                        ) : null}
                        <span className="text-subtle">·</span>
                        <span>{relTime(p.updatedAt)}</span>
                      </div>
                    </Link>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="chip">
                        <MessageSquare size={10} />
                        {p.replies.length}
                      </span>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setEditingPost(p)
                          setPostOpen(true)
                        }}
                        title="编辑"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={async () => {
                          if (window.confirm(`删除帖子「${p.title}」？`)) {
                            await db.posts.delete(p.id)
                          }
                        }}
                        title="删除"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      <PostEditor
        open={postOpen}
        onClose={() => setPostOpen(false)}
        initial={editingPost}
        defaultBoardId={boardId ?? undefined}
      />

      <Modal
        open={boardEditorOpen}
        onClose={() => setBoardEditorOpen(false)}
        title={editingBoard ? '编辑板块' : '新建板块'}
        width={440}
        footer={
          <>
            {editingBoard ? (
              <button className="btn btn-danger" onClick={() => removeBoard(editingBoard)}>
                <Trash2 size={13} />
                删除板块
              </button>
            ) : null}
            <div className="flex-1" />
            <button className="btn" onClick={() => setBoardEditorOpen(false)}>
              取消
            </button>
            <button
              className="btn btn-primary"
              onClick={saveBoard}
              disabled={!boardName.trim()}
            >
              保存
            </button>
          </>
        }
      >
        <div className="grid gap-3">
          <Field label="板块名称 *">
            <input
              className="input"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="如：设定议事厅"
            />
          </Field>
          <Field label="板块说明">
            <input
              className="input"
              value={boardDesc}
              onChange={(e) => setBoardDesc(e.target.value)}
              placeholder="这个板块用来做什么"
            />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
