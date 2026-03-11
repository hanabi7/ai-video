import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Select, 
  Row, 
  Col, 
  Tag, 
  Typography, 
  Badge,
  Tooltip,
  Empty,
  Input,
  Space,
  Button,
  Modal,
  Descriptions,
  Rate,
  Tabs,
  Collapse,
  List,
  Image,
  Divider
} from 'antd';
import { 
  BookOutlined, 
  FireOutlined, 
  EyeOutlined, 
  StarOutlined,
  FileTextOutlined,
  UserOutlined,
  TagOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  TrophyOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { 
  Novel, 
  NovelGenre, 
  NOVEL_GENRES, 
  getNovelsByGenre,
  searchNovels,
  getPopularNovels,
  getTopRatedNovels
} from '../types/novel';
import { 
  allCategories,
  NovelDetail
} from '../data/novelData';
import { useCreatorStore } from '../store/creatorStore';

const { Panel } = Collapse;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

interface NovelListProps {
  onSelectNovel?: (novel: Novel) => void;
}

export const NovelList: React.FC<NovelListProps> = ({ onSelectNovel }) => {
  const [selectedGenre, setSelectedGenre] = useState<NovelGenre>('全部');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'popular' | 'top' >('all');
  const [activeTab, setActiveTab] = useState('rankings');
  const [activeCategoryKey, setActiveCategoryKey] = useState<string | string[]>('urban-martial');
  const [hoveredNovel, setHoveredNovel] = useState<NovelDetail | null>(null);
  
  const { 
    currentProject, 
    addScriptMessage, 
    setCurrentProject,
    characters,
    addCharacter,
    addScene
  } = useCreatorStore();

  // 根据筛选条件获取小说列表
  const filteredNovels = useMemo(() => {
    let novels: Novel[] = [];
    
    if (searchKeyword) {
      novels = searchNovels(searchKeyword);
    } else if (viewMode === 'popular') {
      novels = getPopularNovels();
    } else if (viewMode === 'top') {
      novels = getTopRatedNovels();
    } else {
      novels = getNovelsByGenre(selectedGenre);
    }
    
    return novels;
  }, [selectedGenre, searchKeyword, viewMode]);

  // 打开小说详情
  const handleViewDetail = (novel: Novel) => {
    setSelectedNovel(novel);
    setIsModalOpen(true);
  };

  // 使用小说创作短剧
  const handleCreateScript = (novel: Novel) => {
    addScriptMessage({
      id: Date.now().toString(),
      role: 'system',
      content: `已选择小说《${novel.title}》作为创作素材\n题材：${novel.genre}\n标签：${novel.tags.join('、')}\n\n简介：${novel.summary}`,
      timestamp: Date.now(),
      type: 'text'
    });

    if (!currentProject) {
      setCurrentProject({
        id: Date.now().toString(),
        title: novel.title,
        genre: novel.genre,
        synopsis: novel.summary,
        characters: [],
        scenes: [],
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }

    setTimeout(() => {
      addScriptMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `好的！我来帮你基于《${novel.title}》创作短剧剧本。\n\n这部${novel.genre}小说讲述了：${novel.summary}\n\n我们可以围绕以下元素展开：\n${novel.tags.map(tag => `• ${tag}`).join('\n')}\n\n你想从哪个角度切入？`,
        timestamp: Date.now(),
        type: 'text'
      });
    }, 500);

    setIsModalOpen(false);
    
    if (onSelectNovel) {
      onSelectNovel(novel);
    }
  };

  // 生成角色设定
  const handleGenerateCharacters = (novel: Novel) => {
    const mainCharacter = {
      id: Date.now().toString(),
      name: '主角（待设定）',
      description: `来自《${novel.title}》的主角`,
      personality: '根据小说设定',
      appearance: '根据小说描述',
      background: novel.summary.substring(0, 100) + '...',
      tags: novel.tags
    };
    
    addCharacter(mainCharacter);
    
    addScriptMessage({
      id: Date.now().toString(),
      role: 'system',
      content: `已基于《${novel.title}》创建初始角色设定。你可以继续完善角色信息。`,
      timestamp: Date.now(),
      type: 'character'
    });
  };

  // 渲染小说卡片
  const renderNovelCard = (novel: Novel) => (
    <Card
      key={novel.id}
      hoverable
      className="novel-card"
      cover={
        <div className="novel-cover-wrapper">
          <div className="novel-cover-placeholder">
            <BookOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          </div>
          {novel.status === 'completed' && (
            <Badge 
              count="完结" 
              style={{ backgroundColor: '#52c41a' }}
              className="novel-status-badge"
            />
          )}
          <div className="novel-rating">
            <StarOutlined /> {novel.rating}
          </div>
        </div>
      }
      actions={[
        <Tooltip title="查看详情" key="view">
          <Button 
            type="text" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(novel)}
          >
            详情
          </Button>
        </Tooltip>,
        <Tooltip title="创作短剧" key="create">
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />}
            onClick={() => handleCreateScript(novel)}
          >
            创作
          </Button>
        </Tooltip>
      ]}
    >
      <Card.Meta
        title={
          <Tooltip title={novel.title}>
            <Text ellipsis style={{ width: '100%' }} strong>
              {novel.title}
            </Text>
          </Tooltip>
        }
        description={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Space>
              <Tag color="blue" size="small">{novel.genre}</Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <UserOutlined /> {novel.author}
              </Text>
            </Space>
            <Paragraph 
              ellipsis={{ rows: 2 }} 
              style={{ fontSize: 12, marginBottom: 0, color: '#666' }}
            >
              {novel.summary}
            </Paragraph>
            <Space size="small" style={{ flexWrap: 'wrap' }}>
              {novel.tags.slice(0, 3).map(tag => (
                <Tag key={tag} size="small" style={{ fontSize: 10 }}>
                  {tag}
                </Tag>
              ))}
            </Space>
            <Space style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                <FireOutlined /> {novel.readCount}
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {novel.chapterCount}章
              </Text>
            </Space>
          </Space>
        }
      />
    </Card>
  );

  // 渲染番茄小说分类榜单
  const renderCrawledNovelCard = (novel: NovelDetail) => (
    <div
      key={novel.id}
      className="crawled-novel-card"
      onMouseEnter={() => setHoveredNovel(novel)}
      onMouseLeave={() => setHoveredNovel(null)}
      style={{
        position: 'relative',
        padding: '10px 12px',
        marginBottom: '6px',
        background: hoveredNovel?.id === novel.id ? '#e6f7ff' : '#fafafa',
        borderRadius: '6px',
        cursor: 'pointer',
        border: hoveredNovel?.id === novel.id ? '1px solid #1890ff' : '1px solid #f0f0f0',
        transition: 'all 0.2s ease'
      }}
    >
      <Space align="start" style={{ width: '100%' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: novel.rank <= 3 ? '#ff4d4f' : '#1890ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            flexShrink: 0
          }}
        >
          {novel.rank}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ fontSize: '14px' }} ellipsis>{novel.title}</Text>
          <br />
          <Space size="small">
            <Text type="secondary" style={{ fontSize: '11px' }}>
              <UserOutlined /> {novel.author}
            </Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              <StarOutlined /> {novel.rating}
            </Text>
          </Space>
        </div>
      </Space>

      {/* 鼠标悬停详情弹窗 */}
      {hoveredNovel?.id === novel.id && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '360px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            zIndex: 9999,
            overflow: 'hidden'
          }}
        >
          {/* 封面 */}
          <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
            <Image
              src={novel.cover}
              alt={novel.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              fallback="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNDAwIDIwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+Wksei0pTwvdGV4dD48L3N2Zz4="
              preview={false}
            />
            <div
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(255,77,79,0.9)',
                color: 'white',
                padding: '2px 10px',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
            >
              TOP {novel.rank}
            </div>
          </div>

          {/* 详情 */}
          <div style={{ padding: '12px' }}>
            <Title level={5} style={{ marginBottom: '6px' }} ellipsis>{novel.title}</Title>
            <Space wrap size={[4, 4]} style={{ marginBottom: '8px' }}>
              <Tag color="blue" size="small">{novel.genre}</Tag>
              {novel.tags.slice(0, 3).map(tag => (
                <Tag key={tag} size="small" style={{ fontSize: '10px' }}>{tag}</Tag>
              ))}
            </Space>

            <Paragraph
              ellipsis={{ rows: 3 }}
              style={{ fontSize: '12px', color: '#666', marginBottom: '8px', lineHeight: '1.5' }}
            >
              {novel.summary}
            </Paragraph>

            <Divider style={{ margin: '8px 0' }} />

            <Space split={<Divider type="vertical" />} size="small">
              <Text type="secondary" style={{ fontSize: '11px' }}>
                <UserOutlined /> {novel.author}
              </Text>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                <StarOutlined /> {novel.rating}分
              </Text>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                <EyeOutlined /> {novel.readCount}
              </Text>
            </Space>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="novel-list-container" style={{ height: '100%' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="small"
        style={{ height: '100%' }}
      >
        {/* 分类榜单 Tab */}
        <TabPane
          tab={
            <span>
              <TrophyOutlined />
              分类榜单
            </span>
          }
          key="rankings"
        >
          <div style={{ padding: '8px 4px', height: 'calc(100% - 40px)', overflowY: 'auto' }}>
            <Paragraph type="secondary" style={{ fontSize: '11px', marginBottom: '8px' }}>
              点击分类展开榜单，鼠标悬停查看详情
            </Paragraph>
            
            <Collapse
              activeKey={activeCategoryKey}
              onChange={setActiveCategoryKey}
              accordion
              ghost
              style={{ background: 'transparent' }}
            >
              {allCategories.map((category) => (
                <Panel
                  header={
                    <Space>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{category.name}</span>
                      <Tag color="red" size="small" style={{ fontSize: '10px' }}>Top {category.novels.length}</Tag>
                    </Space>
                  }
                  key={category.id}
                  style={{
                    marginBottom: '4px',
                    border: '1px solid #f0f0f0',
                    borderRadius: '6px',
                    background: 'white'
                  }}
                >
                  <List
                    dataSource={category.novels}
                    renderItem={(novel) => renderCrawledNovelCard(novel)}
                    style={{ maxHeight: '300px', overflowY: 'auto' }}
                  />
                </Panel>
              ))}
            </Collapse>
          </div>
        </TabPane>

        {/* 素材库 Tab */}
        <TabPane
          tab={
            <span>
              <AppstoreOutlined />
              素材库
            </span>
          }
          key="library"
        >
          <div className="novel-list-header" style={{ padding: '8px' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Title level={5} style={{ margin: 0, fontSize: '14px' }}>
                  <BookOutlined /> 小说素材库
                </Title>
                <Space>
                  <Button 
                    size="small"
                    type={viewMode === 'popular' ? 'primary' : 'default'}
                    onClick={() => setViewMode('popular')}
                    style={{ fontSize: '11px' }}
                  >
                    <FireOutlined /> 热门
                  </Button>
                  <Button 
                    size="small"
                    type={viewMode === 'top' ? 'primary' : 'default'}
                    onClick={() => setViewMode('top')}
                    style={{ fontSize: '11px' }}
                  >
                    <StarOutlined /> 高分
                  </Button>
                </Space>
              </Space>
              
              <Space style={{ width: '100%' }}>
                <Search
                  placeholder="搜索小说"
                  allowClear
                  onSearch={setSearchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  style={{ width: 140 }}
                  size="small"
                />
                <Select
                  value={selectedGenre}
                  onChange={setSelectedGenre}
                  style={{ width: 100 }}
                  size="small"
                  disabled={!!searchKeyword || viewMode !== 'all'}
                >
                  {NOVEL_GENRES.map(genre => (
                    <Option key={genre} value={genre} style={{ fontSize: '12px' }}>{genre}</Option>
                  ))}
                </Select>
                
                <Text type="secondary" style={{ fontSize: '10px', marginLeft: 'auto' }}>
                  共 {filteredNovels.length} 本
                </Text>
              </Space>
            </Space>
          </div>

          <div className="novel-list-content" style={{ padding: '8px', height: 'calc(100% - 100px)', overflowY: 'auto' }}>
            {filteredNovels.length > 0 ? (
              <Row gutter={[8, 8]}>
                {filteredNovels.map(novel => (
                  <Col xs={24} sm={12} key={novel.id}>
                    {renderNovelCard(novel)}
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty 
                description="暂无相关小说" 
                style={{ marginTop: 40 }}
                imageStyle={{ height: 60 }}
              />
            )}
          </div>
        </TabPane>
      </Tabs>

      <Modal
        title={
          <Space>
            <BookOutlined />
            <span>{selectedNovel?.title}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={500}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            关闭
          </Button>,
          <Button 
            key="character" 
            onClick={() => selectedNovel && handleGenerateCharacters(selectedNovel)}
          >
            <PlusOutlined /> 创建角色
          </Button>,
          <Button 
            key="create" 
            type="primary" 
            icon={<PlayCircleOutlined />}
            onClick={() => selectedNovel && handleCreateScript(selectedNovel)}
          >
            开始创作短剧
          </Button>
        ]}
      >
        {selectedNovel && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="作者" span={1}>
              <UserOutlined /> {selectedNovel.author}
            </Descriptions.Item>
            <Descriptions.Item label="评分" span={1}>
              <Rate 
                disabled 
                defaultValue={selectedNovel.rating / 2} 
                allowHalf 
                style={{ fontSize: 14 }}
              />
              <span style={{ marginLeft: 8 }}>{selectedNovel.rating}</span>
            </Descriptions.Item>
            <Descriptions.Item label="题材" span={1}>
              <Tag color="blue">{selectedNovel.genre}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态" span={1}>
              <Tag color={selectedNovel.status === 'completed' ? 'green' : 'orange'}>
                {selectedNovel.status === 'completed' ? '已完结' : '连载中'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="阅读量" span={1}>
              <FireOutlined /> {selectedNovel.readCount}
            </Descriptions.Item>
            <Descriptions.Item label="章节数" span={1}>
              <FileTextOutlined /> {selectedNovel.chapterCount}章
            </Descriptions.Item>
            <Descriptions.Item label="标签" span={2}>
              <Space size={[4, 4]} wrap>
                {selectedNovel.tags.map(tag => (
                  <Tag key={tag} icon={<TagOutlined />} size="small">{tag}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="简介" span={2}>
              <Paragraph style={{ fontSize: '13px' }}>{selectedNovel.summary}</Paragraph>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default NovelList;
