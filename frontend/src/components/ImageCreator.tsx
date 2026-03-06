import { useState, useEffect } from 'react';
import { Input, Button, Tag, Card, Image, message, Upload, Space } from 'antd';
import { 
  PictureOutlined, 
  SendOutlined,
  DownloadOutlined,
  DeleteOutlined,
  LoadingOutlined,
  UploadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useCreatorStore, ImageTask } from '../store/creatorStore';
import { v4 as uuidv4 } from 'uuid';
import { generateImage, pollTaskStatus } from '../utils/api';
import './ImageCreator.css';

const { TextArea } = Input;

// 图片风格预设
const stylePresets = [
  { key: 'cinematic', label: '🎬 电影感', prompt: 'cinematic lighting, film still, professional photography' },
  { key: 'anime', label: '🎨 动漫风', prompt: 'anime style, studio ghibli, vibrant colors' },
  { key: 'realistic', label: '📷 写实', prompt: 'photorealistic, 8k, highly detailed' },
  { key: 'cyberpunk', label: '🌃 赛博朋克', prompt: 'cyberpunk, neon lights, futuristic, dystopian' },
  { key: 'vintage', label: '📽️ 复古', prompt: 'vintage film, 90s aesthetic, grainy texture' },
];

// 画面比例
const ratioOptions = [
  { key: '16:9', label: '16:9 宽屏', size: '1024x576' },
  { key: '9:16', label: '9:16 竖屏', size: '576x1024' },
  { key: '1:1', label: '1:1 方形', size: '1024x1024' },
  { key: '4:3', label: '4:3 标准', size: '1024x768' },
];

export const ImageCreator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  
  const { imageTasks, addImageTask, updateImageTask, removeImageTask } = useCreatorStore();

  // 轮询正在生成的任务状态
  useEffect(() => {
    const generatingTasks = imageTasks.filter(t => t.status === 'generating');
    
    generatingTasks.forEach(task => {
      pollTaskStatus(task.id, 'image', (status) => {
        updateImageTask(task.id, {
          status: status.status,
          resultUrl: status.result_url,
        });
        
        if (status.status === 'completed') {
          message.success('图片生成完成！');
        } else if (status.status === 'failed') {
          message.error('图片生成失败');
        }
      }).catch(err => {
        console.error('Poll error:', err);
        updateImageTask(task.id, { status: 'failed' });
      });
    });
  }, [imageTasks]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      message.warning('请输入图片描述');
      return;
    }

    setGenerating(true);

    try {
      // 构建完整提示词
      const stylePrompt = stylePresets.find(s => s.key === selectedStyle)?.prompt || '';
      const fullPrompt = `${prompt}, ${stylePrompt}`;

      // 调用后端API
      const result = await generateImage({
        prompt: fullPrompt,
        ratio: selectedRatio as any,
        style: selectedStyle as any,
        reference_image: referenceImage || undefined,
      });

      // 添加到任务列表
      const task: ImageTask = {
        id: result.id,
        prompt: prompt,
        status: 'generating',
        createdAt: Date.now()
      };

      addImageTask(task);
      setPrompt('');
      message.success('图片生成任务已创建');

    } catch (error) {
      message.error(error instanceof Error ? error.message : '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    removeImageTask(id);
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `image_${Date.now()}.png`;
    link.target = '_blank';
    link.click();
    message.success('开始下载');
  };

  const handleRetry = async (task: ImageTask) => {
    updateImageTask(task.id, { status: 'generating' });
    
    try {
      const status = await pollTaskStatus(task.id, 'image', (s) => {
        updateImageTask(task.id, {
          status: s.status,
          resultUrl: s.result_url,
        });
      });
      
      if (status.status === 'completed') {
        message.success('图片生成完成！');
      }
    } catch (error) {
      message.error('生成失败');
      updateImageTask(task.id, { status: 'failed' });
    }
  };

  return (
    <div className="image-creator">
      {/* 输入区 */}
      <div className="creator-input-section">
        <div className="input-header">
          <span className="label">📝 图片描述</span>
          <Space size="small">
            {stylePresets.map(style => (
              <Tag
                key={style.key}
                color={selectedStyle === style.key ? 'blue' : 'default'}
                onClick={() => setSelectedStyle(style.key)}
                className="style-tag"
              >
                {style.label}
              </Tag>
            ))}
          </Space>
        </div>

        <TextArea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想要的画面...&#10;例如：都市夜景，女主角站在天桥上，霓虹灯倒映在雨水中"
          autoSize={{ minRows: 2, maxRows: 3 }}
          className="prompt-input"
        />

        <div className="input-options">
          <Space>
            <span>画面比例：</span>
            {ratioOptions.map(ratio => (
              <Tag
                key={ratio.key}
                color={selectedRatio === ratio.key ? 'blue' : 'default'}
                onClick={() => setSelectedRatio(ratio.key)}
              >
                {ratio.label}
              </Tag>
            ))}
          </Space>

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
            <Button icon={<UploadOutlined />} size="small">
              {referenceImage ? '已上传参考图' : '上传参考图'}
            </Button>
          </Upload>
        </div>

        {referenceImage && (
          <div className="reference-preview">
            <Image src={referenceImage} width={80} />
            <Button 
              type="text" 
              danger 
              size="small"
              onClick={() => setReferenceImage(null)}
            >
              移除
            </Button>
          </div>
        )}

        <Button
          type="primary"
          icon={generating ? <LoadingOutlined /> : <SendOutlined />}
          onClick={handleGenerate}
          loading={generating}
          block
          className="generate-btn"
        >
          生成图片
        </Button>
      </div>

      {/* 结果展示区 */}
      <div className="results-section">
        <div className="results-header">
          <span>🖼️ 生成历史 ({imageTasks.length})</span>
          {imageTasks.length > 0 && (
            <Button 
              type="text" 
              danger 
              size="small"
              onClick={() => useCreatorStore.setState({ imageTasks: [] })}
            >
              清空历史
            </Button>
          )}
        </div>

        <div className="results-grid">
          {imageTasks.map(task => (
            <Card
              key={task.id}
              className="image-card"
              cover={
                task.status === 'completed' && task.resultUrl ? (
                  <Image 
                    src={task.resultUrl} 
                    alt={task.prompt}
                    preview={{ src: task.resultUrl }}
                  />
                ) : task.status === 'generating' ? (
                  <div className="generating-placeholder">
                    <LoadingOutlined spin />
                    <p>生成中...⏳</p>
                  </div>
                ) : (
                  <div className="error-placeholder">
                    <p>生成失败</p>
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
                title={task.prompt.slice(0, 20) + '...'}
                description={
                  <Tag color={
                    task.status === 'completed' ? 'success' :
                    task.status === 'generating' ? 'processing' : 'error'
                  }>
                    {task.status === 'completed' ? '已完成' :
                     task.status === 'generating' ? '生成中' : '失败'}
                  </Tag>
                }
              />
            </Card>
          ))}
        </div>

        {imageTasks.length === 0 && (
          <div className="empty-state">
            <PictureOutlined className="empty-icon" />
            <p>暂无生成记录</p>
            <p className="hint">输入描述，生成你的第一张概念图</p>
          </div>
        )}
      </div>
    </div>
  );
};
