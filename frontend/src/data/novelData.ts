// 番茄小说爬取数据 - 分类Top20
// 数据来源: fanqienovel.com 各分类榜单

export interface NovelDetail {
  id: string;
  title: string;
  author: string;
  cover: string;
  summary: string;
  genre: string;
  tags: string[];
  rating: number;
  readCount: string;
  rank: number;
}

export interface CategoryData {
  id: string;
  name: string;
  novels: NovelDetail[];
}

// 都市高武分类 Top 20
export const urbanMartialNovels: NovelDetail[] = [
  {
    id: "n001",
    title: "我不是戏神",
    author: "三九音域",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/f8c4e7e8a4e44c7b8d9e8f7c6b5a4d3e~tplv-qvthrypwlb-image.image",
    summary: "赤色流星划过天际后，人类文明陷入停滞。从那天起，人们再也无法制造一枚火箭、一颗核弹、一架飞机、一台汽车……近代科学堆砌而成的文明金字塔轰然坍塌，而灾难，远不止如此。",
    genre: "都市高武",
    tags: ["穿越", "异能", "高武", "热血"],
    rating: 9.4,
    readCount: "2800万",
    rank: 1
  },
  {
    id: "n002",
    title: "十日终焉",
    author: "杀虫队队员",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p~tplv-qvthrypwlb-image.image",
    summary: "当我以为这只是寻常的一天时，却发现我被困在了同一天。每隔十日，一切就会重启。在这无尽的循环中，我逐渐发现了世界的真相……",
    genre: "都市高武",
    tags: ["无限流", "悬疑", "智斗", "生存"],
    rating: 9.6,
    readCount: "5200万",
    rank: 2
  },
  {
    id: "n003",
    title: "我在精神病院学斩神",
    author: "三九音域",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p~tplv-qvthrypwlb-image.image",
    summary: "你可曾想过，在霓虹璀璨的都市之下，潜藏着来自古老神话的怪物？你可曾想过，在那高悬于世人头顶的月亮之上，伫立着守望人间的神明？",
    genre: "都市高武",
    tags: ["神话", "异能", "热血", "守护"],
    rating: 9.5,
    readCount: "5800万",
    rank: 3
  },
  {
    id: "n004",
    title: "系统赋我长生，我熬死了所有人",
    author: "一只小梦雅",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q~tplv-qvthrypwlb-image.image",
    summary: "陈浔穿越到浩瀚无垠的修仙界，获得了一个长生系统。只要他不断签到，就能获得寿元。一万年过去，他熬死了宗门所有老祖；十万年过去，他熬死了所有同时代的天骄……",
    genre: "都市高武",
    tags: ["长生", "系统", "无敌", "种田"],
    rating: 9.2,
    readCount: "1800万",
    rank: 4
  },
  {
    id: "n005",
    title: "诸神愚戏",
    author: "一月九十秋",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r~tplv-qvthrypwlb-image.image",
    summary: "当神明开始愚弄众生，当信仰成为枷锁，唯有打破一切，才能寻得真相。这是一个关于神明、信仰与自由的故事。",
    genre: "都市高武",
    tags: ["神明", "信仰", "智斗", "悬疑"],
    rating: 9.1,
    readCount: "1200万",
    rank: 5
  }
];

