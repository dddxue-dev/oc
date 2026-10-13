import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-react'
import { MODES, PRESETS, useTheme } from '@/lib/theme'

export default function ThemeMenu() {
  const { preset, mode, setPreset, setMode } = useTheme()
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

  const current = PRESETS.find((p) => p.id === preset)

  return (
    <div className="relative" ref={ref}>
      <button
        className="btn btn-sm"
        onClick={() => setOpen((o) => !o)}
        title="切换配色与明暗"
      >
        <span className="flex overflow-hidden rounded-full border border-line">
          {current?.swatch.map((c, i) => (
            <span key={i} style={{ background: c }} className="h-3.5 w-3" />
          ))}
        </span>
        <span className="hidden sm:inline">{current?.name}</span>
        <ChevronDown size={12} className="text-subtle" />
      </button>

      {open ? (
        <div className="card absolute right-0 top-[40px] z-50 w-[264px] p-3">
          <div className="mb-2 text-[11.5px] font-medium text-muted">
            配色 · {PRESETS.length} 套
          </div>
          <div className="mb-3 grid grid-cols-2 gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPreset(p.id)}
                title={p.desc}
                className={`flex items-center gap-1.5 rounded-[8px] border px-1.5 py-1.5 text-left transition-colors ${
                  preset === p.id
                    ? 'border-accent bg-accent-soft'
                    : 'border-line hover:border-line-strong'
                }`}
              >
                <span className="flex shrink-0 overflow-hidden rounded-full border border-line">
                  {p.swatch.map((c, i) => (
                    <span key={i} style={{ background: c }} className="h-3.5 w-[7px]" />
                  ))}
                </span>
                <span
                  className={`flex-1 truncate text-[11.5px] ${
                    preset === p.id ? 'text-accent' : 'text-fg'
                  }`}
                >
                  {p.name}
                </span>
                {preset === p.id ? <Check size={11} className="text-accent" /> : null}
              </button>
            ))}
          </div>

          <div className="mb-2 text-[11.5px] font-medium text-muted">明暗</div>
          <div className="grid grid-cols-3 gap-1.5">
            {MODES.map((m) => {
              const Icon = m.id === 'light' ? Sun : m.id === 'dark' ? Moon : Monitor
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  title={m.name}
                  className={`flex h-8 items-center justify-center gap-1 rounded-[8px] border text-[11.5px] transition-colors ${
                    mode === m.id
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-line text-muted hover:border-line-strong'
                  }`}
                >
                  <Icon size={12} />
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
