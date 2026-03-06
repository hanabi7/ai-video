/**
 * SDK 使用示例
 */

import { AIVideoSDK, createSDK } from './index';

// ============ 初始化 SDK ============
const sdk = createSDK({
  baseURL: 'http://localhost:3001/api',
  timeout: 60000,
});

// ============ 示例 1: 生成图片 ============
async function exampleGenerateImage() {
  console.log('=== 生成图片示例 ===');
  
  try {
    // 方式1: 只创建任务，不等待
    const task = await sdk.generateImage({
      prompt: '一只可爱的橘猫在窗台上晒太阳',
      style: 'realistic',
      ratio: '1:1',
    });
    console.log('任务已创建:', task.id);
    
    // 稍后查询状态
    const status = await sdk.getImageStatus(task.id);
    console.log('当前状态:', status.status);
    
  } catch (error) {
    console.error('生成失败:', error);
  }
}

// ============ 示例 2: 生成图片并等待完成 ============
async function exampleGenerateImageAndWait() {
  console.log('=== 生成图片并等待完成 ===');
  
  try {
    const result = await sdk.generateImageAndWait(
      {
        prompt: '赛博朋克风格的城市夜景，霓虹灯',
        style: 'cyberpunk',
        ratio: '16:9',
      },
      {
        interval: 3000,      // 每3秒检查一次
        maxAttempts: 60,     // 最多尝试60次
        onUpdate: (status) => {
          console.log(`进度: ${status.status}`);
        },
      }
    );
    
    console.log('图片URL:', result.result_url);
    
  } catch (error) {
    console.error('生成失败:', error);
  }
}

// ============ 示例 3: 生成视频 ============
async function exampleGenerateVideo() {
  console.log('=== 生成视频示例 ===');
  
  try {
    const result = await sdk.generateVideoAndWait(
      {
        prompt: '一个女孩在樱花树下旋转',
        duration: 5,
        aspect_ratio: '9:16',
        style: 'anime',
        platform: 'dreamina',
      },
      {
        interval: 5000,
        onUpdate: (status) => {
          console.log(`视频生成状态: ${status.status}`);
        },
      }
    );
    
    console.log('视频URL:', result.result_url);
    
  } catch (error) {
    console.error('生成失败:', error);
  }
}

// ============ 示例 4: 批量生成 ============
async function exampleBatchGenerate() {
  console.log('=== 批量生成图片 ===');
  
  const prompts = [
    { prompt: '山景日出', style: 'realistic' as const },
    { prompt: '未来城市', style: 'cyberpunk' as const },
    { prompt: '日式庭院', style: 'anime' as const },
  ];
  
  try {
    // 批量创建任务
    const tasks = await sdk.batchGenerateImages(
      prompts.map(p => ({
        prompt: p.prompt,
        style: p.style,
        ratio: '1:1',
      }))
    );
    
    console.log('创建了', tasks.length, '个任务');
    
    // 等待所有任务完成
    const results = await Promise.all(
      tasks.map(t => sdk.pollTaskStatus(t.id, 'image'))
    );
    
    results.forEach((r, i) => {
      console.log(`${prompts[i].prompt}: ${r.result_url}`);
    });
    
  } catch (error) {
    console.error('批量生成失败:', error);
  }
}

// ============ 示例 5: 高级轮询控制 ============
async function exampleAdvancedPolling() {
  console.log('=== 高级轮询控制 ===');
  
  const task = await sdk.generateImage({
    prompt: '一只狗在草地上奔跑',
    style: 'realistic',
  });
  
  // 手动轮询，可以随时取消
  let isCancelled = false;
  
  // 模拟5秒后取消
  setTimeout(() => {
    isCancelled = true;
    console.log('用户取消了任务');
  }, 5000);
  
  let attempts = 0;
  const checkStatus = async (): Promise<any> => {
    if (isCancelled) {
      throw new Error('Cancelled by user');
    }
    
    const status = await sdk.getImageStatus(task.id);
    attempts++;
    
    console.log(`第${attempts}次检查: ${status.status}`);
    
    if (status.status === 'completed') {
      return status;
    } else if (status.status === 'failed') {
      throw new Error(status.error);
    } else {
      await new Promise(r => setTimeout(r, 3000));
      return checkStatus();
    }
  };
  
  try {
    const result = await checkStatus();
    console.log('完成:', result.result_url);
  } catch (error) {
    console.error('失败:', error);
  }
}

// ============ 运行示例 ============
async function runExamples() {
  // 选择要运行的示例
  const examples = [
    exampleGenerateImage,
    // exampleGenerateImageAndWait,
    // exampleGenerateVideo,
    // exampleBatchGenerate,
    // exampleAdvancedPolling,
  ];
  
  for (const example of examples) {
    await example();
    console.log('');
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runExamples().catch(console.error);
}

export { runExamples };
