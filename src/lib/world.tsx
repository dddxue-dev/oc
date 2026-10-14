import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, now, uid } from './db'
import { WORLD_ACCENTS, type World } from './types'

const KEY = 'oc-world'

export interface NewWorldInput {
  name: string
  tagline?: string
  era?: string
  accent?: string
}

interface WorldCtx {
  /** 全部世界观（按 order 排序） */
  worlds: World[]
  /** 当前世界观 id */
  worldId: string
  /** 当前世界观记录 */
  world: World | undefined
  setWorldId: (id: string) => void
  /** 新建一个空世界观并切过去，返回新 id */
  createWorld: (input: NewWorldInput) => Promise<string>
}

const Ctx = createContext<WorldCtx | null>(null)

function readStored(): string {
  try {
    return localStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

function writeStored(id: string) {
  try {
    localStorage.setItem(KEY, id)
  } catch {
    /* 隐私模式下忽略 */
  }
}

export function WorldProvider({ children }: { children: ReactNode }) {
  const rows = useLiveQuery(() => db.worlds.orderBy('order').toArray(), [])
  const [stored, setStored] = useState<string>(readStored)

  const worlds = useMemo(() => rows ?? [], [rows])
  const loading = rows === undefined

  /** 当前世界观：优先用记住的那个，失效则退回第一个 */
  const worldId = useMemo(() => {
    if (!worlds.length) return ''
    return worlds.some((w) => w.id === stored) ? stored : worlds[0].id
  }, [worlds, stored])

  useEffect(() => {
    if (!worldId || worldId === stored) return
    setStored(worldId)
    writeStored(worldId)
  }, [worldId, stored])

  /** 兜底：一个世界观都没有时自建一个，避免整站卡在空态 */
  useEffect(() => {
    if (loading || worlds.length) return
    const ts = now()
    void db.worlds.put({
      id: 'w-' + uid(),
      name: '未命名世界观',
      tagline: '在这里写下你的设定',
      accent: WORLD_ACCENTS[0],
      order: 0,
      createdAt: ts,
      updatedAt: ts,
    })
  }, [loading, worlds.length])

  const setWorldId = useCallback((id: string) => {
    setStored(id)
    writeStored(id)
  }, [])

  const createWorld = useCallback(
    async (input: NewWorldInput) => {
      const order = worlds.length
        ? Math.max(...worlds.map((w) => w.order)) + 1
        : 0
      const ts = now()
      const id = 'w-' + uid()
      await db.worlds.put({
        id,
        name: input.name.trim() || '未命名世界观',
        tagline: input.tagline?.trim() || undefined,
        era: input.era?.trim() || undefined,
        accent: input.accent || WORLD_ACCENTS[order % WORLD_ACCENTS.length],
        order,
        createdAt: ts,
        updatedAt: ts,
      })
      setStored(id)
      writeStored(id)
      return id
    },
    [worlds]
  )

  const value = useMemo<WorldCtx>(
    () => ({
      worlds,
      worldId,
      world: worlds.find((w) => w.id === worldId),
      setWorldId,
      createWorld,
    }),
    [worlds, worldId, setWorldId, createWorld]
  )

  if (loading || !worldId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app">
        <div className="text-[12.5px] text-subtle">正在载入世界观…</div>
      </div>
    )
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useWorld() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useWorld 必须在 WorldProvider 内使用')
  return ctx
}

/** 只取当前世界观 id —— 页面里最常用的写法 */
export function useWorldId() {
  return useWorld().worldId
}
