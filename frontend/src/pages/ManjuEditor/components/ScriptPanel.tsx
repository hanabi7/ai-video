import React, { useState } from 'react';
import { Form, Input, Button, Card, Space, message } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';

interface ScriptPanelProps {
  project: any;
  onUpdate: (project: any) => void;
}

export const ScriptPanel: React.FC<ScriptPanelProps> = ({ project, onUpdate }) => {
  const [form] = Form.useForm();
  const [scenes, setScenes] = useState<any[]>(project?.script?.scenes || []);

  const handleSave = async (values: any) => {
    try {
      // 创建项目
      const script = {
        title: values.title,
        description: values.description,
        scenes: scenes
      };

      const response = await fetch('/api/manju/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.title,
          description: values.description,
          script
        })
      });

      const data = await response.json();
      
      if (data.success) {
        onUpdate(data.data);
        message.success('项目创建成功');
      }
    } catch (error) {
      message.error('创建失败');
    }
  };

  const addScene = () => {
    setScenes([...scenes, {
      id: `scene_${Date.now()}`,
      name: `场景${scenes.length + 1}`,
      lines: []
    }]);
  };

  return (
    <div className="script-panel">
      <Form form={form} onFinish={handleSave} layout="vertical">
        <Form.Item 
          name="title" 
          label="剧名" 
          rules={[{ required: true, message: '请输入剧名' }]}
        >
          <Input placeholder="输入漫剧名称" />
        </Form.Item>

        <Form.Item name="description" label="简介">
          <Input.TextArea 
            placeholder="输入简介" 
            rows={2}
          />
        </Form.Item>

        <div className="scenes-section">
          <h4>场景列表</h4>
          
          {scenes.map((scene, index) => (
            <Card 
              key={scene.id} 
              size="small" 
              title={scene.name}
              className="scene-card"
            >
              <Form.Item label="场景名称">
                <Input 
                  value={scene.name}
                  onChange={e => {
                    const newScenes = [...scenes];
                    newScenes[index].name = e.target.value;
                    setScenes(newScenes);
                  }}
                />
              </Form.Item>

              <Form.Item label="台词">
                <Input.TextArea 
                  rows={3}
                  placeholder="输入台词，每行一句"
                  onChange={e => {
                    const lines = e.target.value.split('\n').map((text, i) => ({
                      id: `line_${i}`,
                      type: 'dialogue',
                      speaker: '角色',
                      text
                    }));
                    const newScenes = [...scenes];
                    newScenes[index].lines = lines;
                    setScenes(newScenes);
                  }}
                />
              </Form.Item>
            </Card>
          ))}

          <Button 
            type="dashed" 
            onClick={addScene} 
            block 
            icon={<PlusOutlined />}
          >
            添加场景
          </Button>
        </div>

        <Form.Item style={{ marginTop: 24 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<SaveOutlined />}
            size="large"
          >
            保存并生成时间轴
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
