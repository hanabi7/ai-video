import { 
  IImageGenerationService,
  IVideoGenerationService,
  ImageGenerationRequest, 
  ImageGenerationResponse,
  VideoGenerationRequest,
  VideoGenerationResponse,
  TaskStatusResponse 
} from '../types';

/**
 * 通义万相服务 - 待实现
 * 
 * TODO: 明天接入通义 API 后实现以下方法：
 * - generateImage: 调用通义图片生成接口
 * - getImageStatus: 查询通义图片任务状态
 * - generateVideo: 调用通义视频生成接口  
 * - getVideoStatus: 查询通义视频任务状态
 */
export class TongyiService implements IImageGenerationService, IVideoGenerationService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.TONGYI_API_KEY || '';
    this.baseURL = process.env.TONGYI_API_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1';
    
    if (!this.apiKey) {
      console.warn('[Tongyi] API Key not configured');
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    // TODO: 实现通义图片生成
    console.log('[Tongyi] Generate Image (TODO):', request);
    throw new Error('通义图片生成接口待实现，请明天配置 API 后使用');
  }

  async getImageStatus(taskId: string): Promise<TaskStatusResponse> {
    // TODO: 实现通义图片状态查询
    console.log('[Tongyi] Get Image Status (TODO):', taskId);
    throw new Error('通义图片状态查询接口待实现');
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    // TODO: 实现通义视频生成
    console.log('[Tongyi] Generate Video (TODO):', request);
    throw new Error('通义视频生成接口待实现，请明天配置 API 后使用');
  }

  async getVideoStatus(taskId: string): Promise<TaskStatusResponse> {
    // TODO: 实现通义视频状态查询
    console.log('[Tongyi] Get Video Status (TODO):', taskId);
    throw new Error('通义视频状态查询接口待实现');
  }
}

// 导出单例
export const tongyiService = new TongyiService();
