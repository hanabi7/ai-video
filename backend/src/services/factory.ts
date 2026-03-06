import { DreaminaService } from './dreamina';
import { 
  IImageGenerationService, 
  IVideoGenerationService,
  ImageGenerationRequest,
  VideoGenerationRequest,
  ImageGenerationResponse,
  VideoGenerationResponse,
  TaskStatusResponse
} from '../types';

// 支持的平台列表
export type Platform = 'dreamina' | 'tongyi' | 'keling' | 'luma' | 'runway';

// 服务工厂 - 统一管理所有 AI 平台
class ServiceFactory {
  private imageServices: Map<Platform, IImageGenerationService> = new Map();
  private videoServices: Map<Platform, IVideoGenerationService> = new Map();

  constructor() {
    // 注册即梦服务
    const dreamina = new DreaminaService();
    this.imageServices.set('dreamina', dreamina);
    this.videoServices.set('dreamina', dreamina);

    // TODO: 明天在这里注册通义服务
    // const tongyi = new TongyiService();
    // this.imageServices.set('tongyi', tongyi);
    // this.videoServices.set('tongyi', tongyi);
  }

  // 获取图片生成服务
  getImageService(platform?: Platform): IImageGenerationService {
    const p = platform || 'dreamina';
    const service = this.imageServices.get(p);
    if (!service) {
      throw new Error(`不支持的图片生成平台: ${p}`);
    }
    return service;
  }

  // 获取视频生成服务
  getVideoService(platform?: Platform): IVideoGenerationService {
    const p = platform || 'dreamina';
    const service = this.videoServices.get(p);
    if (!service) {
      throw new Error(`不支持的视频生成平台: ${p}`);
    }
    return service;
  }

  // 获取所有支持的平台
  getSupportedPlatforms(): { image: Platform[]; video: Platform[] } {
    return {
      image: Array.from(this.imageServices.keys()),
      video: Array.from(this.videoServices.keys()),
    };
  }
}

// 导出单例
export const serviceFactory = new ServiceFactory();

// 统一服务类 - 对外暴露的接口
export class UnifiedAIService {
  // 生成图片
  async generateImage(request: ImageGenerationRequest & { platform?: Platform }): Promise<ImageGenerationResponse> {
    const service = serviceFactory.getImageService(request.platform);
    return service.generateImage(request);
  }

  // 生成视频
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const service = serviceFactory.getVideoService(request.platform);
    return service.generateVideo(request);
  }

  // 查询图片状态
  async getImageStatus(taskId: string, platform?: Platform): Promise<TaskStatusResponse> {
    const service = serviceFactory.getImageService(platform);
    return service.getImageStatus(taskId);
  }

  // 查询视频状态
  async getVideoStatus(taskId: string, platform?: Platform): Promise<TaskStatusResponse> {
    const service = serviceFactory.getVideoService(platform);
    return service.getVideoStatus(taskId);
  }

  // 获取支持的平台
  getSupportedPlatforms() {
    return serviceFactory.getSupportedPlatforms();
  }
}

export const unifiedAIService = new UnifiedAIService();
