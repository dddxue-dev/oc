import { db } from './db'
import type { BackupFile } from './types'

export async function collectBackup(): Promise<BackupFile> {
  const [
    characters,
    worldEntries,
    events,
    gallery,
    stories,
    boards,
    posts,
    relations,
    nodePositions,
  ] = await Promise.all([
    db.characters.toArray(),
    db.worldEntries.toArray(),
    db.events.toArray(),
    db.gallery.toArray(),
    db.stories.toArray(),
    db.boards.toArray(),
    db.posts.toArray(),
    db.relations.toArray(),
    db.nodePositions.toArray(),
  ])

  return {
    app: 'oc-archive',
    version: 1,
    exportedAt: Date.now(),
    data: {
      characters,
      worldEntries,
      events,
      gallery,
      stories,
      boards,
      posts,
      relations,
      nodePositions,
    },
  }
}

export async function downloadBackup() {
  const backup = await collectBackup()
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `oc-archive-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return backup
}

export interface ImportResult {
  characters: number
  worldEntries: number
  events: number
  gallery: number
  stories: number
  boards: number
  posts: number
}

export async function importBackup(
  file: File,
  mode: 'replace' | 'merge' = 'replace'
): Promise<ImportResult> {
  const text = await file.text()
  const parsed = JSON.parse(text) as BackupFile
  if (!parsed || parsed.app !== 'oc-archive' || !parsed.data) {
    throw new Error('文件格式不正确：不是本应用导出的备份')
  }
  const d = parsed.data

  await db.transaction(
    'rw',
    [
      db.characters,
      db.worldEntries,
      db.events,
      db.gallery,
      db.stories,
      db.boards,
      db.posts,
      db.relations,
      db.nodePositions,
    ],
    async () => {
      if (mode === 'replace') {
        await Promise.all([
          db.characters.clear(),
          db.worldEntries.clear(),
          db.events.clear(),
          db.gallery.clear(),
          db.stories.clear(),
          db.boards.clear(),
          db.posts.clear(),
          db.relations.clear(),
          db.nodePositions.clear(),
        ])
      }
      if (d.characters?.length) await db.characters.bulkPut(d.characters)
      if (d.worldEntries?.length) await db.worldEntries.bulkPut(d.worldEntries)
      if (d.events?.length) await db.events.bulkPut(d.events)
      if (d.gallery?.length) await db.gallery.bulkPut(d.gallery)
      if (d.stories?.length) await db.stories.bulkPut(d.stories)
      if (d.boards?.length) await db.boards.bulkPut(d.boards)
      if (d.posts?.length) await db.posts.bulkPut(d.posts)
      if (d.relations?.length) await db.relations.bulkPut(d.relations)
      if (d.nodePositions?.length) await db.nodePositions.bulkPut(d.nodePositions)
    }
  )

  return {
    characters: d.characters?.length ?? 0,
    worldEntries: d.worldEntries?.length ?? 0,
    events: d.events?.length ?? 0,
    gallery: d.gallery?.length ?? 0,
    stories: d.stories?.length ?? 0,
    boards: d.boards?.length ?? 0,
    posts: d.posts?.length ?? 0,
  }
}
