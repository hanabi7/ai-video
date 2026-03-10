import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  startTime: number;      // 在时间轴上的开始位置（秒）
  endTime: number;        // 在时间轴上的结束位置（秒）
  inPoint: number;        // 视频入点（秒）
  outPoint: number;       // 视频出点（秒）
  duration: number;       // 原始视频时长
  thumbnail?: string;
  order: number;          // 排序索引
}

// 音频轨道
export interface AudioTrack {
  id: string;
  type: 'music' | 'effect';
  name: string;
  startTime: number;
  duration: number;
  volume: number;
  url?: string;
}

// 剪辑项目
export interface EditProject {
  id: string;
  name: string;
  clips: Clip[];
  audioTracks: AudioTrack[];
  totalDuration: number;
  createdAt: number;
  updatedAt: number;
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

// 导出任务
export interface ExportTask {
  id: string;
  projectId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  error?: string;
  createdAt: number;
  completedAt?: number;
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
  selectedClipId: string | null;
  currentClipIndex: number;  // 当前播放的片段索引
  previewTime: number;       // 当前预览时间点（相对于当前片段）
  
  // 导出任务
  exportTasks: ExportTask[];
  currentExportTask: ExportTask | null;
  
  // Actions
  setCurrentProject: (project: ScriptProject | null) => void;
  addScriptMessage: (message: ScriptMessage) => void;
  setScriptLoading: (loading: boolean) => void;
  addImageTask: (task: ImageTask) => void;
  updateImageTask: (id: string, updates: Partial<ImageTask>) => void;
  removeImageTask: (id: string) => void;
  addVideoTask: (task: VideoTask) => void;
  updateVideoTask: (id: string, updates: Partial<VideoTask>) => void;
  removeVideoTask: (id: string) => void;
  
  // 剪辑相关
  addClip: (clip: Omit<Clip, 'order' | 'inPoint' | 'outPoint'>) => void;
  removeClip: (id: string) => void;
  updateClip: (id: string, updates: Partial<Clip>) => void;
  reorderClips: (clipIds: string[]) => void;  // 拖拽排序
  splitClip: (clipId: string, splitTime: number) => void;  // 分割片段
  setSelectedClip: (id: string | null) => void;
  
  addAudioTrack: (track: AudioTrack) => void;
  removeAudioTrack: (id: string) => void;
  updateAudioTrack: (id: string, updates: Partial<AudioTrack>) => void;
  
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setTotalDuration: (duration: number) => void;
  setCurrentClipIndex: (index: number) => void;
  setPreviewTime: (time: number) => void;
  
  // 计算当前时间点对应的片段和偏移
  getClipAtTime: (time: number) => { clip: Clip | null; offset: number; index: number };
  
  // 导出相关
  addExportTask: (task: ExportTask) => void;
  updateExportTask: (id: string, updates: Partial<ExportTask>) => void;
  setCurrentExportTask: (task: ExportTask | null) => void;
  
