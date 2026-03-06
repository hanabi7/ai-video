import { useState, useEffect } from 'react';
import { Input, Button, Space, Card, Tag, Slider, message, Select, Upload } from 'antd';
import { 
  VideoCameraOutlined, 
  SendOutlined,
  DownloadOutlined,
  DeleteOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  FileOutlined
} from '@ant-design/icons';
import { useCreatorStore, VideoTask } from '../store/creatorStore';
import { v4 as uuidv4 } from 'uuid';
import { generateVideo, pollTaskStatus } from '../utils/api';
import './VideoCreator.css';

const { TextArea } = Input;
const { Option } = Select;

// 视频风格预设
const videoStyles = [
  { key: 'cinematic', label: '🎬 电影质感', desc: '专业电影级画面' },
  { key: 'anime', label: '🎨 动漫风格', desc: '二次元动画效果' },
  { key: 'realistic', label: '📷 真实记录', desc: '纪录片风格' },
  { key: 'dreamy', label: '✨ 梦幻唯美', desc: '柔和光晕效果' },
  { key: 'noir', label: '🌑 黑色电影', desc: '高对比度暗调' },
];

// 视频生成平台
const platforms = [
  { key: 'dreamina', label: '即梦 Dreamina', maxDuration: 10 },
  { key: 'luma', label: 'Luma Dream Machine', maxDuration: 5 },
  { key: 'keling', label: '快手可灵', maxDuration: 10 },
  { key: 'runway', label: 'Runway Gen-3', maxDuration: 10 },
];

