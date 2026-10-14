import { db, DEFAULT_WORLD_ID } from './db'
import type {
  BackupFile,
  Character,
  EventItem,
  ForumBoard,
  ForumPost,
  GalleryItem,
  NodePos,
  Relation,
  Story,
  World,
  WorldEntry,
} from './types'

export async function collectBackup(): Promise<BackupFile> {
  const [
    worlds,
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
    db.worlds.orderBy('order').toArray(),
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
    version: 2,
    exportedAt: Date.now(),
    data: {
      worlds,
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
  worlds: number
  characters: number
  worldEntries: number
  events: number
  gallery: number
  stories: number
  boards: number
  posts: number
}

/** 兜底世界观：导入 v1 老备份（没有 worlds 字段）时用它接住数据 */
function fallbackWorld(ts: number): World {
  return {
    id: DEFAULT_WORLD_ID,
    name: '灰烬纪',
    tagline: '灰烬沉降之后，沿岸文明在长夜里重建',
    era: '灰烬历',
    accent: '#5b7fa6',
    order: 0,
    createdAt: ts,
    updatedAt: ts,
  }
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

  // 备份文件可能是 v1（无 worlds、故事用 worldId 存词条 id），这里统一归一化
  const raw = parsed.data as unknown as Record<string, unknown[] | undefined>
  const ts = Date.now()
  let worlds = (raw.worlds as World[] | undefined) ?? []
  if (!worlds.length) worlds = [fallbackWorld(ts)]
  const worldIds = new Set(worlds.map((w) => w.id))
  const homeId = worlds[0].id

  /** 补 worldId：缺失或指向不存在的世界观时归到第一个 */
  const scope = <T>(rows: unknown[] | undefined): T[] =>
    (rows ?? []).map((r) => {
      const rec = { ...(r as Record<string, unknown>) }
      if (typeof rec.worldId !== 'string' || !worldIds.has(rec.worldId)) {
        rec.worldId = homeId
      }
      return rec as T
    })

  // 故事额外处理：v1 的 worldId 其实是词条 id，搬到 entryId
  const stories = (raw.stories ?? []).map((r) => {
    const rec = { ...(r as Record<string, unknown>) }
    const legacy = rec.worldId
    if (typeof legacy === 'string' && !worldIds.has(legacy)) {
      if (rec.entryId === undefined) rec.entryId = legacy
      rec.worldId = homeId
    } else if (typeof rec.worldId !== 'string') {
      rec.worldId = homeId
    }
    return rec as unknown as Story
  })

  const characters = scope<Character>(raw.characters)
  const worldEntries = scope<WorldEntry>(raw.worldEntries)
  const events = scope<EventItem>(raw.events)
  const gallery = scope<GalleryItem>(raw.gallery)
  const boards = scope<ForumBoard>(raw.boards)
  const posts = scope<ForumPost>(raw.posts)
  const relations = scope<Relation>(raw.relations)
  const nodePositions = scope<NodePos>(raw.nodePositions)

  await db.transaction(
    'rw',
    [
      db.worlds,
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
      await db.worlds.bulkPut(worlds)
      if (characters.length) await db.characters.bulkPut(characters)
      if (worldEntries.length) await db.worldEntries.bulkPut(worldEntries)
      if (events.length) await db.events.bulkPut(events)
      if (gallery.length) await db.gallery.bulkPut(gallery)
      if (stories.length) await db.stories.bulkPut(stories)
      if (boards.length) await db.boards.bulkPut(boards)
      if (posts.length) await db.posts.bulkPut(posts)
      if (relations.length) await db.relations.bulkPut(relations)
      if (nodePositions.length) await db.nodePositions.bulkPut(nodePositions)
    }
  )

  return {
    worlds: worlds.length,
    characters: characters.length,
    worldEntries: worldEntries.length,
    events: events.length,
    gallery: gallery.length,
    stories: stories.length,
    boards: boards.length,
    posts: posts.length,
  }
}
