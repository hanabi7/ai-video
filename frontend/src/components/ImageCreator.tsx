import { useState, useEffect } from 'react';
import { Input, Button, Tag, Card, Image, message, Upload, Space, Modal, Form, Select, Tabs, List, Empty } from 'antd';
import { 
  PictureOutlined, 
  SendOutlined,
  DownloadOutlined,
  DeleteOutlined,
  LoadingOutlined,
  UploadOutlined,
  ReloadOutlined,
  SaveOutlined,
  UserOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
  FolderOpenOutlined,
  CloseOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useCreatorStore, ImageTask, SavedImage, ImageCategory } from '../store/creatorStore';
import { v4 as uuidv4 } from 'uuid';
import { generateImage, pollTaskStatus } from '../utils/api';
import './ImageCreator.css';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

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

// 图片分类配置
const categoryConfig: Record<ImageCategory, { label: string; icon: React.ReactNode; color: string }> = {
  character: { label: '人设', icon: <UserOutlined />, color: 'blue' },
  scene: { label: '场景', icon: <EnvironmentOutlined />, color: 'green' },
  storyboard: { label: '分镜', icon: <VideoCameraOutlined />, color: 'purple' },
  other: { label: '其他', icon: <PictureOutlined />, color: 'default' },
};

export const ImageCreator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  
  // 保存图片模态框
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [savingTask, setSavingTask] = useState<ImageTask | null>(null);
  const [saveCategory, setSaveCategory] = useState<ImageCategory>('storyboard');
  const [saveTags, setSaveTags] = useState('');
  const [relatedCharacterId, setRelatedCharacterId] = useState<string | null>(null);
  const [relatedSceneId, setRelatedSceneId] = useState<string | null>(null);
  
  // 参考图片选择
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [refCategory, setRefCategory] = useState<ImageCategory>('character');
  
  const { 
    imageTasks, 
    addImageTask, 
    updateImageTask, 
    removeImageTask,
    savedImages,
    addSavedImage,
    removeSavedImage,
    characters,
    scenes,
  } = useCreatorStore();

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

  // 打开保存图片模态框
  const openSaveModal = (task: ImageTask) => {
    setSavingTask(task);
    setSaveCategory('storyboard');
    setSaveTags('');
    setRelatedCharacterId(null);
    setRelatedSceneId(null);
    setIsSaveModalOpen(true);
  };

  // 保存图片到分类
  const handleSaveImage = () => {
    if (!savingTask?.resultUrl) return;
    
    const savedImage: SavedImage = {
      id: uuidv4(),
      url: savingTask.resultUrl,
      prompt: savingTask.prompt,
      category: saveCategory,
      createdAt: Date.now(),
      tags: saveTags.split(',').map(t => t.trim()).filter(Boolean),
      relatedCharacterId: relatedCharacterId || undefined,
      relatedSceneId: relatedSceneId || undefined,
    };
    
    addSavedImage(savedImage);
    
    // 更新任务的分类
    updateImageTask(savingTask.id, { category: saveCategory });
    
    setIsSaveModalOpen(false);
    setSavingTask(null);
    message.success(`已保存到「${categoryConfig[saveCategory].label}」分类`);
  };

  // 选择参考图片
  const selectReferenceImage = (url: string) => {
    setReferenceImage(url);
    setIsRefModalOpen(false);
    message.success('已加载参考图片');
  };

  // 获取分类下的图片
  const getImagesByCategory = (category: ImageCategory) => {
    return savedImages.filter(img => img.category === category);
  };

  // 渲染图片库
  const renderImageLibrary = () => (
    <div className="image-library">
      <Tabs defaultActiveKey="character" type="card">
        {(Object.keys(categoryConfig) as ImageCategory[]).map(category => (
          <TabPane 
            tab={
              <span>
                {categoryConfig[category].icon}
                {categoryConfig[category].label}
                <Tag color={categoryConfig[category].color} style={{ marginLeft: 8 }}>
                  {getImagesByCategory(category).length}
                </Tag>
              </span>
            } 
            key={category}
          >
            {getImagesByCategory(category).length === 0 ? (
              <Empty description={`暂无${categoryConfig[category].label}图片`} />
            ) : (
              <List
                grid={{ gutter: 16, column: 3 }}
                dataSource={getImagesByCategory(category)}
                renderItem={img => (
                  <List.Item>
                    <Card
                      hoverable
                      className="saved-image-card"
                      cover={<Image src={img.url} alt={img.prompt} preview={{ src: img.url }} />}
                      actions={[
                        <Button 
                          key="use" 
                          size="small" 
                          icon={<UploadOutlined />}
                          onClick={() => selectReferenceImage(img.url)}
                        >
                          使用
                        </Button>,
                        <Button 
                          key="delete" 
                          size="small" 
                          danger 
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            removeSavedImage(img.id);
                            message.success('已删除');
                          }}
                        >
                          删除
                        </Button>,
                      ]}
                    >
                      <Card.Meta
                        title={img.prompt.slice(0, 15) + '...'}
                        description={
                          <div>
                            {img.tags?.map(tag => (
                              <Tag key={tag} size="small">{tag}</Tag>
                            ))}
                          </div>
                        }
                      />
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </TabPane>
        ))}
      </Tabs>
    </div>
  );

  return (
    <div className="image-creator">
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane tab={<span><PictureOutlined /> 生成图片</span>} key="generate">
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

              <Space>
                <Button 
                  icon={<FolderOpenOutlined />} 
                  size="small"
                  onClick={() => setIsRefModalOpen(true)}
                >
                  从图库选择
                </Button>
                
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
                    上传参考图
                  </Button>
                </Upload>
              </Space>
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
                    task.status === 'completed' && task.resultUrl && (
                      <SaveOutlined 
                        key="save"
                        onClick={() => openSaveModal(task)}
                        title="保存到图库"
                      />
                    ),
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
                  ].filter(Boolean)}
                >
                  <Card.Meta
                    title={task.prompt.slice(0, 20) + '...'}
                    description={
                      <Space>
                        <Tag color={
                          task.status === 'completed' ? 'success' :
                          task.status === 'generating' ? 'processing' : 'error'
                        }>
                          {task.status === 'completed' ? '已完成' :
                           task.status === 'generating' ? '生成中' : '失败'}
                        </Tag>
                        {task.category && (
                          <Tag color={categoryConfig[task.category].color}>
                            {categoryConfig[task.category].label}
                          </Tag>
                        )}
                      </Space>
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
        </TabPane>
        
        <TabPane tab={<span><FolderOpenOutlined /> 我的图库 ({savedImages.length})</span>} key="library">
          {renderImageLibrary()}
        </TabPane>
      </Tabs>

      {/* 保存图片模态框 */}
      <Modal
        title="保存图片到图库"
        open={isSaveModalOpen}
        onCancel={() => setIsSaveModalOpen(false)}
        onOk={handleSaveImage}
        okText="保存"
      >
        {savingTask?.resultUrl && (
          <Image src={savingTask.resultUrl} style={{ marginBottom: 16, maxHeight: 200 }} />
        )}
        
        <Form layout="vertical">
          <Form.Item label="图片分类">
            <Select value={saveCategory} onChange={setSaveCategory}>
              {(Object.keys(categoryConfig) as ImageCategory[]).map(cat => (
                <Option key={cat} value={cat}>
                  {categoryConfig[cat].icon} {categoryConfig[cat].label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="关联角色（可选）">
            <Select 
              allowClear 
              value={relatedCharacterId} 
              onChange={setRelatedCharacterId}
              placeholder="选择关联的角色"
            >
              {characters.map(char => (
                <Option key={char.id} value={char.id}>{char.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="关联场景（可选）">
            <Select 
              allowClear 
              value={relatedSceneId} 
              onChange={setRelatedSceneId}
              placeholder="选择关联的场景"
            >
              {scenes.map(scene => (
                <Option key={scene.id} value={scene.id}>
                  场景{scene.sceneNumber}: {scene.title || '未命名'}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="标签（用逗号分隔）">
            <Input 
              value={saveTags} 
              onChange={(e) => setSaveTags(e.target.value)}
              placeholder="例如：夜景,女主角,氛围"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 选择参考图片模态框 */}
      <Modal
        title="选择参考图片"
        open={isRefModalOpen}
        onCancel={() => setIsRefModalOpen(false)}
        footer={null}
        width={800}
      >
        <Tabs defaultActiveKey="character" type="card">
          {(Object.keys(categoryConfig) as ImageCategory[]).map(category => (
            <TabPane 
              tab={
                <span>
                  {categoryConfig[category].icon}
                  {categoryConfig[category].label}
                </span>
              } 
              key={category}
            >
              {getImagesByCategory(category).length === 0 ? (
                <Empty description={`暂无${categoryConfig[category].label}图片`} />
              ) : (
                <List
                  grid={{ gutter: 16, column: 4 }}
                  dataSource={getImagesByCategory(category)}
                  renderItem={img => (
                    <List.Item>
                      <Card
                        hoverable
                        onClick={() => selectReferenceImage(img.url)}
                        cover={<Image src={img.url} alt={img.prompt} preview={false} />}
                      >
                        <Card.Meta
                          title={img.prompt.slice(0, 10) + '...'}
                          description={
                            img.relatedCharacterId && (
                              <Tag size="small" color="blue">
                                {characters.find(c => c.id === img.relatedCharacterId)?.name}
                              </Tag>
                            )
                          }
                        />
                      </Card>
                    </List.Item>
                  )}
                />
              )}
            </TabPane>
          ))}
        </Tabs>
      </Modal>
    </div>
  );
};
