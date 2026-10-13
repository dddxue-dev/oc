import { db, uid } from './db'
import { artUrl, avatarUrl } from './placeholder'
import type {
  Character,
  EventItem,
  ForumBoard,
  ForumPost,
  GalleryItem,
  NodePos,
  Relation,
  Story,
  WorldEntry,
} from './types'

const D = (days: number) => Date.now() - days * 86400000

const C = {
  shen: 'char-shenyan',
  bailu: 'char-bailu',
  helian: 'char-helianzhu',
  achi: 'char-achi',
  jianmo: 'char-jianmo',
}

function makeCharacters(): Character[] {
  const base = (
    id: string,
    name: string,
    color: string,
    extra: Partial<Character>
  ): Character => ({
    id,
    name,
    color,
    avatar: avatarUrl(name, color),
    tags: [],
    createdAt: D(60),
    updatedAt: D(3),
    ...extra,
  })

  return [
    base(C.shen, '沈砚', '#5b7fa6', {
      alias: '观测者',
      gender: '男',
      age: '二十七',
      species: '人类',
      affiliation: '无',
      status: '活动',
      appearance: '身形清瘦，惯穿深灰长风衣，左眼覆着薄绢——据说那里封着一段不属于他的记忆。',
      personality: '寡言、克制，习惯先观察再开口。对陌生事物有种近乎冷漠的好奇。',
      abilities: '共鸣术（观测型）：能读取物体上残留的情绪回响，代价是会被回响反噬。',
      goals: '找回自己被抹去的那三年。',
      quote: '“记忆不会说谎，说谎的是记得的人。”',
      backstory:
        '八十七年前灰烬海战役后，他被从废墟里抬出来时身上没有任何身份证明。\n\n此后他沿着海岸线走了很多年，记录每一座灯塔的熄灭时间。有人叫他观测者，他不否认，也不承认。',
      tags: ['主角', '观测者', '共鸣术'],
    }),
    base(C.bailu, '白露', '#4f7a63', {
      alias: '提灯者',
      gender: '女',
      age: '二十四',
      species: '人类',
      affiliation: '拾荒者营地',
      status: '活动',
      appearance: '发色浅得近乎透明，指节上常年沾着草药汁液的青痕。',
      personality: '温和但极其固执。会为了一个陌生伤员在雨里站一整夜。',
      abilities: '药剂学、创伤处理；能配出抑制共鸣反噬的稳定剂。',
      goals: '让灰烬海沿岸不再有人因为反噬发疯。',
      quote: '“先止血，再谈为什么。”',
      backstory: '出身拾荒者营地，是营地里唯一读过书的人。\n\n她的药箱里永远多备一份药——留给下一个不知道会从哪来的人。',
      tags: ['医者', '拾荒者'],
    }),
    base(C.helian, '赫连烛', '#a6474a', {
      alias: '焚风',
      gender: '女',
      age: '三十一',
      species: '人类',
      affiliation: '焚风军团',
      status: '活动',
      appearance: '高个，右肩有一道贯穿旧伤，说话时习惯用指节敲桌面。',
      personality: '雷厉风行，讨厌废话。对下属极护短。',
      abilities: '战术指挥、重兵器；共鸣术（压制型）。',
      goals: '把军团从「工具」变成「归宿」。',
      quote: '“我的人，我自己带回去。”',
      backstory: '灰烬海战役的幸存者之一。四十二年前亲手把残兵编成焚风军团。',
      tags: ['军团', '统领'],
    }),
    base(C.achi, '阿迟', '#8a7a5c', {
      alias: '齿轮匠',
      gender: '男',
      age: '十六',
      species: '人类',
      affiliation: '拾荒者营地',
      status: '活动',
      appearance: '个子矮小，工装裤上挂满扳手，护目镜永远推到额头上。',
      personality: '话多、好奇、藏不住事。',
      abilities: '机械修理、灯塔维护；能听出共鸣石的裂纹。',
      goals: '修好第十二座灯塔。',
      quote: '“坏的都能修，只是缺零件。”',
      backstory: '在废墟里被白露捡到，从此跟着营地修灯塔。',
      tags: ['少年', '匠人'],
    }),
    base(C.jianmo, '缄默', '#6b6f8a', {
      alias: '无名者',
      gender: '不明',
      age: '不明',
      species: '未知',
      affiliation: '未知',
      status: '潜伏',
      appearance: '始终裹在灰布斗篷里，看不见脸。走路没有声音。',
      personality: '难以捉摸。说的话往往在事情发生之后才显出意义。',
      abilities: '不明。所有关于他的记录都会在某个时刻变得模糊。',
      goals: '不明。',
      quote: '“你记住我了吗？……很快就不会了。”',
      backstory: '没有人能说清他是什么时候出现的。观测记录里他出现过十一次，每次记录的笔迹都不同。',
      tags: ['神秘', '伏笔'],
    }),
  ]
}

