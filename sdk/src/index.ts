// AI Video Creator SDK
// 用于与后端API交互，生成图片和视频

export interface SDKConfig {
  baseURL: string;
  timeout?: number;
}

// ============ 图片生成接口 ============
export interface ImageGenerateRequest {
  prompt: string;
  negative_prompt?: string;
  ratio?: '16:9' | '9:16' | '1:1' | '4:3';
  style?: 'cinematic' | 'anime' | 'realistic' | 'cyberpunk' | 'vintage';
  reference_image?: string;
}

export interface ImageGenerateResponse {
  id: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  created_at: number;
}

// ============ 视频生成接口 ============
export interface VideoGenerateRequest {
  prompt: string;
  image_url?: string;
  duration?: number;
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  style?: 'cinematic' | 'anime' | 'realistic' | 'dreamy' | 'noir';
  platform?: 'dreamina' | 'luma' | 'keling' | 'runway';
}

export interface VideoGenerateResponse {
  id: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  duration?: number;
  created_at: number;
}

// ============ 任务状态接口 ============
export interface TaskStatusResponse {
  id: string;
  type: 'image' | 'video';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  result_url?: string;
  progress?: number;
  error?: string;
}

// ============ 事件回调类型 ============
export type TaskStatusCallback = (status: TaskStatusResponse) => void;
export type TaskCompleteCallback = (result: TaskStatusResponse) => void;
export type TaskErrorCallback = (error: Error) => void;

// ============ SDK 主类 ============
export class AIVideoSDK {
  private baseURL: string;
  private timeout: number;

  constructor(config: SDKConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, '');
    this.timeout = config.timeout || 60000;
  }

  // ============ 私有方法 ============
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Request failed');
    }
    return data.data;
  }

  // ============ 图片生成方法 ============
  
  /**
   * 生成图片
   * @param request 图片生成请求参数
   * @returns 任务信息
   */
  async generateImage(request: ImageGenerateRequest): Promise<ImageGenerateResponse> {
    return this.request<ImageGenerateResponse>('/api/images/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * 查询图片生成状态
   * @param id 任务ID
   * @returns 任务状态
   */
  async getImageStatus(id: string): Promise<TaskStatusResponse> {
    return this.request<TaskStatusResponse>(`/api/images/status/${id}`);
  }

  /**
   * 生成图片并等待完成
   * @param request 图片生成请求参数
   * @param options 轮询选项
   * @returns 最终结果
   */
  async generateImageAndWait(
    request: ImageGenerateRequest,
    options?: {
      interval?: number;
      maxAttempts?: number;
      onUpdate?: TaskStatusCallback;
    }
  ): Promise<TaskStatusResponse> {
    const result = await this.generateImage(request);
    return this.pollTaskStatus(result.id, 'image', options);
  }

  // ============ 视频生成方法 ============

  /**
   * 生成视频
   * @param request 视频生成请求参数
   * @returns 任务信息
   */
  async generateVideo(request: VideoGenerateRequest): Promise<VideoGenerateResponse> {
    return this.request<VideoGenerateResponse>('/api/videos/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * 查询视频生成状态
   * @param id 任务ID
   * @returns 任务状态
   */
  async getVideoStatus(id: string): Promise<TaskStatusResponse> {
    return this.request<TaskStatusResponse>(`/api/videos/status/${id}`);
  }

  /**
   * 生成视频并等待完成
   * @param request 视频生成请求参数
   * @param options 轮询选项
   * @returns 最终结果
   */
  async generateVideoAndWait(
    request: VideoGenerateRequest,
    options?: {
      interval?: number;
      maxAttempts?: number;
      onUpdate?: TaskStatusCallback;
    }
  ): Promise<TaskStatusResponse> {
    const result = await this.generateVideo(request);
    return this.pollTaskStatus(result.id, 'video', options);
  }

  // ============ 通用方法 ============

  /**
   * 轮询任务状态
   * @param id 任务ID
   * @param type 任务类型
   * @param options 轮询选项
   * @returns 最终状态
   */
  async pollTaskStatus(
    id: string,
    type: 'image' | 'video',
    options?: {
      interval?: number;
      maxAttempts?: number;
      onUpdate?: TaskStatusCallback;
    }
  ): Promise<TaskStatusResponse> {
    const interval = options?.interval || 3000;
    const maxAttempts = options?.maxAttempts || 120;
    const onUpdate = options?.onUpdate;

    return new Promise((resolve, reject) => {
      let attempts = 0;

      const check = async () => {
        try {
          attempts++;
          
          const status = type === 'image' 
            ? await this.getImageStatus(id)
            : await this.getVideoStatus(id);

          onUpdate?.(status);

          if (status.status === 'completed') {
            resolve(status);
          } else if (status.status === 'failed') {
            reject(new Error(status.error || 'Generation failed'));
          } else if (attempts >= maxAttempts) {
            reject(new Error('Polling timeout'));
          } else {
            setTimeout(check, interval);
          }
        } catch (error) {
          reject(error);
        }
      };

      check();
    });
  }

  /**
   * 批量生成图片
   * @param requests 请求列表
   * @returns 任务ID列表
   */
  async batchGenerateImages(requests: ImageGenerateRequest[]): Promise<ImageGenerateResponse[]> {
    return Promise.all(requests.map(req => this.generateImage(req)));
  }

  /**
   * 批量生成视频
   * @param requests 请求列表
   * @returns 任务ID列表
   */
  async batchGenerateVideos(requests: VideoGenerateRequest[]): Promise<VideoGenerateResponse[]> {
    return Promise.all(requests.map(req => this.generateVideo(req)));
  }
}

// ============ 便捷函数 ============

/**
 * 创建SDK实例
 * @param config 配置
 * @returns SDK实例
 */
export function createSDK(config: SDKConfig): AIVideoSDK {
  return new AIVideoSDK(config);
}

// ============ 默认导出 ============
export default AIVideoSDK;