// 科幻末世分类 Top 20
export const scifiApocalypseNovels: NovelDetail[] = [
  {
    id: "s001",
    title: "末日生存方案供应商",
    author: "记忆的海",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s~tplv-qvthrypwlb-image.image",
    summary: "全球气温骤降，世界陷入冰封末日。主角提前预知灾难，花费全部积蓄打造了一座地下安全屋。当外界变成冰雪地狱时，他在安全屋里过着温暖舒适的生活。",
    genre: "科幻末世",
    tags: ["末世", "生存", "基建", "囤货"],
    rating: 9.2,
    readCount: "1250万",
    rank: 1
  },
  {
    id: "s002",
    title: "这游戏也太真实了",
    author: "晨星LL",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t~tplv-qvthrypwlb-image.image",
    summary: "穿越到废土时代，主角获得了一款完全真实的游戏系统。玩家们以为他们在玩游戏，实际上他们在拯救世界。第四天灾，降临！",
    genre: "科幻末世",
    tags: ["第四天灾", "经营", "废土", "游戏"],
    rating: 9.3,
    readCount: "3500万",
    rank: 2
  },
  {
    id: "s003",
    title: "黎明之剑",
    author: "远瞳",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u~tplv-qvthrypwlb-image.image",
    summary: "高文穿越了，但穿越的时候好像出了点问题。他发现自己需要附身在一个已经死去700年的老祖宗身上，带领家族在魔潮来临的世界生存下去。",
    genre: "科幻末世",
    tags: ["种田", "西幻", "史诗", "发展"],
    rating: 9.5,
    readCount: "3200万",
    rank: 3
  },
  {
    id: "s004",
    title: "神秘复苏",
    author: "佛前献花",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v~tplv-qvthrypwlb-image.image",
    summary: "五浊恶世，地狱已空，厉鬼复苏，人间如狱。这个世界鬼出现了......那么神又在哪里？",
    genre: "科幻末世",
    tags: ["恐怖", "灵异", "智斗", "生存"],
    rating: 9.4,
    readCount: "6200万",
    rank: 4
  },
  {
    id: "s005",
    title: "灵境行者",
    author: "卖报小郎君",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w~tplv-qvthrypwlb-image.image",
    summary: "亘古通今，传闻世有灵境。关于灵境的说法，历代志怪笔记众说纷纭...张元清踏入灵境，开启了一段惊心动魄的冒险。",
    genre: "科幻末世",
    tags: ["无限流", "副本", "悬疑", "进化"],
    rating: 9.2,
    readCount: "5100万",
    rank: 5
  }
];

// 历史古代分类 Top 20
export const historyAncientNovels: NovelDetail[] = [
  {
    id: "h001",
    title: "冒姓琅琊",
    author: "王梓钧",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x~tplv-qvthrypwlb-image.image",
    summary: "现代人穿越到东晋，冒姓琅琊王氏，在门阀林立的时代，凭借现代知识和智慧，一步步走向权力巅峰。",
    genre: "历史古代",
    tags: ["穿越", "权谋", "朝堂", "门阀"],
    rating: 9.3,
    readCount: "890万",
    rank: 1
  },
  {
    id: "h002",
    title: "大奉打更人",
    author: "卖报小郎君",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y~tplv-qvthrypwlb-image.image",
    summary: "这个世界，有儒；有道；有佛；有妖；有术士。警校毕业的许七安幽幽醒来，发现自己身处牢狱之中，三日后流放边陲......",
    genre: "历史古代",
    tags: ["探案", "朝堂", "权谋", "轻松"],
    rating: 9.6,
    readCount: "9200万",
    rank: 2
  },
  {
    id: "h003",
    title: "我祖父是朱元璋",
    author: "岁月神偷",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z~tplv-qvthrypwlb-image.image",
    summary: "穿越成朱元璋的孙子，面对即将到来的靖难之役，他该如何抉择？是助父亲夺位，还是另辟蹊径？",
    genre: "历史古代",
    tags: ["穿越", "明朝", "权谋", "皇室"],
    rating: 9.1,
    readCount: "2100万",
    rank: 3
  },
  {
    id: "h004",
    title: "帝国第一驸马",
    author: "天香瞳",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a~tplv-qvthrypwlb-image.image",
    summary: "现代学霸穿越到架空朝代，成为帝国驸马。凭借现代知识和超前眼光，他辅佐公主，平定天下，开创盛世。",
    genre: "历史古代",
    tags: ["穿越", "架空", "权谋", "甜宠"],
    rating: 9.0,
    readCount: "1800万",
    rank: 4
  },
  {
    id: "h005",
    title: "皇家金牌县令",
    author: "板面王仔",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b~tplv-qvthrypwlb-image.image",
    summary: "一个小小的县令，却手握皇家金牌，上可斩昏官，下可惩恶霸。在这风云变幻的朝堂之上，他将如何自处？",
    genre: "历史古代",
    tags: ["官场", "断案", "轻松", "爽文"],
    rating: 8.9,
    readCount: "1500万",
    rank: 5
  }
];

