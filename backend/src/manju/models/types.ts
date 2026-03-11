// 音频轨道类型
export interface AudioTrack {
  id: string;
  sceneId: string;
  lineId: string;
  type: 'narration' | 'dialogue' | 'internal';
  speaker: string;
  text: string;
  emotion?: string;
  startTime: number;
  duration: number;
  audioFile?: string;
  visualCount: number;
  visuals?: VisualAsset[];
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

// 画面资源
export interface VisualAsset {
  id: string;
  trackId: string;
  index: number;
  url: string;
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

// 时间轴
export interface Timeline {
  tracks: AudioTrack[];
  totalDuration: number;
}

// 剧本行
export interface ScriptLine {
  id: string;
  type: 'narration' | 'dialogue' | 'internal';
  speaker: string;
  text: string;
  emotion?: string;
}

// 剧本场景
export interface ScriptScene {
  id: string;
  name: string;
  description?: string;
  lines: ScriptLine[];
}

// 剧本
export interface Script {
  title: string;
  description?: string;
  scenes: ScriptScene[];
}

// Manju项目
export interface ManjuProject {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'generating' | 'rendering' | 'completed';
  script: Script;
  timeline?: Timeline;
  config: {
    ttsEngine: 'minimax' | 'baidu' | 'cosyvoice';
    visualEngine: 'dreamina' | 'sd' | 'midjourney';
    resolution: '1080p' | '4k';
  };
  createdAt: Date;
  updatedAt: Date;
}

// TTS配置
export interface TTSConfig {
  engine: 'minimax' | 'baidu' | 'cosyvoice';
  voices: Record<string, string>; // 角色 -> 音色ID
  speed?: number;
  pitch?: number;
}
