import axios, { AxiosInstance } from 'axios';
import { 
  ImageGenerationRequest, 
  ImageGenerationResponse,
  VideoGenerationRequest,
  VideoGenerationResponse,
  TaskStatusResponse 
} from '../types';

// 即梦 API 服务类
export class DreaminaService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.DREAMINA_API_KEY || '';
    const baseURL = process.env.DREAMINA_API_BASE_URL || 'https://api.dreamina.com/v1';
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });

    // 添加响应拦截器处理错误
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Dreamina API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  // 生成图片
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      // 尺寸映射
      const sizeMap: Record<string, { width: number; height: number }> = {
        '16:9': { width: 1024, height: 576 },
        '9:16': { width: 576, height: 1024 },
        '1:1': { width: 1024, height: 1024 },
        '4:3': { width: 1024, height: 768 },
      };

      const size = request.ratio ? sizeMap[request.ratio] : {
        width: request.width || 1024,
        height: request.height || 1024
      };

      // 风格映射到即梦模型
      const styleModelMap: Record<string, string> = {
        'cinematic': 'dreamina-v2.0-cinematic',
        'anime': 'dreamina-v2.0-anime',
        'realistic': 'dreamina-v2.0-realistic',
        'cyberpunk': 'dreamina-v2.0-cyberpunk',
        'vintage': 'dreamina-v2.0-vintage',
      };

      const payload: Record<string, unknown> = {
        prompt: request.prompt,
        model: styleModelMap[request.style || 'realistic'] || 'dreamina-v2.0',
        width: size.width,
        height: size.height,
        n: 1,
      };

      if (request.negative_prompt) {
        payload.negative_prompt = request.negative_prompt;
      }

      if (request.reference_image) {
        payload.image = request.reference_image;
      }

      console.log('Calling Dreamina Image API:', payload);

      // 调用即梦图片生成API
      const response = await this.client.post('/images/generations', payload);
      
      return {
        id: response.data.id || response.data.data?.[0]?.id || `img_${Date.now()}`,
        status: 'generating',
        created_at: Date.now(),
      };
    } catch (error) {
      console.error('Image generation failed:', error);
      throw new Error('图片生成失败，请检查API配置');
    }
  }

  // 生成视频
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      const payload: Record<string, unknown> = {
        prompt: request.prompt,
        model: 'dreamina-video-v1.0',
        duration: Math.min(request.duration || 5, 10), // 最大10秒
        aspect_ratio: request.aspect_ratio || '16:9',
      };

      if (request.image_url) {
        payload.image_url = request.image_url;
      }

      console.log('Calling Dreamina Video API:', payload);

      // 调用即梦视频生成API
      const response = await this.client.post('/videos/generations', payload);
      
      return {
        id: response.data.id || response.data.data?.id || `vid_${Date.now()}`,
        status: 'generating',
        duration: request.duration || 5,
        created_at: Date.now(),
      };
    } catch (error) {
      console.error('Video generation failed:', error);
      throw new Error('视频生成失败，请检查API配置');
    }
  }

  // 查询任务状态
  async getTaskStatus(taskId: string, type: 'image' | 'video'): Promise<TaskStatusResponse> {
    try {
      const endpoint = type === 'image' 
        ? `/images/status/${taskId}` 
        : `/videos/status/${taskId}`;
      
      const response = await this.client.get(endpoint);
      const data = response.data.data || response.data;

      return {
        id: taskId,
        type,
        status: this.mapStatus(data.status),
        result_url: data.image_url || data.video_url,
        progress: data.progress,
        error: data.error_message,
      };
    } catch (error) {
      console.error('Get task status failed:', error);
      throw new Error('查询任务状态失败');
    }
  }

  // 状态映射
  private mapStatus(status: string): 'pending' | 'generating' | 'completed' | 'failed' {
    const statusMap: Record<string, 'pending' | 'generating' | 'completed' | 'failed'> = {
      'pending': 'pending',
      'queued': 'pending',
      'processing': 'generating',
      'generating': 'generating',
      'completed': 'completed',
      'success': 'completed',
      'failed': 'failed',
      'error': 'failed',
    };
    return statusMap[status] || 'pending';
  }
}

// 导出单例
export const dreaminaService = new DreaminaService();
