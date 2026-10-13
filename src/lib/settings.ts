import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'

/** 简单的键值配置读写（存 IndexedDB） */
export function useSetting<T>(key: string, fallback: T) {
  const row = useLiveQuery(() => db.settings.get(key), [key])
  const value = (row?.value as T) ?? fallback
  const set = async (v: T) => {
    await db.settings.put({ key, value: v })
  }
  return [value, set] as const
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db.settings.get(key)
  return (row?.value as T) ?? fallback
}
