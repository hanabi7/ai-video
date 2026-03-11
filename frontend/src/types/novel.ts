// 小说数据类型定义

export interface Novel {
  id: string;
  title: string;
  author: string;
  cover: string;
  summary: string;
  genre: NovelGenre;
  tags: string[];
  wordCount: number;
  chapterCount: number;
  rating: number;
  readCount: string;
  lastUpdate: string;
  status: 'ongoing' | 'completed';
  url?: string;
}

export type NovelGenre = 
  | '都市' 
  | '玄幻' 
  | '仙侠' 
  | '科幻' 
  | '悬疑' 
  | '历史' 
  | '军事' 
  | '游戏' 
  | '体育' 
  | '轻小说' 
  | '短篇' 
  | '全部';

export const NOVEL_GENRES: NovelGenre[] = [
  '全部',
  '都市',
  '玄幻', 
  '仙侠',
  '科幻',
  '悬疑',
  '历史',
  '军事',
  '游戏',
  '体育',
  '轻小说',
  '短篇'
];

// 模拟小说数据（基于番茄小说常见题材）
export const MOCK_NOVELS: Novel[] = [
  {
    id: '1',
    title: '全球冰封：我打造了末日安全屋',
    author: '记忆的海',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '全球气温骤降，世界陷入冰封末日。主角提前预知灾难，花费全部积蓄打造了一座地下安全屋。当外界变成冰雪地狱时，他在安全屋里过着温暖舒适的生活...',
    genre: '科幻',
    tags: ['末世', '生存', '基建', '囤货'],
    wordCount: 1200000,
    chapterCount: 580,
    rating: 9.2,
    readCount: '1250万',
    lastUpdate: '2024-03-10',
    status: 'ongoing',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '2',
    title: '我在精神病院学斩神',
    author: '三九音域',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '你可曾想过，在霓虹璀璨的都市之下，潜藏着来自古老神话的怪物？你可曾想过，在那高悬于世人头顶的月亮之上，伫立着守望人间的神明？',
    genre: '都市',
    tags: ['神话', '异能', '热血', '守护'],
    wordCount: 2800000,
    chapterCount: 1200,
    rating: 9.5,
    readCount: '5800万',
    lastUpdate: '2024-03-11',
    status: 'completed',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '3',
    title: '逆天邪神',
    author: '火星引力',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '掌天毒之珠，承邪神之血，修逆天之力，一代邪神，君临天下！',
    genre: '玄幻',
    tags: ['爽文', '逆袭', '热血', '神魔'],
    wordCount: 6500000,
    chapterCount: 2100,
    rating: 9.0,
    readCount: '8900万',
    lastUpdate: '2024-03-09',
    status: 'ongoing',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '4',
    title: '开局地摊卖大力',
    author: '弈青锋',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '在这个灵气复苏的时代，主角却选择了摆地摊卖大力丸。一颗大力丸，力拔山兮气盖世！',
    genre: '都市',
    tags: ['灵气复苏', '搞笑', '系统', '爽文'],
    wordCount: 4500000,
    chapterCount: 1800,
    rating: 9.3,
    readCount: '4200万',
    lastUpdate: '2024-03-11',
    status: 'completed',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '5',
    title: '万古神帝',
    author: '飞天鱼',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '八百年前，明帝之子张若尘，被未婚妻池瑶公主杀死，一代天骄，就此陨落。八百年后，张若尘重新活了过来，却发现曾经杀死他的未婚妻，已经统一昆仑界...',
    genre: '玄幻',
    tags: ['重生', '复仇', '热血', '史诗'],
    wordCount: 12000000,
    chapterCount: 4200,
    rating: 9.1,
    readCount: '7500万',
    lastUpdate: '2024-03-11',
    status: 'ongoing',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '6',
    title: '仙人之下我无敌，仙人之上一换一',
    author: 'insert into',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '穿越到修仙世界，主角发现自己竟然是无敌的存在。仙人之下我无敌，仙人之上一换一！',
    genre: '仙侠',
    tags: ['穿越', '无敌流', '搞笑', '修仙'],
    wordCount: 3200000,
    chapterCount: 1400,
    rating: 9.0,
    readCount: '3800万',
    lastUpdate: '2024-03-10',
    status: 'ongoing',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '7',
    title: '神秘复苏',
    author: '佛前献花',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '五浊恶世，地狱已空，厉鬼复苏，人间如狱。这个世界鬼出现了......那么神又在哪里？',
    genre: '悬疑',
    tags: ['恐怖', '灵异', '智斗', '生存'],
    wordCount: 5200000,
    chapterCount: 1500,
    rating: 9.4,
    readCount: '6200万',
    lastUpdate: '2024-03-08',
    status: 'ongoing',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '8',
    title: '大奉打更人',
    author: '卖报小郎君',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '这个世界，有儒；有道；有佛；有妖；有术士。警校毕业的许七安幽幽醒来，发现自己身处牢狱之中，三日后流放边陲......',
    genre: '仙侠',
    tags: ['探案', '朝堂', '权谋', '轻松'],
    wordCount: 3800000,
    chapterCount: 1200,
    rating: 9.6,
    readCount: '9200万',
    lastUpdate: '2024-02-28',
    status: 'completed',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '9',
    title: '深空彼岸',
    author: '辰东',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '浩瀚的宇宙中，一片死寂，星辰黯淡。在旧土与新星的交替时代，主角王煊踏上修行路，探索深空彼岸的秘密...',
    genre: '玄幻',
    tags: ['未来世界', '进化', '探险', '热血'],
    wordCount: 5800000,
    chapterCount: 1800,
    rating: 9.2,
    readCount: '4800万',
    lastUpdate: '2024-03-11',
    status: 'completed',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '10',
    title: '这游戏也太真实了',
    author: '晨星LL',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '穿越到废土时代，主角获得了一款完全真实的游戏系统。玩家们以为他们在玩游戏，实际上他们在拯救世界...',
    genre: '科幻',
    tags: ['第四天灾', '经营', '废土', '游戏'],
    wordCount: 4200000,
    chapterCount: 1600,
    rating: 9.3,
    readCount: '3500万',
    lastUpdate: '2024-03-11',
    status: 'completed',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '11',
    title: '我只想安静的做个苟道中人',
    author: '爆炸小拿铁',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '穿越到修仙界，主角绑定了一个系统，但这个系统好像不太正经...',
    genre: '仙侠',
    tags: ['系统', '苟道', '搞笑', '反套路'],
    wordCount: 2800000,
    chapterCount: 1100,
    rating: 9.1,
    readCount: '2900万',
    lastUpdate: '2024-03-10',
    status: 'ongoing',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '12',
    title: '灵境行者',
    author: '卖报小郎君',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '亘古通今，传闻世有灵境。关于灵境的说法，历代志怪笔记众说纷纭...',
    genre: '科幻',
    tags: ['无限流', '副本', '悬疑', '进化'],
    wordCount: 3600000,
    chapterCount: 1300,
    rating: 9.2,
    readCount: '5100万',
    lastUpdate: '2024-03-11',
    status: 'ongoing',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '13',
    title: '请叫我鬼差大人',
    author: '徐二家的猫',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '人间有鬼，地府有序。而我，是连接阴阳的鬼差大人...',
    genre: '悬疑',
    tags: ['灵异', '地府', '搞笑', '日常'],
    wordCount: 2200000,
    chapterCount: 900,
    rating: 8.9,
    readCount: '2100万',
    lastUpdate: '2024-03-09',
    status: 'completed',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '14',
    title: '重生之都市修仙',
    author: '十里剑神',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '渡劫期大修士陈凡陨落在天劫中，却一梦五百年重回地球的年少时代。上一世我登临宇宙之巅，俯瞰万界，却无人相伴。这一世，我只愿不负前尘不负卿...',
    genre: '都市',
    tags: ['重生', '修仙', '装X', '都市修真'],
    wordCount: 3800000,
    chapterCount: 1400,
    rating: 9.0,
    readCount: '6800万',
    lastUpdate: '2024-03-05',
    status: 'completed',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '15',
    title: '我的细胞监狱',
    author: '穿黄衣的阿肥',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '重生为细胞，携狱典之力，来到古老者已苏醒的平行世界。在神秘诡谲的世界中，主角逐渐揭开隐藏在人类文明背后的真相...',
    genre: '悬疑',
    tags: ['克苏鲁', '诡异', '黑暗', '进化'],
    wordCount: 4200000,
    chapterCount: 1700,
    rating: 9.3,
    readCount: '2800万',
    lastUpdate: '2024-03-11',
    status: 'completed',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '16',
    title: '黎明之剑',
    author: '远瞳',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '高文穿越了，但穿越的时候好像出了点问题。他发现自己需要附身在一个已经死去700年的老祖宗身上，带领家族在魔潮来临的世界生存下去...',
    genre: '科幻',
    tags: ['种田', '西幻', '史诗', '发展'],
    wordCount: 4800000,
    chapterCount: 1800,
    rating: 9.5,
    readCount: '3200万',
    lastUpdate: '2024-03-11',
    status: 'completed',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '17',
    title: '亏成首富从游戏开始',
    author: '青衫取醉',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '想要亏掉五亿，怎么就这么难呢？裴谦得到了一个亏钱系统，亏钱越多，返利越多。他本想随便做个游戏亏光钱，没想到游戏火了...',
    genre: '都市',
    tags: ['系统', '反套路', '搞笑', '经营'],
    wordCount: 3200000,
    chapterCount: 1300,
    rating: 9.4,
    readCount: '4500万',
    lastUpdate: '2024-03-10',
    status: 'completed',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '18',
    title: '道诡异仙',
    author: '狐尾的笔',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '诡异的天道，异常的仙佛，是真？是假？陷入迷惘的李火旺无法分辨。这世界，疯了...',
    genre: '玄幻',
    tags: ['克苏鲁', '诡异', '修仙', '黑暗'],
    wordCount: 2800000,
    chapterCount: 1100,
    rating: 9.4,
    readCount: '5200万',
    lastUpdate: '2024-03-08',
    status: 'completed',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '19',
    title: '龙族',
    author: '江南',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '一个关于龙的故事。卡塞尔学院，屠龙者的聚集地。路明非，一个普通的高中生，却因为一封录取通知书，踏上了屠龙的道路...',
    genre: '轻小说',
    tags: ['龙族', '热血', '青春', '冒险'],
    wordCount: 2800000,
    chapterCount: 900,
    rating: 9.2,
    readCount: '8900万',
    lastUpdate: '2024-03-01',
    status: 'ongoing',
    url: 'https://fanqienovel.com/page/xxxx'
  },
  {
    id: '20',
    title: '全职高手',
    author: '蝴蝶蓝',
    cover: 'https://p1-tt.byteimg.com/img/novel-images/xxxxx',
    summary: '网游荣耀中被誉为教科书级别的顶尖高手，因为种种原因遭到俱乐部的驱逐，离开职业圈的他寄身于一家网吧成了一个小小的网管...',
    genre: '游戏',
    tags: ['电竞', '荣耀', '热血', '大神'],
    wordCount: 4800000,
    chapterCount: 1700,
    rating: 9.6,
    readCount: '1.2亿',
    lastUpdate: '2024-03-11',
    status: 'completed',
    url: 'https://fanqienovel.com/page/xxxx'
  }
];

// 根据题材获取小说
export function getNovelsByGenre(genre: NovelGenre): Novel[] {
  if (genre === '全部') {
    return MOCK_NOVELS;
  }
  return MOCK_NOVELS.filter(novel => novel.genre === genre);
}

// 搜索小说
export function searchNovels(keyword: string): Novel[] {
  const lowerKeyword = keyword.toLowerCase();
  return MOCK_NOVELS.filter(novel => 
    novel.title.toLowerCase().includes(lowerKeyword) ||
    novel.author.toLowerCase().includes(lowerKeyword) ||
    novel.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
}

// 获取热门小说
export function getPopularNovels(limit: number = 10): Novel[] {
  return [...MOCK_NOVELS]
    .sort((a, b) => parseFloat(b.readCount) - parseFloat(a.readCount))
    .slice(0, limit);
}

// 获取高分小说
export function getTopRatedNovels(limit: number = 10): Novel[] {
  return [...MOCK_NOVELS]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}