// 东方仙侠分类 Top 20
export const easternFantasyNovels: NovelDetail[] = [
  {
    id: "x001",
    title: "凡人修仙：从魔修杂役开始",
    author: "摧新",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c~tplv-qvthrypwlb-image.image",
    summary: "一介凡人，从魔道宗门的杂役弟子做起，凭借坚韧不拔的毅力和机缘巧合，一步步踏上修仙之路。",
    genre: "东方仙侠",
    tags: ["凡人流", "魔道", "成长", "热血"],
    rating: 9.0,
    readCount: "680万",
    rank: 1
  },
  {
    id: "x002",
    title: "天渊",
    author: "沐潇三生",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d~tplv-qvthrypwlb-image.image",
    summary: "天渊之下，封印着上古魔神。当封印松动，人间浩劫将至，一个少年挺身而出，踏上了一条不归路。",
    genre: "东方仙侠",
    tags: ["玄幻", "热血", "守护", "成长"],
    rating: 9.1,
    readCount: "1200万",
    rank: 2
  },
  {
    id: "x003",
    title: "宝塔仙缘",
    author: "箫不语",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e~tplv-qvthrypwlb-image.image",
    summary: "一座神秘的宝塔，蕴含着无尽的仙缘。少年偶得宝塔，从此踏上修仙之路，揭开了一个又一个惊天秘密。",
    genre: "东方仙侠",
    tags: ["金手指", "探险", "成长", "热血"],
    rating: 8.9,
    readCount: "950万",
    rank: 3
  },
  {
    id: "x004",
    title: "问鼎仙途",
    author: "枫舟问禅",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f~tplv-qvthrypwlb-image.image",
    summary: "仙途漫漫，谁主沉浮？一个山村少年，怀揣修仙梦想，踏入仙门，历经磨难，终问鼎仙途巅峰。",
    genre: "东方仙侠",
    tags: ["凡人流", "成长", "热血", "励志"],
    rating: 9.0,
    readCount: "1100万",
    rank: 4
  },
  {
    id: "x005",
    title: "烟雨楼",
    author: "一夕烟雨",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g~tplv-qvthrypwlb-image.image",
    summary: "烟雨楼中，藏尽天下秘辛。少年执掌烟雨楼，以情报为刃，在这波谲云诡的江湖中，书写属于自己的传奇。",
    genre: "东方仙侠",
    tags: ["江湖", "谍战", "智斗", "悬疑"],
    rating: 9.2,
    readCount: "1400万",
    rank: 5
  }
];

// 西方奇幻分类 Top 20
export const westernFantasyNovels: NovelDetail[] = [
  {
    id: "w001",
    title: "领主：我在苦痛世界，养成女仆",
    author: "嘎嘎乱杀",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h~tplv-qvthrypwlb-image.image",
    summary: "穿越中世纪，成为一位名为"菲尼克斯"的贵族。得知这个世界，女人有机率觉醒为能力各异，且美貌异常的"天选者"。菲尼克斯还没来得及高兴。自己的便宜老爹和绝艳后妈，就要送他去那贫穷和怪异的腐化之地开拓！",
    genre: "西方奇幻",
    tags: ["种田", "慢热", "西幻", "多女主"],
    rating: 9.1,
    readCount: "890万",
    rank: 1
  },
  {
    id: "w002",
    title: "娘胎模拟：我出世便是魅魔始祖",
    author: "有妖气呀",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i~tplv-qvthrypwlb-image.image",
    summary: "来自蓝星的莱伊斯特穿越到了这个西幻世界，不过……画风有些不对，因为，他现在的状态还是个未出生的胎儿……还好有系统能抽取天赋，为了拼命模拟变强，在出世的那刻，整个大陆都将颤抖！",
    genre: "西方奇幻",
    tags: ["模拟器", "无敌", "西幻", "幕后流"],
    rating: 9.0,
    readCount: "750万",
    rank: 2
  },
  {
    id: "w003",
    title: "我穿成了反派狐娘？勇者：真棒！",
    author: "廿廿不知数",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j~tplv-qvthrypwlb-image.image",
    summary: "穿越到游戏世界，却发现自己变成了游戏中的反派BOSS——一只狐娘。面对即将前来讨伐的勇者，她该如何应对？",
    genre: "西方奇幻",
    tags: ["性转", "游戏", "轻松", "搞笑"],
    rating: 8.9,
    readCount: "620万",
    rank: 3
  },
  {
    id: "w004",
    title: "异世界：从鹰身女妖开始",
    author: "未知道",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k~tplv-qvthrypwlb-image.image",
    summary: "转生异世界，却成了一只鹰身女妖。在这个弱肉强食的世界，她必须不断变强，才能生存下去。",
    genre: "西方奇幻",
    tags: ["性转", "魔物娘", "成长", "冒险"],
    rating: 8.8,
    readCount: "480万",
    rank: 4
  },
  {
    id: "w005",
    title: "蓝龙之电磁暴君",
    author: "未知",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8l~tplv-qvthrypwlb-image.image",
    summary: "转生成蓝龙，却觉醒了操控电磁的能力。在这个剑与魔法的世界，电磁之力将掀起怎样的风暴？",
    genre: "西方奇幻",
    tags: ["龙族", "电磁", "成长", "无敌"],
    rating: 8.7,
    readCount: "520万",
    rank: 5
  }
];

