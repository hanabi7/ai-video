import React, { useState, useEffect, useRef } from 'react';
import { Card, Tag, Spin, Empty, Badge, Tooltip, Typography, Divider } from 'antd';
import { BookOutlined, FireOutlined, EyeOutlined, UserOutlined, TagOutlined } from '@ant-design/icons';
import './NovelList.css';

const { Title, Text, Paragraph } = Typography;

interface Novel {
  rank: number;
  title: string;
  author: string;
  cover: string;
  description: string;
  readCount: string;
  tags: string[];
}

interface Category {
  category: string;
  categoryId: string;
  novels: Novel[];
}

interface NovelsData {
  updateTime: string;
  categories: Category[];
}

export const NovelLibrary: React.FC = () => {
  const [data, setData] = useState<NovelsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredNovel, setHoveredNovel] = useState<Novel | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    loadNovelsData();
  }, []);

  const loadNovelsData = async () => {
    try {
      const response = await fetch('/novels-data.json');
      const jsonData = await response.json();
      setData(jsonData);
      // 默认展开第一个分类
      if (jsonData.categories.length > 0) {
        setActiveCategory(jsonData.categories[0].categoryId);
      }
    } catch (error) {
      console.error('加载小说数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    // 切换分类展开状态
    setActiveCategory(prev => prev === categoryId ? null : categoryId);
    
    // 平滑滚动到对应位置
    setTimeout(() => {
      const element = categoryRefs.current[categoryId];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX + 20, y: e.clientY + 20 });
  };

  if (loading) {
    return (
      <div className="novel-library-loading">
        <Spin size="large" />
        <p>正在加载小说数据...⏳</p>
      </div>
    );
  }

  if (!data) {
    return <Empty description="暂无数据" />;
  }

  return (
    <div className="novel-library" onMouseMove={handleMouseMove}>
      <div className="novel-library-header">
        <Title level={4} className="library-title">
          <BookOutlined /> 番茄小说排行榜
          <Text type="secondary" className="update-time">
            更新时间: {new Date(data.updateTime).toLocaleDateString()}
          </Text>
        </Title>
      </div>

      <div className="category-nav">
        {data.categories.map((cat) => (
          <div
            key={cat.categoryId}
            className={`category-nav-item ${activeCategory === cat.categoryId ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat.categoryId)}
          >
            <span className="category-name">{cat.category}</span>
            <Badge count={cat.novels.length} className="category-count" />
            <span className={`expand-icon ${activeCategory === cat.categoryId ? 'expanded' : ''}`}>▼</span>
          </div>
        ))}
      </div>

      <div className="novels-container">
        {data.categories.map((category) => (
          <div
            key={category.categoryId}
            ref={(el) => (categoryRefs.current[category.categoryId] = el)}
            className={`category-section ${activeCategory === category.categoryId ? 'expanded' : ''}`}
          >
            <div
              className="category-header"
              onClick={() => handleCategoryClick(category.categoryId)}
            >
              <div className="category-title-wrapper">
                <Title level={5} className="category-title">
                  {category.category}
                </Title>
                <Tag color="blue">{category.novels.length} 本</Tag>
              </div>
              <span className={`expand-icon ${activeCategory === category.categoryId ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>

            <div className={`novels-grid-wrapper ${activeCategory === category.categoryId ? 'show' : ''}`}>
              <div className="novels-grid">
                {category.novels.map((novel, index) => (
                  <div
                    key={`${category.categoryId}-${index}`}
                    className="novel-card-wrapper"
                    onMouseEnter={() => setHoveredNovel(novel)}
                    onMouseLeave={() => setHoveredNovel(null)}
                  >
                    <Card
                      className="novel-card"
                      size="small"
                      hoverable
                    >
                      <div className="novel-rank">
                        <Badge
                          count={novel.rank}
                          style={{
                            backgroundColor: novel.rank <= 3 ? '#ff4d4f' : novel.rank <= 10 ? '#1890ff' : '#8c8c8c',
                          }}
                        />
                      </div>
                      
                      <div className="novel-content">
                        <div className="novel-title-wrapper">
                          <Text className="novel-title" ellipsis={{ tooltip: novel.title }}>
                            {novel.title}
                          </Text>
                        </div>
                        
                        <div className="novel-meta">
                          <Text type="secondary" className="novel-author">
                            <UserOutlined /> {novel.author}
                          </Text>
                        </div>

                        <div className="novel-stats">
                          <Tag icon={<FireOutlined />} size="small" className="read-count-tag">
                            {novel.readCount}
                          </Tag>
                        </div>

                        <div className="novel-tags">
                          {novel.tags.slice(0, 2).map((tag, i) => (
                            <Tag key={i} size="small" className="novel-tag">{tag}</Tag>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 悬浮预览卡片 */}
      {hoveredNovel && (
        <div
          className="novel-preview-popup"
          style={{
            left: mousePos.x,
            top: mousePos.y,
          }}
        >
          <Card className="preview-card" size="small">
            <div className="preview-content">
              <div className="preview-cover-wrapper">
                {hoveredNovel.cover ? (
                  <img
                    src={hoveredNovel.cover}
                    alt={hoveredNovel.title}
                    className="preview-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/120x160?text=No+Cover';
                    }}
                  />
                ) : (
                  <div className="preview-cover-placeholder">
                    <BookOutlined style={{ fontSize: 48 }} />
                  </div>
                )}
              </div>
              
              <div className="preview-info">
                <Title level={5} className="preview-title">{hoveredNovel.title}</Title>
                
                <div className="preview-meta">
                  <Text type="secondary">
                    <UserOutlined /> 作者: {hoveredNovel.author}
                  </Text>
                  <Divider type="vertical" />
                  <Tag icon={<FireOutlined />} color="red">
                    {hoveredNovel.readCount}
                  </Tag>
                </div>

                <div className="preview-tags">
                  {hoveredNovel.tags.map((tag, i) => (
                    <Tag key={i} icon={<TagOutlined />} size="small">{tag}</Tag>
                  ))}
                </div>

                <Paragraph className="preview-description" ellipsis={{ rows: 4 }}>
                  {hoveredNovel.description}
                </Paragraph>

                <div className="preview-rank">
                  <Badge
                    count={`排行榜第 ${hoveredNovel.rank} 名`}
                    style={{ backgroundColor: '#52c41a' }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NovelLibrary;
