import { useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { useWorldId } from './world'
import type { WikiResolver } from './markdown'

/** 把 [[词条名]] 解析为世界观词条或人物档案的链接（HashRouter 用 #/ 前缀） */
export function useWikiResolver(): WikiResolver {
  const worldId = useWorldId()
  const entries =
    useLiveQuery(
      () => db.worldEntries.where('worldId').equals(worldId).toArray(),
      [worldId]
    ) ?? []
  const chars =
    useLiveQuery(
      () => db.characters.where('worldId').equals(worldId).toArray(),
      [worldId]
    ) ?? []

  return useCallback(
    (title: string) => {
      const w = entries.find((e) => e.title === title)
      if (w) return { href: `#/world/${w.id}` }
      const c = chars.find((x) => x.name === title || x.alias === title)
      if (c) return { href: `#/characters/${c.id}` }
      return null
    },
    [entries, chars]
  )
}
