import Dexie, { type Table } from 'dexie'
import type {
  Character,
  EventItem,
  ForumBoard,
  ForumPost,
  GalleryItem,
  NodePos,
  Relation,
  Settings,
  Story,
  World,
  WorldEntry,
} from './types'

/** 第一个世界观（存量数据全部归到这里） */
export const DEFAULT_WORLD_ID = 'w-ashen'
/** 第二个世界观：东方仙侠 */
export const XIANXIA_WORLD_ID = 'w-xianxia'

/** 需要按世界观隔离的业务表名 */
export const SCOPED_TABLES = [
  'characters',
  'worldEntries',
  'events',
  'gallery',
  'stories',
  'boards',
  'posts',
  'relations',
  'nodePositions',
] as const

export class OCDatabase extends Dexie {
  worlds!: Table<World, string>
  characters!: Table<Character, string>
  worldEntries!: Table<WorldEntry, string>
  events!: Table<EventItem, string>
  gallery!: Table<GalleryItem, string>
  stories!: Table<Story, string>
  boards!: Table<ForumBoard, string>
  posts!: Table<ForumPost, string>
  relations!: Table<Relation, string>
  nodePositions!: Table<NodePos, string>
  settings!: Table<Settings, string>

  constructor() {
    super('oc-archive')

    this.version(1).stores({
      characters: 'id, name, updatedAt, *tags',
      worldEntries: 'id, title, category, parentId, updatedAt, *tags',
      events: 'id, title, year, era, updatedAt, *tags',
      gallery: 'id, title, category, createdAt, *tags',
      stories: 'id, title, status, updatedAt, *tags',
      boards: 'id, order',
      posts: 'id, boardId, createdAt, updatedAt',
      relations: 'id, source, target',
      nodePositions: 'id',
      settings: 'key',
    })

    /**
     * v2：引入「世界观」维度。
     * - 新增 worlds 表
     * - 所有业务表加 worldId 索引
     * - 存量数据全部归到默认世界观；故事原有的 worldId（其实是词条 id）改名为 entryId
     */
    this.version(2)
      .stores({
        worlds: 'id, order, updatedAt',
        characters: 'id, worldId, name, updatedAt, *tags',
        worldEntries: 'id, worldId, title, category, parentId, updatedAt, *tags',
        events: 'id, worldId, title, year, era, updatedAt, *tags',
        gallery: 'id, worldId, title, category, createdAt, *tags',
        stories: 'id, worldId, entryId, title, status, updatedAt, *tags',
        boards: 'id, worldId, order',
        posts: 'id, worldId, boardId, createdAt, updatedAt',
        relations: 'id, worldId, source, target',
        nodePositions: 'id, worldId',
        settings: 'key',
      })
      .upgrade(async (tx) => {
        const ts = Date.now()
        const worlds = tx.table('worlds')
        if (!(await worlds.get(DEFAULT_WORLD_ID))) {
          await worlds.put({
            id: DEFAULT_WORLD_ID,
            name: '灰烬纪',
            tagline: '灰烬沉降之后，沿岸文明在长夜里重建',
            era: '灰烬历',
            accent: '#5b7fa6',
            order: 0,
            createdAt: ts,
            updatedAt: ts,
          })
        }

        // 故事要单独处理：旧 worldId 存的是词条 id
        await tx
          .table('stories')
          .toCollection()
          .modify((rec: Record<string, unknown>) => {
            const legacy = rec.worldId
            if (typeof legacy === 'string' && legacy !== DEFAULT_WORLD_ID) {
              if (rec.entryId === undefined) rec.entryId = legacy
            }
            rec.worldId = DEFAULT_WORLD_ID
          })

        for (const name of SCOPED_TABLES) {
          if (name === 'stories') continue
          await tx
            .table(name)
            .toCollection()
            .modify((rec: Record<string, unknown>) => {
              if (rec.worldId === undefined) rec.worldId = DEFAULT_WORLD_ID
            })
        }
      })
  }
}

export const db = new OCDatabase()

export const uid = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)

export const now = () => Date.now()

/** 清空全部业务数据（保留世界观本身，便于用户留着空壳继续用） */
export async function clearAll() {
  const tables = SCOPED_TABLES.map((n) => db.table(n))
  await db.transaction('rw', tables, async () => {
    await Promise.all(tables.map((t) => t.clear()))
  })
}
