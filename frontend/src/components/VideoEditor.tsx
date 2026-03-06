import { useState, useRef, useEffect } from 'react';
import { Button, Space, Tag, Slider, Select, message, Tabs, List, Empty } from 'antd';
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
  FileAddOutlined
} from '@ant-design/icons';
import { useCreatorStore, VideoTask } from '../store/creatorStore';
import { v4 as uuidv4 } from 'uuid';
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
  { id: 's1', name: '开门声', category: '环境' },
  { id: 's2', name: '脚步声', category: '环境' },
  { id: 's3', name: '电话铃', category: '环境' },
  { id: 's4', name: '心跳声', category: '情绪' },
  { id: 's5', name: '爆炸声', category: '动作' },
  { id: 's6', name: '雨声', category: '环境' },
];

// 剪辑片段
interface Clip {
  id: string;
  videoId: string;
  videoUrl: string;
  startTime: number;
  endTime: number;
  duration: number;
  thumbnail?: string;
}

// 时间轴音轨
interface AudioTrack {
  id: string;
  type: 'music' | 'effect';
  name: string;
  startTime: number;
  duration: number;
  volume: number;
}

export const VideoEditor: React.FC = () => {
  const { videoTasks } = useCreatorStore();
  const [clips, setClips] = useState<Clip[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(60);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 将生成的视频添加到时间轴
  const addClipFromTask = (task: VideoTask) => {
    if (task.status !== 'completed' || !task.resultUrl) return;
    
    const newClip: Clip = {
      id: uuidv4(),
      videoId: task.id,
      videoUrl: task.resultUrl,
      startTime: 0,
      endTime: task.duration || 5,
      duration: task.duration || 5,
    };
    
    setClips(prev => [...prev, newClip]);
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
      startTime: 0,
      duration: music.duration,
      volume: 80,
    };
    
    setAudioTracks(prev => [...prev, newTrack]);
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
      duration: 3,
      volume: 100,
    };
    
    setAudioTracks(prev => [...prev, newTrack]);
  };

  // 删除片段
  const removeClip = (clipId: string) => {
    setClips(prev => prev.filter(c => c.id !== clipId));
    if (selectedClip === clipId) setSelectedClip(null);
  };

  // 删除音轨
  const removeAudioTrack = (trackId: string) => {
    setAudioTracks(prev => prev.filter(t => t.id !== trackId));
  };

  // 更新片段时间
  const updateClipTime = (clipId: string, start: number, end: number) => {
    setClips(prev => prev.map(clip => 
      clip.id === clipId ? { ...clip, startTime: start, endTime: end } : clip
    ));
  };

  // 播放/暂停
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // 导出视频
  const handleExport = () => {
    if (clips.length === 0) {
      message.warning('时间轴为空，请先添加视频片段');
      return;
    }
    message.success('开始导出视频...');
    // 这里应该调用后端API进行视频合成
  };

  return (
    <div className="video-editor">
      {/* 顶部工具栏 */}
      <div className="editor-toolbar">
        <Space>
          <Button 
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={togglePlay}
            type="primary"
          >
            {isPlaying ? '暂停' : '播放'}
          </Button>
          <span className="time-display">
            <ClockCircleOutlined /> {currentTime.toFixed(1)}s / {totalDuration}s
          </span>
        </Space>
        
        <Space>
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
            disabled={clips.length === 0}
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
            {clips.length > 0 ? (
              <video 
                ref={videoRef}
                src={clips[0]?.videoUrl}
                controls
                style={{ width: '100%', height: '100%' }}
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
      <div className="timeline-section">
        {/* 时间标尺 */}
        <div className="timeline-ruler">
          <Slider
            min={0}
            max={totalDuration}
            value={currentTime}
            onChange={setCurrentTime}
            tooltip={{ formatter: (v) => `${v}秒` }}
          />
        </div>

        {/* 视频轨道 */}
        <div className="timeline-track video-track">
          <div className="track-label">
            <VideoCameraOutlined /> 视频
          </div>
          <div className="track-content">
            {clips.length === 0 ? (
              <div className="empty-track">拖入视频片段到这里</div>
            ) : (
              clips.map((clip, index) => (
                <div
                  key={clip.id}
                  className={`clip-item ${selectedClip === clip.id ? 'selected' : ''}`}
                  style={{
                    left: `${(clip.startTime / totalDuration) * 100}%`,
                    width: `${((clip.endTime - clip.startTime) / totalDuration) * 100}%`
                  }}
                  onClick={() => setSelectedClip(clip.id)}
                >
                  <DragOutlined className="clip-drag" />
                  <span className="clip-name">片段{index + 1}</span>
                  <span className="clip-duration">{clip.duration}s</span>
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    className="clip-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeClip(clip.id);
                    }}
                  />
                </div>
              ))
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
              audioTracks.map(track => (
                <div
                  key={track.id}
                  className="audio-item"
                  style={{
                    left: `${(track.startTime / totalDuration) * 100}%`,
                    width: `${(track.duration / totalDuration) * 100}%`
                  }}
                >
                  <SoundOutlined />
                  <span className="audio-name">{track.name}</span>
                  <span className="audio-volume">{track.volume}%</span>
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    className="audio-delete"
                    onClick={() => removeAudioTrack(track.id)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
