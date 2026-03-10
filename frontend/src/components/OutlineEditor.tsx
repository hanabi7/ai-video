import { useState } from 'react';
import { Card, Form, Input, Button, List, Empty, Modal, Select, Space, Tag, Timeline, message } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  BookOutlined,
  SaveOutlined,
  CloseOutlined,
  DragOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useCreatorStore, OutlineNode } from '../store/creatorStore';
import { v4 as uuidv4 } from 'uuid';
import './OutlineEditor.css';

const { TextArea } = Input;
const { Option } = Select;

const nodeTypes = [
  { key: 'act1', label: '第一幕', color: 'blue', description: '开端、设定、触发事件' },
  { key: 'act2', label: '第二幕', color: 'green', description: '发展、冲突、转折' },
  { key: 'act3', label: '第三幕', color: 'red', description: '高潮、结局、收尾' },
  { key: 'setup', label: '起', color: 'cyan', description: '背景介绍、人物出场' },
  { key: 'confrontation', label: '承', color: 'purple', description: '冲突升级、情节推进' },
  { key: 'resolution', label: '转', color: 'orange', description: '转折、危机' },
  { key: 'ending', label: '合', color: 'magenta', description: '解决、结局' },
  { key: 'custom', label: '自定义', color: 'default', description: '自定义节点' },
];

const outlineTemplates = {
  threeAct: [
    { title: '第一幕：设定', type: 'act1', content: '介绍主角、世界观、日常状态' },
    { title: '触发事件', type: 'setup', content: '打破平衡的事件发生' },
    { title: '第二幕：对抗', type: 'act2', content: '主角面对挑战，遭遇阻碍' },
    { title: '中点转折', type: 'confrontation', content: '故事方向发生重大转变' },
    { title: '第三幕：高潮', type: 'act3', content: '最终对决，解决核心冲突' },
    { title: '结局', type: 'ending', content: '新的平衡，人物成长' },
  ],
  heroJourney: [
    { title: '平凡世界', type: 'setup', content: '主角的日常生活' },
    { title: '冒险召唤', type: 'act1', content: '挑战或机遇出现' },
    { title: '拒绝召唤', type: 'confrontation', content: '主角犹豫、恐惧' },
    { title: '遇见导师', type: 'act1', content: '获得指引或工具' },
    { title: '跨越门槛', type: 'act2', content: '进入未知世界' },
    { title: '考验与盟友', type: 'confrontation', content: '挑战与伙伴' },
    { title: '深入洞穴', type: 'act2', content: '面对最大恐惧' },
    { title: '磨难', type: 'act3', content: '生死考验' },
    { title: '奖赏', type: 'resolution', content: '获得目标' },
    { title: '归途', type: 'ending', content: '带着改变回归' },
  ],
};

