import { Router } from 'express';
import { dreaminaService } from '../services/dreamina';
import { 
  VideoGenerationRequest,
  ApiResponse 
} from '../types';

const router = Router();

// 共享任务存储（从images.ts导入更合适，这里简单复用）
const taskStore = new Map<string, { type: 'image' | 'video'; status: string; result?: string; duration?: number }>();

/**
 * POST /api/videos/generate
 * 生成视频
 */
router.post('/generate', async (req, res) => {
  try {
    const request: VideoGenerationRequest = req.body;
    
    if (!request.prompt) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: prompt'
      } as ApiResponse);
    }

    const result = await dreaminaService.generateVideo(request);
    
    // 存储任务状态
    taskStore.set(result.id, { 
      type: 'video', 
      status: result.status,
      duration: result.duration 
    });
    
    // 启动轮询检查任务状态
    pollTaskStatus(result.id, 'video');

    res.json({
      success: true,
      data: result,
      message: '视频生成任务已创建'
    } as ApiResponse<typeof result>);
    
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '视频生成失败'
    } as ApiResponse);
  }
});

/**
 * GET /api/videos/status/:id
 * 查询视频生成状态
 */
router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dreaminaService.getTaskStatus(id, 'video');
    
    res.json({
      success: true,
      data: result
    } as ApiResponse<typeof result>);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '查询失败'
    } as ApiResponse);
  }
});

/**
 * GET /api/videos/list
 * 获取视频生成历史
 */
router.get('/list', (req, res) => {
  const videos = Array.from(taskStore.entries())
    .filter(([_, task]) => task.type === 'video')
    .map(([id, task]) => ({
      id,
      status: task.status,
      result_url: task.result,
      duration: task.duration,
    }));
  
  res.json({
    success: true,
    data: videos
  } as ApiResponse<typeof videos>);
});

// 轮询任务状态
async function pollTaskStatus(taskId: string, type: 'image' | 'video') {
  const maxAttempts = 120; // 视频生成较慢，轮询120次（约10分钟）
  let attempts = 0;
  
  const check = async () => {
    if (attempts >= maxAttempts) {
      taskStore.set(taskId, { ...taskStore.get(taskId)!, status: 'failed' });
      return;
    }
    
    try {
      const status = await dreaminaService.getTaskStatus(taskId, type);
      const existing = taskStore.get(taskId);
      
      taskStore.set(taskId, { 
        ...existing!,
        status: status.status,
        result: status.result_url 
      });
      
      if (status.status === 'generating' || status.status === 'pending') {
        attempts++;
        setTimeout(check, 5000);
      }
    } catch (error) {
      console.error('Poll task status error:', error);
      attempts++;
      setTimeout(check, 5000);
    }
  };
  
  check();
}

export default router;
export { taskStore };