export const VideoCreator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [selectedPlatform, setSelectedPlatform] = useState('dreamina');
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  
  const { videoTasks, addVideoTask, updateVideoTask, removeVideoTask } = useCreatorStore();

  const currentPlatform = platforms.find(p => p.key === selectedPlatform);

  // 轮询正在生成的任务状态
  useEffect(() => {
    const generatingTasks = videoTasks.filter(t => t.status === 'generating');
    
    generatingTasks.forEach(task => {
      pollTaskStatus(task.id, 'video', (status) => {
        updateVideoTask(task.id, {
          status: status.status,
          resultUrl: status.result_url,
        });
        
        if (status.status === 'completed') {
          message.success('视频生成完成！');
        } else if (status.status === 'failed') {
          message.error('视频生成失败');
        }
      }).catch(err => {
        console.error('Poll error:', err);
        updateVideoTask(task.id, { status: 'failed' });
      });
    });
  }, [videoTasks]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      message.warning('请输入视频描述');
      return;
    }

    setGenerating(true);

    try {
      // 调用后端API
      const result = await generateVideo({
        prompt,
        image_url: referenceImage || undefined,
        duration,
        aspect_ratio: aspectRatio as any,
        style: selectedStyle as any,
        platform: selectedPlatform as any,
      });

      // 添加到任务列表
      const task: VideoTask = {
        id: result.id,
        prompt: prompt,
        status: 'generating',
        duration: duration,
        createdAt: Date.now()
      };

      addVideoTask(task);
      setPrompt('');
      message.success('视频生成任务已创建');

    } catch (error) {
      message.error(error instanceof Error ? error.message : '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    removeVideoTask(id);
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `video_${Date.now()}.mp4`;
    link.target = '_blank';
    link.click();
    message.success('开始下载');
  };

  const handleRetry = async (task: VideoTask) => {
    updateVideoTask(task.id, { status: 'generating' });
    
    try {
      const status = await pollTaskStatus(task.id, 'video', (s) => {
        updateVideoTask(task.id, {
          status: s.status,
          resultUrl: s.result_url,
        });
      });
      
      if (status.status === 'completed') {
        message.success('视频生成完成！');
      }
    } catch (error) {
      message.error('生成失败');
      updateVideoTask(task.id, { status: 'failed' });
    }
  };

  return (
    <div className="video-creator">
      {/* 输入区 */}
      <div className="creator-input-section">
        <div className="input-header">
          <span className="label">🎥 视频描述</span>
          <Select
            value={selectedPlatform}
            onChange={setSelectedPlatform}
            size="small"
            style={{ width: 140 }}
          >
            {platforms.map(p => (
              <Option key={p.key} value={p.key}>{p.label}</Option>
            ))}
          </Select>
        </div>

        <TextArea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想要的视频画面和动作...&#10;例如：女主角从街道尽头走来，镜头缓慢推进，周围霓虹灯闪烁"
          autoSize={{ minRows: 2, maxRows: 3 }}
          className="prompt-input"
        />

        <div className="video-options">
          <div className="option-row">
            <span>风格：</span>
            <Space size="small" wrap>
              {videoStyles.map(style => (
                <Tag
                  key={style.key}
                  color={selectedStyle === style.key ? 'purple' : 'default'}
                  onClick={() => setSelectedStyle(style.key)}
                >
                  {style.label}
                </Tag>
              ))}
            </Space>
          </div>

          <div className="option-row">
            <span>时长：</span>
            <Slider
              min={1}
              max={currentPlatform?.maxDuration || 5}
              value={duration}
              onChange={setDuration}
              style={{ width: 100 }}
            />
            <span className="duration-label">{duration}秒</span>
          </div>

          <div className="option-row">
            <span>比例：</span>
            <Space>
              {['16:9', '9:16', '1:1'].map(ratio => (
                <Tag
                  key={ratio}
                  color={aspectRatio === ratio ? 'purple' : 'default'}
                  onClick={() => setAspectRatio(ratio)}
                >
                  {ratio}
                </Tag>
              ))}
            </Space>
          </div>

          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                setReferenceImage(e.target?.result as string);
              };
              reader.readAsDataURL(file);
              return false;
            }}
          >
            <Button icon={<FileOutlined />} size="small">
              {referenceImage ? '已上传首帧' : '上传首帧参考'}
            </Button>
          </Upload>
        </div>

        <Button
          type="primary"
          icon={generating ? <LoadingOutlined /> : <SendOutlined />}
          onClick={handleGenerate}
          loading={generating}
          block
          className="generate-btn"
        >
          生成视频
          <span className="generate-hint">预计 {duration * 10}-{duration * 20} 秒</span>
        </Button>
      </div>

      {/* 结果展示区 */}
      <div className="results-section">
        <div className="results-header">
          <span>🎬 视频作品 ({videoTasks.length})</span>
          {videoTasks.length > 0 && (
            <Button 
              type="text" 
              danger 
              size="small"
              onClick={() => useCreatorStore.setState({ videoTasks: [] })}
            >
              清空
            </Button>
          )}
        </div>

        <div className="video-grid">
          {videoTasks.map(task => (
            <Card
              key={task.id}
              className="video-card"
              cover={
                task.status === 'completed' && task.resultUrl ? (
                  <div className="video-player">
                    <video 
                      src={task.resultUrl} 
                      controls
                      poster={referenceImage || undefined}
                    />
                  </div>
                ) : task.status === 'generating' ? (
                  <div className="generating-placeholder">
                    <LoadingOutlined spin style={{ fontSize: 32 }} />
                    <p>生成中...⏳</p>
                    <p className="hint">视频生成需要 1-3 分钟</p>
                  </div>
                ) : (
                  <div className="error-placeholder">
                    <p>生成失败</p>
                    <Button size="small">重试</Button>
                  </div>
                )
              }
              actions={[
                <DownloadOutlined 
                  key="download"
                  onClick={() => task.resultUrl && handleDownload(task.resultUrl)}
                  style={{ visibility: task.resultUrl ? 'visible' : 'hidden' }}
                />,
                <ReloadOutlined 
                  key="retry"
                  onClick={() => handleRetry(task)}
                  style={{ visibility: task.status === 'failed' ? 'visible' : 'hidden' }}
                />,
                <DeleteOutlined 
                  key="delete" 
                  onClick={() => handleDelete(task.id)}
                />
              ]}
            >
              <Card.Meta
                title={task.prompt.slice(0, 15) + '...'}
                description={
                  <Space>
                    <Tag color={
                      task.status === 'completed' ? 'success' :
                      task.status === 'generating' ? 'processing' : 'error'
                    }>
                      {task.status === 'completed' ? '✅ 完成' :
                       task.status === 'generating' ? '🔄 生成中' : '❌ 失败'}
                    </Tag>
                    {task.duration && (
                      <Tag icon={<ClockCircleOutlined />}>
                        {task.duration}s
                      </Tag>
                    )}
                  </Space>
                }
              />
            </Card>
          ))}
        </div>

        {videoTasks.length === 0 && (
          <div className="empty-state">
            <VideoCameraOutlined className="empty-icon" />
            <p>暂无视频作品</p>
            <p className="hint">输入描述，生成你的第一个AI视频片段</p>
          </div>
        )}
      </div>
    </div>
  );
};
