import React, { useState } from 'react';
import { Card, Collapse, List, Tag, Typography, Space, Image, Divider } from 'antd';
import { BookOutlined, EyeOutlined, StarOutlined, UserOutlined } from '@ant-design/icons';
import { allCategories, NovelDetail } from '../data/novelData';

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;

// 小说卡片组件 - 悬停显示详情
const NovelCard: React.FC<{ novel: NovelDetail }> = ({ novel }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="novel-card-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        padding: '12px',
        marginBottom: '8px',
        background: '#fafafa',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: isHovered ? '2px solid #1890ff' : '1px solid #d9d9d9'
      }}
    >
      {/* 基础信息 - 始终显示 */}
      <Space align="start" style={{ width: '100%' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: novel.rank <= 3 ? '#ff4d4f' : '#1890ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          {novel.rank}
        </div>
        <div style={{ flex: 1 }}>
          <Text strong style={{ fontSize: '16px' }}>{novel.title}</Text>
          <br />
          <Space size="small">
            <Text type="secondary"><UserOutlined /> {novel.author}</Text>
            <Tag color="blue" size="small">{novel.genre}</Tag>
            <Text type="secondary"><StarOutlined /> {novel.rating}</Text>
            <Text type="secondary"><EyeOutlined /> {novel.readCount}</Text>
          </Space>
        </div>
      </Space>

      {/* 悬停详情 - 鼠标放置时滑出显示 */}
      {isHovered && (
        <div
          className="novel-detail-popup"
          style={{
            position: 'absolute',
            left: '100%',
            top: '0',
            width: '400px',
            marginLeft: '12px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'slideIn 0.3s ease'
          }}
        >
          {/* 封面图 */}
          <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
            <Image
              src={novel.cover}
              alt={novel.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              fallback="https://via.placeholder.com/400x200?text=No+Cover"
            />
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(255,77,79,0.9)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontWeight: 'bold'
              }}
            >
              TOP {novel.rank}
            </div>
          </div>

          {/* 详情内容 */}
          <div style={{ padding: '16px' }}>
            <Title level={4} style={{ marginBottom: '8px' }}>{novel.title}</Title>
            <Space wrap style={{ marginBottom: '12px' }}>
              <Tag color="blue">{novel.genre}</Tag>
              {novel.tags.map(tag => (
                <Tag key={tag} color="default">{tag}</Tag>
              ))}
            </Space>

            <Divider style={{ margin: '12px 0' }} />

            <Paragraph
              ellipsis={{ rows: 4, expandable: true }}
              style={{ color: '#666', marginBottom: '12px' }}
            >
              {novel.summary}
            </Paragraph>

            <Space split={<Divider type="vertical" />}>
              <Text type="secondary"><UserOutlined /> {novel.author}</Text>
              <Text type="secondary"><StarOutlined /> {novel.rating}分</Text>
              <Text type="secondary"><EyeOutlined /> {novel.readCount}</Text>
            </Space>
          </div>
        </div>
      )}
    </div>
  );
};

// 小说分类展示组件
const NovelCategoryShowcase: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string | string[]>('urban-martial');

  return (
    <Card
      title={
        <Space>
          <BookOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>番茄小说热门榜单</Title>
        </Space>
      }
      style={{ maxWidth: '800px', margin: '0 auto' }}
    >
      <Paragraph type="secondary" style={{ marginBottom: '20px' }}>
        点击分类查看该类别Top20热门小说，鼠标悬停查看详情
      </Paragraph>

      <Collapse
        activeKey={activeKey}
        onChange={setActiveKey}
        accordion
        style={{ background: 'transparent' }}
      >
        {allCategories.map((category) => (
          <Panel
            header={
              <Space>
                <span style={{ fontSize: '16px', fontWeight: 500 }}>{category.name}</span>
                <Tag color="red" size="small">Top 20</Tag>
              </Space>
            }
            key={category.id}
            style={{
              marginBottom: '12px',
              border: '1px solid #f0f0f0',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <List
              dataSource={category.novels}
              renderItem={(novel) => (
                <List.Item style={{ padding: 0, border: 'none' }}>
                  <NovelCard novel={novel} />
                </List.Item>
              )}
            />
          </Panel>
        ))}
      </Collapse>
    </Card>
  );
};

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .novel-card-wrapper:hover {
    background: #e6f7ff !important;
  }

  .ant-collapse-content-box {
    padding: 12px !important;
  }
`;
document.head.appendChild(style);

export default NovelCategoryShowcase;
