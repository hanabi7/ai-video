import React from 'react';
import { Card, Button, Select, List, Tag, Progress } from 'antd';
import { AudioOutlined } from '@ant-design/icons';

interface TTSPanelProps {
  project: any;
  onUpdate: (project: any) => void;
}

export const TTSPanel: React.FC<TTSPanelProps> = ({ project }) => {
  const speakers = ['林默', '艾达', '旁白', '陈昊', '唐甜', '刘铁'];

  return (
    <div className="tts-panel">
      <Card title="TTS 配置">
        <Select 
          placeholder="选择TTS引擎" 
          style={{ width: 200, marginBottom: 16 }}
          defaultValue="minimax"
        >
          <Select.Option value="minimax">MiniMax Speech-02</Select.Option>
          <Select.Option value="baidu">百度智能云</Select.Option>
          <Select.Option value="cosyvoice">CosyVoice</Select.Option>
        </Select>

        <h4>角色音色绑定</h4>
        <List
          dataSource={speakers}
          renderItem={speaker => (
            <List.Item>
              <List.Item.Meta
                title={speaker}
                description={
                  <Select 
                    size="small" 
                    placeholder="选择音色"
                    style={{ width: 150 }}
                  >
                    <Select.Option value="male">男声</Select.Option>
                    <Select.Option value="female">女声</Select.Option>
                  </Select>
                }
              />
              <Tag color="blue">待生成</Tag>
            </List.Item>
          )}
        />

        <Button 
          type="primary" 
          icon={<AudioOutlined />}
          size="large"
          block
        >
          批量生成配音
        </Button>
      </Card>

      {project?.timeline && (
        <Card title="生成进度" style={{ marginTop: 16 }}>
          <Progress percent={0} />
        </Card>
      )}
    </div>
  );
};