function makeWorld(): WorldEntry[] {
  const e = (
    id: string,
    title: string,
    category: string,
    summary: string,
    content: string,
    tags: string[],
    parentId?: string
  ): WorldEntry => ({
    id,
    title,
    category,
    parentId,
    summary,
    content,
    tags,
    createdAt: D(55),
    updatedAt: D(5),
  })

  return [
    e(
      'world-longnight',
      '长夜纪元',
      '历史',
      '距今约八百年的漫长黑暗期，灯塔体系由此诞生。',
      '## 概述\n\n长夜纪元是灰烬海沿岸文明的最低点。太阳被灰烬遮蔽，昼夜不再分明。\n\n## 三个时期\n\n1. **降临期**（约 -800 ~ -600）：秩序崩塌，聚居点从城市退化为营地。\n2. **筑塔期**（-600 ~ -120）：第一批灯塔建成，以共鸣石为燃料。\n3. **破晓期**（-120 至今）：灰烬逐渐沉降，但共鸣反噬开始出现。\n\n> 观测记录：长夜并非「没有光」，而是「光不再可信」。',
      ['历史', '纪元']
    ),
    e(
      'world-ashensea',
      '灰烬海',
      '地理',
      '覆盖大陆东侧的灰色沉降带，深处仍在下沉。',
      '灰烬海不是海，是沉降的灰烬堆积成的、会流动的平面。\n\n- **表层**：可短暂行走，踩下去会陷。\n- **中层**：常年雾气，共鸣术在此失效。\n- **深层**：未探明。所有下潜队伍无人生还。\n\n沿岸共有十二座灯塔，目前仅三座仍在运作。',
      ['地理', '灰烬海'],
      'world-longnight'
    ),
    e(
      'world-resonance',
      '共鸣术',
      '体系',
      '读取物质残留情绪的技术，代价是反噬。',
      '## 原理\n\n一切强烈情绪都会在物质表面留下「回响」。共鸣术即读取回响。\n\n## 类型\n\n- **观测型**：读取（沈砚）\n- **压制型**：覆盖、抹除（赫连烛）\n- **塑形型**：将回响转写为实体\n\n## 代价\n\n每读取一次，施术者会被回响侵蚀一分。侵蚀过深者出现记忆错乱——称为**反噬**。',
      ['体系', '魔法'],
      'world-longnight'
    ),
    e(
      'world-legion',
      '焚风军团',
      '组织',
      '灰烬海战役后由残兵编成的沿岸武装。',
      '成立年份：长夜历 42 年。\n\n**纲领**：护塔、清剿、收容。\n\n军团不隶属于任何聚居点，靠为商队护航换取补给。现任统领赫连烛。\n\n内部有一条不成文的规矩：**任何人带回来的人，都由带他的人负责到底。**',
      ['组织', '军团']
    ),
    e(
      'world-scavengers',
      '拾荒者',
      '种族',
      '在灰烬海边缘以回收为生的流民群体。',
      '拾荒者并非种族，而是一种身份。\n\n他们熟悉灰烬海的表层规律，靠打捞旧时代的器物为生。多数人身上有轻度的共鸣残留。\n\n拾荒者营地是沿岸最松散也最稳定的组织——因为每个人都随时可能成为需要被收留的那个。',
      ['群体', '拾荒者']
    ),
    e(
      'world-resonstone',
      '共鸣石',
      '术语',
      '灯塔的燃料，也是反噬的源头。',
      '共鸣石是一种能储存回响的晶体。灯塔以它为核心发光。\n\n**注意**：共鸣石会随使用产生裂纹。裂纹越深，反噬越强。阿迟能凭声音听出裂纹深度。',
      ['术语', '道具'],
      'world-resonance'
    ),
  ]
}

