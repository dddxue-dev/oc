import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, Plus } from 'lucide-react'
import { useWorld } from '@/lib/world'

const FALLBACK_ACCENT = '#5b7fa6'

/**
 * 左上角的世界观切换器（挨着 OC 标识）。
 * 切换后整站内容跟着换，所以顺手把路由拉回总览，
 * 免得停在「上一个世界观」的详情页上看到 404。
 */
export default function WorldSwitcher() {
  const { worlds, worldId, world, setWorldId, createWorld } = useWorld()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setCreating(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setCreating(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (id: string) => {
    if (id !== worldId) {
      setWorldId(id)
      navigate('/')
    }
    setOpen(false)
    setCreating(false)
  }

  const submit = async () => {
    const n = name.trim()
    if (!n) return
    await createWorld({ name: n })
    setName('')
    setCreating(false)
    setOpen(false)
    navigate('/')
  }

  const accent = world?.accent || FALLBACK_ACCENT

  return (
    <div className="relative min-w-0" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="切换世界观"
        className="flex min-w-0 items-center gap-2 rounded-[9px] px-2 py-1 text-left transition-colors hover:bg-sunken"
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: accent }}
        />
        <span className="min-w-0 max-w-[104px] leading-tight sm:max-w-[132px]">
          <span className="block truncate text-[13px] font-semibold tracking-tight">
            {world?.name ?? '未命名世界观'}
          </span>
          <span className="hidden truncate text-[10px] text-subtle sm:block">
            {world?.tagline || world?.era || '点击切换世界观'}
          </span>
        </span>
        <ChevronDown size={12} className="shrink-0 text-subtle" />
      </button>

      {open ? (
        <div className="card absolute left-0 top-[46px] z-50 w-[272px] p-2">
          <div className="mb-1.5 flex items-center justify-between px-1.5">
            <span className="text-[11px] font-medium text-muted">
              OC 档案馆 · 世界观
            </span>
            <span className="text-[11px] text-subtle">{worlds.length} 个</span>
          </div>

          <div className="flex max-h-[46vh] flex-col gap-0.5 overflow-y-auto">
            {worlds.map((w) => {
              const active = w.id === worldId
              return (
                <button
                  key={w.id}
                  onClick={() => pick(w.id)}
                  className={`flex items-center gap-2 rounded-[8px] border px-2 py-1.5 text-left transition-colors ${
                    active
                      ? 'border-accent bg-accent-soft'
                      : 'border-transparent hover:border-line-strong hover:bg-sunken'
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-line"
                    style={{ background: w.accent || FALLBACK_ACCENT }}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-[12.5px] ${
                        active ? 'font-medium text-accent' : 'text-fg'
                      }`}
                    >
                      {w.name}
                    </span>
                    {w.tagline ? (
                      <span className="block truncate text-[11px] text-subtle">
                        {w.tagline}
                      </span>
                    ) : null}
                  </span>
                  {active ? (
                    <Check size={12} className="shrink-0 text-accent" />
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="mt-1.5 border-t border-line pt-1.5">
            {creating ? (
              <div className="flex items-center gap-1.5 px-1.5 py-1">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void submit()
                  }}
                  placeholder="新世界观名称"
                  className="input h-7 py-0 text-[12px]"
                />
                <button className="btn btn-sm btn-primary" onClick={() => void submit()}>
                  建
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1.5 text-[12px] text-muted transition-colors hover:bg-sunken hover:text-fg"
              >
                <Plus size={13} />
                新建世界观
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
