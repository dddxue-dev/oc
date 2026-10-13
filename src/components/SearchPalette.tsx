import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { BookOpen, Globe2, Images, MessagesSquare, Search, Users } from 'lucide-react'
import { db } from '@/lib/db'
import { plainText } from '@/lib/markdown'
import { avatarUrl } from '@/lib/placeholder'

interface Hit {
  id: string
  type: string
  icon: React.ReactNode
  title: string
  sub: string
  href: string
  avatar?: string
}

export default function SearchPalette({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const nav = useNavigate()

  const characters = useLiveQuery(() => db.characters.toArray(), []) ?? []
  const world = useLiveQuery(() => db.worldEntries.toArray(), []) ?? []
  const events = useLiveQuery(() => db.events.toArray(), []) ?? []
  const gallery = useLiveQuery(() => db.gallery.toArray(), []) ?? []
  const stories = useLiveQuery(() => db.stories.toArray(), []) ?? []
  const posts = useLiveQuery(() => db.posts.toArray(), []) ?? []

  useEffect(() => {
    if (open) {
      setQ('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  const hits = useMemo<Hit[]>(() => {
    const kw = q.trim().toLowerCase()
    const all: Hit[] = [
      ...characters.map((c) => ({
        id: c.id,
        type: '人物档案',
        icon: <Users size={14} />,
        title: c.name,
        sub: [c.alias, c.species, c.affiliation].filter(Boolean).join(' · '),
        href: `/characters/${c.id}`,
        avatar: c.avatar || avatarUrl(c.name, c.color),
      })),
      ...world.map((w) => ({
        id: w.id,
        type: '世界观',
        icon: <Globe2 size={14} />,
        title: w.title,
        sub: `${w.category}${w.summary ? ' · ' + w.summary : ''}`,
        href: `/world/${w.id}`,
      })),
      ...events.map((e) => ({
        id: e.id,
        type: '事件',
        icon: <Globe2 size={14} />,
        title: e.title,
        sub: `${e.era || ''}${e.year} 年`,
        href: `/world/timeline?focus=${e.id}`,
      })),
      ...gallery.map((g) => ({
        id: g.id,
        type: '画廊',
        icon: <Images size={14} />,
        title: g.title,
        sub: [g.artist, g.category].filter(Boolean).join(' · '),
        href: `/gallery?focus=${g.id}`,
      })),
      ...stories.map((s) => ({
        id: s.id,
        type: '故事',
        icon: <BookOpen size={14} />,
        title: s.title,
        sub: s.summary || plainText(s.content || '', 60),
        href: `/stories/${s.id}`,
      })),
      ...posts.map((p) => ({
        id: p.id,
        type: '帖子',
        icon: <MessagesSquare size={14} />,
        title: p.title,
        sub: `${p.authorName} · ${plainText(p.content, 50)}`,
        href: `/forum/post/${p.id}`,
      })),
    ]
    if (!kw) return all.slice(0, 12)
    return all
      .filter(
        (h) =>
          h.title.toLowerCase().includes(kw) || h.sub.toLowerCase().includes(kw)
      )
      .slice(0, 40)
  }, [q, characters, world, events, gallery, stories, posts])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((a) => Math.min(a + 1, hits.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive((a) => Math.max(a - 1, 0))
      }
      if (e.key === 'Enter' && hits[active]) {
        nav(hits[active].href)
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, hits, active, nav, onClose])

  useEffect(() => setActive(0), [q])

  if (!open) return null

  const grouped = hits.reduce<Record<string, Hit[]>>((acc, h) => {
    ;(acc[h.type] ||= []).push(h)
    return acc
  }, {})

  let flatIndex = -1

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/35 p-4 pt-[12vh] backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="card w-full max-w-[620px] overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
          <Search size={16} className="text-subtle" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索人物、词条、事件、作品、帖子…"
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-subtle"
          />
          <span className="chip shrink-0">Esc</span>
        </div>
        <div className="max-h-[52vh] overflow-y-auto py-1.5">
          {hits.length === 0 ? (
            <div className="px-4 py-10 text-center text-[13px] text-muted">
              没有匹配的结果
            </div>
          ) : (
            Object.entries(grouped).map(([type, list]) => (
              <div key={type} className="mb-1">
                <div className="px-4 py-1 text-[11px] font-medium uppercase tracking-wide text-subtle">
                  {type}
                </div>
                {list.map((h) => {
                  flatIndex++
                  const idx = flatIndex
                  return (
                    <button
                      key={h.id}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => {
                        nav(h.href)
                        onClose()
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                        active === idx ? 'bg-sunken' : ''
                      }`}
                    >
                      {h.avatar ? (
                        <img
                          src={h.avatar}
                          alt=""
                          className="h-6 w-6 shrink-0 rounded-full border border-line object-cover"
                        />
                      ) : (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sunken text-muted">
                          {h.icon}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px]">{h.title}</span>
                        {h.sub ? (
                          <span className="block truncate text-[12px] text-muted">
                            {h.sub}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
