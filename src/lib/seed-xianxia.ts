/**
 * 第二个内置世界观：东方仙侠「青冥问道」。
 * 所有 id 统一加 `x-` 前缀，避免和「灰烬纪」的示例数据撞车。
 */
import { XIANXIA_WORLD_ID } from './db'
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

const W = XIANXIA_WORLD_ID
const D = (days: number) => Date.now() - days * 86400000

/** 人物 id */
const C = {
  mu: 'x-char-shenmubai',
  luan: 'x-char-yanqingluan',
  yue: 'x-char-xiexiyue',
  qi: 'x-char-moqi',
  jiu: 'x-char-baiwujiu',
  ming: 'x-char-youming',
}

/* ------------------------------ 人物档案 ------------------------------ */

function makeCharacters(): Character[] {
  const base = (
    id: string,
    name: string,
    color: string,
    extra: Partial<Character>
  ): Character => ({
    id,
    worldId: W,
    name,
    color,
    tags: [],
    createdAt: D(50),
    updatedAt: D(6),
    ...extra,
  })

  return [
    base(C.mu, '沈慕白', '#4a7d84', {
      alias: '青冥一剑',
      gender: '男',
      age: '十九',
      species: '人族',
      affiliation: '太清宗',
      status: '筑基后期',
      appearance:
        '青衫洗得发白，剑不离身。左眼下有一道极浅的旧痕，是七岁那年被剑气所伤留下的。',
      personality:
        '话少，认死理。认定的事，九头牛也拉不回来。不擅长应酬，一到人多的地方就往角落站。',
      abilities:
        '太清剑诀「澄明」九式；剑心初成，出剑时周身三尺无尘。不擅符箓，丹道一窍不通。',
      goals: '查明坠星之劫的真相，以及师父白无咎为何在三百年前亲手封了自己的剑。',
      quote: '剑若不利，便再磨三百年。',
      backstory:
        '幼年流落九嶂山脚，被白无咎捡回太清宗。他学剑极慢——同门三年能御剑，他用了七年。\n\n但第十年，剑冢试剑大会上，他一剑劈开了那块无人能动的「问道石」。\n\n白无咎看完，只说了一句：「你这一剑，不该这么早出来。」',
      tags: ['主角', '剑修', '太清宗'],
    }),

    base(C.luan, '晏青鸾', '#6f6aa3', {
      alias: '万剑阁少阁主',
      gender: '女',
      age: '二十一',
      species: '人族',
      affiliation: '万剑阁',
      status: '金丹初期',
      appearance:
        '紫衣高束，腰间悬三柄长短不一的剑。走路带风，衣摆从不落地。',
      personality:
        '张扬，好胜，说话直得像剑锋。输得起，但记仇——尤其是输给沈慕白那一次。',
      abilities:
        '万剑阁「百器归元」；同时御三剑，是万剑阁百年来唯一做到的人。',
      goals: '夺回被太清宗「借」走的那柄「问津」，顺便把沈慕白打一顿。',
      quote: '剑多不是本事，是穷讲究。可我就喜欢穷讲究。',
      backstory:
        '从小在剑冢长大，七岁能辨剑鸣，十二岁能听出剑的「脾气」。\n\n她一直觉得剑是活的，所以从不把剑收进剑匣——她说那等于把人关起来。',
      tags: ['剑修', '万剑阁'],
    }),

    base(C.yue, '谢溪月', '#4f7a63', {
      alias: '药王谷小医仙',
      gender: '女',
      age: '十八',
      species: '人族',
      affiliation: '药王谷',
      status: '炼气圆满',
      appearance:
        '素白衣裙，袖口永远沾着一点药渍。背着一只比她半个人还大的药箱。',
      personality:
        '温和，但认理不认人。谁受伤她都救，救完了该骂还是骂。',
      abilities: '丹道、针灸、识毒。修为低得可怜，逃命本事一流。',
      goals: '找到能解「幽溟之息」的药。',
      quote: '你先别死，我还差一味药。',
      backstory:
        '药王谷嫡传。十三岁那年随师父入魔渊采药，师父没回来。\n\n她带回来的只有半卷残方，和一句没写完的话。',
      tags: ['医修', '药王谷', '丹道'],
    }),

    base(C.qi, '墨七', '#5f6368', {
      alias: '第七个墨',
      gender: '不明',
      age: '不详',
      species: '不详',
      affiliation: '散修',
      status: '看不出深浅',
      appearance:
        '一身洗旧的黑袍，斗笠压得很低。左手总揣在袖子里。',
      personality:
        '吊儿郎当，什么都懂一点，什么都不肯说透。给钱办事，但从不接杀人的活。',
      abilities: '符箓、阵法、易容、跑路。正面打不过任何一个金丹，但没人能追上他。',
      goals: '（他自己说）攒够三千灵石就退休。',
      quote: '打不过就跑，这不叫怂，这叫识时务。',
      backstory:
        '来历成谜。有人说他是魔渊叛徒，有人说他是上界下来的。\n\n唯一确定的是：他在九嶂山脚摆了三十年摊，卖的全是假符。',
      tags: ['散修', '符箓', '伏笔'],
    }),

    base(C.jiu, '白无咎', '#9a7448', {
      alias: '太清宗执剑长老',
      gender: '男',
      age: '三百余',
      species: '人族',
      affiliation: '太清宗',
      status: '化神期',
      appearance: '鹤发，面容却停在四十岁。常年穿一身没有纹饰的灰袍。',
      personality: '温和到近乎寡淡。唯一会失态的场合，是有人提起三百年前。',
      abilities: '太清剑诀圆满。但自三百年前起，再未出过剑。',
      goals: '守住九嶂山，守到沈慕白能接得住那一天。',
      quote: '我这一剑封了三百年，不是不敢出，是出了就收不回。',
      backstory:
        '玄元历一千年，白无咎是太清宗最强的剑。\n\n玄元历一〇〇一年，他封剑，从此只在剑冢扫地。\n\n没人知道他那天见到了什么。',
      tags: ['师尊', '太清宗', '剑修'],
    }),

    base(C.ming, '幽溟', '#a6474a', {
      alias: '魔渊少主',
      gender: '男',
      age: '看上去二十出头',
      species: '魔裔',
      affiliation: '魔渊',
      status: '化神初期',
      appearance: '黑发及地，皮肤白得没有血色，眼尾有暗红纹路。',
      personality: '礼貌，耐心，说话慢条斯理。越平静的时候越危险。',
      abilities: '「幽溟之息」——侵蚀灵力，中者修为倒退。',
      goals: '破开青冥壁，回到三千年前坠落的地方。',
      quote: '你们管这叫魔，我只管这叫回家。',
      backstory:
        '三千年前坠星之劫，一物自天外落入九嶂山下。\n\n它没有被杀死，只是被封印。幽溟，是它在人间用的名字。',
      tags: ['反派', '魔渊', '主线'],
    }),
  ]
}

