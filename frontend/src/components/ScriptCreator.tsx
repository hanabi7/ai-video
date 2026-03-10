import { useState, useRef, useCallback } from 'react';
import {
  Layout,
  Menu,
  Card,
  Input,
  Button,
  List,
  Tag,
  Empty,
  Modal,
  Form,
  Select,
  message,
  Tabs,
  Typography,
  Divider,
  Tooltip,
  Popconfirm,
  Space,
  Badge
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  GlobalOutlined,
  MessageOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MagicOutlined,
  SendOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  DragOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useCreatorStore, Character, OutlineNode, Scene, WorldSetting, ScriptMessage } from '../store/creatorStore';
import { v4 as uuidv4 } from 'uuid';
import './ScriptCreator.css';

const { Sider, Content } = Layout;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// 模块类型
 type ScriptModule = 'character' | 'outline' | 'script' | 'world' | 'chat';

export const ScriptCreator: React.FC = () => {
  const {
    scriptModule,
    setScriptModule,
    characters,
    selectedCharacterId,
    addCharacter,
    updateCharacter,
    removeCharacter,
    setSelectedCharacter,
    outlineNodes,
    selectedOutlineNodeId,
    addOutlineNode,
    updateOutlineNode,
    removeOutlineNode,
    reorderOutlineNodes,
    setSelectedOutlineNode,
    scenes,
    selectedSceneId,
    addScene,
    updateScene,
    removeScene,
    setSelectedScene,
    worldSettings,
    selectedWorldSettingId,
    addWorldSetting,
    updateWorldSetting,
    removeWorldSetting,
    setSelectedWorldSetting,
    scriptMessages,
    addScriptMessage,
    isScriptLoading,
    setScriptLoading,
    addImageTask,
    addVideoTask,
  } = useCreatorStore();

  // 模态框状态
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isOutlineModalOpen, setIsOutlineModalOpen] = useState(false);
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false);
  const [isWorldModalOpen, setIsWorldModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [editingOutline, setEditingOutline] = useState<OutlineNode | null>(null);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [editingWorld, setEditingWorld] = useState<WorldSetting | null>(null);
  
  // 选中文本生成提示词
  const [selectedText, setSelectedText] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [promptTarget, setPromptTarget] = useState<'image' | 'video'>('image');
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // ========== 角色/人设管理 ==========
  const handleSaveCharacter = (values: any) => {
    if (editingCharacter) {
      updateCharacter(editingCharacter.id, values);
      message.success('人设已更新');
    } else {
      addCharacter({
        id: uuidv4(),
        ...values,
      });
      message.success('人设已创建');
    }
    setIsCharacterModalOpen(false);
    setEditingCharacter(null);
  };

  // ========== 大纲管理 ==========
  const handleSaveOutline = (values: any) => {
    if (editingOutline) {
      updateOutlineNode(editingOutline.id, values);
      message.success('大纲节点已更新');
    } else {
      addOutlineNode({
        id: uuidv4(),
        ...values,
      });
      message.success('大纲节点已创建');
    }
    setIsOutlineModalOpen(false);
    setEditingOutline(null);
  };

  // ========== 场景/剧本管理 ==========
  const handleSaveScene = (values: any) => {
    if (editingScene) {
      updateScene(editingScene.id, values);
      message.success('场景已更新');
    } else {
      addScene({
        id: uuidv4(),
        ...values,
        dialogue: [],
      });
      message.success('场景已创建');
    }
    setIsSceneModalOpen(false);
    setEditingScene(null);
  };

  // ========== 世界观管理 ==========
  const handleSaveWorld = (values: any) => {
    if (editingWorld) {
      updateWorldSetting(editingWorld.id, values);
      message.success('世界观设定已更新');
    } else {
      addWorldSetting({
        id: uuidv4(),
        ...values,
      });
      message.success('世界观设定已创建');
    }
    setIsWorldModalOpen(false);
    setEditingWorld(null);
  };

  // ========== 文本生成提示词 ==========
  const handleTextSelection = () => {
    const selection = window.getSelection()?.toString();
    if (selection && selection.trim()) {
      setSelectedText(selection.trim());
    }
  };

  const generatePrompt = async () => {
    if (!selectedText) {
      message.warning('请先选中文本');
      return;
    }
    
    setScriptLoading(true);
    try {
      // 这里调用 AI API 生成提示词
      // 模拟 AI 生成
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const prompt = `基于以下描述生成${promptTarget === 'image' ? '图像' : '视频'}：\n${selectedText}\n\n风格： cinematic, high quality, detailed`;
      setGeneratedPrompt(prompt);
    } catch (error) {
      message.error('生成提示词失败');
    } finally {
      setScriptLoading(false);
    }
  };

  const sendToCreator = () => {
    if (!generatedPrompt) return;
    
    if (promptTarget === 'image') {
      addImageTask({
        id: uuidv4(),
        prompt: generatedPrompt,
        status: 'pending',
        createdAt: Date.now(),
      });
      message.success('已发送到分镜图片');
    } else {
      addVideoTask({
        id: uuidv4(),
        prompt: generatedPrompt,
        status: 'pending',
        createdAt: Date.now(),
      });
      message.success('已发送到视频生成');
    }
    setIsPromptModalOpen(false);
    setGeneratedPrompt('');
    setSelectedText('');
  };

  // ========== 渲染菜单 ==========
  const menuItems = [
    {
      key: 'character',
      icon: <UserOutlined />,
      label: (
        <span>
          人设
          {characters.length > 0 && <Badge count={characters.length} size="small" style={{ marginLeft: 8 }} />}
        </span>
      ),
    },
    {
      key: 'outline',
      icon: <BookOutlined />,
      label: (
        <span>
          大纲
          {outlineNodes.length > 0 && <Badge count={outlineNodes.length} size="small" style={{ marginLeft: 8 }} />}
        </span>
      ),
    },
    {
      key: 'script',
      icon: <FileTextOutlined />,
      label: (
        <span>
          剧本
          {scenes.length > 0 && <Badge count={scenes.length} size="small" style={{ marginLeft: 8 }} />}
        </span>
      ),
    },
    {
      key: 'world',
      icon: <GlobalOutlined />,
      label: (
        <span>
          世界观
          {worldSettings.length > 0 && <Badge count={worldSettings.length} size="small" style={{ marginLeft: 8 }} />}
        </span>
      ),
    },
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: 'AI 助手',
    },
  ];

  // ========== 渲染内容区 ==========
  const renderContent = () => {
    switch (scriptModule) {
      case 'character':
        return renderCharacterModule();
      case 'outline':
        return renderOutlineModule();
      case 'script':
        return renderScriptModule();
      case 'world':
        return renderWorldModule();
      case 'chat':
        return renderChatModule();
      default:
        return renderCharacterModule();
    }
  };

  // 人设模块
  const renderCharacterModule = () => (
    <div className="module-content">
      <div className="module-header">
        <Title level={4}>角色/人设管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingCharacter(null);
            setIsCharacterModalOpen(true);
          }}
        >
          新增角色
        </Button>
      </div>
      
      {characters.length === 0 ? (
        <Empty description="暂无角色，点击上方按钮创建" />
      ) : (
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={characters}
          renderItem={(character) => (
            <List.Item>
              <Card
                hoverable
                className={selectedCharacterId === character.id ? 'selected-card' : ''}
                onClick={() => setSelectedCharacter(character.id)}
                actions={[
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCharacter(character);
                      setIsCharacterModalOpen(true);
                    }}
                  >
                    编辑
                  </Button>,
                  <Popconfirm
                    title="确定删除这个角色吗？"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      removeCharacter(character.id);
                      message.success('角色已删除');
                    }}
                  >
                    <Button icon={<DeleteOutlined />} size="small" danger>
                      删除
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <Card.Meta
                  title={character.name}
                  description={
                    <div>
                      <Tag>{character.gender || '未知性别'}</Tag>
                      {character.age && <Tag>{character.age}岁</Tag>}
                      <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 8 }}>
                        {character.description}
                      </Paragraph>
                      {character.tags?.map(tag => (
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
    </div>
  );

  // 大纲模块
  const renderOutlineModule = () => (
    <div className="module-content">
      <div className="module-header">
        <Title level={4}>故事大纲</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingOutline(null);
            setIsOutlineModalOpen(true);
          }}
        >
          新增节点
        </Button>
      </div>
      
      {outlineNodes.length === 0 ? (
        <Empty description="暂无大纲节点，点击上方按钮创建" />
      ) : (
        <List
          dataSource={outlineNodes.sort((a, b) => a.order - b.order)}
          renderItem={(node, index) => (
            <List.Item
              className={selectedOutlineNodeId === node.id ? 'selected-list-item' : ''}
              onClick={() => setSelectedOutlineNode(node.id)}
              actions={[
                <Tag color="blue">{node.type}</Tag>,
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingOutline(node);
                    setIsOutlineModalOpen(true);
                  }}
                />,
                <Popconfirm
                  title="确定删除这个节点吗？"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    removeOutlineNode(node.id);
                  }}
                >
                  <Button icon={<DeleteOutlined />} size="small" danger />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={<span className="node-number">{index + 1}</span>}
                title={node.title}
                description={
                  <Paragraph ellipsis={{ rows: 2 }}>
                    {node.content}
                  </Paragraph>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  // 剧本模块
  const renderScriptModule = () => (
    <div className="module-content">
      <div className="module-header">
        <Title level={4}>场景/Cut 管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingScene(null);
            setIsSceneModalOpen(true);
          }}
        >
          新增场景
        </Button>
      </div>
      
      {scenes.length === 0 ? (
        <Empty description="暂无场景，点击上方按钮创建" />
      ) : (
        <List
          dataSource={scenes.sort((a, b) => a.sceneNumber - b.sceneNumber)}
          renderItem={(scene) => (
            <List.Item
              className={selectedSceneId === scene.id ? 'selected-list-item' : ''}
              onClick={() => setSelectedScene(scene.id)}
              actions={[
                <Button
                  icon={<EyeOutlined />}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    // 查看场景详情
                  }}
                >
                  查看
                </Button>,
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingScene(scene);
                    setIsSceneModalOpen(true);
                  }}
                />,
                <Popconfirm
                  title="确定删除这个场景吗？"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    removeScene(scene.id);
                  }}
                >
                  <Button icon={<DeleteOutlined />} size="small" danger />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={`场景 ${scene.sceneNumber}: ${scene.title || '未命名'}`}
                description={
                  <div>
                    <Tag>{scene.location}</Tag>
                    <Tag>{scene.time}</Tag>
                    <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 8 }}>
                      {scene.description}
                    </Paragraph>
                    {scene.characterIds && scene.characterIds.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary">涉及角色: </Text>
                        {scene.characterIds.map(charId => {
                          const char = characters.find(c => c.id === charId);
                          return char ? <Tag key={charId} size="small">{char.name}</Tag> : null;
                        })}
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  // 世界观模块
  const renderWorldModule = () => (
    <div className="module-content">
      <div className="module-header">
        <Title level={4}>世界观设定</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingWorld(null);
            setIsWorldModalOpen(true);
          }}
        >
          新增设定
        </Button>
      </div>
      
      {worldSettings.length === 0 ? (
        <Empty description="暂无世界观设定，点击上方按钮创建" />
      ) : (
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={worldSettings}
          renderItem={(setting) => (
            <List.Item>
              <Card
                hoverable
                className={selectedWorldSettingId === setting.id ? 'selected-card' : ''}
                onClick={() => setSelectedWorldSetting(setting.id)}
                actions={[
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingWorld(setting);
                      setIsWorldModalOpen(true);
                    }}
                  >
                    编辑
                  </Button>,
                  <Popconfirm
                    title="确定删除这个设定吗？"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      removeWorldSetting(setting.id);
                    }}
                  >
                    <Button icon={<DeleteOutlined />} size="small" danger>
                      删除
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <Card.Meta
                  title={setting.name}
                  description={
                    <div>
                      <Tag color="purple">{setting.category}</Tag>
                      <Paragraph ellipsis={{ rows: 3 }} style={{ marginTop: 8 }}>
                        {setting.description}
                      </Paragraph>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  // AI 助手模块（原有功能）
  const renderChatModule = () => (
    <div className="module-content chat-module">
      <div className="module-header">
        <Title level={4}>AI 剧本助手</Title>
        <Tooltip title="选中文本后可生成提示词">
          <Button
            icon={<MagicOutlined />}
            onClick={() => setIsPromptModalOpen(true)}
            disabled={!selectedText}
          >
            生成提示词
          </Button>
        </Tooltip>
      </div>
      
      <div className="chat-messages">
        {scriptMessages.length === 0 ? (
          <Empty description="开始和 AI 对话来创作剧本" />
        ) : (
          <List
            dataSource={scriptMessages}
            renderItem={(msg) => (
              <List.Item className={`message-item ${msg.role}`}>
                <div className="message-content">
                  <Text strong>{msg.role === 'user' ? '你' : 'AI'}:</Text>
                  <Paragraph
                    onMouseUp={handleTextSelection}
                    className="selectable-text"
                  >
                    {msg.content}
                  </Paragraph>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
      
      <div className="chat-input">
        <TextArea
          ref={textAreaRef}
          rows={3}
          placeholder="描述你的短剧想法，AI 会帮你完善..."
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={isScriptLoading}
          onClick={handleSendMessage}
        >
          发送
        </Button>
      </div>
      
      {selectedText && (
        <div className="selection-toolbar">
          <Text type="secondary">已选中: {selectedText.slice(0, 50)}...</Text>
          <Button
            size="small"
            icon={<MagicOutlined />}
            onClick={() => setIsPromptModalOpen(true)}
          >
            生成提示词
          </Button>
        </div>
      )}
    </div>
  );

  const handleSendMessage = () => {
    const content = textAreaRef.current?.resizableTextArea?.textArea.value;
    if (!content?.trim()) return;
    
    addScriptMessage({
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    });
    
    // 清空输入
    if (textAreaRef.current?.resizableTextArea?.textArea) {
      textAreaRef.current.resizableTextArea.textArea.value = '';
    }
    
    // 模拟 AI 回复
    setScriptLoading(true);
    setTimeout(() => {
      addScriptMessage({
        id: uuidv4(),
        role: 'assistant',
        content: '收到你的想法！让我来帮你完善这个剧本...',
        timestamp: Date.now(),
      });
      setScriptLoading(false);
    }, 1000);
  };

  return (
    <Layout className="script-creator">
      <Sider width={160} className="script-sider">
        <Menu
          mode="inline"
          selectedKeys={[scriptModule]}
          items={menuItems}
          onClick={({ key }) => setScriptModule(key as ScriptModule)}
        />
      </Sider>
      
      <Content className="script-content">
        {renderContent()}
      </Content>

      {/* 角色编辑模态框 */}
      <Modal
        title={editingCharacter ? '编辑角色' : '新增角色'}
        open={isCharacterModalOpen}
        onCancel={() => {
          setIsCharacterModalOpen(false);
          setEditingCharacter(null);
        }}
        footer={null}
      >
        <Form
          layout="vertical"
          initialValues={editingCharacter || {}}
          onFinish={handleSaveCharacter}
        >
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
            <Input placeholder="输入角色名称" />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Select placeholder="选择性别">
              <Option value="男">男</Option>
              <Option value="女">女</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item name="age" label="年龄">
            <Input type="number" placeholder="输入年龄" />
          </Form.Item>
          <Form.Item name="appearance" label="外貌">
            <TextArea rows={2} placeholder="描述角色外貌特征" />
          </Form.Item>
          <Form.Item name="personality" label="性格">
            <TextArea rows={2} placeholder="描述角色性格特点" />
          </Form.Item>
          <Form.Item name="background" label="背景故事">
            <TextArea rows={3} placeholder="描述角色背景故事" />
          </Form.Item>
          <Form.Item name="goals" label="目标/动机">
            <TextArea rows={2} placeholder="描述角色的目标和动机" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 大纲编辑模态框 */}
      <Modal
        title={editingOutline ? '编辑大纲节点' : '新增大纲节点'}
        open={isOutlineModalOpen}
        onCancel={() => {
          setIsOutlineModalOpen(false);
          setEditingOutline(null);
        }}
        footer={null}
      >
        <Form
          layout="vertical"
          initialValues={editingOutline || { type: 'custom' }}
          onFinish={handleSaveOutline}
        >
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="输入情节标题" />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select placeholder="选择情节类型">
              <Option value="setup">铺垫</Option>
              <Option value="confrontation">冲突</Option>
              <Option value="resolution">结局</Option>
              <Option value="act1">第一幕</Option>
              <Option value="act2">第二幕</Option>
              <Option value="act3">第三幕</Option>
              <Option value="custom">自定义</Option>
            </Select>
          </Form.Item>
          <Form.Item name="content" label="内容">
            <TextArea rows={4} placeholder="描述这个情节节点的内容" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 场景编辑模态框 */}
      <Modal
        title={editingScene ? '编辑场景' : '新增场景'}
        open={isSceneModalOpen}
        onCancel={() => {
          setIsSceneModalOpen(false);
          setEditingScene(null);
        }}
        footer={null}
      >
        <Form
          layout="vertical"
          initialValues={editingScene || {}}
          onFinish={handleSaveScene}
        >
          <Form.Item name="title" label="场景标题">
            <Input placeholder="输入场景标题" />
          </Form.Item>
          <Form.Item name="location" label="地点" rules={[{ required: true }]}>
            <Input placeholder="场景发生的地点" />
          </Form.Item>
          <Form.Item name="time" label="时间" rules={[{ required: true }]}>
            <Input placeholder="如：夜晚、白天、黄昏" />
          </Form.Item>
          <Form.Item name="description" label="场景描述">
            <TextArea rows={4} placeholder="描述这个场景的内容" />
          </Form.Item>
          <Form.Item name="characterIds" label="涉及角色">
            <Select mode="multiple" placeholder="选择涉及的角色">
              {characters.map(char => (
                <Option key={char.id} value={char.id}>{char.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={2} placeholder="拍摄备注或其他信息" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 世界观编辑模态框 */}
      <Modal
        title={editingWorld ? '编辑世界观设定' : '新增世界观设定'}
        open={isWorldModalOpen}
        onCancel={() => {
          setIsWorldModalOpen(false);
          setEditingWorld(null);
        }}
        footer={null}
      >
        <Form
          layout="vertical"
          initialValues={editingWorld || { category: 'custom' }}
          onFinish={handleSaveWorld}
        >
          <Form.Item name="name" label="设定名称" rules={[{ required: true }]}>
            <Input placeholder="输入设定名称" />
          </Form.Item>
          <Form.Item name="category" label="类别">
            <Select placeholder="选择设定类别">
              <Option value="era">时代</Option>
              <Option value="location">地点</Option>
              <Option value="rule">规则</Option>
              <Option value="culture">文化</Option>
              <Option value="technology">科技</Option>
              <Option value="magic">魔法/超自然</Option>
              <Option value="custom">自定义</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={4} placeholder="描述这个设定" />
          </Form.Item>
          <Form.Item name="details" label="详细设定">
            <TextArea rows={4} placeholder="详细的世界观设定内容" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 生成提示词模态框 */}
      <Modal
        title="生成提示词"
        open={isPromptModalOpen}
        onCancel={() => {
          setIsPromptModalOpen(false);
          setGeneratedPrompt('');
        }}
        footer={null}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">选中文本:</Text>
          <Paragraph style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
            {selectedText}
          </Paragraph>
        </div>
        
        <Space style={{ marginBottom: 16 }}>
          <span>生成目标:</span>
          <Select
            value={promptTarget}
            onChange={setPromptTarget}
            style={{ width: 120 }}
          >
            <Option value="image">
              <PictureOutlined /> 分镜图片
            </Option>
            <Option value="video">
              <VideoCameraOutlined /> 视频
            </Option>
          </Select>
          <Button
            type="primary"
            icon={<MagicOutlined />}
            onClick={generatePrompt}
            loading={isScriptLoading}
          >
            生成
          </Button>
        </Space>
        
        {generatedPrompt && (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">生成的提示词:</Text>
            <TextArea
              value={generatedPrompt}
              onChange={(e) => setGeneratedPrompt(e.target.value)}
              rows={4}
              style={{ marginTop: 8 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendToCreator}
              block
              style={{ marginTop: 16 }}
            >
              发送到{promptTarget === 'image' ? '分镜图片' : '视频生成'}
            </Button>
          </div>
        )}
      </Modal>
    </Layout>
  );
};