function makeEvents(): EventItem[] {
  const ev = (
    id: string,
    title: string,
    year: number,
    era: string,
    summary: string,
    content: string,
    tags: string[],
    characterIds: string[] = [],
    endYear?: number
  ): EventItem => ({
    id,
    title,
    era,
    year,
    endYear,
    summary,
    content,
    characterIds,
    tags,
    createdAt: D(50),
    updatedAt: D(6),
  })

  return [
    ev(
      'ev-nightfall',
      '长夜降临',
      -800,
      '长夜历',
      '灰烬遮蔽天光，昼夜失序。',
      '一场未被记录的灾变让灰烬开始沉降。此后八百年，沿岸文明在黑暗中重建。',
      ['灾变'],
      [],
      -600
    ),
    ev(
      'ev-firstlight',
      '第一座灯塔点燃',
      -120,
      '长夜历',
      '以共鸣石为燃料的灯塔体系首次运转。',
      '筑塔期的终点。第一座灯塔在灰烬海西岸亮起，此后两百年内共建十二座。',
      ['筑塔', '里程碑']
    ),
    ev(
      'ev-battle',
      '灰烬海战役',
      0,
      '长夜历',
      '灯塔防线崩溃，沿岸聚居点半数覆灭。',
      '灰烬海表层发生大规模沉降，七座灯塔在四天内相继熄灭。\n\n幸存者中包括后来的赫连烛与沈砚。',
      ['战役', '转折点'],
      [C.helian, C.shen],
      3
    ),
    ev(
      'ev-legion',
      '焚风军团成立',
      42,
      '长夜历',
      '残兵整编为沿岸武装。',
      '赫连烛收拢战役残部，编成焚风军团，确立「护塔、清剿、收容」三纲领。',
      ['组织'],
      [C.helian]
    ),
    ev(
      'ev-awake',
      '沈砚自灰烬中苏醒',
      87,
      '长夜历',
      '观测者第一次被记录。',
      '灰烬海战役后第八十七年，沈砚在第十二座灯塔下的废墟中被发现。身上没有任何身份证明，左眼覆着薄绢。\n\n此后他开始沿岸记录每一座灯塔的熄灭时间。',
      ['人物', '开端'],
      [C.shen, C.bailu]
    ),
  ]
}

