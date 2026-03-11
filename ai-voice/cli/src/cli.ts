#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import FormData from 'form-data';

const program = new Command();

// API 基础地址
const API_BASE = process.env.AI_VOICE_API_URL || 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000
});

program
  .name('ai-voice')
  .description('AI 配音 CLI 工具 - 文字转语音、语音克隆')
  .version('1.0.0');

// ============ 语音合成命令 ============
program
  .command('synthesize')
  .alias('syn')
  .description('文字转语音')
  .requiredOption('-t, --text <text>', '要合成的文本')
  .option('-v, --voice <voice>', '音色ID', 'cosyvoice_female_01')
  .option('-s, --speed <speed>', '语速 (0.5-2.0)', '1.0')
  .option('-o, --output <file>', '输出文件路径')
  .option('-e, --emotion <emotion>', '情感 (neutral|happy|sad|angry)', 'neutral')
  .action(async (options) => {
    const spinner = ora('正在合成语音...').start();
    
    try {
      const response = await api.post('/tts/synthesize', {
        text: options.text,
        voice: options.voice,
        speed: parseFloat(options.speed),
        emotion: options.emotion
      });

      if (response.data.success) {
        spinner.succeed('语音合成成功!');
        
        const { taskId, url } = response.data.data;
        console.log(chalk.green(`\n✓ 任务ID: ${taskId}`));
        console.log(chalk.blue(`✓ 音频URL: ${API_BASE.replace('/api', '')}${url}`));
        
        // 下载音频
        if (options.output) {
          const downloadSpinner = ora('下载音频...').start();
          try {
            const audioRes = await axios.get(`${API_BASE.replace('/api', '')}${url}`, {
              responseType: 'arraybuffer'
            });
            await fs.writeFile(options.output, audioRes.data);
            downloadSpinner.succeed(`已保存到: ${options.output}`);
          } catch (error) {
            downloadSpinner.fail('下载失败');
          }
        }
      } else {
        spinner.fail(`合成失败: ${response.data.error}`);
      }
    } catch (error: any) {
      spinner.fail(`请求失败: ${error.message}`);
      if (error.response?.data?.error) {
        console.error(chalk.red(error.response.data.error));
      }
    }
  });

// 长文本合成
program
  .command('synthesize-long')
  .alias('syn-long')
  .description('长文本合成（自动分段）')
  .requiredOption('-t, --text <text>', '要合成的文本')
  .option('-v, --voice <voice>', '音色ID', 'cosyvoice_female_01')
  .option('-s, --speed <speed>', '语速', '1.0')
  .option('-m, --max-length <length>', '每段最大长度', '200')
  .option('-d, --output-dir <dir>', '输出目录')
  .action(async (options) => {
    const spinner = ora('正在分段合成...').start();
    
    try {
      const response = await api.post('/tts/synthesize/long', {
        text: options.text,
        voice: options.voice,
        speed: parseFloat(options.speed),
        maxLength: parseInt(options.maxLength)
      });

      if (response.data.success) {
        spinner.succeed('分段合成完成!');
        
        const { taskId, segments, urls } = response.data.data;
        console.log(chalk.green(`\n✓ 任务ID: ${taskId}`));
        console.log(chalk.gray(`✓ 共 ${segments} 个音频片段`));
        
        // 下载所有片段
        if (options.outputDir) {
          await fs.ensureDir(options.outputDir);
          const downloadSpinner = ora('下载音频片段...').start();
          
          for (let i = 0; i < urls.length; i++) {
            const { index, url } = urls[i];
            const outputFile = path.join(options.outputDir, `segment_${String(index).padStart(3, '0')}.wav`);
            const audioRes = await axios.get(`${API_BASE.replace('/api', '')}${url}`, {
              responseType: 'arraybuffer'
            });
            await fs.writeFile(outputFile, audioRes.data);
          }
          
          downloadSpinner.succeed(`已保存到: ${options.outputDir}`);
        } else {
          urls.forEach(({ index, url }: { index: number; url: string }) => {
            console.log(chalk.gray(`  [${index + 1}] ${API_BASE.replace('/api', '')}${url}`));
          });
        }
      }
    } catch (error: any) {
      spinner.fail(`请求失败: ${error.message}`);
    }
  });

// ============ 语音克隆命令 ============
program
  .command('clone')
  .description('克隆音色')
  .requiredOption('-a, --audio <file>', '参考音频文件')
  .option('-n, --name <name>', '音色名称')
  .option('-d, --description <desc>', '音色描述')
  .action(async (options) => {
    if (!fs.existsSync(options.audio)) {
      console.error(chalk.red(`❌ 音频文件不存在: ${options.audio}`));
      return;
    }

    const spinner = ora('正在克隆音色...').start();
    
    try {
      const form = new FormData();
      form.append('audio', fs.createReadStream(options.audio));
      if (options.name) form.append('name', options.name);
      if (options.description) form.append('description', options.description);

      const response = await api.post('/voice/clone', form, {
        headers: form.getHeaders()
      });

      if (response.data.success) {
        spinner.succeed('音色克隆成功!');
        
        const { voiceId, name, url } = response.data.data;
        console.log(chalk.green(`\n✓ 音色ID: ${voiceId}`));
        console.log(chalk.white(`✓ 音色名称: ${name}`));
        console.log(chalk.blue(`✓ 参考音频: ${API_BASE.replace('/api', '')}${url}`));
        console.log(chalk.gray(`\n提示: 使用 ai-voice synthesize -v ${voiceId} 使用此音色合成`));
      }
    } catch (error: any) {
      spinner.fail(`克隆失败: ${error.message}`);
      if (error.response?.data?.error) {
        console.error(chalk.red(error.response.data.error));
      }
    }
  });

