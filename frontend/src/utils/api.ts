// API 客户端配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// 通用请求函数
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// 图片生成请求接口
export interface ImageGenerateRequest {
  prompt: string;
  negative_prompt?: string;
  ratio?: '16:9' | '9:16' | '1:1' | '4:3';
  style?: 'cinematic' | 'anime' | 'realistic' | 'cyberpunk' | 'vintage';
  reference_image?: string;
}

// 图片生成响应
export interface ImageGenerateResponse {
  id: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  created_at: number;
}

// 视频生成请求接口
export interface VideoGenerateRequest {
  prompt: string;
  image_url?: string;
  duration?: number;
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  style?: 'cinematic' | 'anime' | 'realistic' | 'dreamy' | 'noir';
  platform?: 'dreamina' | 'luma' | 'keling' | 'runway';
}

// 视频生成响应
export interface VideoGenerateResponse {
  id: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  duration?: number;
  created_at: number;
}

// 任务状态响应
export interface TaskStatusResponse {
  id: string;
  type: 'image' | 'video';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  result_url?: string;
  progress?: number;
  error?: string;
}

// 图片生成 API
export async function generateImage(request: ImageGenerateRequest): Promise<ImageGenerateResponse> {
  const data = await fetchAPI<{ success: boolean; data: ImageGenerateResponse }>('/images/generate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return data.data;
}

// 查询图片生成状态
export async function getImageStatus(id: string): Promise<TaskStatusResponse> {
  const data = await fetchAPI<{ success: boolean; data: TaskStatusResponse }>(`/images/status/${id}`);
  return data.data;
}

// 视频生成 API
export async function generateVideo(request: VideoGenerateRequest): Promise<VideoGenerateResponse> {
  const data = await fetchAPI<{ success: boolean; data: VideoGenerateResponse }>('/videos/generate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return data.data;
}

// 查询视频生成状态
export async function getVideoStatus(id: string): Promise<TaskStatusResponse> {
  const data = await fetchAPI<{ success: boolean; data: TaskStatusResponse }>(`/videos/status/${id}`);
  return data.data;
}

// 轮询任务状态直到完成
export async function pollTaskStatus(
  id: string,
  type: 'image' | 'video',
  onUpdate?: (status: TaskStatusResponse) => void,
  interval = 3000,
  maxAttempts = 100
): Promise<TaskStatusResponse> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const check = async () => {
      try {
        attempts++;
        const status = type === 'image' ? await getImageStatus(id) : await getVideoStatus(id);
        
        onUpdate?.(status);
        
        if (status.status === 'completed') {
          resolve(status);
        } else if (status.status === 'failed') {
          reject(new Error(status.error || '生成失败'));
        } else if (attempts >= maxAttempts) {
          reject(new Error('生成超时'));
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