function makeGallery(): GalleryItem[] {
  const g = (
    id: string,
    title: string,
    seed: number,
    artist: string,
    category: string,
    desc: string,
    tags: string[],
    characterIds: string[],
    date: string
  ): GalleryItem => ({
    id,
    title,
    image: artUrl(seed, ''),
    artist,
    category,
    description: desc,
    characterIds,
    tags,
    date,
    createdAt: D(30),
  })

  return [
    g(
      'art-1',
      '观测者·沈砚',
      11,
      'self',
      '角色设计',
      '深灰风衣，左眼薄绢。构图上刻意让光源来自画面外，呼应「观测」主题。',
      ['立绘', '主角'],
      [C.shen],
      '2026-07-12'
    ),
    g(
      'art-2',
      '提灯者·白露',
      22,
      'self',
      '角色设计',
      '浅色头发在暗背景里几乎透明。手里提的灯其实是一盏便携共鸣灯。',
      ['立绘', '医者'],
      [C.bailu],
      '2026-07-20'
    ),
    g(
      'art-3',
      '焚风·赫连烛',
      33,
      'self',
      '插画',
      '右肩旧伤刻意没有遮。敲桌子的手势是她的标志动作。',
      ['立绘', '军团'],
      [C.helian],
      '2026-08-02'
    ),
    g(
      'art-4',
      '第十二座灯塔',
      44,
      'self',
      '场景',
      '沿岸仅存的三座灯塔之一。塔身裂纹已经肉眼可见。',
      ['场景', '灰烬海'],
      [C.achi],
      '2026-08-15'
    ),
    g(
      'art-5',
      '齿轮匠·阿迟',
      55,
      'self',
      '草图',
      '护目镜推在额头上，工装裤挂满扳手。试了三种头身比。',
      ['草图', '少年'],
      [C.achi],
      '2026-08-28'
    ),
    g(
      'art-6',
      '无名者',
      66,
      'self',
      '插画',
      '刻意不给正脸。画完之后发现自己也记不清画了什么细节——正好符合设定。',
      ['神秘', '伏笔'],
      [C.jianmo],
      '2026-09-10'
    ),
  ]
}

function makeStories(): Story[] {
  const s = (
    id: string,
    title: string,
    seed: number,
    summary: string,
    content: string,
    status: string,
    tags: string[],
    characterIds: string[],
    worldId?: string
  ): Story => ({
    id,
    title,
    cover: artUrl(seed, '', 600, 340),
    summary,
    content,
    status,
    worldId,
    tags,
    characterIds,
    createdAt: D(40),
    updatedAt: D(4),
  })

  return [
    s(
      'story-1',
      '第一盏灯',
      101,
      '沈砚在第十二座灯塔下被发现的那一夜。',
      '## 一\n\n雨是灰的。\n\n阿迟说那不算雨，是灰烬吸饱了水重新落下来。白露没有反驳，只是把斗篷又往上拉了拉。\n\n第十二座灯塔已经三个月没有亮过了。\n\n## 二\n\n废墟下面有东西。\n\n不是尸体——尸体不会呼吸。阿迟举着灯照下去的时候，看见一张被灰盖住的脸，左眼上覆着一层薄绢。\n\n“他还活着。”白露说。\n\n她把药箱打开，发现里面那份多备的药，终于有了去处。',
      '连载中',
      ['主线'],
      [C.shen, C.bailu, C.achi],
      'world-ashensea'
    ),
    s(
      'story-2',
      '护塔人的规矩',
      202,
      '焚风军团成立那年的冬天。',
      '赫连烛把最后一批残兵收进营地时，账上只剩九天的口粮。\n\n有人问她为什么还要收。\n\n她敲了敲桌面，说：“我的人，我自己带回去。”\n\n那年冬天军团饿死了四个人，但没有再少一个。',
      '已完结',
      ['短篇', '军团'],
      [C.helian],
      'world-legion'
    ),
    s(
      'story-3',
      '关于缄默的十一次记录',
      303,
      '没有人能说清他是什么时候出现的。',
      '> 本文尚在整理，记录之间存在矛盾。\n\n第一次记录：长夜历 61 年，西岸商队。记录者笔迹潦草，只有一句话——“斗篷下没有影子”。\n\n第七次记录：长夜历 79 年，拾荒者营地。这次记录者在写完的第二天就忘记了自己写过。\n\n第十一次记录：缺失。',
      '草稿',
      ['神秘', '伏笔'],
      [C.jianmo],
      'world-longnight'
    ),
  ]
}

function makeBoards(): ForumBoard[] {
  return [
    { id: 'board-notice', name: '公告板', description: '设定更新、连载进度、重要通知', order: 1 },
    { id: 'board-lore', name: '设定议事厅', description: '讨论世界观、体系与设定的合理性', order: 2 },
    { id: 'board-rp', name: '角色扮演', description: '以 OC 身份发帖，日常、互动、小剧场', order: 3 },
    { id: 'board-chat', name: '灰烬酒馆', description: '随便聊聊，无关设定', order: 4 },
  ]
}