/* ------------------------------ 世界观词条 ------------------------------ */

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
    worldId: W,
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
      'x-w-ninepeaks',
      '九嶂山',
      '地理',
      '九州灵脉的汇聚之处，青冥壁最薄的地方。',
      '九嶂山横亘九州之中，九峰连绵，峰峰有灵脉出没。\n\n传说坠星之劫前，这里是「通天台」——上界与人间唯一接壤的所在。劫后台毁，只余九嶂。\n\n山脚有镇，名**问津**，散修云集，鱼龙混杂。',
      ['主舞台', '地理'],
    ),
    e(
      'x-w-qingmingwall',
      '青冥壁',
      '地理',
      '天穹之上的无形屏障，飞升者需破之。',
      '青冥壁无形无质，唯在化神修士眼中可见——一层淡青色的天幕。\n\n它并非天然而成。玄元历元年，九州十二位大能联手布下此壁，为的是把坠星带来的东西**关在里面**。\n\n所以严格说来，它不是拦着人上去，是拦着东西下来。',
      ['核心设定', '青冥壁'],
    ),
    e(
      'x-w-spiritvein',
      '灵脉',
      '体系',
      '地脉中流动的灵力，修行之基。',
      '灵脉如江河，自九嶂山发源，分九支流向九州。\n\n宗门择脉而居，因此九州格局本质上是灵脉的格局。坠星之劫后，九支灵脉断了三支，至今未复。',
      ['修行', '灵脉'],
    ),
    e(
      'x-w-realm',
      '境界',
      '体系',
      '炼气 · 筑基 · 金丹 · 元婴 · 化神',
      '修行共五境：\n\n1. **炼气**——引灵入体，气行周天。\n2. **筑基**——气凝成基，寿元初延。\n3. **金丹**——基上结丹，可御物飞行。\n4. **元婴**——丹破婴生，神魂离体。\n5. **化神**——神与道合，可窥青冥。\n\n五境之上，古人说有「渡劫」，但三千年来无人见过。',
      ['修行', '境界'],
    ),
    e(
      'x-w-swordheart',
      '剑心',
      '体系',
      '剑修与剑共鸣的境界，成者出剑无尘。',
      '剑修不修灵脉，修「剑心」。\n\n剑心成时，周身三尺自成清净，尘埃不落。再进一步，可「听剑」——剑会告诉你它想劈向哪里。\n\n太清宗与万剑阁皆以剑立宗，但路子截然不同：太清讲「澄明」，一柄剑；万剑讲「归元」，百器皆剑。',
      ['剑修', '体系'],
    ),
    e(
      'x-w-alchemy',
      '丹道',
      '体系',
      '以草木金石炼药，可疗伤、延寿、破境。',
      '丹分九品，一品最下。药王谷掌天下丹方十之七八。\n\n丹道最难不在火候，在**辨药**——同一株草，长在灵脉阳面与阴面，药性可以完全相反。',
      ['丹道', '药王谷'],
    ),
    e(
      'x-w-jiuzhou',
      '九州',
      '地理',
      '人间的总称，九嶂山居中，八州环列。',
      '九州者：中州、东陵、南越、西荒、北冥，另有沧浪、苍梧、云梦、琅嬛四州。\n\n中州为九嶂所在，也是宗门林立之地。',
      ['地理'],
    ),
    e(
      'x-w-fallenstar',
      '坠星之劫',
      '历史',
      '三千年前，一物自天外坠落九嶂山。',
      '玄元历前三年，天现异象，有物自天外坠于九嶂。\n\n撞击之烈，九峰折其四，灵脉断其三。更麻烦的是——**那东西没有死**。\n\n此后三年，九州大能死伤殆尽，终于把它封进山底。玄元历元年，青冥壁成。',
      ['历史', '核心事件'],
    ),
    e(
      'x-w-ascension',
      '飞升',
      '术语',
      '化神之上，破青冥壁而去。',
      '三千年来，记载中的飞升者共七人，最后一次在玄元历九〇〇年。\n\n自那之后，再无人飞升。有人说是青冥壁厚了，有人说是**外面的人不让人上去了**。',
      ['术语', '青冥壁'],
    ),
    e(
      'x-w-sects',
      '宗门',
      '组织',
      '以灵脉为基、以传承为系的修行势力。',
      '九州宗门不下百数，真正称得上「大宗」的只有四家：太清宗、万剑阁、药王谷、以及……魔渊。\n\n前两者主剑，第三者主丹，最后一个谁也不承认它是宗门。',
      ['组织'],
    ),
    e(
      'x-w-taiqing',
      '太清宗',
      '组织',
      '九嶂山主宗，以「澄明」一剑立世。',
      '开山于玄元历八一二年，山门在九嶂第二峰。\n\n宗训只有八个字：**一剑既出，不悔不回。**\n\n当代执剑长老白无咎，三百年前封剑，至今未出。',
      ['宗门', '太清宗'],
      'x-w-sects'
    ),
    e(
      'x-w-wanjian',
      '万剑阁',
      '组织',
      '剑冢所在，以「百器归元」闻名。',
      '不建山门，只守剑冢。阁中人以剑为亲，剑冢埋剑十万。\n\n现任阁主晏长歌，其女晏青鸾可同时御三剑，为百年来首例。',
      ['宗门', '万剑阁'],
      'x-w-sects'
    ),
    e(
      'x-w-yaowang',
      '药王谷',
      '组织',
      '天下丹方之宗，谷中四季皆有药花。',
      '不参与宗门争斗，中立。谷规第一条：**见伤必救，不论正邪。**\n\n也正因如此，谷中人是九嶂山最危险的地方唯一敢去的人。',
      ['宗门', '药王谷'],
      'x-w-sects'
    ),
    e(
      'x-w-moyuan',
      '魔渊',
      '组织',
      '九嶂山底封印之下的势力。',
      '严格说，魔渊不是组织，是**一个地方**——坠星落点之下，被封印封住的深渊。\n\n里面有什么，没人说得清。出来的东西，统称魔裔。\n\n当代少主幽溟，是三百年来第一个能走出封印的魔裔。',
      ['组织', '反派', '魔渊'],
      'x-w-sects'
    ),
    e(
      'x-w-yaozu',
      '妖族',
      '种族',
      '灵兽开智之后的统称。',
      '妖族不修灵脉，修「本命」——天生之物即是道。\n\n与人族关系微妙：宗门视其为兽，药王谷视其为友，魔渊视其为食。',
      ['种族'],
    ),
    e(
      'x-w-talisman',
      '符箓',
      '术语',
      '以朱砂灵墨书于符纸，可引灵成法。',
      '符箓之要在「一气呵成」——落笔断则符废。\n\n高阶符师可虚空画符，无需纸墨。九嶂山脚下卖符的摊子，十个里有九个半是假的。',
      ['术语', '符箓'],
    ),
  ]
}

