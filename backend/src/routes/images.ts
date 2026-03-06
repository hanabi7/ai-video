import { Router } from 'express';
import { unifiedAIService } from '../services/factory';
import { TaskInfo } from '../types';

const router = Router();

// 内存存储任务状态（生产环境应使用Redis）
const taskStore = new Map<string, TaskInfo>();

/**
 * POST /api/images/generate
 * 生成图片
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, style, ratio, platform = 'dreamina', ...rest } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: prompt'
      });
    }

    const result = await unifiedAIService.generateImage({
      prompt,
      style,
      ratio,
      platform,
      ...rest
    });
    
    // 存储任务状态
    taskStore.set(result.id, {
      id: result.id,
      type: 'image',
      platform,
      status: result.status,
      created_at: result.created_at,
      updated_at: Date.now(),
    });
    
    // 启动轮询检查任务状态
    pollTaskStatus(result.id, 'image', platform);

    res.json({
      success: true,
      data: result,
      message: '图片生成任务已创建'
    });
    
  } catch (error) {
    console.error('[Images] Generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '图片生成失败'
    });
  }
});

/**
 * GET /api/images/status/:id
 * 查询图片生成状态
 */
router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.query;
    const task = taskStore.get(req.params.id);
    const platform = task?.platform || 'dreamina';
    
    const result = await unifiedAIService.getImageStatus(req.params.id, platform);
    
    // 更新存储的状态
    if (task) {
      task.status = result.status;
      task.result_url = result.result_url;
      task.updated_at = Date.now();
      if (result.error) task.error = result.error;
    }
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '查询失败'
    });
  }
});

/**
 * GET /api/images/list
 * 获取图片生成历史
 */
router.get('/list', (req, res) => {
  const images = Array.from(taskStore.values())
    .filter(task => task.type === 'image')
    .sort((a, b) => b.created_at - a.created_at);
  
  res.json({
    success: true,
    data: images
  });
});

/**
 * GET /api/images/platforms
 * 获取支持的图片生成平台
 */
router.get('/platforms', (req, res) => {
  const platforms = unifiedAIService.getSupportedPlatforms().image;
  res.json({
    success: true,
    data: platforms
  });
});

// 轮询任务状态
async function pollTaskStatus(taskId: string, type: 'image' | 'video', platform: string) {
  const maxAttempts = type === 'image' ? 60 : 120; // 图片最多60次，视频120次
  let attempts = 0;
  
  const check = async () => {
    if (attempts >= maxAttempts) {
      const task = taskStore.get(taskId);
      if (task) {
        task.status = 'failed';
        task.error = '轮询超时';
        task.updated_at = Date.now();
      }
      return;
    }
    
    try {
      const status = type === 'image'
        ? await unifiedAIService.getImageStatus(taskId, platform)
        : await unifiedAIService.getVideoStatus(taskId, platform);
      
      const task = taskStore.get(taskId);
      if (task) {
        task.status = status.status;
        task.result_url = status.result_url;
        task.updated_at = Date.now();
        if (status.error) task.error = status.error;
      }
      
      if (status.status === 'generating' || status.status === 'pending') {
        attempts++;
        setTimeout(check, type === 'image' ? 3000 : 5000);
      }
    } catch (error) {
      console.error(`[Poll] Task ${taskId} error:`, error);
      attempts++;
      setTimeout(check, 5000);
    }
  };
  
  check();
}

export default router;
