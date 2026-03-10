import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Button, Space, Tag, Slider, Select, message, Tabs, List, Empty, 
  Modal, InputNumber, Divider, Progress, Tooltip, Popover
} from 'antd';
import { 
  ScissorOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  SoundOutlined,
  DownloadOutlined,
  PlusOutlined,
  DragOutlined,
  ClockCircleOutlined,
  FileAddOutlined,
  SplitCellsOutlined,
  EditOutlined,
  ExpandOutlined,
  CompressOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import { useCreatorStore, VideoTask, Clip, AudioTrack } from '../store/creatorStore';
import { v4 as uuidv4 } from 'uuid';
import { exportVideo, ExportRequest, pollExportStatus } from '../utils/exportApi';
import './VideoEditor.css';

const { Option } = Select;
const { TabPane } = Tabs;

// 音乐库
const musicLibrary = [
  { id: 'm1', name: '悬疑紧张', duration: 120, genre: 'suspense', url: '#' },
  { id: 'm2', name: '浪漫抒情', duration: 180, genre: 'romantic', url: '#' },
  { id: 'm3', name: '动作激烈', duration: 90, genre: 'action', url: '#' },
  { id: 'm4', name: '温馨治愈', duration: 150, genre: 'warm', url: '#' },
  { id: 'm5', name: '科技感', duration: 100, genre: 'tech', url: '#' },
  { id: 'm6', name: '悲伤钢琴', duration: 200, genre: 'sad', url: '#' },
];

// 音效库
const soundEffects = [
  { id: 's1', name: '开门声', category: '环境', duration: 2 },
  { id: 's2', name: '脚步声', category: '环境', duration: 3 },
  { id: 's3', name: '电话铃', category: '环境', duration: 4 },
  { id: 's4', name: '心跳声', category: '情绪', duration: 5 },
  { id: 's5', name: '爆炸声', category: '动作', duration: 3 },
  { id: 's6', name: '雨声', category: '环境', duration: 10 },
];

export const VideoEditor: React.FC = () => {
  const { 
    videoTasks, 
    clips, 
    audioTracks, 
    selectedClipId,
    currentTime,
    isPlaying,
    totalDuration,
    currentClipIndex,
    previewTime,
    currentExportTask,
    addClip,
    removeClip,
    updateClip,
    reorderClips,
    splitClip,
    setSelectedClip,
    addAudioTrack,
    removeAudioTrack,
    updateAudioTrack,
    setCurrentTime,
    setIsPlaying,
    setTotalDuration,
    setCurrentClipIndex,
    setPreviewTime,
    getClipAtTime,
    addExportTask,
    updateExportTask,
    setCurrentExportTask,
  } = useCreatorStore();
  
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [isTrimModalVisible, setIsTrimModalVisible] = useState(false);
  const [trimClip, setTrimClip] = useState<Clip | null>(null);
  const [trimValues, setTrimValues] = useState<[number, number]>([0, 10]);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [draggedClipId, setDraggedClipId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showTimeRuler, setShowTimeRuler] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playbackRef = useRef<number | null>(null);

  // 计算实际总时长
  useEffect(() => {
    const total = clips.reduce((sum, clip) => sum + (clip.outPoint - clip.inPoint), 0);
    const audioTotal = audioTracks.reduce((sum, track) => 
      Math.max(sum, track.startTime + track.duration), 0);
    setTotalDuration(Math.max(total, audioTotal, 60));
  }, [clips, audioTracks, setTotalDuration]);

  // 将生成的视频添加到时间轴
  const addClipFromTask = (task: VideoTask) => {
    if (task.status !== 'completed' || !task.resultUrl) return;
    
    const duration = task.duration || 5;
    addClip({
      id: uuidv4(),
      videoId: task.id,
      videoUrl: task.resultUrl,
      startTime: 0,
      endTime: duration,
      duration: duration,
    });
    
    message.success('已添加到时间轴');
  };

  // 添加音乐到音轨
  const addMusicTrack = (musicId: string) => {
    const music = musicLibrary.find(m => m.id === musicId);
    if (!music) return;
    
    const newTrack: AudioTrack = {
      id: uuidv4(),
      type: 'music',
      name: music.name,
      startTime: currentTime,
      duration: music.duration,
      volume: 80,
    };
    
    addAudioTrack(newTrack);
    message.success(`已添加配乐: ${music.name}`);
  };

  // 添加音效
  const addSoundEffect = (soundId: string) => {
    const sound = soundEffects.find(s => s.id === soundId);
    if (!sound) return;
    
    const newTrack: AudioTrack = {
      id: uuidv4(),
      type: 'effect',
      name: sound.name,
      startTime: currentTime,
      duration: sound.duration,
      volume: 100,
    };
    
    addAudioTrack(newTrack);
    message.success(`已添加音效: ${sound.name}`);
  };

  // 更新片段时间（在时间轴上的位置）
  const updateClipTimelinePosition = (clipId: string, newStartTime: number) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;
    
    const duration = clip.outPoint - clip.inPoint;
    updateClip(clipId, {
      startTime: newStartTime,
      endTime: newStartTime + duration,
    });
  };

  // 打开裁剪模态框
  const openTrimModal = (clip: Clip) => {
    setTrimClip(clip);
    setTrimValues([clip.inPoint, clip.outPoint]);
    setIsTrimModalVisible(true);
  };

  // 应用裁剪
  const applyTrim = () => {
    if (!trimClip) return;
    
    const [inPoint, outPoint] = trimValues;
    const newDuration = outPoint - inPoint;
    
    updateClip(trimClip.id, {
      inPoint,
      outPoint,
      endTime: trimClip.startTime + newDuration,
    });
    
    message.success('裁剪已应用');
    setIsTrimModalVisible(false);
    setTrimClip(null);
  };

  // 分割片段
  const handleSplitClip = () => {
    if (!selectedClipId) {
      message.warning('请先选择要分割的片段');
      return;
    }
    
    const clip = clips.find(c => c.id === selectedClipId);
    if (!clip) return;
    
    // 计算当前播放时间相对于该片段的位置
    const clipDuration = clip.outPoint - clip.inPoint;
    const relativeTime = Math.min(Math.max(previewTime, 0.5), clipDuration - 0.5);
    
    splitClip(selectedClipId, relativeTime);
    message.success('片段已分割');
  };

  // 拖拽排序处理
  const handleDragStart = (e: React.DragEvent, clipId: string) => {
    setDraggedClipId(clipId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    if (!draggedClipId) return;
    
    const currentIndex = clips.findIndex(c => c.id === draggedClipId);
    if (currentIndex === -1 || currentIndex === targetIndex) return;
    
    // 重新排序
    const newOrder = [...clips];
    const [removed] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, removed);
    
    reorderClips(newOrder.map(c => c.id));
    setDraggedClipId(null);
    message.success('顺序已调整');
  };

  // 播放/暂停
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // 播放控制
  const handleStepBackward = () => {
    setCurrentTime(Math.max(0, currentTime - 1));
  };

  const handleStepForward = () => {
    setCurrentTime(Math.min(totalDuration, currentTime + 1));
  };

  const handleSeekToStart = () => {
    setCurrentTime(0);
    setCurrentClipIndex(0);
    setPreviewTime(0);
  };

  // 时间轴播放同步
  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now();
      const startPosition = currentTime;
      
      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const newTime = startPosition + elapsed;
        
        if (newTime >= totalDuration) {
          setIsPlaying(false);
          setCurrentTime(totalDuration);
          return;
        }
        
        setCurrentTime(newTime);
        
        // 获取当前时间点对应的片段
        const { clip, offset, index } = getClipAtTime(newTime);
        if (clip && index !== currentClipIndex) {
          setCurrentClipIndex(index);
        }
        if (clip) {
          setPreviewTime(offset);
        }
        
        playbackRef.current = requestAnimationFrame(animate);
      };
      
      playbackRef.current = requestAnimationFrame(animate);
    } else {
      if (playbackRef.current) {
        cancelAnimationFrame(playbackRef.current);
        playbackRef.current = null;
      }
    }
    
    return () => {
      if (playbackRef.current) {
        cancelAnimationFrame(playbackRef.current);
      }
    };
  }, [isPlaying, currentTime, totalDuration, currentClipIndex, getClipAtTime, setCurrentTime, setCurrentClipIndex, setIsPlaying, setPreviewTime]);

  // 视频预览同步
  useEffect(() => {
    if (videoRef.current && clips[currentClipIndex]) {
      const clip = clips[currentClipIndex];
      const videoTime = clip.inPoint + previewTime;
      
      if (Math.abs(videoRef.current.currentTime - videoTime) > 0.1) {
        videoRef.current.currentTime = videoTime;
      }
    }
  }, [previewTime, currentClipIndex, clips]);

  // 获取当前预览的视频URL
  const getCurrentPreviewUrl = useCallback(() => {
    const { clip } = getClipAtTime(currentTime);
    return clip?.videoUrl || '';
  }, [currentTime, getClipAtTime]);

  // 导出视频
  const handleExport = async () => {
    if (clips.length === 0) {
      message.warning('时间轴为空，请先添加视频片段');
      return;
    }
    
    setIsExportModalVisible(true);
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      const exportData: ExportRequest = {
        clips: clips.map(clip => ({
          videoUrl: clip.videoUrl,
          inPoint: clip.inPoint,
          outPoint: clip.outPoint,
        })),
        audioTracks: audioTracks.map(track => ({
          type: track.type,
          name: track.name,
          startTime: track.startTime,
          duration: track.duration,
          volume: track.volume,
        })),
        outputFormat: 'mp4',
        resolution: '1080p',
        fps: 30,
      };
      
      const response = await exportVideo(exportData);
      
      // 创建导出任务
      const exportTask = {
        id: response.taskId,
        projectId: 'current',
        status: 'processing' as const,
        progress: 0,
        createdAt: Date.now(),
      };
      
      addExportTask(exportTask);
      
      // 轮询导出状态
      await pollExportStatus(
        response.taskId,
        (status) => {
          setExportProgress(status.progress);
          updateExportTask(response.taskId, {
            progress: status.progress,
            status: status.status,
            resultUrl: status.resultUrl,
          });
        },
        2000,
        300
      );
      
      message.success('视频导出成功！');
      setIsExporting(false);
    } catch (error) {
      message.error('导出失败: ' + (error as Error).message);
      setIsExporting(false);
    }
  };

  // 渲染时间轴刻度
  const renderTimeRuler = () => {
    const markers = [];
    const step = totalDuration <= 60 ? 5 : 10;
    for (let i = 0; i <= totalDuration; i += step) {
      markers.push(
        <div 
          key={i} 
          className="time-marker"
          style={{ left: `${(i / totalDuration) * 100}%` }}
        >
          <span className="time-label">{i}s</span>
        </div>
      );
    }
    return markers;
  };

  // 渲染视频片段
  const renderClips = () => {
    return clips.map((clip, index) => {
      const duration = clip.outPoint - clip.inPoint;
      const left = clips.slice(0, index).reduce((sum, c) => sum + (c.outPoint - c.inPoint), 0);
      const width = duration;
      
      const isSelected = selectedClipId === clip.id;
      const isDragging = draggedClipId === clip.id;
      const isDragOver = dragOverIndex === index;
      
      return (
        <div
          key={clip.id}
          className={`clip-container ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
          style={{
            left: `${(left / totalDuration) * 100}%`,
            width: `${(width / totalDuration) * 100}%`,
          }}
          draggable
          onDragStart={(e) => handleDragStart(e, clip.id)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onClick={() => setSelectedClip(clip.id)}
        >
          <div className="clip-item-enhanced">
            <div className="clip-drag-handle">
              <DragOutlined />
            </div>
            <div className="clip-content">
              <span className="clip-name">片段 {index + 1}</span>
              <span className="clip-info">
                {clip.inPoint.toFixed(1)}s - {clip.outPoint.toFixed(1)}s
              </span>
            </div>
            <div className="clip-actions">
              <Tooltip title="裁剪">
                <Button
                  size="small"
                  type="text"
                  icon={<ScissorOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    openTrimModal(clip);
                  }}
                />
              </Tooltip>
              <Button
                size="small"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  removeClip(clip.id);
                }}
              />
            </div>
          </div>
          {/* 裁剪指示器 */}
          <div className="clip-trim-indicators">
            <div className="trim-handle left" />
            <div className="trim-handle right" />
          </div>
        </div>
      );
    });
  };

  return (
    <div className="video-editor">
      {/* 顶部工具栏 */}
      <div className="editor-toolbar">
        <Space>
          <Button 
            icon={<StepBackwardOutlined />}
            onClick={handleSeekToStart}
            size="small"
          />
          <Button 
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={togglePlay}
            type="primary"
          >
            {isPlaying ? '暂停' : '播放'}
          </Button>
          <Button 
            icon={<StepBackwardOutlined />}
            onClick={handleStepBackward}
            size="small"
          />
          <Button 
            icon={<StepForwardOutlined />}
            onClick={handleStepForward}
            size="small"
          />
          <span className="time-display">
            <ClockCircleOutlined /> {currentTime.toFixed(2)}s / {totalDuration.toFixed(2)}s
          </span>
        </Space>
        
        <Space>
          <Tooltip title="分割片段">
            <Button 
              icon={<SplitCellsOutlined />}
              onClick={handleSplitClip}
              disabled={!selectedClipId}
            >
              分割
            </Button>
          </Tooltip>
          
          <Select
            placeholder="添加生成视频"
            style={{ width: 150 }}
            onChange={(value) => {
              const task = videoTasks.find(t => t.id === value);
              if (task) addClipFromTask(task);
            }}
            value={undefined}
          >
            {videoTasks.filter(t => t.status === 'completed').map(task => (
              <Option key={task.id} value={task.id}>
                {task.prompt.slice(0, 15)}...
              </Option>
            ))}
          </Select>
          
          <Button 
            icon={<DownloadOutlined />}
            type="primary"
            onClick={handleExport}
            disabled={clips.length === 0 || isExporting}
            loading={isExporting}
          >
            导出成片
          </Button>
        </Space>
      </div>

      {/* 主编辑区 */}
      <div className="editor-main">
        {/* 左侧：预览 */}
        <div className="preview-section">
          <div className="preview-video">
            {clips.length > 0 && getCurrentPreviewUrl() ? (
              <video 
                ref={videoRef}
                src={getCurrentPreviewUrl()}
                style={{ width: '100%', height: '100%' }}
                muted
              />
            ) : (
              <Empty 
                description="暂无视频片段" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <p className="hint">从右侧添加生成的视频</p>
              </Empty>
            )}
          </div>
          
          {/* 播放进度条 */}
          <div className="preview-controls">
            <Slider
              min={0}
              max={totalDuration}
              step={0.1}
              value={currentTime}
              onChange={(value) => {
                setCurrentTime(value);
                const { offset, index } = getClipAtTime(value);
                setCurrentClipIndex(index);
                setPreviewTime(offset);
              }}
              tooltip={{ formatter: (v) => `${(v as number).toFixed(1)}s` }}
            />
          </div>
          
          {/* 当前片段信息 */}
          {clips[currentClipIndex] && (
            <div className="clip-info-panel">
              <Tag color="blue">片段 {currentClipIndex + 1} / {clips.length}</Tag>
              <Tag>入点: {clips[currentClipIndex].inPoint.toFixed(1)}s</Tag>
              <Tag>出点: {clips[currentClipIndex].outPoint.toFixed(1)}s</Tag>
              <Tag>时长: {(clips[currentClipIndex].outPoint - clips[currentClipIndex].inPoint).toFixed(1)}s</Tag>
            </div>
          )}
        </div>

        {/* 右侧：素材库 */}
        <div className="assets-section">
          <Tabs defaultActiveKey="videos" size="small">
            <TabPane tab="视频素材" key="videos">
              <div className="assets-list">
                {videoTasks.filter(t => t.status === 'completed').length === 0 ? (
                  <Empty description="暂无已生成视频" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <List
                    size="small"
                    dataSource={videoTasks.filter(t => t.status === 'completed')}
                    renderItem={task => (
                      <List.Item
                        actions={[
                          <Button 
                            size="small" 
                            icon={<PlusOutlined />}
                            onClick={() => addClipFromTask(task)}
                          >
                            添加
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          title={task.prompt.slice(0, 20) + '...'}
                          description={`${task.duration || 5}秒`}
                        />
                      </List.Item>
                    )}
                  />
                )}
              </div>
            </TabPane>
            
            <TabPane tab="配乐" key="music">
              <div className="assets-list">
                <Select
                  placeholder="选择背景音乐"
                  style={{ width: '100%', marginBottom: 12 }}
                  onChange={setSelectedMusic}
                  value={selectedMusic}
                >
                  {musicLibrary.map(music => (
                    <Option key={music.id} value={music.id}>
                      {music.name} ({music.duration}秒) - {music.genre}
                    </Option>
                  ))}
                </Select>
                <Button 
                  block 
                  icon={<SoundOutlined />}
                  onClick={() => selectedMusic && addMusicTrack(selectedMusic)}
                  disabled={!selectedMusic}
                >
                  添加到音轨
                </Button>
              </div>
            </TabPane>
            
            <TabPane tab="音效" key="effects">
              <div className="assets-list">
                <List
                  size="small"
                  dataSource={soundEffects}
                  renderItem={sound => (
                    <List.Item
                      actions={[
                        <Button 
                          size="small" 
                          icon={<PlusOutlined />}
                          onClick={() => addSoundEffect(sound.id)}
                        >
                          添加
                        </Button>
                      ]}
                    >
                      <Tag size="small">{sound.category}</Tag>
                      {sound.name}
                    </List.Item>
                  )}
                />
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>

      {/* 底部时间轴 */}
      <div className="timeline-section" ref={timelineRef}>
        {/* 时间标尺 */}
        {showTimeRuler && (
          <div className="timeline-ruler">
            <div className="time-markers">
              {renderTimeRuler()}
            </div>
            <Slider
              min={0}
              max={totalDuration}
              step={0.1}
              value={currentTime}
              onChange={(value) => {
                setCurrentTime(value);
                const { offset, index } = getClipAtTime(value);
                setCurrentClipIndex(index);
                setPreviewTime(offset);
              }}
              tooltip={{ formatter: (v) => `${(v as number).toFixed(1)}s` }}
            />
            {/* 播放头 */}
            <div 
              className="playhead"
              style={{ left: `${(currentTime / totalDuration) * 100}%` }}
            />
          </div>
        )}

        {/* 视频轨道 */}
        <div className="timeline-track video-track">
          <div className="track-label">
            <VideoCameraOutlined /> 视频
          </div>
          <div className="track-content">
            {clips.length === 0 ? (
              <div className="empty-track">拖入视频片段到这里</div>
            ) : (
              renderClips()
            )}
          </div>
        </div>

        {/* 音频轨道 */}
        <div className="timeline-track audio-track">
          <div className="track-label">
            <SoundOutlined /> 音频
          </div>
          <div className="track-content">
            {audioTracks.length === 0 ? (
              <div className="empty-track">添加配乐或音效</div>
            ) : (
              audioTracks.map((track, index) => {
                const widthPercent = (track.duration / totalDuration) * 100;
                const leftPercent = (track.startTime / totalDuration) * 100;
                
                return (
                  <div
                    key={track.id}
                    className="audio-item-enhanced"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  >
                    <div className="audio-icon">
                      <SoundOutlined />
                    </div>
                    <div className="audio-content">
                      <span className="audio-name">{track.name}</span>
                      <Slider
                        className="audio-volume-slider"
                        min={0}
                        max={100}
                        value={track.volume}
                        onChange={(value) => updateAudioTrack(track.id, { volume: value })}
                        size="small"
                      />
                    </div>
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      className="audio-delete"
                      onClick={() => removeAudioTrack(track.id)}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 裁剪模态框 */}
      <Modal
        title="裁剪片段"
        open={isTrimModalVisible}
        onOk={applyTrim}
        onCancel={() => {
          setIsTrimModalVisible(false);
          setTrimClip(null);
        }}
        okText="应用"
        cancelText="取消"
      >
        {trimClip && (
          <div className="trim-modal-content">
            <p>调整片段的入点和出点</p>
            <div className="trim-preview">
              <video 
                src={trimClip.videoUrl} 
                style={{ width: '100%', maxHeight: 200 }}
                controls
              />
            </div>
            <Divider />
            <div className="trim-controls">
              <div className="trim-values">
                <span>入点: {trimValues[0].toFixed(2)}s</span>
                <span>出点: {trimValues[1].toFixed(2)}s</span>
                <span>时长: {(trimValues[1] - trimValues[0]).toFixed(2)}s</span>
              </div>
              <Slider
                range
                min={0}
                max={trimClip.duration}
                step={0.1}
                value={trimValues}
                onChange={(values) => setTrimValues(values as [number, number])}
              />
              <div className="trim-inputs">
                <InputNumber
                  min={0}
                  max={trimValues[1] - 0.5}
                  step={0.1}
                  value={trimValues[0]}
                  onChange={(value) => setTrimValues([value || 0, trimValues[1]])}
                  addonBefore="入点"
                  addonAfter="s"
                />
                <InputNumber
                  min={trimValues[0] + 0.5}
                  max={trimClip.duration}
                  step={0.1}
                  value={trimValues[1]}
                  onChange={(value) => setTrimValues([trimValues[0], value || trimClip.duration])}
                  addonBefore="出点"
                  addonAfter="s"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 导出模态框 */}
      <Modal
        title="导出视频"
        open={isExportModalVisible}
        onCancel={() => {
          if (!isExporting) {
            setIsExportModalVisible(false);
          }
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => setIsExportModalVisible(false)}
            disabled={isExporting}
          >
            {isExporting ? '导出中...' : '关闭'}
          </Button>,
          currentExportTask?.resultUrl && (
            <Button 
              key="download" 
              type="primary"
              href={currentExportTask.resultUrl}
              target="_blank"
            >
              下载视频
            </Button>
          ),
        ]}
        closable={!isExporting}
        maskClosable={!isExporting}
      >
        <div className="export-modal-content">
          {isExporting ? (
            <>
              <p>正在合成视频，请稍候...</p>
              <Progress percent={Math.round(exportProgress)} status="active" />
              <p className="export-status">
                {exportProgress < 30 && '正在准备素材...'}
                {exportProgress >= 30 && exportProgress < 70 && '正在合成视频...'}
                {exportProgress >= 70 && exportProgress < 100 && '正在添加音频...'}
                {exportProgress >= 100 && '导出完成！'}
              </p>
            </>
          ) : currentExportTask?.resultUrl ? (
            <>
              <Progress percent={100} status="success" />
              <p>视频导出成功！</p>
              <p>文件大小: {currentExportTask.resultUrl ? '点击下载查看' : '-'}</p>
            </>
          ) : (
            <p>准备导出...</p>
          )}
        </div>
      </Modal>
    </div>
  );
};