/* ------------------------------ 时间线 ------------------------------ */

function makeEvents(): EventItem[] {
  const e = (
    id: string,
    title: string,
    year: number,
    summary: string,
    content: string,
    location: string,
    characterIds: string[],
    tags: string[],
    endYear?: number
  ): EventItem => ({
    id,
    worldId: W,
    title,
    era: '玄元历',
    year,
    endYear,
    summary,
    content,
    location,
    characterIds,
    tags,
    createdAt: D(52),
    updatedAt: D(7),
  })

  return [
    e(
      'x-ev-fallenstar',
      '坠星之劫',
      -3000,
      '一物自天外坠于九嶂山，九州大能死伤殆尽。',
      '天裂三日，火雨不止。\n\n撞击之后，九嶂折其四，灵脉断其三。更可怕的是——**那东西没有死**。\n\n此后三年，九州倾尽所有，终于把它封进山底。',
      '九嶂山',
      [],
      ['核心事件', '灾劫'],
      -2997
    ),
    e(
      'x-ev-wall',
      '青冥壁成',
      1,
      '十二位大能联手布下青冥壁，九州纪元由此始。',
      '封印完成之后，众人仍不放心。\n\n于是十二人以毕生修为，在天穹布下一层屏障。此后凡飞升者，需先破此壁。\n\n玄元历元年，以此为始。',
      '九嶂山',
      [],
      ['纪元', '青冥壁']
    ),
    e(
      'x-ev-taiqing',
      '太清宗开山',
      812,
      '太清宗于九嶂第二峰立山门。',
      '初代宗主本是无名剑客，因在坠星旧址上守了三年，被人称为「守山人」。\n\n他立下八字宗训：一剑既出，不悔不回。',
      '九嶂山 · 第二峰',
      [],
      ['宗门']
    ),
    e(
      'x-ev-swordtomb',
      '剑冢现世',
      1240,
      '万剑阁剑冢自地底浮出，十万古剑重现人间。',
      '那年九嶂山地震七日，第三峰裂开一道口子，露出埋了千年的剑冢。\n\n万剑阁自此迁来，守冢而居。',
      '九嶂山 · 第三峰',
      [],
      ['宗门', '剑冢']
    ),
    e(
      'x-ev-seal',
      '白无咎封剑',
      1001,
      '太清宗最强剑修封剑，从此只在剑冢扫地。',
      '没有人知道那天他见到了什么。\n\n据山门旧录，那日九嶂山起了大雾，雾散之后，白无咎把剑插进了剑冢最深处的一块石头里。\n\n此后三百年，他再未出剑。',
      '九嶂山 · 剑冢',
      [C.jiu],
      ['伏笔', '主线']
    ),
    e(
      'x-ev-youming',
      '幽溟破封',
      1298,
      '魔渊少主走出封印，九嶂山灵脉开始逆行。',
      '封印出现了一道缝。\n\n从那道缝里走出来的，是一个自称幽溟的年轻人。他很有礼貌地同守山的弟子打了招呼，然后消失了。\n\n此后两年，中州灵脉开始逆行。',
      '九嶂山 · 山脚',
      [C.ming],
      ['主线', '魔渊']
    ),
    e(
      'x-ev-council',
      '九嶂山会盟',
      1300,
      '四大宗门齐聚问津镇，共商破封之策。',
      '会盟本该是四家的事，但药王谷只来了一人一箱药，万剑阁带了三十七柄剑。\n\n太清宗来的是白无咎——三百年来第一次下山。\n\n而会盟当天，幽溟也来了。',
      '问津镇',
      [C.mu, C.luan, C.yue, C.jiu, C.ming],
      ['主线', '会盟'],
      1300
    ),
  ]
}

