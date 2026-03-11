import axios from 'axios';
import { Queue } from 'bullmq';
import { AudioTrack } from '../models/types';

export class TTSService {
  private queue: Queue;

  constructor() {
    this.queue = new Queue('tts-generation', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });
  }

  // 批量生成TTS
  async generateBatch(projectId: string, trackIds: string[]) {
    const jobs = [];
    
    for (const trackId of trackIds) {
      const job = await this.queue.add('generate-tts', {
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

  // 生成单段音频（供worker调用）
  async generateAudio(text: string, speaker: string, engine: string): Promise<{ buffer: Buffer; duration: number }> {
    switch (engine) {
      case 'minimax':
        return this.generateWithMinimax(text, speaker);
      case 'baidu':
        return this.generateWithBaidu(text, speaker);
      case 'cosyvoice':
        return this.generateWithCosyVoice(text, speaker);
      default:
        throw new Error(`不支持的TTS引擎: ${engine}`);
    }
  }

  // MiniMax TTS
  private async generateWithMinimax(text: string, speaker: string): Promise<{ buffer: Buffer; duration: number }> {
    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) throw new Error('MINIMAX_API_KEY not set');
    
    const voiceMap: Record<string, string> = {
      '林默': 'male-qn-qingse',
      '艾达': 'female-shaonv',
      '旁白': 'male-shang',
      '陈昊': 'male-qn-qingse',
      '唐甜': 'female-yujie',
      '刘铁': 'male-qn-jingying'
    };
    
    const response = await axios.post(
      'https://api.minimax.chat/v1/t2a_v2',
      {
        model: 'speech-01-turbo',
        text,
        voice_id: voiceMap[speaker] || 'male-qn-qingse',
        speed: 1.0,
        vol: 1.0,
        pitch: 0
      },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        responseType: 'arraybuffer'
      }
    );
    
    const duration = this.estimateDuration(text);
    return { buffer: Buffer.from(response.data), duration };
  }

  // 百度 TTS
  private async generateWithBaidu(text: string, speaker: string): Promise<{ buffer: Buffer; duration: number }> {
    // 百度TTS实现
    const duration = this.estimateDuration(text);
    return { buffer: Buffer.alloc(0), duration }; // 占位
  }

  // CosyVoice TTS
  private async generateWithCosyVoice(text: string, speaker: string): Promise<{ buffer: Buffer; duration: number }> {
    const url = process.env.COSYVOICE_URL || 'http://localhost:5000';
    const response = await axios.post(`${url}/inference`, { text, speaker }, { responseType: 'arraybuffer' });
    const duration = this.estimateDuration(text);
    return { buffer: Buffer.from(response.data), duration };
  }

  // 估算音频时长（中文约0.3秒/字）
  private estimateDuration(text: string): number {
    const chineseChars = text.replace(/[^\u4e00-\u9fa5]/g, '').length;
    const otherChars = text.length - chineseChars;
    return Math.max(1.0, chineseChars * 0.3 + otherChars * 0.1 + 0.5);
  }

  // 获取状态
  async getStatus(projectId: string, trackId: string) {
    // 查询数据库返回状态
    return { status: 'completed', progress: 100 };
  }
}
