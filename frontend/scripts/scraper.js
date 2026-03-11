/**
 * 番茄小说爬虫
 * 爬取各分类排行榜 Top 20
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

// 分类配置
const CATEGORIES = [
  { id: 'dushi', name: '都市', url: 'https://fanqienovel.com/rank/1_2_1' },
  { id: 'xuanhuan', name: '玄幻', url: 'https://fanqienovel.com/rank/1_2_2' },
  { id: 'xianxia', name: '仙侠', url: 'https://fanqienovel.com/rank/1_2_3' },
  { id: 'kehuan', name: '科幻', url: 'https://fanqienovel.com/rank/1_2_1142' },
  { id: 'xuanyi', name: '悬疑', url: 'https://fanqienovel.com/rank/1_2_6' },
  { id: 'lishi', name: '历史', url: 'https://fanqienovel.com/rank/1_2_5' },
  { id: 'youxi', name: '游戏', url: 'https://fanqienovel.com/rank/1_2_1145' },
  { id: 'lingyi', name: '灵异', url: 'https://fanqienovel.com/rank/1_2_10' },
  { id: 'wanxiang', name: '脑洞', url: 'https://fanqienovel.com/rank/1_2_1135' },
  { id: 'gufeng', name: '古风', url: 'https://fanqienovel.com/rank/1_2_1117' }
];

// 请求头
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
};

// 延迟函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 爬取单个分类
async function scrapeCategory(category) {
  console.log(`正在爬取: ${category.name}`);
  
  try {
    const response = await axios.get(category.url, { 
      headers: HEADERS,
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    const novels = [];
    
    // 提取小说信息
    $('.rank-book-item, .book-item, [class*="book"]').each((i, el) => {
      if (i >= 20) return false; // 只取前20
      
      const title = $(el).find('.title, .book-title, h3, h4').first().text().trim();
      const author = $(el).find('.author, .book-author').first().text().trim();
      const cover = $(el).find('img').attr('src') || '';
      const desc = $(el).find('.desc, .description, .summary').first().text().trim();
      const link = $(el).find('a').attr('href') || '';
      
      if (title) {
        novels.push({
          rank: i + 1,
          title,
          author: author || '未知',
          cover,
          description: desc || '暂无简介',
          link: link.startsWith('http') ? link : `https://fanqienovel.com${link}`,
          category: category.name
        });
      }
    });
    
    // 如果上面选择器没匹配到，尝试其他选择器
    if (novels.length === 0) {
      $('a[href*="/page/"]').each((i, el) => {
        if (i >= 20) return false;
        const title = $(el).text().trim();
        const href = $(el).attr('href');
        if (title && title.length > 3 && title.length < 50) {
          novels.push({
            rank: i + 1,
            title,
            author: '未知',
            cover: '',
            description: '暂无简介',
            link: href.startsWith('http') ? href : `https://fanqienovel.com${href}`,
            category: category.name
          });
        }
      });
    }
    
    return {
      category: category.name,
      categoryId: category.id,
      count: novels.length,
      novels
    };
    
  } catch (error) {
    console.error(`爬取 ${category.name} 失败:`, error.message);
    return {
      category: category.name,
      categoryId: category.id,
      count: 0,
      novels: [],
      error: error.message
    };
  }
}

// 主函数
async function main() {
  console.log('开始爬取番茄小说排行榜...\n');
  
  const results = [];
  
  for (const category of CATEGORIES) {
    const result = await scrapeCategory(category);
    results.push(result);
    console.log(`  ✓ ${category.name}: ${result.count} 本`);
    await sleep(1000); // 间隔1秒，避免请求过快
  }
  
  // 保存结果
  const outputDir = path.join(__dirname, '../data');
  await fs.ensureDir(outputDir);
  
  const outputFile = path.join(outputDir, 'novels-rank.json');
  await fs.writeJson(outputFile, {
    updateTime: new Date().toISOString(),
    source: 'fanqienovel.com',
    categories: results
  }, { spaces: 2 });
  
  console.log(`\n✓ 爬取完成，数据已保存到: ${outputFile}`);
  
  // 生成摘要
  console.log('\n=== 爬取结果摘要 ===');
  results.forEach(r => {
    console.log(`${r.category}: ${r.count} 本`);
    if (r.novels.length > 0) {
      console.log(`  Top3: ${r.novels.slice(0, 3).map(n => n.title).join(' / ')}`);
    }
  });
}

// 运行
main().catch(console.error);
