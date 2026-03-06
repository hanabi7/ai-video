// 图片生成请求
export interface ImageGenerationRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  ratio?: '16:9' | '9:16' | '1:1' | '4:3';
  style?: 'cinematic' | 'anime' | 'realistic' | 'cyberpunk' | 'vintage';
  reference_image?: string; // base64
}

// 图片生成响应
export interface ImageGenerationResponse {
  id: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  image_url?: string;
  created_at: number;
}

// 视频生成请求
export interface VideoGenerationRequest {
  prompt: string;
  image_url?: string; // 首帧图片
  duration?: number; // 秒
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  style?: 'cinematic' | 'anime' | 'realistic' | 'dreamy' | 'noir';
  platform?: 'dreamina' | 'luma' | 'keling' | 'runway';
}

// 视频生成响应
export interface VideoGenerationResponse {
  id: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  video_url?: string;
  duration?: number;
  created_at: number;
}

// 任务状态查询响应
export interface TaskStatusResponse {
  id: string;
  type: 'image' | 'video';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  result_url?: string;
  progress?: number;
  error?: string;
}

// API 统一响应格式
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
