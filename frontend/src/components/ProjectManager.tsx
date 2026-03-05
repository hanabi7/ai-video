import { useState } from 'react';
import { Modal, List, Button, Input, Form, Tag, message, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCreatorStore, ScriptProject } from '../store/creatorStore';
import { v4 as uuidv4 } from 'uuid';

interface ProjectManagerProps {
  visible: boolean;
  onClose: () => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  visible,
  onClose
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const { currentProject, setCurrentProject } = useCreatorStore();
  const [form] = Form.useForm();

  // 模拟项目列表
  const [projects, setProjects] = useState<ScriptProject[]>([
    {
      id: '1',
      title: '都市奇缘',
      genre: '都市爱情',
      synopsis: '职场女强人与街头艺人的爱情故事',
      characters: [],
      scenes: [],
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ]);

  const handleCreate = (values: any) => {
    const newProject: ScriptProject = {
      id: uuidv4(),
      title: values.title,
      genre: values.genre,
      synopsis: values.synopsis || '',
      characters: [],
      scenes: [],
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setProjects([newProject, ...projects]);
    setCurrentProject(newProject);
    setIsCreating(false);
    form.resetFields();
    onClose();
    message.success('项目创建成功');
  };

  const handleSelect = (project: ScriptProject) => {
    setCurrentProject(project);
    onClose();
    message.success(`已切换到项目：${project.title}`);
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    if (currentProject?.id === id) {
      setCurrentProject(null);
    }
  };

  return (
    <Modal
      title="项目管理"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div className="project-manager">
        <div className="manager-header">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreating(true)}
          >
            新建项目
          </Button>
        </div>

        {isCreating ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreate}
            className="create-form"
          >
            <Form.Item
              name="title"
              label="项目名称"
              rules={[{ required: true, message: '请输入项目名称' }]}
            >
              <Input placeholder="例如：都市奇缘" />
            </Form.Item>

            <Form.Item
              name="genre"
              label="类型"
              rules={[{ required: true }]}
            >
              <Input placeholder="例如：都市爱情、悬疑推理" />
            </Form.Item>

            <Form.Item name="synopsis" label="简介">
              <Input.TextArea 
                rows={3}
                placeholder="简单描述一下你的故事..."
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  创建
                </Button>
                <Button onClick={() => setIsCreating(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        ) : (
          <List
            dataSource={projects}
            renderItem={project => (
              <List.Item
                actions={[
                  <Button 
                    type="text" 
                    icon={<EditOutlined />}
                  />,
                  <Button 
                    type="text" 
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(project.id)}
                  />
                ]}
              >
                <List.Item.Meta
                  title={
                    <a onClick={() => handleSelect(project)}>
                      {project.title}
                      {currentProject?.id === project.id && (
                        <Tag color="blue" style={{ marginLeft: 8 }}>当前</Tag>
                      )}
                    </a>
                  }
                  description={
                    <>
                      <Tag>{project.genre}</Tag>
                      <span>{project.synopsis}</span>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </Modal>
  );
};