export const OutlineEditor: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<OutlineNode | null>(null);
  const [form] = Form.useForm();
  
  const { 
    outlineNodes, 
    addOutlineNode, 
    updateOutlineNode, 
    removeOutlineNode,
    reorderOutlineNodes,
    setSelectedOutlineNode,
    selectedOutlineNodeId,
    scenes
  } = useCreatorStore();

  const sortedNodes = [...outlineNodes].sort((a, b) => a.order - b.order);
  const selectedNode = outlineNodes.find(n => n.id === selectedOutlineNodeId);

  const handleAdd = () => {
    setEditingNode(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (node: OutlineNode) => {
    setEditingNode(node);
    form.setFieldsValue({
      ...node,
      sceneIds: node.sceneIds || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个情节节点吗？',
      onOk: () => {
        removeOutlineNode(id);
        message.success('已删除');
      }
    });
  };

  const handleSave = (values: any) => {
    const nodeData = {
      ...values,
      sceneIds: values.sceneIds || [],
    };

    if (editingNode) {
      updateOutlineNode(editingNode.id, nodeData);
      message.success('节点已更新');
    } else {
      addOutlineNode({
        id: uuidv4(),
        ...nodeData,
        order: sortedNodes.length,
      });
      message.success('节点已创建');
    }
    
    setIsModalOpen(false);
    setEditingNode(null);
    form.resetFields();
  };

  const handleApplyTemplate = (templateKey: keyof typeof outlineTemplates) => {
    const template = outlineTemplates[templateKey];
    
    Modal.confirm({
      title: '应用模板',
      content: `将添加 ${template.length} 个情节节点，确定吗？`,
      onOk: () => {
        template.forEach((item, index) => {
          addOutlineNode({
            id: uuidv4(),
            title: item.title,
            content: item.content,
            type: item.type as OutlineNode['type'],
            order: sortedNodes.length + index,
          });
        });
        message.success('模板已应用');
      }
    });
  };

  const getNodeTypeInfo = (type: string) => {
    return nodeTypes.find(t => t.key === type) || nodeTypes.find(t => t.key === 'custom')!;
  };

  const moveNode = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sortedNodes.length - 1) return;
    
    const newOrder = [...sortedNodes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    
    reorderOutlineNodes(newOrder.map(n => n.id));
  };

  return (
    <div className="outline-editor">
      <div className="manager-header">
        <div className="header-title">
          <h3>📖 故事大纲</h3>
          <span className="header-count">共 {outlineNodes.length} 个节点</span>
        </div>
        <Space>
          <Select 
            placeholder="应用模板" 
            style={{ width: 140 }}
            onChange={(value) => handleApplyTemplate(value as keyof typeof outlineTemplates)}
            value={undefined}
          >
            <Option value="threeAct">三幕式结构</Option>
            <Option value="heroJourney">英雄之旅</Option>
          </Select>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            添加节点
          </Button>
        </Space>
      </div>

      <div className="outline-content">
        <div className="outline-timeline-section">
          {sortedNodes.length === 0 ? (
            <Empty 
              description="暂无大纲节点，点击上方按钮添加或使用模板" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Space direction="vertical">
                <Button type="primary" onClick={handleAdd}>添加第一个节点</Button>
                <Select 
                  placeholder="或选择模板快速开始" 
                  style={{ width: 200 }}
                  onChange={(value) => handleApplyTemplate(value as keyof typeof outlineTemplates)}
                >
                  <Option value="threeAct">三幕式结构</Option>
                  <Option value="heroJourney">英雄之旅</Option>
                </Select>
              </Space>
            </Empty>
          ) : (
            <Timeline mode="left" className="outline-timeline">
              {sortedNodes.map((node, index) => {
                const typeInfo = getNodeTypeInfo(node.type);
                return (
                  <Timeline.Item
                    key={node.id}
                    color={typeInfo.color}
                    dot={<BookOutlined />}
                    label={
                      <div className="timeline-label">
                        <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                      </div>
                    }
                  >
                    <Card
                      size="small"
                      className={`outline-node-card ${selectedOutlineNodeId === node.id ? 'selected' : ''}`}
                      onClick={() => setSelectedOutlineNode(node.id)}
                      title={
                        <div className="node-card-title">
                          <span>{index + 1}. {node.title}</span>
                          <Space size="small">
                            <Button 
                              type="text" 
                              size="small"
                              disabled={index === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveNode(index, 'up');
                              }}
                            >
                              ↑
                            </Button>
                            <Button 
                              type="text" 
                              size="small"
                              disabled={index === sortedNodes.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveNode(index, 'down');
                              }}
                            >
                              ↓
                            </Button>
                            <Button 
                              type="text" 
                              size="small"
                              icon={<EditOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(node);
                              }}
                            />
                            <Button 
                              type="text" 
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(node.id);
                              }}
                            />
                          </Space>
                        </div>
                      }
                    >
                      <p className="node-content">{node.content}</p>
                      
                      {node.sceneIds && node.sceneIds.length > 0 && (
                        <div className="node-scenes">
                          <FileTextOutlined />
                          <span>关联场景：{node.sceneIds.length}个</span>
                        </div>
                      )}
                    </Card>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          )}
        </div>
      </div>

      <Modal
        title={editingNode ? '编辑节点' : '添加节点'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ type: 'custom', sceneIds: [] }}
        >
          <Form.Item
            name="title"
            label="节点标题"
            rules={[{ required: true, message: '请输入节点标题' }]}
          >
            <Input placeholder="如：第一幕·相遇" />
          </Form.Item>

          <Form.Item
            name="type"
            label="节点类型"
            rules={[{ required: true }]}
          >
            <Select placeholder="选择类型">
              {nodeTypes.map(type => (
                <Option key={type.key} value={type.key}>
                  <Space>
                    <Tag color={type.color}>{type.label}</Tag>
                    <span className="type-desc">{type.description}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="内容描述"
          >
            <TextArea 
              rows={4} 
              placeholder="描述该情节节点的主要内容..."
            />
          </Form.Item>

          <Form.Item
            name="sceneIds"
            label="关联场景"
          >
            <Select 
              mode="multiple" 
              placeholder="选择关联的场景"
              allowClear
            >
              {scenes.map(scene => (
                <Option key={scene.id} value={scene.id}>
                  场景{scene.sceneNumber}：{scene.title || scene.location}
                </Option>
              ))}
            </Select>
          </Form.Item>

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