function makePosts(): ForumPost[] {
  const p = (
    id: string,
    boardId: string,
    title: string,
    content: string,
    authorId: string | undefined,
    authorName: string,
    authorColor: string,
    days: number,
    replies: { content: string; authorId?: string; name: string; color?: string; days: number }[] = [],
    pinned = false
  ): ForumPost => ({
    id,
    boardId,
    title,
    content,
    authorCharacterId: authorId,
    authorName,
    authorAvatar: avatarUrl(authorName, authorColor),
    pinned,
    createdAt: D(days),
    updatedAt: D(days - 0.5),
    replies: replies.map((r) => ({
      id: uid(),
      content: r.content,
      authorCharacterId: r.authorId,
      authorName: r.name,
      authorAvatar: avatarUrl(r.name, r.color || '#6b7280'),
      createdAt: D(r.days),
    })),
  })

  return [
    p(
      'post-welcome',
      'board-notice',
      '【置顶】档案站使用说明',
      '这是一个**本地记录站**——所有数据都保存在你自己的浏览器里，不上传任何服务器。\n\n- 六个板块：总览 / 世界观 / 人物档案 / 论坛 / 画廊 / 故事收录\n- 人物档案里可以给角色建卡，论坛发帖时就能选他/她作为发帖身份\n- 右上角可以切换**蓝白 / 黑红**两套主题，以及明暗模式\n- 记得定期在「设置」里**导出备份**，换浏览器或清缓存会丢数据\n\n祝创作顺利。',
      undefined,
      '站长',
      '#5b7fa6',
      30,
      [
        {
          content: '收到。请问关系图里的连线怎么加？',
          name: '访客',
          days: 29,
        },
        {
          content: '在「人物档案 → 关系图」里，从节点边缘的小圆点拖到另一个节点就行。',
          authorId: C.achi,
          name: '阿迟',
          color: '#8a7a5c',
          days: 29,
        },
      ],
      true
    ),
    p(
      'post-lore-1',
      'board-lore',
      '共鸣术的「反噬」设定是不是太重了？',
      '目前设定是「读一次，侵蚀一分」，那么高频使用共鸣术的角色基本活不过中年。\n\n想讨论两个方向：\n\n1. 加一个**稳定剂**作为缓冲（白露已经在配了）\n2. 改成**累积但可逆**，只要停止使用就能缓慢恢复\n\n我倾向 1，因为更有戏剧性，但会让角色寿命普遍偏短。',
      undefined,
      '站长',
      '#5b7fa6',
      12,
      [
        {
          content: '支持 1。寿命短反而是这个世界观的核心张力——「知道得越多，活得越短」。',
          authorId: C.shen,
          name: '沈砚',
          color: '#5b7fa6',
          days: 11,
        },
        {
          content: '稳定剂可以做出来，但得有人付代价。药不是白来的。',
          authorId: C.bailu,
          name: '白露',
          color: '#4f7a63',
          days: 11,
        },
      ]
    ),
    p(
      'post-rp-1',
      'board-rp',
      '【小剧场】第十二座灯塔下',
      '*雨是灰的。*\n\n阿迟把灯举高了一点，光打在废墟的钢筋上，折出一小片冷白。\n\n“下面有东西。”他说。\n\n白露蹲下来，把药箱放在积水里，盖子掀开的时候发出很轻的一声响。\n\n“……还活着。”\n\n——欢迎接龙。',
      C.achi,
      '阿迟',
      '#8a7a5c',
      8,
      [
        {
          content: '（沈砚缓缓睁开右眼，声音像是从很远的地方传回来）“……几点了？”',
          authorId: C.shen,
          name: '沈砚',
          color: '#5b7fa6',
          days: 8,
        },
        {
          content: '“不知道。”白露头也没抬，“这一带已经三个月没有‘几点’了。”',
          authorId: C.bailu,
          name: '白露',
          color: '#4f7a63',
          days: 7,
        },
      ]
    ),
    p(
      'post-chat-1',
      'board-chat',
      '第十二座灯塔到底什么时候能修好',
      '零件又不够了。\n\n共鸣石倒是有，但接口那圈铜环锈死了，撬不动。\n\n有没有人知道旧城区哪边还能找到同规格的？',
      C.achi,
      '阿迟',
      '#8a7a5c',
      4,
      [
        {
          content: '北边第三个营地，废墟底下埋着一批旧货。别一个人去。',
          authorId: C.helian,
          name: '赫连烛',
          color: '#a6474a',
          days: 3,
        },
        {
          content: '……你怎么知道那里有？',
          authorId: C.achi,
          name: '阿迟',
          color: '#8a7a5c',
          days: 3,
        },
        {
          content: '（没有回复）',
          name: '缄默',
          color: '#6b6f8a',
          days: 2,
        },
      ]
    ),
  ]
}