/* ------------------------------ 画廊 ------------------------------ */

function makeGallery(): GalleryItem[] {
  const g = (
    id: string,
    title: string,
    seed: number,
    artist: string,
    category: string,
    description: string,
    characterIds: string[],
    tags: string[]
  ): GalleryItem => ({
    id,
    worldId: W,
    title,
    image: artUrl(seed, title, 600, 760),
    artist,
    category,
    description,
    characterIds,
    tags,
    createdAt: D(20),
  })

  return [
    g(
      'x-gal-1',
      '青衫一剑',
      901,
      '砚青',
      '角色设计',
      '沈慕白定妆。青衫是洗旧的，剑鞘上那道裂痕是七岁那年留下的。',
      [C.mu],
      ['主角', '立绘']
    ),
    g(
      'x-gal-2',
      '三剑同悬',
      902,
      '砚青',
      '角色设计',
      '晏青鸾的三柄剑：长的是「问津」，短的是「解语」，中间那柄没有名字。',
      [C.luan],
      ['剑修', '立绘']
    ),
    g(
      'x-gal-3',
      '药箱与药花',
      903,
      '小满',
      '场景',
      '谢溪月的药箱。箱盖内侧贴着一张写了一半的方子，是她师父留下的。',
      [C.yue],
      ['药王谷', '静物']
    ),
    g(
      'x-gal-4',
      '九嶂云海',
      904,
      '砚青',
      '场景',
      '第二峰的清晨。云海之下就是剑冢，只是站在山上看不见。',
      [],
      ['场景', '九嶂山']
    ),
    g(
      'x-gal-5',
      '魔渊来客',
      905,
      '无名',
      '插画',
      '会盟那天，幽溟站在人群外，笑着看完了全程。',
      [C.ming],
      ['反派', '主线']
    ),
    g(
      'x-gal-6',
      '符摊',
      906,
      '小满',
      '草图',
      '山脚问津镇的符摊。摊主戴斗笠，卖的符十张有九张不灵。',
      [C.qi],
      ['散修', '日常']
    ),
  ]
}

