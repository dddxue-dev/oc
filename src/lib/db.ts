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
  WorldEntry,
} from './types'

export class OCDatabase extends Dexie {
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
  }
}

export const db = new OCDatabase()

export const uid = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)

export const now = () => Date.now()

/** 清空全部业务数据（保留结构） */
export async function clearAll() {
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
  )
}