  clearHistory: () => void;
  resetClips: () => void;
}

export const useCreatorStore = create<CreatorState>()(
  persist(
    (set, get) => ({
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
      selectedClipId: null,
      currentClipIndex: 0,
      previewTime: 0,
      
      // 导出任务
      exportTasks: [],
      currentExportTask: null,

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

      removeImageTask: (id) => set((state) => ({
        imageTasks: state.imageTasks.filter(task => task.id !== id)
      })),
      
      addVideoTask: (task) => set((state) => ({
        videoTasks: [task, ...state.videoTasks]
      })),
      
      updateVideoTask: (id, updates) => set((state) => ({
        videoTasks: state.videoTasks.map(task =>
          task.id === id ? { ...task, ...updates } : task
        )
      })),

      removeVideoTask: (id) => set((state) => ({
        videoTasks: state.videoTasks.filter(task => task.id !== id)
      })),

      // 剪辑操作
      addClip: (clipData) => set((state) => {
        const maxOrder = Math.max(0, ...state.clips.map(c => c.order));
        const newClip: Clip = {
          ...clipData,
          order: maxOrder + 1,
          inPoint: 0,
          outPoint: clipData.duration,
        };
        return {
          clips: [...state.clips, newClip]
        };
      }),
      
      removeClip: (id) => set((state) => ({
        clips: state.clips.filter(c => c.id !== id),
        selectedClipId: state.selectedClipId === id ? null : state.selectedClipId
      })),
      
      updateClip: (id, updates) => set((state) => ({
        clips: state.clips.map(c =>
          c.id === id ? { ...c, ...updates } : c
        )
      })),
      
      // 拖拽排序 - 根据传入的 clipIds 顺序重新排序
      reorderClips: (clipIds) => set((state) => ({
        clips: clipIds
          .map((id, index) => {
            const clip = state.clips.find(c => c.id === id);
            return clip ? { ...clip, order: index } : null;
          })
          .filter((c): c is Clip => c !== null)
          .sort((a, b) => a.order - b.order)
      })),
      
      // 分割片段
      splitClip: (clipId, splitTime) => set((state) => {
        const clip = state.clips.find(c => c.id === clipId);
        if (!clip) return state;
        
        // 计算在时间轴上的分割点对应的视频时间点
        const videoSplitTime = clip.inPoint + splitTime;
        if (videoSplitTime <= clip.inPoint || videoSplitTime >= clip.outPoint) {
          return state; // 分割点不在有效范围内
        }
        
        const leftClip: Clip = {
          ...clip,
          id: `${clip.id}_left_${Date.now()}`,
          outPoint: videoSplitTime,
          duration: videoSplitTime - clip.inPoint,
          order: clip.order
        };
        
        const rightClip: Clip = {
          ...clip,
          id: `${clip.id}_right_${Date.now()}`,
          inPoint: videoSplitTime,
          duration: clip.outPoint - videoSplitTime,
          order: clip.order + 0.5
        };
        
        // 重新排序所有片段
        const otherClips = state.clips.filter(c => c.id !== clipId);
        const newClips = [...otherClips, leftClip, rightClip]
          .sort((a, b) => a.order - b.order)
          .map((c, index) => ({ ...c, order: index }));
        
        return { clips: newClips };
      }),
      
      setSelectedClip: (id) => set({ selectedClipId: id }),
      
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
      setCurrentClipIndex: (index) => set({ currentClipIndex: index }),
      setPreviewTime: (time) => set({ previewTime: time }),
      
      // 根据时间点获取对应的片段信息
      getClipAtTime: (time) => {
        const { clips } = get();
        if (clips.length === 0) {
          return { clip: null, offset: 0, index: -1 };
        }
        
        let accumulatedTime = 0;
        for (let i = 0; i < clips.length; i++) {
          const clip = clips[i];
          const clipDuration = clip.outPoint - clip.inPoint;
          
          if (time >= accumulatedTime && time < accumulatedTime + clipDuration) {
            const offset = time - accumulatedTime;
            return { clip, offset, index: i };
          }
          accumulatedTime += clipDuration;
        }
        
        // 如果时间超出范围，返回最后一个片段
        const lastClip = clips[clips.length - 1];
        return { clip: lastClip, offset: lastClip.outPoint - lastClip.inPoint, index: clips.length - 1 };
      },
      
      // 导出相关
      addExportTask: (task) => set((state) => ({
        exportTasks: [task, ...state.exportTasks],
        currentExportTask: task
      })),
      
      updateExportTask: (id, updates) => set((state) => {
        const newTasks = state.exportTasks.map(task =>
          task.id === id ? { ...task, ...updates } : task
        );
        const currentTask = state.currentExportTask?.id === id 
          ? { ...state.currentExportTask, ...updates }
          : state.currentExportTask;
        return { 
          exportTasks: newTasks,
          currentExportTask: currentTask
        };
      }),
      
      setCurrentExportTask: (task) => set({ currentExportTask: task }),

      clearHistory: () => set({
        scriptMessages: [],
        imageTasks: [],
        videoTasks: [],
      }),
      
      resetClips: () => set({
        clips: [],
        audioTracks: [],
        currentTime: 0,
        isPlaying: false,
        selectedClipId: null,
        currentClipIndex: 0,
        previewTime: 0,
      })
    }),
    {
      name: 'creator-storage',
      partialize: (state) => ({
        currentProject: state.currentProject,
        clips: state.clips,
        audioTracks: state.audioTracks,
        exportTasks: state.exportTasks,
      }),
    }
  )
);
