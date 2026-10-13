/** 数据模型定义 —— 全部实体都存本地 IndexedDB */

export interface Character {
  id: string
  name: string
  /** 代称 / 称号 / 化名 */
  alias?: string
  /** 头像：data URL 或本地图片路径 */
  avatar?: string
  /** 代表色（用于关系图节点、标签） */
  color?: string
  gender?: string
  age?: string
  species?: string
  affiliation?: string
  status?: string
  appearance?: string
  personality?: string
  abilities?: string
  goals?: string
  quote?: string
  backstory?: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

/** 世界观词条（树状，支持分类与内链） */
export interface WorldEntry {
  id: string
  title: string
  /** 地理 / 历史 / 体系 / 种族 / 组织 / 术语 …… */
  category: string
  parentId?: string
  summary?: string
  content?: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

/** 事件（时间线的基本单元，年份支持负数表示「创世前」） */
export interface EventItem {
  id: string
  title: string
  /** 纪年名，如「创世纪」「灰烬历」 */
  era?: string
  year: number
  endYear?: number
  summary?: string
  content?: string
  location?: string
  characterIds: string[]
  tags: string[]
  createdAt: number
  updatedAt: number
}

export interface GalleryItem {
  id: string
  title: string
  /** data URL */
  image: string
  artist?: string
  category?: string
  description?: string
  characterIds: string[]
  tags: string[]
  date?: string
  createdAt: number
}

export interface Story {
  id: string
  title: string
  cover?: string
  summary?: string
  content?: string
  status?: string
  /** 所属世界观（指向 WorldEntry.id，通常选顶层词条） */
  worldId?: string
  tags: string[]
  characterIds: string[]
  createdAt: number
  updatedAt: number
}

export interface ForumBoard {
  id: string
  name: string
  description?: string
  order: number
}

export interface ForumReply {
  id: string
  content: string
  /** 以哪个 OC 身份回帖（可空 = 使用访客名） */
  authorCharacterId?: string
  authorName: string
  authorAvatar?: string
  createdAt: number
}

export interface ForumPost {
  id: string
  boardId: string
  title: string
  content: string
  authorCharacterId?: string
  /** 冗余保存，角色被删后帖子仍能正确显示 */
  authorName: string
  authorAvatar?: string
  pinned?: boolean
  createdAt: number
  updatedAt: number
  replies: ForumReply[]
}

/** 关系图连线 */
export interface Relation {
  id: string
  source: string
  target: string
  label: string
}

/** 关系图节点坐标 */
export interface NodePos {
  id: string
  x: number
  y: number
}

export interface Settings {
  key: string
  value: unknown
}

export interface BackupFile {
  app: 'oc-archive'
  version: number
  exportedAt: number
  data: {
    characters: Character[]
    worldEntries: WorldEntry[]
    events: EventItem[]
    gallery: GalleryItem[]
    stories: Story[]
    boards: ForumBoard[]
    posts: ForumPost[]
    relations: Relation[]
    nodePositions: NodePos[]
  }
}

export const WORLD_CATEGORIES = [
  '地理',
  '历史',
  '体系',
  '种族',
  '组织',
  '术语',
  '其他',
] as const

export const GALLERY_CATEGORIES = [
  '插画',
  '角色设计',
  '场景',
  '漫画',
  '草图',
] as const

export const STORY_STATUS = ['连载中', '已完结', '草稿'] as const

export const RELATION_PRESETS = [
  '亲属',
  '挚友',
  '同伴',
  '宿敌',
  '师徒',
  '上下级',
  '恋人',
  '单恋',
  '认识',
  '其他',
] as const
