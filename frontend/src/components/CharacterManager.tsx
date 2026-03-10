import { useState } from 'react';
import { Card, Form, Input, Button, List, Tag, Empty, Modal, Select, Space, Avatar, Tooltip, message } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined,
  SaveOutlined,
  CloseOutlined,
  TagsOutlined
} from '@ant-design/icons';
import { useCreatorStore, Character } from '../store/creatorStore';
import { v4 as uuidv4 } from 'uuid';
import './CharacterManager.css';

const { TextArea } = Input;
const { Option } = Select;

const characterTemplates = [
  { name: '主角模板', personality: '善良、勇敢、有责任感', appearance: '阳光、健康、眼神坚定', background: '普通家庭出身，经历挫折后成长' },
  { name: '反派模板', personality: '狡猾、自私、野心勃勃', appearance: '阴沉、锐利、气场强大', background: '经历过背叛，对世界充满不信任' },
  { name: '喜剧角色', personality: '幽默、乐观、大大咧咧', appearance: '亲和力强、表情丰富', background: '用笑容掩盖内心的脆弱' },
  { name: '智者角色', personality: '睿智、沉稳、洞察力强', appearance: '成熟稳重、气质儒雅', background: '历经沧桑，看透世事' },
];

export const CharacterManager: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [form] = Form.useForm();
  
  const { 
    characters, 
    addCharacter, 
    updateCharacter, 
    removeCharacter,
    setSelectedCharacter,
    selectedCharacterId
  } = useCreatorStore();

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId);

  const handleAdd = () => {
    setEditingCharacter(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    form.setFieldsValue(character);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这个角色吗？',
      onOk: () => {
        removeCharacter(id);
        message.success('已删除');
      }
    });
  };

  const handleSave = (values: any) => {
    const characterData: Character = {
      id: editingCharacter?.id || uuidv4(),
      ...values,
      tags: values.tags?.split(',').map((t: string) => t.trim()).filter(Boolean) || [],
    };

    if (editingCharacter) {
      updateCharacter(editingCharacter.id, characterData);
      message.success('角色已更新');
    } else {
      addCharacter(characterData);
      message.success('角色已创建');
    }
    
    setIsModalOpen(false);
    setEditingCharacter(null);
    form.resetFields();
  };

  const handleApplyTemplate = (template: typeof characterTemplates[0]) => {
    form.setFieldsValue({
      personality: template.personality,
      appearance: template.appearance,
      background: template.background,
    });
  };

  return (
    <div className="character-manager">
      <div className="manager-header">
        <div className="header-title">
          <h3>👥 角色管理</h3>
          <span className="header-count">共 {characters.length} 个角色</span>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAdd}
        >
          新建角色
        </Button>
      </div>

      <div className="character-content">
        <div className="character-list-section">
          {characters.length === 0 ? (
            <Empty 
              description="暂无角色，点击上方按钮创建" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={handleAdd}>创建第一个角色</Button>
            </Empty>
          ) : (
            <List
              className="character-list"
              dataSource={characters}
              renderItem={item => (
                <List.Item
                  key={item.id}
                  className={`character-item ${selectedCharacterId === item.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCharacter(item.id)}
                  actions={[
                    <Button 
                      key="edit" 
                      type="text" 
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                    />,
                    <Button 
                      key="delete" 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size={48} 
                        style={{ 
                          backgroundColor: selectedCharacterId === item.id ? '#1890ff' : '#d9d9d9',
                          fontSize: 20
                        }}
                      >
                        {item.name.charAt(0)}
                      </Avatar>
                    }
                    title={<div className="character-name">{item.name}</div>}
                    description={
                      <Space size={[4, 4]} wrap>
                        {item.tags?.slice(0, 3).map(tag => (
                          <Tag key={tag} size="small">{tag}</Tag>
                        ))}
                        {item.tags && item.tags.length > 3 && (
                          <Tag size="small">+{item.tags.length - 3}</Tag>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>

        <div className="character-preview-section">
          {selectedCharacter ? (
            <Card className="character-detail-card">
              <div className="character-detail-header">
                <Avatar size={64} style={{ backgroundColor: '#1890ff', fontSize: 28 }}>
                  {selectedCharacter.name.charAt(0)}
                </Avatar>
                <div className="character-detail-title">
                  <h2>{selectedCharacter.name}</h2>
                  {selectedCharacter.age && (
                    <span className="character-age">{selectedCharacter.age}岁</span>
                  )}
                </div>              
              </div>

              {selectedCharacter.tags && selectedCharacter.tags.length > 0 && (
                <div className="character-tags">
                  {selectedCharacter.tags.map(tag => (
                    <Tag key={tag} color="blue">{tag}</Tag>
                  ))}
                </div>
              )}

              <div className="character-fields">
                <div className="character-field">
                  <label>🎭 性格特点</label>
                  <p>{selectedCharacter.personality || '未填写'}</p>
                </div>

                <div className="character-field">
                  <label>👤 外貌描述</label>
                  <p>{selectedCharacter.appearance || '未填写'}</p>
                </div>

                {selectedCharacter.background && (
                  <div className="character-field">
                    <label>📖 人物背景</label>
                    <p>{selectedCharacter.background}</p>
                  </div>
                )}

                {selectedCharacter.goals && (
                  <div className="character-field">
                    <label>🎯 人物目标</label>
                    <p>{selectedCharacter.goals}</p>
                  </div>
                )}
              </div>

              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => handleEdit(selectedCharacter)}
                block
              >
                编辑角色
              </Button>
            </Card>
          ) : (
            <Empty description="选择一个角色查看详情" />
          )}
        </div>
      </div>

      <Modal
        title={editingCharacter ? '编辑角色' : '新建角色'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ tags: '' }}
        >
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="如：林晓" />
          </Form.Item>

          <div className="form-row">
            <Form.Item
              name="age"
              label="年龄"
              style={{ flex: 1 }}
            >
              <Input type="number" placeholder="28" />
            </Form.Item>

            <Form.Item
              name="gender"
              label="性别"
              style={{ flex: 1 }}
            >
              <Select placeholder="选择性别">
                <Option value="男">男</Option>
                <Option value="女">女</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="personality"
            label="性格特点"
          >
            <TextArea 
              rows={2} 
              placeholder="如：理性、要强、完美主义，但内心渴望被理解"
            />
          </Form.Item>

          <Form.Item
            name="appearance"
            label="外貌描述"
          >
            <TextArea 
              rows={2} 
              placeholder="如：短发，总是穿着职业装，眼神锐利"
            />
          </Form.Item>

          <Form.Item
            name="background"
            label="人物背景"
          >
            <TextArea 
              rows={3} 
              placeholder="如：从小城市考入名校，靠自己的努力在大城市站稳脚跟..."
            />
          </Form.Item>

          <Form.Item
            name="goals"
            label="人物目标/动机"
          >
            <TextArea 
              rows={2} 
              placeholder="如：证明自己的价值，但逐渐意识到生活中还有比成功更重要的东西"
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签"
          >
            <Input 
              placeholder="用逗号分隔，如：女主，职场精英，外冷内热"
            />
          </Form.Item>

          <div className="template-section">
            <label>快速模板</label>
            <Space wrap>
              {characterTemplates.map(template => (
                <Tag 
                  key={template.name}
                  className="template-tag"
                  onClick={() => handleApplyTemplate(template)}
                >
                  {template.name}
                </Tag>
              ))}
            </Space>
          </div>

          <Form.Item className="form-actions">
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                保存
              </Button>
              <Button onClick={() => setIsModalOpen(false)} icon={<CloseOutlined />}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
