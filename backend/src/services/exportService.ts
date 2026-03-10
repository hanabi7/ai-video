import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

// 导出任务存储（生产环境应该使用 Redis 或数据库）
const exportTasks = new Map();

// 导出配置
const EXPORT_CONFIG = {
  outputDir: process.env.EXPORT_OUTPUT_DIR || './exports',
  maxConcurrentTasks: parseInt(process.env.EXPORT_MAX_CONCURRENT || '2'),
  tempDir: process.env.EXPORT_TEMP_DIR || './temp',
};

// 确保输出目录存在
async function ensureDirectories() {
  try {
    await fs.mkdir(EXPORT_CONFIG.outputDir, { recursive: true });
    await fs.mkdir(EXPORT_CONFIG.tempDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create export directories:', error);
  }
}

ensureDirectories();

// 导出请求参数
export interface ExportRequest {
  clips: {
    videoUrl: string;
    inPoint: number;
    outPoint: number;
  }[];
  audioTracks: {
    type: 'music' | 'effect';
    name: string;
    startTime: number;
    duration: number;
    volume: number;
  }[];
  outputFormat?: 'mp4' | 'mov' | 'webm';
  resolution?: '720p' | '1080p' | '4k';
  fps?: 24 | 30 | 60;
}

// 导出任务
export interface ExportTask {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  request: ExportRequest;
  resultUrl?: string;
  error?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  outputPath?: string;
}

// 分辨率映射
const RESOLUTION_MAP = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
};

// 导出视频
export async function exportVideo(request: ExportRequest): Promise<{ taskId: string; status: string }> {
  const taskId = uuidv4();
  const task: ExportTask = {
    id: taskId,
    status: 'pending',
    progress: 0,
    request,
    createdAt: Date.now(),
  };

  exportTasks.set(taskId, task);

  // 异步处理导出任务
  processExportTask(taskId).catch(error => {
    console.error(`Export task ${taskId} failed:`, error);
    const task = exportTasks.get(taskId);
    if (task) {
      task.status = 'failed';
      task.error = error.message;
      task.completedAt = Date.now();
    }
  });

  return {
    taskId,
    status: 'pending',
  };
}

// 获取导出状态
export async function getExportStatus(taskId: string): Promise<ExportTask> {
  const task = exportTasks.get(taskId);
  if (!task) {
    throw new Error('导出任务不存在');
  }
  return task;
}

// 取消导出
export async function cancelExport(taskId: string): Promise<void> {
  const task = exportTasks.get(taskId);
  if (!task) {
    throw new Error('导出任务不存在');
  }
  
  if (task.status === 'pending' || task.status === 'processing') {
    task.status = 'cancelled';
    task.completedAt = Date.now();
  }
}

// 获取导出历史
export async function getExportHistory(): Promise<ExportTask[]> {
  return Array.from(exportTasks.values())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 50); // 最多返回50条
}

// 删除导出记录
export async function deleteExport(taskId: string): Promise<void> {
  const task = exportTasks.get(taskId);
  if (!task) {
    throw new Error('导出任务不存在');
  }

  // 如果任务正在处理，先取消
  if (task.status === 'processing') {
    task.status = 'cancelled';
  }

  // 删除输出文件（如果存在）
  if (task.outputPath) {
    try {
      await fs.unlink(task.outputPath);
    } catch (error) {
      console.warn(`Failed to delete export file: ${task.outputPath}`);
    }
  }

  exportTasks.delete(taskId);
}

// 处理导出任务
async function processExportTask(taskId: string): Promise<void> {
  const task = exportTasks.get(taskId);
  if (!task) return;

  // 检查并发限制
  const activeTasks = Array.from(exportTasks.values())
    .filter(t => t.status === 'processing').length;
  
  if (activeTasks >= EXPORT_CONFIG.maxConcurrentTasks) {
    // 等待其他任务完成
    await new Promise(resolve => setTimeout(resolve, 5000));
    return processExportTask(taskId);
  }

  task.status = 'processing';
  task.startedAt = Date.now();
  task.progress = 5;

  try {
    const { clips, audioTracks, outputFormat, resolution, fps } = task.request;
    
    // 模拟处理进度
    const totalSteps = clips.length * 2 + (audioTracks.length > 0 ? 1 : 0) + 1;
    let currentStep = 0;

    // 步骤1: 下载视频片段
    for (let i = 0; i < clips.length; i++) {
      task.progress = Math.round((++currentStep / totalSteps) * 100);
      await simulateWork(1000); // 模拟下载时间
    }

    // 步骤2: 裁剪和转码
    for (let i = 0; i < clips.length; i++) {
      task.progress = Math.round((++currentStep / totalSteps) * 100);
      await simulateWork(2000); // 模拟处理时间
    }

    // 步骤3: 合并片段
    task.progress = Math.round((++currentStep / totalSteps) * 100);
    await simulateWork(3000);

    // 步骤4: 添加音频（如果有）
    if (audioTracks.length > 0) {
      task.progress = Math.round((++currentStep / totalSteps) * 100);
      await simulateWork(2000);
    }

    // 步骤5: 最终输出
    task.progress = Math.round((++currentStep / totalSteps) * 100);
    await simulateWork(1500);

    // 生成输出文件路径
    const outputFilename = `export_${taskId}.${outputFormat || 'mp4'}`;
    const outputPath = path.join(EXPORT_CONFIG.outputDir, outputFilename);
    
    // 创建虚拟的输出文件（实际项目中应该使用 FFmpeg 等工具）
    await fs.writeFile(outputPath, `Mock export file for task ${taskId}`);

    // 更新任务状态
    task.status = 'completed';
    task.progress = 100;
    task.resultUrl = `/exports/${outputFilename}`;
    task.outputPath = outputPath;
    task.completedAt = Date.now();

  } catch (error) {
    task.status = 'failed';
    task.error = (error as Error).message;
    task.completedAt = Date.now();
    throw error;
  }
}

// 模拟工作延迟
function simulateWork(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 清理旧的任务（保留最近7天的）
export async function cleanupOldTasks(): Promise<void> {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const tasksToDelete: string[] = [];

  for (const [taskId, task] of exportTasks.entries()) {
    if (task.createdAt < sevenDaysAgo && task.status !== 'processing') {
      tasksToDelete.push(taskId);
    }
  }

  for (const taskId of tasksToDelete) {
    await deleteExport(taskId);
  }

  if (tasksToDelete.length > 0) {
    console.log(`Cleaned up ${tasksToDelete.length} old export tasks`);
  }
}

// 定期清理（每天一次）
setInterval(() => {
  cleanupOldTasks().catch(console.error);
}, 24 * 60 * 60 * 1000);
