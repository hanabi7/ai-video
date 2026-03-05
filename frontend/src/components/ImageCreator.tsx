import { useState } from 'react';
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
  
  const { imageTasks, isImageLoading, addImageTask, updateImageTask } = useCreatorStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      message.warning('请输入图片描述');
      return;
    }

    const task: ImageTask = {
      id: uuidv4(),
      prompt: prompt,
      status: 'generating',
      createdAt: Date.now()
    };

    addImageTask(task);
    setPrompt('');

    // 模拟生成过程
    try {
      // 这里应该调用后端API
      // const result = await generateImage({
      //   prompt: buildFullPrompt(),
      //   ratio: selectedRatio,
      //   reference: referenceImage
      // });

      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 模拟结果
      updateImageTask(task.id, {
        status: 'completed',
        resultUrl: `https://picsum.photos/seed/${task.id}/800/450`
      });

      message.success('图片生成成功');

    } catch (error) {
      updateImageTask(task.id, { status: 'failed' });
      message.error('生成失败');
    }
  };

  const handleDelete = (id: string) => {
    const newTasks = imageTasks.filter(t => t.id !== id);
    useCreatorStore.setState({ imageTasks: newTasks });
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
              // 处理参考图上传
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
          icon={isImageLoading ? <LoadingOutlined /> : <SendOutlined />}
          onClick={handleGenerate}
          loading={isImageLoading}
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
                  onClick={() => message.success('开始下载')}
                />,
                <ReloadOutlined 
                  key="retry"
                  onClick={() => message.success('重新生成')}
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