// 使用克隆音色合成
program
  .command('clone-synthesize')
  .alias('clone-syn')
  .description('使用克隆的音色合成')
  .requiredOption('--voice-id <id>', '克隆的音色ID')
  .requiredOption('-t, --text <text>', '要合成的文本')
  .option('-s, --speed <speed>', '语速', '1.0')
  .option('-o, --output <file>', '输出文件')
  .action(async (options) => {
    const spinner = ora('正在使用克隆音色合成...').start();
    
    try {
      const response = await api.post(`/voice/synthesize/${options.voiceId}`, {
        text: options.text,
        speed: parseFloat(options.speed)
      });

      if (response.data.success) {
        spinner.succeed('合成成功!');
        
        const { taskId, url } = response.data.data;
        console.log(chalk.green(`\n✓ 任务ID: ${taskId}`));
        console.log(chalk.blue(`✓ 音频: ${API_BASE.replace('/api', '')}${url}`));
        
        if (options.output) {
          const audioRes = await axios.get(`${API_BASE.replace('/api', '')}${url}`, {
            responseType: 'arraybuffer'
          });
          await fs.writeFile(options.output, audioRes.data);
          console.log(chalk.green(`✓ 已保存: ${options.output}`));
        }
      }
    } catch (error: any) {
      spinner.fail(`合成失败: ${error.message}`);
    }
  });

// ============ 音色管理命令 ============
program
  .command('voices')
  .description('列出所有可用音色')
  .option('--preset', '只显示预设音色')
  .option('--cloned', '只显示克隆音色')
  .action(async (options) => {
    try {
      if (!options.cloned) {
        // 获取预设音色
        const response = await api.get('/voices');
        if (response.data.success) {
          console.log(chalk.cyan('\n🎙️ 预设音色列表:\n'));
          
          const voices = response.data.data;
          const grouped = voices.reduce((acc: any, v: any) => {
            if (!acc[v.engine]) acc[v.engine] = [];
            acc[v.engine].push(v);
            return acc;
          }, {});
          
          Object.entries(grouped).forEach(([engine, voices]: [string, any]) => {
            console.log(chalk.yellow(`${engine.toUpperCase()}:`));
            voices.forEach((v: any) => {
              console.log(`  ${chalk.green(v.id.padEnd(20))} ${v.name.padEnd(12)} ${chalk.gray(v.desc)}`);
            });
            console.log();
          });
        }
      }
      
      if (!options.preset) {
        // 获取克隆音色
        const response = await api.get('/voice/list');
        if (response.data.success && response.data.data.length > 0) {
          console.log(chalk.cyan('🎭 克隆音色列表:\n'));
          
          response.data.data.forEach((v: any) => {
            console.log(`  ${chalk.green(v.id)}`);
            console.log(`    名称: ${v.name}`);
            console.log(`    描述: ${v.description || '无'}`);
            console.log(`    创建时间: ${new Date(v.createdAt).toLocaleString()}`);
            console.log();
          });
        } else if (options.cloned) {
          console.log(chalk.yellow('\n暂无克隆音色'));
        }
      }
    } catch (error: any) {
      console.error(chalk.red(`获取音色列表失败: ${error.message}`));
    }
  });

// 删除克隆音色
program
  .command('voice-delete')
  .description('删除克隆音色')
  .requiredOption('--voice-id <id>', '音色ID')
  .action(async (options) => {
    try {
      await api.delete(`/voice/${options.voiceId}`);
      console.log(chalk.green('✓ 音色已删除'));
    } catch (error: any) {
      console.error(chalk.red(`删除失败: ${error.message}`));
    }
  });

// ============ 工具命令 ============
program
  .command('health')
  .description('检查服务状态')
  .action(async () => {
    try {
      const response = await api.get('/health');
      if (response.data.success) {
        console.log(chalk.green('✓ 服务正常运行'));
        console.log(chalk.gray(`  版本: ${response.data.data.version}`));
        console.log(chalk.gray(`  支持引擎: ${response.data.data.engines.join(', ')}`));
      }
    } catch (error) {
      console.error(chalk.red('✗ 服务连接失败'));
      console.log(chalk.gray(`  API地址: ${API_BASE}`));
      console.log(chalk.gray('  请检查服务是否已启动'));
    }
  });

// 使用示例
program
  .command('examples')
  .description('使用示例')
  .action(() => {
    console.log(chalk.cyan('\n📝 AI-Voice CLI 使用示例\n'));
    
    console.log(chalk.yellow('1. 文字转语音:'));
    console.log('   ai-voice synthesize -t "你好，这是AI配音测试" -o output.wav');
    console.log('   ai-voice syn -t "今天天气不错" -v baidu_female_01');
    console.log();
    
    console.log(chalk.yellow('2. 长文本合成:'));
    console.log('   ai-voice syn-long -t "长文本内容..." -d ./outputs/');
    console.log();
    
    console.log(chalk.yellow('3. 克隆音色:'));
    console.log('   ai-voice clone -a ./my_voice.wav -n "我的音色"');
    console.log();
    
    console.log(chalk.yellow('4. 使用克隆音色:'));
    console.log('   ai-voice clone-syn --voice-id xxx -t "你好" -o output.wav');
    console.log();
    
    console.log(chalk.yellow('5. 查看音色列表:'));
    console.log('   ai-voice voices');
    console.log('   ai-voice voices --cloned');
    console.log();
  });

program.parse();

if (process.argv.length <= 2) {
  program.help();
}
