import { useState } from 'react';
import { Layout, Button, Space, message, Tag } from 'antd';
import { 
  FileTextOutlined, 
  PictureOutlined, 
  VideoCameraOutlined,
  PlusOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { ScriptCreator } from './components/ScriptCreator';
import { ImageCreator } from './components/ImageCreator';
import { VideoCreator } from './components/VideoCreator';
import { ProjectManager } from './components/ProjectManager';
import { useCreatorStore } from './store/creatorStore';
import './App.css';

const { Header, Content } = Layout;

function App() {
  const [showProjectManager, setShowProjectManager] = useState(false);
  const { currentProject, scriptMessages, imageTasks, videoTasks } = useCreatorStore();

  const handleSaveProject = () => {
    // 保存项目逻辑
    message.success('项目已保存');
  };

  return (
    <Layout className="creator-layout">
      <Header className="creator-header">
        <div className="header-left">
          <h1>🎬 AI 短剧创作工作台</h1>
          {currentProject && (
            <span className="project-name">{currentProject.title}</span>
          )}
        </div>
        <Space>
          <Button 
            icon={<PlusOutlined />} 
            onClick={() => setShowProjectManager(true)}
          >
            新建项目
          </Button>
          <Button 
            icon={<SaveOutlined />} 
            type="primary"
            onClick={handleSaveProject}
          >
            保存
          </Button>
        </Space>
      </Header>

      <Content className="creator-content">
        <div className="workspace">
          {/* 左侧：剧本创作区 (50%) */}
          <div className="workspace-left">
            <div className="panel-header">
              <FileTextOutlined />
              <span>剧本创作</span>
              {scriptMessages.length > 0 && (
                <Tag className="message-count">{scriptMessages.length}</Tag>
              )}
            </div>
            <div className="panel-content">
              <ScriptCreator />
            </div>
          </div>

          {/* 右侧：图片+视频创作区 (50%) */}
          <div className="workspace-right">
            {/* 右上：图片创作 (50% of right) */}
            <div className="workspace-right-top">
              <div className="panel-header">
                <PictureOutlined />
                <span>图片创作</span>
                {imageTasks.length > 0 && (
                  <Tag className="task-count">{imageTasks.length}</Tag>
                )}
              </div>
              <div className="panel-content">
                <ImageCreator />
              </div>
            </div>

            {/* 右下：视频创作 (50% of right) */}
            <div className="workspace-right-bottom">
              <div className="panel-header">
                <VideoCameraOutlined />
                <span>视频创作</span>
                {videoTasks.length > 0 && (
                  <Tag className="task-count">{videoTasks.length}</Tag>
                )}
              </div>
              <div className="panel-content">
                <VideoCreator />
              </div>
            </div>
          </div>
        </div>
      </Content>

      <ProjectManager 
        visible={showProjectManager}
        onClose={() => setShowProjectManager(false)}
      />
    </Layout>
  );
}

export default App;
