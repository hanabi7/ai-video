import { useState } from 'react';
import { Input, Button, Space, Card, Tag, Progress, Slider, message, Select, Upload } from 'antd';
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
  { key: 'luma', label: 'Luma Dream Machine', maxDuration: 5 },
  { key: 'keling', label: '快手可灵', maxDuration: 10 },
  { key: 'runway', label: 'Runway Gen-3', maxDuration: 10 },
  { key: 'pika', label: 'Pika Labs', maxDuration: 3 },
];

export const VideoCreator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [selectedPlatform, setSelectedPlatform] = useState('luma');
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  
  const { videoTasks, isVideoLoading, addVideoTask, updateVideoTask } = useCreatorStore();

  const currentPlatform = platforms.find(p => p.key === selectedPlatform);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      message.warning('请输入视频描述');
      return;
    }

    const task: VideoTask = {
      id: uuidv4(),
      prompt: prompt,
      status: 'generating',
      duration: duration,
      createdAt: Date.now()
    };

    addVideoTask(task);
    setPrompt('');

    // 模拟生成过程
    try {
      // 视频生成时间较长
      await new Promise(resolve => setTimeout(resolve, 8000));

      // 模拟结果
      updateVideoTask(task.id, {
        status: 'completed',
        resultUrl: `https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4`
      });

      message.success('视频生成成功');

    } catch (error) {
      updateVideoTask(task.id, { status: 'failed' });
      message.error('生成失败');
    }
  };

  const handleDelete = (id: string) => {
    const newTasks = videoTasks.filter(t => t.id !== id);
    useCreatorStore.setState({ videoTasks: newTasks });
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
            style={{ width: 150 }}
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
              style={{ width: 150 }}
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
          icon={isVideoLoading ? <LoadingOutlined /> : <SendOutlined />}
          onClick={handleGenerate}
          loading={isVideoLoading}
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
                    <Progress percent={50} size="small" />
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
                <DownloadOutlined key="download" />,
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
