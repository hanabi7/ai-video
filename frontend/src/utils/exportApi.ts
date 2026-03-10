// 视频导出 API

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// 导出请求参数
export interface ExportClip {
  videoUrl: string;
  inPoint: number;
  outPoint: number;
}

export interface ExportAudioTrack {
  type: 'music' | 'effect';
  name: string;
  startTime: number;
  duration: number;
  volume: number;
}

export interface ExportRequest {
  clips: ExportClip[];
  audioTracks: ExportAudioTrack[];
  outputFormat?: 'mp4' | 'mov' | 'webm';
  resolution?: '720p' | '1080p' | '4k';
  fps?: 24 | 30 | 60;
}

// 导出响应
export interface ExportResponse {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedTime?: number;
}

// 导出状态响应
export interface ExportStatusResponse {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

// 导出视频
export async function exportVideo(request: ExportRequest): Promise<ExportResponse> {
  const response = await fetch(`${API_BASE_URL}/editor/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '导出请求失败' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || '导出请求失败');
  }
  
  return data.data;
}

// 查询导出状态
export async function getExportStatus(taskId: string): Promise<ExportStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/editor/export/${taskId}/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '查询状态失败' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || '查询状态失败');
  }
  
  return data.data;
}

// 取消导出任务
export async function cancelExport(taskId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/editor/export/${taskId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '取消导出失败' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
}

// 轮询导出状态直到完成
export async function pollExportStatus(
  taskId: string,
  onUpdate?: (status: ExportStatusResponse) => void,
  interval = 2000,
  maxAttempts = 300
): Promise<ExportStatusResponse> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const check = async () => {
      try {
        attempts++;
        const status = await getExportStatus(taskId);

        onUpdate?.(status);

        if (status.status === 'completed') {
          resolve(status);
        } else if (status.status === 'failed') {
          reject(new Error(status.error || '导出失败'));
        } else if (attempts >= maxAttempts) {
          reject(new Error('导出超时'));
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

// 获取导出历史
export async function getExportHistory(): Promise<ExportStatusResponse[]> {
  const response = await fetch(`${API_BASE_URL}/editor/exports`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '获取导出历史失败' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || '获取导出历史失败');
  }
  
  return data.data;
}

// 删除导出记录
export async function deleteExport(taskId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/editor/export/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '删除导出记录失败' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
}
