import React, { useState } from 'react';
import { Layout, Steps, Button, Card, message } from 'antd';
import { BookOutlined, AudioOutlined, PictureOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { ScriptPanel } from './components/ScriptPanel';
import { TTSPanel } from './components/TTSPanel';
import { TimelineEditor } from './components/TimelineEditor';
import { PreviewPlayer } from './components/PreviewPlayer';
import './index.css';

const { Content, Header } = Layout;
const { Step } = Steps;

export const ManjuEditor: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      title: '编辑剧本',
      icon: <BookOutlined />,
      component: <ScriptPanel project={project} onUpdate={setProject} />
    },
    {
      title: '生成配音',
      icon: <AudioOutlined />,
      component: <TTSPanel project={project} onUpdate={setProject} />
    },
    {
      title: '时间轴',
      icon: <PictureOutlined />,
      component: <TimelineEditor project={project} onUpdate={setProject} />
    },
    {
      title: '预览导出',
      icon: <PlayCircleOutlined />,
      component: <PreviewPlayer project={project} />
    }
  ];

  const handleNext = async () => {
    if (currentStep === 0 && !project) {
      message.warning('请先创建项目');
      return;
    }
    setCurrentStep(c => Math.min(c + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep(c => Math.max(c - 1, 0));
  };

  return (
    <Layout className="manju-editor">
      <Header className="manju-header">
        <h2>🎬 配音优先创作台</h2>
        <span className="subtitle">基于配音时间轴自动生成画面</span>
      </Header>
      
      <Content className="manju-content">
        <Card className="steps-card">
          <Steps current={currentStep} className="manju-steps">
            {steps.map(step => (
              <Step 
                key={step.title} 
                title={step.title} 
                icon={step.icon}
              />
            ))}
          </Steps>
        </Card>

        <Card className="panel-card">
          {steps[currentStep].component}
        </Card>

        <div className="action-bar">
          <Button 
            onClick={handlePrev} 
            disabled={currentStep === 0}
            size="large"
          >
            上一步
          </Button>
          
          <Button 
            type="primary"
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            loading={loading}
            size="large"
          >
            {currentStep === steps.length - 2 ? '开始渲染' : '下一步'}
          </Button>
        </div>
      </Content>
    </Layout>
  );
};

export default ManjuEditor;
