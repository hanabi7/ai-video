import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dreaminaService } from '../services/dreamina';
import { 
  ImageGenerationRequest, 
  VideoGenerationRequest,
  ApiResponse 
} from '../types';

const router = Router();

// 内存存储任务状态（生产环境应使用Redis）
const taskStore = new Map<string, { type: 'image' | 'video'; status: string; result?: string }>();

/**
 * POST /api/images/generate
 * 生成图片
 */
router.post('/generate', async (req, res) => {
  try {
    const request: ImageGenerationRequest = req.body;
    
    if (!request.prompt) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: prompt'
      } as ApiResponse);
    }

    const result = await dreaminaService.generateImage(request);
    
    // 存储任务状态
    taskStore.set(result.id, { type: 'image', status: result.status });
    
    // 启动轮询检查任务状态
    pollTaskStatus(result.id, 'image');

    res.json({
      success: true,
      data: result,
      message: '图片生成任务已创建'
    } as ApiResponse<typeof result>);
    
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '图片生成失败'
    } as ApiResponse);
  }
});

/**
 * GET /api/images/status/:id
 * 查询图片生成状态
 */
router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dreaminaService.getTaskStatus(id, 'image');
    
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
 * GET /api/images/list
 * 获取图片生成历史（从内存）
 */
router.get('/list', (req, res) => {
  const images = Array.from(taskStore.entries())
    .filter(([_, task]) => task.type === 'image')
    .map(([id, task]) => ({
      id,
      status: task.status,
      result_url: task.result,
    }));
  
  res.json({
    success: true,
    data: images
  } as ApiResponse<typeof images>);
});

// 轮询任务状态
async function pollTaskStatus(taskId: string, type: 'image' | 'video') {
  const maxAttempts = 60; // 最多轮询60次（约5分钟）
  let attempts = 0;
  
  const check = async () => {
    if (attempts >= maxAttempts) {
      taskStore.set(taskId, { type, status: 'failed' });
      return;
    }
    
    try {
      const status = await dreaminaService.getTaskStatus(taskId, type);
      taskStore.set(taskId, { 
        type, 
        status: status.status,
        result: status.result_url 
      });
      
      if (status.status === 'generating' || status.status === 'pending') {
        attempts++;
        setTimeout(check, 5000); // 每5秒检查一次
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
