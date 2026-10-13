import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemePreset =
  | 'blue'
  | 'crimson'
  | 'moss'
  | 'violet'
  | 'amber'
  | 'celadon'
  | 'plum'
  | 'graphite'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface PresetMeta {
  id: ThemePreset
  name: string
  desc: string
  /** [底色, 强调色, 前景色]，用于选择器色卡 */
  swatch: [string, string, string]
}

export const PRESETS: PresetMeta[] = [
  { id: 'blue', name: '蓝白', desc: '雾蓝 · 冷静克制', swatch: ['#f6f7f9', '#5b7fa6', '#1f2430'] },
  { id: 'crimson', name: '黑红', desc: '暗绛 · 沉静有力', swatch: ['#1a1716', '#a6474a', '#eae5e3'] },
  { id: 'moss', name: '墨绿', desc: '苔青 · 自然平和', swatch: ['#f6f8f6', '#4f7a63', '#1e2621'] },
  { id: 'violet', name: '藤紫', desc: '紫灰 · 柔和内敛', swatch: ['#f7f7fa', '#6f6aa3', '#232230'] },
  { id: 'amber', name: '琥珀', desc: '暖褐 · 旧纸温度', swatch: ['#faf8f4', '#9a7448', '#2a231a'] },
  { id: 'celadon', name: '青瓷', desc: '薄荷灰 · 清透素净', swatch: ['#f5f8f8', '#4a7d84', '#1d2527'] },
  { id: 'plum', name: '藕荷', desc: '玫瑰灰 · 含蓄温润', swatch: ['#faf7f9', '#8a5a72', '#271f23'] },
  { id: 'graphite', name: '石墨', desc: '中性灰 · 纯粹无彩', swatch: ['#f6f6f7', '#5f6368', '#1f2023'] },
]

export const MODES: { id: ThemeMode; name: string }[] = [
  { id: 'light', name: '浅色' },
  { id: 'dark', name: '深色' },
  { id: 'system', name: '跟随系统' },
]

const P_KEY = 'oc-theme-preset'
const M_KEY = 'oc-theme-mode'

const VALID_PRESETS = PRESETS.map((p) => p.id)

function readPreset(): ThemePreset {
  try {
    const v = localStorage.getItem(P_KEY) as ThemePreset | null
    return v && VALID_PRESETS.includes(v) ? v : 'blue'
  } catch {
    return 'blue'
  }
}

function readMode(): ThemeMode {
  try {
    const v = localStorage.getItem(M_KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

function applyTheme(preset: ThemePreset, mode: ThemeMode) {
  const el = document.documentElement
  el.setAttribute('data-theme', preset)
  el.setAttribute('data-mode', mode)
  const dark =
    mode === 'dark' ||
    (mode === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  el.classList.toggle('dark', dark)
}

interface ThemeCtx {
  preset: ThemePreset
  mode: ThemeMode
  setPreset: (p: ThemePreset) => void
  setMode: (m: ThemeMode) => void
}

const Ctx = createContext<ThemeCtx | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<ThemePreset>(readPreset)
  const [mode, setMode] = useState<ThemeMode>(readMode)

  useEffect(() => {
    applyTheme(preset, mode)
    try {
      localStorage.setItem(P_KEY, preset)
      localStorage.setItem(M_KEY, mode)
    } catch {
      /* 忽略隐私模式下的写入失败 */
    }
  }, [preset, mode])

  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme(preset, 'system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode, preset])

  const value = useMemo(
    () => ({
      preset,
      mode,
      setPreset: (p: ThemePreset) => setPreset(p),
      setMode: (m: ThemeMode) => setMode(m),
    }),
    [preset, mode]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTheme() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTheme 必须在 ThemeProvider 内使用')
  return ctx
}

/** 当前是否处于深色（用于需要 JS 判断的场景） */
export function useIsDark() {
  const { preset, mode } = useTheme()
  const [dark, setDark] = useState(
    () => document.documentElement.classList.contains('dark')
  )
  useEffect(() => {
    const read = () => setDark(document.documentElement.classList.contains('dark'))
    read()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', read)
    return () => mq.removeEventListener('change', read)
  }, [preset, mode])
  return dark
}
