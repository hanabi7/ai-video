import { ManjuProject, Script, Timeline, AudioTrack } from '../models/types';

export class ManjuProjectService {
  // 创建项目
  async create(data: Partial<ManjuProject>): Promise<ManjuProject> {
    const project: ManjuProject = {
      id: generateId(),
      name: data.name || '未命名项目',
      description: data.description,
      status: 'draft',
      script: data.script as Script,
      config: data.config || {
        ttsEngine: 'minimax',
        visualEngine: 'dreamina',
        resolution: '1080p'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 保存到数据库
    await this.saveToDB(project);
    return project;
  }

  // 查找项目
  async findById(id: string): Promise<ManjuProject> {
    // 从数据库查询
    return this.getFromDB(id);
  }

  // 更新项目
  async update(id: string, data: Partial<ManjuProject>): Promise<ManjuProject> {
    const project = await this.findById(id);
    Object.assign(project, data, { updatedAt: new Date() });
    await this.saveToDB(project);
    return project;
  }

  // 从剧本生成时间轴
  async generateTimeline(projectId: string): Promise<Timeline> {
    const project = await this.findById(projectId);
    const { script } = project;
    
    const tracks: AudioTrack[] = [];
    let currentTime = 0;
    
    for (const scene of script.scenes) {
      for (const line of scene.lines) {
        // 估算时长
        const duration = this.estimateDuration(line.text);
        
        // 计算画面数量
        const visualCount = this.calculateVisualCount(duration, line.type);
        
        const track: AudioTrack = {
          id: generateId(),
          sceneId: scene.id,
          lineId: line.id,
          type: line.type,
          speaker: line.speaker,
          text: line.text,
          emotion: line.emotion,
          startTime: currentTime,
          duration,
          visualCount,
          status: 'pending'
        };
        
        tracks.push(track);
        currentTime += duration;
      }
      
      // 场景间添加1秒缓冲
      currentTime += 1.0;
    }
    
    const timeline: Timeline = { tracks, totalDuration: currentTime };
    
    // 更新项目
    project.timeline = timeline;
    await this.saveToDB(project);
    
    return timeline;
  }

  // 估算时长
  private estimateDuration(text: string): number {
    const chineseChars = text.replace(/[^\u4e00-\u9fa5]/g, '').length;
    const otherChars = text.length - chineseChars;
    return Math.max(1.0, chineseChars * 0.3 + otherChars * 0.1 + 0.5);
  }

  // 计算画面数量
  private calculateVisualCount(duration: number, type: string): number {
    const strategy: Record<string, { base: number; max: number }> = {
      narration: { base: 6, max: 3 },
      dialogue: { base: 4, max: 2 },
      internal: { base: 4, max: 2 }
    };
    
    const { base, max } = strategy[type] || strategy.dialogue;
    return Math.min(Math.ceil(duration / base), max);
  }

  // 数据库操作（占位实现）
  private async saveToDB(project: ManjuProject): Promise<void> {
    // TODO: 实现数据库保存
    console.log('保存项目:', project.id);
  }

  private async getFromDB(id: string): Promise<ManjuProject> {
    // TODO: 实现数据库查询
    throw new Error('Not implemented');
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
