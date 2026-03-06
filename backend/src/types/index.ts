// 统一 AI 服务接口
// 所有平台（即梦、通义、可灵等）都实现这个接口

export interface ImageGenerationRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  ratio?: '16:9' | '9:16' | '1:1' | '4:3';
  style?: 'cinematic' | 'anime' | 'realistic' | 'cyberpunk' | 'vintage';
  reference_image?: string;
}

export interface ImageGenerationResponse {
  id: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  image_url?: string;
  created_at: number;
}

export interface VideoGenerationRequest {
  prompt: string;
  image_url?: string;
  duration?: number;
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  style?: 'cinematic' | 'anime' | 'realistic' | 'dreamy' | 'noir';
  platform?: 'dreamina' | 'tongyi' | 'keling' | 'luma' | 'runway';
}

export interface VideoGenerationResponse {
  id: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  video_url?: string;
  duration?: number;
  created_at: number;
}

export interface TaskStatusResponse {
  id: string;
  type: 'image' | 'video';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  result_url?: string;
  progress?: number;
  error?: string;
}

// 统一服务接口
export interface IImageGenerationService {
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
  getImageStatus(taskId: string): Promise<TaskStatusResponse>;
}

export interface IVideoGenerationService {
  generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse>;
  getVideoStatus(taskId: string): Promise<TaskStatusResponse>;
}

// API 统一响应格式
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 任务存储
export interface TaskInfo {
  id: string;
  type: 'image' | 'video';
  platform: string;
  status: string;
  result_url?: string;
  created_at: number;
  updated_at: number;
  error?: string;
}
