#!/usr/bin/env node
/**
 * ai-video CLI Tool
 * AI 视频/图片生成命令行工具
 * 
 * 支持平台: 即梦 Dreamina / 可灵 Keling / Luma / Runway
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { AIVideoSDK, ImageGenerateRequest, VideoGenerateRequest } from './sdk';

const program = new Command();

// 配置路径
const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.ai-video');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// 默认配置
const DEFAULT_CONFIG = {
  apiUrl: process.env.AI_VIDEO_API_URL || 'http://localhost:3001/api',
  defaultStyle: 'cinematic',
  defaultRatio: '16:9',
  defaultPlatform: 'dreamina',
  defaultDuration: 5,
};

// 加载配置
function loadConfig(): typeof DEFAULT_CONFIG {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return { ...DEFAULT_CONFIG, ...fs.readJsonSync(CONFIG_FILE) };
    }
  } catch (error) {
    console.error(chalk.yellow('警告: 配置文件读取失败，使用默认配置'));
  }
  return DEFAULT_CONFIG;
}

// 保存配置
function saveConfig(config: Partial<typeof DEFAULT_CONFIG>) {
  fs.ensureDirSync(CONFIG_DIR);
  const currentConfig = loadConfig();
  fs.writeJsonSync(CONFIG_FILE, { ...currentConfig, ...config }, { spaces: 2 });
}

// 初始化 SDK
function initSDK(): AIVideoSDK {
  const config = loadConfig();
  return new AIVideoSDK({ baseURL: config.apiUrl });
}

// ============ CLI 定义 ============

program
  .name('ai-video')
  .description('AI 视频/图片生成命令行工具')
  .version('1.0.0');

// 配置命令
program
  .command('config')
  .description('查看或设置配置')
  .option('-s, --set <key=value>', '设置配置项', collect, [])
  .option('-l, --list', '列出所有配置')
  .action((options) => {
    if (options.list) {
      const config = loadConfig();
      console.log(chalk.cyan('\n当前配置:'));
      console.log(chalk.gray('─'.repeat(40)));
      Object.entries(config).forEach(([key, value]) => {
        console.log(`  ${chalk.green(key.padEnd(15))} ${value}`);
      });
      console.log(chalk.gray('─'.repeat(40)));
      console.log(chalk.gray(`配置文件: ${CONFIG_FILE}\n`));
    } else if (options.set.length > 0) {
      const updates: Record<string, any> = {};
      options.set.forEach((pair: string) => {
        const [key, value] = pair.split('=');
        if (key && value) {
          // 尝试解析数字
          updates[key] = isNaN(Number(value)) ? value : Number(value);
        }
      });
      saveConfig(updates);
      console.log(chalk.green('✓ 配置已更新'));
    } else {
      console.log(chalk.yellow('使用 --list 查看配置，或使用 --set key=value 设置配置'));
    }
  });

// 生成图片命令
program
  .command('image <prompt>')
  .description('生成图片')
  .option('-s, --style <style>', '风格 (cinematic|anime|realistic|cyberpunk|vintage)', loadConfig().defaultStyle)
  .option('-r, --ratio <ratio>', '比例 (16:9|9:16|1:1|4:3)', loadConfig().defaultRatio)
  .option('-n, --negative <prompt>', '负面提示词')
  .option('--ref <url>', '参考图片URL')
  .option('-w, --wait', '等待生成完成', false)
  .option('-o, --output <file>', '输出结果到JSON文件')
  .option('-d, --download <path>', '下载图片到指定路径')
  .action(async (prompt: string, options) => {
    const sdk = initSDK();
    const config = loadConfig();
    
    const spinner = ora('正在创建图片生成任务...').start();
    
    try {
      const request: ImageGenerateRequest = {
        prompt,
        style: options.style as any,
        ratio: options.ratio as any,
        negative_prompt: options.negative,
        reference_image: options.ref,
      };

      const result = await sdk.generateImage(request);
      spinner.succeed(`任务已创建: ${chalk.cyan(result.id)}`);

      if (options.wait) {
        const waitSpinner = ora('等待生成完成...').start();
        
        const finalResult = await sdk.pollTaskStatus(result.id, 'image', {
          interval: 3000,
          onUpdate: (status) => {
            const progress = status.progress ? ` (${status.progress}%)` : '';
            waitSpinner.text = `生成中... [${status.status}]${progress}`;
          },
        });
        
        waitSpinner.succeed('生成完成!');
        
        if (finalResult.result_url) {
          console.log(`\n${chalk.green('✓')} 图片URL: ${chalk.underline(finalResult.result_url)}`);
          
          // 下载图片
          if (options.download) {
            const downloadSpinner = ora('下载图片...').start();
            try {
              await downloadFile(finalResult.result_url, options.download);
              downloadSpinner.succeed(`已保存到: ${options.download}`);
            } catch (error) {
              downloadSpinner.fail(`下载失败: ${error}`);
            }
          }
        }

        // 保存结果到JSON
        if (options.output) {
          await fs.writeJson(options.output, finalResult, { spaces: 2 });
          console.log(`${chalk.green('✓')} 结果已保存到: ${options.output}`);
        }
      } else {
        console.log(`\n查询状态: ${chalk.cyan(`ai-video status ${result.id} image`)}`);
      }
    } catch (error) {
      spinner.fail(`生成失败: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

// 生成视频命令
program
  .command('video <prompt>')
  .description('生成视频')
  .option('-s, --style <style>', '风格 (cinematic|anime|realistic|dreamy|noir)', 'cinematic')
  .option('-r, --ratio <ratio>', '比例 (16:9|9:16|1:1)', loadConfig().defaultRatio)
  .option('-d, --duration <seconds>', '视频时长 (1-10秒)', String(loadConfig().defaultDuration))
  .option('-p, --platform <platform>', '平台 (dreamina|luma|keling|runway)', loadConfig().defaultPlatform)
  .option('--image <url>', '首帧图片URL')
  .option('-w, --wait', '等待生成完成', false)
  .option('-o, --output <file>', '输出结果到JSON文件')
  .action(async (prompt: string, options) => {
    const sdk = initSDK();
    
    const spinner = ora('正在创建视频生成任务...').start();
    
    try {
      const request: VideoGenerateRequest = {
        prompt,
        style: options.style as any,
        aspect_ratio: options.ratio as any,
        duration: parseInt(options.duration),
        platform: options.platform as any,
        image_url: options.image,
      };

      const result = await sdk.generateVideo(request);
      spinner.succeed(`任务已创建: ${chalk.cyan(result.id)}`);

      if (options.wait) {
        const waitSpinner = ora('等待生成完成...').start();
        
        const finalResult = await sdk.pollTaskStatus(result.id, 'video', {
          interval: 5000,
          onUpdate: (status) => {
            const progress = status.progress ? ` (${status.progress}%)` : '';
            waitSpinner.text = `生成中... [${status.status}]${progress}`;
          },
        });
        
        waitSpinner.succeed('生成完成!');
        
        if (finalResult.result_url) {
          console.log(`\n${chalk.green('✓')} 视频URL: ${chalk.underline(finalResult.result_url)}`);
        }

        if (options.output) {
          await fs.writeJson(options.output, finalResult, { spaces: 2 });
          console.log(`${chalk.green('✓')} 结果已保存到: ${options.output}`);
        }
      } else {
        console.log(`\n查询状态: ${chalk.cyan(`ai-video status ${result.id} video`)}`);
      }
    } catch (error) {
      spinner.fail(`生成失败: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

// 查询状态命令
program
  .command('status <taskId>')
  .description('查询任务状态')
  .option('-t, --type <type>', '任务类型 (image|video)', 'image')
  .option('-w, --watch', '持续监控状态变化', false)
  .action(async (taskId: string, options) => {
    const sdk = initSDK();
    
    const fetchStatus = async () => {
      const result = options.type === 'image' 
        ? await sdk.getImageStatus(taskId)
        : await sdk.getVideoStatus(taskId);
      
      console.clear();
      console.log(chalk.cyan('\n📋 任务状态'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(`  ID:     ${chalk.cyan(result.id)}`);
      console.log(`  类型:   ${options.type === 'image' ? '🎨 图片' : '🎬 视频'}`);
      console.log(`  状态:   ${formatStatus(result.status)}`);
      
      if (result.progress !== undefined) {
        console.log(`  进度:   ${renderProgressBar(result.progress)} ${result.progress}%`);
      }
      
      if (result.result_url) {
        console.log(`  URL:    ${chalk.underline(result.result_url)}`);
      }
      
      if (result.error) {
        console.log(`  错误:   ${chalk.red(result.error)}`);
      }
      
      console.log(chalk.gray('─'.repeat(40)));
      
      return result;
    };
    
    try {
      if (options.watch) {
        console.log(chalk.yellow('按 Ctrl+C 停止监控\n'));
        const poll = async () => {
          const result = await fetchStatus();
          if (result.status === 'completed' || result.status === 'failed') {
            console.log(chalk.green('\n✓ 任务已结束'));
            process.exit(0);
          }
          setTimeout(poll, 3000);
        };
        await poll();
      } else {
        await fetchStatus();
      }
    } catch (error) {
      console.error(chalk.red(`查询失败: ${error instanceof Error ? error.message : error}`));
      process.exit(1);
    }
  });

// 批量生成命令
program
  .command('batch <file>')
  .description('从JSON文件批量生成')
  .option('-w, --wait', '等待所有任务完成', false)
  .action(async (file: string, options) => {
    const sdk = initSDK();
    
    try {
      const batchConfig = await fs.readJson(file);
      
      if (!Array.isArray(batchConfig.tasks)) {
        throw new Error('JSON文件必须包含 tasks 数组');
      }
      
      console.log(chalk.cyan(`\n📦 批量生成: ${batchConfig.tasks.length} 个任务\n`));
      
      const results = [];
      for (let i = 0; i < batchConfig.tasks.length; i++) {
        const task = batchConfig.tasks[i];
        const spinner = ora(`[${i + 1}/${batchConfig.tasks.length}] 创建任务...`).start();
        
        try {
          if (task.type === 'image') {
            const result = await sdk.generateImage(task.request);
            spinner.succeed(`[${i + 1}] 图片任务: ${result.id}`);
            results.push({ type: 'image', id: result.id, status: 'created' });
          } else if (task.type === 'video') {
            const result = await sdk.generateVideo(task.request);
            spinner.succeed(`[${i + 1}] 视频任务: ${result.id}`);
            results.push({ type: 'video', id: result.id, status: 'created' });
          }
        } catch (error) {
          spinner.fail(`[${i + 1}] 创建失败: ${error}`);
          results.push({ type: task.type, error: String(error), status: 'failed' });
        }
      }
      
      console.log(chalk.green(`\n✓ 已创建 ${results.filter(r => r.status === 'created').length} 个任务`));
      
      // 保存任务列表
      const outputFile = file.replace('.json', '-tasks.json');
      await fs.writeJson(outputFile, results, { spaces: 2 });
      console.log(chalk.gray(`任务列表已保存: ${outputFile}`));
      
    } catch (error) {
      console.error(chalk.red(`批量生成失败: ${error instanceof Error ? error.message : error}`));
      process.exit(1);
    }
  });

// 列出支持的平台
program
  .command('platforms')
  .description('列出支持的平台和风格')
  .action(() => {
    console.log(chalk.cyan('\n🎬 支持的平台:'));
    console.log('');
    
    const platforms = [
      { name: 'dreamina', label: '即梦', desc: '字节跳动，速度快，效果好' },
      { name: 'luma', label: 'Luma', desc: 'Luma AI，电影级质量' },
      { name: 'keling', label: '可灵', desc: '快手出品，运动表现好' },
      { name: 'runway', label: 'Runway', desc: 'Runway Gen-2，行业标杆' },
    ];
    
    platforms.forEach(p => {
      console.log(`  ${chalk.green(p.name.padEnd(10))} ${chalk.yellow(p.label.padEnd(8))} ${p.desc}`);
    });
    
    console.log(chalk.cyan('\n🎨 图片风格:'));
    console.log('  cinematic  电影感');
    console.log('  anime      动漫');
    console.log('  realistic  写实');
    console.log('  cyberpunk  赛博朋克');
    console.log('  vintage    复古');
    
    console.log(chalk.cyan('\n🎬 视频风格:'));
    console.log('  cinematic  电影感');
    console.log('  anime      动漫');
    console.log('  realistic  写实');
    console.log('  dreamy     梦幻');
    console.log('  noir       黑色电影');
    
    console.log(chalk.cyan('\n📐 比例选项:'));
    console.log('  16:9   横屏 (视频默认)');
    console.log('  9:16   竖屏 (短视频)');
    console.log('  1:1    方形');
    console.log('  4:3    标准');
    console.log('');
  });

// 小说列表命令
program
  .command('novels')
  .description('番茄小说素材库 - 浏览热门小说')
  .option('-g, --genre <genre>', '筛选题材 (都市|玄幻|仙侠|科幻|悬疑|历史|军事|游戏|体育|轻小说)', '全部')
  .option('-s, --search <keyword>', '搜索小说')
  .option('--popular', '查看热门小说')
  .option('--top', '查看高分小说')
  .option('-d, --detail <id>', '查看小说详情')
  .option('--script <id>', '基于小说生成短剧剧本')
  .action(async (options) => {
    // 模拟小说数据
    const novels = [
      {
        id: '1',
        title: '全球冰封：我打造了末日安全屋',
        author: '记忆的海',
        genre: '科幻',
        tags: ['末世', '生存', '基建', '囤货'],
        rating: 9.2,
        readCount: '1250万',
        summary: '全球气温骤降，世界陷入冰封末日。主角提前预知灾难，花费全部积蓄打造了一座地下安全屋...'
      },
      {
        id: '2',
        title: '我在精神病院学斩神',
        author: '三九音域',
        genre: '都市',
        tags: ['神话', '异能', '热血', '守护'],
        rating: 9.5,
        readCount: '5800万',
        summary: '你可曾想过，在霓虹璀璨的都市之下，潜藏着来自古老神话的怪物？'
      },
      {
        id: '3',
        title: '逆天邪神',
        author: '火星引力',
        genre: '玄幻',
        tags: ['爽文', '逆袭', '热血', '神魔'],
        rating: 9.0,
        readCount: '8900万',
        summary: '掌天毒之珠，承邪神之血，修逆天之力，一代邪神，君临天下！'
      },
      {
        id: '4',
        title: '神秘复苏',
        author: '佛前献花',
        genre: '悬疑',
        tags: ['恐怖', '灵异', '智斗', '生存'],
        rating: 9.4,
        readCount: '6200万',
        summary: '五浊恶世，地狱已空，厉鬼复苏，人间如狱。'
      },
      {
        id: '5',
        title: '大奉打更人',
        author: '卖报小郎君',
        genre: '仙侠',
        tags: ['探案', '朝堂', '权谋', '轻松'],
        rating: 9.6,
        readCount: '9200万',
        summary: '这个世界，有儒；有道；有佛；有妖；有术士。警校毕业的许七安幽幽醒来，发现自己身处牢狱之中...'
      },
      {
        id: '6',
        title: '道诡异仙',
        author: '狐尾的笔',
        genre: '玄幻',
        tags: ['克苏鲁', '诡异', '修仙', '黑暗'],
        rating: 9.4,
        readCount: '5200万',
        summary: '诡异的天道，异常的仙佛，是真？是假？陷入迷惘的李火旺无法分辨。'
      },
      {
        id: '7',
        title: '这游戏也太真实了',
        author: '晨星LL',
        genre: '科幻',
        tags: ['第四天灾', '经营', '废土', '游戏'],
        rating: 9.3,
        readCount: '3500万',
        summary: '穿越到废土时代，主角获得了一款完全真实的游戏系统...'
      },
      {
        id: '8',
        title: '黎明之剑',
        author: '远瞳',
        genre: '科幻',
        tags: ['种田', '西幻', '史诗', '发展'],
        rating: 9.5,
        readCount: '3200万',
        summary: '高文穿越了，但穿越的时候好像出了点问题。他发现自己需要附身在一个已经死去700年的老祖宗身上...'
      }
    ];

    // 搜索功能
    if (options.search) {
      const keyword = options.search.toLowerCase();
      const filtered = novels.filter(n => 
        n.title.toLowerCase().includes(keyword) ||
        n.author.toLowerCase().includes(keyword) ||
        n.tags.some(t => t.toLowerCase().includes(keyword))
      );
      
      console.log(chalk.cyan(`\n🔍 搜索结果: "${options.search}"`));
      console.log(chalk.gray(`找到 ${filtered.length} 本相关小说\n`));
      
      filtered.forEach(novel => {
        printNovelBrief(novel);
      });
      return;
    }

    // 查看详情
    if (options.detail) {
      const novel = novels.find(n => n.id === options.detail);
      if (!novel) {
        console.log(chalk.red('❌ 未找到该小说'));
        return;
      }
      printNovelDetail(novel);
      return;
    }

    // 生成剧本
    if (options.script) {
      const novel = novels.find(n => n.id === options.script);
      if (!novel) {
        console.log(chalk.red('❌ 未找到该小说'));
        return;
      }
      
      console.log(chalk.cyan(`\n🎬 基于《${novel.title}》生成短剧剧本\n`));
      console.log(chalk.yellow('═'.repeat(60)));
      console.log();
      
      // 生成剧本大纲
      console.log(chalk.green('📖 剧本大纲:'));
      console.log(`题材: ${novel.genre}`);
      console.log(`核心元素: ${novel.tags.join('、')}`);
      console.log();
      console.log(chalk.white('故事简介:'));
      console.log(novel.summary);
      console.log();
      
      // 生成分镜建议
      console.log(chalk.green('🎬 分镜建议:'));
      console.log();
      console.log(chalk.cyan('场景1 - 开场'));
      console.log(`画面: ${novel.genre}风格的宏大场景 establishing shot`);
      console.log(`时长: 3-5秒`);
      console.log();
      console.log(chalk.cyan('场景2 - 主角登场'));
      console.log('画面: 主角特写，展现人物特征');
      console.log('时长: 2-3秒');
      console.log();
      console.log(chalk.cyan('场景3 - 核心冲突'));
      console.log(`画面: ${novel.tags[0]}相关的戏剧性场面`);
      console.log('时长: 5-8秒');
      console.log();
      console.log(chalk.cyan('场景4 - 高潮'));
      console.log('画面: 最精彩的视觉场面');
      console.log('时长: 5-10秒');
      console.log();
      console.log(chalk.cyan('场景5 - 结尾'));
      console.log('画面: 悬念或情感共鸣画面');
      console.log('时长: 3-5秒');
      console.log();
      
      // 生成提示词
      console.log(chalk.green('🎨 AI生成提示词:'));
      console.log();
      console.log(chalk.yellow('图片生成提示词:'));
      console.log(`"${novel.summary.substring(0, 50)}..., ${novel.genre} style, cinematic lighting, dramatic composition, high quality"`);
      console.log();
      console.log(chalk.yellow('视频生成提示词:'));
      console.log(`"${novel.tags[0]} scene, ${novel.genre} atmosphere, cinematic, 8k quality"`);
      console.log();
      
      console.log(chalk.yellow('═'.repeat(60)));
      console.log(chalk.gray('\n提示: 使用以下命令开始生成素材'));
      console.log(chalk.cyan(`  ai-video image "你的画面描述" --wait`));
      console.log(chalk.cyan(`  ai-video video "你的视频描述" --wait`));
      console.log();
      return;
    }

    // 筛选题材
    let displayNovels = novels;
    if (options.genre && options.genre !== '全部') {
      displayNovels = novels.filter(n => n.genre === options.genre);
    }

    // 排序
    if (options.popular) {
      console.log(chalk.cyan('\n🔥 热门小说榜\n'));
    } else if (options.top) {
      console.log(chalk.cyan('\n⭐ 高分小说榜\n'));
      displayNovels = [...displayNovels].sort((a, b) => b.rating - a.rating);
    } else {
      const genreText = options.genre === '全部' ? '' : ` - ${options.genre}`;
      console.log(chalk.cyan(`\n📚 番茄小说素材库${genreText}\n`));
    }

    console.log(chalk.gray(`共 ${displayNovels.length} 本小说\n`));
    
    displayNovels.forEach(novel => {
      printNovelBrief(novel);
    });

    console.log(chalk.gray('\n提示:'));
    console.log(`  ${chalk.cyan('ai-video novels --detail <id>')}  查看详情`);
    console.log(`  ${chalk.cyan('ai-video novels --script <id>')}  生成剧本`);
    console.log(`  ${chalk.cyan('ai-video novels --search <关键词>')}  搜索小说`);
    console.log();
  });

function printNovelBrief(novel: any) {
  console.log(chalk.yellow('┌' + '─'.repeat(58)));
  console.log(chalk.yellow('│') + ` ${chalk.white.bold(novel.title)}`);
  console.log(chalk.yellow('│') + ` ${chalk.gray('作者:')} ${novel.author.padEnd(20)} ${chalk.gray('题材:')} ${chalk.blue(novel.genre)}`);
  console.log(chalk.yellow('│') + ` ${chalk.gray('评分:')} ${chalk.yellow('★' + novel.rating)}  ${chalk.gray('阅读:')} ${novel.readCount}`);
  console.log(chalk.yellow('│') + ` ${chalk.gray('标签:')} ${novel.tags.map((t: string) => chalk.cyan(t)).join(' ')}`);
  console.log(chalk.yellow('│') + ` ${chalk.gray('ID:')} ${novel.id}  ${chalk.gray('查看:')} ai-video novels --detail ${novel.id}`);
  console.log(chalk.yellow('└' + '─'.repeat(58)));
  console.log();
}

function printNovelDetail(novel: any) {
  console.log(chalk.cyan('\n📖 小说详情\n'));
  console.log(chalk.yellow('═'.repeat(60)));
  console.log();
  console.log(`${chalk.white.bold('书名:')} ${novel.title}`);
  console.log(`${chalk.white.bold('作者:')} ${novel.author}`);
  console.log(`${chalk.white.bold('题材:')} ${chalk.blue(novel.genre)}`);
  console.log(`${chalk.white.bold('评分:')} ${chalk.yellow('★' + novel.rating)}`);
  console.log(`${chalk.white.bold('阅读量:')} ${novel.readCount}`);
  console.log(`${chalk.white.bold('标签:')} ${novel.tags.map((t: string) => chalk.cyan(t)).join(' ')}`);
  console.log();
  console.log(chalk.white.bold('简介:'));
  console.log(novel.summary);
  console.log();
  console.log(chalk.yellow('═'.repeat(60)));
  console.log();
  console.log(chalk.gray('可用命令:'));
  console.log(`  ${chalk.cyan(`ai-video novels --script ${novel.id}`)}  基于本书生成短剧剧本`);
  console.log();
}

// 辅助函数
function collect(value: string, previous: string[]) {
  return previous.concat([value]);
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: chalk.yellow('⏳ 等待中'),
    generating: chalk.blue('🔄 生成中'),
    completed: chalk.green('✅ 完成'),
    failed: chalk.red('❌ 失败'),
  };
  return statusMap[status] || status;
}

function renderProgressBar(progress: number): string {
  const width = 20;
  const filled = Math.round((progress / 100) * width);
  const empty = width - filled;
  return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
}

async function downloadFile(url: string, dest: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(dest, buffer);
}

// 解析参数
program.parse();

// 如果没有参数，显示帮助
if (process.argv.length <= 2) {
  program.help();
}
