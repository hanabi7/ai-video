import React, { useState } from 'react';
import { Card, Button, Progress, Space, Tag } from 'antd';
import { PlayCircleOutlined, DownloadOutlined, VideoCameraOutlined } from '@ant-design/icons';

interface PreviewPlayerProps {
  project: any;
}

export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({ project }) => {
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleRender = async () => {
    setRendering(true);
    // 调用渲染API
    try {
      const response = await fetch(`/api/manju/projects/${project.id}/render`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        // 轮询状态
        pollStatus(data.data.jobId);
      }
    } catch (error) {
      setRendering(false);
    }
  };

  const pollStatus = (jobId: string) => {
    // 轮询渲染状态
  };

  return (
    <div className="preview-player">
      <Card title="预览与导出">
        <div className="video-preview" style={{ 
          height: 400, 
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          borderRadius: 8,
          marginBottom: 16
        }}>
          {rendering ? (
            <Space direction="vertical" align="center">
              <VideoCameraOutlined style={{ fontSize: 48 }} />
              <p>渲染中... {progress}%</p>
              <Progress percent={progress} style={{ width: 200 }} />
            </Space>
          ) : (
            <Space direction="vertical" align="center">
              <PlayCircleOutlined style={{ fontSize: 48 }} />
              <p>点击渲染生成视频</p>
            </Space>
          )}
        </div>

        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Tag color="blue">{project?.script?.title}</Tag>
            <Tag>预计时长: {formatDuration(project?.timeline?.totalDuration || 0)}</Tag>
          </div>

          <Button 
            type="primary" 
            icon={<VideoCameraOutlined />}
            size="large"
            block
            loading={rendering}
            onClick={handleRender}
          >
            开始渲染
          </Button>

          <Button 
            icon={<DownloadOutlined />}
            size="large"
            block
            disabled={true}
          >
            下载成片
          </Button>
        </Space>
      </Card>
    </div>
  );
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}分${secs}秒`;
}
