import { create } from 'zustand';

// 剧本创作消息类型
export interface ScriptMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  type?: 'text' | 'scene' | 'character' | 'dialogue';
}

// 图片创作任务
export interface ImageTask {
  id: string;
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  resultUrl?: string;
  createdAt: number;
}

// 视频创作任务
export interface VideoTask {
  id: string;
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  resultUrl?: string;
  duration?: number;
  createdAt: number;
}

// 剪辑片段
export interface Clip {
  id: string;
  videoId: string;
  videoUrl: string;
  startTime: number;
  endTime: number;
  duration: number;
  thumbnail?: string;
}

// 音频轨道
export interface AudioTrack {
  id: string;
  type: 'music' | 'effect';
  name: string;
  startTime: number;
  duration: number;
  volume: number;
}

// 剧本项目
export interface ScriptProject {
  id: string;
  title: string;
  genre: string;
  synopsis: string;
  characters: Character[];
  scenes: Scene[];
  messages: ScriptMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  appearance: string;
}

export interface Scene {
  id: string;
  sceneNumber: number;
  location: string;
  time: string;
  description: string;
  dialogue: Dialogue[];
}

export interface Dialogue {
  characterId: string;
  content: string;
  emotion?: string;
}

interface CreatorState {
  // 当前项目
  currentProject: ScriptProject | null;
  
  // 剧本创作
  scriptMessages: ScriptMessage[];
  isScriptLoading: boolean;
  
  // 图片创作
  imageTasks: ImageTask[];
  isImageLoading: boolean;
  
  // 视频创作
  videoTasks: VideoTask[];
  isVideoLoading: boolean;
  
  // 视频剪辑
  clips: Clip[];
  audioTracks: AudioTrack[];
  currentTime: number;
  isPlaying: boolean;
  totalDuration: number;
  
  // Actions
  setCurrentProject: (project: ScriptProject | null) => void;
  addScriptMessage: (message: ScriptMessage) => void;
  setScriptLoading: (loading: boolean) => void;
  addImageTask: (task: ImageTask) => void;
  updateImageTask: (id: string, updates: Partial<ImageTask>) => void;
  addVideoTask: (task: VideoTask) => void;
  updateVideoTask: (id: string, updates: Partial<VideoTask>) => void;
  
  // 剪辑相关
  addClip: (clip: Clip) => void;
  removeClip: (id: string) => void;
  updateClip: (id: string, updates: Partial<Clip>) => void;
  addAudioTrack: (track: AudioTrack) => void;
  removeAudioTrack: (id: string) => void;
  updateAudioTrack: (id: string, updates: Partial<AudioTrack>) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setTotalDuration: (duration: number) => void;
  
  clearHistory: () => void;
}

export const useCreatorStore = create<CreatorState>((set) => ({
  currentProject: null,
  scriptMessages: [],
  isScriptLoading: false,
  imageTasks: [],
  isImageLoading: false,
  videoTasks: [],
  isVideoLoading: false,
  
  // 剪辑状态
  clips: [],
  audioTracks: [],
  currentTime: 0,
  isPlaying: false,
  totalDuration: 60,

  setCurrentProject: (project) => set({ currentProject: project }),
  
  addScriptMessage: (message) => set((state) => ({
    scriptMessages: [...state.scriptMessages, message]
  })),
  
  setScriptLoading: (loading) => set({ isScriptLoading: loading }),
  
  addImageTask: (task) => set((state) => ({
    imageTasks: [task, ...state.imageTasks]
  })),
  
  updateImageTask: (id, updates) => set((state) => ({
    imageTasks: state.imageTasks.map(task =>
      task.id === id ? { ...task, ...updates } : task
    )
  })),
  
  addVideoTask: (task) => set((state) => ({
    videoTasks: [task, ...state.videoTasks]
  })),
  
  updateVideoTask: (id, updates) => set((state) => ({
    videoTasks: state.videoTasks.map(task =>
      task.id === id ? { ...task, ...updates } : task
    )
  })),

  // 剪辑操作
  addClip: (clip) => set((state) => ({
    clips: [...state.clips, clip]
  })),
  
  removeClip: (id) => set((state) => ({
    clips: state.clips.filter(c => c.id !== id)
  })),
  
  updateClip: (id, updates) => set((state) => ({
    clips: state.clips.map(c =>
      c.id === id ? { ...c, ...updates } : c
    )
  })),
  
  addAudioTrack: (track) => set((state) => ({
    audioTracks: [...state.audioTracks, track]
  })),
  
  removeAudioTrack: (id) => set((state) => ({
    audioTracks: state.audioTracks.filter(t => t.id !== id)
  })),
  
  updateAudioTrack: (id, updates) => set((state) => ({
    audioTracks: state.audioTracks.map(t =>
      t.id === id ? { ...t, ...updates } : t
    )
  })),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setTotalDuration: (duration) => set({ totalDuration: duration }),

  clearHistory: () => set({
    scriptMessages: [],
    imageTasks: [],
    videoTasks: [],
    clips: [],
    audioTracks: [],
    currentTime: 0
  })
}));
