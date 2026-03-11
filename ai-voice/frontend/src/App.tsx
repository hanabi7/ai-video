import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, Card, Button, Input, Select, Slider, 
  Space, Tabs, List, Tag, Upload, message, Spin,
  Progress, Divider, Typography, Alert
} from 'antd';
import { 
  AudioOutlined, UploadOutlined, PlayCircleOutlined,
  PauseCircleOutlined, DownloadOutlined, DeleteOutlined,
  SettingOutlined, ExperimentOutlined, SoundOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Header, Content } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Voice {
  id: string;
  name: string;
  description: string;
  engine: string;
  gender: string;
}

interface Engine {
  id: string;
  name: string;
  status: string;
  description: string;
}

function App() {
  const [text, setText] = useState('你好，这是AI配音系统的测试。');
  const [engine, setEngine] = useState('cosyvoice');
  const [voice, setVoice] = useState('default');
  const [speed, setSpeed] = useState(1.0);
  const [emotion, setEmotion] = useState('default');
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [engines, setEngines] = useState<Engine[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchEngines();
    fetchVoices();
  }, []);

  useEffect(() => {
    if (taskId && taskStatus === 'processing') {
      const interval = setInterval(checkStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [taskId, taskStatus]);

  const fetchEngines = async () => {
    try {
      const { data } = await axios.get('/api/engines');
      setEngines(data.data);
    } catch (error) {
      message.error('获取引擎列表失败');
    }
  };

  const fetchVoices = async () => {
    try {
      const { data } = await axios.get('/api/voice/list');
      setVoices(data.data);
    } catch (error) {
      message.error('获取音色列表失败');
    }
  };

  const handleSynthesize = async () => {
    if (!text.trim()) {
      message.warning('请输入要合成的文本');
      return;
    }

    setLoading(true);
    setTaskStatus('pending');
    setProgress(0);
    setAudioUrl('');

    try {
      const { data } = await axios.post('/api/tts/synthesize', {
        text,
        engine,
        voice,
        speed,
        emotion: emotion !== 'default' ? emotion : undefined
      });

      setTaskId(data.data.taskId);
      setTaskStatus('processing');
      message.success('合成任务已创建');
    } catch (error) {
      message.error('创建任务失败');
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const { data } = await axios.get(`/api/tts/status/${taskId}`);
      setTaskStatus(data.data.status);
      setProgress(data.data.progress || 0);

      if (data.data.status === 'completed') {
        const resultRes = await axios.get(`/api/tts/result/${taskId}`);
        setAudioUrl(resultRes.data.data.audioUrl);
        setHistory(prev => [resultRes.data.data, ...prev]);
        setLoading(false);
        message.success('合成完成！');
      } else if (data.data.status === 'failed') {
        setLoading(false);
        message.error('合成失败: ' + data.data.error);
      }
    } catch (error) {
      console.error('检查状态失败:', error);
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('name', file.name);
    formData.append('description', '自定义上传音色');

    try {
      await axios.post('/api/voice/upload', formData);
      message.success('音色上传成功');
      fetchVoices();
    } catch (error) {
      message.error('上传失败');
    }
    return false;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          <SoundOutlined /> AI-Voice 配音系统
        </Title>
        <Space style={{ marginLeft: 'auto' }}>
          {engines.map(e => (
            <Tag key={e.id} color={e.status === 'available' ? 'green' : 'red'}>
              {e.name}
            </Tag>
          ))}
        </Space>
      </Header>

      <Content style={{ padding: 24 }}>
        <Tabs defaultActiveKey="tts">
          <TabPane tab={<span><AudioOutlined /> 文字转语音</span>} key="tts">
            <Card title="语音合成">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <TextArea
                  rows={6}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="输入要合成的文本..."
                  maxLength={5000}
                  showCount
                />

                <Space wrap style={{ width: '100%' }}>
                  <Select
                    style={{ width: 150 }}
                    value={engine}
                    onChange={setEngine}
                    placeholder="选择引擎"
                  >
                    {engines.filter(e => e.status === 'available').map(e => (
                      <Select.Option key={e.id} value={e.id}>{e.name}</Select.Option>
                    ))}
                  </Select>

                  <Select
                    style={{ width: 150 }}
                    value={voice}
                    onChange={setVoice}
                    placeholder="选择音色"
                  >
                    {voices.map(v => (
                      <Select.Option key={v.id} value={v.id}>
                        {v.name} ({v.engine})
                      </Select.Option>
                    ))}
                  </Select>

                  <Select
                    style={{ width: 120 }}
                    value={emotion}
                    onChange={setEmotion}
                  >
                    <Select.Option value="default">默认</Select.Option>
                    <Select.Option value="happy">开心</Select.Option>
                    <Select.Option value="sad">悲伤</Select.Option>
                    <Select.Option value="angry">愤怒</Select.Option>
                    <Select.Option value="excited">兴奋</Select.Option>
                  </Select>
                </Space>

                <div>
                  <Text>语速: {speed}x</Text>
                  <Slider
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={speed}
                    onChange={setSpeed}
                  />
                </div>

                <Button
                  type="primary"
                  size="large"
                  icon={<ExperimentOutlined />}
                  onClick={handleSynthesize}
                  loading={loading}
                  disabled={!text.trim()}
                >
                  开始合成
                </Button>

                {taskStatus === 'processing' && (
                  <div>
                    <Text type="secondary">合成中... {progress}%</Text>
                    <Progress percent={progress} status="active" />
                  </div>
                )}

                {audioUrl && (
                  <Card size="small" title="合成结果" style={{ background: '#f6ffed' }}>
                    <Space>
                      <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                      <Button
                        icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                        onClick={handlePlay}
                      >
                        {isPlaying ? '暂停' : '播放'}
                      </Button>
                      <Button
                        icon={<DownloadOutlined />}
                        href={audioUrl}
                        download
                      >
                        下载
                      </Button>
                    </Space>
                  </Card>
                )}
              </Space>
            </Card>

            {history.length > 0 && (
              <Card title="历史记录" style={{ marginTop: 16 }}>
                <List
                  dataSource={history.slice(0, 5)}
                  renderItem={(item: any) => (
                    <List.Item
                      actions={[
                        <Button type="link" icon={<PlayCircleOutlined />} onClick={() => setAudioUrl(item.audioUrl)}>播放</Button>,
                        <Button type="link" icon={<DownloadOutlined />} href={item.audioUrl} download>下载</Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={item.text.substring(0, 30) + '...'}
                        description={<Space><Tag>{item.format}</Tag></Space>}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </TabPane>

          <TabPane tab={<span><UploadOutlined /> 语音克隆</span>} key="clone">
            <Card title="语音克隆">
              <Alert
                message="语音克隆功能"
                description="上传3-10秒的参考音频，AI会学习这个声音并用于合成。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Space direction="vertical" style={{ width: '100%' }}>
                <Upload
                  beforeUpload={handleUpload}
                  accept="audio/*"
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>上传参考音频</Button>
                </Upload>
                <Divider />
                <Text>已上传的音色:</Text>
                <List
                  bordered
                  dataSource={voices.filter(v => v.isCustom)}
                  renderItem={(item: any) => (
                    <List.Item
                      actions={[
                        <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
                      ]}
                    >
                      {item.name}
                    </List.Item>
                  )}
                />
              </Space>
            </Card>
          </TabPane>

          <TabPane tab={<span><SettingOutlined /> 音色库</span>} key="voices">
            <Card title="音色管理">
              <List
                grid={{ gutter: 16, column: 3 }}
                dataSource={voices}
                renderItem={(item: Voice) => (
                  <List.Item>
                    <Card
                      size="small"
                      title={item.name}
                      extra={<Tag size="small">{item.engine}</Tag>}
                    >
                      <Text type="secondary">{item.description}</Text>
                      <div style={{ marginTop: 8 }}>
                        <Tag size="small">{item.gender}</Tag>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
}

export default App;