/* ------------------------------ 故事收录 ------------------------------ */

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
    entryId?: string
  ): Story => ({
    id,
    worldId: W,
    title,
    cover: artUrl(seed, '', 600, 340),
    summary,
    content,
    status,
    entryId,
    tags,
    characterIds,
    createdAt: D(35),
    updatedAt: D(3),
  })

  return [
    s(
      'x-story-1',
      '问道九嶂',
      911,
      '会盟前一夜，沈慕白在剑冢遇见了不该出现的人。',
      '## 一\n\n九嶂山下了三天的雨。\n\n沈慕白在剑冢扫了一夜的落叶。说是落叶，其实是断剑的铁屑——剑冢里的剑会自己锈，锈下来的东西积在石阶上，像一层薄薄的灰。\n\n“你师父让你扫这个？”\n\n声音从背后传来。沈慕白没有回头。他认得这个声音，今天下午在会盟场上听过——那个很有礼貌的年轻人。\n\n“他不让我扫。”沈慕白说，“我自己要扫的。”\n\n“为什么？”\n\n“因为明天要打架了。”他把扫帚立起来，“打完可能就没得扫了。”\n\n## 二\n\n幽溟笑了起来。\n\n“你很像我三千年前见过的一个人。”他说，“他也这么说话，也这么站着，也这么——”\n\n他顿了顿。\n\n“——把剑插在石头里。”\n\n沈慕白的手停住了。\n\n那是白无咎的剑。插在剑冢最深处的石头里，三百年了，没有人拔得动。\n\n“你见过？”\n\n“当然见过。”幽溟的声音很轻，“那把剑，本来就是我的。”',
      '连载中',
      ['主线', '会盟'],
      [C.mu, C.ming],
      'x-w-ninepeaks'
    ),
    s(
      'x-story-2',
      '剑冢一夜',
      912,
      '玄元历一〇〇一年，白无咎封剑那一夜。',
      '那天九嶂山起了大雾。\n\n白无咎提剑走进剑冢，走到最深处，把剑插进了一块石头。\n\n石头下面压着的东西睁开了一只眼。\n\n“你封不住我。”它说。\n\n“我知道。”白无咎蹲下来，很认真地看着它，“但我能封住我自己。”\n\n“有什么区别？”\n\n“区别是——”他把手按在剑柄上，“你要出来，得先杀我。而我不出剑，你就杀不了我。”\n\n那只眼看了他很久。\n\n“你打算这样过三百年？”\n\n“嗯。”\n\n“为什么？”\n\n白无咎想了想。\n\n“因为三百年后，会有人来替我。”',
      '已完结',
      ['短篇', '伏笔'],
      [C.jiu],
      'x-w-qingmingwall'
    ),
    s(
      'x-story-3',
      '幽溟残卷',
      913,
      '（整理中）关于坠星的三段互相矛盾的记载。',
      '> 本文尚在整理，三份记载之间存在矛盾，暂不下结论。\n\n**记载一**：坠星是灾，是外物，是必须封住的东西。此说见于太清宗山门旧录。\n\n**记载二**：坠星是「归」，是从天上回来的东西。此说见于药王谷残方背面的批注，字迹潦草。\n\n**记载三**：坠星一共有两颗。第二颗，还没有落下来。\n\n记载三没有出处。',
      '草稿',
      ['神秘', '伏笔'],
      [C.yue, C.ming],
      'x-w-fallenstar'
    ),
  ]
}

