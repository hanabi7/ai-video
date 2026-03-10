import { Router } from 'express';
import { unifiedAIService } from '../services/factory';
import { TaskInfo } from '../types';

const router = Router();

// 共享任务存储（从images.ts导入更合适，这里简单复用）
const taskStore = new Map<string, TaskInfo>();

/**
 * POST /api/videos/generate
 * 生成视频
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, duration, aspect_ratio, style, platform = 'dreamina', image_url } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: prompt'
      });
    }

    const result = await unifiedAIService.generateVideo({
      prompt,
      duration,
      aspect_ratio,
      style,
      platform,
      image_url
    });
    
    // 存储任务状态
    taskStore.set(result.id, {
      id: result.id,
      type: 'video',
      platform,
      status: result.status,
      created_at: result.created_at,
      updated_at: Date.now(),
    });
    
    // 启动轮询检查任务状态
    pollTaskStatus(result.id, 'video', platform);

    res.json({
      success: true,
      data: result,
      message: '视频生成任务已创建'
    });
    
  } catch (error) {
    console.error('[Videos] Generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '视频生成失败'
    });
  }
});

/**
 * GET /api/videos/status/:id
 * 查询视频生成状态
 */
router.get('/status/:id', async (req, res) => {
  try {
    const task = taskStore.get(req.params.id);
    const platform = task?.platform || 'dreamina';
    
    const result = await unifiedAIService.getVideoStatus(req.params.id, platform);
    
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
 * GET /api/videos/list
 * 获取视频生成历史
 */
router.get('/list', (req, res) => {
  const videos = Array.from(taskStore.values())
    .filter(task => task.type === 'video')
    .sort((a, b) => b.created_at - a.created_at);
  
  res.json({
    success: true,
    data: videos
  });
});

/**
 * GET /api/videos/platforms
 * 获取支持的视频生成平台
 */
router.get('/platforms', (req, res) => {
  const platforms = unifiedAIService.getSupportedPlatforms().video;
  res.json({
    success: true,
    data: platforms
  });
});

// 轮询任务状态
async function pollTaskStatus(taskId: string, type: 'image' | 'video', platform: string) {
  const maxAttempts = type === 'video' ? 120 : 60;
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
      const status = type === 'video'
        ? await unifiedAIService.getVideoStatus(taskId, platform)
        : await unifiedAIService.getImageStatus(taskId, platform);
      
      const task = taskStore.get(taskId);
      if (task) {
        task.status = status.status;
        task.result_url = status.result_url;
        task.updated_at = Date.now();
        if (status.error) task.error = status.error;
      }
      
      if (status.status === 'generating' || status.status === 'pending') {
        attempts++;
        setTimeout(check, 5000);
      }
    } catch (error) {
      console.error(`[Poll] Task ${taskId} error:`, error);
      attempts++;
      setTimeout(check, 5000);
    }
  };
  
  check();
}

// 导出任务存储
const exportTaskStore = new Map<string, any>();

/**
 * POST /api/videos/export
 * 导出视频（合成片段）
 */
router.post('/export', async (req, res) => {
  try {
    const { clips, audioTracks, format = 'mp4', resolution = '1080p' } = req.body;
    
    if (!clips || !Array.isArray(clips) || clips.length === 0) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: clips'
      });
    }

    const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 创建导出任务
    const exportTask = {
      id: exportId,
      status: 'processing',
      clips: clips.length,
      duration: clips.reduce((sum, c) => sum + (c.trimEnd - c.trimStart), 0),
      created_at: Date.now(),
      format,
      resolution,
      download_url: null,
      progress: 0,
    };
    
    exportTaskStore.set(exportId, exportTask);
    
    // 模拟导出处理（实际项目中这里应该调用FFmpeg等工具）
    simulateExportProcessing(exportId, clips, audioTracks);

    res.json({
      success: true,
      data: {
        id: exportId,
        status: 'processing',
        message: '视频导出任务已创建',
        estimated_time: clips.length * 5 + '秒',
      }
    });
    
  } catch (error) {
    console.error('[Videos] Export error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '视频导出失败'
    });
  }
});

/**
 * GET /api/videos/export/:id/status
 * 查询导出任务状态
 */
router.get('/export/:id/status', (req, res) => {
  const task = exportTaskStore.get(req.params.id);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      error: '导出任务不存在'
    });
  }
  
  res.json({
    success: true,
    data: task
  });
});

/**
 * GET /api/videos/export/:id/download
 * 下载导出的视频
 */
router.get('/export/:id/download', (req, res) => {
  const task = exportTaskStore.get(req.params.id);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      error: '导出任务不存在'
    });
  }
  
  if (task.status !== 'completed') {
    return res.status(400).json({
      success: false,
      error: '视频尚未导出完成'
    });
  }
  
  // 返回下载链接
  res.json({
    success: true,
    data: {
      download_url: task.download_url,
      filename: task.filename,
    }
  });
});

// 模拟导出处理
function simulateExportProcessing(exportId: string, clips: any[], audioTracks: any[]) {
  const task = exportTaskStore.get(exportId);
  if (!task) return;
  
  let progress = 0;
  const totalSteps = clips.length + (audioTracks?.length || 0) + 1;
  
  const updateProgress = () => {
    progress++;
    task.progress = Math.round((progress / totalSteps) * 100);
    
    if (progress >= totalSteps) {
      task.status = 'completed';
      task.progress = 100;
      task.completed_at = Date.now();
      // 模拟下载链接
      task.download_url = `/downloads/${exportId}.mp4`;
      task.filename = `exported_video_${exportId}.mp4`;
      console.log(`[Export] Task ${exportId} completed`);
    } else {
      setTimeout(updateProgress, 1000);
    }
  };
  
  // 开始处理
  setTimeout(updateProgress, 500);
}

export default router;
export { taskStore };
