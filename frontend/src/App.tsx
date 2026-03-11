import { useState } from 'react';
import { Layout, Button, Space, message, Tag } from 'antd';
import { 
  FileTextOutlined, 
  PictureOutlined, 
  VideoCameraOutlined,
  ScissorOutlined,
  PlusOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { ScriptCreator } from './components/ScriptCreator';
import { ImageCreator } from './components/ImageCreator';
import { VideoCreator } from './components/VideoCreator';
import { VideoEditor } from './components/VideoEditor';
import { ProjectManager } from './components/ProjectManager';
import { NovelLibrary } from './components/NovelLibrary';
import { useCreatorStore } from './store/creatorStore';
import './App.css';

const { Header, Content } = Layout;

function App() {
  const [showProjectManager, setShowProjectManager] = useState(false);
  const { 
    currentProject, 
    scriptMessages, 
    imageTasks, 
    videoTasks,
    clips 
  } = useCreatorStore();

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
          {/* 上部工作区 */}
          <div className="workspace-top">
            {/* 左：剧本创作区 (50%) */}
            <div className="workspace-panel panel-script">
              <div className="panel-header">
                <FileTextOutlined />
                <span>剧本创作</span>
                {scriptMessages.length > 0 && (
                  <Tag className="message-count">{scriptMessages.length}</Tag>
                )}
              </div>
              <div className="panel-content panel-script-content">
                {/* 小说列表区域 - 可折叠 */}
                <div className="novel-list-section">
                  <NovelLibrary />
                </div>
                {/* 剧本创作区域 */}
                <div className="script-creator-section">
                  <ScriptCreator />
                </div>
              </div>
            </div>

            {/* 中：图片创作 (25%) */}
            <div className="workspace-panel panel-image">
              <div className="panel-header">
                <PictureOutlined />
                <span>分镜图片</span>
                {imageTasks.length > 0 && (
                  <Tag className="task-count">{imageTasks.length}</Tag>
                )}
              </div>
              <div className="panel-content">
                <ImageCreator />
              </div>
            </div>

            {/* 右：视频生成 (25%) */}
            <div className="workspace-panel panel-video">
              <div className="panel-header">
                <VideoCameraOutlined />
                <span>视频生成</span>
                {videoTasks.length > 0 && (
                  <Tag className="task-count">{videoTasks.length}</Tag>
                )}
              </div>
              <div className="panel-content">
                <VideoCreator />
              </div>
            </div>
          </div>

          {/* 下部：视频剪辑区 (30%) */}
          <div className="workspace-bottom">
            <div className="panel-header editor-header">
              <ScissorOutlined />
              <span>视频剪辑与配乐</span>
              {clips.length > 0 && (
                <Tag className="clip-count">{clips.length} 片段</Tag>
              )}
            </div>
            <div className="panel-content editor-content">
              <VideoEditor />
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