/* ------------------------------ 论坛 ------------------------------ */

function makeBoards(): ForumBoard[] {
  return [
    { id: 'x-board-notice', worldId: W, name: '山门公告', description: '会盟、试剑、开山通告', order: 1 },
    { id: 'x-board-tea', worldId: W, name: '问道茶馆', description: '闲聊、吐槽、问路', order: 2 },
    { id: 'x-board-create', worldId: W, name: '同人创作', description: '画、文、曲子都可以', order: 3 },
    { id: 'x-board-lore', worldId: W, name: '设定考据', description: '抠设定、找矛盾、提问题', order: 4 },
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
    avatarName: string,
    avatarColor: string,
    replies: { name: string; color: string; content: string; charId?: string }[],
    pinned?: boolean
  ): ForumPost => ({
    id,
    worldId: W,
    boardId,
    title,
    content,
    authorCharacterId: authorId,
    authorName,
    authorAvatar: avatarUrl(avatarName, avatarColor),
    pinned,
    createdAt: D(18),
    updatedAt: D(2),
    replies: replies.map((r, i) => ({
      id: `${id}-r${i + 1}`,
      content: r.content,
      authorCharacterId: r.charId,
      authorName: r.name,
      authorAvatar: avatarUrl(r.name, r.color),
      createdAt: D(15 - i),
    })),
  })

  return [
    p(
      'x-post-1',
      'x-board-notice',
      '【公告】玄元历一三〇〇年九嶂山会盟，四宗齐聚问津镇',
      '会盟定于下月初一，地点问津镇。\n\n**议程**\n1. 灵脉逆行一事\n2. 魔渊封印的处置\n3. 是否重开剑冢\n\n太清宗出席：白无咎长老（三百年首次下山）\n万剑阁出席：晏青鸾少阁主\n药王谷出席：谢溪月\n\n请各宗弟子勿在镇中私斗。',
      undefined,
      '山门执事',
      '山',
      '#5b7fa6',
      [
        {
          name: '晏青鸾',
          color: '#6f6aa3',
          charId: C.luan,
          content: '带三十七柄剑去算不算私斗？',
        },
        {
          name: '谢溪月',
          color: '#4f7a63',
          charId: C.yue,
          content: '不算。但你要是砍了人，我药箱里没有那么多绷带。',
        },
      ],
      true
    ),
    p(
      'x-post-2',
      'x-board-lore',
      '白无咎当年到底见了什么？',
      '封剑这件事，山门旧录里只有一句话：「雾散之后，剑入石中。」\n\n但《剑冢一夜》里写的是石头下面有东西。\n\n所以到底是封剑，还是**封人**？\n\n有没有考据大佬。',
      C.qi,
      '墨七',
      '墨',
      '#5f6368',
      [
        {
          name: '沈慕白',
          color: '#4a7d84',
          charId: C.mu,
          content: '师父不说。我问过三次，他扫了三次地。',
        },
        {
          name: '晏青鸾',
          color: '#6f6aa3',
          charId: C.luan,
          content: '第三次他是不是把扫帚往你那边扫了？',
        },
        {
          name: '沈慕白',
          color: '#4a7d84',
          charId: C.mu,
          content: '……嗯。',
        },
      ]
    ),
    p(
      'x-post-3',
      'x-board-create',
      '【图】青衫一剑（沈慕白定妆）',
      '第一次画剑修，剑鞘上的裂痕不知道画对没有。\n\n设定里那道痕是七岁被剑气伤的，所以应该在**鞘口往下三寸**。',
      C.yue,
      '谢溪月',
      '谢',
      '#4f7a63',
      [
        {
          name: '墨七',
          color: '#5f6368',
          charId: C.qi,
          content: '位置对了。不过这剑鞘该更旧一点，他不换鞘的。',
        },
        {
          name: '晏青鸾',
          color: '#6f6aa3',
          charId: C.luan,
          content: '鞘口那道裂是「问津」劈的，我认得。',
        },
      ]
    ),
    p(
      'x-post-4',
      'x-board-tea',
      '山脚那家符摊的符，到底有没有一张是真的？',
      '买了十张，九张烧不着，剩下一张烧着了但是没效果。\n\n老板说「你心不诚」。\n\n心不诚能怪我？',
      undefined,
      '路过的散修',
      '路',
      '#9a7448',
      [
        {
          name: '墨七',
          color: '#5f6368',
          charId: C.qi,
          content: '心诚不诚不知道，反正我卖的时候是诚心的。',
        },
        {
          name: '谢溪月',
          color: '#4f7a63',
          charId: C.yue,
          content: '楼上你还有脸说。',
        },
      ]
    ),
    p(
      'x-post-5',
      'x-board-lore',
      '青冥壁到底是挡外面的人上来，还是挡里面的东西下来？',
      '《飞升》那条词条里写「有人说是外面的人不让人上去了」。\n\n但如果青冥壁是十二位大能为了封坠星而布，那它的朝向应该是**向内**的。\n\n那七位飞升者是怎么出去的？',
      C.mu,
      '沈慕白',
      '沈',
      '#4a7d84',
      [
        {
          name: '墨七',
          color: '#5f6368',
          charId: C.qi,
          content: '问得好。这个问题值三千灵石。',
        },
      ]
    ),
  ]
}

