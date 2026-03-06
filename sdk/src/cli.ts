#!/usr/bin/env node
/**
 * AI Video Creator CLI Tool
 * 命令行工具，用于生成图片和视频
 */

import { AIVideoSDK, ImageGenerateRequest, VideoGenerateRequest } from './index';

const API_BASE_URL = process.env.AI_VIDEO_API_URL || 'http://localhost:3001/api';

function printUsage() {
  console.log(`
AI Video Creator CLI

用法:
  # 生成图片
  npx tsx cli.ts image "prompt" [options]

  # 生成视频  
  npx tsx cli.ts video "prompt" [options]

  # 查询任务状态
  npx tsx cli.ts status <task-id> [image|video]

选项:
  --style, -s        风格 (cinematic|anime|realistic|cyberpunk|vintage)
  --ratio, -r        比例 (16:9|9:16|1:1|4:3)
  --duration, -d     视频时长 (1-10秒)
  --platform, -p     生成平台 (dreamina|luma|keling|runway)
  --wait, -w         等待生成完成
  --output, -o       输出JSON文件

环境变量:
  AI_VIDEO_API_URL   API基础地址 (默认: http://localhost:3001/api)

示例:
  npx tsx cli.ts image "一只猫在月亮上" --style anime --ratio 1:1 --wait
  npx tsx cli.ts video "女孩在海边奔跑" --duration 5 --platform dreamina --wait
  npx tsx cli.ts status img_abc123 image
`);
}

function parseArgs(args: string[]): { command: string; options: Record<string, any>; prompt?: string } {
  const result: { command: string; options: Record<string, any>; prompt?: string } = {
    command: args[0] || '',
    options: {},
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith('-')) {
        result.options[key] = value;
        i++;
      } else {
        result.options[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      const value = args[i + 1];
      if (value && !value.startsWith('-')) {
        result.options[key] = value;
        i++;
      } else {
        result.options[key] = true;
      }
    } else if (!result.prompt) {
      result.prompt = arg;
    }
  }

  return result;
}

async function generateImage(prompt: string, options: Record<string, any>) {
  const sdk = new AIVideoSDK({ baseURL: API_BASE_URL });
  
  const request: ImageGenerateRequest = {
    prompt,
    style: options.style || options.s || 'realistic',
    ratio: options.ratio || options.r || '1:1',
  };

  console.log('🎨 正在生成图片...');
  console.log(`   Prompt: ${prompt}`);
  console.log(`   Style: ${request.style}`);
  console.log(`   Ratio: ${request.ratio}`);

  try {
    if (options.wait || options.w) {
      const result = await sdk.generateImageAndWait(request, {
        onUpdate: (status) => {
          process.stdout.write(`\r   状态: ${status.status} ${status.progress ? `(${status.progress}%)` : ''}`);
        },
      });
      console.log('\n✅ 生成完成!');
      console.log(`   URL: ${result.result_url}`);
      
      if (options.output || options.o) {
        const fs = await import('fs');
        fs.writeFileSync(options.output || options.o, JSON.stringify(result, null, 2));
        console.log(`   已保存到: ${options.output || options.o}`);
      }
    } else {
      const result = await sdk.generateImage(request);
      console.log('✅ 任务已创建');
      console.log(`   Task ID: ${result.id}`);
      console.log(`   查询状态: npx tsx cli.ts status ${result.id} image`);
    }
  } catch (error) {
    console.error('\n❌ 生成失败:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function generateVideo(prompt: string, options: Record<string, any>) {
  const sdk = new AIVideoSDK({ baseURL: API_BASE_URL });
  
  const request: VideoGenerateRequest = {
    prompt,
    style: options.style || options.s || 'cinematic',
    aspect_ratio: options.ratio || options.r || '16:9',
    duration: parseInt(options.duration || options.d || '5'),
    platform: options.platform || options.p || 'dreamina',
  };

  console.log('🎬 正在生成视频...');
  console.log(`   Prompt: ${prompt}`);
  console.log(`   Style: ${request.style}`);
  console.log(`   Duration: ${request.duration}s`);
  console.log(`   Platform: ${request.platform}`);

  try {
    if (options.wait || options.w) {
      const result = await sdk.generateVideoAndWait(request, {
        interval: 5000,
        onUpdate: (status) => {
          process.stdout.write(`\r   状态: ${status.status} ${status.progress ? `(${status.progress}%)` : ''}`);
        },
      });
      console.log('\n✅ 生成完成!');
      console.log(`   URL: ${result.result_url}`);
      
      if (options.output || options.o) {
        const fs = await import('fs');
        fs.writeFileSync(options.output || options.o, JSON.stringify(result, null, 2));
        console.log(`   已保存到: ${options.output || options.o}`);
      }
    } else {
      const result = await sdk.generateVideo(request);
      console.log('✅ 任务已创建');
      console.log(`   Task ID: ${result.id}`);
      console.log(`   查询状态: npx tsx cli.ts status ${result.id} video`);
    }
  } catch (error) {
    console.error('\n❌ 生成失败:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function checkStatus(taskId: string, type: string) {
  const sdk = new AIVideoSDK({ baseURL: API_BASE_URL });
  
  if (!['image', 'video'].includes(type)) {
    console.error('❌ 类型必须是 image 或 video');
    process.exit(1);
  }

  console.log(`🔍 查询任务状态: ${taskId}`);
  
  try {
    const result = type === 'image' 
      ? await sdk.getImageStatus(taskId)
      : await sdk.getVideoStatus(taskId);
    
    console.log('状态:', result.status);
    if (result.result_url) {
      console.log('URL:', result.result_url);
    }
    if (result.error) {
      console.log('错误:', result.error);
    }
  } catch (error) {
    console.error('❌ 查询失败:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(0);
  }

  const { command, options, prompt } = parseArgs(args);

  switch (command) {
    case 'image':
      if (!prompt) {
        console.error('❌ 请提供图片描述');
        process.exit(1);
      }
      await generateImage(prompt, options);
      break;

    case 'video':
      if (!prompt) {
        console.error('❌ 请提供视频描述');
        process.exit(1);
      }
      await generateVideo(prompt, options);
      break;

    case 'status':
      if (!prompt || !options[Object.keys(options)[0]]) {
        console.error('❌ 请提供任务ID和类型');
        process.exit(1);
      }
      await checkStatus(prompt, Object.keys(options)[0] || 'image');
      break;

    default:
      console.error(`❌ 未知命令: ${command}`);
      printUsage();
      process.exit(1);
  }
}

main();
