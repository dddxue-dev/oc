import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-react'
import { MODES, useTheme } from '@/lib/theme'

/**
 * 顶栏「明暗」切换。
 * 配色已移到顶栏内嵌的 ColorSwatches，这里只负责浅色 / 深色 / 跟随系统。
 */
export default function ThemeMenu() {
  const { mode, setMode } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = MODES.find((m) => m.id === mode)
  const CurrentIcon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor

  return (
    <div className="relative" ref={ref}>
      <button
        className="btn btn-sm"
        onClick={() => setOpen((o) => !o)}
        title={`明暗：${current?.name}`}
      >
        <CurrentIcon size={14} />
        <span className="hidden xl:inline">{current?.name}</span>
        <ChevronDown size={12} className="text-subtle" />
      </button>

      {open ? (
        <div className="card absolute right-0 top-[40px] z-50 w-[136px] p-1.5">
          {MODES.map((m) => {
            const Icon = m.id === 'light' ? Sun : m.id === 'dark' ? Moon : Monitor
            const active = mode === m.id
            return (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-left text-[12.5px] transition-colors ${
                  active
                    ? 'bg-accent-soft text-accent'
                    : 'text-muted hover:bg-sunken hover:text-fg'
                }`}
              >
                <Icon size={13} />
                <span className="flex-1">{m.name}</span>
                {active ? <Check size={11} /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
