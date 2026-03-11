import { VisualService } from './VisualService';
import { Queue } from 'bullmq';

export class VisualService {
  private queue: Queue;

  constructor() {
    this.queue = new Queue('visual-generation', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });
  }

  // 批量生成画面
  async generateBatch(projectId: string, trackIds: string[]) {
    const jobs = [];
    
    for (const trackId of trackIds) {
      const job = await this.queue.add('generate-visual', {
        projectId,
        trackId
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 }
      });
      
      jobs.push(job);
    }
    
    return jobs;
  }

  // 生成单张画面（供worker调用）
  async generateImage(prompt: string, engine: string): Promise<Buffer> {
    switch (engine) {
      case 'dreamina':
        return this.generateWithDreamina(prompt);
      case 'sd':
        return this.generateWithSD(prompt);
      default:
        throw new Error(`不支持的画图引擎: ${engine}`);
    }
  }

  // Dreamina API
  private async generateWithDreamina(prompt: string): Promise<Buffer> {
    const apiUrl = process.env.DREAMINA_API_URL;
    if (!apiUrl) throw new Error('DREAMINA_API_URL not set');
    
    // 调用API
    return Buffer.alloc(0); // 占位
  }

  // Stable Diffusion
  private async generateWithSD(prompt: string): Promise<Buffer> {
    const apiUrl = process.env.SD_URL || 'http://localhost:7860';
    
    // 调用API
    return Buffer.alloc(0); // 占位
  }

  // 生成AI画图提示词
  generatePrompt(track: any): string {
    const { type, speaker, text } = track;
    
    const basePrompt = text.substring(0, 100);
    
    switch (type) {
      case 'narration':
        return `Cinematic establishing shot, ${basePrompt}, post-apocalyptic wasteland, dramatic lighting, 8k quality`;
      case 'dialogue':
        const characterDesc = this.getCharacterDesc(speaker);
        return `${characterDesc}, portrait shot, ${basePrompt}, expressive face, cinematic lighting`;
      default:
        return `Cinematic shot, ${basePrompt}, high quality`;
    }
  }

  private getCharacterDesc(speaker: string): string {
    const descs: Record<string, string> = {
      '林默': 'young man 23 years old lean build trench coat underground bunker',
      '艾达': 'holographic AI girl blue-purple hair translucent body cyberpunk',
      '陈昊': 'glasses programmer type slightly chubby casual clothes',
      '唐甜': 'cute girl 22 years old long hair pink hoodie energetic',
      '刘铁': 'muscular man 32 years old buzz cut tank top confident'
    };
    return descs[speaker] || 'character portrait';
  }
}