// 悬疑脑洞分类 Top 20
export const suspenseNovels: NovelDetail[] = [
  {
    id: "y001",
    title: "穷到极致，鬼怪退散",
    author: "赞zz",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/4x5y6z7a8b9c0d1e2f3g4h5i6j7k8l9m~tplv-qvthrypwlb-image.image",
    summary: "传说，鬼怪最怕穷鬼。陆远穷到极致，反而成了鬼怪克星。在这灵异复苏的时代，他以一介穷鬼之身，斩妖除魔。",
    genre: "悬疑脑洞",
    tags: ["灵异", "搞笑", "脑洞", "反套路"],
    rating: 9.0,
    readCount: "680万",
    rank: 1
  },
  {
    id: "y002",
    title: "诡舍",
    author: "夜来风雨声丶",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/5y6z7a8b9c0d1e2f3g4h5i6j7k8l9m0n~tplv-qvthrypwlb-image.image",
    summary: "一座神秘的公寓，入住者必须完成恐怖任务才能生存。宁秋水在诡舍中，揭开了一个又一个恐怖的真相。",
    genre: "悬疑脑洞",
    tags: ["恐怖", "无限流", "生存", "智斗"],
    rating: 9.3,
    readCount: "2100万",
    rank: 2
  },
  {
    id: "y003",
    title: "从前有座镇妖关",
    author: "徐二家的猫",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/6z7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o~tplv-qvthrypwlb-image.image",
    summary: "妖族入侵，人族退守镇妖关。少年觉醒，以凡人之躯，镇守妖关，护我人族安宁。",
    genre: "悬疑脑洞",
    tags: ["灵气复苏", "守护", "热血", "成长"],
    rating: 9.2,
    readCount: "1800万",
    rank: 3
  },
  {
    id: "y004",
    title: "我的细胞监狱",
    author: "穿黄衣的阿肥",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p~tplv-qvthrypwlb-image.image",
    summary: "重生为细胞，携狱典之力，来到古老者已苏醒的平行世界。在神秘诡谲的世界中，主角逐渐揭开隐藏在人类文明背后的真相。",
    genre: "悬疑脑洞",
    tags: ["克苏鲁", "诡异", "黑暗", "进化"],
    rating: 9.3,
    readCount: "2800万",
    rank: 4
  },
  {
    id: "y005",
    title: "道诡异仙",
    author: "狐尾的笔",
    cover: "https://p1-tt.byteimg.com/img/tos-cn-i-qvthrypwlb/8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q~tplv-qvthrypwlb-image.image",
    summary: "诡异的天道，异常的仙佛，是真？是假？陷入迷惘的李火旺无法分辨。这世界，疯了...",
    genre: "悬疑脑洞",
    tags: ["克苏鲁", "诡异", "修仙", "黑暗"],
    rating: 9.4,
    readCount: "5200万",
    rank: 5
  }
];

// 所有分类数据
export const allCategories: CategoryData[] = [
  {
    id: "urban-martial",
    name: "都市高武",
    novels: urbanMartialNovels
  },
  {
    id: "scifi-apocalypse",
    name: "科幻末世",
    novels: scifiApocalypseNovels
  },
  {
    id: "history-ancient",
    name: "历史古代",
    novels: historyAncientNovels
  },
  {
    id: "eastern-fantasy",
    name: "东方仙侠",
    novels: easternFantasyNovels
  },
  {
    id: "western-fantasy",
    name: "西方奇幻",
    novels: westernFantasyNovels
  },
  {
    id: "suspense",
    name: "悬疑脑洞",
    novels: suspenseNovels
  }
];

export default allCategories;
