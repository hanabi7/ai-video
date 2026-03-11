import { exec } from 'child_process';
import { promisify } from 'util';
import { Queue } from 'bullmq';

const execAsync = promisify(exec);

export class EditorService {
  private queue: Queue;

  constructor() {
    this.queue = new Queue('video-render', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });
  }

  // 提交渲染任务
  async render(projectId: string) {
    const job = await this.queue.add('render-video', { projectId }, {
      attempts: 2,
      backoff: { type: 'fixed', delay: 10000 }
    });
    
    return job;
  }

  // 执行渲染（供worker调用）
  async executeRender(projectId: string): Promise<string> {
    // 获取项目数据
    const project = await this.getProject(projectId);
    const { timeline, config } = project;
    
    // 生成FFmpeg命令
    const ffmpegCmd = this.buildFFmpegCommand(timeline, config);
    
    // 执行渲染
    const outputPath = `outputs/${projectId}/final.mp4`;
    await execAsync(ffmpegCmd);
    
    return outputPath;
  }

  // 构建FFmpeg命令
  private buildFFmpegCommand(timeline: any, config: any): string {
    const inputs: string[] = [];
    const filters: string[] = [];
    let inputIndex = 0;
    
    for (const track of timeline.tracks) {
      const { duration, visuals, audioFile } = track;
      
      if (visuals && visuals.length > 0) {
        // 为每个画面创建输入
        const segmentDuration = duration / visuals.length;
        
        for (const visual of visuals) {
          inputs.push(`-loop 1 -t ${segmentDuration} -i "${visual.url}"`);
          
          // 缩放滤镜
          filters.push(`[${inputIndex}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black[s${inputIndex}]`);
          
          inputIndex++;
        }
      }
      
      // 音频输入
      if (audioFile) {
        inputs.push(`-i "${audioFile}"`);
      }
    }
    
    // 构建concat滤镜
    const streamLabels = [];
    for (let i = 0; i < inputIndex; i++) {
      streamLabels.push(`[s${i}]`);
    }
    
    const concatFilter = `${streamLabels.join('')}concat=n=${inputIndex}:v=1:a=0[outv]`;
    filters.push(concatFilter);
    
    // 组装命令
    return `
      ffmpeg -y 
      ${inputs.join(' ')}
      -filter_complex "${filters.join(';')}"
      -map "[outv]"
      -c:v libx264 -preset medium -crf 23 -r 24
      -pix_fmt yuv420p
      "outputs/final.mp4"
    `.replace(/\s+/g, ' ').trim();
  }

  // 获取状态
  async getStatus(projectId: string) {
    // 查询队列状态
    return { status: 'processing', progress: 50 };
  }

  private async getProject(projectId: string) {
    // 从数据库获取
    return { timeline: { tracks: [] }, config: {} };
  }
}
