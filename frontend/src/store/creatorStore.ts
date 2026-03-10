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

// 角色/人设
export interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  appearance: string;
  background?: string;
  goals?: string;
  age?: number;
  gender?: string;
  tags?: string[];
}

// 场景/Cut
export interface Scene {
  id: string;
  sceneNumber: number;
  title?: string;
  location: string;
  time: string;
  description: string;
  dialogue: Dialogue[];
  characterIds?: string[]; // 关联的角色ID
  worldSettingId?: string; // 关联的世界观设定ID
  notes?: string;
}

export interface Dialogue {
  characterId: string;
  content: string;
  emotion?: string;
  action?: string;
}

// 大纲/情节节点
export interface OutlineNode {
  id: string;
  title: string;
  content: string;
  type: 'act1' | 'act2' | 'act3' | 'setup' | 'confrontation' | 'resolution' | 'custom';
  order: number;
  sceneIds?: string[]; // 关联的场景ID
}

// 世界观设定
export interface WorldSetting {
  id: string;
  name: string;
  category: 'era' | 'location' | 'rule' | 'culture' | 'technology' | 'magic' | 'custom';
  description: string;
  details?: string;
  tags?: string[];
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
  
  // 剧本创作模块导航
  scriptModule: 'character' | 'outline' | 'script' | 'world' | 'chat';
  
  // 角色/人设管理
  characters: Character[];
  selectedCharacterId: string | null;
  
  // 大纲管理
  outlineNodes: OutlineNode[];
  selectedOutlineNodeId: string | null;
  
  // 场景/剧本管理
  scenes: Scene[];
  selectedSceneId: string | null;
  
  // 世界观管理
  worldSettings: WorldSetting[];
  selectedWorldSettingId: string | null;
  
  // 剧本创作聊天记录
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
  
  // 模块导航
  setScriptModule: (module: CreatorState['scriptModule']) => void;
  
  // 角色管理
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  removeCharacter: (id: string) => void;
  setSelectedCharacter: (id: string | null) => void;
  
  // 大纲管理
  addOutlineNode: (node: Omit<OutlineNode, 'order'>) => void;
  updateOutlineNode: (id: string, updates: Partial<OutlineNode>) => void;
  removeOutlineNode: (id: string) => void;
  reorderOutlineNodes: (nodeIds: string[]) => void;
  setSelectedOutlineNode: (id: string | null) => void;
  
  // 场景管理
  addScene: (scene: Omit<Scene, 'sceneNumber'>) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  removeScene: (id: string) => void;
  setSelectedScene: (id: string | null) => void;
  
  // 世界观管理
  addWorldSetting: (setting: WorldSetting) => void;
  updateWorldSetting: (id: string, updates: Partial<WorldSetting>) => void;
  removeWorldSetting: (id: string) => void;
  setSelectedWorldSetting: (id: string | null) => void;
  
  // 剧本消息
  addScriptMessage: (message: ScriptMessage) => void;
  setScriptLoading: (loading: boolean) => void;
  
  // 图片创作
  addImageTask: (task: ImageTask) => void;
  updateImageTask: (id: string, updates: Partial<ImageTask>) => void;
  removeImageTask: (id: string) => void;
  
  // 视频创作
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
      
      // 剧本创作模块导航
      scriptModule: 'chat',
      
      // 角色管理
      characters: [],
      selectedCharacterId: null,
      
      // 大纲管理
      outlineNodes: [],
      selectedOutlineNodeId: null,
      
      // 场景管理
      scenes: [],
      selectedSceneId: null,
      
      // 世界观管理
      worldSettings: [],
      selectedWorldSettingId: null,
      
      // 剧本消息
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
      
      // 模块导航
      setScriptModule: (module) => set({ scriptModule: module }),
      
      // 角色管理
      addCharacter: (character) => set((state) => ({
        characters: [...state.characters, character]
      })),
      updateCharacter: (id, updates) => set((state) => ({
        characters: state.characters.map(c =>
          c.id === id ? { ...c, ...updates } : c
        )
      })),
      removeCharacter: (id) => set((state) => ({
        characters: state.characters.filter(c => c.id !== id),
        selectedCharacterId: state.selectedCharacterId === id ? null : state.selectedCharacterId
      })),
      setSelectedCharacter: (id) => set({ selectedCharacterId: id }),
      
      // 大纲管理
      addOutlineNode: (node) => set((state) => {
        const maxOrder = Math.max(0, ...state.outlineNodes.map(n => n.order));
        return {
          outlineNodes: [...state.outlineNodes, { ...node, order: maxOrder + 1 }]
        };
      }),
      updateOutlineNode: (id, updates) => set((state) => ({
        outlineNodes: state.outlineNodes.map(n =>
          n.id === id ? { ...n, ...updates } : n
        )
      })),
      removeOutlineNode: (id) => set((state) => ({
        outlineNodes: state.outlineNodes.filter(n => n.id !== id),
        selectedOutlineNodeId: state.selectedOutlineNodeId === id ? null : state.selectedOutlineNodeId
      })),
      reorderOutlineNodes: (nodeIds) => set((state) => ({
        outlineNodes: nodeIds
          .map((id, index) => {
            const node = state.outlineNodes.find(n => n.id === id);
            return node ? { ...node, order: index } : null;
          })
          .filter((n): n is OutlineNode => n !== null)
          .sort((a, b) => a.order - b.order)
      })),
      setSelectedOutlineNode: (id) => set({ selectedOutlineNodeId: id }),
      
      // 场景管理
      addScene: (scene) => set((state) => {
        const maxNumber = Math.max(0, ...state.scenes.map(s => s.sceneNumber));
        return {
          scenes: [...state.scenes, { ...scene, sceneNumber: maxNumber + 1 }]
        };
      }),
      updateScene: (id, updates) => set((state) => ({
        scenes: state.scenes.map(s =>
          s.id === id ? { ...s, ...updates } : s
        )
      })),
      removeScene: (id) => set((state) => ({
        scenes: state.scenes.filter(s => s.id !== id),
        selectedSceneId: state.selectedSceneId === id ? null : state.selectedSceneId
      })),
      setSelectedScene: (id) => set({ selectedSceneId: id }),
      
      // 世界观管理
      addWorldSetting: (setting) => set((state) => ({
        worldSettings: [...state.worldSettings, setting]
      })),
      updateWorldSetting: (id, updates) => set((state) => ({
        worldSettings: state.worldSettings.map(w =>
          w.id === id ? { ...w, ...updates } : w
        )
      })),
      removeWorldSetting: (id) => set((state) => ({
        worldSettings: state.worldSettings.filter(w => w.id !== id),
        selectedWorldSettingId: state.selectedWorldSettingId === id ? null : state.selectedWorldSettingId
      })),
      setSelectedWorldSetting: (id) => set({ selectedWorldSettingId: id }),
      
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
        characters: state.characters,
        outlineNodes: state.outlineNodes,
        scenes: state.scenes,
        worldSettings: state.worldSettings,
        clips: state.clips,
        audioTracks: state.audioTracks,
        exportTasks: state.exportTasks,
      }),
    }
  )
);