function makeRelations(): Relation[] {
  const r = (id: string, source: string, target: string, label: string): Relation => ({
    id,
    source,
    target,
    label,
  })
  return [
    r('rel-1', C.shen, C.bailu, '被救 / 信任'),
    r('rel-2', C.shen, C.helian, '战役幸存者'),
    r('rel-3', C.bailu, C.achi, '收养 / 姐弟'),
    r('rel-4', C.helian, C.achi, '暗中照拂'),
    r('rel-5', C.jianmo, C.shen, '观测与被观测'),
    r('rel-6', C.helian, C.bailu, '补给往来'),
  ]
}

function makePositions(): NodePos[] {
  return [
    { id: C.shen, x: 320, y: 60 },
    { id: C.bailu, x: 120, y: 220 },
    { id: C.helian, x: 540, y: 220 },
    { id: C.achi, x: 120, y: 400 },
    { id: C.jianmo, x: 560, y: 60 },
  ]
}

/**
 * 一次性补全示例故事的「世界观」字段，并清掉已废弃的「章节」字段。
 * 只写缺失字段（不覆盖用户已改的内容）；用 settings 标记只跑一次。
 */
async function backfillStoryWorld() {
  const done = await db.settings.get('seed.storyWorldBackfillV2')
  if (done) return

  const patch: Record<string, string> = {
    'story-1': 'world-ashensea',
    'story-2': 'world-legion',
    'story-3': 'world-longnight',
  }

  await db.transaction('rw', [db.stories, db.settings], async () => {
    for (const [id, worldId] of Object.entries(patch)) {
      await db.stories
        .where('id')
        .equals(id)
        .modify((s) => {
          if (s.worldId === undefined) s.worldId = worldId
          const rec = s as Story & { chapter?: unknown }
          if (rec.chapter !== undefined) delete rec.chapter
        })
    }
    await db.settings.delete('seed.storyWorldBackfill')
    await db.settings.put({ key: 'seed.storyWorldBackfillV2', value: 1 })
  })
}

export async function seedIfEmpty() {
  const count = await db.characters.count()
  if (count > 0) {
    await backfillStoryWorld()
    return
  }

  const characters = makeCharacters()
  const worldEntries = makeWorld()
  const events = makeEvents()
  const gallery = makeGallery()
  const stories = makeStories()
  const boards = makeBoards()
  const posts = makePosts()
  const relations = makeRelations()
  const nodePositions = makePositions()

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
      await db.characters.bulkPut(characters)
      await db.worldEntries.bulkPut(worldEntries)
      await db.events.bulkPut(events)
      await db.gallery.bulkPut(gallery)
      await db.stories.bulkPut(stories)
      await db.boards.bulkPut(boards)
      await db.posts.bulkPut(posts)
      await db.relations.bulkPut(relations)
      await db.nodePositions.bulkPut(nodePositions)
    }
  )
}

export async function resetToSeed() {
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
  await seedIfEmpty()
}