/* ------------------------------ 关系图 ------------------------------ */

function makeRelations(): Relation[] {
  const r = (id: string, source: string, target: string, label: string): Relation => ({
    id,
    worldId: W,
    source,
    target,
    label,
  })

  return [
    r('x-rel-1', C.jiu, C.mu, '师徒'),
    r('x-rel-2', C.mu, C.luan, '宿敌'),
    r('x-rel-3', C.mu, C.yue, '同伴'),
    r('x-rel-4', C.luan, C.yue, '挚友'),
    r('x-rel-5', C.qi, C.mu, '认识'),
    r('x-rel-6', C.ming, C.jiu, '宿敌'),
    r('x-rel-7', C.ming, C.mu, '宿敌'),
  ]
}

function makePositions(): NodePos[] {
  return [
    { id: C.mu, worldId: W, x: 340, y: 200 },
    { id: C.luan, worldId: W, x: 560, y: 120 },
    { id: C.yue, worldId: W, x: 620, y: 330 },
    { id: C.qi, worldId: W, x: 120, y: 330 },
    { id: C.jiu, worldId: W, x: 340, y: 40 },
    { id: C.ming, worldId: W, x: 380, y: 430 },
  ]
}

/* ------------------------------ 导出 ------------------------------ */

export const XIANXIA: {
  name: string
  tagline: string
  intro: string
  era: string
  accent: string
  characters: Character[]
  worldEntries: WorldEntry[]
  events: EventItem[]
  gallery: GalleryItem[]
  stories: Story[]
  boards: ForumBoard[]
  posts: ForumPost[]
  relations: Relation[]
  nodePositions: NodePos[]
} = {
  name: '青冥问道',
  tagline: '九霄之上有青冥，问道者不问归途',
  intro:
    '三千年前，一物自天外坠于九嶂山。九州倾尽所有将它封进山底，又在天穹布下一层青冥壁。\n\n此后三千年，无人飞升。直到今年，封印裂开了一道缝——从缝里走出来的年轻人很有礼貌，然后整个中州的灵脉开始逆行。',
  era: '玄元历',
  accent: '#4a7d84',
  characters: makeCharacters(),
  worldEntries: makeWorld(),
  events: makeEvents(),
  gallery: makeGallery(),
  stories: makeStories(),
  boards: makeBoards(),
  posts: makePosts(),
  relations: makeRelations(),
  nodePositions: makePositions(),
}
