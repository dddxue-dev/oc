import { Check } from 'lucide-react'
import { PRESETS, useTheme } from '@/lib/theme'

/**
 * 内嵌配色色卡：点一下即切换主题，不用展开下拉。
 *
 * - 默认（顶栏）：一排圆点，圆点填色 = 该配色的强调色
 * - withLabel（移动端抽屉 / 设置页）：圆点 + 配色名，两列网格
 *
 * 只使用主题令牌（accent / line / app / surface），换色时自动跟随。
 */
export default function ColorSwatches({
  size = 15,
  withLabel = false,
  className = '',
}: {
  /** 圆点直径（px），仅默认形态生效 */
  size?: number
  /** 是否显示配色名（两列网格） */
  withLabel?: boolean
  className?: string
}) {
  const { preset, setPreset } = useTheme()

  if (withLabel) {
    return (
      <div className={`grid grid-cols-2 gap-1.5 ${className}`}>
        {PRESETS.map((p) => {
          const active = preset === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p.id)}
              title={p.desc}
              aria-pressed={active}
              className={`flex items-center gap-2 rounded-[8px] border px-2 py-1.5 text-left transition-colors ${
                active
                  ? 'border-accent bg-accent-soft'
                  : 'border-line hover:border-line-strong'
              }`}
            >
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full border border-line"
                style={{ background: p.swatch[1] }}
              />
              <span
                className={`min-w-0 flex-1 truncate text-[12px] ${
                  active ? 'text-accent' : 'text-fg'
                }`}
              >
                {p.name}
              </span>
              {active ? <Check size={11} className="shrink-0 text-accent" /> : null}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {PRESETS.map((p) => {
        const active = preset === p.id
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            title={`${p.name} · ${p.desc}`}
            aria-label={`切换配色：${p.name}`}
            aria-pressed={active}
            className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-app"
            style={{ width: size, height: size }}
          >
            <span
              className={`block h-full w-full rounded-full border transition-transform duration-150 hover:scale-110 ${
                active
                  ? 'border-transparent ring-2 ring-accent ring-offset-2 ring-offset-app'
                  : 'border-line'
              }`}
              style={{ background: p.swatch[1] }}
            />
          </button>
        )
      })}
    </div>
  )
}
