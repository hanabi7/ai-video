import React from 'react';
import { Card, Timeline, Button, Badge, Tag } from 'antd';
import { ClockCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';

interface TimelineEditorProps {
  project: any;
  onUpdate: (project: any) => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({ project }) => {
  const tracks = project?.timeline?.tracks || [];

  const generateVisuals = async () => {
    // 调用API生成画面
  };

  return (
    <div className="timeline-editor">
      <Card title={`时间轴 (${tracks.length} 段音频)`}>
        <Timeline mode="left">
          {tracks.map((track: any, index: number) => (
            <Timeline.Item
              key={track.id}
              label={`${formatTime(track.startTime)} - ${formatTime(track.startTime + track.duration)}`}
              dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
            >
              <Card size="small">
                <p><strong>{track.speaker}</strong>: {track.text.substring(0, 50)}...</p>
                <p>
                  <Tag>{track.type}</Tag>
                  <Tag color="blue">{track.duration.toFixed(1)}秒</Tag>
                  <Badge count={`${track.visualCount} 张图`} style={{ backgroundColor: '#52c41a' }} />
                </p>
              </Card>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      <Button 
        type="primary" 
        icon={<PlayCircleOutlined />}
        size="large"
        block
        style={{ marginTop: 16 }}
        onClick={generateVisuals}
      >
        生成画面素材
      </Button>
    </div>
  );
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
